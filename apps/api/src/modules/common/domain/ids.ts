export type EntityId = string;

export type IdentityUserId = EntityId;
export type TenantId = EntityId;
export type CompanyId = EntityId;
export type UnitId = EntityId;
export type MembershipId = EntityId;
export type RoleAssignmentId = EntityId;
export type CategoryId = EntityId;
export type ProductId = EntityId;
export type AuditEntryId = EntityId;
export type RestaurantTableId = EntityId;
export type TabId = EntityId;
export type OrderItemId = EntityId;
export type BillId = EntityId;
export type FakePaymentId = EntityId;

export interface Timestamped {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TenantScoped {
  readonly tenantId: TenantId;
}
