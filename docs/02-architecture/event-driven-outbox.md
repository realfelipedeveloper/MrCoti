# Eventos internos e Outbox Pattern

O **Mr Coti** usa eventos de domínio para expressar fatos relevantes e eventos de integração internos para desacoplar módulos. O Outbox Pattern garante que uma mudança de negócio e a intenção de publicação sejam persistidas atomicamente.

## Quando usar

- **Evento de domínio:** fato dentro do mesmo bounded context, como `OrderClosed`.
- **Evento de integração interno:** contrato publicado para outros módulos, estável e com dados mínimos, como `OrderClosedV1`.
- **Chamada síncrona:** validação ou resposta imediata que não pode prosseguir sem o resultado.
- **Job BullMQ:** trabalho assíncrono, retriável ou agendado.
- **Outbox:** todo efeito assíncrono que não pode ser perdido após commit, inclusive integração externa relevante.

Eventos não são usados para esconder um comando ou para replicar indiscriminadamente entidades completas.

## Fluxo confiável

1. O caso de uso valida tenant, autorização e invariantes.
2. Na mesma transação MySQL, persiste a mudança do agregado e uma mensagem na outbox.
3. Um publicador lê mensagens pendentes em lotes, com concorrência segura.
4. O publicador enfileira o trabalho no BullMQ e marca a publicação de modo idempotente.
5. Consumidores processam a mensagem ao menos uma vez e registram sua chave idempotente.
6. Falhas transitórias recebem retry com backoff; falhas permanentes ficam visíveis para intervenção/reprocessamento.

Uma falha entre enfileirar e marcar como publicado pode duplicar a entrega. Por isso, exatamente uma vez não é prometido; os efeitos são desenhados para **at-least-once + idempotência**.

## Envelope mínimo

| Campo | Finalidade |
|---|---|
| `event_id` | Identificador global e chave de deduplicação |
| `event_type` | Nome estável no passado, com versão |
| `occurred_at` | Instante UTC do fato |
| `tenant_id` | Escopo obrigatório para eventos tenant-aware |
| `aggregate_type` / `aggregate_id` | Origem e ordenação lógica |
| `schema_version` | Evolução compatível do payload |
| `correlation_id` / `causation_id` | Rastreabilidade do fluxo e causa |
| `payload` | Dados mínimos, sem secrets ou PII desnecessária |

O payload não transporta tokens, credenciais, dados sensíveis de pagamento ou snapshots completos sem justificativa. Consumidores consultam sua própria fonte quando precisam de detalhes e quando a consistência esperada permitir.

## Estado e concorrência da outbox

Registros distinguem pendente, em processamento, publicado e falho, com tentativas e próximo instante de tentativa. A reserva de lote evita dois publicadores processarem a mesma linha simultaneamente; timeout de lease permite recuperação após crash. Retenção remove registros publicados somente depois da janela de diagnóstico/auditoria definida.

O publicador nunca mantém uma transação aberta durante acesso ao Redis. A marcação pós-enfileiramento admite duplicidade e é segura pelo `event_id`.

## Idempotência dos consumidores

- persistir `consumer_name + event_id` com restrição única quando o efeito é durável;
- realizar deduplicação e mudança local na mesma transação quando possível;
- usar chaves idempotentes estáveis ao chamar pagamentos, notas e notificações;
- retornar sucesso equivalente para reentregas já concluídas;
- não marcar como consumido antes do efeito necessário estar confirmado.

Ordem global não é garantida. Quando um agregado exige ordem, usar versão do agregado e particionamento lógico, rejeitando ou adiando eventos fora de sequência.

## Evolução de contratos

Mudanças aditivas preservam consumidores existentes. Alterações incompatíveis criam nova versão do evento e período de convivência. O produtor não remove campos enquanto houver consumidor da versão anterior. Eventos históricos permanecem interpretáveis pelo prazo de retenção.

## Operação e observabilidade

Métricas mínimas incluem mensagens pendentes, idade da mais antiga, taxa de publicação, retries, falhas permanentes, tempo de processamento e duplicidades detectadas. Logs correlacionam evento, tenant, agregado e consumidor sem expor payload sensível.

Reprocessamento exige permissão, motivo, janela definida e auditoria. Reprocessar não pode recriar cobrança, emissão ou notificação quando a chave idempotente já foi concluída.

## Falhas esperadas

| Falha | Comportamento |
|---|---|
| Commit MySQL falha | Nem estado nem outbox são persistidos |
| Redis indisponível | Outbox permanece pendente e o publicador tenta depois |
| Crash após enqueue | Pode haver duplicidade; job/consumidor deduplica por `event_id` |
| Consumidor falha transitoriamente | Retry com backoff e limite |
| Payload inválido/incompatível | Falha permanente observável, sem loop infinito |
| Tenant suspenso antes do efeito | Política do caso de uso decide cancelar, pausar ou permitir; decisão é auditada |

Consulte [integration-sequence.puml](../03-uml/integration-sequence.puml).
