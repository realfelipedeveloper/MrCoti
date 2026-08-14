import type {
  BillId,
  FakePaymentId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";

export type FakePaymentMethod = "CASH_FAKE" | "CARD_FAKE";
export type FakePaymentScenario = "APPROVED" | "DECLINED" | "FAILED";
export type FakePaymentStatus = "REQUESTED" | "APPROVED" | "DECLINED" | "FAILED" | "RECORDED";

export interface FakePayment extends TenantScoped, Timestamped {
  readonly amountCents: number;
  readonly billId: BillId;
  readonly fake: true;
  readonly id: FakePaymentId;
  readonly method: FakePaymentMethod;
  readonly scenario: FakePaymentScenario;
  readonly status: FakePaymentStatus;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}
