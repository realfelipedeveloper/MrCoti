import { randomUUID } from "node:crypto";

import type { Product } from "../../catalog/domain";
import {
  IdempotencyFailureCodes,
  InMemoryIdempotencyStore,
  type InMemoryOutboxStore,
} from "../../common/application";
import type {
  IdentityUserId,
  OrderItemId,
  ProductId,
  TabId,
  TenantId,
  UnitId,
} from "../../common/domain";
import type { OrderItem } from "../domain";
import { InMemoryTabStore } from "./open-tab.service";

export const AddOrderItemFailureReasons = {
  IdempotencyPayloadConflict: "IDEMPOTENCY_PAYLOAD_CONFLICT",
  InvalidQuantity: "INVALID_QUANTITY",
  MissingIdempotencyKey: "MISSING_IDEMPOTENCY_KEY",
  ProductNotAvailable: "PRODUCT_NOT_AVAILABLE",
  ProductNotFound: "PRODUCT_NOT_FOUND",
  TabNotFound: "TAB_NOT_FOUND",
  TabNotOpen: "TAB_NOT_OPEN",
} as const;

export type AddOrderItemFailureReason =
  (typeof AddOrderItemFailureReasons)[keyof typeof AddOrderItemFailureReasons];

export const OrderItemMutationFailureReasons = {
  IdempotencyPayloadConflict: "IDEMPOTENCY_PAYLOAD_CONFLICT",
  InvalidCancelReason: "INVALID_CANCEL_REASON",
  InvalidQuantity: "INVALID_QUANTITY",
  ItemNotActive: "ITEM_NOT_ACTIVE",
  ItemNotFound: "ITEM_NOT_FOUND",
  MissingIdempotencyKey: "MISSING_IDEMPOTENCY_KEY",
  TabNotFound: "TAB_NOT_FOUND",
  TabNotOpen: "TAB_NOT_OPEN",
} as const;

export type OrderItemMutationFailureReason =
  (typeof OrderItemMutationFailureReasons)[keyof typeof OrderItemMutationFailureReasons];

export interface AddOrderItemCommand {
  readonly actorId: IdentityUserId;
  readonly causationId?: string | null;
  readonly correlationId?: string | null;
  readonly idempotencyKey: string | null;
  readonly productId: ProductId;
  readonly quantity: number;
  readonly tabId: TabId;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export type AddOrderItemResult =
  | {
      readonly item: OrderItem;
      readonly status: "ADDED";
    }
  | {
      readonly reason: AddOrderItemFailureReason;
      readonly status: "DENIED";
    };

export interface ChangeOrderItemQuantityCommand {
  readonly actorId: IdentityUserId;
  readonly idempotencyKey: string | null;
  readonly itemId: OrderItemId;
  readonly quantity: number;
  readonly tabId: TabId;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export interface OrderItemMutationDenied {
  readonly reason: OrderItemMutationFailureReason;
  readonly status: "DENIED";
}

export type ChangeOrderItemQuantityResult =
  | {
      readonly item: OrderItem;
      readonly status: "UPDATED";
    }
  | OrderItemMutationDenied;

export interface CancelOrderItemCommand {
  readonly actorId: IdentityUserId;
  readonly idempotencyKey: string | null;
  readonly itemId: OrderItemId;
  readonly reason: string;
  readonly tabId: TabId;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export type CancelOrderItemResult =
  | {
      readonly item: OrderItem;
      readonly status: "CANCELLED";
    }
  | OrderItemMutationDenied;

export interface ProductSnapshotLookup {
  find(tenantId: TenantId, unitId: UnitId, productId: ProductId): Product | null;
}

export class AddOrderItemService {
  constructor(
    private readonly tabs: InMemoryTabStore,
    private readonly products: ProductSnapshotLookup,
    private readonly orderItems: InMemoryOrderItemStore,
    private readonly idempotency: InMemoryIdempotencyStore,
    private readonly outbox: InMemoryOutboxStore | null = null,
  ) {}

  add(command: AddOrderItemCommand): AddOrderItemResult {
    if (!command.idempotencyKey) {
      return denied(AddOrderItemFailureReasons.MissingIdempotencyKey);
    }

    const scope = `tenant:${command.tenantId}:unit:${command.unitId}:tabs:${command.tabId}:items.add`;
    const result = this.idempotency.resolve(
      scope,
      command.idempotencyKey,
      {
        actorId: command.actorId,
        productId: command.productId,
        quantity: command.quantity,
        tabId: command.tabId,
        tenantId: command.tenantId,
        unitId: command.unitId,
      },
      () => this.addOnce(command),
    );

    if (result.status === "CONFLICT") {
      return denied(IdempotencyFailureCodes.PayloadConflict);
    }

    return result.response;
  }

  changeQuantity(command: ChangeOrderItemQuantityCommand): ChangeOrderItemQuantityResult {
    if (!command.idempotencyKey) {
      return deniedMutation(OrderItemMutationFailureReasons.MissingIdempotencyKey);
    }

    const scope = `tenant:${command.tenantId}:unit:${command.unitId}:tabs:${command.tabId}:items:${command.itemId}:quantity.change`;
    const result = this.idempotency.resolve(scope, command.idempotencyKey, command, () =>
      this.changeQuantityOnce(command),
    );

    if (result.status === "CONFLICT") {
      return deniedMutation(IdempotencyFailureCodes.PayloadConflict);
    }

    return result.response;
  }

  cancel(command: CancelOrderItemCommand): CancelOrderItemResult {
    if (!command.idempotencyKey) {
      return deniedMutation(OrderItemMutationFailureReasons.MissingIdempotencyKey);
    }

    const scope = `tenant:${command.tenantId}:unit:${command.unitId}:tabs:${command.tabId}:items:${command.itemId}:cancel`;
    const result = this.idempotency.resolve(scope, command.idempotencyKey, command, () =>
      this.cancelOnce(command),
    );

    if (result.status === "CONFLICT") {
      return deniedMutation(IdempotencyFailureCodes.PayloadConflict);
    }

    return result.response;
  }

  private addOnce(command: AddOrderItemCommand): AddOrderItemResult {
    if (!isValidQuantity(command.quantity)) {
      return denied(AddOrderItemFailureReasons.InvalidQuantity);
    }

    const tab = this.tabs.find(command.tenantId, command.unitId, command.tabId);

    if (!tab) {
      return denied(AddOrderItemFailureReasons.TabNotFound);
    }

    if (tab.status !== "OPEN") {
      return denied(AddOrderItemFailureReasons.TabNotOpen);
    }

    const product = this.products.find(command.tenantId, command.unitId, command.productId);

    if (!product) {
      return denied(AddOrderItemFailureReasons.ProductNotFound);
    }

    if (product.status !== "AVAILABLE") {
      return denied(AddOrderItemFailureReasons.ProductNotAvailable);
    }

    const now = new Date();
    const item: OrderItem = {
      cancelReason: null,
      createdAt: now,
      id: randomUUID(),
      productId: product.id,
      productNameSnapshot: product.name,
      quantity: command.quantity,
      status: "ACTIVE",
      tabId: tab.id,
      tenantId: command.tenantId,
      unitId: command.unitId,
      unitPriceCents: product.priceCents,
      updatedAt: now,
    };

    this.orderItems.save(item);
    this.outbox?.append({
      aggregateId: item.tabId,
      aggregateType: "Tab",
      causationId: command.causationId ?? command.idempotencyKey ?? item.id,
      correlationId: command.correlationId ?? command.idempotencyKey ?? item.id,
      eventName: "OrderItemAdded",
      eventVersion: 1,
      now,
      payload: {
        itemId: item.id,
        productId: item.productId,
        quantity: item.quantity,
        tabId: item.tabId,
        tenantId: item.tenantId,
        unitId: item.unitId,
        unitPriceCents: item.unitPriceCents,
      },
      producer: "operation",
      tenantId: item.tenantId,
    });

    return {
      item,
      status: "ADDED",
    };
  }

  private changeQuantityOnce(
    command: ChangeOrderItemQuantityCommand,
  ): ChangeOrderItemQuantityResult {
    if (!isValidQuantity(command.quantity)) {
      return deniedMutation(OrderItemMutationFailureReasons.InvalidQuantity);
    }

    const tabResult = this.ensureOpenTab(command);

    if (tabResult.status === "DENIED") {
      return tabResult;
    }

    const item = this.orderItems.findInTab(
      command.tenantId,
      command.unitId,
      command.tabId,
      command.itemId,
    );

    if (!item) {
      return deniedMutation(OrderItemMutationFailureReasons.ItemNotFound);
    }

    if (item.status !== "ACTIVE") {
      return deniedMutation(OrderItemMutationFailureReasons.ItemNotActive);
    }

    const updatedItem: OrderItem = {
      ...item,
      quantity: command.quantity,
      updatedAt: new Date(),
    };

    this.orderItems.save(updatedItem);

    return {
      item: updatedItem,
      status: "UPDATED",
    };
  }

  private cancelOnce(command: CancelOrderItemCommand): CancelOrderItemResult {
    const cancelReason = normalizeCancelReason(command.reason);

    if (!cancelReason) {
      return deniedMutation(OrderItemMutationFailureReasons.InvalidCancelReason);
    }

    const tabResult = this.ensureOpenTab(command);

    if (tabResult.status === "DENIED") {
      return tabResult;
    }

    const item = this.orderItems.findInTab(
      command.tenantId,
      command.unitId,
      command.tabId,
      command.itemId,
    );

    if (!item) {
      return deniedMutation(OrderItemMutationFailureReasons.ItemNotFound);
    }

    if (item.status !== "ACTIVE") {
      return deniedMutation(OrderItemMutationFailureReasons.ItemNotActive);
    }

    const cancelledItem: OrderItem = {
      ...item,
      cancelReason,
      status: "CANCELLED",
      updatedAt: new Date(),
    };

    this.orderItems.save(cancelledItem);

    return {
      item: cancelledItem,
      status: "CANCELLED",
    };
  }

  private ensureOpenTab(command: {
    readonly tabId: TabId;
    readonly tenantId: TenantId;
    readonly unitId: UnitId;
  }): { readonly status: "ALLOWED" } | OrderItemMutationDenied {
    const tab = this.tabs.find(command.tenantId, command.unitId, command.tabId);

    if (!tab) {
      return deniedMutation(OrderItemMutationFailureReasons.TabNotFound);
    }

    if (tab.status !== "OPEN") {
      return deniedMutation(OrderItemMutationFailureReasons.TabNotOpen);
    }

    return {
      status: "ALLOWED",
    };
  }
}

export class InMemoryOrderItemStore {
  private readonly orderItems = new Map<string, OrderItem>();

  find(tenantId: TenantId, unitId: UnitId, itemId: OrderItemId): OrderItem | null {
    const item = this.orderItems.get(itemId);

    if (!item || item.tenantId !== tenantId || item.unitId !== unitId) {
      return null;
    }

    return item;
  }

  findInTab(
    tenantId: TenantId,
    unitId: UnitId,
    tabId: TabId,
    itemId: OrderItemId,
  ): OrderItem | null {
    const item = this.find(tenantId, unitId, itemId);

    if (!item || item.tabId !== tabId) {
      return null;
    }

    return item;
  }

  listByTab(tenantId: TenantId, unitId: UnitId, tabId: TabId): OrderItem[] {
    return [...this.orderItems.values()]
      .filter((item) => item.tenantId === tenantId && item.unitId === unitId)
      .filter((item) => item.tabId === tabId)
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  }

  save(item: OrderItem): void {
    this.orderItems.set(item.id, item);
  }
}

function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 99;
}

function normalizeCancelReason(reason: string): string | null {
  const normalized = reason.trim();

  if (normalized.length < 3 || normalized.length > 160) {
    return null;
  }

  return normalized;
}

function denied(reason: AddOrderItemFailureReason): AddOrderItemResult {
  return {
    reason,
    status: "DENIED",
  };
}

function deniedMutation(reason: OrderItemMutationFailureReason): OrderItemMutationDenied {
  return {
    reason,
    status: "DENIED",
  };
}
