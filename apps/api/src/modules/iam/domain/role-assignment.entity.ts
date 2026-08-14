import type {
  MembershipId,
  RoleAssignmentId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";
import type { Role } from "./roles";

export interface RoleAssignment extends TenantScoped, Timestamped {
  readonly id: RoleAssignmentId;
  readonly tenantId: TenantId;
  readonly membershipId: MembershipId;
  readonly role: Role;
  readonly unitId: UnitId | null;
}
