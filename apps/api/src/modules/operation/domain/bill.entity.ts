import type {
  BillId,
  TabId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";

export type BillStatus = "DRAFT" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | "PAID" | "CLOSED";

export interface Bill extends TenantScoped, Timestamped {
  readonly discountCents: number;
  readonly id: BillId;
  readonly paidCents: number;
  readonly serviceFeeCents: number;
  readonly status: BillStatus;
  readonly subtotalCents: number;
  readonly tabId: TabId;
  readonly tenantId: TenantId;
  readonly totalCents: number;
  readonly unitId: UnitId;
}
