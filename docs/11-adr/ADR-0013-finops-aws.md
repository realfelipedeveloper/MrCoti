# ADR-0013 — FinOps na AWS

- **Status:** Aceito como governança; orçamentos pendentes
- **Data:** 2026-06-23
- **Decisão:** custos AWS serão atribuídos por ambiente/módulo e drivers de uso por tenant

## Contexto

Recursos AWS futuros serão majoritariamente compartilhados. Tags não atribuem diretamente custo a cada tenant, e logs, storage, filas, notificações e tenants ruidosos podem produzir custo desproporcional.

## Drivers

- custo por tenant/plano/módulo;
- unit economics e forecast;
- alertas antes do estouro;
- tags consistentes;
- proteção de SLO/segurança;
- ambientes não produtivos controlados.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| tags + usage allocation/showback | visão técnica e por tenant sem recurso dedicado | estimativa/reconciliação necessária |
| apenas fatura por conta | simples | sem owner ou custo unitário |
| recurso dedicado por tenant | atribuição direta | custo e operação inviáveis para muitos tenants |

## Decisão

Aplicar tags obrigatórias a recursos e Usage Records técnicos para API, workers, banco, storage, notificações e observabilidade. Compartilhados usam drivers documentados; dedicados atribuem 100%. Alertas por orçamento/anomalia e revisão periódica não desligam controle crítico automaticamente.

## Consequências

### Positivas

- custo e tenants ruidosos visíveis;
- decisões de plano/capacidade usam evidência;
- desperdício por ambiente é detectável.

### Negativas

- alocação é aproximação e tem custo de telemetria;
- cardinalidade precisa de controle;
- showback não equivale a billing.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| PII em tags | IDs técnicos só em recurso dedicado; nunca PII |
| métrica custar demais | agregação/sampling/retention |
| economia degradar SLO | reliability/security como guardrails |
| forecast errado | reconciliação mensal e revisão dos drivers |

## Gatilhos de revisão

- provisionamento da primeira conta AWS;
- criação de recurso dedicado por tenant;
- billing baseado em consumo;
- compromissos/reserved capacity;
- desvio relevante de margem/custo unitário.
