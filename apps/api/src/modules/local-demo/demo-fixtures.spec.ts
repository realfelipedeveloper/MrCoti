import { describe, expect, it } from "@jest/globals";

import { ScryptPasswordHasher } from "../iam/application";
import {
  DemoIds,
  DemoLocalCredentials,
  DemoTenantDirectory,
  DemoUsers,
  createDemoIdentityRecords,
} from "./index";

const testHasher = new ScryptPasswordHasher({
  cost: 1_024,
  keyLength: 32,
  maxmem: 8 * 1024 * 1024,
  saltLength: 8,
});

describe("demo fixtures", () => {
  it("contains only synthetic .local identities for MVP roles", () => {
    expect(DemoUsers).toHaveLength(5);
    expect(DemoUsers.map((user) => user.syntheticEmail).sort()).toEqual([
      "auditor.demo@mrcoti.local",
      "cashier.demo@mrcoti.local",
      "manager.demo@mrcoti.local",
      "owner.demo@mrcoti.local",
      "waiter.demo@mrcoti.local",
    ]);

    for (const user of DemoUsers) {
      expect(user.syntheticEmail).toMatch(/^[a-z]+\.demo@mrcoti\.local$/);
      expect(user.syntheticEmail).not.toContain("@gmail.");
      expect(user.syntheticEmail).not.toContain("@hotmail.");
    }
  });

  it("creates hashed local identity records without persisting plaintext password", async () => {
    const records = await createDemoIdentityRecords(testHasher);
    const waiter = records.find((record) => record.syntheticEmail === "waiter.demo@mrcoti.local");

    expect(waiter).toBeDefined();
    expect(waiter?.id).toBe(DemoIds.waiterUser);
    expect(waiter?.passwordHash).not.toBe(DemoLocalCredentials.password);
    await expect(
      testHasher.verify(DemoLocalCredentials.password, waiter?.passwordHash ?? ""),
    ).resolves.toBe(true);
  });

  it("exposes tenant and unit fixtures through the demo directory", async () => {
    const directory = new DemoTenantDirectory();

    await expect(directory.findTenant(DemoIds.tenant)).resolves.toEqual({
      id: DemoIds.tenant,
      name: "Mr Coti Demo",
      status: "ACTIVE",
    });
    await expect(directory.listUnits(DemoIds.tenant, [DemoIds.unit])).resolves.toEqual([
      {
        id: DemoIds.unit,
        name: "Unidade Demo",
        status: "ACTIVE",
      },
    ]);
  });
});
