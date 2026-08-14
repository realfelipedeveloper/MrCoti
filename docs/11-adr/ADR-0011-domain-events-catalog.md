# ADR-0011 — Catálogo de Domain Events

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** eventos compartilhados terão catálogo, envelope, versão e publicação via outbox governados

## Contexto

O monólito modular usa eventos internos para desacoplar contextos. Sem catálogo, nomes, payloads e consumidores divergem, dados sensíveis se espalham e replay/idempotência tornam-se imprevisíveis.

## Drivers

- contratos explícitos entre contextos;
- evolução compatível;
- entrega at-least-once e consumidores idempotentes;
- minimização de dados;
- observabilidade e ownership;
- caminho futuro para distribuição sem antecipá-la.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| catálogo versionado + outbox | confiabilidade, rastreabilidade e revisão | governança e manutenção adicionais |
| eventos ad hoc em código | rápido no início | deriva semântica, PII e acoplamento oculto |
| broker/event sourcing completo | recursos avançados | complexidade prematura e fora da stack inicial |

## Decisão

Adotar envelope canônico com event/aggregate/correlation/causation IDs, versões e payload mínimo. Eventos cross-context entram na outbox na transação do agregado. Consumidores deduplicam por event ID e validam ordem por aggregate version. Mudanças incompatíveis criam nova versão com migração controlada.

## Consequências

### Positivas

- dependências e owners visíveis;
- replay e auditoria operacional possíveis;
- payloads sensíveis são bloqueados por contrato;
- extração futura possui linguagem publicada.

### Negativas

- dual-publish pode ser necessário;
- outbox/consumidores geram carga operacional;
- nem todo evento de domínio precisa ser publicado.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| evento virar comando | nomes no passado e revisão de semântica |
| duplicidade/fora de ordem | event ID + aggregate version |
| payload crescer | schema mínimo e dados proibidos |
| dead-letter esquecida | alerta, owner e runbook de replay |

## Gatilhos de revisão

- adoção de broker externo/SQS;
- necessidade de event sourcing;
- contratos públicos de eventos/marketplace;
- escala de outbox ultrapassar SLO após otimização.
