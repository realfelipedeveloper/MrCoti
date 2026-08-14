import { describe, expect, it } from "@jest/globals";

import {
  FakePaymentInvariantCodes,
  FakePaymentInvariantViolation,
  createFakePayment,
  transitionFakePaymentStatus,
} from "./index";

const NOW = new Date("2026-08-14T12:00:00.000Z");

describe("fake payment invariants", () => {
  it("creates an explicitly fake tenant-aware payment without real financial data", () => {
    const payment = createFakePayment({
      amountCents: 4_750,
      billId: "bill_demo",
      id: "fake_payment_demo",
      method: "CARD_FAKE",
      now: NOW,
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expect(payment).toEqual({
      amountCents: 4_750,
      billId: "bill_demo",
      createdAt: NOW,
      fake: true,
      id: "fake_payment_demo",
      method: "CARD_FAKE",
      scenario: "APPROVED",
      status: "REQUESTED",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
      updatedAt: NOW,
    });
  });

  it("rejects real financial fields even when nested in an unsafe payload", () => {
    expectFakePaymentViolation(
      () =>
        createFakePayment({
          amountCents: 4_750,
          billId: "bill_demo",
          cardNumber: "4111111111111111",
          id: "fake_payment_demo",
          method: "CARD_FAKE",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        } as unknown as Parameters<typeof createFakePayment>[0]),
      FakePaymentInvariantCodes.RealFinancialDataNotAllowed,
    );

    expectFakePaymentViolation(
      () =>
        createFakePayment({
          amountCents: 4_750,
          billId: "bill_demo",
          id: "fake_payment_demo",
          method: "CASH_FAKE",
          metadata: {
            pixKey: "cliente@example.com",
          },
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        } as unknown as Parameters<typeof createFakePayment>[0]),
      FakePaymentInvariantCodes.RealFinancialDataNotAllowed,
    );
  });

  it("accepts only fake methods, supported scenarios and integer cents", () => {
    expectFakePaymentViolation(
      () =>
        createFakePayment({
          amountCents: 1_000,
          billId: "bill_demo",
          id: "fake_payment_demo",
          method: "PIX",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      FakePaymentInvariantCodes.InvalidFakePaymentMethod,
    );

    expectFakePaymentViolation(
      () =>
        createFakePayment({
          amountCents: 1_000,
          billId: "bill_demo",
          id: "fake_payment_demo",
          method: "CARD_FAKE",
          scenario: "CHARGEBACK",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      FakePaymentInvariantCodes.InvalidFakePaymentScenario,
    );

    expectFakePaymentViolation(
      () =>
        createFakePayment({
          amountCents: -1,
          billId: "bill_demo",
          id: "fake_payment_demo",
          method: "CASH_FAKE",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      FakePaymentInvariantCodes.InvalidCents,
    );
  });

  it("allows only the fake payment state machine and records approved payments only", () => {
    const requested = createFakePayment({
      amountCents: 4_750,
      billId: "bill_demo",
      id: "fake_payment_demo",
      method: "CARD_FAKE",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    const approved = transitionFakePaymentStatus(requested, "APPROVED", NOW);
    const recorded = transitionFakePaymentStatus(approved, "RECORDED", NOW);

    expect(approved.status).toBe("APPROVED");
    expect(recorded.status).toBe("RECORDED");

    expectFakePaymentViolation(
      () => transitionFakePaymentStatus(requested, "RECORDED"),
      FakePaymentInvariantCodes.InvalidFakePaymentTransition,
    );

    const declined = createFakePayment({
      amountCents: 4_750,
      billId: "bill_demo",
      id: "fake_payment_declined",
      method: "CARD_FAKE",
      scenario: "DECLINED",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expectFakePaymentViolation(
      () => transitionFakePaymentStatus(declined, "APPROVED"),
      FakePaymentInvariantCodes.InvalidFakePaymentTransition,
    );

    expectFakePaymentViolation(
      () =>
        createFakePayment({
          amountCents: 4_750,
          billId: "bill_demo",
          id: "fake_payment_declined_recorded",
          method: "CARD_FAKE",
          scenario: "DECLINED",
          status: "RECORDED",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      FakePaymentInvariantCodes.RecordedPaymentRequiresApproval,
    );
  });
});

function expectFakePaymentViolation(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error("Expected fake payment invariant violation.");
  } catch (error) {
    expect(error).toBeInstanceOf(FakePaymentInvariantViolation);
    expect((error as FakePaymentInvariantViolation).code).toBe(code);
  }
}
