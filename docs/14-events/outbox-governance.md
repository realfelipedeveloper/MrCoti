# Governança da Outbox

## Regra transacional

Mudança de agregado e `OutboxMessage` são persistidas na mesma transação MySQL. Publicador seleciona lotes com concorrência segura, publica e registra tentativa/resultado. Marcar como publicado antes do broker confirmar é proibido.

## Campos mínimos

`event_id`, `tenant_id`, `aggregate_type/id/version`, `event_name/version`, `payload`, `occurred_at`, `correlation_id`, `causation_id`, `status`, `attempt_count`, `next_attempt_at`, `published_at` e erro sanitizado.

## Operação

- retry finito com backoff/jitter e classificação transitória/permanente;
- dead-letter explícita após limite, com alerta e replay autorizado;
- métricas de backlog, idade do item mais antigo, throughput, falha e tempo até publicação;
- quotas/fairness impedem tenant ruidoso de monopolizar publicação;
- payload e erro respeitam classificação/retention;
- replay preserva `eventId`; nunca cria novo efeito para o mesmo fato.

## Ownership

O contexto produtor é dono do evento e da escrita na outbox. Platform/DevOps opera o publicador; consumidor é dono de idempotência e tratamento. Alterar semântica de entrega exige ADR.

## Retenção

Publicados são retidos pelo período operacional aprovado e depois arquivados/eliminados. Itens não publicados/dead-letter não expiram silenciosamente. Prazos finais dependem de `docs/18-governance/data-retention-policy.md`.
