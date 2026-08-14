import type { CompanyId, TenantId, TenantScoped, Timestamped, UnitId } from "../../common/domain";
import type { OrganizationStatus } from "./company.entity";

export interface Unit extends TenantScoped, Timestamped {
  readonly id: UnitId;
  readonly tenantId: TenantId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly status: OrganizationStatus;
}
