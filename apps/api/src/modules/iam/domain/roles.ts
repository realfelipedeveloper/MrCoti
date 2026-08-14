export const Roles = {
  TenantOwner: "TENANT_OWNER",
  UnitManager: "UNIT_MANAGER",
  Waiter: "WAITER",
  Cashier: "CASHIER",
  Auditor: "AUDITOR",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const MvpRoles = [
  Roles.TenantOwner,
  Roles.UnitManager,
  Roles.Waiter,
  Roles.Cashier,
  Roles.Auditor,
] as const satisfies readonly Role[];
