import type { CategoryId, ProductId, TenantId, UnitId } from "../../common/domain";
import type { Category, CategoryStatus } from "./category.entity";
import type { Product, ProductStatus } from "./product.entity";

export const CatalogInvariantCodes = {
  CategoryScopeMismatch: "CATEGORY_SCOPE_MISMATCH",
  InvalidCategoryName: "INVALID_CATEGORY_NAME",
  InvalidCategoryStatus: "INVALID_CATEGORY_STATUS",
  InvalidPriceCents: "INVALID_PRICE_CENTS",
  InvalidProductName: "INVALID_PRODUCT_NAME",
  InvalidProductStatus: "INVALID_PRODUCT_STATUS",
  InvalidSortOrder: "INVALID_SORT_ORDER",
  MissingTenantOrUnit: "MISSING_TENANT_OR_UNIT",
  ProductRequiresActiveCategory: "PRODUCT_REQUIRES_ACTIVE_CATEGORY",
} as const;

export type CatalogInvariantCode =
  (typeof CatalogInvariantCodes)[keyof typeof CatalogInvariantCodes];

export class CatalogInvariantViolation extends Error {
  constructor(readonly code: CatalogInvariantCode) {
    super(code);
    this.name = "CatalogInvariantViolation";
  }
}

export const CatalogLimits = {
  categoryNameMaxLength: 80,
  categoryNameMinLength: 2,
  maxPriceCents: 2_147_483_647,
  productNameMaxLength: 120,
  productNameMinLength: 2,
  sortOrderMin: 0,
} as const;

const CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"] as const satisfies readonly CategoryStatus[];
const PRODUCT_STATUSES = [
  "AVAILABLE",
  "UNAVAILABLE",
  "INACTIVE",
] as const satisfies readonly ProductStatus[];

export interface CreateCategoryInput {
  readonly id: CategoryId;
  readonly name: string;
  readonly now?: Date;
  readonly sortOrder?: number;
  readonly status?: string;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export interface CreateProductInput {
  readonly category: Pick<Category, "id" | "status" | "tenantId" | "unitId">;
  readonly id: ProductId;
  readonly name: string;
  readonly now?: Date;
  readonly priceCents: number;
  readonly status?: string;
  readonly tenantId: TenantId;
  readonly unitId: UnitId;
}

export function createCategory(input: CreateCategoryInput): Category {
  assertTenantAndUnit(input.tenantId, input.unitId);

  const name = normalizeName(input.name);
  const status = normalizeCategoryStatus(input.status ?? "ACTIVE");
  const sortOrder = normalizeSortOrder(input.sortOrder ?? 0);
  const now = input.now ?? new Date();

  return {
    createdAt: now,
    id: input.id,
    name,
    sortOrder,
    status,
    tenantId: input.tenantId,
    unitId: input.unitId,
    updatedAt: now,
  };
}

export function createProduct(input: CreateProductInput): Product {
  assertTenantAndUnit(input.tenantId, input.unitId);
  assertCategoryScope(input.category, input.tenantId, input.unitId);

  if (input.category.status !== "ACTIVE") {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.ProductRequiresActiveCategory);
  }

  const name = normalizeProductName(input.name);
  const status = normalizeProductStatus(input.status ?? "AVAILABLE");
  const priceCents = normalizePriceCents(input.priceCents);
  const now = input.now ?? new Date();

  return {
    categoryId: input.category.id,
    createdAt: now,
    id: input.id,
    name,
    priceCents,
    status,
    tenantId: input.tenantId,
    unitId: input.unitId,
    updatedAt: now,
  };
}

function assertTenantAndUnit(tenantId: TenantId, unitId: UnitId): void {
  if (!tenantId.trim() || !unitId.trim()) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.MissingTenantOrUnit);
  }
}

function assertCategoryScope(
  category: Pick<Category, "tenantId" | "unitId">,
  tenantId: TenantId,
  unitId: UnitId,
): void {
  if (category.tenantId !== tenantId || category.unitId !== unitId) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.CategoryScopeMismatch);
  }
}

function normalizeName(name: string): string {
  const normalized = name.trim();

  if (
    normalized.length < CatalogLimits.categoryNameMinLength ||
    normalized.length > CatalogLimits.categoryNameMaxLength
  ) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.InvalidCategoryName);
  }

  return normalized;
}

function normalizeProductName(name: string): string {
  const normalized = name.trim();

  if (
    normalized.length < CatalogLimits.productNameMinLength ||
    normalized.length > CatalogLimits.productNameMaxLength
  ) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.InvalidProductName);
  }

  return normalized;
}

function normalizeCategoryStatus(status: string): CategoryStatus {
  if (!CATEGORY_STATUSES.includes(status as CategoryStatus)) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.InvalidCategoryStatus);
  }

  return status as CategoryStatus;
}

function normalizeProductStatus(status: string): ProductStatus {
  if (!PRODUCT_STATUSES.includes(status as ProductStatus)) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.InvalidProductStatus);
  }

  return status as ProductStatus;
}

function normalizeSortOrder(sortOrder: number): number {
  if (!Number.isInteger(sortOrder) || sortOrder < CatalogLimits.sortOrderMin) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.InvalidSortOrder);
  }

  return sortOrder;
}

function normalizePriceCents(priceCents: number): number {
  if (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > CatalogLimits.maxPriceCents) {
    throw new CatalogInvariantViolation(CatalogInvariantCodes.InvalidPriceCents);
  }

  return priceCents;
}
