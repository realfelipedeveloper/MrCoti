# Tarefas: MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Especificação:** `specs/002-mvp-local-first-slice/spec.md`  
**Estado:** aprovada com condições; T001–T029 concluídas; implementação deve seguir a
ordem planejada a partir de T030

## Convenções

- Formato: `- [ ] TNNN [P?] [US-??] descrição — requisitos — evidência`.
- `[P]` indica execução paralela segura em arquivos diferentes.
- Tarefas de código só podem iniciar depois da aprovação explícita do checklist desta
  feature.
- Nenhuma tarefa autoriza `local-prod`, produção, dados reais, cobrança real, emissão
  fiscal real, deploy real, AWS real provisionada ou microsserviços.

## Fase 0 — Gate de aprovação da spec

- [x] T001 Revisar e aprovar `spec.md`, `plan.md`, `research.md`, `data-model.md`,
      `contracts/openapi.json`, `quickstart.md` e este `tasks.md` — todos — checklist da
      feature. **Evidência:** `approval-record.md` e checklist aprovado em 2026-07-11.
- [x] T002 Confirmar que o escopo ativo é dev/local only, com dados sintéticos; CHK048
      permanece `PENDING LEGAL REVIEW` apenas como gatilho futuro se produção/dados
      reais forem reabertos — RSD-003, RSD-010 — checklist da feature. **Evidência:**
      `approval-record.md`.
- [x] T003 Repetir preflight de portas antes de qualquer stack local do Mr Coti —
      RNF-002 — evidência no review da feature. **Evidência:** `review-report.md`,
      seção “Preflight local T003 — 2026-07-11”.

## Fase 1 — Scaffold local controlado

- [x] T004 Criar estrutura de monorepo aprovada para API, web, contratos e pacotes
      compartilhados — RNF-001, RNF-008 — árvore do repositório. **Evidência:**
      `package.json`, `apps/`, `packages/` e `review-report.md`, seção “Scaffold T004 —
      2026-07-11”.
- [x] T005 Configurar TypeScript, lint, format e scripts mínimos sem tecnologias fora
      da stack aprovada — RNF-001, RNF-008 — configs e pipeline local. **Evidência:**
      `package.json`, `package-lock.json`, `tsconfig*.json`, `eslint.config.mjs`,
      `.prettierrc.json` e `review-report.md`, seção “Tooling T005 — 2026-07-11”.
- [x] T006 Criar exemplos de ambiente sem segredo real e com portas configuráveis —
      RNF-002, RNF-009 — `.env.example` futuro. **Evidência:** `.env.example`,
      `apps/api/.env.example`, `apps/web/.env.example` e `review-report.md`, seção
      “Env examples T006 — 2026-07-11”.
- [x] T007 Criar Docker Compose local para runtime dev/local com MySQL/Redis quando
      autorizado, preservando portas sem colisão — RNF-002 — compose futuro.
      **Evidência:** `docker-compose.yml`, `.env.example` e `review-report.md`, seção
      “Docker Compose T007 — 2026-07-11”.
- [x] T008 Configurar validação OpenAPI no pipeline local — RNF-005, CS-005 —
      script/gate futuro. **Evidência:** `scripts/validate-openapi.mjs`,
      `package.json` e `review-report.md`, seção “OpenAPI gate T008 — 2026-07-11”.

## Fase 2 — Core SaaS, IAM e tenant context (US-01)

- [x] T009 [US-01] Modelar entidades de usuário, tenant, empresa, unidade, membership
      e role assignment — RF-001–004, RSD-001–006 — domínio/persistência.
      **Evidência:** entidades em `apps/api/src/modules/*/domain`, schema em
      `apps/api/prisma/schema.prisma` e `review-report.md`, seção “Core SaaS/IAM T009 —
      2026-07-11”.
- [x] T010 [US-01] Implementar hash de senha e autenticação local de usuários
      sintéticos — RF-001, RSD-005 — testes auth. **Evidência:**
      `apps/api/src/modules/iam/application/password-hasher.ts`,
      `local-authentication.service.ts`, `local-authentication.service.spec.ts` e
      `review-report.md`, seção “Autenticação local T010 — 2026-07-11”.
- [x] T011 [US-01] Implementar middleware/guard de tenant context confiável — RF-003,
      RSD-001–002 — testes cross-tenant. **Evidência:**
      `apps/api/src/modules/platform/application/tenant-context.guard.ts`,
      `tenant-context.guard.spec.ts` e `review-report.md`, seção “Tenant context T011 —
      2026-07-11”.
- [x] T012 [US-01] Implementar RBAC mínimo deny-by-default — RF-004, RSD-001,
      RSD-006 — testes de autorização. **Evidência:**
      `apps/api/src/modules/iam/application/rbac-policy.ts`, `rbac-policy.spec.ts` e
      `review-report.md`, seção “RBAC mínimo T012 — 2026-07-11”.
- [x] T013 [US-01] Implementar rotas `POST /auth/login`, `POST /auth/logout`,
      `GET /me` e `GET /units` conforme OpenAPI — RF-001–004, RNF-006 — testes
      contrato. **Evidência:** `apps/api/src/modules/iam/api/auth.controller.ts`,
      `auth-http.service.ts`, `auth.controller.spec.ts`,
      `apps/api/src/modules/common/api/request-context.middleware.ts` e
      `review-report.md`, seção “Rotas auth/contexto T013 — 2026-07-11”.
- [x] T014 [P] [US-01] Criar seeds sintéticos de tenant, unidade e usuários demo —
      RF-002, RSD-003 — seed/fixtures. **Evidência:**
      `apps/api/src/modules/local-demo/demo-fixtures.ts`, `demo-fixtures.spec.ts`,
      integração em `auth.controller.spec.ts` e `review-report.md`, seção “Fixtures
      sintéticas T014 — 2026-07-11”.

## Fase 3 — Catálogo mínimo (US-02)

- [x] T015 [US-02] Modelar Category e Product tenant-aware com preço em centavos —
      RF-005–006 — domínio/persistência. **Evidência:**
      `apps/api/src/modules/catalog/domain`, `apps/api/prisma/schema.prisma` e
      `review-report.md`, seção “Catálogo domínio/persistência T015 — 2026-07-11”.
- [x] T016 [US-02] Implementar invariantes de preço, status e unidade — RF-005–006,
      RSD-001 — testes unitários. **Evidência:**
      `apps/api/src/modules/catalog/domain/catalog-invariants.ts`,
      `catalog-invariants.spec.ts` e `review-report.md`, seção “Invariantes de catálogo
      T016 — 2026-07-11”.
- [x] T017 [US-02] Implementar rotas de categorias conforme OpenAPI — RF-005,
      RF-012, RF-016 — testes contrato/API. **Evidência:**
      `apps/api/src/modules/catalog/api/catalog.controller.ts`,
      `catalog-http.service.ts`, `catalog.controller.spec.ts`,
      `apps/api/src/modules/common/application/idempotency.ts` e `review-report.md`,
      seção “Rotas de categorias T017 — 2026-07-11”.
- [x] T018 [US-02] Implementar rotas de produtos conforme OpenAPI — RF-005–006,
      RF-012, RF-016 — testes contrato/API. **Evidência:**
      `apps/api/src/modules/catalog/api/catalog.controller.ts`,
      `catalog-http.service.ts`, `catalog.controller.spec.ts` e `review-report.md`,
      seção “Rotas de produtos T018 — 2026-07-11”.
- [x] T019 [P] [US-02] Implementar auditoria de criação/alteração/desativação de
      catálogo — RF-013, RSD-007 — testes auditoria. **Evidência:**
      `apps/api/src/modules/governance`, integração em
      `catalog-http.service.ts`, `catalog-http.service.spec.ts` e
      `review-report.md`, seção “Auditoria de catálogo T019 — 2026-07-11”.
- [x] T020 [US-02] Implementar testes negativos de catálogo cross-tenant e RBAC —
      RSD-001–002, CS-002 — testes integração. **Evidência:**
      `apps/api/src/modules/catalog/api/catalog-http.service.spec.ts`,
      `catalog.controller.spec.ts` e `review-report.md`, seção “Testes negativos de
      catálogo T020 — 2026-07-11”.

## Fase 4 — Mesa, comanda e itens (US-03)

- [x] T021 [US-03] Modelar RestaurantTable, Tab e OrderItem com estados e
      constraints — RF-007–009 — domínio/persistência. **Evidência:**
      `apps/api/src/modules/operation/domain`, `apps/api/prisma/schema.prisma` e
      `review-report.md`, seção “Operação domínio/persistência T021 — 2026-07-11”.
- [x] T022 [US-03] Implementar abertura de comanda com uma comanda ativa por mesa —
      RF-007–008, RF-012 — testes concorrência/idempotência. **Evidência:**
      `apps/api/src/modules/operation/application/open-tab.service.ts`,
      `open-tab.service.spec.ts` e `review-report.md`, seção “Abertura de comanda T022
      — 2026-07-11”.
- [x] T023 [US-03] Implementar snapshot de produto ao adicionar item — RF-009,
      RNF-003 — testes unitários/integração. **Evidência:**
      `apps/api/src/modules/operation/application/add-order-item.service.ts`,
      `add-order-item.service.spec.ts` e `review-report.md`, seção “Snapshot de produto
      em item T023 — 2026-07-14”.
- [x] T024 [US-03] Implementar alteração de quantidade e cancelamento com motivo —
      RF-009, RSD-007 — testes domínio. **Evidência:**
      `apps/api/src/modules/operation/application/add-order-item.service.ts`,
      `add-order-item.service.spec.ts` e `review-report.md`, seção “Mutação de item
      T024 — 2026-07-14”.
- [x] T025 [US-03] Implementar rotas `/tables`, `/tabs`, `/tabs/{tabId}` e itens
      conforme OpenAPI — RF-007–009, RF-016 — testes contrato/API. **Evidência:**
      `apps/api/src/modules/operation/api/operation.controller.ts`,
      `operation-http.service.ts`, `operation.controller.spec.ts` e
      `review-report.md`, seção “Rotas de operação T025 — 2026-08-14”.
- [x] T026 [P] [US-03] Persistir outbox `TabOpened` e `OrderItemAdded` — RF-014,
      RNF-003 — testes outbox. **Evidência:**
      `apps/api/src/modules/common/application/in-memory-outbox.ts`,
      `open-tab.service.ts`, `add-order-item.service.ts`,
      `operation-outbox.spec.ts` e `review-report.md`, seção “Outbox de operação
      T026 — 2026-08-14”.
- [x] T027 [US-03] Implementar testes cross-tenant para mesa/comanda/item — RSD-002,
      CS-002 — testes integração. **Evidência:**
      `apps/api/src/modules/operation/api/operation.controller.spec.ts` e
      `review-report.md`, seção “Testes cross-tenant de operação T027 —
      2026-08-14”.

## Fase 5 — Fechamento e pagamento fake (US-04)

- [x] T028 [US-04] Modelar Bill e FakePayment sem dados financeiros reais — RF-010–011,
      RSD-009 — domínio/persistência. **Evidência:**
      `apps/api/src/modules/operation/domain/bill.entity.ts`,
      `apps/api/src/modules/operation/domain/bill-invariants.ts`,
      `apps/api/src/modules/fake-payments/domain/fake-payment.entity.ts`,
      `apps/api/src/modules/fake-payments/domain/fake-payment-invariants.ts`,
      `apps/api/prisma/schema.prisma` e `review-report.md`, seção “Bill e
      FakePayment domínio/persistência T028 — 2026-08-14”.
- [x] T029 [US-04] Implementar cálculo em centavos de subtotal, desconto, taxa, total
      e saldo — RF-010, CS-004 — testes unitários. **Evidência:**
      `apps/api/src/modules/operation/domain/bill-calculation.ts`,
      `apps/api/src/modules/operation/domain/bill-calculation.spec.ts` e
      `review-report.md`, seção “Cálculo de fechamento em centavos T029 —
      2026-08-14”.
- [ ] T030 [US-04] Implementar fechamento transacional da comanda — RF-011–014,
      RNF-003 — testes integração.
- [ ] T031 [US-04] Implementar idempotência do fechamento com replay seguro e conflito
      por payload divergente — RF-012, CS-003 — testes idempotência.
- [ ] T032 [US-04] Implementar rota `POST /tabs/{tabId}/close` conforme OpenAPI —
      RF-011, RF-016 — testes contrato/API.
- [ ] T033 [P] [US-04] Persistir outbox `BillClosed` e `FakePaymentRecorded` —
      RF-014 — testes outbox.
- [ ] T034 [US-04] Implementar auditoria de fechamento e pagamento fake — RF-013,
      RSD-007 — testes auditoria.

## Fase 6 — Frontend local da jornada (US-01–US-04)

- [ ] T035 [P] Criar layout local e fluxo de login — RF-015, RNF-007 — app web futuro.
- [ ] T036 [P] Criar tela de seleção/contexto de unidade — RF-015, RNF-007 — app web
      futuro.
- [ ] T037 [P] Criar telas mínimas de categorias/produtos — RF-005, RF-015 — app web
      futuro.
- [ ] T038 [P] Criar telas de mesas, comanda e itens — RF-007–009, RF-015 — app web
      futuro.
- [ ] T039 Criar tela de fechamento com pagamento fake e resultado — RF-010–011,
      RF-015 — app web futuro.
- [ ] T040 Implementar estados loading, empty, error e denied — RNF-007, RSD-001 —
      testes componente/E2E.

## Fase 7 — Qualidade, segurança e observabilidade (US-05)

- [ ] T041 [US-05] Implementar logs seguros com request/correlation IDs — RNF-006,
      RSD-004 — testes/inspeção.
- [ ] T042 [US-05] Implementar auditoria consultável para ações críticas da fatia —
      RF-013, RSD-007 — testes auditoria.
- [ ] T043 [US-05] Implementar rate limiting/proteção equivalente em login e mutations
      críticas — RSD-008 — testes segurança.
- [ ] T044 [US-05] Criar testes unitários dos aggregates/policies/cálculos — RNF-005,
      CS-004 — suite unitária.
- [ ] T045 [US-05] Criar testes de integração com banco/cache/outbox — RNF-005,
      RNF-003 — suite integração.
- [ ] T046 [US-05] Criar testes de contrato OpenAPI — RNF-005, CS-005 — suite
      contrato.
- [ ] T047 [US-05] Criar testes E2E da jornada principal — CS-001, CS-008 — suite E2E.
- [ ] T048 [US-05] Criar testes negativos de auth/RBAC/IDOR/cross-tenant — RSD-001–002,
      CS-002 — suite segurança.
- [ ] T049 [US-05] Criar verificação de ausência de dados reais/segredos em fixtures e
      logs — RSD-003–004, CS-006 — scan/checklist.

## Fase final — Gates de conclusão

- [ ] T050 Validar OpenAPI, IDs, rastreabilidade requisito → tarefa → teste — CS-005,
      CS-008 — review report.
- [ ] T051 Executar lint, format, typecheck, unit, integration, contract e E2E —
      RNF-005, CS-008 — evidência de pipeline local.
- [ ] T052 Executar quickstart e registrar resultado — CS-001–008 —
      `review-report.md` futuro.
- [ ] T053 Confirmar que não houve dados reais, providers reais, `local-prod`,
      produção, deploy real, AWS real, billing real ou fiscalidade real — RSD-003,
      RSD-009–010 — checklist final.

## Dependências

- T001–T003 precedem qualquer tarefa de implementação.
- Fase 2 precede Fases 3–5.
- Catálogo (Fase 3) precede inclusão de itens da Fase 4.
- Fase 4 precede fechamento da Fase 5.
- Frontend pode evoluir em paralelo após os contratos de API correspondentes.
- Fase 7 acompanha todas as fases e fecha antes dos gates finais.

## Critério de conclusão

A feature estará concluída quando T001–T053 estiverem executadas, CS-001–008 forem
demonstrados, o checklist final estiver aprovado e o escopo dev/local permanecer
respeitado. CHK048 continua `PENDING LEGAL REVIEW` apenas como gatilho futuro para
produção/dados reais. Não há autorização para `local-prod`, deploy real, AWS real,
provedores reais, pagamento real, fiscalidade real ou microsserviços.
