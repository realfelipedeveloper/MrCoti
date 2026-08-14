import type { CategoryId, TenantId, TenantScoped, Timestamped, UnitId } from "../../common/domain";

export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category extends TenantScoped, Timestamped {
  readonly id: CategoryId;
  readonly name: string;
  readonly sortOrder: number;
  readonly status: CategoryStatus;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}
