import type { IdentityUserId, Timestamped } from "../../common/domain";

export type IdentityUserStatus = "ACTIVE" | "DISABLED";

export interface IdentityUser extends Timestamped {
  readonly id: IdentityUserId;
  readonly displayName: string;
  readonly syntheticEmail: string;
  readonly passwordHash: string;
  readonly status: IdentityUserStatus;
}
