import type {
  OrderItemId,
  ProductId,
  TabId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";

export type OrderItemStatus = "ACTIVE" | "CANCELLED";

export interface OrderItem extends TenantScoped, Timestamped {
  readonly cancelReason: string | null;
  readonly id: OrderItemId;
  readonly productId: ProductId;
  readonly productNameSnapshot: string;
  readonly quantity: number;
  readonly status: OrderItemStatus;
  readonly tabId: TabId;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
  readonly unitPriceCents: number;
}
