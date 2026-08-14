import type {
  IdentityUserId,
  MembershipId,
  TenantId,
  TenantScoped,
  Timestamped,
} from "../../common/domain";

export type MembershipStatus = "ACTIVE" | "DISABLED";

export interface Membership extends TenantScoped, Timestamped {
  readonly id: MembershipId;
  readonly tenantId: TenantId;
  readonly userId: IdentityUserId;
  readonly status: MembershipStatus;
}
