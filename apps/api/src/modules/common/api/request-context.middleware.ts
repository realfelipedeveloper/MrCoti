import { randomUUID } from "node:crypto";

import type { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

export interface RequestCorrelationContext {
  readonly correlationId: string;
  readonly requestId: string;
}

export type RequestWithCorrelationContext = Request & {
  readonly mrcoti: RequestCorrelationContext;
};

const REQUEST_ID_HEADER = "x-request-id";
const CORRELATION_ID_HEADER = "x-correlation-id";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const context = resolveRequestCorrelationContext(request);

    Object.defineProperty(request, "mrcoti", {
      configurable: false,
      enumerable: false,
      value: context,
      writable: false,
    });

    response.setHeader("X-Request-Id", context.requestId);
    response.setHeader("X-Correlation-Id", context.correlationId);

    next();
  }
}

export function resolveRequestCorrelationContext(request: Request): RequestCorrelationContext {
  const requestId = headerValue(request, REQUEST_ID_HEADER) ?? randomUUID();
  const correlationId = headerValue(request, CORRELATION_ID_HEADER) ?? requestId;

  return {
    correlationId,
    requestId,
  };
}

export function requestCorrelationContext(request: Request): RequestCorrelationContext {
  const maybeContext = (request as Partial<RequestWithCorrelationContext>).mrcoti;

  if (maybeContext) {
    return maybeContext;
  }

  return resolveRequestCorrelationContext(request);
}

function headerValue(request: Request, headerName: string): string | null {
  const value = request.header(headerName)?.trim();

  return value ? value : null;
}
