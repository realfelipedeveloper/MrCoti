import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type { RequestCorrelationContext } from "../../common/api";
import { IdempotencyFailureCodes, InMemoryIdempotencyStore } from "../../common/application";
import type { TabId } from "../../common/domain";
import type { CurrentContextDto, ErrorResponseDto } from "../../iam/api";
import { Permissions } from "../../iam/application";
import {
  AddOrderItemFailureReasons,
  AddOrderItemService,
  InMemoryOrderItemStore,
  InMemoryRestaurantTableStore,
  InMemoryTabStore,
  OpenTabFailureReasons,
  OpenTabService,
  OrderItemMutationFailureReasons,
} from "../application";
import type { OrderItem, RestaurantTable, Tab } from "../domain";

export interface RestaurantTableDto {
  readonly code: string;
  readonly id: string;
  readonly status: "AVAILABLE" | "OCCUPIED" | "BLOCKED";
}

export interface OrderItemDto {
  readonly id: string;
  readonly productId: string;
  readonly productNameSnapshot: string;
  readonly quantity: number;
  readonly status: "ACTIVE" | "CANCELLED";
  readonly unitPriceCents: number;
}

export interface TabDto {
  readonly bill?: null;
  readonly id: string;
  readonly items: readonly OrderItemDto[];
  readonly status: "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";
  readonly tableId: string;
}

export interface CreateTableRequestDto {
  readonly code?: unknown;
}

export interface OpenTabRequestDto {
  readonly tableId?: unknown;
}

export interface AddItemRequestDto {
  readonly productId?: unknown;
  readonly quantity?: unknown;
}

export interface UpdateItemQuantityRequestDto {
  readonly quantity?: unknown;
}

export interface CancelItemRequestDto {
  readonly reason?: unknown;
}

export type OperationHttpErrorCode =
  "AUTH_FORBIDDEN" | "DOMAIN_ERROR" | "IDEMPOTENCY_PAYLOAD_CONFLICT" | "NOT_FOUND";

export interface OperationHttpDenied {
  readonly domainCode?: string;
  readonly errorCode: OperationHttpErrorCode;
  readonly status: "DENIED";
}

export type CreateTableResult =
  | {
      readonly status: "CREATED";
      readonly table: RestaurantTableDto;
    }
  | OperationHttpDenied;

export type OpenTabHttpResult =
  | {
      readonly status: "OPENED";
      readonly tab: TabDto;
    }
  | OperationHttpDenied;

export type GetTabResult =
  | {
      readonly status: "FOUND";
      readonly tab: TabDto;
    }
  | OperationHttpDenied;

export type AddItemHttpResult =
  | {
      readonly item: OrderItemDto;
      readonly status: "ADDED";
    }
  | OperationHttpDenied;

export type UpdateItemQuantityHttpResult =
  | {
      readonly item: OrderItemDto;
      readonly status: "UPDATED";
    }
  | OperationHttpDenied;

export type CancelItemHttpResult =
  | {
      readonly item: OrderItemDto;
      readonly status: "CANCELLED";
    }
  | OperationHttpDenied;

@Injectable()
export class OperationHttpService {
  constructor(
    private readonly tables: InMemoryRestaurantTableStore,
    private readonly tabs: InMemoryTabStore,
    private readonly orderItems: InMemoryOrderItemStore,
    private readonly openTabs: OpenTabService,
    private readonly itemService: AddOrderItemService,
    private readonly idempotency: InMemoryIdempotencyStore,
  ) {}

  listTables(context: CurrentContextDto, unitId: string | null): RestaurantTableDto[] | null {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.OperationTableRead)
    ) {
      return null;
    }

    return this.tables.list(context.tenant.id, unitId).map(tableToDto);
  }

  createTable(
    context: CurrentContextDto,
    unitId: string | null,
    idempotencyKey: string | null,
    body: CreateTableRequestDto,
  ): CreateTableResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.OperationTableManage)
    ) {
      return denied("AUTH_FORBIDDEN");
    }

    if (!idempotencyKey) {
      return denied("DOMAIN_ERROR", "MISSING_IDEMPOTENCY_KEY");
    }

    const code = normalizeTableCode(body.code);

    if (!code) {
      return denied("DOMAIN_ERROR", "INVALID_TABLE_CODE");
    }

    const scope = `tenant:${context.tenant.id}:unit:${unitId}:operation.tables.create`;
    const result = this.idempotency.resolve(scope, idempotencyKey, { code }, () => {
      if (this.tables.findByCode(context.tenant.id, unitId, code)) {
        return denied("DOMAIN_ERROR", "TABLE_CODE_ALREADY_EXISTS");
      }

      const now = new Date();
      const table: RestaurantTable = {
        code,
        createdAt: now,
        id: randomUUID(),
        status: "AVAILABLE",
        tenantId: context.tenant.id,
        unitId,
        updatedAt: now,
      };

      this.tables.save(table);

      return {
        status: "CREATED",
        table: tableToDto(table),
      } satisfies CreateTableResult;
    });

    if (result.status === "CONFLICT") {
      return denied(IdempotencyFailureCodes.PayloadConflict);
    }

    return result.response;
  }

  openTab(
    context: CurrentContextDto,
    unitId: string | null,
    idempotencyKey: string | null,
    body: OpenTabRequestDto,
    correlationContext: RequestCorrelationContext,
  ): OpenTabHttpResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.OperationTabOpen) ||
      typeof body.tableId !== "string"
    ) {
      return denied("AUTH_FORBIDDEN");
    }

    const result = this.openTabs.open({
      actorId: context.user.id,
      causationId: correlationContext.requestId,
      correlationId: correlationContext.correlationId,
      idempotencyKey,
      tableId: body.tableId,
      tenantId: context.tenant.id,
      unitId,
    });

    if (result.status === "OPENED") {
      return {
        status: "OPENED",
        tab: this.tabToDto(result.tab),
      };
    }

    return this.openTabFailure(result.reason);
  }

  getTab(context: CurrentContextDto, unitId: string | null, tabId: TabId): GetTabResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.OperationTabRead)
    ) {
      return denied("AUTH_FORBIDDEN");
    }

    const tab = this.tabs.find(context.tenant.id, unitId, tabId);

    if (!tab) {
      return denied("NOT_FOUND");
    }

    return {
      status: "FOUND",
      tab: this.tabToDto(tab),
    };
  }

  addItem(
    context: CurrentContextDto,
    unitId: string | null,
    tabId: TabId,
    idempotencyKey: string | null,
    body: AddItemRequestDto,
    correlationContext: RequestCorrelationContext,
  ): AddItemHttpResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.OperationOrderItemCreate) ||
      typeof body.productId !== "string" ||
      typeof body.quantity !== "number"
    ) {
      return denied("AUTH_FORBIDDEN");
    }

    const result = this.itemService.add({
      actorId: context.user.id,
      causationId: correlationContext.requestId,
      correlationId: correlationContext.correlationId,
      idempotencyKey,
      productId: body.productId,
      quantity: body.quantity,
      tabId,
      tenantId: context.tenant.id,
      unitId,
    });

    if (result.status === "ADDED") {
      return {
        item: orderItemToDto(result.item),
        status: "ADDED",
      };
    }

    return this.addItemFailure(result.reason);
  }

  updateItemQuantity(
    context: CurrentContextDto,
    unitId: string | null,
    tabId: TabId,
    itemId: string,
    idempotencyKey: string | null,
    body: UpdateItemQuantityRequestDto,
  ): UpdateItemQuantityHttpResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.OperationOrderItemUpdate) ||
      typeof body.quantity !== "number"
    ) {
      return denied("AUTH_FORBIDDEN");
    }

    const result = this.itemService.changeQuantity({
      actorId: context.user.id,
      idempotencyKey,
      itemId,
      quantity: body.quantity,
      tabId,
      tenantId: context.tenant.id,
      unitId,
    });

    if (result.status === "UPDATED") {
      return {
        item: orderItemToDto(result.item),
        status: "UPDATED",
      };
    }

    return this.itemMutationFailure(result.reason);
  }

  cancelItem(
    context: CurrentContextDto,
    unitId: string | null,
    tabId: TabId,
    itemId: string,
    idempotencyKey: string | null,
    body: CancelItemRequestDto,
  ): CancelItemHttpResult {
    if (
      !this.canAccessUnit(context, unitId) ||
      !context.permissions.includes(Permissions.OperationOrderItemCancel) ||
      typeof body.reason !== "string"
    ) {
      return denied("AUTH_FORBIDDEN");
    }

    const result = this.itemService.cancel({
      actorId: context.user.id,
      idempotencyKey,
      itemId,
      reason: body.reason,
      tabId,
      tenantId: context.tenant.id,
      unitId,
    });

    if (result.status === "CANCELLED") {
      return {
        item: orderItemToDto(result.item),
        status: "CANCELLED",
      };
    }

    return this.itemMutationFailure(result.reason);
  }

  forbidden(context: RequestCorrelationContext): ErrorResponseDto {
    return {
      code: "AUTH_FORBIDDEN",
      correlationId: context.correlationId,
      message: "Ator sem autorização para o escopo.",
      requestId: context.requestId,
    };
  }

  notFound(context: RequestCorrelationContext): ErrorResponseDto {
    return {
      code: "NOT_FOUND",
      correlationId: context.correlationId,
      message: "Recurso inexistente ou não visível no escopo autorizado.",
      requestId: context.requestId,
    };
  }

  domainError(context: RequestCorrelationContext, code = "DOMAIN_ERROR"): ErrorResponseDto {
    return {
      code,
      correlationId: context.correlationId,
      message: "Regra de domínio impediu a operação.",
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

  private tabToDto(tab: Tab): TabDto {
    return {
      id: tab.id,
      items: this.orderItems.listByTab(tab.tenantId, tab.unitId, tab.id).map(orderItemToDto),
      status: tab.status,
      tableId: tab.tableId,
    };
  }

  private openTabFailure(reason: string): OperationHttpDenied {
    if (reason === OpenTabFailureReasons.IdempotencyPayloadConflict) {
      return denied("IDEMPOTENCY_PAYLOAD_CONFLICT");
    }

    if (reason === OpenTabFailureReasons.TableNotFound) {
      return denied("NOT_FOUND");
    }

    return denied("DOMAIN_ERROR", reason);
  }

  private addItemFailure(reason: string): OperationHttpDenied {
    if (reason === AddOrderItemFailureReasons.IdempotencyPayloadConflict) {
      return denied("IDEMPOTENCY_PAYLOAD_CONFLICT");
    }

    if (
      reason === AddOrderItemFailureReasons.ProductNotFound ||
      reason === AddOrderItemFailureReasons.TabNotFound
    ) {
      return denied("NOT_FOUND");
    }

    return denied("DOMAIN_ERROR", reason);
  }

  private itemMutationFailure(reason: string): OperationHttpDenied {
    if (reason === OrderItemMutationFailureReasons.IdempotencyPayloadConflict) {
      return denied("IDEMPOTENCY_PAYLOAD_CONFLICT");
    }

    if (
      reason === OrderItemMutationFailureReasons.ItemNotFound ||
      reason === OrderItemMutationFailureReasons.TabNotFound
    ) {
      return denied("NOT_FOUND");
    }

    return denied("DOMAIN_ERROR", reason);
  }
}

function tableToDto(table: RestaurantTable): RestaurantTableDto {
  return {
    code: table.code,
    id: table.id,
    status: table.status,
  };
}

function orderItemToDto(item: OrderItem): OrderItemDto {
  return {
    id: item.id,
    productId: item.productId,
    productNameSnapshot: item.productNameSnapshot,
    quantity: item.quantity,
    status: item.status,
    unitPriceCents: item.unitPriceCents,
  };
}

function normalizeTableCode(code: unknown): string | null {
  if (typeof code !== "string") {
    return null;
  }

  const normalized = code.trim();

  if (normalized.length < 1 || normalized.length > 20) {
    return null;
  }

  return normalized;
}

function denied(errorCode: OperationHttpErrorCode, domainCode?: string): OperationHttpDenied {
  if (!domainCode) {
    return {
      errorCode,
      status: "DENIED",
    };
  }

  return {
    domainCode,
    errorCode,
    status: "DENIED",
  };
}
