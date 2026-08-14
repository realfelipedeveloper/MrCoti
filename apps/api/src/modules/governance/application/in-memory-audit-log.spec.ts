import { describe, expect, it } from "@jest/globals";

import { CatalogAuditActions } from "../domain";
import { InMemoryAuditLog } from "./index";

const NOW = new Date("2026-07-11T12:00:00.000Z");

describe("InMemoryAuditLog", () => {
  it("records catalog create, update and deactivate actions append-only", () => {
    const auditLog = new InMemoryAuditLog();

    auditLog.append({
      action: CatalogAuditActions.CategoryCreated,
      actorId: "user_demo",
      after: { name: "Bebidas" },
      before: null,
      correlationId: "corr_demo",
      id: "audit_001",
      now: NOW,
      reason: null,
      resourceId: "category_demo",
      resourceType: "Category",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });
    auditLog.append({
      action: CatalogAuditActions.CategoryUpdated,
      actorId: "user_demo",
      after: { name: "Bebidas Frias" },
      before: { name: "Bebidas" },
      correlationId: "corr_demo",
      id: "audit_002",
      now: NOW,
      reason: "Ajuste de demonstração",
      resourceId: "category_demo",
      resourceType: "Category",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });
    auditLog.append({
      action: CatalogAuditActions.ProductDeactivated,
      actorId: "user_demo",
      after: { status: "INACTIVE" },
      before: { status: "AVAILABLE" },
      correlationId: "corr_demo",
      id: "audit_003",
      now: NOW,
      reason: "Produto indisponível",
      resourceId: "product_demo",
      resourceType: "Product",
      tenantId: "tenant_demo",
      unitId: "unit_demo",
    });

    expect(auditLog.list()).toEqual([
      expect.objectContaining({
        action: CatalogAuditActions.CategoryCreated,
        before: null,
        id: "audit_001",
      }),
      expect.objectContaining({
        action: CatalogAuditActions.CategoryUpdated,
        before: { name: "Bebidas" },
        reason: "Ajuste de demonstração",
      }),
      expect.objectContaining({
        action: CatalogAuditActions.ProductDeactivated,
        resourceType: "Product",
      }),
    ]);
  });
});
