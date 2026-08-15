import { describe, expect, it } from "@jest/globals";

import type { OrderItem } from "./index";
import {
  BillCalculationCodes,
  BillCalculationViolation,
  BillingCalculationLimits,
  calculateBill,
} from "./index";

const NOW = new Date("2026-08-14T12:00:00.000Z");

describe("bill calculation", () => {
  it("calculates subtotal, discount, service fee, total, paid and balance in cents", () => {
    const calculation = calculateBill({
      discountCents: 500,
      items: [
        orderItemFixture({
          id: "item_cafe",
          quantity: 2,
          unitPriceCents: 750,
        }),
        orderItemFixture({
          id: "item_bolo",
          quantity: 1,
          unitPriceCents: 1_200,
        }),
      ],
      paidCents: 2_000,
      serviceFeeCents: 270,
    });

    expect(calculation).toEqual({
      balanceCents: 470,
      discountCents: 500,
      paidCents: 2_000,
      serviceFeeCents: 270,
      subtotalCents: 2_700,
      totalCents: 2_470,
    });
  });

  it("ignores cancelled items and keeps zero defaults explicit", () => {
    const calculation = calculateBill({
      items: [
        orderItemFixture({
          id: "item_active",
          quantity: 1,
          unitPriceCents: 1_500,
        }),
        orderItemFixture({
          id: "item_cancelled",
          quantity: 3,
          status: "CANCELLED",
          unitPriceCents: 900,
        }),
      ],
    });

    expect(calculation).toEqual({
      balanceCents: 1_500,
      discountCents: 0,
      paidCents: 0,
      serviceFeeCents: 0,
      subtotalCents: 1_500,
      totalCents: 1_500,
    });
  });

  it("allows exact payment with zero balance", () => {
    expect(
      calculateBill({
        discountCents: 100,
        items: [
          orderItemFixture({
            quantity: 2,
            unitPriceCents: 800,
          }),
        ],
        paidCents: 1_600,
        serviceFeeCents: 100,
      }),
    ).toMatchObject({
      balanceCents: 0,
      paidCents: 1_600,
      totalCents: 1_600,
    });
  });

  it("rejects fractional, negative and overflowing adjustment cents", () => {
    for (const invalidCents of [-1, 1.25, BillingCalculationLimits.maxCents + 1]) {
      expectBillCalculationViolation(
        () =>
          calculateBill({
            discountCents: invalidCents,
            items: [orderItemFixture()],
          }),
        BillCalculationCodes.InvalidCents,
      );
    }
  });

  it("rejects invalid order item quantities and unit prices", () => {
    expectBillCalculationViolation(
      () =>
        calculateBill({
          items: [
            orderItemFixture({
              quantity: 0,
            }),
          ],
        }),
      BillCalculationCodes.InvalidOrderItemQuantity,
    );

    expectBillCalculationViolation(
      () =>
        calculateBill({
          items: [
            orderItemFixture({
              unitPriceCents: 10.5,
            }),
          ],
        }),
      BillCalculationCodes.InvalidOrderItemUnitPriceCents,
    );
  });

  it("rejects line, subtotal and total overflow", () => {
    expectBillCalculationViolation(
      () =>
        calculateBill({
          items: [
            orderItemFixture({
              quantity: 2,
              unitPriceCents: BillingCalculationLimits.maxCents,
            }),
          ],
        }),
      BillCalculationCodes.InvalidLineTotalCents,
    );

    expectBillCalculationViolation(
      () =>
        calculateBill({
          items: [
            orderItemFixture({
              id: "item_a",
              quantity: 1,
              unitPriceCents: BillingCalculationLimits.maxCents,
            }),
            orderItemFixture({
              id: "item_b",
              quantity: 1,
              unitPriceCents: 1,
            }),
          ],
        }),
      BillCalculationCodes.InvalidLineTotalCents,
    );

    expectBillCalculationViolation(
      () =>
        calculateBill({
          items: [
            orderItemFixture({
              quantity: 1,
              unitPriceCents: BillingCalculationLimits.maxCents,
            }),
          ],
          serviceFeeCents: 1,
        }),
      BillCalculationCodes.InvalidTotalCents,
    );
  });

  it("rejects discount that makes total negative and paid amount above total", () => {
    expectBillCalculationViolation(
      () =>
        calculateBill({
          discountCents: 1_001,
          items: [
            orderItemFixture({
              quantity: 1,
              unitPriceCents: 1_000,
            }),
          ],
        }),
      BillCalculationCodes.InvalidTotalCents,
    );

    expectBillCalculationViolation(
      () =>
        calculateBill({
          items: [
            orderItemFixture({
              quantity: 1,
              unitPriceCents: 1_000,
            }),
          ],
          paidCents: 1_001,
        }),
      BillCalculationCodes.PaidAmountExceedsTotal,
    );
  });
});

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
    tenantId: "tenant_demo",
    unitId: "unit_demo",
    unitPriceCents: overrides.unitPriceCents ?? 1_000,
    updatedAt: NOW,
    ...overrides,
  };
}

function expectBillCalculationViolation(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error("Expected bill calculation violation.");
  } catch (error) {
    expect(error).toBeInstanceOf(BillCalculationViolation);
    expect((error as BillCalculationViolation).code).toBe(code);
  }
}
