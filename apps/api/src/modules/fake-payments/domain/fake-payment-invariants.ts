import type { BillId, FakePaymentId, TenantId, UnitId } from "../../common/domain";
import type {
  FakePayment,
  FakePaymentMethod,
  FakePaymentScenario,
  FakePaymentStatus,
} from "./fake-payment.entity";

export const FakePaymentInvariantCodes = {
  InvalidCents: "INVALID_CENTS",
  InvalidFakePaymentMethod: "INVALID_FAKE_PAYMENT_METHOD",
  InvalidFakePaymentScenario: "INVALID_FAKE_PAYMENT_SCENARIO",
  InvalidFakePaymentStatus: "INVALID_FAKE_PAYMENT_STATUS",
  InvalidFakePaymentTransition: "INVALID_FAKE_PAYMENT_TRANSITION",
  MissingIdentifier: "MISSING_IDENTIFIER",
  MissingTenantOrUnit: "MISSING_TENANT_OR_UNIT",
  RealFinancialDataNotAllowed: "REAL_FINANCIAL_DATA_NOT_ALLOWED",
  RecordedPaymentRequiresApproval: "RECORDED_PAYMENT_REQUIRES_APPROVAL",
} as const;

export type FakePaymentInvariantCode =
  (typeof FakePaymentInvariantCodes)[keyof typeof FakePaymentInvariantCodes];

export class FakePaymentInvariantViolation extends Error {
  constructor(readonly code: FakePaymentInvariantCode) {
    super(code);
    this.name = "FakePaymentInvariantViolation";
  }
}

const FAKE_PAYMENT_METHODS = [
  "CASH_FAKE",
  "CARD_FAKE",
] as const satisfies readonly FakePaymentMethod[];
const FAKE_PAYMENT_SCENARIOS = [
  "APPROVED",
  "DECLINED",
  "FAILED",
] as const satisfies readonly FakePaymentScenario[];
const FAKE_PAYMENT_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "DECLINED",
  "FAILED",
  "RECORDED",
] as const satisfies readonly FakePaymentStatus[];

const FAKE_PAYMENT_STATUS_TRANSITIONS: Record<FakePaymentStatus, readonly FakePaymentStatus[]> = {
  APPROVED: ["RECORDED"],
  DECLINED: [],
  FAILED: [],
  RECORDED: [],
  REQUESTED: ["APPROVED", "DECLINED", "FAILED"],
};

const PROHIBITED_FINANCIAL_FIELD_NAMES = new Set<string>([
  "authorizationcode",
  "authorization_code",
  "bankaccount",
  "bank_account",
  "cardnumber",
  "card_number",
  "cardtoken",
  "card_token",
  "cnpj",
  "cpf",
  "cvc",
  "cvv",
  "document",
  "holdername",
  "holder_name",
  "pixkey",
  "pix_key",
  "pixqrcode",
  "pix_qr_code",
  "providercredential",
  "provider_credential",
  "token",
] as const);

export interface CreateFakePaymentInput {
  readonly amountCents: number;
  readonly billId: BillId;
  readonly id: FakePaymentId;
  readonly method: string;
  readonly now?: Date;
  readonly scenario?: string;
  readonly status?: string;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export function createFakePayment(input: CreateFakePaymentInput): FakePayment {
  assertNoRealFinancialFields(input);
  assertTenantAndUnit(input.tenantId, input.unitId);
  assertIdentifier(input.id);
  assertIdentifier(input.billId);

  const amountCents = normalizeCents(input.amountCents);
  const method = normalizeMethod(input.method);
  const scenario = normalizeScenario(input.scenario ?? "APPROVED");
  const status = normalizeStatus(input.status ?? "REQUESTED");

  assertScenarioCanReachStatus(scenario, status);

  const now = input.now ?? new Date();

  return {
    amountCents,
    billId: input.billId,
    createdAt: now,
    fake: true,
    id: input.id,
    method,
    scenario,
    status,
    tenantId: input.tenantId,
    unitId: input.unitId,
    updatedAt: now,
  };
}

export function transitionFakePaymentStatus(
  payment: FakePayment,
  nextStatusInput: string,
  now: Date = new Date(),
): FakePayment {
  const nextStatus = normalizeStatus(nextStatusInput);
  const allowedStatuses = FAKE_PAYMENT_STATUS_TRANSITIONS[payment.status];

  if (!allowedStatuses.includes(nextStatus)) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.InvalidFakePaymentTransition);
  }

  assertScenarioCanReachStatus(payment.scenario, nextStatus);

  return {
    ...payment,
    status: nextStatus,
    updatedAt: now,
  };
}

function assertNoRealFinancialFields(value: unknown): void {
  if (!value || typeof value !== "object") {
    return;
  }

  for (const [fieldName, fieldValue] of Object.entries(value)) {
    if (PROHIBITED_FINANCIAL_FIELD_NAMES.has(normalizeFieldName(fieldName))) {
      throw new FakePaymentInvariantViolation(
        FakePaymentInvariantCodes.RealFinancialDataNotAllowed,
      );
    }

    assertNoRealFinancialFields(fieldValue);
  }
}

function normalizeFieldName(fieldName: string): string {
  return fieldName.replace(/[-\s]/g, "_").toLowerCase();
}

function assertTenantAndUnit(tenantId: TenantId, unitId: UnitId): void {
  if (!tenantId.trim() || !unitId.trim()) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.MissingTenantOrUnit);
  }
}

function assertIdentifier(id: string): void {
  if (!id.trim()) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.MissingIdentifier);
  }
}

function normalizeCents(cents: number): number {
  if (!Number.isInteger(cents) || cents < 0 || cents > 2_147_483_647) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.InvalidCents);
  }

  return cents;
}

function normalizeMethod(method: string): FakePaymentMethod {
  if (!FAKE_PAYMENT_METHODS.includes(method as FakePaymentMethod)) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.InvalidFakePaymentMethod);
  }

  return method as FakePaymentMethod;
}

function normalizeScenario(scenario: string): FakePaymentScenario {
  if (!FAKE_PAYMENT_SCENARIOS.includes(scenario as FakePaymentScenario)) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.InvalidFakePaymentScenario);
  }

  return scenario as FakePaymentScenario;
}

function normalizeStatus(status: string): FakePaymentStatus {
  if (!FAKE_PAYMENT_STATUSES.includes(status as FakePaymentStatus)) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.InvalidFakePaymentStatus);
  }

  return status as FakePaymentStatus;
}

function assertScenarioCanReachStatus(
  scenario: FakePaymentScenario,
  status: FakePaymentStatus,
): void {
  if (status === "REQUESTED") {
    return;
  }

  if (status === "RECORDED" && scenario !== "APPROVED") {
    throw new FakePaymentInvariantViolation(
      FakePaymentInvariantCodes.RecordedPaymentRequiresApproval,
    );
  }

  const reachableStatusesByScenario: Record<FakePaymentScenario, readonly FakePaymentStatus[]> = {
    APPROVED: ["APPROVED", "RECORDED"],
    DECLINED: ["DECLINED"],
    FAILED: ["FAILED"],
  };

  if (!reachableStatusesByScenario[scenario].includes(status)) {
    throw new FakePaymentInvariantViolation(FakePaymentInvariantCodes.InvalidFakePaymentTransition);
  }
}
