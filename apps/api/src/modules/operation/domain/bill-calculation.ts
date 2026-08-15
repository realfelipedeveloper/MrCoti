import type { OrderItem } from "./order-item.entity";

export const BillCalculationCodes = {
  InvalidCents: "INVALID_CENTS",
  InvalidLineTotalCents: "INVALID_LINE_TOTAL_CENTS",
  InvalidOrderItemQuantity: "INVALID_ORDER_ITEM_QUANTITY",
  InvalidOrderItemUnitPriceCents: "INVALID_ORDER_ITEM_UNIT_PRICE_CENTS",
  InvalidTotalCents: "INVALID_TOTAL_CENTS",
  PaidAmountExceedsTotal: "PAID_AMOUNT_EXCEEDS_TOTAL",
} as const;

export type BillCalculationCode = (typeof BillCalculationCodes)[keyof typeof BillCalculationCodes];

export class BillCalculationViolation extends Error {
  constructor(readonly code: BillCalculationCode) {
    super(code);
    this.name = "BillCalculationViolation";
  }
}

export const BillingCalculationLimits = {
  maxCents: 2_147_483_647,
} as const;

export interface CalculateBillInput {
  readonly discountCents?: number;
  readonly items: readonly Pick<OrderItem, "quantity" | "status" | "unitPriceCents">[];
  readonly paidCents?: number;
  readonly serviceFeeCents?: number;
}

export interface BillCalculation {
  readonly balanceCents: number;
  readonly discountCents: number;
  readonly paidCents: number;
  readonly serviceFeeCents: number;
  readonly subtotalCents: number;
  readonly totalCents: number;
}

export function calculateBill(input: CalculateBillInput): BillCalculation {
  const subtotalCents = calculateSubtotalCents(input.items);
  const discountCents = normalizeCents(input.discountCents ?? 0);
  const serviceFeeCents = normalizeCents(input.serviceFeeCents ?? 0);
  const paidCents = normalizeCents(input.paidCents ?? 0);
  const totalCents = calculateTotalCents(subtotalCents, discountCents, serviceFeeCents);

  if (paidCents > totalCents) {
    throw new BillCalculationViolation(BillCalculationCodes.PaidAmountExceedsTotal);
  }

  return {
    balanceCents: totalCents - paidCents,
    discountCents,
    paidCents,
    serviceFeeCents,
    subtotalCents,
    totalCents,
  };
}

function calculateSubtotalCents(
  items: readonly Pick<OrderItem, "quantity" | "status" | "unitPriceCents">[],
): number {
  return items
    .filter((item) => item.status === "ACTIVE")
    .reduce((subtotalCents, item) => {
      const lineTotalCents = calculateLineTotalCents(item);
      const nextSubtotalCents = subtotalCents + lineTotalCents;

      if (nextSubtotalCents > BillingCalculationLimits.maxCents) {
        throw new BillCalculationViolation(BillCalculationCodes.InvalidLineTotalCents);
      }

      return nextSubtotalCents;
    }, 0);
}

function calculateLineTotalCents(item: Pick<OrderItem, "quantity" | "unitPriceCents">): number {
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new BillCalculationViolation(BillCalculationCodes.InvalidOrderItemQuantity);
  }

  if (
    !Number.isInteger(item.unitPriceCents) ||
    item.unitPriceCents < 0 ||
    item.unitPriceCents > BillingCalculationLimits.maxCents
  ) {
    throw new BillCalculationViolation(BillCalculationCodes.InvalidOrderItemUnitPriceCents);
  }

  const lineTotalCents = item.quantity * item.unitPriceCents;

  if (!Number.isSafeInteger(lineTotalCents) || lineTotalCents > BillingCalculationLimits.maxCents) {
    throw new BillCalculationViolation(BillCalculationCodes.InvalidLineTotalCents);
  }

  return lineTotalCents;
}

function normalizeCents(cents: number): number {
  if (!Number.isInteger(cents) || cents < 0 || cents > BillingCalculationLimits.maxCents) {
    throw new BillCalculationViolation(BillCalculationCodes.InvalidCents);
  }

  return cents;
}

function calculateTotalCents(
  subtotalCents: number,
  discountCents: number,
  serviceFeeCents: number,
): number {
  const totalCents = subtotalCents - discountCents + serviceFeeCents;

  if (totalCents < 0 || totalCents > BillingCalculationLimits.maxCents) {
    throw new BillCalculationViolation(BillCalculationCodes.InvalidTotalCents);
  }

  return totalCents;
}
