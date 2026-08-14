import { randomUUID } from "node:crypto";

import type { AuditEntry, AuditResourceType, CatalogAuditAction } from "../domain";

export interface RecordAuditEntryInput {
  readonly action: CatalogAuditAction;
  readonly actorId: string;
  readonly after: Readonly<Record<string, unknown>> | null;
  readonly before: Readonly<Record<string, unknown>> | null;
  readonly correlationId: string;
  readonly id?: string;
  readonly now?: Date;
  readonly reason: string | null;
  readonly resourceId: string;
  readonly resourceType: AuditResourceType;
  readonly tenantId: string;
  readonly unitId: string | null;
}

export class InMemoryAuditLog {
  private readonly entries: AuditEntry[] = [];

  append(input: RecordAuditEntryInput): AuditEntry {
    const now = input.now ?? new Date();
    const entry: AuditEntry = {
      action: input.action,
      actorId: input.actorId,
      after: input.after,
      before: input.before,
      correlationId: input.correlationId,
      createdAt: now,
      id: input.id ?? randomUUID(),
      reason: input.reason,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      tenantId: input.tenantId,
      unitId: input.unitId,
      updatedAt: now,
    };

    this.entries.push(entry);

    return entry;
  }

  list(): readonly AuditEntry[] {
    return [...this.entries];
  }
}
