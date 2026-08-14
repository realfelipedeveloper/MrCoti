import type { BillId, TabId, TenantId, UnitId } from "../../common/domain";
import type { Bill, BillStatus } from "./bill.entity";

export const BillInvariantCodes = {
  BillRequiresFullPayment: "BILL_REQUIRES_FULL_PAYMENT",
  InvalidBillStatus: "INVALID_BILL_STATUS",
  InvalidBillTransition: "INVALID_BILL_TRANSITION",
  InvalidCents: "INVALID_CENTS",
  InvalidTotalCents: "INVALID_TOTAL_CENTS",
  MissingIdentifier: "MISSING_IDENTIFIER",
  MissingTenantOrUnit: "MISSING_TENANT_OR_UNIT",
  PaidAmountExceedsTotal: "PAID_AMOUNT_EXCEEDS_TOTAL",
} as const;

export type BillInvariantCode = (typeof BillInvariantCodes)[keyof typeof BillInvariantCodes];

export class BillInvariantViolation extends Error {
  constructor(readonly code: BillInvariantCode) {
    super(code);
    this.name = "BillInvariantViolation";
  }
}

const BILL_STATUSES = [
  "DRAFT",
  "PAYMENT_PENDING",
  "PAYMENT_FAILED",
  "PAID",
  "CLOSED",
] as const satisfies readonly BillStatus[];

const BILL_STATUS_TRANSITIONS: Record<BillStatus, readonly BillStatus[]> = {
  CLOSED: [],
  DRAFT: ["PAYMENT_PENDING"],
  PAID: ["CLOSED"],
  PAYMENT_FAILED: ["PAYMENT_PENDING"],
  PAYMENT_PENDING: ["PAID", "PAYMENT_FAILED"],
};

export interface CreateBillInput {
  readonly discountCents?: number;
  readonly id: BillId;
  readonly now?: Date;
  readonly paidCents?: number;
  readonly serviceFeeCents?: number;
  readonly status?: string;
  readonly subtotalCents: number;
  readonly tabId: TabId;
  readonly tenantId: TenantId;
  readonly totalCents?: number;
  readonly unitId: UnitId;
}

export function createBill(input: CreateBillInput): Bill {
  assertTenantAndUnit(input.tenantId, input.unitId);
  assertIdentifier(input.id);
  assertIdentifier(input.tabId);

  const subtotalCents = normalizeCents(input.subtotalCents);
  const discountCents = normalizeCents(input.discountCents ?? 0);
  const serviceFeeCents = normalizeCents(input.serviceFeeCents ?? 0);
  const totalCents = normalizeCents(
    input.totalCents ?? subtotalCents - discountCents + serviceFeeCents,
  );
  const paidCents = normalizeCents(input.paidCents ?? 0);
  const status = normalizeBillStatus(input.status ?? "DRAFT");

  assertBillAmounts({
    discountCents,
    paidCents,
    serviceFeeCents,
    status,
    subtotalCents,
    totalCents,
  });

  const now = input.now ?? new Date();

  return {
    createdAt: now,
    discountCents,
    id: input.id,
    paidCents,
    serviceFeeCents,
    status,
    subtotalCents,
    tabId: input.tabId,
    tenantId: input.tenantId,
    totalCents,
    unitId: input.unitId,
    updatedAt: now,
  };
}

export function transitionBillStatus(
  bill: Bill,
  nextStatusInput: string,
  now: Date = new Date(),
): Bill {
  const nextStatus = normalizeBillStatus(nextStatusInput);
  const allowedStatuses = BILL_STATUS_TRANSITIONS[bill.status];

  if (!allowedStatuses.includes(nextStatus)) {
    throw new BillInvariantViolation(BillInvariantCodes.InvalidBillTransition);
  }

  if (requiresFullPayment(nextStatus) && bill.paidCents !== bill.totalCents) {
    throw new BillInvariantViolation(BillInvariantCodes.BillRequiresFullPayment);
  }

  return {
    ...bill,
    status: nextStatus,
    updatedAt: now,
  };
}

function assertTenantAndUnit(tenantId: TenantId, unitId: UnitId): void {
  if (!tenantId.trim() || !unitId.trim()) {
    throw new BillInvariantViolation(BillInvariantCodes.MissingTenantOrUnit);
  }
}

function assertIdentifier(id: string): void {
  if (!id.trim()) {
    throw new BillInvariantViolation(BillInvariantCodes.MissingIdentifier);
  }
}

function normalizeBillStatus(status: string): BillStatus {
  if (!BILL_STATUSES.includes(status as BillStatus)) {
    throw new BillInvariantViolation(BillInvariantCodes.InvalidBillStatus);
  }

  return status as BillStatus;
}

function normalizeCents(cents: number): number {
  if (!Number.isInteger(cents) || cents < 0 || cents > 2_147_483_647) {
    throw new BillInvariantViolation(BillInvariantCodes.InvalidCents);
  }

  return cents;
}

function assertBillAmounts(input: {
  readonly discountCents: number;
  readonly paidCents: number;
  readonly serviceFeeCents: number;
  readonly status: BillStatus;
  readonly subtotalCents: number;
  readonly totalCents: number;
}): void {
  const expectedTotalCents = input.subtotalCents - input.discountCents + input.serviceFeeCents;

  if (expectedTotalCents < 0 || input.totalCents !== expectedTotalCents) {
    throw new BillInvariantViolation(BillInvariantCodes.InvalidTotalCents);
  }

  if (input.paidCents > input.totalCents) {
    throw new BillInvariantViolation(BillInvariantCodes.PaidAmountExceedsTotal);
  }

  if (requiresFullPayment(input.status) && input.paidCents !== input.totalCents) {
    throw new BillInvariantViolation(BillInvariantCodes.BillRequiresFullPayment);
  }
}

function requiresFullPayment(status: BillStatus): boolean {
  return status === "PAID" || status === "CLOSED";
}
