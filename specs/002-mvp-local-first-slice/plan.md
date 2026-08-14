# Plano de implementação: MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Branch:** `002-mvp-local-first-slice`  
**Especificação:** `specs/002-mvp-local-first-slice/spec.md`  
**Estado:** Aprovado com condições; implementação dev/local autorizada em ordem
pelas tasks a partir de T004

## Resumo

A implementação futura deve criar uma primeira fatia vertical local do Mr Coti em
monorepo: API NestJS, web Next.js, persistência MySQL via Prisma, configuração local
sem segredos e testes cobrindo a jornada login → catálogo → comanda → fechamento com
pagamento fake. A fatia deve provar tenant isolation, RBAC, idempotência, auditoria e
outbox desde o primeiro fluxo.

## Contexto técnico

| Dimensão | Decisão ou restrição |
|---|---|
| Arquitetura | monólito modular em monorepo, DDD/Clean/hexagonal, sem microsserviços |
| Tenancy | banco único com `tenant_id`; contexto vem de autenticação/membership |
| Dados | Prisma + MySQL 8+ futuros; centavos inteiros; seeds sintéticos |
| Comercial | planos/entitlements são baseline; billing real fora de escopo |
| API | OpenAPI próprio desta fatia; REST `/api/v1`; headers de correlação e idempotência |
| Qualidade | unit, integração, contrato, tenant isolation, RBAC negativo e E2E |
| Operação | Docker Desktop/local Docker, logs seguros, health/readiness locais futuros, preflight de portas antes de subir stack |
| Custo | dev/local only; sem AWS real/provisionamento; FinOps e AWS readiness permanecem documentais |

## Constitution Check

| Princípio | Estado | Evidência ou ação |
|---|---|---|
| I. Especificação | PASSA | `spec.md`, `plan.md`, `tasks.md`, checklist e OpenAPI desta feature |
| II. SaaS/tenancy | PASSA | `tenant_id`, Membership, Unit, RBAC e testes cross-tenant planejados |
| III. Segurança/privacidade | PASSA | dados sintéticos, CHK048 preservado como gatilho futuro, auditoria e logs sanitizados |
| IV. API First | PASSA | `contracts/openapi.json` criado antes da implementação |
| V. Monólito modular | PASSA | módulos Core SaaS/IAM/Organização/Catálogo/Operação/Pagamentos Fake |
| VI. Qualidade verificável | PASSA | tarefas exigem testes e gates antes de considerar concluído |
| VII. Observabilidade | PASSA | request/correlation IDs, auditoria, outbox e logs planejados |
| VIII. Cloud-ready/AWS-friendly | PASSA | dev/local com Docker Desktop/local Docker e portas configuráveis; sem dependência AWS no domínio |
| IX. Flags/ADRs | PASSA | sem nova tecnologia obrigatória; desvios exigem ADR |

Uma FALHA não justificada bloqueia o avanço. Exceções exigem ADR.

## Estrutura de artefatos

```text
specs/002-mvp-local-first-slice/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.json
├── checklists/
│   └── requirements.md
└── tasks.md
```

## Desenho da solução

### Limites de domínio

| Módulo | Responsabilidade na fatia | Dependências permitidas |
| --- | --- | --- |
| Plataforma/IAM | login, usuário sintético, membership, RBAC, tenant context | Organização para unidade corrente via contrato |
| Organização | empresa/unidade sintética e escopo operacional | nenhuma leitura direta de outros módulos |
| Catálogo | categorias, produtos, disponibilidade e preço vigente | Organização por contrato de unidade |
| Operação | mesas, comandas, itens, conta e fechamento | Catálogo por snapshot; Pagamentos Fake por porta |
| Pagamentos Fake | simular aprovação/falha e registrar pagamento fake | Operação por comando/porta, sem provider real |
| Governança | auditoria e idempotência | contexto autenticado e repositórios próprios |
| Eventos | outbox local para fatos críticos | payload mínimo e versionado |

### Fluxos e contratos

1. Login cria sessão/token e retorna contexto.
2. Frontend carrega unidade e permissões.
3. Gestor cria categoria/produto.
4. Atendente cria mesa/comanda e lança item.
5. Caixa fecha conta; API valida idempotência, calcula total, registra pagamento fake,
   fecha comanda/mesa, grava auditoria e outbox.

Mutations críticas usam `Idempotency-Key`. Todas as respostas incluem
`X-Request-Id` e `X-Correlation-Id` ou seus equivalentes gerados pelo backend.

### Dados, segurança e privacidade

- Dados reais são proibidos.
- Password hash é obrigatório mesmo para usuário sintético.
- Tenant isolation é reforçado em guard/contexto, repositório e testes.
- Auditoria evita before/after sensível completo.
- Pagamento fake não coleta dados financeiros.
- CHK048 permanece `PENDING LEGAL REVIEW` apenas como gatilho futuro para produção
  ou dados reais, não como pendência da fatia dev/local.

### Qualidade e observabilidade

| Camada | Evidência mínima futura |
| --- | --- |
| Unitário | estados, cálculos em centavos, policies, idempotência |
| Integração | repositórios tenant-aware, transações, outbox, constraints |
| Contrato | OpenAPI validado contra handlers e exemplos |
| Segurança | auth ausente/inválida, RBAC insuficiente, IDOR/cross-tenant |
| E2E | login → catálogo → comanda → item → fechamento fake |
| Observabilidade | logs seguros, request/correlation IDs e auditoria consultável |

## Fases e gates

1. **Aprovação da spec:** checklist desta feature sem pendência bloqueante.
2. **Scaffold controlado:** criar monorepo/app somente após aprovação explícita.
3. **Infra local:** configurar portas, env examples, MySQL/Redis futuros e preflight.
4. **Core SaaS/IAM:** login, tenant context, membership e RBAC mínimo.
5. **Catálogo:** categorias/produtos tenant-aware.
6. **Operação:** mesa/comanda/itens/snapshots.
7. **Fechamento:** conta, pagamento fake, idempotência, auditoria e outbox.
8. **Frontend:** telas mínimas da jornada.
9. **Gates finais:** testes, contrato, segurança, observabilidade e review.

## Riscos

| Risco | Probabilidade/impacto | Mitigação | Evidência de encerramento |
|---|---|---|---|
| Escopo crescer além da fatia | alta/médio | manter nota/e-mail/estoque fora de escopo | tasks sem módulos extras |
| Tenant isolation falhar cedo | média/crítico | contexto obrigatório + testes negativos | suite cross-tenant verde |
| UI atrasar domínio | média/médio | API e E2E simples primeiro | fluxo demonstrável mínimo |
| Dependência não aprovada entrar por conveniência | média/alto | ADR obrigatório | revisão de package/lock futuro |
| Portas locais mudarem | média/médio | preflight antes de subir stack | registro atualizado |
| Dados reais aparecerem em fixtures | baixa/crítico | dados `.local` sintéticos e revisão | scan e checklist RSD |

## Condição de saída

A feature só estará pronta para implementação quando `checklists/requirements.md` for
aprovado. Depois de implementada, só será considerada demonstrável quando CS-001–008
passarem, sem dados reais, sem provider real, sem `local-prod`/produção e sem
violação de tenant/RBAC.
