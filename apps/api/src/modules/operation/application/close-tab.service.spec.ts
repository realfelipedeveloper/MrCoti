import { describe, expect, it } from "@jest/globals";

import { DemoIds } from "../../local-demo";
import type { OrderItem, RestaurantTable, Tab } from "../domain";
import {
  CloseTabFailureReasons,
  CloseTabService,
  InMemoryBillStore,
  InMemoryFakePaymentStore,
  InMemoryOrderItemStore,
  InMemoryRestaurantTableStore,
  InMemoryTabStore,
  type CloseTabCommand,
  type CloseTabResult,
} from "./index";

const NOW = new Date("2026-08-14T12:00:00.000Z");

describe("CloseTabService", () => {
  it("closes an open tab with approved fake payment and releases the table atomically", () => {
    const context = createReadyContext();
    context.items.save(orderItemFixture({ id: "item_cafe", quantity: 2, unitPriceCents: 750 }));
    context.items.save(orderItemFixture({ id: "item_bolo", quantity: 1, unitPriceCents: 1_200 }));
    context.items.save(
      orderItemFixture({
        id: "item_cancelado",
        quantity: 1,
        status: "CANCELLED",
        unitPriceCents: 9_999,
      }),
    );

    const result = context.service.close({
      ...closeCommandFixture(),
      discountCents: 500,
      payment: {
        amountCents: 2_470,
        method: "CARD_FAKE",
        scenario: "APPROVED",
      },
      serviceFeeCents: 270,
    });

    expectClosed(result);
    expect(result.bill).toMatchObject({
      discountCents: 500,
      paidCents: 2_470,
      serviceFeeCents: 270,
      status: "CLOSED",
      subtotalCents: 2_700,
      tabId: "tab_demo",
      tenantId: DemoIds.tenant,
      totalCents: 2_470,
      unitId: DemoIds.unit,
    });
    expect(result.payment).toMatchObject({
      amountCents: 2_470,
      billId: result.bill.id,
      fake: true,
      method: "CARD_FAKE",
      scenario: "APPROVED",
      status: "RECORDED",
      tenantId: DemoIds.tenant,
      unitId: DemoIds.unit,
    });
    expect(result.tab).toMatchObject({
      closedAt: expect.any(Date),
      status: "CLOSED",
    });
    expect(result.table.status).toBe("AVAILABLE");
    expect(context.tabs.find(DemoIds.tenant, DemoIds.unit, "tab_demo")).toMatchObject({
      status: "CLOSED",
    });
    expect(context.tables.find(DemoIds.tenant, DemoIds.unit, "table_demo")).toMatchObject({
      status: "AVAILABLE",
    });
    expect(context.bills.findByTab(DemoIds.tenant, DemoIds.unit, "tab_demo")).toEqual(result.bill);
    expect(context.payments.listByBill(DemoIds.tenant, DemoIds.unit, result.bill.id)).toEqual([
      result.payment,
    ]);
  });

  it("records declined fake payment as consultable failed bill without closing tab", () => {
    const context = createReadyContext();
    context.items.save(orderItemFixture({ quantity: 1, unitPriceCents: 1_000 }));

    const result = context.service.close({
      ...closeCommandFixture(),
      payment: {
        amountCents: 1_000,
        method: "CARD_FAKE",
        scenario: "DECLINED",
      },
    });

    expectPaymentFailed(result);
    expect(result).toMatchObject({
      bill: {
        paidCents: 0,
        status: "PAYMENT_FAILED",
        totalCents: 1_000,
      },
      payment: {
        amountCents: 1_000,
        fake: true,
        method: "CARD_FAKE",
        scenario: "DECLINED",
        status: "DECLINED",
      },
      reason: "PAYMENT_DECLINED",
      status: "PAYMENT_FAILED",
      tab: {
        status: "OPEN",
      },
      table: {
        status: "OCCUPIED",
      },
    });
    expect(context.tabs.find(DemoIds.tenant, DemoIds.unit, "tab_demo")).toMatchObject({
      closedAt: null,
      status: "OPEN",
    });
    expect(context.tables.find(DemoIds.tenant, DemoIds.unit, "table_demo")).toMatchObject({
      status: "OCCUPIED",
    });
    expect(context.bills.findByTab(DemoIds.tenant, DemoIds.unit, "tab_demo")).toEqual(result.bill);
  });

  it("records failed fake payment without duplicating a successful closing state", () => {
    const context = createReadyContext();
    context.items.save(orderItemFixture({ quantity: 1, unitPriceCents: 1_000 }));

    const result = context.service.close({
      ...closeCommandFixture(),
      payment: {
        amountCents: 1_000,
        method: "CASH_FAKE",
        scenario: "FAILED",
      },
    });

    expectPaymentFailed(result);
    expect(result).toMatchObject({
      bill: {
        paidCents: 0,
        status: "PAYMENT_FAILED",
      },
      payment: {
        method: "CASH_FAKE",
        scenario: "FAILED",
        status: "FAILED",
      },
      reason: "PAYMENT_FAILED",
    });
    expect(context.tabs.find(DemoIds.tenant, DemoIds.unit, "tab_demo")).toMatchObject({
      status: "OPEN",
    });
  });

  it("rejects missing, cross-tenant, non-open or empty tabs without persistence", () => {
    const missingContext = createContext();
    expect(missingContext.service.close(closeCommandFixture())).toEqual({
      reason: CloseTabFailureReasons.TabNotFound,
      status: "DENIED",
    });

    const crossTenantContext = createReadyContext();
    expect(
      crossTenantContext.service.close({
        ...closeCommandFixture(),
        tenantId: "tenant_other",
      }),
    ).toEqual({
      reason: CloseTabFailureReasons.TabNotFound,
      status: "DENIED",
    });

    const closedContext = createReadyContext({ tab: { status: "CLOSED" } });
    expect(closedContext.service.close(closeCommandFixture())).toEqual({
      reason: CloseTabFailureReasons.TabNotOpen,
      status: "DENIED",
    });

    const emptyContext = createReadyContext();
    expect(emptyContext.service.close(closeCommandFixture())).toEqual({
      reason: CloseTabFailureReasons.TabHasNoActiveItems,
      status: "DENIED",
    });
    expect(emptyContext.bills.findByTab(DemoIds.tenant, DemoIds.unit, "tab_demo")).toBeNull();
  });

  it("rejects amount mismatch, invalid calculation and invalid fake method without partial writes", () => {
    const mismatchContext = createReadyContext();
    mismatchContext.items.save(orderItemFixture({ quantity: 1, unitPriceCents: 1_000 }));
    expect(
      mismatchContext.service.close({
        ...closeCommandFixture(),
        payment: {
          amountCents: 900,
          method: "CARD_FAKE",
          scenario: "APPROVED",
        },
      }),
    ).toEqual({
      reason: CloseTabFailureReasons.PaymentAmountMismatch,
      status: "DENIED",
    });
    expectNoPartialWrite(mismatchContext);

    const invalidCalculationContext = createReadyContext();
    invalidCalculationContext.items.save(orderItemFixture({ quantity: 1, unitPriceCents: 1_000 }));
    expect(
      invalidCalculationContext.service.close({
        ...closeCommandFixture(),
        discountCents: 1_001,
      }),
    ).toEqual({
      reason: CloseTabFailureReasons.InvalidBillCalculation,
      status: "DENIED",
    });
    expectNoPartialWrite(invalidCalculationContext);

    const invalidPaymentContext = createReadyContext();
    invalidPaymentContext.items.save(orderItemFixture({ quantity: 1, unitPriceCents: 1_000 }));
    expect(
      invalidPaymentContext.service.close({
        ...closeCommandFixture(),
        payment: {
          amountCents: 1_000,
          method: "PIX" as unknown as CloseTabCommand["payment"]["method"],
          scenario: "APPROVED",
        },
      }),
    ).toEqual({
      reason: CloseTabFailureReasons.InvalidFakePayment,
      status: "DENIED",
    });
    expectNoPartialWrite(invalidPaymentContext);
  });

  it("rejects a second close attempt when a bill already exists for the tab", () => {
    const context = createReadyContext();
    context.items.save(orderItemFixture({ quantity: 1, unitPriceCents: 1_000 }));
    expectClosed(context.service.close(closeCommandFixture()));

    expect(context.service.close(closeCommandFixture())).toEqual({
      reason: CloseTabFailureReasons.TabNotOpen,
      status: "DENIED",
    });
  });
});

function createContext(): {
  readonly bills: InMemoryBillStore;
  readonly items: InMemoryOrderItemStore;
  readonly payments: InMemoryFakePaymentStore;
  readonly service: CloseTabService;
  readonly tables: InMemoryRestaurantTableStore;
  readonly tabs: InMemoryTabStore;
} {
  const tables = new InMemoryRestaurantTableStore();
  const tabs = new InMemoryTabStore();
  const items = new InMemoryOrderItemStore();
  const bills = new InMemoryBillStore();
  const payments = new InMemoryFakePaymentStore();

  return {
    bills,
    items,
    payments,
    service: new CloseTabService(tables, tabs, items, bills, payments),
    tables,
    tabs,
  };
}

function createReadyContext(
  overrides: { readonly tab?: Partial<Tab> } = {},
): ReturnType<typeof createContext> {
  const context = createContext();
  context.tables.save(tableFixture());
  context.tabs.save(tabFixture(overrides.tab));

  return context;
}

function closeCommandFixture(overrides: Partial<CloseTabCommand> = {}): CloseTabCommand {
  return {
    actorId: DemoIds.cashierUser,
    payment: {
      amountCents: 1_000,
      method: "CASH_FAKE",
      scenario: "APPROVED",
    },
    tabId: "tab_demo",
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
    ...overrides,
  };
}

function tableFixture(overrides: Partial<RestaurantTable> = {}): RestaurantTable {
  return {
    code: "M01",
    createdAt: NOW,
    id: "table_demo",
    status: "OCCUPIED",
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
    updatedAt: NOW,
    ...overrides,
  };
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

function orderItemFixture(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    cancelReason: null,
    createdAt: NOW,
    id: overrides.id ?? "item_demo",
    productId: "product_demo",
    productNameSnapshot: "Café Demo",
    quantity: overrides.quantity ?? 1,
    status: overrides.status ?? "ACTIVE",
    tabId: "tab_demo",
    tenantId: DemoIds.tenant,
    unitId: DemoIds.unit,
    unitPriceCents: overrides.unitPriceCents ?? 1_000,
    updatedAt: NOW,
    ...overrides,
  };
}

function expectClosed(
  result: CloseTabResult,
): asserts result is Extract<CloseTabResult, { readonly status: "CLOSED" }> {
  expect(result.status).toBe("CLOSED");

  if (result.status !== "CLOSED") {
    throw new Error(`Expected CLOSED, got ${result.status}.`);
  }
}

function expectPaymentFailed(
  result: CloseTabResult,
): asserts result is Extract<CloseTabResult, { readonly status: "PAYMENT_FAILED" }> {
  expect(result.status).toBe("PAYMENT_FAILED");

  if (result.status !== "PAYMENT_FAILED") {
    throw new Error(`Expected PAYMENT_FAILED, got ${result.status}.`);
  }
}

function expectNoPartialWrite(context: ReturnType<typeof createContext>): void {
  expect(context.bills.findByTab(DemoIds.tenant, DemoIds.unit, "tab_demo")).toBeNull();
  expect(context.tabs.find(DemoIds.tenant, DemoIds.unit, "tab_demo")).toMatchObject({
    closedAt: null,
    status: "OPEN",
  });
  expect(context.tables.find(DemoIds.tenant, DemoIds.unit, "table_demo")).toMatchObject({
    status: "OCCUPIED",
  });
}
