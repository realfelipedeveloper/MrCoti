import { describe, expect, it } from "@jest/globals";

import { InMemoryProductStore } from "../../catalog/api";
import { createCategory, createProduct, type Product } from "../../catalog/domain";
import { InMemoryIdempotencyStore } from "../../common/application";
import { DemoIds } from "../../local-demo";
import type { Tab } from "../domain";
import {
  AddOrderItemFailureReasons,
  AddOrderItemService,
  InMemoryOrderItemStore,
  InMemoryTabStore,
  OrderItemMutationFailureReasons,
  type AddOrderItemResult,
  type CancelOrderItemResult,
  type ChangeOrderItemQuantityResult,
} from "./index";

const NOW = new Date("2026-07-11T12:00:00.000Z");

describe("AddOrderItemService", () => {
  it("adds an active item with an immutable product name and price snapshot", () => {
    const { items, products, service, tabs } = createService();
    tabs.save(tabFixture());
    const product = productFixture({
      name: "Café Coado",
      priceCents: 750,
    });
    products.save(product);

    const result = service.add({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "add-item-snapshot",
      productId: product.id,
      quantity: 2,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expectAdded(result);
    expect(result.item).toMatchObject({
      cancelReason: null,
      productId: product.id,
      productNameSnapshot: "Café Coado",
      quantity: 2,
      status: "ACTIVE",
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
      unitPriceCents: 750,
    });

    products.save({
      ...product,
      name: "Café Coado Promocional",
      priceCents: 990,
      updatedAt: new Date("2026-07-11T12:05:00.000Z"),
    });

    expect(items.find(DemoIds.tenant, DemoIds.unit, result.item.id)).toMatchObject({
      productNameSnapshot: "Café Coado",
      unitPriceCents: 750,
    });
    expect(items.listByTab(DemoIds.tenant, DemoIds.unit, "tab_demo")).toHaveLength(1);
  });

  it("replays the same idempotency key and rejects divergent payload", () => {
    const { products, service, tabs } = createService();
    tabs.save(tabFixture());
    const product = productFixture();
    products.save(product);

    const first = service.add({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "add-item-replay",
      productId: product.id,
      quantity: 1,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const replay = service.add({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "add-item-replay",
      productId: product.id,
      quantity: 1,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const conflict = service.add({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "add-item-replay",
      productId: product.id,
      quantity: 2,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expect(replay).toEqual(first);
    expect(conflict).toEqual({
      reason: AddOrderItemFailureReasons.IdempotencyPayloadConflict,
      status: "DENIED",
    });
  });

  it("rejects missing idempotency key, invalid quantity and non-open tab", () => {
    const { products, service, tabs } = createService();
    tabs.save(tabFixture({ status: "CLOSING" }));
    const product = productFixture();
    products.save(product);

    expect(
      service.add({
        actorId: DemoIds.waiterUser,
        idempotencyKey: null,
        productId: product.id,
        quantity: 1,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: AddOrderItemFailureReasons.MissingIdempotencyKey,
      status: "DENIED",
    });
    expect(
      service.add({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "add-item-invalid-quantity",
        productId: product.id,
        quantity: 0,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: AddOrderItemFailureReasons.InvalidQuantity,
      status: "DENIED",
    });
    expect(
      service.add({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "add-item-closing-tab",
        productId: product.id,
        quantity: 1,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: AddOrderItemFailureReasons.TabNotOpen,
      status: "DENIED",
    });
  });

  it("rejects cross-tenant tabs and unavailable or cross-tenant products", () => {
    const { products, service, tabs } = createService();
    tabs.save(tabFixture());
    products.save(productFixture({ status: "UNAVAILABLE" }));
    products.save(
      productFixture({
        id: "product_other_tenant",
        tenantId: "tenant_other",
      }),
    );

    expect(
      service.add({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "add-item-other-tenant-tab",
        productId: "product_demo",
        quantity: 1,
        tabId: "tab_demo",
        tenantId: "tenant_other",
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: AddOrderItemFailureReasons.TabNotFound,
      status: "DENIED",
    });
    expect(
      service.add({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "add-item-unavailable-product",
        productId: "product_demo",
        quantity: 1,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: AddOrderItemFailureReasons.ProductNotAvailable,
      status: "DENIED",
    });
    expect(
      service.add({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "add-item-other-tenant-product",
        productId: "product_other_tenant",
        quantity: 1,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: AddOrderItemFailureReasons.ProductNotFound,
      status: "DENIED",
    });
  });

  it("changes quantity for an active item while preserving its product snapshot", () => {
    const { items, service } = createReadyServiceWithItem();
    const added = addActiveItem(service, {
      idempotencyKey: "add-item-before-quantity-change",
      quantity: 1,
    });

    const result = service.changeQuantity({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "change-item-quantity",
      itemId: added.item.id,
      quantity: 3,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expectUpdated(result);
    expect(result.item).toMatchObject({
      cancelReason: null,
      productNameSnapshot: added.item.productNameSnapshot,
      quantity: 3,
      status: "ACTIVE",
      unitPriceCents: added.item.unitPriceCents,
    });
    expect(items.find(DemoIds.tenant, DemoIds.unit, added.item.id)).toEqual(result.item);
  });

  it("cancels an active item with a trimmed reason and keeps it in history", () => {
    const { items, service } = createReadyServiceWithItem();
    const added = addActiveItem(service, {
      idempotencyKey: "add-item-before-cancel",
      quantity: 2,
    });

    const result = service.cancel({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "cancel-item",
      itemId: added.item.id,
      reason: "  Cliente desistiu  ",
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const replay = service.cancel({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "cancel-item",
      itemId: added.item.id,
      reason: "  Cliente desistiu  ",
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const conflict = service.cancel({
      actorId: DemoIds.waiterUser,
      idempotencyKey: "cancel-item",
      itemId: added.item.id,
      reason: "Motivo diferente",
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expectCancelled(result);
    expect(result.item).toMatchObject({
      cancelReason: "Cliente desistiu",
      productNameSnapshot: added.item.productNameSnapshot,
      quantity: 2,
      status: "CANCELLED",
      unitPriceCents: added.item.unitPriceCents,
    });
    expect(replay).toEqual(result);
    expect(conflict).toEqual({
      reason: OrderItemMutationFailureReasons.IdempotencyPayloadConflict,
      status: "DENIED",
    });
    expect(items.listByTab(DemoIds.tenant, DemoIds.unit, "tab_demo")).toContainEqual(result.item);
  });

  it("rejects invalid item mutations", () => {
    const { service, tabs } = createReadyServiceWithItem();
    const added = addActiveItem(service, {
      idempotencyKey: "add-item-before-invalid-mutations",
      quantity: 1,
    });

    expect(
      service.changeQuantity({
        actorId: DemoIds.waiterUser,
        idempotencyKey: null,
        itemId: added.item.id,
        quantity: 2,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OrderItemMutationFailureReasons.MissingIdempotencyKey,
      status: "DENIED",
    });
    expect(
      service.changeQuantity({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "change-item-invalid-quantity",
        itemId: added.item.id,
        quantity: 100,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OrderItemMutationFailureReasons.InvalidQuantity,
      status: "DENIED",
    });
    expect(
      service.cancel({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "cancel-item-invalid-reason",
        itemId: added.item.id,
        reason: "  ",
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OrderItemMutationFailureReasons.InvalidCancelReason,
      status: "DENIED",
    });

    tabs.save(tabFixture({ status: "CLOSED" }));
    expect(
      service.changeQuantity({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "change-item-closed-tab",
        itemId: added.item.id,
        quantity: 2,
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OrderItemMutationFailureReasons.TabNotOpen,
      status: "DENIED",
    });

    tabs.save(tabFixture());
    expectCancelled(
      service.cancel({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "cancel-item-before-recancel",
        itemId: added.item.id,
        reason: "Cliente desistiu",
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    );
    expect(
      service.cancel({
        actorId: DemoIds.waiterUser,
        idempotencyKey: "cancel-item-already-cancelled",
        itemId: added.item.id,
        reason: "Gerente solicitou",
        tabId: "tab_demo",
        tenantId: DemoIds.tenant,
        unitId: DemoIds.unit,
      }),
    ).toEqual({
      reason: OrderItemMutationFailureReasons.ItemNotActive,
      status: "DENIED",
    });
  });
});

function createService(): {
  readonly items: InMemoryOrderItemStore;
  readonly products: InMemoryProductStore;
  readonly service: AddOrderItemService;
  readonly tabs: InMemoryTabStore;
} {
  const tabs = new InMemoryTabStore();
  const products = new InMemoryProductStore();
  const items = new InMemoryOrderItemStore();
  const service = new AddOrderItemService(tabs, products, items, new InMemoryIdempotencyStore());

  return {
    items,
    products,
    service,
    tabs,
  };
}

function createReadyServiceWithItem(): ReturnType<typeof createService> {
  const context = createService();
  context.tabs.save(tabFixture());
  context.products.save(productFixture());

  return context;
}

function addActiveItem(
  service: AddOrderItemService,
  input: {
    readonly idempotencyKey: string;
    readonly quantity: number;
  },
): Extract<AddOrderItemResult, { readonly status: "ADDED" }> {
  const result = service.add({
    actorId: DemoIds.waiterUser,
    idempotencyKey: input.idempotencyKey,
    productId: "product_demo",
    quantity: input.quantity,
    tabId: "tab_demo",
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
  });

  expectAdded(result);

  return result;
}

function tabFixture(overrides: Partial<Tab> = {}): Tab {
  return {
    closedAt: null,
    createdAt: NOW,
    id: "tab_demo",
    openedBy: DemoIds.waiterUser,
    status: "OPEN",
    tableId: "table_demo",
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
    updatedAt: NOW,
    ...overrides,
  };
}

function productFixture(overrides: Partial<Product> = {}): Product {
  const tenantId = overrides.tenantId ?? DemoIds.tenant;
  const unitId = overrides.unitId ?? DemoIds.unit;
  const category = createCategory({
    id: "category_demo",
    name: "Bebidas",
    now: NOW,
    tenantId,
    unitId,
  });

  return createProduct({
    category,
    id: overrides.id ?? "product_demo",
    name: overrides.name ?? "Café",
    now: NOW,
    priceCents: overrides.priceCents ?? 750,
    status: overrides.status ?? "AVAILABLE",
    tenantId,
    unitId,
  });
}

function expectAdded(
  result: AddOrderItemResult,
): asserts result is Extract<AddOrderItemResult, { readonly status: "ADDED" }> {
  expect(result.status).toBe("ADDED");

  if (result.status !== "ADDED") {
    throw new Error(`Expected ADDED, got ${result.status}.`);
  }
}

function expectUpdated(
  result: ChangeOrderItemQuantityResult,
): asserts result is Extract<ChangeOrderItemQuantityResult, { readonly status: "UPDATED" }> {
  expect(result.status).toBe("UPDATED");

  if (result.status !== "UPDATED") {
    throw new Error(`Expected UPDATED, got ${result.status}.`);
  }
}

function expectCancelled(
  result: CancelOrderItemResult,
): asserts result is Extract<CancelOrderItemResult, { readonly status: "CANCELLED" }> {
  expect(result.status).toBe("CANCELLED");

  if (result.status !== "CANCELLED") {
    throw new Error(`Expected CANCELLED, got ${result.status}.`);
  }
}
