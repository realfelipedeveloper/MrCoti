import { randomUUID } from "node:crypto";

export type OutboxEventStatus = "PENDING" | "PUBLISHED" | "FAILED";

export interface OutboxEvent {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly aggregateVersion: number;
  readonly attemptCount: number;
  readonly causationId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly eventName: string;
  readonly eventVersion: number;
  readonly lastError: string | null;
  readonly nextAttemptAt: Date | null;
  readonly occurredAt: Date;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly producer: string;
  readonly publishedAt: Date | null;
  readonly status: OutboxEventStatus;
  readonly tenantId: string;
}

export interface AppendOutboxEventInput {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly aggregateVersion?: number;
  readonly causationId: string;
  readonly correlationId: string;
  readonly eventId?: string;
  readonly eventName: string;
  readonly eventVersion?: number;
  readonly now?: Date;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly producer: string;
  readonly tenantId: string;
}

export class InMemoryOutboxStore {
  private readonly events: OutboxEvent[] = [];

  append(input: AppendOutboxEventInput): OutboxEvent {
    const event: OutboxEvent = {
      aggregateId: input.aggregateId,
      aggregateType: input.aggregateType,
      aggregateVersion: input.aggregateVersion ?? 1,
      attemptCount: 0,
      causationId: input.causationId,
      correlationId: input.correlationId,
      eventId: input.eventId ?? randomUUID(),
      eventName: input.eventName,
      eventVersion: input.eventVersion ?? 1,
      lastError: null,
      nextAttemptAt: null,
      occurredAt: input.now ?? new Date(),
      payload: { ...input.payload },
      producer: input.producer,
      publishedAt: null,
      status: "PENDING",
      tenantId: input.tenantId,
    };

    this.events.push(event);

    return event;
  }

  list(): readonly OutboxEvent[] {
    return [...this.events];
  }

  listByTenant(tenantId: string): readonly OutboxEvent[] {
    return this.events.filter((event) => event.tenantId === tenantId);
  }
}
