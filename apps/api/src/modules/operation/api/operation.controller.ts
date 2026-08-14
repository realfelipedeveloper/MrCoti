import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

import { requestCorrelationContext } from "../../common/api";
import { AuthHttpService, bearerToken } from "../../iam/api";
import {
  type AddItemRequestDto,
  type CancelItemRequestDto,
  OperationHttpService,
  type OpenTabRequestDto,
  type OperationHttpDenied,
  type UpdateItemQuantityRequestDto,
} from "./operation-http.service";

@Controller()
export class OperationController {
  constructor(
    private readonly auth: AuthHttpService,
    private readonly operation: OperationHttpService,
  ) {}

  @Get("tables")
  tables(@Req() request: Request) {
    const context = this.currentContext(request);
    const tables = this.operation.listTables(context, request.header("x-unit-id") ?? null);

    if (!tables) {
      throw this.forbidden(request);
    }

    return tables;
  }

  @Post("tables")
  createTable(@Body() body: { readonly code?: unknown }, @Req() request: Request) {
    const context = this.currentContext(request);
    const result = this.operation.createTable(
      context,
      request.header("x-unit-id") ?? null,
      request.header("idempotency-key") ?? null,
      body,
    );

    if (result.status === "DENIED") {
      throw this.denied(request, result);
    }

    return result.table;
  }

  @Post("tabs")
  openTab(@Body() body: OpenTabRequestDto, @Req() request: Request) {
    const context = this.currentContext(request);
    const result = this.operation.openTab(
      context,
      request.header("x-unit-id") ?? null,
      request.header("idempotency-key") ?? null,
      body,
      requestCorrelationContext(request),
    );

    if (result.status === "DENIED") {
      throw this.denied(request, result);
    }

    return result.tab;
  }

  @Get("tabs/:tabId")
  tab(@Param("tabId") tabId: string, @Req() request: Request) {
    const context = this.currentContext(request);
    const result = this.operation.getTab(context, request.header("x-unit-id") ?? null, tabId);

    if (result.status === "DENIED") {
      throw this.denied(request, result);
    }

    return result.tab;
  }

  @Post("tabs/:tabId/items")
  addItem(@Param("tabId") tabId: string, @Body() body: AddItemRequestDto, @Req() request: Request) {
    const context = this.currentContext(request);
    const result = this.operation.addItem(
      context,
      request.header("x-unit-id") ?? null,
      tabId,
      request.header("idempotency-key") ?? null,
      body,
      requestCorrelationContext(request),
    );

    if (result.status === "DENIED") {
      throw this.denied(request, result);
    }

    return result.item;
  }

  @Patch("tabs/:tabId/items/:itemId")
  updateItemQuantity(
    @Param("tabId") tabId: string,
    @Param("itemId") itemId: string,
    @Body() body: UpdateItemQuantityRequestDto,
    @Req() request: Request,
  ) {
    const context = this.currentContext(request);
    const result = this.operation.updateItemQuantity(
      context,
      request.header("x-unit-id") ?? null,
      tabId,
      itemId,
      request.header("idempotency-key") ?? null,
      body,
    );

    if (result.status === "DENIED") {
      throw this.denied(request, result);
    }

    return result.item;
  }

  @Post("tabs/:tabId/items/:itemId/cancel")
  @HttpCode(HttpStatus.OK)
  cancelItem(
    @Param("tabId") tabId: string,
    @Param("itemId") itemId: string,
    @Body() body: CancelItemRequestDto,
    @Req() request: Request,
  ) {
    const context = this.currentContext(request);
    const result = this.operation.cancelItem(
      context,
      request.header("x-unit-id") ?? null,
      tabId,
      itemId,
      request.header("idempotency-key") ?? null,
      body,
    );

    if (result.status === "DENIED") {
      throw this.denied(request, result);
    }

    return result.item;
  }

  private currentContext(request: Request) {
    const context = this.auth.currentContext(bearerToken(request.header("authorization")));

    if (!context) {
      throw new HttpException(
        this.auth.unauthorized(requestCorrelationContext(request)),
        HttpStatus.UNAUTHORIZED,
      );
    }

    return context;
  }

  private forbidden(request: Request): HttpException {
    return new HttpException(
      this.operation.forbidden(requestCorrelationContext(request)),
      HttpStatus.FORBIDDEN,
    );
  }

  private denied(request: Request, result: OperationHttpDenied): HttpException {
    const context = requestCorrelationContext(request);

    if (result.errorCode === "IDEMPOTENCY_PAYLOAD_CONFLICT") {
      return new HttpException(this.operation.idempotencyConflict(context), HttpStatus.CONFLICT);
    }

    if (result.errorCode === "NOT_FOUND") {
      return new HttpException(this.operation.notFound(context), HttpStatus.NOT_FOUND);
    }

    if (result.errorCode === "DOMAIN_ERROR") {
      return new HttpException(
        this.operation.domainError(context, result.domainCode),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.forbidden(request);
  }
}
