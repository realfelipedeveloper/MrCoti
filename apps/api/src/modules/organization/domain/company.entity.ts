import type { CompanyId, TenantId, TenantScoped, Timestamped } from "../../common/domain";

export type OrganizationStatus = "ACTIVE" | "INACTIVE";

export interface Company extends TenantScoped, Timestamped {
  readonly id: CompanyId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly status: OrganizationStatus;
}
