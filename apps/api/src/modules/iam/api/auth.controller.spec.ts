import "reflect-metadata";

import { describe, expect, it, afterEach, beforeEach } from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { RequestContextMiddleware } from "../../common/api";
import {
  DemoIds,
  DemoLocalCredentials,
  DemoTenantDirectory,
  createDemoIdentityRecords,
} from "../../local-demo";
import { TenantContextGuard } from "../../platform/application";
import {
  LocalAuthenticationService,
  RbacPolicy,
  ScryptPasswordHasher,
  type LocalAuthIdentityRecord,
  type LocalAuthIdentityRepository,
} from "../application";
import { Roles } from "../domain";
import { AuthController } from "./auth.controller";
import { AuthHttpService, InMemoryLocalSessionStore } from "./auth-http.service";

describe("AuthController", () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApplication();
  });

  afterEach(async () => {
    await app.close();
  });

  it("POST /api/v1/auth/login returns a local token and current context matching the OpenAPI contract", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("X-Request-Id", "req-login-001")
      .set("X-Correlation-Id", "corr-login-001")
      .send({
        email: "waiter.demo@mrcoti.local",
        password: "demo-password",
      })
      .expect(200);

    expect(response.headers["x-request-id"]).toBe("req-login-001");
    expect(response.headers["x-correlation-id"]).toBe("corr-login-001");
    expect(response.body).toMatchObject({
      context: {
        roles: [Roles.Waiter],
        tenant: {
          id: DemoIds.tenant,
          name: "Mr Coti Demo",
          status: "ACTIVE",
        },
        units: [
          {
            id: DemoIds.unit,
            name: "Unidade Demo",
            status: "ACTIVE",
          },
        ],
        user: {
          displayName: "Waiter Demo",
          id: DemoIds.waiterUser,
        },
      },
      expiresInSeconds: 900,
    });
    expect(response.body.accessToken).toEqual(expect.stringMatching(/^mrcoti-local-/));
    expect(response.body.context.user).not.toHaveProperty("syntheticEmail");
    expect(response.body.context.permissions).toContain("operation.tab.open");
  });

  it("returns a safe 401 error for invalid credentials", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("X-Request-Id", "req-login-002")
      .set("X-Correlation-Id", "corr-login-002")
      .send({
        email: "waiter.demo@mrcoti.local",
        password: "wrong-password",
      })
      .expect(401);

    expect(response.body).toEqual({
      code: "AUTH_INVALID",
      correlationId: "corr-login-002",
      message: "Credencial ausente, inválida ou expirada.",
      requestId: "req-login-002",
    });
  });

  it("requires bearer token for GET /me and GET /units", async () => {
    await request(app.getHttpServer()).get("/api/v1/me").expect(401);
    await request(app.getHttpServer()).get("/api/v1/units").expect(401);

    const accessToken = await login();

    const me = await request(app.getHttpServer())
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(me.body.user).toEqual({
      displayName: "Waiter Demo",
      id: DemoIds.waiterUser,
    });
    expect(me.body.permissions).toContain("operation.order-item.create");

    const units = await request(app.getHttpServer())
      .get("/api/v1/units")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(units.body).toEqual([
      {
        id: DemoIds.unit,
        name: "Unidade Demo",
        status: "ACTIVE",
      },
    ]);
  });

  it("POST /auth/logout revokes the local token", async () => {
    const accessToken = await login();

    await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(401);
  });

  async function login(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: "waiter.demo@mrcoti.local",
        password: DemoLocalCredentials.password,
      })
      .expect(200);

    return response.body.accessToken as string;
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
  const moduleRef = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      {
        provide: AuthHttpService,
        useValue: authHttpService,
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
