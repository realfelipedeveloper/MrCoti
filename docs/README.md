# Documentação do Mr Coti

Este índice organiza os artefatos duráveis do produto. A especificação da feature continua sendo a fonte da verdade para requisitos; os documentos abaixo detalham contexto, decisões e políticas.

| Área | Conteúdo |
| --- | --- |
| [`00-product`](00-product/README.md) | visão, escopo, NFRs, modelo SaaS e roadmap |
| [`01-business`](01-business/README.md) | domínio, atores, capacidades, RBAC e glossário |
| [`02-architecture`](02-architecture/README.md) | arquitetura lógica, SaaS, AWS e escalabilidade |
| [`03-uml`](03-uml/README.md) | diagramas PlantUML versionáveis |
| [`04-api`](04-api/README.md) | padrões API-first, APIs públicas e webhooks |
| [`05-database`](05-database/README.md) | estratégia de dados, isolamento e continuidade |
| [`06-testing`](06-testing/README.md) | estratégia e matriz de testes |
| [`07-devops`](07-devops/README.md) | CI/CD, ambientes e Docker planejado |
| [`08-security`](08-security/README.md) | segurança, ameaças, LGPD e governança |
| [`09-observability`](09-observability/README.md) | logs, métricas, traces e SLOs |
| [`10-agents`](10-agents/README.md) | papéis e loops de engenharia |
| [`11-adr`](11-adr/README.md) | decisões arquiteturais registradas |
| [`12-billing`](12-billing/billing-domain.md) | domínio comercial futuro, planos e mudanças de assinatura |
| [`13-entitlements`](13-entitlements/entitlements.md) | direitos comerciais, limites e separação de feature flags |
| [`14-events`](14-events/domain-events-catalog.md) | catálogo, versionamento e governança de outbox |
| [`15-ownership`](15-ownership/bounded-context-ownership.md) | ownership lógico, dados e responsabilidades de módulos |
| [`16-disaster-recovery`](16-disaster-recovery/disaster-recovery-strategy.md) | DR, restore e objetivos RPO/RTO |
| [`17-finops`](17-finops/aws-cost-strategy.md) | estratégia futura de custos AWS e alocação por tenant |
| [`18-governance`](18-governance/approval-record.md) | RBAC, LGPD, retenção, anonimização e aprovações |
| [`19-operations`](19-operations/slo.md) | SLOs, perfil de carga e inventário local de portas |
| [`20-cybersecurity`](20-cybersecurity/README.md) | Secure SDLC, ASVS, SSDF, SAMM, SLSA e gates de segurança progressiva |

## Hierarquia de autoridade

1. Constituição vigente.
2. Spec aprovada e seus requisitos identificados.
3. ADRs aceitos.
4. Contrato OpenAPI e modelo de dados.
5. Plan e Tasks.
6. Guias complementares em `docs/`.

Conflitos devem interromper a implementação e voltar ao Spec Loop. Uma mudança não está completa até atualizar artefatos dependentes e a matriz de rastreabilidade.
