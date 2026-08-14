import type {
  RestaurantTableId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";

export type RestaurantTableStatus = "AVAILABLE" | "OCCUPIED" | "BLOCKED";

export interface RestaurantTable extends TenantScoped, Timestamped {
  readonly code: string;
  readonly id: RestaurantTableId;
  readonly status: RestaurantTableStatus;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}
