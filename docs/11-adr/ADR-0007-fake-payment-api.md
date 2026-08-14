# ADR-0007 — API fictícia de pagamentos

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** Módulo/adaptador fake no monólito modular

## Contexto

O MVP do **Mr Coti** precisa exercitar criação de cobrança, autorização, captura, cancelamento, estorno, consulta e webhooks antes de integrar um adquirente real. O SDD exige simulações de sucesso, falha, timeout, fraude e chargeback, além de idempotência.

A API fake deve validar contratos e resiliência sem criar um microsserviço, processar dinheiro real ou acoplar Financeiro a um fornecedor.

## Drivers

- desenvolvimento e testes determinísticos sem dependência externa;
- contrato API First e máquina de estados realista;
- idempotência em toda mutação;
- simulação de falhas, latência e eventos assíncronos;
- separação entre recebimento interno e cobrança externa;
- troca futura por gateway real via porta/adaptador;
- execução e observabilidade dentro do monólito inicial.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Módulo/adaptador fake no monólito | Baixo custo, contrato testável e sem operação distribuída | Compartilha release; exige fronteira disciplinada |
| Microsserviço fake | Deploy e falhas de rede mais realistas | Complexidade proibida/prematura e pouco valor para o MVP |
| Mocks apenas em testes | Muito simples | Não valida API pública, webhooks, idempotência nem operação ponta a ponta |
| Gateway real desde o MVP | Valida produção | Custo, compliance e risco fora do objetivo desta fase |

## Decisão

Implementar futuramente a API REST fictícia de pagamentos como **módulo e adaptador dentro do backend monolítico do Mr Coti**, exposto pelos contratos públicos necessários. Não será um serviço, repositório ou banco separado.

Uma porta `PaymentGateway` conceitual isola Financeiro/Operação. O adaptador fake mantém cobrança e transições controladas no MySQL, sempre tenant-aware. Operações mutáveis exigem idempotency key; mesma chave/payload retorna resposta equivalente e chave igual com payload divergente retorna conflito.

O fake suporta cenários configurados de sucesso, falha, timeout, fraude e chargeback. Timeout representa resultado desconhecido: o chamador consulta antes de repetir. Webhooks possuem ID, assinatura fake, timestamp, tentativa e entrega potencialmente duplicada, atrasada ou fora de ordem. Processamento usa outbox/BullMQ quando durabilidade assíncrona for necessária.

Nenhum dado de cartão real é solicitado ou armazenado. A API e seus artefatos deixam explícito que não processam pagamento real.

## Consequências

### Positivas

- fluxo ponta a ponta testável localmente e em CI;
- estados e erros externos são exercitados cedo;
- integração real futura preserva a porta da aplicação;
- sem custo operacional de um serviço adicional;
- contratos de idempotência/webhook nascem antes do provider real.

### Negativas

- comportamento fake não comprova compatibilidade com um gateway específico;
- isolamento de falhas de processo é menor que em integração externa real;
- cenários precisam de controle para não vazar configuração de teste em produção;
- substituição real exigirá requisitos de segurança/compliance adicionais.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Fake ser tratado como pagamento real | Nomeação, avisos, ambiente/feature flag e ausência de dados reais |
| Cobrança duplicada | Idempotency key, constraint única e consulta após timeout |
| Webhook duplicado/fora de ordem | ID de evento, deduplicação e validação da máquina de estados |
| Cenário de simulação manipulável indevidamente | Controles por ambiente, autenticação e não expor knobs inseguros em produção |
| Acoplamento ao payload fake | Porta normalizada e testes de contrato de adaptadores |
| Chamada durante transação de pedido | Persistir intenção + outbox e executar fora da transação |

## Gatilhos de revisão

- seleção do primeiro gateway real;
- necessidade de PCI ou entrada de qualquer dado de pagamento sensível;
- split, conciliação, parcelamento ou outros fluxos não cobertos pelo contrato inicial;
- mudança do fake para componente externo por requisito de teste/ownership comprovado;
- volume exigir escala independente após otimização de workers;
- mudanças regulatórias ou de chargeback alterarem a máquina de estados.
