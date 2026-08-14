import { describe, expect, it } from "@jest/globals";

import type { AuthenticatedLocalUserContext } from "../../iam/application";
import { Roles } from "../../iam/domain";
import {
  TenantContextFailureReasons,
  TenantContextGuard,
  type TrustedTenantContext,
} from "./index";

describe("TenantContextGuard", () => {
  const guard = new TenantContextGuard();

  it("resolves a trusted tenant and unit context from authenticated memberships", () => {
    const result = guard.resolve({
      authentication: authenticatedContext(),
      selectedTenantId: "tenant_demo",
      selectedUnitId: "unit_demo",
    });

    expect(result).toEqual({
      authorized: true,
      context: {
        actorUserId: "user_demo",
        roles: [
          {
            role: Roles.Waiter,
            unitId: "unit_demo",
          },
        ],
        tenantId: "tenant_demo",
        unitId: "unit_demo",
        unitIds: ["unit_demo"],
      },
    });
  });

  it("does not use tenant_id from payload as authority", () => {
    const ambiguous = guard.resolve({
      authentication: authenticatedContext({
        includeSecondTenant: true,
      }),
      payloadTenantId: "tenant_other",
    });

    expect(ambiguous).toEqual({
      authorized: false,
      reason: TenantContextFailureReasons.TenantContextRequired,
    });

    const explicit = guard.resolve({
      authentication: authenticatedContext({
        includeSecondTenant: true,
      }),
      payloadTenantId: "tenant_other",
      selectedTenantId: "tenant_demo",
    });

    expect(explicit).toMatchObject({
      authorized: true,
      context: {
        tenantId: "tenant_demo",
      },
    });
  });

  it("denies tenant and unit escalation without revealing resource existence", () => {
    expect(
      guard.resolve({
        authentication: authenticatedContext(),
        selectedTenantId: "tenant_other",
      }),
    ).toEqual({
      authorized: false,
      reason: TenantContextFailureReasons.TenantAccessDenied,
    });

    expect(
      guard.resolve({
        authentication: authenticatedContext(),
        selectedTenantId: "tenant_demo",
        selectedUnitId: "unit_other",
      }),
    ).toEqual({
      authorized: false,
      reason: TenantContextFailureReasons.UnitAccessDenied,
    });
  });

  it("authorizes only tenant and unit scoped resources inside the trusted context", () => {
    const context = trustedContext();

    expect(
      guard.authorizeTenantResource(context, {
        tenantId: "tenant_demo",
      }),
    ).toEqual({
      authorized: true,
    });

    expect(
      guard.authorizeTenantResource(context, {
        tenantId: "tenant_other",
      }),
    ).toEqual({
      authorized: false,
      reason: TenantContextFailureReasons.TenantAccessDenied,
    });

    expect(
      guard.authorizeUnitResource(context, {
        tenantId: "tenant_demo",
        unitId: "unit_demo",
      }),
    ).toEqual({
      authorized: true,
    });

    expect(
      guard.authorizeUnitResource(context, {
        tenantId: "tenant_demo",
        unitId: "unit_other",
      }),
    ).toEqual({
      authorized: false,
      reason: TenantContextFailureReasons.UnitAccessDenied,
    });
  });
});

function authenticatedContext(
  options: { readonly includeSecondTenant?: boolean } = {},
): AuthenticatedLocalUserContext {
  return {
    tenants: [
      {
        membershipId: "membership_demo",
        roles: [
          {
            role: Roles.Waiter,
            unitId: "unit_demo",
          },
        ],
        tenantId: "tenant_demo",
        unitIds: ["unit_demo"],
      },
      ...(options.includeSecondTenant
        ? [
            {
              membershipId: "membership_other",
              roles: [
                {
                  role: Roles.Auditor,
                  unitId: null,
                },
              ],
              tenantId: "tenant_second",
              unitIds: [],
            },
          ]
        : []),
    ],
    user: {
      displayName: "Waiter Demo",
      id: "user_demo",
      syntheticEmail: "waiter.demo@mrcoti.local",
    },
  };
}

function trustedContext(): TrustedTenantContext {
  const resolution = new TenantContextGuard().resolve({
    authentication: authenticatedContext(),
    selectedTenantId: "tenant_demo",
    selectedUnitId: "unit_demo",
  });

  if (!resolution.authorized) {
    throw new Error("Expected trusted tenant context in test setup.");
  }

  return resolution.context;
}
