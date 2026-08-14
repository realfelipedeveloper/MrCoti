# SLOs, SLIs e error budgets do Mr Coti

> Este documento define a semântica de medição. A tabela progressiva canônica de
> local demonstrável/SaaS inicial/SaaS futuro está em
> [`../19-operations/slo.md`](../19-operations/slo.md) e foi aprovado com condições
> como objetivo técnico demonstrativo.

## Conceitos

- **SLI:** medida objetiva da experiência ou confiabilidade, expressa como proporção ou distribuição.
- **SLO:** objetivo para um SLI em uma janela e população definidas.
- **Error budget:** parcela de eventos ruins tolerada pelo SLO.
- **SLA:** compromisso contratual; não é definido por este documento técnico.

Os números abaixo são objetivos iniciais de engenharia, não SLA. Devem ser
revalidados por Product, arquitetura, operação e negócio com baseline de carga antes
de produção comercial ou compromisso contratual.

## Convenções de medição

- janela móvel de 28 dias para acompanhamento principal, complementada por janelas curtas de burn-rate;
- medição no ponto mais próximo da experiência, sem contar somente saúde interna;
- rotas de healthcheck, tráfego sintético e requisições claramente inválidas excluídas conforme regra documentada;
- falhas causadas pelo Mr Coti contam mesmo quando a origem técnica é uma dependência escolhida pelo produto;
- exclusão de manutenção só ocorre se prevista e aprovada; não se reclassifica incidente depois do fato para melhorar o indicador;
- cada SLI registra query, fonte, owner, atualização, filtros e teste de validade.

## Fórmulas

Para eventos discretos:

`SLI = eventos bons / eventos elegíveis`

`error budget = 1 - objetivo`

`budget consumido = eventos ruins observados / eventos ruins permitidos`

Para latência, um evento é bom quando conclui com resultado tecnicamente válido e abaixo do limiar. Métricas financeiras/fiscais usam estado de negócio, não apenas HTTP 2xx.

## Catálogo inicial proposto

| Jornada/capacidade | Evento bom | SLO inicial proposto | Fonte |
|---|---|---|---|
| disponibilidade da API autenticada | resposta não 5xx dentro do prazo técnico, excluídas entradas inválidas | 99,9% em 28 dias | edge/API metrics |
| leitura de cardápio | resposta válida em até 1 s no percentil avaliado | 99,0% dos eventos elegíveis | API trace/metric |
| criação de pedido | pedido persistido uma vez e confirmado em até 2 s | 99,0% | API + domínio + DB |
| fechamento de comanda | estado final consistente iniciado em até 3 s, ou processamento aceito conforme contrato | 99,0% | API + domínio |
| processamento de outbox | evento publicado sem perda em até 60 s | 99,9% | outbox metrics |
| jobs de alta prioridade | efeito ou estado terminal correto em até 5 min | 99,0% | BullMQ + domínio |
| pagamento fictício | resultado final coerente com cenário em até 2 min, descontando timeout simulado contratual | 99,0% | API/provider fake/webhook |
| nota fictícia | autorização/rejeição coerente em até 5 min, descontando indisponibilidade simulada contratual | 99,0% | API/provider fake/webhook |
| notificação fake | envio ou falha terminal rastreável no prazo da fila | 99,0% em 10 min | queue/provider fake |
| isolamento de tenant | nenhuma resposta/efeito contém dado de tenant não autorizado | 100% | segurança, auditoria e incidentes |
| integridade de efeito idempotente | nenhuma duplicação de efeito financeiro/fiscal por mesma operação | 100% | domínio, DB e auditoria |

Objetivos de 100% expressam tolerância zero de segurança/integridade, mas não são tratados como disponibilidade tradicional nem como licença para ocultar detecção. Uma única violação é incidente e bloqueia a operação afetada.

## Disponibilidade da API

**Elegíveis:** requisições a rotas de produto suportadas, com formato suficiente para processamento.

**Boas:** respostas esperadas do contrato — inclusive 4xx legítimos — sem falha interna e dentro do timeout definido. Rate limit corretamente aplicado não conta como indisponibilidade; rate limit incorreto que bloqueia tráfego legítimo conta.

**Ruins:** 5xx atribuível ao serviço, timeout, conexão recusada ou resposta malformada. A classificação deve impedir que erros internos sejam mascarados como 4xx.

## Latência

Latência é medida ponta a ponta no backend e, para jornadas web, complementada por indicadores reais do navegador quando houver consentimento/configuração aplicável. p50 mostra normalidade, p95 experiência comum degradada e p99 cauda/capacidade. O SLO usa proporção de eventos abaixo do limite para permitir error budget e alertas burn-rate.

## Processamento assíncrono

O cronômetro começa quando a intenção fica durável (outbox/job) e termina quando o efeito ou estado terminal fica persistido. Retry ainda pode resultar em evento bom se concluir no prazo. Job removido, preso, duplicado com efeito ou sem correlação é ruim. Backlog e idade do item mais antigo são indicadores antecipatórios, não substitutos do SLI.

## Dependências e cenários fake

Timeout, fraude, rejeição e indisponibilidade simulados são resultados de negócio esperados quando solicitados pelo cenário; a plataforma deve representá-los corretamente. O evento é ruim se perder a solicitação, duplicar efeito, ultrapassar o prazo prometido, responder com estado incoerente ou impedir consulta/rastreabilidade.

Em produção futura, indisponibilidade real de provider continua impactando o SLI do produto se afetar o usuário. Uma métrica separada atribui a causa para gestão de fornecedor.

## Error budget e política de mudança

Para objetivo de 99,9%, o budget máximo é 0,1% dos eventos elegíveis; para 99,0%, 1%. A quantidade absoluta depende do volume real e é calculada pela plataforma de métricas.

Política proposta:

- budget saudável: evolução normal com gates;
- consumo acelerado: investigar, reduzir rollout e priorizar confiabilidade;
- budget quase esgotado: pausar mudanças de risco não relacionadas à recuperação;
- budget esgotado: somente correções, segurança e mudanças aprovadas para restaurar SLO;
- violação de isolamento/integridade: incidente imediato, independentemente do budget de disponibilidade.

Exceções são temporárias, registradas e aprovadas. Error budget não autoriza aceitar vulnerabilidade ou corrupção.

## Alertas de burn-rate

Alertas devem combinar janela rápida, para consumo intenso, e lenta, para degradação persistente. Valores de burn-rate e duração serão calibrados após baseline e capacidade de resposta. Paging só é usado quando há ação imediata; tendência abre trabalho planejado.

Cada alerta liga a SLO, query, impacto, dashboard, runbook e owner. O alerta é testado por simulação segura e revisado após falso positivo, falso negativo ou incidente.

## Revisão e aprovação

Mensalmente no início e depois em cadência aprovada, Product, DevOps, QA e responsáveis técnicos revisam volume, validade dos eventos, cumprimento, custo, incidentes e percepção dos tenants. Mudança de objetivo não é usada para apagar histórico. Novo SLO inicia como candidato, passa por instrumentação/baseline e só então se torna gate.

## Critérios de confiabilidade do próprio SLI

- fonte e consulta versionadas;
- gaps/drop de telemetria detectados;
- relógios e unidades consistentes;
- classificação de eventos testada com sucesso, falha e timeout;
- cardinalidade e custo controlados;
- nenhuma PII em labels;
- comparação periódica com amostra de logs/traces/auditoria;
- owner e runbook definidos.
