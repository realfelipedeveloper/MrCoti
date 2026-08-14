# Estratégia de escalabilidade

O objetivo do **Mr Coti** é atender centenas ou milhares de tenants, milhares de usuários e milhões de pedidos, logs e eventos sem reescrita estrutural. A escala começa com um monólito modular horizontalmente replicável; distribuição por microsserviços não é um pré-requisito.

## Princípios

- Serviços de API permanecem stateless; sessão e estado durável não ficam em memória local.
- MySQL é a fonte de verdade; Redis acelera cache, rate limiting e filas, mas pode ser reconstruído.
- Toda consulta é tenant-scoped, paginada e guiada por padrão de acesso conhecido.
- Trabalho lento, retriável ou externo é assíncrono quando a experiência do usuário não exige resposta imediata.
- Escala é orientada por métricas e testes de carga, não por previsão isolada.
- Backpressure e degradação controlada são preferíveis a sobrecarregar banco e integrações.

## Perfis de carga e resposta

| Perfil | Estratégia inicial | Sinal de pressão |
|---|---|---|
| APIs operacionais | Réplicas horizontais, paginação, índices tenant-aware e transações curtas | p95/p99, saturação de conexões, locks e erros |
| Pedidos e comandas | Agregados pequenos, concorrência controlada e snapshots | conflitos, tempo de transação e filas por unidade |
| Integrações | BullMQ, retries com backoff, idempotência e circuitos operacionais | taxa de falha, tempo externo, tentativas e DLQ lógica |
| Relatórios | Projeções de leitura, processamento assíncrono e exportação | consultas longas, memória e impacto no banco transacional |
| Logs/auditoria/eventos | Escrita estruturada, retenção e arquivamento | volume diário, custo, atraso do outbox e retenção |
| Conteúdo estático/imagens | Armazenamento de objetos e CDN na AWS futura | banda, latência e taxa de cache hit |

## Banco de dados

- Índices compostos começam com `tenant_id` quando as consultas partem do tenant e incluem colunas de filtro/ordenação reais.
- Paginação por cursor é preferida em conjuntos extensos ou mutáveis; offset pode atender listas pequenas.
- Evitar N+1, seleção de colunas desnecessárias e transações que incluam chamadas externas.
- Chaves idempotentes e restrições únicas impedem duplicidade sob concorrência.
- Migrações são compatíveis com rolling deployment: expandir, migrar/preencher e só depois remover.
- Dados históricos usam política de retenção e arquivamento definida por domínio e obrigação legal.
- Réplicas de leitura ou separação analítica são evoluções futuras, acionadas por métricas e registradas por ADR.
- Particionamento físico ou sharding não é adotado inicialmente; deve preservar localização por tenant e exigir ADR.

O pool de conexões deve ter orçamento global: número de réplicas multiplicado pelo pool por réplica não pode esgotar o MySQL. Escalar a API sem ajustar esse orçamento pode piorar a disponibilidade.

## Cache

Redis pode armazenar cardápios publicados, configurações de feature flags e leituras quentes. Cada chave inclui ambiente, tenant, recurso e versão. TTL limita staleness; mudanças críticas invalidam explicitamente. Cache miss nunca remove a regra de autorização ou tenancy.

Não armazenar como única cópia em Redis: pedido, saldo financeiro, consentimento, entitlement, outbox ou auditoria. Prevenir cache stampede com expiração distribuída e reconstrução controlada quando a carga justificar.

## Filas e backpressure

BullMQ separa filas por perfil operacional, não necessariamente por tenant: notificações, pagamentos, notas, outbox e projeções. Jobs contêm identificadores mínimos, `tenant_id`, versão, correlation ID e chave idempotente.

- concorrência e rate limiting respeitam a capacidade do provedor e do banco;
- retries usam backoff e limite de tentativas;
- falhas permanentes vão para estado de intervenção, equivalente a uma dead-letter queue lógica;
- jobs presos são detectados e retomados com segurança;
- tenants ruidosos têm cotas ou agendamento justo quando necessário;
- profundidade, idade do job mais antigo e taxa de falha alimentam alertas.

## Relatórios e leitura otimizada

Relatórios pesados não executam joins irrestritos durante picos operacionais. Eventos internos alimentam projeções tenant-aware, reconstruíveis e eventualmente consistentes. Exportações extensas são jobs e entregam um artefato com expiração e controle de acesso. O usuário vê o instante de atualização da projeção.

Uma futura plataforma analítica exige ADR e política de governança; não está autorizada por este documento.

## Disponibilidade e resiliência

- Healthchecks distinguem liveness de readiness.
- Instâncias deixam de receber tráfego antes do encerramento e concluem trabalho dentro de prazo controlado.
- Chamadas externas têm timeout, retry seletivo e idempotência; falhas não seguram transações MySQL.
- Funcionalidades não críticas podem ser desligadas por feature flag.
- Backup e restauração são testados; recuperação considera RPO e RTO definidos antes de produção.
- Deploy preserva compatibilidade de mensagens e banco durante a janela de rollout.

## Etapas de evolução

1. **MVP:** uma API modular replicável, MySQL e Redis, índices corretos, filas e observabilidade básica.
2. **Crescimento:** autoscaling, projeções de leitura, CDN/objetos, tuning de pool e isolamento de workloads BullMQ.
3. **Alta escala:** réplicas de leitura, arquivamento e capacidade dedicada onde métricas demonstrarem necessidade.
4. **Exceções:** extração de módulo ou isolamento físico de tenant apenas após ADR e plano de migração.

## Quality gates de capacidade

Antes de produção, definir SLOs, workload representativo e limites. Testes devem cobrir pico de pedidos, concorrência no fechamento, duplicidade de webhooks, atraso de provider, backlog de fila, perda temporária de Redis e consulta de relatório. O resultado registra capacidade por configuração, gargalo observado e margem operacional.
