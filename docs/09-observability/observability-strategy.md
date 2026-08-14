# Estratégia de observabilidade do Mr Coti

## Objetivos

A observabilidade deve responder, com dados seguros e correlacionados:

- os tenants conseguem usar as jornadas críticas?;
- qual componente ou dependência explica a degradação?;
- o problema afeta um tenant, plano, unidade, região ou todos?;
- existe backlog, retry, duplicidade ou perda de evento?;
- uma release, migration, flag ou provider iniciou a mudança?;
- os SLOs e error budgets estão saudáveis?;

## Modelo de sinais

O Mr Coti adota logs, métricas, traces e eventos de auditoria com responsabilidades distintas. Logs explicam eventos discretos, métricas mostram tendência/estado agregado, traces conectam latência e dependências, e auditoria comprova ação crítica. Copiar o mesmo payload para todos os sinais aumenta custo e risco sem melhorar diagnóstico.

## Contexto e correlação

Toda requisição aceita ou gera `request-id` e mantém `correlation-id` conforme o contrato. IDs externos são validados por tamanho/formato antes de propagação. Domain events, outbox records, jobs, retries e webhooks carregam correlação, causation ID e identificador de evento.

O contexto técnico pode incluir serviço, módulo, versão, ambiente, operação, resultado e referência opaca de tenant. O identificador de tenant usado em telemetria deve ser controlado/pseudonimizado conforme necessidade; nunca vira label de métrica de alta cardinalidade. Baggage não carrega token, e-mail, telefone, nome, documento, conteúdo de pedido ou payload.

## Logs estruturados

### Campos comuns

- timestamp UTC e nível;
- serviço, módulo, ambiente e versão;
- evento estável e schema version;
- request/correlation/trace/span IDs;
- tenant reference controlada quando indispensável;
- operação, duração e resultado;
- error code/class normalizados;
- provider, fila ou job type com vocabulário controlado.

### Níveis

- **DEBUG:** diagnóstico local/temporário, desabilitado por padrão em produção.
- **INFO:** evento operacional normal relevante, sem logar cada detalhe interno.
- **WARN:** degradação recuperada, retry ou condição que merece acompanhamento.
- **ERROR:** operação falhou e requer investigação ou impacto mensurável.
- **FATAL:** processo não pode operar com segurança.

Nível não substitui severidade de incidente. Um erro de usuário esperado pode ser `INFO`/métrica; uma queda silenciosa de eventos pode ser crítica mesmo com poucos logs.

### Redaction

Usar allowlist de campos, não blacklist como única proteção. Nunca registrar senha, token, cookie, authorization header, secret, connection string, dados de cartão, documento completo, corpo de webhook, XML/PDF ou conteúdo livre sem sanitização. Dados de contato e IDs de clientes são mascarados ou omitidos. Quebras de linha e campos controlados pelo usuário são estruturados para prevenir log forging.

## Métricas

Aplicar o modelo RED a APIs (rate, errors, duration) e USE a recursos (utilization, saturation, errors). Exemplos planejados:

- requisições por rota normalizada, método, status class e duração;
- jornadas de autenticação, pedido, fechamento, pagamento, nota e notificação;
- pool/conexões MySQL, latência, erros e queries lentas agregadas;
- Redis: latência, erros, memória e evictions;
- BullMQ: backlog, idade do job mais antigo, processamento, retries, falhas e estado terminal;
- outbox: pendentes, idade, publicação, duplicidade e falha;
- providers: chamadas, latência, timeout, circuit breaker e resultado controlado;
- runtime: CPU, memória, event loop, GC, restart e disponibilidade;
- feature flags: avaliações por feature controlada e resultado agregado, sem tenant como label.

Labels são enumeradas e de baixa cardinalidade. Não usar URL crua, ID de request, user, tenant, pedido, comanda, job ou mensagem como label. Detalhes ficam em trace/log protegido e correlacionado.

## Tracing distribuído

Mesmo como modular monolith, traces acompanham requisição, módulos, Prisma, Redis, outbox, workers e providers. Spans usam nomes estáveis e atributos sem PII. Queries e payloads completos não são capturados. Sampling preserva traces com erro/alta latência segundo política e reduz volume normal; decisões não podem excluir justamente jornadas raras e críticas.

OpenTelemetry é a opção preferencial por portabilidade, mas sua adoção e backend dependem de ADR. Instrumentação do domínio registra eventos úteis sem acoplar regra de negócio ao SDK.

## Healthchecks

- **Liveness:** responde se o processo está vivo e não travado. Não depende de providers externos e não reinicia o serviço por falha alheia.
- **Readiness:** responde se a instância pode receber tráfego com segurança; considera startup, schema compatível e dependências essenciais.
- **Startup:** concede tempo para inicialização e evita liveness prematura quando o orquestrador suportar.
- **Deep health/diagnóstico:** endpoint restrito para detalhes de dependências; não é público nem usado indiscriminadamente pelo load balancer.

Respostas públicas são mínimas e não expõem versão de biblioteca, host, credencial ou topologia. Workers possuem sinais próprios de vida e progresso; processo vivo sem consumir jobs não é saudável.

## Dashboards

### Visão executiva/SLO

Disponibilidade, latência, sucesso das jornadas, error budget, tenants afetados agregados e incidentes/release markers.

### API e frontend

Volume, erros por classe, p50/p95/p99, rotas normalizadas, Web Vitals quando aprovados e regressões por versão.

### Dados e filas

MySQL/Redis, pool, saturação, outbox, backlog, idade, retries e jobs terminais.

### Integrações

Pagamento, nota, e-mail, SMS e WhatsApp por operação/result class, timeout, retry e circuit breaker. Ambientes fake são identificados para não misturar com sinais reais futuros.

### Segurança

Falhas de login, rate limit, negações anômalas, assinatura de webhook inválida, tentativa cross-tenant e acesso privilegiado, com acesso restrito e limiares revisados pelo Security Agent.

## Alertas

Alertar sintomas ligados a SLO e condições que exigem ação, não todo erro isolado. Cada regra contém severidade, descrição, owner, runbook, janela, limiar, deduplicação e condição de recuperação.

- **Crítico:** risco imediato de indisponibilidade ampla, integridade, segurança ou consumo acelerado de error budget.
- **Alto:** degradação relevante ou backlog que alcançará impacto se não tratado.
- **Médio/baixo:** tendência, capacidade ou manutenção; normalmente ticket, não paging.

Burn-rate em janelas rápida e lenta é preferido para disponibilidade/latência. Histerese e agrupamento evitam flapping e tempestade. Silenciamento tem autor, justificativa e expiração.

## Release e mudança

Dashboards marcam deploy, digest, migration e alteração de feature flag. Release Loop verifica que novos sinais e runbooks existem antes da promoção. Após deploy, smoke e SLI são observados por janela proporcional ao risco. Uma degradação aciona pausa, rollback ou roll-forward conforme integridade de schema/dados.

## Retenção e acesso

Prazos variam por sinal, finalidade, custo e obrigação e serão aprovados na matriz LGPD. Métricas agregadas podem ter retenção maior que logs detalhados. Acesso usa RBAC, menor privilégio e auditoria; produção e não produção permanecem separadas. Exportar logs para diagnóstico mantém classificação e prazo.

## Falhas na própria telemetria

Instrumentação não deve interromper a operação principal por indisponibilidade do backend de observabilidade. Buffers têm limites para não esgotar memória/disco. Perda, atraso e drop de telemetria são medidos e alertados. Auditoria crítica segue requisitos próprios de durabilidade e não depende apenas de log stdout.

## AWS readiness

Instrumentação padronizada permite encaminhar sinais a CloudWatch ou stack aprovada sem alterar domínio. Containers escrevem logs estruturados em stdout/stderr; exporters e agents ficam na camada de infraestrutura. Identidade, criptografia, retenção e custos são configurados por ambiente.

## Processo operacional

1. detectar pelo SLO, alerta ou relato;
2. confirmar impacto e severidade;
3. correlacionar versão, flag, tenant agregado, fila e provider;
4. mitigar com ação prevista no runbook;
5. preservar evidência e comunicar;
6. recuperar e validar SLI;
7. realizar revisão sem culpabilização e transformar aprendizado em spec, teste, alerta ou arquitetura.

## Critério de pronto observável

Uma funcionalidade crítica possui eventos estruturados, métricas RED/negócio, traces nas fronteiras, health impact conhecido, dashboard, SLI/SLO aplicável, alertas acionáveis, runbook e teste de sanitização. Ausência de sinal necessário rejeita o Observability Loop.

