import { randomUUID } from "node:crypto";

import { createFakePayment, type FakePayment } from "../../fake-payments";
import type { IdentityUserId, TabId, TenantId, UnitId } from "../../common/domain";
import type { Bill, RestaurantTable, Tab } from "../domain";
import { calculateBill, createBill } from "../domain";
import { InMemoryOrderItemStore } from "./add-order-item.service";
import { InMemoryRestaurantTableStore, InMemoryTabStore } from "./open-tab.service";

export const CloseTabFailureReasons = {
  BillAlreadyExists: "BILL_ALREADY_EXISTS",
  InvalidBillCalculation: "INVALID_BILL_CALCULATION",
  InvalidFakePayment: "INVALID_FAKE_PAYMENT",
  PaymentAmountMismatch: "PAYMENT_AMOUNT_MISMATCH",
  TabHasNoActiveItems: "TAB_HAS_NO_ACTIVE_ITEMS",
  TabNotFound: "TAB_NOT_FOUND",
  TabNotOpen: "TAB_NOT_OPEN",
  TableNotFound: "TABLE_NOT_FOUND",
} as const;

export type CloseTabFailureReason =
  (typeof CloseTabFailureReasons)[keyof typeof CloseTabFailureReasons];

export type FakePaymentCloseScenario = "APPROVED" | "DECLINED" | "FAILED";
export type FakePaymentCloseMethod = "CASH_FAKE" | "CARD_FAKE";

export interface CloseTabCommand {
  readonly actorId: IdentityUserId;
  readonly discountCents?: number;
  readonly payment: {
    readonly amountCents: number;
    readonly method: FakePaymentCloseMethod;
    readonly scenario?: FakePaymentCloseScenario;
  };
  readonly serviceFeeCents?: number;
  readonly tabId: TabId;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export type CloseTabResult =
  | {
      readonly bill: Bill;
      readonly payment: FakePayment;
      readonly status: "CLOSED";
      readonly tab: Tab;
      readonly table: RestaurantTable;
    }
  | {
      readonly bill: Bill;
      readonly payment: FakePayment;
      readonly reason: "PAYMENT_DECLINED" | "PAYMENT_FAILED";
      readonly status: "PAYMENT_FAILED";
      readonly tab: Tab;
      readonly table: RestaurantTable;
    }
  | {
      readonly reason: CloseTabFailureReason;
      readonly status: "DENIED";
    };

export class CloseTabService {
  constructor(
    private readonly tables: InMemoryRestaurantTableStore,
    private readonly tabs: InMemoryTabStore,
    private readonly orderItems: InMemoryOrderItemStore,
    private readonly bills: InMemoryBillStore,
    private readonly fakePayments: InMemoryFakePaymentStore,
  ) {}

  close(command: CloseTabCommand): CloseTabResult {
    const tab = this.tabs.find(command.tenantId, command.unitId, command.tabId);

    if (!tab) {
      return denied(CloseTabFailureReasons.TabNotFound);
    }

    if (tab.status !== "OPEN") {
      return denied(CloseTabFailureReasons.TabNotOpen);
    }

    if (this.bills.findByTab(command.tenantId, command.unitId, command.tabId)) {
      return denied(CloseTabFailureReasons.BillAlreadyExists);
    }

    const table = this.tables.find(command.tenantId, command.unitId, tab.tableId);

    if (!table) {
      return denied(CloseTabFailureReasons.TableNotFound);
    }

    const items = this.orderItems.listByTab(command.tenantId, command.unitId, command.tabId);
    const activeItems = items.filter((item) => item.status === "ACTIVE");

    if (activeItems.length === 0) {
      return denied(CloseTabFailureReasons.TabHasNoActiveItems);
    }

    const scenario = command.payment.scenario ?? "APPROVED";
    const paidCents = scenario === "APPROVED" ? command.payment.amountCents : 0;
    const calculation = (() => {
      try {
        return calculateBill({
          items,
          paidCents,
          ...(command.discountCents === undefined ? {} : { discountCents: command.discountCents }),
          ...(command.serviceFeeCents === undefined
            ? {}
            : { serviceFeeCents: command.serviceFeeCents }),
        });
      } catch {
        return null;
      }
    })();

    if (!calculation) {
      return denied(CloseTabFailureReasons.InvalidBillCalculation);
    }

    if (command.payment.amountCents !== calculation.totalCents) {
      return denied(CloseTabFailureReasons.PaymentAmountMismatch);
    }

    if (scenario === "APPROVED" && calculation.balanceCents !== 0) {
      return denied(CloseTabFailureReasons.PaymentAmountMismatch);
    }

    const now = new Date();
    const bill = buildBill(command, tab, calculation, scenario, now);
    const payment = (() => {
      try {
        return buildFakePayment(command, bill, scenario, now);
      } catch {
        return null;
      }
    })();

    if (!payment) {
      return denied(CloseTabFailureReasons.InvalidFakePayment);
    }

    this.bills.save(bill);
    this.fakePayments.save(payment);

    if (scenario !== "APPROVED") {
      return {
        bill,
        payment,
        reason: scenario === "DECLINED" ? "PAYMENT_DECLINED" : "PAYMENT_FAILED",
        status: "PAYMENT_FAILED",
        tab,
        table,
      };
    }

    const closedTab: Tab = {
      ...tab,
      closedAt: now,
      status: "CLOSED",
      updatedAt: now,
    };
    const availableTable: RestaurantTable = {
      ...table,
      status: "AVAILABLE",
      updatedAt: now,
    };

    this.tabs.save(closedTab);
    this.tables.save(availableTable);

    return {
      bill,
      payment,
      status: "CLOSED",
      tab: closedTab,
      table: availableTable,
    };
  }
}

export class InMemoryBillStore {
  private readonly bills = new Map<string, Bill>();

  find(tenantId: TenantId, unitId: UnitId, billId: string): Bill | null {
    const bill = this.bills.get(billId);

    if (!bill || bill.tenantId !== tenantId || bill.unitId !== unitId) {
      return null;
    }

    return bill;
  }

  findByTab(tenantId: TenantId, unitId: UnitId, tabId: TabId): Bill | null {
    return (
      [...this.bills.values()].find(
        (bill) => bill.tenantId === tenantId && bill.unitId === unitId && bill.tabId === tabId,
      ) ?? null
    );
  }

  save(bill: Bill): void {
    this.bills.set(bill.id, bill);
  }
}

export class InMemoryFakePaymentStore {
  private readonly payments = new Map<string, FakePayment>();

  find(tenantId: TenantId, unitId: UnitId, paymentId: string): FakePayment | null {
    const payment = this.payments.get(paymentId);

    if (!payment || payment.tenantId !== tenantId || payment.unitId !== unitId) {
      return null;
    }

    return payment;
  }

  listByBill(tenantId: TenantId, unitId: UnitId, billId: string): FakePayment[] {
    return [...this.payments.values()]
      .filter(
        (payment) =>
          payment.tenantId === tenantId && payment.unitId === unitId && payment.billId === billId,
      )
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  }

  save(payment: FakePayment): void {
    this.payments.set(payment.id, payment);
  }
}

function buildBill(
  command: CloseTabCommand,
  tab: Tab,
  calculation: {
    readonly discountCents: number;
    readonly paidCents: number;
    readonly serviceFeeCents: number;
    readonly subtotalCents: number;
    readonly totalCents: number;
  },
  scenario: FakePaymentCloseScenario,
  now: Date,
): Bill {
  return createBill({
    discountCents: calculation.discountCents,
    id: randomUUID(),
    now,
    paidCents: calculation.paidCents,
    serviceFeeCents: calculation.serviceFeeCents,
    status: scenario === "APPROVED" ? "CLOSED" : "PAYMENT_FAILED",
    subtotalCents: calculation.subtotalCents,
    tabId: tab.id,
    tenantId: command.tenantId,
    totalCents: calculation.totalCents,
    unitId: command.unitId,
  });
}

function buildFakePayment(
  command: CloseTabCommand,
  bill: Bill,
  scenario: FakePaymentCloseScenario,
  now: Date,
): FakePayment {
  return createFakePayment({
    amountCents: command.payment.amountCents,
    billId: bill.id,
    id: randomUUID(),
    method: command.payment.method,
    now,
    scenario,
    status: scenario === "APPROVED" ? "RECORDED" : scenario,
    tenantId: command.tenantId,
    unitId: command.unitId,
  });
}

function denied(reason: CloseTabFailureReason): CloseTabResult {
  return {
    reason,
    status: "DENIED",
  };
}
