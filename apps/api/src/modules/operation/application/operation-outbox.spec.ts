import { describe, expect, it } from "@jest/globals";

import { InMemoryProductStore } from "../../catalog/api";
import { createCategory, createProduct, type Product } from "../../catalog/domain";
import { InMemoryIdempotencyStore, InMemoryOutboxStore } from "../../common/application";
import { DemoIds } from "../../local-demo";
import type { RestaurantTable, Tab } from "../domain";
import {
  AddOrderItemService,
  InMemoryOrderItemStore,
  InMemoryRestaurantTableStore,
  InMemoryTabStore,
  OpenTabService,
  type AddOrderItemResult,
  type OpenTabResult,
} from "./index";

const NOW = new Date("2026-08-14T12:00:00.000Z");

describe("operation outbox", () => {
  it("persists TabOpened once for a successful idempotent tab opening", () => {
    const outbox = new InMemoryOutboxStore();
    const tables = new InMemoryRestaurantTableStore();
    const service = new OpenTabService(
      tables,
      new InMemoryTabStore(),
      new InMemoryIdempotencyStore(),
      outbox,
    );
    tables.save(tableFixture());

    const first = service.open({
      actorId: DemoIds.waiterUser,
      causationId: "req-open-tab",
      correlationId: "corr-open-tab",
      idempotencyKey: "open-tab-outbox",
      tableId: "table_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const replay = service.open({
      actorId: DemoIds.waiterUser,
      causationId: "req-open-tab",
      correlationId: "corr-open-tab",
      idempotencyKey: "open-tab-outbox",
      tableId: "table_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expectOpened(first);
    expect(replay).toEqual(first);
    expect(outbox.list()).toEqual([
      expect.objectContaining({
        aggregateId: first.tab.id,
        aggregateType: "Tab",
        aggregateVersion: 1,
        attemptCount: 0,
        causationId: "req-open-tab",
        correlationId: "corr-open-tab",
        eventId: expect.any(String),
        eventName: "TabOpened",
        eventVersion: 1,
        lastError: null,
        nextAttemptAt: null,
        payload: {
          actorId: DemoIds.waiterUser,
          tableId: "table_demo",
          tabId: first.tab.id,
          tenantId: DemoIds.tenant,
          unitId: DemoIds.unit,
        },
        producer: "operation",
        publishedAt: null,
        status: "PENDING",
        tenantId: DemoIds.tenant,
      }),
    ]);
  });

  it("persists OrderItemAdded once with a minimal non-sensitive payload", () => {
    const outbox = new InMemoryOutboxStore();
    const tabs = new InMemoryTabStore();
    const products = new InMemoryProductStore();
    const service = new AddOrderItemService(
      tabs,
      products,
      new InMemoryOrderItemStore(),
      new InMemoryIdempotencyStore(),
      outbox,
    );
    tabs.save(tabFixture());
    const product = productFixture();
    products.save(product);

    const first = service.add({
      actorId: DemoIds.waiterUser,
      causationId: "req-add-item",
      correlationId: "corr-add-item",
      idempotencyKey: "add-item-outbox",
      productId: product.id,
      quantity: 2,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    const replay = service.add({
      actorId: DemoIds.waiterUser,
      causationId: "req-add-item",
      correlationId: "corr-add-item",
      idempotencyKey: "add-item-outbox",
      productId: product.id,
      quantity: 2,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });

    expectAdded(first);
    expect(replay).toEqual(first);
    expect(outbox.list()).toEqual([
      expect.objectContaining({
        aggregateId: "tab_demo",
        aggregateType: "Tab",
        causationId: "req-add-item",
        correlationId: "corr-add-item",
        eventName: "OrderItemAdded",
        eventVersion: 1,
        payload: {
          itemId: first.item.id,
          productId: product.id,
          quantity: 2,
          tabId: "tab_demo",
          tenantId: DemoIds.tenant,
          unitId: DemoIds.unit,
          unitPriceCents: 750,
        },
        producer: "operation",
        status: "PENDING",
        tenantId: DemoIds.tenant,
      }),
    ]);
    expect(outbox.list()[0]?.payload).not.toHaveProperty("productNameSnapshot");
  });
});

function tableFixture(): RestaurantTable {
  return {
    code: "M01",
    createdAt: NOW,
    id: "table_demo",
    status: "AVAILABLE",
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
    updatedAt: NOW,
  };
}

function tabFixture(): Tab {
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
  };
}

function productFixture(): Product {
  const category = createCategory({
    id: "category_demo",
    name: "Bebidas",
    now: NOW,
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
  });

  return createProduct({
    category,
    id: "product_demo",
    name: "Café",
    now: NOW,
    priceCents: 750,
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
  });
}

function expectOpened(
  result: OpenTabResult,
): asserts result is Extract<OpenTabResult, { readonly status: "OPENED" }> {
  expect(result.status).toBe("OPENED");

  if (result.status !== "OPENED") {
    throw new Error(`Expected OPENED, got ${result.status}.`);
  }
}

function expectAdded(
  result: AddOrderItemResult,
): asserts result is Extract<AddOrderItemResult, { readonly status: "ADDED" }> {
  expect(result.status).toBe("ADDED");

  if (result.status !== "ADDED") {
    throw new Error(`Expected ADDED, got ${result.status}.`);
  }
}
