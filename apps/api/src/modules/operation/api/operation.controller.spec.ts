import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { InMemoryCategoryStore, InMemoryProductStore } from "../../catalog/api";
import { CatalogController, CatalogHttpService } from "../../catalog/api";
import { RequestContextMiddleware } from "../../common/api";
import { InMemoryIdempotencyStore, InMemoryOutboxStore } from "../../common/application";
import { InMemoryAuditLog } from "../../governance/application";
import { AuthController, AuthHttpService, InMemoryLocalSessionStore } from "../../iam/api";
import {
  LocalAuthenticationService,
  RbacPolicy,
  ScryptPasswordHasher,
  type LocalAuthIdentityRecord,
  type LocalAuthIdentityRepository,
} from "../../iam/application";
import {
  DemoIds,
  DemoLocalCredentials,
  DemoTenantDirectory,
  createDemoIdentityRecords,
} from "../../local-demo";
import { TenantContextGuard } from "../../platform/application";
import {
  AddOrderItemService,
  InMemoryOrderItemStore,
  InMemoryRestaurantTableStore,
  InMemoryTabStore,
  OpenTabService,
} from "../application";
import type { OrderItem, RestaurantTable, Tab } from "../domain";
import { OperationController } from "./operation.controller";
import { OperationHttpService } from "./operation-http.service";

describe("OperationController", () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApplication();
  });

  afterEach(async () => {
    await app.close();
  });

  it("requires authentication and manager permission to create tables", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/tables")
      .set("X-Unit-Id", DemoIds.unit)
      .expect(401);

    const managerToken = await login(app, "manager.demo@mrcoti.local");
    const waiterToken = await login(app, "waiter.demo@mrcoti.local");

    const deniedCreate = await request(app.getHttpServer())
      .post("/api/v1/tables")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "table-create-waiter-denied")
      .send({
        code: "M01",
      })
      .expect(403);

    expect(deniedCreate.body.code).toBe("AUTH_FORBIDDEN");

    const created = await request(app.getHttpServer())
      .post("/api/v1/tables")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "table-create-001")
      .set("X-Request-Id", "req-table-001")
      .set("X-Correlation-Id", "corr-table-001")
      .send({
        code: "M01",
      })
      .expect(201);

    expect(created.headers["x-request-id"]).toBe("req-table-001");
    expect(created.headers["x-correlation-id"]).toBe("corr-table-001");
    expect(created.body).toEqual({
      code: "M01",
      id: expect.any(String),
      status: "AVAILABLE",
    });

    const replay = await request(app.getHttpServer())
      .post("/api/v1/tables")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "table-create-001")
      .send({
        code: "M01",
      })
      .expect(201);

    expect(replay.body).toEqual(created.body);

    const list = await request(app.getHttpServer())
      .get("/api/v1/tables")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(200);

    expect(list.body).toEqual([created.body]);
  });

  it("opens a tab and manages items through contract-shaped operation routes", async () => {
    const managerToken = await login(app, "manager.demo@mrcoti.local");
    const waiterToken = await login(app, "waiter.demo@mrcoti.local");
    const table = await createTable(app, managerToken, "M02", "table-create-flow");
    const product = await createProduct(app, managerToken);

    const opened = await request(app.getHttpServer())
      .post("/api/v1/tabs")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "tab-open-flow")
      .send({
        tableId: table.id,
      })
      .expect(201);

    expect(opened.body).toEqual({
      id: expect.any(String),
      items: [],
      status: "OPEN",
      tableId: table.id,
    });

    const added = await request(app.getHttpServer())
      .post(`/api/v1/tabs/${opened.body.id}/items`)
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "tab-item-add-flow")
      .send({
        productId: product.id,
        quantity: 2,
      })
      .expect(201);

    expect(added.body).toEqual({
      id: expect.any(String),
      productId: product.id,
      productNameSnapshot: "Café",
      quantity: 2,
      status: "ACTIVE",
      unitPriceCents: 750,
    });

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/tabs/${opened.body.id}/items/${added.body.id}`)
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "tab-item-update-flow")
      .send({
        quantity: 3,
      })
      .expect(200);

    expect(updated.body).toEqual({
      ...added.body,
      quantity: 3,
    });

    const cancelled = await request(app.getHttpServer())
      .post(`/api/v1/tabs/${opened.body.id}/items/${added.body.id}/cancel`)
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "tab-item-cancel-flow")
      .send({
        reason: "Cliente desistiu",
      })
      .expect(200);

    expect(cancelled.body).toEqual({
      ...updated.body,
      status: "CANCELLED",
    });

    const tab = await request(app.getHttpServer())
      .get(`/api/v1/tabs/${opened.body.id}`)
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(200);

    expect(tab.body).toEqual({
      ...opened.body,
      items: [cancelled.body],
    });
  });

  it("returns safe errors for unauthorized units, unknown tabs and idempotency conflicts", async () => {
    const managerToken = await login(app, "manager.demo@mrcoti.local");
    const waiterToken = await login(app, "waiter.demo@mrcoti.local");
    const auditorToken = await login(app, "auditor.demo@mrcoti.local");
    const table = await createTable(app, managerToken, "M03", "table-create-errors");
    const product = await createProduct(app, managerToken, "product-create-errors");
    const tab = await openTab(app, waiterToken, table.id, "tab-open-errors");

    const otherUnit = await request(app.getHttpServer())
      .get("/api/v1/tables")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", "99999999-9999-4999-8999-999999999999")
      .expect(403);

    expect(otherUnit.body.code).toBe("AUTH_FORBIDDEN");

    const missingTab = await request(app.getHttpServer())
      .get("/api/v1/tabs/99999999-9999-4999-8999-999999999999")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(404);

    expect(missingTab.body.code).toBe("NOT_FOUND");

    const auditorCreate = await request(app.getHttpServer())
      .post(`/api/v1/tabs/${tab.id}/items`)
      .set("Authorization", `Bearer ${auditorToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "auditor-item-create-denied")
      .send({
        productId: product.id,
        quantity: 1,
      })
      .expect(403);

    expect(auditorCreate.body.code).toBe("AUTH_FORBIDDEN");

    await request(app.getHttpServer())
      .post(`/api/v1/tabs/${tab.id}/items`)
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "tab-item-conflict")
      .send({
        productId: product.id,
        quantity: 1,
      })
      .expect(201);

    const conflict = await request(app.getHttpServer())
      .post(`/api/v1/tabs/${tab.id}/items`)
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "tab-item-conflict")
      .send({
        productId: product.id,
        quantity: 2,
      })
      .expect(409);

    expect(conflict.body.code).toBe("IDEMPOTENCY_PAYLOAD_CONFLICT");
  });

  it("does not expose cross-tenant tables, tabs or items through direct identifiers", async () => {
    await app.close();
    app = await createTestApplication({
      seedOperation: ({ itemStore, tableStore, tabStore }) => {
        tableStore.save(otherTenantTableFixture());
        tabStore.save(otherTenantTabFixture());
        itemStore.save(otherTenantItemFixture());
      },
    });

    const waiterToken = await login(app, "waiter.demo@mrcoti.local");

    const tables = await request(app.getHttpServer())
      .get("/api/v1/tables")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(200);

    expect(tables.body).toEqual([]);

    const hiddenTab = await request(app.getHttpServer())
      .get("/api/v1/tabs/88888888-8888-4888-8888-888888888888")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .expect(404);

    expect(hiddenTab.body.code).toBe("NOT_FOUND");

    const hiddenAdd = await request(app.getHttpServer())
      .post("/api/v1/tabs/88888888-8888-4888-8888-888888888888/items")
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "cross-tenant-add-item")
      .send({
        productId: "77777777-7777-4777-8777-777777777777",
        quantity: 1,
      })
      .expect(404);

    expect(hiddenAdd.body.code).toBe("NOT_FOUND");

    const hiddenUpdate = await request(app.getHttpServer())
      .patch(
        "/api/v1/tabs/88888888-8888-4888-8888-888888888888/items/99999999-9999-4999-8999-999999999999",
      )
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "cross-tenant-update-item")
      .send({
        quantity: 2,
      })
      .expect(404);

    expect(hiddenUpdate.body.code).toBe("NOT_FOUND");

    const hiddenCancel = await request(app.getHttpServer())
      .post(
        "/api/v1/tabs/88888888-8888-4888-8888-888888888888/items/99999999-9999-4999-8999-999999999999/cancel",
      )
      .set("Authorization", `Bearer ${waiterToken}`)
      .set("X-Unit-Id", DemoIds.unit)
      .set("Idempotency-Key", "cross-tenant-cancel-item")
      .send({
        reason: "Item de outro tenant não visível",
      })
      .expect(404);

    expect(hiddenCancel.body.code).toBe("NOT_FOUND");
  });
});

interface OperationStoreHandles {
  readonly itemStore: InMemoryOrderItemStore;
  readonly tableStore: InMemoryRestaurantTableStore;
  readonly tabStore: InMemoryTabStore;
}

interface CreateTestApplicationOptions {
  readonly seedOperation?: (stores: OperationStoreHandles) => void;
}

async function createTestApplication(
  options: CreateTestApplicationOptions = {},
): Promise<INestApplication> {
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
  const idempotency = new InMemoryIdempotencyStore();
  const categoryStore = new InMemoryCategoryStore();
  const productStore = new InMemoryProductStore();
  const tableStore = new InMemoryRestaurantTableStore();
  const tabStore = new InMemoryTabStore();
  const itemStore = new InMemoryOrderItemStore();
  const outbox = new InMemoryOutboxStore();
  options.seedOperation?.({
    itemStore,
    tableStore,
    tabStore,
  });
  const catalogHttpService = new CatalogHttpService(
    categoryStore,
    productStore,
    new InMemoryAuditLog(),
    idempotency,
  );
  const openTabService = new OpenTabService(tableStore, tabStore, idempotency, outbox);
  const itemService = new AddOrderItemService(
    tabStore,
    productStore,
    itemStore,
    idempotency,
    outbox,
  );
  const operationHttpService = new OperationHttpService(
    tableStore,
    tabStore,
    itemStore,
    openTabService,
    itemService,
    idempotency,
  );
  const moduleRef = await Test.createTestingModule({
    controllers: [AuthController, CatalogController, OperationController],
    providers: [
      {
        provide: AuthHttpService,
        useValue: authHttpService,
      },
      {
        provide: CatalogHttpService,
        useValue: catalogHttpService,
      },
      {
        provide: OperationHttpService,
        useValue: operationHttpService,
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

function otherTenantTableFixture(): RestaurantTable {
  const now = new Date("2026-08-14T12:00:00.000Z");

  return {
    code: "X01",
    createdAt: now,
    id: "66666666-6666-4666-8666-666666666666",
    status: "OCCUPIED",
    tenantId: "tenant_other",
    unitId: DemoIds.unit,
    updatedAt: now,
  };
}

function otherTenantTabFixture(): Tab {
  const now = new Date("2026-08-14T12:00:00.000Z");

  return {
    closedAt: null,
    createdAt: now,
    id: "88888888-8888-4888-8888-888888888888",
    openedBy: "55555555-5555-4555-8555-555555555555",
    status: "OPEN",
    tableId: "66666666-6666-4666-8666-666666666666",
    tenantId: "tenant_other",
    unitId: DemoIds.unit,
    updatedAt: now,
  };
}

function otherTenantItemFixture(): OrderItem {
  const now = new Date("2026-08-14T12:00:00.000Z");

  return {
    cancelReason: null,
    createdAt: now,
    id: "99999999-9999-4999-8999-999999999999",
    productId: "77777777-7777-4777-8777-777777777777",
    productNameSnapshot: "Produto de outro tenant",
    quantity: 1,
    status: "ACTIVE",
    tabId: "88888888-8888-4888-8888-888888888888",
    tenantId: "tenant_other",
    unitId: DemoIds.unit,
    unitPriceCents: 1000,
    updatedAt: now,
  };
}

async function login(app: INestApplication, email: string): Promise<string> {
  const response = await request(app.getHttpServer())
    .post("/api/v1/auth/login")
    .send({
      email,
      password: DemoLocalCredentials.password,
    })
    .expect(200);

  return response.body.accessToken as string;
}

async function createTable(
  app: INestApplication,
  token: string,
  code: string,
  idempotencyKey: string,
): Promise<{ readonly code: string; readonly id: string; readonly status: string }> {
  const response = await request(app.getHttpServer())
    .post("/api/v1/tables")
    .set("Authorization", `Bearer ${token}`)
    .set("X-Unit-Id", DemoIds.unit)
    .set("Idempotency-Key", idempotencyKey)
    .send({
      code,
    })
    .expect(201);

  return response.body as { readonly code: string; readonly id: string; readonly status: string };
}

async function createProduct(
  app: INestApplication,
  token: string,
  keySuffix = "product-create-flow",
): Promise<{ readonly id: string; readonly name: string; readonly priceCents: number }> {
  const category = await request(app.getHttpServer())
    .post("/api/v1/catalog/categories")
    .set("Authorization", `Bearer ${token}`)
    .set("X-Unit-Id", DemoIds.unit)
    .set("Idempotency-Key", `${keySuffix}-category`)
    .send({
      name: `Bebidas ${keySuffix}`,
    })
    .expect(201);

  const product = await request(app.getHttpServer())
    .post("/api/v1/catalog/products")
    .set("Authorization", `Bearer ${token}`)
    .set("X-Unit-Id", DemoIds.unit)
    .set("Idempotency-Key", keySuffix)
    .send({
      categoryId: category.body.id,
      name: "Café",
      priceCents: 750,
    })
    .expect(201);

  return product.body as {
    readonly id: string;
    readonly name: string;
    readonly priceCents: number;
  };
}

async function openTab(
  app: INestApplication,
  token: string,
  tableId: string,
  idempotencyKey: string,
): Promise<{ readonly id: string; readonly tableId: string }> {
  const response = await request(app.getHttpServer())
    .post("/api/v1/tabs")
    .set("Authorization", `Bearer ${token}`)
    .set("X-Unit-Id", DemoIds.unit)
    .set("Idempotency-Key", idempotencyKey)
    .send({
      tableId,
    })
    .expect(201);

  return response.body as { readonly id: string; readonly tableId: string };
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
