import { describe, expect, it } from "@jest/globals";

import {
  BillInvariantCodes,
  BillInvariantViolation,
  createBill,
  transitionBillStatus,
} from "./index";

const NOW = new Date("2026-08-14T12:00:00.000Z");

describe("bill invariants", () => {
  it("creates a tenant-aware bill with integer cents and derived total", () => {
    const bill = createBill({
      discountCents: 500,
      id: "bill_demo",
      now: NOW,
      serviceFeeCents: 250,
      subtotalCents: 5_000,
      tabId: "tab_demo",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expect(bill).toEqual({
      createdAt: NOW,
      discountCents: 500,
      id: "bill_demo",
      paidCents: 0,
      serviceFeeCents: 250,
      status: "DRAFT",
      subtotalCents: 5_000,
      tabId: "tab_demo",
      tenantId: "tenant_demo",
      totalCents: 4_750,
      unitId: "unit_demo",
      updatedAt: NOW,
    });
  });

  it("rejects invalid cents, mismatched total and overpaid bill", () => {
    expectBillViolation(
      () =>
        createBill({
          id: "bill_demo",
          subtotalCents: 10.5,
          tabId: "tab_demo",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      BillInvariantCodes.InvalidCents,
    );

    expectBillViolation(
      () =>
        createBill({
          discountCents: 200,
          id: "bill_demo",
          subtotalCents: 1_000,
          tabId: "tab_demo",
          tenantId: "tenant_demo",
          totalCents: 900,
          unitId: "unit_demo",
        }),
      BillInvariantCodes.InvalidTotalCents,
    );

    expectBillViolation(
      () =>
        createBill({
          id: "bill_demo",
          paidCents: 1_001,
          subtotalCents: 1_000,
          tabId: "tab_demo",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      BillInvariantCodes.PaidAmountExceedsTotal,
    );
  });

  it("rejects missing tenant/unit, identifiers and unknown statuses", () => {
    expectBillViolation(
      () =>
        createBill({
          id: "bill_demo",
          subtotalCents: 1_000,
          tabId: "tab_demo",
          tenantId: "",
          unitId: "unit_demo",
        }),
      BillInvariantCodes.MissingTenantOrUnit,
    );

    expectBillViolation(
      () =>
        createBill({
          id: " ",
          subtotalCents: 1_000,
          tabId: "tab_demo",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      BillInvariantCodes.MissingIdentifier,
    );

    expectBillViolation(
      () =>
        createBill({
          id: "bill_demo",
          status: "REFUNDED",
          subtotalCents: 1_000,
          tabId: "tab_demo",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      BillInvariantCodes.InvalidBillStatus,
    );
  });

  it("allows only the approved bill state machine and requires full payment to close", () => {
    const draft = createBill({
      id: "bill_demo",
      paidCents: 1_000,
      subtotalCents: 1_000,
      tabId: "tab_demo",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    const pending = transitionBillStatus(draft, "PAYMENT_PENDING", NOW);
    const paid = transitionBillStatus(pending, "PAID", NOW);
    const closed = transitionBillStatus(paid, "CLOSED", NOW);

    expect(pending.status).toBe("PAYMENT_PENDING");
    expect(paid.status).toBe("PAID");
    expect(closed.status).toBe("CLOSED");

    expectBillViolation(
      () => transitionBillStatus(draft, "CLOSED"),
      BillInvariantCodes.InvalidBillTransition,
    );

    const partiallyPaid = transitionBillStatus(
      createBill({
        id: "bill_partial",
        paidCents: 500,
        subtotalCents: 1_000,
        tabId: "tab_demo",
        tenantId: "tenant_demo",
        unitId: "unit_demo",
      }),
      "PAYMENT_PENDING",
    );

    expectBillViolation(
      () => transitionBillStatus(partiallyPaid, "PAID"),
      BillInvariantCodes.BillRequiresFullPayment,
    );
  });
});

function expectBillViolation(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error("Expected bill invariant violation.");
  } catch (error) {
    expect(error).toBeInstanceOf(BillInvariantViolation);
    expect((error as BillInvariantViolation).code).toBe(code);
  }
}
