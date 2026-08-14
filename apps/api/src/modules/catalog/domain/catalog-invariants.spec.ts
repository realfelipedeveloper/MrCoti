import { describe, expect, it } from "@jest/globals";

import {
  CatalogInvariantCodes,
  CatalogInvariantViolation,
  CatalogLimits,
  createCategory,
  createProduct,
} from "./index";

const NOW = new Date("2026-07-11T12:00:00.000Z");

describe("catalog invariants", () => {
  it("creates a tenant/unit scoped category with normalized name and default status", () => {
    const category = createCategory({
      id: "category_demo",
      name: "  Bebidas  ",
      now: NOW,
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expect(category).toEqual({
      createdAt: NOW,
      id: "category_demo",
      name: "Bebidas",
      sortOrder: 0,
      status: "ACTIVE",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
      updatedAt: NOW,
    });
  });

  it("rejects invalid category status, name and missing scope", () => {
    expectCatalogViolation(
      () =>
        createCategory({
          id: "category_demo",
          name: "B",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      CatalogInvariantCodes.InvalidCategoryName,
    );

    expectCatalogViolation(
      () =>
        createCategory({
          id: "category_demo",
          name: "Bebidas",
          status: "DELETED",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      CatalogInvariantCodes.InvalidCategoryStatus,
    );

    expectCatalogViolation(
      () =>
        createCategory({
          id: "category_demo",
          name: "Bebidas",
          tenantId: "",
          unitId: "unit_demo",
        }),
      CatalogInvariantCodes.MissingTenantOrUnit,
    );

    expectCatalogViolation(
      () =>
        createCategory({
          id: "category_demo",
          name: "Bebidas",
          sortOrder: -1,
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      CatalogInvariantCodes.InvalidSortOrder,
    );
  });

  it("creates a product in the same tenant/unit as an active category with integer cents", () => {
    const category = createCategory({
      id: "category_demo",
      name: "Bebidas",
      now: NOW,
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    const product = createProduct({
      category,
      id: "product_demo",
      name: "  Café  ",
      now: NOW,
      priceCents: 750,
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expect(product).toEqual({
      categoryId: "category_demo",
      createdAt: NOW,
      id: "product_demo",
      name: "Café",
      priceCents: 750,
      status: "AVAILABLE",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
      updatedAt: NOW,
    });
  });

  it("rejects fractional, negative and storage-overflow prices", () => {
    const category = createCategory({
      id: "category_demo",
      name: "Bebidas",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    for (const priceCents of [-1, 1.25, CatalogLimits.maxPriceCents + 1]) {
      expectCatalogViolation(
        () =>
          createProduct({
            category,
            id: "product_demo",
            name: "Café",
            priceCents,
            tenantId: "tenant_demo",
            unitId: "unit_demo",
          }),
        CatalogInvariantCodes.InvalidPriceCents,
      );
    }
  });

  it("rejects product category from another tenant or unit", () => {
    const category = createCategory({
      id: "category_demo",
      name: "Bebidas",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expectCatalogViolation(
      () =>
        createProduct({
          category,
          id: "product_demo",
          name: "Café",
          priceCents: 750,
          tenantId: "tenant_other",
          unitId: "unit_demo",
        }),
      CatalogInvariantCodes.CategoryScopeMismatch,
    );

    expectCatalogViolation(
      () =>
        createProduct({
          category,
          id: "product_demo",
          name: "Café",
          priceCents: 750,
          tenantId: "tenant_demo",
          unitId: "unit_other",
        }),
      CatalogInvariantCodes.CategoryScopeMismatch,
    );
  });

  it("rejects unavailable status values and active product creation under inactive category", () => {
    const inactiveCategory = createCategory({
      id: "category_demo",
      name: "Bebidas",
      status: "INACTIVE",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expectCatalogViolation(
      () =>
        createProduct({
          category: inactiveCategory,
          id: "product_demo",
          name: "Café",
          priceCents: 750,
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      CatalogInvariantCodes.ProductRequiresActiveCategory,
    );

    const activeCategory = createCategory({
      id: "category_demo",
      name: "Bebidas",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expectCatalogViolation(
      () =>
        createProduct({
          category: activeCategory,
          id: "product_demo",
          name: "Café",
          priceCents: 750,
          status: "DELETED",
          tenantId: "tenant_demo",
          unitId: "unit_demo",
        }),
      CatalogInvariantCodes.InvalidProductStatus,
    );
  });
});

function expectCatalogViolation(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error("Expected catalog invariant violation.");
  } catch (error) {
    expect(error).toBeInstanceOf(CatalogInvariantViolation);
    expect((error as CatalogInvariantViolation).code).toBe(code);
  }
}
