import { randomUUID } from "node:crypto";

import {
  IdempotencyFailureCodes,
  InMemoryIdempotencyStore,
  type InMemoryOutboxStore,
} from "../../common/application";
import type { IdentityUserId, RestaurantTableId, TenantId, UnitId } from "../../common/domain";
import type { RestaurantTable, Tab, TabStatus } from "../domain";

export const OpenTabFailureReasons = {
  ActiveTabAlreadyExists: "ACTIVE_TAB_ALREADY_EXISTS",
  IdempotencyPayloadConflict: "IDEMPOTENCY_PAYLOAD_CONFLICT",
  MissingIdempotencyKey: "MISSING_IDEMPOTENCY_KEY",
  TableNotAvailable: "TABLE_NOT_AVAILABLE",
  TableNotFound: "TABLE_NOT_FOUND",
} as const;

export type OpenTabFailureReason =
  (typeof OpenTabFailureReasons)[keyof typeof OpenTabFailureReasons];

export interface OpenTabCommand {
  readonly actorId: IdentityUserId;
  readonly causationId?: string | null;
  readonly correlationId?: string | null;
  readonly idempotencyKey: string | null;
  readonly tableId: RestaurantTableId;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export type OpenTabResult =
  | {
      readonly status: "OPENED";
      readonly tab: Tab;
      readonly table: RestaurantTable;
    }
  | {
      readonly reason: OpenTabFailureReason;
      readonly status: "DENIED";
    };

export class OpenTabService {
  constructor(
    private readonly tables: InMemoryRestaurantTableStore,
    private readonly tabs: InMemoryTabStore,
    private readonly idempotency: InMemoryIdempotencyStore,
    private readonly outbox: InMemoryOutboxStore | null = null,
  ) {}

  open(command: OpenTabCommand): OpenTabResult {
    if (!command.idempotencyKey) {
      return denied(OpenTabFailureReasons.MissingIdempotencyKey);
    }

    const scope = `tenant:${command.tenantId}:unit:${command.unitId}:tables:${command.tableId}:open-tab`;
    const result = this.idempotency.resolve(
      scope,
      command.idempotencyKey,
      {
        actorId: command.actorId,
        tableId: command.tableId,
        tenantId: command.tenantId,
        unitId: command.unitId,
      },
      () => this.openOnce(command),
    );

    if (result.status === "CONFLICT") {
      return denied(IdempotencyFailureCodes.PayloadConflict);
    }

    return result.response;
  }

  private openOnce(command: OpenTabCommand): OpenTabResult {
    const table = this.tables.find(command.tenantId, command.unitId, command.tableId);

    if (!table) {
      return denied(OpenTabFailureReasons.TableNotFound);
    }

    if (table.status !== "AVAILABLE") {
      return denied(OpenTabFailureReasons.TableNotAvailable);
    }

    if (this.tabs.findActiveByTable(command.tenantId, command.unitId, command.tableId)) {
      return denied(OpenTabFailureReasons.ActiveTabAlreadyExists);
    }

    const now = new Date();
    const tab: Tab = {
      closedAt: null,
      createdAt: now,
      id: randomUUID(),
      openedBy: command.actorId,
      status: "OPEN",
      tableId: command.tableId,
      tenantId: command.tenantId,
      unitId: command.unitId,
      updatedAt: now,
    };
    const occupiedTable: RestaurantTable = {
      ...table,
      status: "OCCUPIED",
      updatedAt: now,
    };

    this.tabs.save(tab);
    this.tables.save(occupiedTable);
    this.outbox?.append({
      aggregateId: tab.id,
      aggregateType: "Tab",
      causationId: command.causationId ?? command.idempotencyKey ?? tab.id,
      correlationId: command.correlationId ?? command.idempotencyKey ?? tab.id,
      eventName: "TabOpened",
      eventVersion: 1,
      now,
      payload: {
        actorId: command.actorId,
        tableId: command.tableId,
        tabId: tab.id,
        tenantId: command.tenantId,
        unitId: command.unitId,
      },
      producer: "operation",
      tenantId: command.tenantId,
    });

    return {
      status: "OPENED",
      tab,
      table: occupiedTable,
    };
  }
}

export class InMemoryRestaurantTableStore {
  private readonly tables = new Map<string, RestaurantTable>();

  find(tenantId: TenantId, unitId: UnitId, tableId: RestaurantTableId): RestaurantTable | null {
    const table = this.tables.get(tableId);

    if (!table || table.tenantId !== tenantId || table.unitId !== unitId) {
      return null;
    }

    return table;
  }

  list(tenantId: TenantId, unitId: UnitId): RestaurantTable[] {
    return [...this.tables.values()]
      .filter((table) => table.tenantId === tenantId && table.unitId === unitId)
      .sort((left, right) => left.code.localeCompare(right.code));
  }

  findByCode(tenantId: TenantId, unitId: UnitId, code: string): RestaurantTable | null {
    return (
      [...this.tables.values()].find(
        (table) =>
          table.tenantId === tenantId &&
          table.unitId === unitId &&
          table.code.toLocaleUpperCase("pt-BR") === code.toLocaleUpperCase("pt-BR"),
      ) ?? null
    );
  }

  save(table: RestaurantTable): void {
    this.tables.set(table.id, table);
  }
}

export class InMemoryTabStore {
  private readonly tabs = new Map<string, Tab>();

  find(tenantId: TenantId, unitId: UnitId, tabId: string): Tab | null {
    const tab = this.tabs.get(tabId);

    if (!tab || tab.tenantId !== tenantId || tab.unitId !== unitId) {
      return null;
    }

    return tab;
  }

  findActiveByTable(tenantId: TenantId, unitId: UnitId, tableId: RestaurantTableId): Tab | null {
    return (
      [...this.tabs.values()].find(
        (tab) =>
          tab.tenantId === tenantId &&
          tab.unitId === unitId &&
          tab.tableId === tableId &&
          isActiveTabStatus(tab.status),
      ) ?? null
    );
  }

  save(tab: Tab): void {
    this.tabs.set(tab.id, tab);
  }
}

function isActiveTabStatus(status: TabStatus): boolean {
  return status === "OPEN" || status === "CLOSING";
}

function denied(reason: OpenTabFailureReason): OpenTabResult {
  return {
    reason,
    status: "DENIED",
  };
}
