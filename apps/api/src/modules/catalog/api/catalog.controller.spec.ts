import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { RequestContextMiddleware } from "../../common/api";
import { InMemoryIdempotencyStore } from "../../common/application";
import { InMemoryAuditLog } from "../../governance/application";
import {
  DemoIds,
  DemoLocalCredentials,
  DemoTenantDirectory,
  createDemoIdentityRecords,
} from "../../local-demo";
import { TenantContextGuard } from "../../platform/application";
import { AuthController, AuthHttpService, InMemoryLocalSessionStore } from "../../iam/api";
import {
  LocalAuthenticationService,
  RbacPolicy,
  ScryptPasswordHasher,
  type LocalAuthIdentityRecord,
  type LocalAuthIdentityRepository,
} from "../../iam/application";
import {
  CatalogHttpService,
  InMemoryCategoryStore,
  InMemoryProductStore,
} from "./catalog-http.service";
import { CatalogController } from "./catalog.controller";

describe("CatalogController categories", () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApplication();
  });

  afterEach(async () => {
    await app.close();
  });

  it("requires authentication and unit authorization to list categories", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/catalog/categories")
      .set("X-Unit-Id", DemoIds.unit)
      .expect(401);

    const waiterToken = await login("waiter.demo@mrcoti.local");

    await request(app.getHttpServer())
      .get("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", "99999999-9999-4999-8999-999999999999")
      .expect(403);

    await request(app.getHttpServer())
      .get("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(200, []);
  });

  it("creates categories with manager permission and returns a contract-shaped response", async () => {
    const managerToken = await login("manager.demo@mrcoti.local");

    const response = await request(app.getHttpServer())
      .post("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "category-create-001")
      .set("X-Request-Id", "req-category-001")
      .set("X-Correlation-Id", "corr-category-001")
      .send({
        name: "Bebidas",
      })
      .expect(201);

    expect(response.headers["x-request-id"]).toBe("req-category-001");
    expect(response.headers["x-correlation-id"]).toBe("corr-category-001");
    expect(response.body).toEqual({
      id: expect.any(String),
      name: "Bebidas",
      status: "ACTIVE",
    });

    const list = await request(app.getHttpServer())
      .get("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(200);

    expect(list.body).toEqual([response.body]);
  });

  it("denies category creation for waiter role", async () => {
    const waiterToken = await login("waiter.demo@mrcoti.local");

    const response = await request(app.getHttpServer())
      .post("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "category-create-denied")
      .send({
        name: "Bebidas",
      })
      .expect(403);

    expect(response.body.code).toBe("AUTH_FORBIDDEN");
  });

  it("replays same idempotency key with same payload and rejects divergent payload", async () => {
    const managerToken = await login("manager.demo@mrcoti.local");
    const first = await request(app.getHttpServer())
      .post("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "category-create-replay")
      .send({
        name: "Pratos",
      })
      .expect(201);

    const replay = await request(app.getHttpServer())
      .post("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "category-create-replay")
      .send({
        name: "Pratos",
      })
      .expect(201);

    expect(replay.body).toEqual(first.body);

    const conflict = await request(app.getHttpServer())
      .post("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "category-create-replay")
      .send({
        name: "Sobremesas",
      })
      .expect(409);

    expect(conflict.body.code).toBe("IDEMPOTENCY_PAYLOAD_CONFLICT");
  });

  it("creates and lists products scoped to an active category", async () => {
    const managerToken = await login("manager.demo@mrcoti.local");
    const category = await createCategory(managerToken, "Bebidas", "category-create-for-product");

    const product = await request(app.getHttpServer())
      .post("/api/v1/catalog/products")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "product-create-001")
      .send({
        categoryId: category.id,
        name: "Café",
        priceCents: 750,
      })
      .expect(201);

    expect(product.body).toEqual({
      categoryId: category.id,
      id: expect.any(String),
      name: "Café",
      priceCents: 750,
      status: "AVAILABLE",
    });

    const list = await request(app.getHttpServer())
      .get("/api/v1/catalog/products?status=AVAILABLE")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(200);

    expect(list.body).toEqual([product.body]);
  });

  it("denies product creation without catalog management permission", async () => {
    const managerToken = await login("manager.demo@mrcoti.local");
    const waiterToken = await login("waiter.demo@mrcoti.local");
    const category = await createCategory(
      managerToken,
      "Bebidas",
      "category-create-product-denied",
    );

    const response = await request(app.getHttpServer())
      .post("/api/v1/catalog/products")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "product-create-denied")
      .send({
        categoryId: category.id,
        name: "Café",
        priceCents: 750,
      })
      .expect(403);

    expect(response.body.code).toBe("AUTH_FORBIDDEN");
  });

  it("replays product idempotency and rejects divergent product payload", async () => {
    const managerToken = await login("manager.demo@mrcoti.local");
    const category = await createCategory(
      managerToken,
      "Bebidas",
      "category-create-product-replay",
    );
    const payload = {
      categoryId: category.id,
      name: "Suco",
      priceCents: 1200,
    };

    const first = await request(app.getHttpServer())
      .post("/api/v1/catalog/products")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "product-create-replay")
      .send(payload)
      .expect(201);

    const replay = await request(app.getHttpServer())
      .post("/api/v1/catalog/products")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "product-create-replay")
      .send(payload)
      .expect(201);

    expect(replay.body).toEqual(first.body);

    const conflict = await request(app.getHttpServer())
      .post("/api/v1/catalog/products")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "product-create-replay")
      .send({
        ...payload,
        priceCents: 1300,
      })
      .expect(409);

    expect(conflict.body.code).toBe("IDEMPOTENCY_PAYLOAD_CONFLICT");
  });

  async function login(email: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email,
        password: DemoLocalCredentials.password,
      })
      .expect(200);

    return response.body.accessToken as string;
  }

  async function createCategory(token: string, name: string, idempotencyKey: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/catalog/categories")
      .set("Authorization", `Bearer ${token}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", idempotencyKey)
      .send({
        name,
      })
      .expect(201);

    return response.body as { readonly id: string; readonly name: string; readonly status: string };
  }
});

async function createTestApplication(): Promise<INestApplication> {
  const passwordHasher = new ScryptPasswordHasher({
    cost: 1_024,
    keyLength: 32,
    maxmem: 8 * 1024 * 1024,
    saltLength: 8,
  });
  const identityRepository = new InMemoryLocalAuthIdentityRepository(
    await createDemoIdentityRecords(passwordHasher),
  );
  const authHttpService = new AuthHttpService(
    new LocalAuthenticationService(identityRepository, passwordHasher),
    new TenantContextGuard(),
    new RbacPolicy(),
    new DemoTenantDirectory(),
    new InMemoryLocalSessionStore(900),
  );
  const catalogHttpService = new CatalogHttpService(
    new InMemoryCategoryStore(),
    new InMemoryProductStore(),
    new InMemoryAuditLog(),
    new InMemoryIdempotencyStore(),
  );
  const moduleRef = await Test.createTestingModule({
    controllers: [AuthController, CatalogController],
    providers: [
      {
        provide: AuthHttpService,
        useValue: authHttpService,
      },
      {
        provide: CatalogHttpService,
        useValue: catalogHttpService,
      },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  const requestContext = new RequestContextMiddleware();
  app.use(requestContext.use.bind(requestContext));
  app.setGlobalPrefix("api/v1");
  await app.init();

  return app;
}

class InMemoryLocalAuthIdentityRepository implements LocalAuthIdentityRepository {
  private readonly users: ReadonlyMap<string, LocalAuthIdentityRecord>;

  constructor(users: readonly LocalAuthIdentityRecord[]) {
    this.users = new Map(users.map((user) => [user.syntheticEmail, user]));
  }

  async findBySyntheticEmail(syntheticEmail: string): Promise<LocalAuthIdentityRecord | null> {
    return this.users.get(syntheticEmail) ?? null;
  }
}
