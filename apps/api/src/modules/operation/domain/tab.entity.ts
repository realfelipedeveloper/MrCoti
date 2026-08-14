import type {
  IdentityUserId,
  RestaurantTableId,
  TabId,
  TenantId,
  TenantScoped,
  Timestamped,
  UnitId,
} from "../../common/domain";

export type TabStatus = "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";

export interface Tab extends TenantScoped, Timestamped {
  readonly closedAt: Date | null;
  readonly id: TabId;
  readonly openedBy: IdentityUserId;
  readonly status: TabStatus;
  readonly tableId: RestaurantTableId;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}
