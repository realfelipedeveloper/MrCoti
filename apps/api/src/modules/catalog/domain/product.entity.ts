import type {
  CategoryId,
  ProductId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";

export type ProductStatus = "AVAILABLE" | "UNAVAILABLE" | "INACTIVE";

export interface Product extends TenantScoped, Timestamped {
  readonly categoryId: CategoryId;
  readonly id: ProductId;
  readonly name: string;
  readonly priceCents: number;
  readonly status: ProductStatus;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}
