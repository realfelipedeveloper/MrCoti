import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type { RequestCorrelationContext } from "../../common/api";
import { IdempotencyFailureCodes, InMemoryIdempotencyStore } from "../../common/application";
import { InMemoryAuditLog } from "../../governance/application";
import { CatalogAuditActions } from "../../governance/domain";
import type { CurrentContextDto, ErrorResponseDto } from "../../iam/api";
import { Permissions } from "../../iam/application";
import {
  createCategory,
  createProduct as createProductEntity,
  type Category,
  type Product,
  type ProductStatus,
} from "../domain";

export interface CategoryDto {
  readonly id: string;
  readonly name: string;
  readonly status: "ACTIVE" | "INACTIVE";
}

export interface CreateCategoryRequestDto {
  readonly name?: unknown;
}

export interface ProductDto {
  readonly categoryId: string;
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly status: ProductStatus;
}

export interface CreateProductRequestDto {
  readonly available?: unknown;
  readonly categoryId?: unknown;
  readonly name?: unknown;
  readonly priceCents?: unknown;
}

export type CategoryCreateResult =
  | {
      readonly category: CategoryDto;
      readonly status: "CREATED";
    }
  | {
      readonly errorCode: "FORBIDDEN" | "IDEMPOTENCY_PAYLOAD_CONFLICT";
      readonly status: "DENIED";
    };

export type ProductCreateResult =
  | {
      readonly product: ProductDto;
      readonly status: "CREATED";
    }
  | {
      readonly errorCode: "FORBIDDEN" | "IDEMPOTENCY_PAYLOAD_CONFLICT";
      readonly status: "DENIED";
    };

export class InMemoryCategoryStore {
  private readonly categories = new Map<string, Category>();

  find(tenantId: string, unitId: string, categoryId: string): Category | null {
    const category = this.categories.get(categoryId);

    if (!category || category.tenantId !== tenantId || category.unitId !== unitId) {
      return null;
    }

    return category;
  }

  list(tenantId: string, unitId: string): Category[] {
    return [...this.categories.values()]
      .filter((category) => category.tenantId === tenantId && category.unitId === unitId)
      .sort(
        (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
      );
  }

  save(category: Category): void {
    this.categories.set(category.id, category);
  }
}

export class InMemoryProductStore {
  private readonly products = new Map<string, Product>();

  find(tenantId: string, unitId: string, productId: string): Product | null {
    const product = this.products.get(productId);

    if (!product || product.tenantId !== tenantId || product.unitId !== unitId) {
      return null;
    }

    return product;
  }

  list(tenantId: string, unitId: string, status: ProductStatus | null): Product[] {
    return [...this.products.values()]
      .filter((product) => product.tenantId === tenantId && product.unitId === unitId)
      .filter((product) => !status || product.status === status)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  save(product: Product): void {
    this.products.set(product.id, product);
  }
}

@Injectable()
export class CatalogHttpService {
  constructor(
    private readonly categories: InMemoryCategoryStore,
    private readonly products: InMemoryProductStore,
    private readonly auditLog: InMemoryAuditLog,
    private readonly idempotency: InMemoryIdempotencyStore,
  ) {}

  listCategories(context: CurrentContextDto, unitId: string | null): CategoryDto[] | null {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.CatalogCategoryRead)
    ) {
      return null;
    }

    return this.categories.list(context.tenant.id, unitId).map(categoryToDto);
  }

  createCategory(
    context: CurrentContextDto,
    unitId: string | null,
    idempotencyKey: string | null,
    body: CreateCategoryRequestDto,
    correlationContext: RequestCorrelationContext,
  ): CategoryCreateResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.CatalogCategoryManage) ||
      !idempotencyKey ||
      typeof body.name !== "string"
    ) {
      return {
        errorCode: "FORBIDDEN",
        status: "DENIED",
      };
    }

    const scope = `tenant:${context.tenant.id}:unit:${unitId}:catalog.categories.create`;
    const result = this.idempotency.resolve(scope, idempotencyKey, body, () => {
      const category = createCategory({
        id: randomUUID(),
        name: body.name as string,
        tenantId: context.tenant.id,
        unitId,
      });
      this.categories.save(category);
      this.auditLog.append({
        action: CatalogAuditActions.CategoryCreated,
        actorId: context.user.id,
        after: toAuditPayload(categoryToDto(category)),
        before: null,
        correlationId: correlationContext.correlationId,
        reason: null,
        resourceId: category.id,
        resourceType: "Category",
        tenantId: context.tenant.id,
        unitId,
      });

      return categoryToDto(category);
    });

    if (result.status === "CONFLICT") {
      return {
        errorCode: IdempotencyFailureCodes.PayloadConflict,
        status: "DENIED",
      };
    }

    return {
      category: result.response,
      status: "CREATED",
    };
  }

  listProducts(
    context: CurrentContextDto,
    unitId: string | null,
    status: string | null,
  ): ProductDto[] | null {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.CatalogProductRead)
    ) {
      return null;
    }

    const normalizedStatus = normalizeProductStatusQuery(status);

    if (status && !normalizedStatus) {
      return null;
    }

    return this.products.list(context.tenant.id, unitId, normalizedStatus).map(productToDto);
  }

  createProduct(
    context: CurrentContextDto,
    unitId: string | null,
    idempotencyKey: string | null,
    body: CreateProductRequestDto,
    correlationContext: RequestCorrelationContext,
  ): ProductCreateResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.CatalogProductManage) ||
      !idempotencyKey ||
      typeof body.categoryId !== "string" ||
      typeof body.name !== "string" ||
      typeof body.priceCents !== "number"
    ) {
      return {
        errorCode: "FORBIDDEN",
        status: "DENIED",
      };
    }

    const category = this.categories.find(context.tenant.id, unitId, body.categoryId);

    if (!category) {
      return {
        errorCode: "FORBIDDEN",
        status: "DENIED",
      };
    }

    const scope = `tenant:${context.tenant.id}:unit:${unitId}:catalog.products.create`;
    const result = this.idempotency.resolve(scope, idempotencyKey, body, () => {
      const product = createProductEntity({
        category,
        id: randomUUID(),
        name: body.name as string,
        priceCents: body.priceCents as number,
        status: body.available === false ? "UNAVAILABLE" : "AVAILABLE",
        tenantId: context.tenant.id,
        unitId,
      });
      this.products.save(product);
      this.auditLog.append({
        action: CatalogAuditActions.ProductCreated,
        actorId: context.user.id,
        after: toAuditPayload(productToDto(product)),
        before: null,
        correlationId: correlationContext.correlationId,
        reason: null,
        resourceId: product.id,
        resourceType: "Product",
        tenantId: context.tenant.id,
        unitId,
      });

      return productToDto(product);
    });

    if (result.status === "CONFLICT") {
      return {
        errorCode: IdempotencyFailureCodes.PayloadConflict,
        status: "DENIED",
      };
    }

    return {
      product: result.response,
      status: "CREATED",
    };
  }

  forbidden(context: RequestCorrelationContext): ErrorResponseDto {
    return {
      code: "AUTH_FORBIDDEN",
      correlationId: context.correlationId,
      message: "Ator sem autorização para o escopo.",
      requestId: context.requestId,
    };
  }

  idempotencyConflict(context: RequestCorrelationContext): ErrorResponseDto {
    return {
      code: IdempotencyFailureCodes.PayloadConflict,
      correlationId: context.correlationId,
      message: "A operação já foi registrada com payload diferente.",
      requestId: context.requestId,
    };
  }

  private canAccessUnit(context: CurrentContextDto, unitId: string | null): unitId is string {
    return Boolean(unitId && context.units.some((unit) => unit.id === unitId));
  }
}

function categoryToDto(category: Category): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    status: category.status,
  };
}

function productToDto(product: Product): ProductDto {
  return {
    categoryId: product.categoryId,
    id: product.id,
    name: product.name,
    priceCents: product.priceCents,
    status: product.status,
  };
}

function normalizeProductStatusQuery(status: string | null): ProductStatus | null {
  if (!status) {
    return null;
  }

  if (status === "AVAILABLE" || status === "UNAVAILABLE" || status === "INACTIVE") {
    return status;
  }

  return null;
}

function toAuditPayload(value: object): Readonly<Record<string, unknown>> {
  return { ...value };
}
