# Rastreabilidade

## Regra

Requisitos funcionais usam IDs `RF-###`; não funcionais, `RNF-###`; segurança/dados, `RSD-###`; regras complementares, `BR-###`; decisões, `ADR-####`; tarefas, `T###`. Toda task futura de implementação deve referenciar ao menos um requisito e indicar teste/evidência esperada.

## Mapa por capacidade

| Capacidade | Fonte primária | Decisões/evidências |
| --- | --- | --- |
| SaaS e tenant lifecycle | Spec/Core SaaS | ADR-0004, Data Model, testes de isolamento |
| Autenticação e RBAC | Spec/Identity | ADR-0005, threat model, testes negativos |
| Catálogo e operação | Spec/MVP | Data Model, diagramas de ciclo, testes E2E |
| Pagamento fake | contrato OpenAPI | ADR-0007, contract/integration tests |
| Nota fake | contrato OpenAPI | ADR-0008, contract/integration tests |
| Notificações fake | contrato OpenAPI | ADR-0006, retry/duplicidade tests |
| Cloud e escala | NFRs | arquitetura AWS, SLOs, testes de carga/restauração |

Uma revisão de consistência deve detectar requisitos sem task, task sem requisito, endpoint sem cenário, entidade sem owner e ADR aceito não refletido no Plan.
