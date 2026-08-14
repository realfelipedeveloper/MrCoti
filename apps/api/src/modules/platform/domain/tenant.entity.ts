import type { TenantId, Timestamped } from "../../common/domain";

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";

export interface Tenant extends Timestamped {
  readonly id: TenantId;
  readonly name: string;
  readonly status: TenantStatus;
  readonly planCode: string;
}
