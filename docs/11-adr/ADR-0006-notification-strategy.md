# ADR-0006 — Estratégia de notificações

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** Porta abstrata, providers fake e BullMQ

## Contexto

O **Mr Coti** precisa disponibilizar API REST fictícia de notificações por e-mail, SMS e WhatsApp, com envio, status, logs, templates, fila e retries. Canais e providers reais mudarão ao longo do produto; regras de negócio não devem conhecer detalhes de um fornecedor.

Notificações podem falhar ou demorar e não devem alongar transações de pedidos, reservas ou financeiro.

## Drivers

- desacoplamento entre casos de uso, canais e fornecedores;
- processamento assíncrono e resiliente;
- providers fake determinísticos para desenvolvimento/testes;
- idempotência e prevenção de envio duplicado;
- templates, status e logs auditáveis;
- respeito a consentimento, opt-out e LGPD;
- adoção futura de Nodemailer, SES, SNS ou outros somente via ADR.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Porta abstrata + BullMQ + providers fake | Resiliência, testabilidade e troca de provider | Consistência eventual e operação de filas |
| Envio síncrono no caso de uso | Implementação conceitualmente curta | Latência, acoplamento e perda/repetição em falhas |
| Um módulo específico por fornecedor | Acesso direto a recursos do provider | Lock-in e regras duplicadas por canal |

## Decisão

Criar um módulo de **Notificações** no monólito modular, com porta de envio independente de provider e adaptadores fake iniciais para e-mail, SMS e WhatsApp. Intenções duráveis são persistidas com outbox e processadas por filas BullMQ sobre Redis.

Cada intenção inclui tenant, canal, template/versionamento, referência segura de destinatário, locale, variáveis permitidas, finalidade, correlation ID e chave idempotente. O worker revalida estado relevante, renderiza com dados mínimos e chama o provider. O estado público normalizado segue o contrato: `QUEUED`, `PROCESSING`, `SENT`, `FAILED` ou `DEAD_LETTER`. Confirmação de entrega que um provider futuro oferecer será metadado/evento separado até revisão explícita do contrato.

Retries usam backoff e limite por canal; falhas permanentes ficam disponíveis para intervenção autorizada. Logs registram provider fake, tentativas, timestamps e erro sanitizado, nunca conteúdo ou PII em excesso. A API de status aplica tenant e RBAC.

Nodemailer e providers AWS/reais não são adotados nesta decisão. Sua entrada exigirá ADR com segurança, custo, limites, entregabilidade, privacidade e operação.

## Consequências

### Positivas

- negócio não depende de fornecedor ou protocolo;
- chamadas lentas não bloqueiam transações principais;
- cenários de falha/retry são reproduzíveis;
- novos canais reutilizam estado, templates e observabilidade;
- idempotência reduz comunicações duplicadas.

### Negativas

- envio é eventualmente consistente;
- Redis/BullMQ e workers precisam de monitoração;
- templates e variáveis exigem governança;
- status `delivered` não é igualmente disponível em todos os canais.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Envio duplicado | Chave idempotente e registro de efeito por provider/canal |
| Backlog atrasar mensagens | Métrica de idade, autoscaling de workers e prioridades limitadas |
| PII em fila/log | Referências mínimas, sanitização, retenção e controle de acesso |
| Retry em erro permanente | Classificação de erro, limite e estado de intervenção |
| Tenant suspenso após enqueue | Revalidar política antes do envio e auditar cancelamento/continuidade |
| Template injetar conteúdo indevido | Variáveis allowlisted, escaping e revisão/versionamento |
| Provider real causar lock-in | Adaptador e testes de contrato da porta |

## Gatilhos de revisão

- adoção do primeiro provider real de qualquer canal;
- necessidade de garantia, prioridade ou latência diferente por tipo de mensagem;
- volume exigir isolamento de filas/cotas por tenant ou canal;
- requisitos legais de consentimento/retenção mudarem;
- migração BullMQ/Redis para SQS/SNS ser proposta;
- marketplace permitir providers configuráveis por tenant.
