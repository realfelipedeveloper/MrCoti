import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req } from "@nestjs/common";
import type { Request } from "express";

import { requestCorrelationContext } from "../../common/api";
import { AuthHttpService, bearerToken } from "../../iam/api";
import {
  CatalogHttpService,
  type CreateCategoryRequestDto,
  type CreateProductRequestDto,
} from "./catalog-http.service";

@Controller("catalog")
export class CatalogController {
  constructor(
    private readonly auth: AuthHttpService,
    private readonly catalog: CatalogHttpService,
  ) {}

  @Get("categories")
  categories(@Req() request: Request) {
    const context = this.auth.currentContext(bearerToken(request.header("authorization")));

    if (!context) {
      throw this.unauthorized(request);
    }

    const categories = this.catalog.listCategories(context, request.header("x-unit-id") ?? null);

    if (!categories) {
      throw this.forbidden(request);
    }

    return categories;
  }

  @Post("categories")
  createCategory(@Body() body: CreateCategoryRequestDto, @Req() request: Request) {
    const context = this.auth.currentContext(bearerToken(request.header("authorization")));

    if (!context) {
      throw this.unauthorized(request);
    }

    const result = this.catalog.createCategory(
      context,
      request.header("x-unit-id") ?? null,
      request.header("idempotency-key") ?? null,
      body,
      requestCorrelationContext(request),
    );

    if (result.status === "DENIED" && result.errorCode === "IDEMPOTENCY_PAYLOAD_CONFLICT") {
      throw new HttpException(
        this.catalog.idempotencyConflict(requestCorrelationContext(request)),
        HttpStatus.CONFLICT,
      );
    }

    if (result.status === "DENIED") {
      throw this.forbidden(request);
    }

    return result.category;
  }

  @Get("products")
  products(@Query("status") status: string | undefined, @Req() request: Request) {
    const context = this.auth.currentContext(bearerToken(request.header("authorization")));

    if (!context) {
      throw this.unauthorized(request);
    }

    const products = this.catalog.listProducts(
      context,
      request.header("x-unit-id") ?? null,
      status ?? null,
    );

    if (!products) {
      throw this.forbidden(request);
    }

    return products;
  }

  @Post("products")
  createProduct(@Body() body: CreateProductRequestDto, @Req() request: Request) {
    const context = this.auth.currentContext(bearerToken(request.header("authorization")));

    if (!context) {
      throw this.unauthorized(request);
    }

    const result = this.catalog.createProduct(
      context,
      request.header("x-unit-id") ?? null,
      request.header("idempotency-key") ?? null,
      body,
      requestCorrelationContext(request),
    );

    if (result.status === "DENIED" && result.errorCode === "IDEMPOTENCY_PAYLOAD_CONFLICT") {
      throw new HttpException(
        this.catalog.idempotencyConflict(requestCorrelationContext(request)),
        HttpStatus.CONFLICT,
      );
    }

    if (result.status === "DENIED") {
      throw this.forbidden(request);
    }

    return result.product;
  }

  private unauthorized(request: Request): HttpException {
    return new HttpException(
      this.auth.unauthorized(requestCorrelationContext(request)),
      HttpStatus.UNAUTHORIZED,
    );
  }

  private forbidden(request: Request): HttpException {
    return new HttpException(
      this.catalog.forbidden(requestCorrelationContext(request)),
      HttpStatus.FORBIDDEN,
    );
  }
}
