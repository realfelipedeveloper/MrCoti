# Mr Coti

Mr Coti é uma plataforma SaaS, multi-tenant e cloud-ready para gestão de bares,
restaurantes e operações de alimentação. Inicialmente, o Mr Coti é um projeto de
portfólio executado em ambiente local individual, mas sua arquitetura deve ser
desenhada para evolução futura como SaaS comercial escalável, sem reescrita
estrutural. O escopo ativo atual é dev/local only: a aplicação deve rodar localmente
com Docker Desktop/local Docker após aprovação da spec, enquanto AWS readiness fica
como prontidão arquitetural. `local-prod`, produção, deploy real e AWS real ficam
fora da fase atual. O repositório saiu da fundação documental e entrou na
implementação da primeira fatia local; a Spec 002 foi aprovada com condições em
2026-07-11 e a implementação deve seguir `tasks.md` em ordem.

## Estado atual

- Fundação aprovada com condições: [`specs/001-saas-platform-foundation/spec.md`](specs/001-saas-platform-foundation/spec.md)
- Spec ativa para próxima implementação local: [`specs/002-mvp-local-first-slice/spec.md`](specs/002-mvp-local-first-slice/spec.md)
- Constituição de engenharia: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
- Índice documental: [`docs/README.md`](docs/README.md)
- Contratos API-first: [`specs/001-saas-platform-foundation/contracts/openapi.json`](specs/001-saas-platform-foundation/contracts/openapi.json) e [`specs/002-mvp-local-first-slice/contracts/openapi.json`](specs/002-mvp-local-first-slice/contracts/openapi.json)
- Instruções para agentes: [`AGENTS.md`](AGENTS.md)
- Complemento SaaS: [`docs/12-billing/billing-domain.md`](docs/12-billing/billing-domain.md) a [`docs/19-operations/slo.md`](docs/19-operations/slo.md)
- Cybersecurity progressiva: [`docs/20-cybersecurity/security-roadmap.md`](docs/20-cybersecurity/security-roadmap.md)
- Aprovações e gates: [`docs/18-governance/approval-record.md`](docs/18-governance/approval-record.md)

## Implementação autorizada com condições

A fundação documental autorizou abrir a próxima spec local. A spec
`002-mvp-local-first-slice` foi aprovada com condições por Felipe Almeida em
2026-07-11. T001–T027 foram concluídas; a implementação deve avançar a partir de
T028 em ordem, com Docker Desktop/local Docker, dados sintéticos e stack mínima.

A aprovação não autoriza `local-prod`, produção, AWS real, provedores reais, dados
reais, billing real, fiscalidade real, microsserviços ou broker externo.

## Fluxo SDD

1. Alterar e aprovar a Spec.
2. Validar Constitution Gates.
3. Atualizar Research, Data Model, contratos e ADRs afetados.
4. Atualizar Plan e Tasks com rastreabilidade.
5. Executar análise cruzada e checklists.
6. Somente após aprovação explícita, iniciar implementação orientada pelas tasks.

O produto e todos os seus artefatos usam exclusivamente o nome oficial **Mr Coti**.
