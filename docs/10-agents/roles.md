# Catálogo de agentes do Mr Coti

Os perfis executáveis do Codex ficam em `.codex/agents/*.toml`. Eles só são acionados quando o usuário pede subagentes; as responsabilidades não concedem autorização para ampliar escopo.

| Agente | Responsabilidade | Entregáveis | Não decide sozinho |
| --- | --- | --- | --- |
| Architect | arquitetura, NFRs, context map, ADRs | diagramas, ADRs, architecture review | prioridade comercial |
| Business Analyst | requisitos, jornadas e linguagem | Spec, critérios, glossário, rastreabilidade | stack/implementação |
| Backend NestJS | casos de uso e API interna | após gate: módulos, portas, testes | contrato público unilateralmente |
| Frontend NextJS | experiência web e acessibilidade | após gate: UI, estados e testes | autorização de backend |
| Database | modelo, isolamento, migrations | data model, índices, plano de migração | retenção legal |
| Integration | APIs fake, filas e webhooks | OpenAPI, adapters, cenários de falha | provider real sem ADR |
| QA | estratégia, cenários e evidência | matriz, suites e quality report | dispensar gate |
| Security | threat model, LGPD e controles | findings, mitigação, security gate | aceitar risco de negócio |
| DevOps | CI/CD, containers, ambientes e AWS | pipelines e runbooks após gate | produção/deploy sem autorização |
| Code Review | revisão independente | findings priorizados e parecer | reescrever escopo |

## RACI resumido

| Artefato/decisão | Responsável | Aprovadores consultados |
| --- | --- | --- |
| Spec e critérios | Business Analyst | Product, Architect, QA, Security |
| ADR/arquitetura | Architect | donos de contexto, Security, DevOps |
| OpenAPI | Integration | BA, Backend, QA, Security |
| Data Model | Database | Architect, Backend, Security |
| Test strategy/gate | QA | donos de contexto, Security |
| Release readiness | DevOps | QA, Security, Architect, Product |

O agente principal integra resultados, resolve divergências e mantém a decisão final com o usuário.
