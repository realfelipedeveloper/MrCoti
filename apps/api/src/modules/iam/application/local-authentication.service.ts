import type {
  IdentityUserId,
  MembershipId,
  RoleAssignmentId,
  TenantId,
  UnitId,
} from "../../common/domain";
import type { IdentityUserStatus, MembershipStatus, Role } from "../domain";
import type { PasswordHasher } from "./password-hasher";

export const LocalAuthenticationFailureReasons = {
  InvalidCredentials: "INVALID_CREDENTIALS",
} as const;

export type LocalAuthenticationFailureReason =
  (typeof LocalAuthenticationFailureReasons)[keyof typeof LocalAuthenticationFailureReasons];

export interface AuthenticateLocalUserCommand {
  readonly password: string;
  readonly syntheticEmail: string;
}

export interface LocalAuthRoleAssignmentRecord {
  readonly id: RoleAssignmentId;
  readonly role: Role;
  readonly tenantId: TenantId;
  readonly unitId: UnitId | null;
}

export interface LocalAuthMembershipRecord {
  readonly id: MembershipId;
  readonly roleAssignments: readonly LocalAuthRoleAssignmentRecord[];
  readonly status: MembershipStatus;
  readonly tenantId: TenantId;
}

export interface LocalAuthIdentityRecord {
  readonly displayName: string;
  readonly id: IdentityUserId;
  readonly memberships: readonly LocalAuthMembershipRecord[];
  readonly passwordHash: string;
  readonly status: IdentityUserStatus;
  readonly syntheticEmail: string;
}

export interface LocalAuthIdentityRepository {
  findBySyntheticEmail(syntheticEmail: string): Promise<LocalAuthIdentityRecord | null>;
}

export interface AuthenticatedRoleContext {
  readonly role: Role;
  readonly unitId: UnitId | null;
}

export interface AuthenticatedTenantContext {
  readonly membershipId: MembershipId;
  readonly roles: readonly AuthenticatedRoleContext[];
  readonly tenantId: TenantId;
  readonly unitIds: readonly UnitId[];
}

export interface AuthenticatedLocalUserContext {
  readonly tenants: readonly AuthenticatedTenantContext[];
  readonly user: {
    readonly displayName: string;
    readonly id: IdentityUserId;
    readonly syntheticEmail: string;
  };
}

export type LocalAuthenticationResult =
  | {
      readonly authenticated: true;
      readonly context: AuthenticatedLocalUserContext;
    }
  | {
      readonly authenticated: false;
      readonly reason: LocalAuthenticationFailureReason;
    };

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export class LocalAuthenticationService {
  constructor(
    private readonly users: LocalAuthIdentityRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async authenticate(command: AuthenticateLocalUserCommand): Promise<LocalAuthenticationResult> {
    const syntheticEmail = normalizeSyntheticEmail(command.syntheticEmail);

    if (!syntheticEmail || !isSupportedPasswordShape(command.password)) {
      return invalidCredentials();
    }

    const user = await this.users.findBySyntheticEmail(syntheticEmail);

    if (!user || user.status !== "ACTIVE") {
      return invalidCredentials();
    }

    const passwordMatches = await this.passwordHasher.verify(command.password, user.passwordHash);

    if (!passwordMatches) {
      return invalidCredentials();
    }

    const tenants = buildAuthenticatedTenantContexts(user.memberships);

    if (tenants.length === 0) {
      return invalidCredentials();
    }

    return {
      authenticated: true,
      context: {
        tenants,
        user: {
          displayName: user.displayName,
          id: user.id,
          syntheticEmail: user.syntheticEmail,
        },
      },
    };
  }
}

export function normalizeSyntheticEmail(value: string): string | null {
  const syntheticEmail = value.trim().toLowerCase();

  if (!syntheticEmail || syntheticEmail.length > 191) {
    return null;
  }

  if (!syntheticEmail.includes("@") || !syntheticEmail.endsWith(".local")) {
    return null;
  }

  return syntheticEmail;
}

function isSupportedPasswordShape(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}

function buildAuthenticatedTenantContexts(
  memberships: readonly LocalAuthMembershipRecord[],
): AuthenticatedTenantContext[] {
  return memberships
    .filter((membership) => membership.status === "ACTIVE")
    .map<AuthenticatedTenantContext | null>((membership) => {
      const roles = membership.roleAssignments
        .filter((roleAssignment) => roleAssignment.tenantId === membership.tenantId)
        .map((roleAssignment) => ({
          role: roleAssignment.role,
          unitId: roleAssignment.unitId,
        }));

      if (roles.length === 0) {
        return null;
      }

      return {
        membershipId: membership.id,
        roles,
        tenantId: membership.tenantId,
        unitIds: uniqueUnitIds(roles),
      };
    })
    .filter((tenantContext): tenantContext is AuthenticatedTenantContext => tenantContext !== null);
}

function uniqueUnitIds(roles: readonly AuthenticatedRoleContext[]): UnitId[] {
  return [
    ...new Set(
      roles.map((role) => role.unitId).filter((unitId): unitId is UnitId => unitId !== null),
    ),
  ];
}

function invalidCredentials(): LocalAuthenticationResult {
  return {
    authenticated: false,
    reason: LocalAuthenticationFailureReasons.InvalidCredentials,
  };
}
