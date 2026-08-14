# Registros de decisão arquitetural do Mr Coti

Este diretório contém os ADRs de fundação do **Mr Coti**. Um ADR aceito é imutável como registro histórico: mudanças de decisão criam um novo ADR que o substitui, preservando a motivação original.

| ADR | Decisão | Status |
|---|---|---|
| [ADR-0001](./ADR-0001-architecture-style.md) | Monólito modular com DDD, Clean Architecture e eventos internos | Aceito |
| [ADR-0002](./ADR-0002-monorepo-or-multirepo.md) | Monorepo para produto, contratos e infraestrutura | Aceito |
| [ADR-0003](./ADR-0003-prisma-adoption.md) | Prisma ORM para persistência MySQL | Aceito |
| [ADR-0004](./ADR-0004-multi-tenancy-model.md) | Single Database + `tenant_id` | Aceito |
| [ADR-0005](./ADR-0005-auth-strategy.md) | JWT de curta duração e refresh token com rotação | Aceito |
| [ADR-0006](./ADR-0006-notification-strategy.md) | Porta de notificações, providers fake e BullMQ | Aceito |
| [ADR-0007](./ADR-0007-fake-payment-api.md) | API fake de pagamentos como módulo/adaptador do monólito | Aceito |
| [ADR-0008](./ADR-0008-fake-invoice-api.md) | API fake de notas como módulo/adaptador do monólito | Aceito |
| [ADR-0009](./ADR-0009-billing-domain.md) | Billing como subdomínio futuro do Core SaaS, sem cobrança real | Aceito |
| [ADR-0010](./ADR-0010-feature-flags-vs-entitlements.md) | Separar rollout técnico, direito comercial e autorização | Aceito |
| [ADR-0011](./ADR-0011-domain-events-catalog.md) | Catálogo e envelope governado de eventos com outbox | Aceito |
| [ADR-0012](./ADR-0012-disaster-recovery.md) | DR por classes, restore testado e RPO/RTO progressivos | Aceito; metas finais pendentes |
| [ADR-0013](./ADR-0013-finops-aws.md) | FinOps AWS com tags, unit economics e alocação por tenant | Aceito; orçamentos pendentes |
| [ADR-0014](./ADR-0014-rbac-mvp.md) | Matriz RBAC/policies deny-by-default para o MVP | Aceito com condições |
| [ADR-0015](./ADR-0015-data-retention-lgpd.md) | Retenção e anonimização por classe/finalidade | Aceito com condições — Legal Review antes de produção/dados reais |
| [ADR-0016](./ADR-0016-slo-load-profile.md) | Baselines progressivos de SLO e carga | Aceito com condições |
| [ADR-0017](./ADR-0017-portfolio-local-first-saas-ready.md) | Portfolio local-first, commercial SaaS-ready | Aceito |
| [ADR-0018](./ADR-0018-cybersecurity-maturity-model.md) | Maturidade progressiva de cybersecurity | Aceito |
| [ADR-0019](./ADR-0019-dev-local-only-active-scope.md) | Escopo ativo dev/local com Docker Desktop e AWS-ready preservado | Aceito |

## Convenções

- **Proposto:** em análise, sem autorização de adoção.
- **Aceito:** decisão vigente e obrigatória.
- **Substituído:** outro ADR tomou seu lugar.
- **Rejeitado:** opção avaliada e não adotada.

Cada registro inclui contexto, drivers, opções, decisão, consequências, riscos/mitigações e gatilhos de revisão. Tecnologias relevantes fora da stack e da lista complementar do SDD exigem ADR antes de serem usadas. A lista complementar também exige ADR para adoção concreta.

## Processo de mudança

1. Identificar evidência ou gatilho de revisão.
2. Atualizar a especificação afetada.
3. Criar novo ADR, referenciando o anterior.
4. Definir migração, compatibilidade, testes, segurança e rollback.
5. Marcar o ADR anterior como substituído somente após a nova decisão ser aceita.
