import type {
  AuditEntryId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";

export const CatalogAuditActions = {
  CategoryCreated: "catalog.category.created",
  CategoryDeactivated: "catalog.category.deactivated",
  CategoryUpdated: "catalog.category.updated",
  ProductCreated: "catalog.product.created",
  ProductDeactivated: "catalog.product.deactivated",
  ProductUpdated: "catalog.product.updated",
} as const;

export type CatalogAuditAction = (typeof CatalogAuditActions)[keyof typeof CatalogAuditActions];

export type AuditAction = CatalogAuditAction;

export type AuditResourceType = "Category" | "Product";

export interface AuditEntry extends TenantScoped, Timestamped {
  readonly action: AuditAction;
  readonly actorId: string;
  readonly after: Readonly<Record<string, unknown>> | null;
  readonly before: Readonly<Record<string, unknown>> | null;
  readonly correlationId: string;
  readonly id: AuditEntryId;
  readonly reason: string | null;
  readonly resourceId: string;
  readonly resourceType: AuditResourceType;
  readonly tenantId: TenantId;
  readonly unitId: UnitId | null;
}
