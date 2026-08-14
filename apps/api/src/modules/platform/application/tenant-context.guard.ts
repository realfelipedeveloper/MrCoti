import type { TenantId, UnitId } from "../../common/domain";
import type {
  AuthenticatedLocalUserContext,
  AuthenticatedRoleContext,
} from "../../iam/application";

export const TenantContextFailureReasons = {
  TenantAccessDenied: "TENANT_ACCESS_DENIED",
  TenantContextRequired: "TENANT_CONTEXT_REQUIRED",
  Unauthenticated: "UNAUTHENTICATED",
  UnitAccessDenied: "UNIT_ACCESS_DENIED",
} as const;

export type TenantContextFailureReason =
  (typeof TenantContextFailureReasons)[keyof typeof TenantContextFailureReasons];

export interface ResolveTenantContextCommand {
  readonly authentication: AuthenticatedLocalUserContext | null;
  readonly selectedTenantId?: TenantId;
  readonly selectedUnitId?: UnitId | null;
  readonly payloadTenantId?: TenantId | null;
}

export interface TrustedTenantContext {
  readonly actorUserId: string;
  readonly roles: readonly AuthenticatedRoleContext[];
  readonly tenantId: TenantId;
  readonly unitId: UnitId | null;
  readonly unitIds: readonly UnitId[];
}

export type TenantContextResolution =
  | {
      readonly authorized: true;
      readonly context: TrustedTenantContext;
    }
  | {
      readonly authorized: false;
      readonly reason: TenantContextFailureReason;
    };

export interface TenantScopedResource {
  readonly tenantId: TenantId;
}

export interface UnitScopedResource extends TenantScopedResource {
  readonly unitId: UnitId;
}

export type TenantResourceAuthorization =
  | {
      readonly authorized: true;
    }
  | {
      readonly authorized: false;
      readonly reason: typeof TenantContextFailureReasons.TenantAccessDenied;
    };

export type UnitResourceAuthorization =
  | {
      readonly authorized: true;
    }
  | {
      readonly authorized: false;
      readonly reason:
        | typeof TenantContextFailureReasons.TenantAccessDenied
        | typeof TenantContextFailureReasons.UnitAccessDenied;
    };

export class TenantContextGuard {
  resolve(command: ResolveTenantContextCommand): TenantContextResolution {
    if (!command.authentication) {
      return denied(TenantContextFailureReasons.Unauthenticated);
    }

    const tenant = this.selectTenant(command.authentication, command.selectedTenantId);

    if (tenant === "TENANT_CONTEXT_REQUIRED") {
      return denied(TenantContextFailureReasons.TenantContextRequired);
    }

    if (!tenant) {
      return denied(TenantContextFailureReasons.TenantAccessDenied);
    }

    const selectedUnitId = command.selectedUnitId ?? null;

    if (selectedUnitId && !canAccessUnit(tenant.roles, selectedUnitId)) {
      return denied(TenantContextFailureReasons.UnitAccessDenied);
    }

    return {
      authorized: true,
      context: {
        actorUserId: command.authentication.user.id,
        roles: filterRolesByUnit(tenant.roles, selectedUnitId),
        tenantId: tenant.tenantId,
        unitId: selectedUnitId,
        unitIds: tenant.unitIds,
      },
    };
  }

  authorizeTenantResource(
    context: TrustedTenantContext,
    resource: TenantScopedResource,
  ): TenantResourceAuthorization {
    if (context.tenantId !== resource.tenantId) {
      return {
        authorized: false,
        reason: TenantContextFailureReasons.TenantAccessDenied,
      };
    }

    return {
      authorized: true,
    };
  }

  authorizeUnitResource(
    context: TrustedTenantContext,
    resource: UnitScopedResource,
  ): UnitResourceAuthorization {
    if (context.tenantId !== resource.tenantId) {
      return {
        authorized: false,
        reason: TenantContextFailureReasons.TenantAccessDenied,
      };
    }

    if (context.unitId && context.unitId !== resource.unitId) {
      return {
        authorized: false,
        reason: TenantContextFailureReasons.UnitAccessDenied,
      };
    }

    if (!canAccessUnit(context.roles, resource.unitId)) {
      return {
        authorized: false,
        reason: TenantContextFailureReasons.UnitAccessDenied,
      };
    }

    return {
      authorized: true,
    };
  }

  private selectTenant(
    authentication: AuthenticatedLocalUserContext,
    selectedTenantId: TenantId | undefined,
  ): AuthenticatedLocalUserContext["tenants"][number] | "TENANT_CONTEXT_REQUIRED" | null {
    if (selectedTenantId) {
      return authentication.tenants.find((tenant) => tenant.tenantId === selectedTenantId) ?? null;
    }

    if (authentication.tenants.length === 1) {
      return authentication.tenants[0] ?? null;
    }

    return "TENANT_CONTEXT_REQUIRED";
  }
}

function canAccessUnit(roles: readonly AuthenticatedRoleContext[], unitId: UnitId): boolean {
  return roles.some((role) => role.unitId === null || role.unitId === unitId);
}

function filterRolesByUnit(
  roles: readonly AuthenticatedRoleContext[],
  selectedUnitId: UnitId | null,
): AuthenticatedRoleContext[] {
  if (!selectedUnitId) {
    return [...roles];
  }

  return roles.filter((role) => role.unitId === null || role.unitId === selectedUnitId);
}

function denied(reason: TenantContextFailureReason): TenantContextResolution {
  return {
    authorized: false,
    reason,
  };
}
