import { describe, expect, it } from "@jest/globals";

import { InMemoryIdempotencyStore } from "../../common/application";
import { InMemoryAuditLog } from "../../governance/application";
import { CatalogAuditActions } from "../../governance/domain";
import { DemoIds } from "../../local-demo";
import { Permissions, type Permission } from "../../iam/application";
import type { CurrentContextDto } from "../../iam/api";
import { createCategory } from "../domain";
import { CatalogHttpService, InMemoryCategoryStore, InMemoryProductStore } from "./index";

describe("CatalogHttpService audit integration", () => {
  it("records category and product creation once under idempotent replay", () => {
    const auditLog = new InMemoryAuditLog();
    const service = new CatalogHttpService(
      new InMemoryCategoryStore(),
      new InMemoryProductStore(),
      auditLog,
      new InMemoryIdempotencyStore(),
    );
    const correlationContext = {
      correlationId: "corr_catalog_audit",
      requestId: "req_catalog_audit",
    };
    const category = service.createCategory(
      currentContext([
        Permissions.CatalogCategoryManage,
        Permissions.CatalogCategoryRead,
        Permissions.CatalogProductManage,
        Permissions.CatalogProductRead,
      ]),
      DemoIds.unit,
      "audit-category-create",
      {
        name: "Bebidas",
      },
      correlationContext,
    );

    if (category.status !== "CREATED") {
      throw new Error("Expected category to be created in test setup.");
    }

    service.createCategory(
      currentContext([
        Permissions.CatalogCategoryManage,
        Permissions.CatalogCategoryRead,
        Permissions.CatalogProductManage,
        Permissions.CatalogProductRead,
      ]),
      DemoIds.unit,
      "audit-category-create",
      {
        name: "Bebidas",
      },
      correlationContext,
    );

    const product = service.createProduct(
      currentContext([
        Permissions.CatalogCategoryManage,
        Permissions.CatalogCategoryRead,
        Permissions.CatalogProductManage,
        Permissions.CatalogProductRead,
      ]),
      DemoIds.unit,
      "audit-product-create",
      {
        categoryId: category.category.id,
        name: "Café",
        priceCents: 750,
      },
      correlationContext,
    );

    if (product.status !== "CREATED") {
      throw new Error("Expected product to be created in test setup.");
    }

    expect(auditLog.list()).toEqual([
      expect.objectContaining({
        action: CatalogAuditActions.CategoryCreated,
        actorId: DemoIds.unitManagerUser,
        after: category.category,
        before: null,
        correlationId: "corr_catalog_audit",
        resourceId: category.category.id,
        resourceType: "Category",
      }),
      expect.objectContaining({
        action: CatalogAuditActions.ProductCreated,
        after: product.product,
        before: null,
        correlationId: "corr_catalog_audit",
        resourceId: product.product.id,
        resourceType: "Product",
      }),
    ]);
  });

  it("denies catalog actions when RBAC permission is missing", () => {
    const auditLog = new InMemoryAuditLog();
    const service = new CatalogHttpService(
      new InMemoryCategoryStore(),
      new InMemoryProductStore(),
      auditLog,
      new InMemoryIdempotencyStore(),
    );

    expect(
      service.createCategory(
        currentContext([Permissions.CatalogCategoryRead]),
        DemoIds.unit,
        "rbac-denied-category",
        {
          name: "Bebidas",
        },
        correlationContext(),
      ),
    ).toEqual({
      errorCode: "FORBIDDEN",
      status: "DENIED",
    });

    expect(service.listProducts(currentContext([]), DemoIds.unit, null)).toBeNull();
    expect(auditLog.list()).toEqual([]);
  });

  it("denies catalog access for units outside the authenticated context", () => {
    const auditLog = new InMemoryAuditLog();
    const service = new CatalogHttpService(
      new InMemoryCategoryStore(),
      new InMemoryProductStore(),
      auditLog,
      new InMemoryIdempotencyStore(),
    );

    expect(
      service.listCategories(
        currentContext([Permissions.CatalogCategoryRead]),
        "99999999-9999-4999-8999-999999999999",
      ),
    ).toBeNull();
    expect(
      service.createCategory(
        currentContext([Permissions.CatalogCategoryManage]),
        "99999999-9999-4999-8999-999999999999",
        "unit-denied-category",
        {
          name: "Bebidas",
        },
        correlationContext(),
      ),
    ).toEqual({
      errorCode: "FORBIDDEN",
      status: "DENIED",
    });
    expect(auditLog.list()).toEqual([]);
  });

  it("denies product creation when category belongs to another tenant", () => {
    const categoryStore = new InMemoryCategoryStore();
    const auditLog = new InMemoryAuditLog();
    categoryStore.save(
      createCategory({
        id: "category_other_tenant",
        name: "Bebidas",
        tenantId: "tenant_other",
        unitId: DemoIds.unit,
      }),
    );
    const service = new CatalogHttpService(
      categoryStore,
      new InMemoryProductStore(),
      auditLog,
      new InMemoryIdempotencyStore(),
    );

    expect(
      service.createProduct(
        currentContext([Permissions.CatalogProductManage]),
        DemoIds.unit,
        "cross-tenant-product",
        {
          categoryId: "category_other_tenant",
          name: "Café",
          priceCents: 750,
        },
        correlationContext(),
      ),
    ).toEqual({
      errorCode: "FORBIDDEN",
      status: "DENIED",
    });
    expect(auditLog.list()).toEqual([]);
  });
});

function correlationContext() {
  return {
    correlationId: "corr_catalog_negative",
    requestId: "req_catalog_negative",
  };
}

function currentContext(permissions: readonly Permission[]): CurrentContextDto {
  return {
    permissions,
    roles: ["UNIT_MANAGER"],
    tenant: {
      id: DemoIds.tenant,
      name: "Mr Coti Demo",
      status: "ACTIVE",
    },
    units: [
      {
        id: DemoIds.unit,
        name: "Unidade Demo",
        status: "ACTIVE",
      },
    ],
    user: {
      displayName: "Manager Demo",
      id: DemoIds.unitManagerUser,
    },
  };
}
