import { createHash } from "node:crypto";

export const IdempotencyFailureCodes = {
  PayloadConflict: "IDEMPOTENCY_PAYLOAD_CONFLICT",
} as const;

export type IdempotencyFailureCode =
  (typeof IdempotencyFailureCodes)[keyof typeof IdempotencyFailureCodes];

export type IdempotencyResult<TResponse> =
  | {
      readonly replay: boolean;
      readonly response: TResponse;
      readonly status: "STORED";
    }
  | {
      readonly code: typeof IdempotencyFailureCodes.PayloadConflict;
      readonly status: "CONFLICT";
    };

interface IdempotencyRecord<TResponse> {
  readonly payloadHash: string;
  readonly response: TResponse;
}

export class InMemoryIdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord<unknown>>();

  resolve<TResponse>(
    scope: string,
    key: string,
    payload: unknown,
    create: () => TResponse,
  ): IdempotencyResult<TResponse> {
    const recordKey = `${scope}:${key}`;
    const payloadHash = hashPayload(payload);
    const existing = this.records.get(recordKey) as IdempotencyRecord<TResponse> | undefined;

    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        return {
          code: IdempotencyFailureCodes.PayloadConflict,
          status: "CONFLICT",
        };
      }

      return {
        replay: true,
        response: existing.response,
        status: "STORED",
      };
    }

    const response = create();
    this.records.set(recordKey, {
      payloadHash,
      response,
    });

    return {
      replay: false,
      response,
      status: "STORED",
    };
  }
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}
