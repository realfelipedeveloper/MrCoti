import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type { RequestCorrelationContext } from "../../common/api";
import type { TenantStatus } from "../../platform/domain";
import { TenantContextGuard } from "../../platform/application";
import {
  LocalAuthenticationService,
  RbacPolicy,
  type AuthenticatedLocalUserContext,
  type Permission,
} from "../application";

export interface LoginRequestDto {
  readonly email?: unknown;
  readonly password?: unknown;
}

export interface AuthenticatedUserDto {
  readonly displayName: string;
  readonly id: string;
}

export interface TenantDto {
  readonly id: string;
  readonly name: string;
  readonly status: Extract<TenantStatus, "ACTIVE" | "SUSPENDED">;
}

export interface UnitDto {
  readonly id: string;
  readonly name: string;
  readonly status: "ACTIVE" | "INACTIVE";
}

export interface CurrentContextDto {
  readonly permissions: readonly Permission[];
  readonly roles: readonly string[];
  readonly tenant: TenantDto;
  readonly units: readonly UnitDto[];
  readonly user: AuthenticatedUserDto;
}

export interface LoginResponseDto {
  readonly accessToken: string;
  readonly context: CurrentContextDto;
  readonly expiresInSeconds: number;
}

export interface ErrorResponseDto {
  readonly code: string;
  readonly correlationId: string;
  readonly message: string;
  readonly requestId: string;
}

export interface TenantDirectoryPort {
  findTenant(tenantId: string): Promise<TenantDto | null>;
  listUnits(tenantId: string, unitIds: readonly string[]): Promise<readonly UnitDto[]>;
}

interface LocalSessionRecord {
  readonly context: CurrentContextDto;
  readonly expiresAt: number;
}

export class InMemoryLocalSessionStore {
  private readonly sessions = new Map<string, LocalSessionRecord>();

  constructor(private readonly ttlSeconds = 900) {}

  create(context: CurrentContextDto): Pick<LoginResponseDto, "accessToken" | "expiresInSeconds"> {
    const accessToken = `mrcoti-local-${randomUUID()}`;
    this.sessions.set(accessToken, {
      context,
      expiresAt: Date.now() + this.ttlSeconds * 1_000,
    });

    return {
      accessToken,
      expiresInSeconds: this.ttlSeconds,
    };
  }

  get(accessToken: string): CurrentContextDto | null {
    const session = this.sessions.get(accessToken);

    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(accessToken);
      return null;
    }

    return session.context;
  }

  revoke(accessToken: string): void {
    this.sessions.delete(accessToken);
  }
}

@Injectable()
export class AuthHttpService {
  constructor(
    private readonly localAuthentication: LocalAuthenticationService,
    private readonly tenantContextGuard: TenantContextGuard,
    private readonly rbacPolicy: RbacPolicy,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly sessions: InMemoryLocalSessionStore,
  ) {}

  async login(body: LoginRequestDto): Promise<LoginResponseDto | null> {
    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return null;
    }

    const authentication = await this.localAuthentication.authenticate({
      password: body.password,
      syntheticEmail: body.email,
    });

    if (!authentication.authenticated) {
      return null;
    }

    const context = await this.buildCurrentContext(authentication.context);

    if (!context) {
      return null;
    }

    return {
      ...this.sessions.create(context),
      context,
    };
  }

  currentContext(accessToken: string | null): CurrentContextDto | null {
    if (!accessToken) {
      return null;
    }

    return this.sessions.get(accessToken);
  }

  logout(accessToken: string | null): boolean {
    if (!accessToken || !this.sessions.get(accessToken)) {
      return false;
    }

    this.sessions.revoke(accessToken);
    return true;
  }

  unauthorized(context: RequestCorrelationContext): ErrorResponseDto {
    return {
      code: "AUTH_INVALID",
      correlationId: context.correlationId,
      message: "Credencial ausente, inválida ou expirada.",
      requestId: context.requestId,
    };
  }

  private async buildCurrentContext(
    authentication: AuthenticatedLocalUserContext,
  ): Promise<CurrentContextDto | null> {
    const tenantResolution = this.tenantContextGuard.resolve({
      authentication,
    });

    if (!tenantResolution.authorized) {
      return null;
    }

    const tenant = await this.tenantDirectory.findTenant(tenantResolution.context.tenantId);

    if (!tenant) {
      return null;
    }

    const units = await this.tenantDirectory.listUnits(
      tenantResolution.context.tenantId,
      tenantResolution.context.unitIds,
    );

    return {
      permissions: this.rbacPolicy.listPermissions(tenantResolution.context),
      roles: uniqueSorted(tenantResolution.context.roles.map((role) => role.role)),
      tenant,
      units,
      user: {
        displayName: authentication.user.displayName,
        id: authentication.user.id,
      },
    };
  }
}

export function bearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort();
}
