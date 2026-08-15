# Parecer de revisão — MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Feature:** `002-mvp-local-first-slice`  
**Data da execução:** 2026-06-26  
**Atualizado em:** 2026-08-14  
**Escopo:** validação e evidências da spec implementável dev/local

## Resultado

**APROVADA COM CONDIÇÕES PARA IMPLEMENTAÇÃO DEV/LOCAL.**

A especificação da primeira fatia local está estruturalmente consistente e pronta
para implementação em ordem pelas tasks aprovadas. A implementação dev/local foi
autorizada após CHK024 e segue limitada a dados sintéticos, Docker local, sem
produção, sem AWS real, sem providers reais e sem microsserviços.

CHK024 foi satisfeito em 2026-07-11 por aprovação explícita de Felipe Almeida,
registrada em `approval-record.md`. T001–T029 foram concluídas nesta revisão.
CHK048 da fundação permanece `PENDING LEGAL REVIEW` apenas como gatilho futuro para
produção/tratamento real de dados pessoais e não bloqueia a implementação dev/local
com dados sintéticos.

## Validações executadas

| Verificação                       | Resultado                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arquivos obrigatórios da spec 002 | PASSA                                                                                                                                                       |
| Requisitos locais                 | PASSA: RF-001–016, RNF-001–010, RSD-001–010                                                                                                                 |
| Critérios de sucesso              | PASSA: CS-001–008                                                                                                                                           |
| Tasks planejadas                  | PASSA: T001–T029 concluídas; T030–T053 abertas em ordem                                                                                                     |
| Checklist                         | PASSA: CHK001–CHK028 sequenciais, todos fechados                                                                                                            |
| OpenAPI                           | PASSA: JSON válido, 114 refs internas válidas e 16 operations                                                                                               |
| Escopo proibido                   | PASSA: sem `local-prod`, produção, AWS real, providers reais, dados reais, billing real, fiscalidade real, microsserviços ou containers Mr Coti em execução |

## Decisão de escopo

A fatia cobre:

- login local sintético;
- tenant, unidade, membership e RBAC mínimo;
- categorias e produtos;
- mesas, comandas e itens com snapshots;
- fechamento com pagamento fake;
- idempotência, auditoria, outbox e testes planejados.

Ficam fora:

- produção;
- `local-prod`, staging/homologação;
- dados pessoais reais;
- billing real;
- fiscalidade real;
- provedores reais;
- AWS real provisionada;
- nota/e-mail fake;
- estoque, caixa avançado e relatórios;
- microsserviços.

## Pendência

| Item               | Estado                   | Impacto                                                                                   |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| CHK024             | APPROVED WITH CONDITIONS | satisfeito em 2026-07-11; implementação autorizada em ordem pelas tasks                   |
| CHK048 da fundação | PENDING LEGAL REVIEW     | gatilho futuro se produção/dados reais forem reabertos; não bloqueia a spec 002 dev/local |

## Preflight local T003 — 2026-07-11

Preflight executado sem alterar ambiente, sem iniciar containers e sem criar arquivos
de implementação.

| Verificação                  | Resultado                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Docker Desktop / Engine      | PASSA: Docker Desktop 4.46.0; Engine 28.4.0; context `desktop-linux`                                                                      |
| Docker Compose               | PASSA: v2.39.2-desktop.1                                                                                                                  |
| Containers em execução       | PASSA: nenhum container ativo em `docker ps`                                                                                              |
| Portas candidatas do Mr Coti | PASSA: nenhuma porta candidata em listen (`3200`, `3201`, `3308`, `6380`, `3400`, `3401`, `3402`, `9091`, `9100`, `9101`, `1026`, `8026`) |
| Alteração de ambiente        | PASSA: nenhuma stack subida; nenhum comando destrutivo executado                                                                          |

## Scaffold T004 — 2026-07-11

Scaffold controlado criado sem instalar dependências, sem gerar lockfile, sem criar
Dockerfile/Compose e sem implementar código de aplicação.

| Área           | Evidência                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Workspace raiz | `package.json` privado com workspaces `apps/*` e `packages/*`                                             |
| API            | `apps/api/package.json`, `apps/api/README.md`, `apps/api/src/README.md`, `apps/api/test/README.md`        |
| Web            | `apps/web/package.json`, `apps/web/README.md`, `apps/web/app/README.md`, `apps/web/src/README.md`         |
| Contratos      | `packages/contracts/package.json`, `packages/contracts/README.md`, `packages/contracts/openapi/README.md` |
| Shared         | `packages/shared/package.json`, `packages/shared/README.md`, `packages/shared/src/README.md`              |
| Higiene local  | `.gitignore` para dependências, builds, envs locais, logs e dados runtime                                 |

Validações executadas:

| Verificação                | Resultado                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| Node local                 | PASSA: `v24.14.1`                                                                               |
| npm local                  | PASSA: `11.11.0`                                                                                |
| JSON dos package manifests | PASSA: raiz, API, Web, Contracts e Shared válidos                                               |
| Workspaces npm             | PASSA: `apps/*`, `packages/*` reconhecidos                                                      |
| Escopo                     | PASSA: sem dependências instaladas, sem lockfile, sem Dockerfile/Compose, sem código `.ts/.tsx` |

## Tooling T005 — 2026-07-11

Tooling mínimo configurado para TypeScript, lint, formatação e scripts locais, sem
tecnologias fora da stack aprovada e sem implementar domínio ou rotas.

Artefatos criados/alterados:

| Área             | Evidência                                                                               |
| ---------------- | --------------------------------------------------------------------------------------- |
| Dependências dev | `typescript`, `eslint`, `@eslint/js`, `typescript-eslint`, `prettier`                   |
| Lockfile         | `package-lock.json` criado por `npm install`                                            |
| Scripts locais   | `lint`, `format`, `format:write`, `typecheck`, `verify` em `package.json`               |
| TypeScript       | `tsconfig.base.json`, `tsconfig.json` e tsconfigs por workspace                         |
| ESLint           | `eslint.config.mjs` com flat config e ignores para docs/specs/builds                    |
| Prettier         | `.prettierrc.json` e `.prettierignore`                                                  |
| Placeholders TS  | `src/index.ts` vazio em API, Web, Contracts e Shared para validar typecheck sem domínio |

Validações executadas:

| Comando                                                                          | Resultado                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------- |
| `npm install --save-dev typescript eslint @eslint/js typescript-eslint prettier` | PASSA: 93 pacotes adicionados, 0 vulnerabilidades |
| `npm run lint`                                                                   | PASSA                                             |
| `npm run format`                                                                 | PASSA                                             |
| `npm run typecheck`                                                              | PASSA                                             |
| `npm run verify`                                                                 | PASSA                                             |
| `npm audit --audit-level=moderate`                                               | PASSA: 0 vulnerabilidades                         |

Observação: TypeScript 6 exige `baseUrl` para aliases não relativos; o config usa
`ignoreDeprecations: "6.0"` até migração futura dos aliases, sem afetar código de
domínio.

## Env examples T006 — 2026-07-11

Exemplos de ambiente criados sem credenciais funcionais e com portas configuráveis
para runtime dev/local via Docker Desktop/local Docker.

| Arquivo                 | Finalidade                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `.env.example`          | variáveis dev/local compartilhadas, portas, URLs, MySQL, Redis opcional, headers e seeds demo |
| `apps/api/.env.example` | variáveis consumidas pela API                                                                 |
| `apps/web/.env.example` | variáveis públicas/locais consumidas pelo frontend                                            |

Validações executadas:

| Verificação                  | Resultado                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Busca por `.env*`            | PASSA: apenas `.env.example`, `apps/api/.env.example` e `apps/web/.env.example` |
| Placeholders de segredo      | PASSA: senhas/secrets usam `<replace-with-...>`                                 |
| Scan simples de segredo real | PASSA: nenhum token/chave longa ou padrão comum detectado                       |
| `npm run verify`             | PASSA                                                                           |

## Docker Compose T007 — 2026-07-11

Docker Compose local criado para runtime dev/local, sem `local-prod`, sem produção e
sem AWS real. A stack não foi iniciada nesta validação.

| Serviço | Estado no compose        | Porta host padrão | Observação                                                                  |
| ------- | ------------------------ | ----------------: | --------------------------------------------------------------------------- |
| `mysql` | padrão                   |            `3308` | MySQL `8.4`; exige `MYSQL_PASSWORD` e `MYSQL_ROOT_PASSWORD` em `.env` local |
| `redis` | profile opcional `redis` |            `6380` | Redis `7.4-alpine`; exige `REDIS_PASSWORD`; não sobe por padrão             |

Validações executadas:

| Verificação                                     | Resultado                               |
| ----------------------------------------------- | --------------------------------------- |
| `docker compose config --quiet`                 | PASSA                                   |
| `docker compose --profile redis config --quiet` | PASSA                                   |
| Portas `3308`/`6380`                            | PASSA: livres no momento da verificação |
| Containers Mr Coti                              | PASSA: nenhum container iniciado        |
| Scan simples de segredo real em env/compose     | PASSA                                   |
| `npm run verify`                                | PASSA                                   |
| `npm audit --audit-level=moderate`              | PASSA: 0 vulnerabilidades               |

## OpenAPI gate T008 — 2026-07-11

Gate local de contrato configurado sem dependência adicional.

Artefatos:

| Arquivo                        | Finalidade                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `scripts/validate-openapi.mjs` | valida JSON, versão OpenAPI 3.x, `info.title`, `paths`, operações HTTP e `$ref` internos |
| `package.json`                 | adiciona `contract:check` e inclui o gate em `verify`                                    |

Validações executadas:

| Comando                  | Resultado                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `npm run contract:check` | PASSA: fundação `paths=21`, `ops=21`, `refs=276`; spec 002 `paths=13`, `ops=16`, `refs=114` |
| `npm run verify`         | PASSA: lint, format, typecheck e contrato                                                   |

## Core SaaS/IAM T009 — 2026-07-11

Modelo inicial de domínio e persistência para identidade, tenant, empresa, unidade,
membership e role assignment criado sem executar banco, migration ou seed.

Artefatos:

| Área                | Evidência                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Dependências Prisma | `@prisma/client@6.19.3` e `prisma@6.19.3` no workspace `@mrcoti/api`                                                       |
| Schema Prisma       | `apps/api/prisma/schema.prisma`                                                                                            |
| Domínio comum       | `apps/api/src/modules/common/domain`                                                                                       |
| Plataforma          | `apps/api/src/modules/platform/domain/tenant.entity.ts`                                                                    |
| Organização         | `apps/api/src/modules/organization/domain/company.entity.ts`, `unit.entity.ts`                                             |
| IAM                 | `apps/api/src/modules/iam/domain/identity-user.entity.ts`, `membership.entity.ts`, `role-assignment.entity.ts`, `roles.ts` |

Decisões implementadas:

- IDs opacos como `string`, sem autoridade embutida.
- `tenantId` explícito em entidades tenant-aware.
- Papéis MVP: `TENANT_OWNER`, `UNIT_MANAGER`, `WAITER`, `CASHIER`, `AUDITOR`.
- `IdentityUser.syntheticEmail` e `passwordHash`, sem senha em claro e sem PII real.
- Prisma schema MySQL com relações, índices e unicidade `Membership(tenantId, userId)`.

Validações executadas:

| Comando                                           | Resultado                                          |
| ------------------------------------------------- | -------------------------------------------------- |
| `npm run prisma:validate --workspace @mrcoti/api` | PASSA com `DATABASE_URL` temporária de placeholder |
| `npm run verify`                                  | PASSA                                              |
| `npm audit --audit-level=moderate`                | PASSA: 0 vulnerabilidades                          |

Observação: a instalação inicial do Prisma trouxe uma versão dev/pré-release com
alerta moderado de audit. O workspace foi corrigido para `prisma@6.19.3` e
`@prisma/client@6.19.3`, eliminando vulnerabilidades conhecidas no audit local.

## Autenticação local T010 — 2026-07-11

Hash de senha e autenticação local de usuários sintéticos implementados em camada de
aplicação, sem rota HTTP ainda, sem token real persistido e sem dados pessoais reais.

Artefatos:

| Área                  | Evidência                                                                   |
| --------------------- | --------------------------------------------------------------------------- |
| Test runner           | `jest.config.mjs`; scripts `test` e `verify` em `package.json`              |
| Dependências de teste | `jest`, `ts-jest`, `@types/jest`, `@types/node`                             |
| Hash de senha         | `apps/api/src/modules/iam/application/password-hasher.ts`                   |
| Autenticação local    | `apps/api/src/modules/iam/application/local-authentication.service.ts`      |
| Testes auth           | `apps/api/src/modules/iam/application/local-authentication.service.spec.ts` |
| Export público local  | `apps/api/src/modules/iam/application/index.ts`, `apps/api/src/index.ts`    |

Decisões implementadas:

- Hash com `crypto.scrypt` nativo do Node, salt aleatório e comparação com
  `timingSafeEqual`.
- Formato versionado `mrcoti-scrypt-v1`, permitindo migração futura sem reescrita
  estrutural.
- Login local aceita apenas e-mails sintéticos `.local` normalizados.
- Falhas de usuário inexistente, desabilitado, senha incorreta, membership inativa
  ou ausência de role retornam o mesmo motivo `INVALID_CREDENTIALS`, sem revelar
  existência de identidade ou recurso.
- Contexto autenticado inclui usuário, memberships ativas, tenant, roles e unidades
  derivadas das role assignments.

Validações executadas:

| Comando                                           | Resultado                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `npm run test`                                    | PASSA: 1 suite, 6 testes                                          |
| `npm run verify`                                  | PASSA: lint, format, typecheck, testes e contrato                 |
| `npm run prisma:validate --workspace @mrcoti/api` | PASSA com `DATABASE_URL` temporária de placeholder                |
| `npm audit --audit-level=moderate`                | PASSA: 0 vulnerabilidades                                         |
| `docker compose config --quiet`                   | PASSA com placeholders temporários de senha; sem subir containers |
| `docker ps --filter name=mrcoti`                  | PASSA: nenhum container Mr Coti em execução                       |

## Tenant context T011 — 2026-07-11

Guard de aplicação para contexto confiável de tenant/unidade implementado sem acoplar
o domínio ao HTTP/NestJS. A camada ignora `tenant_id` vindo de payload como
autoridade e resolve o contexto somente a partir da autenticação local e da seleção
explícita de tenant/unidade.

Artefatos:

| Área                    | Evidência                                                                     |
| ----------------------- | ----------------------------------------------------------------------------- |
| Guard de tenant context | `apps/api/src/modules/platform/application/tenant-context.guard.ts`           |
| Testes cross-tenant     | `apps/api/src/modules/platform/application/tenant-context.guard.spec.ts`      |
| Export público local    | `apps/api/src/modules/platform/application/index.ts`, `apps/api/src/index.ts` |

Decisões implementadas:

- `payloadTenantId` pode existir no comando de entrada, mas não é usado como
  autoridade para resolver tenant.
- Quando há múltiplos tenants autenticados e nenhum tenant explícito foi selecionado,
  o guard retorna `TENANT_CONTEXT_REQUIRED` em vez de inferir pelo payload.
- Tentativa de tenant fora do contexto autenticado retorna `TENANT_ACCESS_DENIED`.
- Tentativa de unidade fora das roles do contexto retorna `UNIT_ACCESS_DENIED`.
- Autorização de recurso tenant-aware e unit-aware compara o recurso contra o
  `TrustedTenantContext`, preparando os repositórios/rotas para testes IDOR.

Validações executadas:

| Comando          | Resultado                                                     |
| ---------------- | ------------------------------------------------------------- |
| `npm run verify` | PASSA: lint, format, typecheck, 2 suítes/10 testes e contrato |

## RBAC mínimo T012 — 2026-07-11

Policy RBAC mínima implementada com permissões nomeadas, mapeamento por papel MVP e
negação padrão para ausência de contexto ou permissão desconhecida.

Artefatos:

| Área                  | Evidência                                                  |
| --------------------- | ---------------------------------------------------------- |
| Policy RBAC           | `apps/api/src/modules/iam/application/rbac-policy.ts`      |
| Testes de autorização | `apps/api/src/modules/iam/application/rbac-policy.spec.ts` |
| Export público local  | `apps/api/src/modules/iam/application/index.ts`            |

Decisões implementadas:

- Permissões seguem o padrão `context.resource.action`, alinhado a
  `docs/01-business/actors-and-permissions.md`.
- Papéis MVP cobertos: `TENANT_OWNER`, `UNIT_MANAGER`, `WAITER`, `CASHIER` e
  `AUDITOR`.
- `TENANT_OWNER` recebe todas as permissões MVP definidas; `UNIT_MANAGER`,
  `WAITER`, `CASHIER` e `AUDITOR` recebem subconjuntos proporcionais ao papel.
- Permissão desconhecida é negada, mesmo para `TENANT_OWNER`.
- Ausência de `TrustedTenantContext` é negada com `TENANT_CONTEXT_REQUIRED`.
- Policies futuras ainda refinam propriedade do recurso, estado do agregado, motivo,
  limite comercial, ownership e auditoria.

Validações executadas:

| Comando          | Resultado                                                     |
| ---------------- | ------------------------------------------------------------- |
| `npm run verify` | PASSA: lint, format, typecheck, 3 suítes/16 testes e contrato |

## Rotas auth/contexto T013 — 2026-07-11

Rotas HTTP de autenticação e contexto implementadas conforme o contrato OpenAPI da
spec 002, usando NestJS local e Supertest. Nenhum servidor foi mantido em execução;
os testes usam aplicação Nest em memória.

Artefatos:

| Área                       | Evidência                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Dependências Nest/API      | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs` |
| Dependências de teste HTTP | `@nestjs/testing`, `supertest`, `@types/supertest`, `@types/express`                     |
| Request/correlation IDs    | `apps/api/src/modules/common/api/request-context.middleware.ts`                          |
| Controller HTTP            | `apps/api/src/modules/iam/api/auth.controller.ts`                                        |
| Serviço HTTP local         | `apps/api/src/modules/iam/api/auth-http.service.ts`                                      |
| Testes de contrato/API     | `apps/api/src/modules/iam/api/auth.controller.spec.ts`                                   |
| TypeScript decorators      | `tsconfig.base.json` com `experimentalDecorators` e `emitDecoratorMetadata`              |

Rotas cobertas:

| Rota                       | Resultado validado                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `POST /api/v1/auth/login`  | `200`, `accessToken`, `expiresInSeconds`, `CurrentContext` e headers de correlação |
| `POST /api/v1/auth/logout` | `204` e revogação do token local                                                   |
| `GET /api/v1/me`           | `200` com `CurrentContext` autenticado; `401` sem bearer token                     |
| `GET /api/v1/units`        | `200` com unidades acessíveis; `401` sem bearer token                              |

Decisões implementadas:

- `POST /auth/login` responde `200`, não o `201` padrão do Nest, para aderir ao
  OpenAPI.
- Token local em memória usa prefixo `mrcoti-local-`, expiração curta e não depende
  de segredo produtivo.
- Erro de autenticação usa corpo seguro `AUTH_INVALID`, sem revelar se usuário,
  token, tenant ou unidade existem.
- `X-Request-Id` e `X-Correlation-Id` são preservados quando enviados e gerados
  quando ausentes.
- `CurrentContext.user` não expõe e-mail sintético, senha, token ou outro dado
  sensível.
- Fixtures usadas nos testes são sintéticas; seed runtime fica para T014.

Validações executadas:

| Comando                                           | Resultado                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `npm run verify`                                  | PASSA: lint, format, typecheck, 4 suítes/20 testes e contrato     |
| `npm run prisma:validate --workspace @mrcoti/api` | PASSA com `DATABASE_URL` temporária de placeholder                |
| `npm audit --audit-level=moderate`                | PASSA: 0 vulnerabilidades                                         |
| `docker compose config --quiet`                   | PASSA com placeholders temporários de senha; sem subir containers |
| `docker ps --filter name=mrcoti`                  | PASSA: nenhum container Mr Coti em execução                       |

## Fixtures sintéticas T014 — 2026-07-11

Fixtures locais sintéticas criadas para tenant, unidade e usuários demo dos cinco
papéis MVP, sem dados pessoais reais e sem executar banco/seed runtime.

Artefatos:

| Área                          | Evidência                                                       |
| ----------------------------- | --------------------------------------------------------------- |
| IDs e credenciais demo locais | `apps/api/src/modules/local-demo/demo-fixtures.ts`              |
| Diretório tenant/unidade demo | `DemoTenantDirectory` em `demo-fixtures.ts`                     |
| Usuários demo                 | `DemoUsers` e `createDemoIdentityRecords` em `demo-fixtures.ts` |
| Testes de fixture sintética   | `apps/api/src/modules/local-demo/demo-fixtures.spec.ts`         |
| Integração com rotas auth     | `apps/api/src/modules/iam/api/auth.controller.spec.ts`          |

Dados sintéticos criados:

| Papel          | E-mail sintético            | Escopo       |
| -------------- | --------------------------- | ------------ |
| `TENANT_OWNER` | `owner.demo@mrcoti.local`   | tenant       |
| `UNIT_MANAGER` | `manager.demo@mrcoti.local` | unidade demo |
| `WAITER`       | `waiter.demo@mrcoti.local`  | unidade demo |
| `CASHIER`      | `cashier.demo@mrcoti.local` | unidade demo |
| `AUDITOR`      | `auditor.demo@mrcoti.local` | unidade demo |

Decisões implementadas:

- Todos os e-mails usam domínio `.local` e nomes explicitamente fictícios.
- Senha local demo permanece `demo-password`, tratada como credencial de
  demonstração não secreta; os registros de identidade gerados usam hash via
  `ScryptPasswordHasher`.
- `DemoTenantDirectory` retorna tenant e unidade sintéticos para testes/execução
  local futura.
- Fixture runtime de banco/migration não foi executada; isso permanece dependente
  de migrations e stack local futuras.

Validações executadas:

| Comando                                           | Resultado                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `npm run verify`                                  | PASSA: lint, format, typecheck, 5 suítes/23 testes e contrato     |
| `npm run prisma:validate --workspace @mrcoti/api` | PASSA com `DATABASE_URL` temporária de placeholder                |
| `npm audit --audit-level=moderate`                | PASSA: 0 vulnerabilidades                                         |
| `docker compose config --quiet`                   | PASSA com placeholders temporários de senha; sem subir containers |
| `docker ps --filter name=mrcoti`                  | PASSA: nenhum container Mr Coti em execução                       |

Resultado da fase: Fase 2 — Core SaaS, IAM e tenant context (US-01) concluída de
T009 a T014.

## Catálogo domínio/persistência T015 — 2026-07-11

Modelo inicial de catálogo criado para categorias e produtos no escopo
tenant/unidade, com preço em centavos inteiros, sem migration executada e sem banco
local iniciado.

Artefatos:

| Área                 | Evidência                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Prisma               | `apps/api/prisma/schema.prisma` com `Category`, `Product`, `CategoryStatus` e `ProductStatus` |
| Domínio catálogo     | `apps/api/src/modules/catalog/domain/category.entity.ts` e `product.entity.ts`                |
| IDs opacos           | `CategoryId` e `ProductId` em `apps/api/src/modules/common/domain/ids.ts`                     |
| Export público local | `apps/api/src/modules/catalog/domain/index.ts`, `apps/api/src/index.ts`                       |

Decisões implementadas:

- `Category` usa status `ACTIVE`/`INACTIVE`, alinhado ao OpenAPI.
- `Product` usa status `AVAILABLE`/`UNAVAILABLE`/`INACTIVE`, alinhado ao OpenAPI.
- `Product.priceCents` é `Int` mapeado para `price_cents`.
- Ambas as entidades carregam `tenantId` e `unitId` explicitamente.
- Prisma recebeu relações com `Tenant`, `Unit` e `Category`, além de índices
  tenant-aware para listagem e filtros futuros.
- Unicidade “somente ativos” de categoria permanece como regra de aplicação para
  T016/T017, porque MySQL/Prisma não oferecem partial unique portátil nessa forma
  sem desenho adicional.

Validações executadas:

| Comando                                           | Resultado                                                     |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `npm run prisma:validate --workspace @mrcoti/api` | PASSA com `DATABASE_URL` temporária de placeholder            |
| `npm run verify`                                  | PASSA: lint, format, typecheck, 5 suítes/23 testes e contrato |

## Invariantes de catálogo T016 — 2026-07-11

Invariantes de domínio para categoria e produto implementadas com testes unitários,
sem executar banco e sem acoplar regra de domínio ao HTTP.

Artefatos:

| Área                 | Evidência                                                        |
| -------------------- | ---------------------------------------------------------------- |
| Regras de domínio    | `apps/api/src/modules/catalog/domain/catalog-invariants.ts`      |
| Testes unitários     | `apps/api/src/modules/catalog/domain/catalog-invariants.spec.ts` |
| Export público local | `apps/api/src/modules/catalog/domain/index.ts`                   |

Decisões implementadas:

- Categoria exige tenant/unidade, nome normalizado entre 2 e 80 caracteres,
  `sortOrder` inteiro não negativo e status `ACTIVE`/`INACTIVE`.
- Produto exige tenant/unidade, categoria ativa no mesmo tenant/unidade, nome
  normalizado entre 2 e 120 caracteres e status
  `AVAILABLE`/`UNAVAILABLE`/`INACTIVE`.
- `priceCents` deve ser inteiro, não negativo e menor/igual ao limite técnico do
  `Int` do MySQL/Prisma (`2_147_483_647`), sem representar política comercial.
- Produto em categoria de outro tenant/unidade é rejeitado com
  `CATEGORY_SCOPE_MISMATCH`.

Validações executadas:

| Comando                                           | Resultado                                                     |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `npm run verify`                                  | PASSA: lint, format, typecheck, 6 suítes/29 testes e contrato |
| `npm run prisma:validate --workspace @mrcoti/api` | PASSA com `DATABASE_URL` temporária de placeholder            |

## Rotas de categorias T017 — 2026-07-11

Rotas de categorias implementadas conforme OpenAPI em `/api/v1/catalog/categories`,
com autenticação bearer local, escopo por `X-Unit-Id`, RBAC e idempotência em
memória para o ambiente dev/local.

Artefatos:

| Área                  | Evidência                                                            |
| --------------------- | -------------------------------------------------------------------- |
| Controller catálogo   | `apps/api/src/modules/catalog/api/catalog.controller.ts`             |
| Serviço HTTP catálogo | `apps/api/src/modules/catalog/api/catalog-http.service.ts`           |
| Idempotência local    | `apps/api/src/modules/common/application/idempotency.ts`             |
| Testes API/contrato   | `apps/api/src/modules/catalog/api/catalog.controller.spec.ts`        |
| Exports               | `apps/api/src/modules/catalog/api/index.ts`, `apps/api/src/index.ts` |

Rotas cobertas:

| Rota                              | Resultado validado                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `GET /api/v1/catalog/categories`  | `200` com array de categorias; `401` sem token; `403` para unidade fora do contexto                  |
| `POST /api/v1/catalog/categories` | `201` com `Category`; `403` sem permissão; `409` para mesma chave idempotente com payload divergente |

Decisões implementadas:

- `POST` exige `Idempotency-Key`; chave igual e payload igual retorna a mesma
  resposta; chave igual e payload divergente retorna
  `IDEMPOTENCY_PAYLOAD_CONFLICT`.
- `Unit Manager` cria categorias; `Waiter` lista, mas não cria.
- `X-Unit-Id` deve pertencer ao contexto autenticado; caso contrário, a rota nega
  sem revelar existência de outra unidade.
- A store é em memória nesta etapa; banco/migrations reais seguem fora do que foi
  executado neste corte.

Validações executadas:

| Comando          | Resultado                                                     |
| ---------------- | ------------------------------------------------------------- |
| `npm run verify` | PASSA: lint, format, typecheck, 7 suítes/33 testes e contrato |

## Rotas de produtos T018 — 2026-07-11

Rotas de produtos implementadas conforme OpenAPI em `/api/v1/catalog/products`,
reutilizando autenticação bearer local, `X-Unit-Id`, RBAC, categoria ativa no mesmo
tenant/unidade e idempotência em memória.

Artefatos:

| Área                  | Evidência                                                     |
| --------------------- | ------------------------------------------------------------- |
| Controller catálogo   | `apps/api/src/modules/catalog/api/catalog.controller.ts`      |
| Serviço HTTP catálogo | `apps/api/src/modules/catalog/api/catalog-http.service.ts`    |
| Testes API/contrato   | `apps/api/src/modules/catalog/api/catalog.controller.spec.ts` |

Rotas cobertas:

| Rota                                            | Resultado validado                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `GET /api/v1/catalog/products?status=AVAILABLE` | `200` com array de produtos filtrado por status                                               |
| `POST /api/v1/catalog/products`                 | `201` com `Product`; `403` sem permissão; `409` para chave idempotente com payload divergente |

Decisões implementadas:

- Produto só é criado para categoria existente/ativa no mesmo tenant e unidade.
- `available: false` no request cria produto `UNAVAILABLE`; ausência de `available`
  cria `AVAILABLE`.
- `priceCents` segue as invariantes de T016 antes de entrar na store.
- `Unit Manager` cria produtos; `Waiter` lista, mas não cria.
- A store é em memória nesta etapa; banco/migrations reais seguem fora do que foi
  executado neste corte.

Validações executadas:

| Comando          | Resultado                                                     |
| ---------------- | ------------------------------------------------------------- |
| `npm run verify` | PASSA: lint, format, typecheck, 7 suítes/36 testes e contrato |

## Auditoria de catálogo T019 — 2026-07-11

Auditoria append-only em memória implementada para ações de catálogo, com integração
nas criações de categoria/produto e ações de alteração/desativação modeladas para
rotas futuras.

Artefatos:

| Área                        | Evidência                                                                 |
| --------------------------- | ------------------------------------------------------------------------- |
| Entidade de auditoria       | `apps/api/src/modules/governance/domain/audit-entry.entity.ts`            |
| Audit log em memória        | `apps/api/src/modules/governance/application/in-memory-audit-log.ts`      |
| Testes de audit log         | `apps/api/src/modules/governance/application/in-memory-audit-log.spec.ts` |
| Integração catálogo         | `apps/api/src/modules/catalog/api/catalog-http.service.ts`                |
| Testes integração auditável | `apps/api/src/modules/catalog/api/catalog-http.service.spec.ts`           |

Ações modeladas:

- `catalog.category.created`
- `catalog.category.updated`
- `catalog.category.deactivated`
- `catalog.product.created`
- `catalog.product.updated`
- `catalog.product.deactivated`

Decisões implementadas:

- Criação de categoria/produto grava ator, tenant, unidade, ação, recurso,
  snapshot `after`, `before=null`, motivo nulo e correlation ID.
- Replay idempotente com mesma chave/payload não duplica entrada de auditoria.
- Atualização/desativação ainda não possuem rota OpenAPI nesta fatia, mas as ações
  e o audit log já aceitam `before`, `after`, `reason` e correlation ID.

Validações executadas:

| Comando          | Resultado                                                     |
| ---------------- | ------------------------------------------------------------- |
| `npm run verify` | PASSA: lint, format, typecheck, 9 suítes/38 testes e contrato |

## Testes negativos de catálogo T020 — 2026-07-11

Testes negativos específicos para catálogo adicionados, cobrindo RBAC insuficiente,
unidade fora do contexto autenticado e tentativa de criar produto com categoria de
outro tenant.

Artefatos:

| Área                | Evidência                                                       |
| ------------------- | --------------------------------------------------------------- |
| Testes de serviço   | `apps/api/src/modules/catalog/api/catalog-http.service.spec.ts` |
| Testes API/contrato | `apps/api/src/modules/catalog/api/catalog.controller.spec.ts`   |

Cenários cobertos:

- `Waiter`/ator sem permissão de gestão não cria categoria/produto.
- Listagem/criação com `X-Unit-Id` fora do contexto retorna negação sem expor
  recurso.
- Produto não é criado quando `categoryId` pertence a outro tenant.
- Ações negadas não geram entrada de auditoria.

Validações executadas:

| Comando          | Resultado                                                     |
| ---------------- | ------------------------------------------------------------- |
| `npm run verify` | PASSA: lint, format, typecheck, 9 suítes/41 testes e contrato |

Resultado da fase: Fase 3 — Catálogo mínimo (US-02) concluída de T015 a T020.

## Operação domínio/persistência T021 — 2026-07-11

Modelo inicial de operação criado para mesas, comandas e itens, com estados
compatíveis com OpenAPI e com o modelo conceitual da spec 002, sem migration
executada e sem banco local iniciado.

Artefatos:

| Área                 | Evidência                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Prisma               | `apps/api/prisma/schema.prisma` com `RestaurantTable`, `Tab`, `OrderItem` e enums de estado |
| Domínio operação     | `apps/api/src/modules/operation/domain`                                                     |
| IDs opacos           | `RestaurantTableId`, `TabId` e `OrderItemId` em `apps/api/src/modules/common/domain/ids.ts` |
| Export público local | `apps/api/src/modules/operation/domain/index.ts`, `apps/api/src/index.ts`                   |

Decisões implementadas:

- Mesa usa status `AVAILABLE`/`OCCUPIED`/`BLOCKED`.
- Comanda usa status `OPEN`/`CLOSING`/`CLOSED`/`CANCELLED`.
- Item usa status `ACTIVE`/`CANCELLED`, snapshot de nome/preço, quantidade e motivo
  opcional de cancelamento.
- Todas as entidades carregam `tenantId` e `unitId`.
- `RestaurantTable(tenantId, unitId, code)` é único no schema Prisma.
- Proteção “uma comanda ativa por mesa” permanece como regra de aplicação para T022,
  porque o schema atual evita partial unique portátil sem desenho adicional.

Validações executadas:

| Comando                                           | Resultado                                                     |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `npm run prisma:validate --workspace @mrcoti/api` | PASSA com `DATABASE_URL` temporária de placeholder            |
| `npm run verify`                                  | PASSA: lint, format, typecheck, 9 suítes/41 testes e contrato |

## Abertura de comanda T022 — 2026-07-11

Serviço de aplicação para abertura de comanda implementado em memória, com
idempotência e proteção contra segunda comanda ativa na mesma mesa.

Artefatos:

| Área                     | Evidência                                                                      |
| ------------------------ | ------------------------------------------------------------------------------ |
| Serviço de abertura      | `apps/api/src/modules/operation/application/open-tab.service.ts`               |
| Stores em memória        | `InMemoryRestaurantTableStore`, `InMemoryTabStore`                             |
| Testes domínio/aplicação | `apps/api/src/modules/operation/application/open-tab.service.spec.ts`          |
| Export público local     | `apps/api/src/modules/operation/application/index.ts`, `apps/api/src/index.ts` |

Decisões implementadas:

- Abertura exige `idempotencyKey`.
- Mesa deve existir no mesmo tenant/unidade e estar `AVAILABLE`.
- Ao abrir comanda, o serviço cria `Tab` em `OPEN` e marca a mesa como `OCCUPIED`.
- Chave idempotente igual com payload igual retorna a mesma comanda.
- Chave idempotente igual com payload divergente retorna
  `IDEMPOTENCY_PAYLOAD_CONFLICT`.
- Mesmo que a mesa seja recolocada como `AVAILABLE` por erro externo, uma comanda
  `OPEN`/`CLOSING` existente bloqueia nova abertura na mesma mesa.

Validações executadas:

| Comando          | Resultado                                                      |
| ---------------- | -------------------------------------------------------------- |
| `npm run verify` | PASSA: lint, format, typecheck, 10 suítes/45 testes e contrato |

## Snapshot de produto em item T023 — 2026-07-14

Serviço de aplicação para adicionar item à comanda implementado em memória, com
snapshot imutável de nome e preço do produto no momento da inclusão.

Artefatos:

| Área                      | Evidência                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Serviço de adição de item | `apps/api/src/modules/operation/application/add-order-item.service.ts`                      |
| Store de itens em memória | `InMemoryOrderItemStore`                                                                    |
| Lookup de produto         | `InMemoryProductStore.find` em `apps/api/src/modules/catalog/api/catalog-http.service.ts`   |
| Lookup de comanda         | `InMemoryTabStore.find` em `apps/api/src/modules/operation/application/open-tab.service.ts` |
| Testes domínio/aplicação  | `apps/api/src/modules/operation/application/add-order-item.service.spec.ts`                 |
| Export público local      | `apps/api/src/modules/operation/application/index.ts`                                       |

Decisões implementadas:

- Inclusão exige `idempotencyKey`.
- Comanda deve existir no mesmo tenant/unidade e estar `OPEN`.
- Produto deve existir no mesmo tenant/unidade e estar `AVAILABLE`.
- Quantidade aceita apenas inteiros de 1 a 99.
- Item é criado como `ACTIVE`, com `cancelReason` nulo.
- `productNameSnapshot` e `unitPriceCents` são copiados no momento da inclusão e não
  mudam quando o produto de catálogo é alterado depois.
- Chave idempotente igual com payload igual retorna o mesmo item.
- Chave idempotente igual com payload divergente retorna
  `IDEMPOTENCY_PAYLOAD_CONFLICT`.
- Comandas/produtos de outro tenant são tratados como inexistentes no escopo atual.

Validações executadas:

| Comando                                                                                             | Resultado                                                      |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm test -- --runInBand apps/api/src/modules/operation/application/add-order-item.service.spec.ts` | PASSA: 1 suíte/4 testes                                        |
| `npm run prisma:validate --workspace @mrcoti/api`                                                   | PASSA com `DATABASE_URL` temporária de placeholder             |
| `npm run verify`                                                                                    | PASSA: lint, format, typecheck, 11 suítes/49 testes e contrato |

## Mutação de item T024 — 2026-07-14

Alteração de quantidade e cancelamento de item implementados no serviço de item da
comanda, preservando histórico, motivo de cancelamento e snapshot do produto.

Artefatos:

| Área                      | Evidência                                                                   |
| ------------------------- | --------------------------------------------------------------------------- |
| Serviço de item           | `apps/api/src/modules/operation/application/add-order-item.service.ts`      |
| Store de itens em memória | `InMemoryOrderItemStore.findInTab` e `save`                                 |
| Testes domínio/aplicação  | `apps/api/src/modules/operation/application/add-order-item.service.spec.ts` |

Decisões implementadas:

- Alteração de quantidade exige `idempotencyKey`.
- Cancelamento exige `idempotencyKey` e motivo textual de 3 a 160 caracteres, com
  `trim` antes de persistir.
- Comanda deve existir no mesmo tenant/unidade e estar `OPEN`.
- Item deve existir no mesmo tenant/unidade/comanda e estar `ACTIVE`.
- Alteração de quantidade mantém `productNameSnapshot`, `unitPriceCents`,
  `productId`, status e motivo nulo.
- Cancelamento muda status para `CANCELLED`, registra `cancelReason` e mantém item
  no histórico da comanda.
- Repetição idempotente de cancelamento com mesmo payload retorna o mesmo resultado.
- Payload divergente para mesma chave idempotente retorna
  `IDEMPOTENCY_PAYLOAD_CONFLICT`.

Validações executadas:

| Comando                                                                                             | Resultado                                                      |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm test -- --runInBand apps/api/src/modules/operation/application/add-order-item.service.spec.ts` | PASSA: 1 suíte/7 testes                                        |
| `npm run prisma:validate --workspace @mrcoti/api`                                                   | PASSA com `DATABASE_URL` temporária de placeholder             |
| `npm run verify`                                                                                    | PASSA: lint, format, typecheck, 11 suítes/52 testes e contrato |

## Rotas de operação T025 — 2026-08-14

Rotas HTTP da operação implementadas para mesa, comanda e itens conforme o contrato
OpenAPI da spec 002, reaproveitando os serviços de aplicação de T022–T024.

Artefatos:

| Área                     | Evidência                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Controller de operação   | `apps/api/src/modules/operation/api/operation.controller.ts`                                      |
| Serviço HTTP de operação | `apps/api/src/modules/operation/api/operation-http.service.ts`                                    |
| Export público local     | `apps/api/src/modules/operation/api/index.ts`, `apps/api/src/index.ts`                            |
| RBAC de mesa             | `operation.table.manage` em `apps/api/src/modules/iam/application/rbac-policy.ts`                 |
| Stores de apoio          | `InMemoryRestaurantTableStore.list/findByCode`, `InMemoryTabStore.find`, `InMemoryOrderItemStore` |
| Testes contrato/API      | `apps/api/src/modules/operation/api/operation.controller.spec.ts`                                 |

Rotas cobertas:

- `GET /api/v1/tables`;
- `POST /api/v1/tables`;
- `POST /api/v1/tabs`;
- `GET /api/v1/tabs/{tabId}`;
- `POST /api/v1/tabs/{tabId}/items`;
- `PATCH /api/v1/tabs/{tabId}/items/{itemId}`;
- `POST /api/v1/tabs/{tabId}/items/{itemId}/cancel`.

Decisões implementadas:

- Todas as rotas exigem autenticação Bearer, exceto as rotas de auth já existentes.
- `X-Unit-Id` é obrigatório por validação de escopo e recurso fora da unidade
  autorizada retorna erro seguro.
- Criação de mesa exige nova permissão explícita `operation.table.manage`, concedida
  a Tenant Owner e Unit Manager; garçom, caixa e auditor permanecem sem essa gestão.
- Leitura de mesas e comandas usa permissões operacionais de leitura já existentes.
- Abertura de comanda, inclusão, alteração e cancelamento de item usam permissões
  específicas de RBAC e mantêm idempotência via `Idempotency-Key`.
- Respostas de mesa, comanda e item seguem o shape do contrato OpenAPI da fatia.
- Conflito idempotente retorna `IDEMPOTENCY_PAYLOAD_CONFLICT`; recurso inexistente
  ou fora de escopo retorna `NOT_FOUND`/`AUTH_FORBIDDEN` sem expor dados de outro
  tenant.

Validações executadas:

| Comando                                                                                                                                            | Resultado                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm test -- --runInBand apps/api/src/modules/operation/api/operation.controller.spec.ts apps/api/src/modules/iam/application/rbac-policy.spec.ts` | PASSA: 2 suítes/9 testes                                       |
| `npm run prisma:validate --workspace @mrcoti/api`                                                                                                  | PASSA com `DATABASE_URL` temporária de placeholder             |
| `npm run verify`                                                                                                                                   | PASSA: lint, format, typecheck, 12 suítes/55 testes e contrato |

## Outbox de operação T026 — 2026-08-14

Outbox em memória implementada para persistir os eventos `TabOpened` e
`OrderItemAdded` nos fluxos críticos de mesa/comanda/item, preservando correlação e
payload mínimo sem dados sensíveis.

Artefatos:

| Área                          | Evidência                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Store de outbox               | `apps/api/src/modules/common/application/in-memory-outbox.ts`                             |
| Export público local          | `apps/api/src/modules/common/application/index.ts`                                        |
| Evento de abertura            | `apps/api/src/modules/operation/application/open-tab.service.ts`                          |
| Evento de item                | `apps/api/src/modules/operation/application/add-order-item.service.ts`                    |
| Propagação HTTP de correlação | `apps/api/src/modules/operation/api/operation-http.service.ts`, `operation.controller.ts` |
| Testes outbox                 | `apps/api/src/modules/operation/application/operation-outbox.spec.ts`                     |

Decisões implementadas:

- `TabOpened` é gravado uma vez quando a comanda é aberta com sucesso.
- `OrderItemAdded` é gravado uma vez quando o item é adicionado com sucesso.
- Replays idempotentes retornam o mesmo resultado sem duplicar evento de outbox.
- `correlationId` e `causationId` vêm do contexto HTTP quando disponível e não
  participam do hash de idempotência.
- Eventos nascem com `status=PENDING`, `attemptCount=0`, `publishedAt=null` e
  payload mínimo.
- `OrderItemAdded` não carrega nome do produto, segredo, token, documento, telefone,
  e-mail real ou payload integral do aggregate.

Validações executadas:

| Comando                                                                                                                                                                                                                                                                                                     | Resultado                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm test -- --runInBand apps/api/src/modules/operation/application/operation-outbox.spec.ts apps/api/src/modules/operation/api/operation.controller.spec.ts apps/api/src/modules/operation/application/open-tab.service.spec.ts apps/api/src/modules/operation/application/add-order-item.service.spec.ts` | PASSA: 4 suítes/16 testes                                      |
| `npm run prisma:validate --workspace @mrcoti/api`                                                                                                                                                                                                                                                           | PASSA com `DATABASE_URL` temporária de placeholder             |
| `npm run verify`                                                                                                                                                                                                                                                                                            | PASSA: lint, format, typecheck, 13 suítes/57 testes e contrato |

## Testes cross-tenant de operação T027 — 2026-08-14

Testes HTTP de isolamento tenant adicionados para mesa, comanda e item, usando
registros pré-semeados de outro tenant com a mesma unidade sintética para comprovar
que o filtro de tenant permanece obrigatório mesmo quando o `unitId` coincide.

Artefatos:

| Área                            | Evidência                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Teste API/integração            | `apps/api/src/modules/operation/api/operation.controller.spec.ts`            |
| Stores tenant-aware exercitados | `InMemoryRestaurantTableStore`, `InMemoryTabStore`, `InMemoryOrderItemStore` |

Decisões verificadas:

- `GET /api/v1/tables` não lista mesa de outro tenant.
- `GET /api/v1/tabs/{tabId}` retorna `NOT_FOUND` para comanda de outro tenant.
- `POST /api/v1/tabs/{tabId}/items` retorna `NOT_FOUND` para comanda de outro
  tenant.
- `PATCH /api/v1/tabs/{tabId}/items/{itemId}` retorna `NOT_FOUND` para item/comanda
  de outro tenant.
- `POST /api/v1/tabs/{tabId}/items/{itemId}/cancel` retorna `NOT_FOUND` para
  item/comanda de outro tenant.
- As respostas não expõem dados, nome de produto, mesa ou existência operacional do
  tenant externo.

Validações executadas:

| Comando                                                                                   | Resultado                                                      |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm test -- --runInBand apps/api/src/modules/operation/api/operation.controller.spec.ts` | PASSA: 1 suíte/4 testes                                        |
| `npm run prisma:validate --workspace @mrcoti/api`                                         | PASSA com `DATABASE_URL` temporária de placeholder             |
| `npm run verify`                                                                          | PASSA: lint, format, typecheck, 13 suítes/58 testes e contrato |

## Bill e FakePayment domínio/persistência T028 — 2026-08-14

Modelo de domínio e persistência de fechamento criado para representar `Bill` e
`FakePayment` sem coletar dados financeiros reais, preparando o cálculo e o fluxo
transacional das próximas tasks.

Artefatos:

| Área                         | Evidência                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Entidade Bill                | `apps/api/src/modules/operation/domain/bill.entity.ts`                             |
| Invariantes Bill             | `apps/api/src/modules/operation/domain/bill-invariants.ts`                         |
| Testes Bill                  | `apps/api/src/modules/operation/domain/bill-invariants.spec.ts`                    |
| Entidade FakePayment         | `apps/api/src/modules/fake-payments/domain/fake-payment.entity.ts`                 |
| Invariantes FakePayment      | `apps/api/src/modules/fake-payments/domain/fake-payment-invariants.ts`             |
| Testes FakePayment           | `apps/api/src/modules/fake-payments/domain/fake-payment-invariants.spec.ts`        |
| Persistência planejada local | `apps/api/prisma/schema.prisma` com `Bill`, `FakePayment` e enums de estado/método |

Decisões implementadas:

- `Bill` é tenant-aware e unit-aware, vinculada a uma única comanda por `tabId`.
- Valores monetários são sempre inteiros em centavos, não negativos e limitados ao
  intervalo seguro usado no schema.
- `totalCents` segue `subtotalCents - discountCents + serviceFeeCents` e não pode
  ficar negativo.
- `paidCents` não pode exceder `totalCents`.
- Estados de Bill seguem `DRAFT -> PAYMENT_PENDING -> PAID -> CLOSED`, com ramo
  `PAYMENT_PENDING -> PAYMENT_FAILED -> PAYMENT_PENDING`.
- `PAID` e `CLOSED` exigem pagamento integral.
- `FakePayment` usa somente métodos `CASH_FAKE` e `CARD_FAKE`, cenário simulado
  `APPROVED`, `DECLINED` ou `FAILED` e `fake=true`.
- A máquina de estado de `FakePayment` permite `REQUESTED -> APPROVED -> RECORDED`,
  `REQUESTED -> DECLINED` ou `REQUESTED -> FAILED`.
- Campos de cartão, PIX, documento, token, credencial de provider, conta bancária e
  autorização real são rejeitados mesmo se aparecerem em payloads inseguros/nested.
- O schema Prisma não adiciona gateway, adquirente, cartão, PIX, cobrança real,
  fiscalidade real, provedor externo ou dado pessoal real.

Validações executadas:

| Comando                                                                                                                                                                | Resultado                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm test -- --runTestsByPath apps/api/src/modules/operation/domain/bill-invariants.spec.ts apps/api/src/modules/fake-payments/domain/fake-payment-invariants.spec.ts` | PASSA: 2 suítes/8 testes                                       |
| `npm run typecheck`                                                                                                                                                    | PASSA                                                          |
| `npm run prisma:validate --workspace @mrcoti/api`                                                                                                                      | PASSA com `DATABASE_URL` temporária de placeholder             |
| `npm run verify`                                                                                                                                                       | PASSA: lint, format, typecheck, 15 suítes/66 testes e contrato |

## Cálculo de fechamento em centavos T029 — 2026-08-14

Função pura de domínio criada para calcular os valores monetários da conta antes do
fechamento transacional, sem acionar pagamento fake, persistência, auditoria ou
outbox.

Artefatos:

| Área                 | Evidência                                                        |
| -------------------- | ---------------------------------------------------------------- |
| Cálculo de conta     | `apps/api/src/modules/operation/domain/bill-calculation.ts`      |
| Testes unitários     | `apps/api/src/modules/operation/domain/bill-calculation.spec.ts` |
| Export domínio local | `apps/api/src/modules/operation/domain/index.ts`                 |

Decisões implementadas:

- Subtotal é a soma de `quantity * unitPriceCents` somente de itens `ACTIVE`.
- Itens `CANCELLED` permanecem no histórico, mas não entram no subtotal.
- Desconto, taxa de serviço, pago e saldo são sempre calculados em centavos inteiros.
- `totalCents = subtotalCents - discountCents + serviceFeeCents`.
- `balanceCents = totalCents - paidCents`.
- Desconto que deixaria total negativo é rejeitado.
- Pagamento acima do total é rejeitado.
- Quantidade inválida, preço fracionário/negativo, centavos fracionários/negativos e
  overflow são rejeitados antes de compor a conta.
- Nenhuma regra de gateway, cartão, PIX, cobrança real, fiscalidade real, provider
  externo ou dado real foi introduzida.

Validações executadas:

| Comando                                                                                                                                                     | Resultado                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm test -- --runTestsByPath apps/api/src/modules/operation/domain/bill-calculation.spec.ts apps/api/src/modules/operation/domain/bill-invariants.spec.ts` | PASSA: 2 suítes/11 testes                                      |
| `npm run typecheck`                                                                                                                                         | PASSA                                                          |
| `npm run prisma:validate --workspace @mrcoti/api`                                                                                                           | PASSA com `DATABASE_URL` temporária de placeholder             |
| `npm run verify`                                                                                                                                            | PASSA: lint, format, typecheck, 16 suítes/73 testes e contrato |

## Próxima ação recomendada

Prosseguir para T030 em diante, em ordem, respeitando `approval-record.md`, sem
`local-prod`, produção, AWS real, provedores reais, dados reais, microsserviços ou
serviços locais desnecessários.
