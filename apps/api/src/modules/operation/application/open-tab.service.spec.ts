import { describe, expect, it } from "@jest/globals";

import { InMemoryIdempotencyStore } from "../../common/application";
import { DemoIds } from "../../local-demo";
import type { RestaurantTable } from "../domain";
import {
  InMemoryRestaurantTableStore,
  InMemoryTabStore,
  OpenTabFailureReasons,
  OpenTabService,
} from "./index";

describe("OpenTabService", () => {
  it("opens a tab for an available table and marks the table occupied", () => {
    const tables = new InMemoryRestaurantTableStore();
    const service = new OpenTabService(
      tables,
      new InMemoryTabStore(),
      new InMemoryIdempotencyStore(),
    );
    tables.save(tableFixture());

    const result = service.open({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "open-tab-001",
      tableId: "table_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expect(result).toMatchObject({
      status: "OPENED",
      tab: {
        closedAt: null,
        openedBy: DemoIds.waiterUser,
        status: "OPEN",
        tableId: "table_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      },
      table: {
        status: "OCCUPIED",
      },
    });
  });

  it("replays the same idempotency key and rejects divergent payload", () => {
    const tables = new InMemoryRestaurantTableStore();
    const service = new OpenTabService(
      tables,
      new InMemoryTabStore(),
      new InMemoryIdempotencyStore(),
    );
    tables.save(tableFixture());

    const first = service.open({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "open-tab-replay",
      tableId: "table_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const replay = service.open({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "open-tab-replay",
      tableId: "table_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const conflict = service.open({
      actorId: DemoIds.cashierUser,
      idempotencyKey: "open-tab-replay",
      tableId: "table_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expect(replay).toEqual(first);
    expect(conflict).toEqual({
      reason: OpenTabFailureReasons.IdempotencyPayloadConflict,
      status: "DENIED",
    });
  });

  it("rejects a second active tab for the same table", () => {
    const tables = new InMemoryRestaurantTableStore();
    const tabs = new InMemoryTabStore();
    const service = new OpenTabService(tables, tabs, new InMemoryIdempotencyStore());
    tables.save(tableFixture());
    service.open({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "open-tab-first",
      tableId: "table_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    tables.save({
      ...tableFixture(),
      status: "AVAILABLE",
    });

    expect(
      service.open({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "open-tab-second",
        tableId: "table_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OpenTabFailureReasons.ActiveTabAlreadyExists,
      status: "DENIED",
    });
  });

  it("rejects missing, blocked or cross-tenant tables", () => {
    const tables = new InMemoryRestaurantTableStore();
    const service = new OpenTabService(
      tables,
      new InMemoryTabStore(),
      new InMemoryIdempotencyStore(),
    );
    tables.save({
      ...tableFixture(),
      status: "BLOCKED",
    });

    expect(
      service.open({
        actorId: DemoIds.waiterUser,
        idempotencyKey: null,
        tableId: "table_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OpenTabFailureReasons.MissingIdempotencyKey,
      status: "DENIED",
    });
    expect(
      service.open({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "open-blocked-table",
        tableId: "table_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OpenTabFailureReasons.TableNotAvailable,
      status: "DENIED",
    });
    expect(
      service.open({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "open-other-tenant-table",
        tableId: "table_demo",
        tenantId: "tenant_other",
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OpenTabFailureReasons.TableNotFound,
      status: "DENIED",
    });
  });
});

function tableFixture(): RestaurantTable {
  const now = new Date("2026-07-11T12:00:00.000Z");

  return {
    code: "M01",
    createdAt: now,
    id: "table_demo",
    status: "AVAILABLE",
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
    updatedAt: now,
  };
}
