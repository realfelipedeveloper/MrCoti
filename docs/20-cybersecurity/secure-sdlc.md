# Secure SDLC

O ciclo seguro do Mr Coti acompanha Spec, Architecture, API Contract,
Implementation, Testing, Security, Review, Release e Observability Loops.

## Gates mínimos por fase

| Fase | Evidência mínima |
| --- | --- |
| Spec | requisito de segurança testável, abuso e classificação de dados |
| Arquitetura | threat model, fronteiras e decisões de isolamento |
| Contrato API | autenticação, autorização, erros seguros, idempotência e webhooks |
| Implementação futura | guards/policies, validação, auditoria e testes negativos |
| Testes | SAST, dependency audit, secret scanning, auth/IDOR e isolamento |
| Release futuro | imagem, SBOM, config, migração e runbook |

Achados críticos bloqueiam. Exceções exigem owner, compensação, prazo e aprovação
explícita.
