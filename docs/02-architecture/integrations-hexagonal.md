# Integrações por Arquitetura Hexagonal

Pagamentos fictícios, emissão fictícia de notas e notificações entram no **Mr Coti** por portas definidas pela aplicação e adaptadores de infraestrutura. As APIs fake são módulos/adaptadores dentro do monólito modular, não microsserviços.

## Princípios de fronteira

- O domínio descreve intenção e resultado em sua linguagem; não conhece HTTP, BullMQ, Prisma ou formatos de provider.
- A aplicação define portas de saída e coordena idempotência, timeout, estado e auditoria.
- Adaptadores traduzem contrato interno para REST/provider e normalizam respostas e erros.
- Controllers e webhooks são adaptadores de entrada; validam transporte e delegam a casos de uso.
- Credenciais e endpoints são configuração segura por ambiente.
- Toda interação externa propaga correlation ID e registra metadados seguros.
- Nenhuma chamada externa acontece dentro da transação MySQL que altera o agregado de negócio.

## Portas principais

| Porta | Operações conceituais | Resultados normalizados |
|---|---|---|
| `PaymentGateway` | criar cobrança, autorizar, capturar, cancelar, estornar, consultar | pendente, autorizada, capturada, cancelada, estornada, falhou, fraude, chargeback |
| `InvoiceIssuer` | emitir, cancelar, consultar, obter artefatos fake | pendente, autorizada, rejeitada, cancelada, indisponível |
| `NotificationSender` | enviar e consultar por canal | enfileirada, enviada, entregue quando suportado, falhou |
| `ObjectStorage` | armazenar/obter artefatos | referência opaca e acesso autorizado/temporário |

Nomes são conceituais; contratos finais devem ser consolidados na especificação e no OpenAPI.

## API fictícia de pagamentos

O módulo fake expõe apenas a superfície pública prevista no SDD: criação, autorização, captura, cancelamento, estorno, consulta e webhooks. Cenários controláveis: sucesso, falha, timeout, fraude e chargeback.

- Toda mutação aceita chave de idempotência no escopo do tenant e da operação.
- A mesma chave com o mesmo payload retorna resultado equivalente; payload diferente gera conflito.
- Estado da cobrança segue transições explícitas; captura sem autorização válida é rejeitada.
- Timeout é resultado desconhecido, não falha definitiva: o orquestrador consulta antes de repetir.
- Webhooks são assinados no contrato fake, deduplicados por ID e podem chegar atrasados ou fora de ordem.
- Dados fake não imitam armazenamento de cartão real e nunca devem ser confundidos com processamento financeiro real.

Detalhes: [ADR-0007](../11-adr/ADR-0007-fake-payment-api.md).

## API fictícia de emissão de notas

O módulo fake cobre emissão, autorização/rejeição, cancelamento, consulta, download XML/PDF fake e webhooks. Cenários: autorizada, rejeitada e indisponibilidade.

- A solicitação possui referência idempotente e snapshot mínimo dos dados necessários.
- Artefatos são claramente marcados como fictícios e não têm validade fiscal.
- Indisponibilidade mantém estado pendente/retriável; rejeição de regra é permanente até correção.
- Download exige tenant e autorização, sem expor caminho interno de armazenamento.
- Webhooks seguem deduplicação, assinatura fake e máquina de estados.

Detalhes: [ADR-0008](../11-adr/ADR-0008-fake-invoice-api.md).

## Notificações

Uma intenção de notificação contém template, canal, destinatário referenciado de forma segura, locale e variáveis permitidas. O envio ocorre por BullMQ com retries e logs, por meio de provider abstrato. Providers fake de e-mail, SMS e WhatsApp são a implementação inicial.

- Cada canal pode ter política própria de retry e status.
- Templates são versionados; o job referencia a versão resolvida ou um snapshot seguro.
- PII é minimizada em filas e logs; conteúdo integral não aparece na observabilidade.
- Opt-out, consentimento e finalidade são validados antes do envio quando aplicáveis.
- Duplicidade é evitada por chave de intenção, canal e destinatário.
- Nodemailer, SES, SNS ou providers reais só serão adotados por ADR específico.

Detalhes: [ADR-0006](../11-adr/ADR-0006-notification-strategy.md).

## Política de erros

| Classe | Exemplo | Tratamento |
|---|---|---|
| Validação | payload inválido, transição proibida | sem retry; resposta estável e auditável |
| Autorização/tenancy | tenant divergente, escopo ausente | negar; sem revelar existência do recurso |
| Transitório | timeout, conexão, indisponibilidade | retry com backoff e jitter; limite de tentativas |
| Negócio externo | fraude, rejeição | sem retry automático até nova decisão de negócio |
| Duplicidade | webhook/job repetido | retornar resultado já conhecido, sem repetir efeito |
| Desconhecido | timeout após envio | consultar por idempotency key antes de repetir |

## Webhooks de entrada e saída

Entrada: validar assinatura, timestamp/replay, tamanho, tipo de evento e ID; persistir recebimento antes de processar; responder rapidamente; processar assincronamente e deduplicar. O tenant é resolvido por credencial/referência interna, nunca por confiança cega em campo do payload.

Saída: registrar assinatura, tentativa, resposta e próxima tentativa; usar URL allowlisted por tenant; bloquear destinos inseguros; não enviar secrets ou dados excessivos. A definição completa de proteção contra SSRF e assinatura pertence ao contrato de segurança.

## Testes de contrato e resiliência

Cada porta possui testes de contrato reutilizados por adaptadores fake e futuros. Cobrir sucesso, falha, timeout, retry, duplicidade, payload divergente na mesma chave, webhook atrasado/fora de ordem e tenant incorreto. Testes com Testcontainers validam MySQL, Redis, BullMQ e outbox quando a implementação for autorizada.

Veja o fluxo em [integration-sequence.puml](../03-uml/integration-sequence.puml).
