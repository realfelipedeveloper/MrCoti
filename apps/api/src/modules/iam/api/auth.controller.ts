import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

import { requestCorrelationContext } from "../../common/api";
import { AuthHttpService, bearerToken, type LoginRequestDto } from "./auth-http.service";

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthHttpService) {}

  @Post("auth/login")
  @HttpCode(200)
  async login(@Body() body: LoginRequestDto, @Req() request: Request) {
    const result = await this.auth.login(body);

    if (!result) {
      throw this.unauthorized(request);
    }

    return result;
  }

  @Post("auth/logout")
  @HttpCode(204)
  logout(@Req() request: Request): void {
    const loggedOut = this.auth.logout(bearerToken(request.header("authorization")));

    if (!loggedOut) {
      throw this.unauthorized(request);
    }
  }

  @Get("me")
  me(@Req() request: Request) {
    const context = this.auth.currentContext(bearerToken(request.header("authorization")));

    if (!context) {
      throw this.unauthorized(request);
    }

    return context;
  }

  @Get("units")
  units(@Req() request: Request) {
    const context = this.auth.currentContext(bearerToken(request.header("authorization")));

    if (!context) {
      throw this.unauthorized(request);
    }

    return context.units;
  }

  private unauthorized(request: Request): HttpException {
    return new HttpException(
      this.auth.unauthorized(requestCorrelationContext(request)),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
