import { describe, expect, it } from "@jest/globals";

import { Roles } from "../domain";
import { Permissions, RbacDenialReasons, RbacPolicy, type RbacTenantContext } from "./index";

describe("RbacPolicy", () => {
  const policy = new RbacPolicy();

  it("denies by default without tenant context or for unknown permissions", () => {
    expect(
      policy.authorize({
        context: null,
        permission: Permissions.OperationTabOpen,
      }),
    ).toEqual({
      allowed: false,
      reason: RbacDenialReasons.TenantContextRequired,
    });

    expect(
      policy.authorize({
        context: tenantContext(Roles.TenantOwner),
        permission: "operation.hidden-admin.power",
      }),
    ).toEqual({
      allowed: false,
      reason: RbacDenialReasons.PermissionDenied,
    });
  });

  it("allows waiter operational actions but denies financial and catalog management actions", () => {
    const context = tenantContext(Roles.Waiter);

    expect(policy.authorize({ context, permission: Permissions.OperationTabOpen })).toMatchObject({
      allowed: true,
    });
    expect(
      policy.authorize({ context, permission: Permissions.OperationOrderItemCreate }),
    ).toMatchObject({
      allowed: true,
    });
    expect(policy.authorize({ context, permission: Permissions.OperationBillClose })).toEqual({
      allowed: false,
      reason: RbacDenialReasons.PermissionDenied,
    });
    expect(policy.authorize({ context, permission: Permissions.OperationTableManage })).toEqual({
      allowed: false,
      reason: RbacDenialReasons.PermissionDenied,
    });
    expect(policy.authorize({ context, permission: Permissions.CatalogProductManage })).toEqual({
      allowed: false,
      reason: RbacDenialReasons.PermissionDenied,
    });
  });

  it("allows cashier to close bills and record fake payments without catalog administration", () => {
    const context = tenantContext(Roles.Cashier);

    expect(policy.authorize({ context, permission: Permissions.OperationBillClose })).toMatchObject(
      {
        allowed: true,
      },
    );
    expect(policy.authorize({ context, permission: Permissions.OperationTableManage })).toEqual({
      allowed: false,
      reason: RbacDenialReasons.PermissionDenied,
    });
    expect(
      policy.authorize({ context, permission: Permissions.OperationFakePaymentRecord }),
    ).toMatchObject({
      allowed: true,
    });
    expect(policy.authorize({ context, permission: Permissions.CatalogCategoryManage })).toEqual({
      allowed: false,
      reason: RbacDenialReasons.PermissionDenied,
    });
  });

  it("allows unit manager to manage catalog and close bills", () => {
    const context = tenantContext(Roles.UnitManager);

    expect(
      policy.authorize({ context, permission: Permissions.CatalogProductManage }),
    ).toMatchObject({
      allowed: true,
    });
    expect(policy.authorize({ context, permission: Permissions.OperationBillClose })).toMatchObject(
      {
        allowed: true,
      },
    );
    expect(
      policy.authorize({ context, permission: Permissions.OperationTableManage }),
    ).toMatchObject({
      allowed: true,
    });
  });

  it("keeps auditor read-only for the local slice", () => {
    const context = tenantContext(Roles.Auditor);

    expect(
      policy.authorize({ context, permission: Permissions.GovernanceAuditRead }),
    ).toMatchObject({
      allowed: true,
    });
    expect(policy.authorize({ context, permission: Permissions.OperationTabRead })).toMatchObject({
      allowed: true,
    });
    expect(policy.authorize({ context, permission: Permissions.OperationOrderItemCreate })).toEqual(
      {
        allowed: false,
        reason: RbacDenialReasons.PermissionDenied,
      },
    );
  });

  it("deduplicates permissions when the context has multiple roles", () => {
    const permissions = policy.listPermissions({
      roles: [
        {
          role: Roles.Waiter,
          unitId: "unit_demo",
        },
        {
          role: Roles.Cashier,
          unitId: "unit_demo",
        },
      ],
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expect(permissions).toContain(Permissions.OperationTabOpen);
    expect(permissions).toContain(Permissions.OperationBillClose);
    expect(new Set(permissions).size).toBe(permissions.length);
  });
});

function tenantContext(role: RbacTenantContext["roles"][number]["role"]): RbacTenantContext {
  return {
    roles: [
      {
        role,
        unitId: "unit_demo",
      },
    ],
    tenantId: "tenant_demo",
    unitId: "unit_demo",
  };
}
