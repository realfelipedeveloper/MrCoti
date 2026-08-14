import type { TenantId, UnitId } from "../../common/domain";
import { Roles, type Role } from "../domain";

export const Permissions = {
  CatalogCategoryManage: "catalog.category.manage",
  CatalogCategoryRead: "catalog.category.read",
  CatalogProductManage: "catalog.product.manage",
  CatalogProductRead: "catalog.product.read",
  GovernanceAuditRead: "governance.audit.read",
  IamMembershipManage: "iam.membership.manage",
  IamRoleAssignmentManage: "iam.role-assignment.manage",
  IamSessionRead: "iam.session.read",
  OperationBillClose: "operation.bill.close",
  OperationBillRead: "operation.bill.read",
  OperationFakePaymentRecord: "operation.fake-payment.record",
  OperationOrderItemCancel: "operation.order-item.cancel",
  OperationOrderItemCreate: "operation.order-item.create",
  OperationOrderItemUpdate: "operation.order-item.update",
  OperationTabOpen: "operation.tab.open",
  OperationTabRead: "operation.tab.read",
  OperationTableManage: "operation.table.manage",
  OperationTableRead: "operation.table.read",
  OrganizationUnitList: "organization.unit.list",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const RbacDenialReasons = {
  PermissionDenied: "PERMISSION_DENIED",
  TenantContextRequired: "TENANT_CONTEXT_REQUIRED",
} as const;

export type RbacDenialReason = (typeof RbacDenialReasons)[keyof typeof RbacDenialReasons];

export interface RbacRoleContext {
  readonly role: Role;
  readonly unitId: UnitId | null;
}

export interface RbacTenantContext {
  readonly roles: readonly RbacRoleContext[];
  readonly tenantId: TenantId;
  readonly unitId: UnitId | null;
}

export interface AuthorizePermissionCommand {
  readonly context: RbacTenantContext | null;
  readonly permission: string;
}

export type RbacAuthorizationDecision =
  | {
      readonly allowed: true;
      readonly permissions: readonly Permission[];
    }
  | {
      readonly allowed: false;
      readonly reason: RbacDenialReason;
    };

const ALL_PERMISSIONS = [
  Permissions.CatalogCategoryManage,
  Permissions.CatalogCategoryRead,
  Permissions.CatalogProductManage,
  Permissions.CatalogProductRead,
  Permissions.GovernanceAuditRead,
  Permissions.IamMembershipManage,
  Permissions.IamRoleAssignmentManage,
  Permissions.IamSessionRead,
  Permissions.OperationBillClose,
  Permissions.OperationBillRead,
  Permissions.OperationFakePaymentRecord,
  Permissions.OperationOrderItemCancel,
  Permissions.OperationOrderItemCreate,
  Permissions.OperationOrderItemUpdate,
  Permissions.OperationTabOpen,
  Permissions.OperationTabRead,
  Permissions.OperationTableManage,
  Permissions.OperationTableRead,
  Permissions.OrganizationUnitList,
] as const satisfies readonly Permission[];

const ROLE_PERMISSIONS = {
  [Roles.Auditor]: [
    Permissions.CatalogCategoryRead,
    Permissions.CatalogProductRead,
    Permissions.GovernanceAuditRead,
    Permissions.IamSessionRead,
    Permissions.OperationBillRead,
    Permissions.OperationTabRead,
    Permissions.OperationTableRead,
    Permissions.OrganizationUnitList,
  ],
  [Roles.Cashier]: [
    Permissions.CatalogCategoryRead,
    Permissions.CatalogProductRead,
    Permissions.IamSessionRead,
    Permissions.OperationBillClose,
    Permissions.OperationBillRead,
    Permissions.OperationFakePaymentRecord,
    Permissions.OperationOrderItemCancel,
    Permissions.OperationOrderItemCreate,
    Permissions.OperationOrderItemUpdate,
    Permissions.OperationTabOpen,
    Permissions.OperationTabRead,
    Permissions.OperationTableRead,
    Permissions.OrganizationUnitList,
  ],
  [Roles.TenantOwner]: ALL_PERMISSIONS,
  [Roles.UnitManager]: [
    Permissions.CatalogCategoryManage,
    Permissions.CatalogCategoryRead,
    Permissions.CatalogProductManage,
    Permissions.CatalogProductRead,
    Permissions.GovernanceAuditRead,
    Permissions.IamSessionRead,
    Permissions.OperationBillClose,
    Permissions.OperationBillRead,
    Permissions.OperationFakePaymentRecord,
    Permissions.OperationOrderItemCancel,
    Permissions.OperationOrderItemCreate,
    Permissions.OperationOrderItemUpdate,
    Permissions.OperationTabOpen,
    Permissions.OperationTabRead,
    Permissions.OperationTableManage,
    Permissions.OperationTableRead,
    Permissions.OrganizationUnitList,
  ],
  [Roles.Waiter]: [
    Permissions.CatalogCategoryRead,
    Permissions.CatalogProductRead,
    Permissions.IamSessionRead,
    Permissions.OperationBillRead,
    Permissions.OperationOrderItemCancel,
    Permissions.OperationOrderItemCreate,
    Permissions.OperationOrderItemUpdate,
    Permissions.OperationTabOpen,
    Permissions.OperationTabRead,
    Permissions.OperationTableRead,
    Permissions.OrganizationUnitList,
  ],
} as const satisfies Record<Role, readonly Permission[]>;

const KNOWN_PERMISSIONS = new Set<string>(ALL_PERMISSIONS);

export class RbacPolicy {
  authorize(command: AuthorizePermissionCommand): RbacAuthorizationDecision {
    if (!command.context) {
      return denied(RbacDenialReasons.TenantContextRequired);
    }

    const permissions = this.listPermissions(command.context);

    if (!KNOWN_PERMISSIONS.has(command.permission)) {
      return denied(RbacDenialReasons.PermissionDenied);
    }

    if (!permissions.includes(command.permission as Permission)) {
      return denied(RbacDenialReasons.PermissionDenied);
    }

    return {
      allowed: true,
      permissions,
    };
  }

  listPermissions(context: RbacTenantContext): Permission[] {
    return uniquePermissions(
      context.roles.flatMap((roleContext) => ROLE_PERMISSIONS[roleContext.role] ?? []),
    );
  }
}

function uniquePermissions(permissions: readonly Permission[]): Permission[] {
  return [...new Set(permissions)].sort();
}

function denied(reason: RbacDenialReason): RbacAuthorizationDecision {
  return {
    allowed: false,
    reason,
  };
}
