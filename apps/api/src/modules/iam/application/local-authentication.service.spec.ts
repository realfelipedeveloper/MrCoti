import { describe, expect, it } from "@jest/globals";

import { Roles, type Role } from "../domain";
import {
  LocalAuthenticationFailureReasons,
  LocalAuthenticationService,
  ScryptPasswordHasher,
  normalizeSyntheticEmail,
  type LocalAuthIdentityRecord,
  type LocalAuthIdentityRepository,
} from "./index";

const testHasher = new ScryptPasswordHasher({
  cost: 1_024,
  keyLength: 32,
  maxmem: 8 * 1024 * 1024,
  saltLength: 8,
});

class InMemoryLocalAuthIdentityRepository implements LocalAuthIdentityRepository {
  private readonly users = new Map<string, LocalAuthIdentityRecord>();

  add(user: LocalAuthIdentityRecord): void {
    this.users.set(user.syntheticEmail, user);
  }

  async findBySyntheticEmail(syntheticEmail: string): Promise<LocalAuthIdentityRecord | null> {
    return this.users.get(syntheticEmail) ?? null;
  }
}

describe("ScryptPasswordHasher", () => {
  it("hashes and verifies a synthetic local password without storing plaintext", async () => {
    const firstHash = await testHasher.hash("demo-password");
    const secondHash = await testHasher.hash("demo-password");

    expect(firstHash).not.toBe("demo-password");
    expect(firstHash).not.toEqual(secondHash);
    await expect(testHasher.verify("demo-password", firstHash)).resolves.toBe(true);
    await expect(testHasher.verify("wrong-password", firstHash)).resolves.toBe(false);
  });

  it("rejects malformed hashes safely", async () => {
    await expect(testHasher.verify("demo-password", "not-a-valid-hash")).resolves.toBe(false);
  });
});

describe("LocalAuthenticationService", () => {
  it("normalizes only synthetic local email addresses", () => {
    expect(normalizeSyntheticEmail(" Waiter.Demo@MrCoti.Local ")).toBe("waiter.demo@mrcoti.local");
    expect(normalizeSyntheticEmail("person@example.com")).toBeNull();
  });

  it("authenticates an active synthetic user and returns tenant/unit role context", async () => {
    const repository = new InMemoryLocalAuthIdentityRepository();
    const passwordHash = await testHasher.hash("demo-password");
    repository.add(
      createUserRecord({
        passwordHash,
        role: Roles.Waiter,
      }),
    );

    const service = new LocalAuthenticationService(repository, testHasher);

    const result = await service.authenticate({
      password: "demo-password",
      syntheticEmail: "WAITER.DEMO@MRCOTI.LOCAL",
    });

    expect(result).toEqual({
      authenticated: true,
      context: {
        tenants: [
          {
            membershipId: "membership_demo",
            roles: [
              {
                role: Roles.Waiter,
                unitId: "unit_demo",
              },
            ],
            tenantId: "tenant_demo",
            unitIds: ["unit_demo"],
          },
        ],
        user: {
          displayName: "Waiter Demo",
          id: "user_demo",
          syntheticEmail: "waiter.demo@mrcoti.local",
        },
      },
    });
  });

  it("uses the same invalid credential response for unknown, disabled and wrong-password users", async () => {
    const repository = new InMemoryLocalAuthIdentityRepository();
    const passwordHash = await testHasher.hash("demo-password");
    repository.add(
      createUserRecord({
        passwordHash,
        status: "DISABLED",
      }),
    );
    const service = new LocalAuthenticationService(repository, testHasher);

    await expect(
      service.authenticate({
        password: "demo-password",
        syntheticEmail: "unknown.demo@mrcoti.local",
      }),
    ).resolves.toEqual(invalidCredentials());

    await expect(
      service.authenticate({
        password: "demo-password",
        syntheticEmail: "waiter.demo@mrcoti.local",
      }),
    ).resolves.toEqual(invalidCredentials());

    repository.add(
      createUserRecord({
        passwordHash,
      }),
    );

    await expect(
      service.authenticate({
        password: "wrong-password",
        syntheticEmail: "waiter.demo@mrcoti.local",
      }),
    ).resolves.toEqual(invalidCredentials());
  });

  it("rejects active users without active memberships or role assignments", async () => {
    const passwordHash = await testHasher.hash("demo-password");
    const repository = new InMemoryLocalAuthIdentityRepository();
    const service = new LocalAuthenticationService(repository, testHasher);

    repository.add(
      createUserRecord({
        memberships: [],
        passwordHash,
      }),
    );

    await expect(
      service.authenticate({
        password: "demo-password",
        syntheticEmail: "waiter.demo@mrcoti.local",
      }),
    ).resolves.toEqual(invalidCredentials());

    repository.add(
      createUserRecord({
        membershipStatus: "DISABLED",
        passwordHash,
      }),
    );

    await expect(
      service.authenticate({
        password: "demo-password",
        syntheticEmail: "waiter.demo@mrcoti.local",
      }),
    ).resolves.toEqual(invalidCredentials());
  });
});

function invalidCredentials() {
  return {
    authenticated: false,
    reason: LocalAuthenticationFailureReasons.InvalidCredentials,
  };
}

function createUserRecord(options: {
  readonly membershipStatus?: "ACTIVE" | "DISABLED";
  readonly memberships?: LocalAuthIdentityRecord["memberships"];
  readonly passwordHash: string;
  readonly role?: Role;
  readonly status?: "ACTIVE" | "DISABLED";
}): LocalAuthIdentityRecord {
  return {
    displayName: "Waiter Demo",
    id: "user_demo",
    memberships: options.memberships ?? [
      {
        id: "membership_demo",
        roleAssignments: [
          {
            id: "role_assignment_demo",
            role: options.role ?? Roles.UnitManager,
            tenantId: "tenant_demo",
            unitId: "unit_demo",
          },
        ],
        status: options.membershipStatus ?? "ACTIVE",
        tenantId: "tenant_demo",
      },
    ],
    passwordHash: options.passwordHash,
    status: options.status ?? "ACTIVE",
    syntheticEmail: "waiter.demo@mrcoti.local",
  };
}
