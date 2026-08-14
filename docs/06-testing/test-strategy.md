# Estratégia de testes do Mr Coti

## Objetivo

Esta estratégia organiza a verificação do Mr Coti antes e durante sua implementação. O objetivo não é maximizar quantidade de testes, mas reduzir com rapidez os riscos de uma plataforma SaaS multi-tenant que processará pedidos, caixa, pagamentos fictícios, emissão fiscal fictícia e notificações assíncronas.

## Pirâmide de testes

A distribuição é orientada por custo e risco, sem metas artificiais de porcentagem entre camadas:

1. **Base ampla — testes unitários:** regras de domínio, value objects, policies, casos de uso puros, validações, cálculo e transições de estado.
2. **Base intermediária — integração e API:** Prisma com MySQL real, repositórios, transações, outbox, Redis, BullMQ, guards, interceptors e endpoints NestJS.
3. **Faixa de contratos e componentes:** compatibilidade OpenAPI/webhooks, componentes React, páginas e acessibilidade.
4. **Topo estreito — E2E:** jornadas críticas completas, executadas em ambiente controlado com dependências reais ou providers fake definidos pelo produto.

Duplicação entre camadas só é aceita quando protege um risco distinto. Uma regra já demonstrada unitariamente não precisa de todas as combinações no E2E; o E2E comprova a integração da jornada.

## Tipos de teste

### Unitário — backend

**Escopo:** aggregates, entities, value objects, domain services, policies, application services puros, mapeamentos e validações determinísticas.

**Dependências:** sem rede, relógio global, banco, Redis ou filesystem real. Tempo, IDs e aleatoriedade entram por abstrações controláveis.

**Foco:** invariantes, limites, arredondamento monetário, transições válidas e inválidas, permissão contextual, decisão de feature flag e geração de domain events.

### Integração — backend e infraestrutura

**Escopo:** adaptadores Prisma, schema e constraints, transações, queries tenant-aware, outbox, cache, filas BullMQ, serialização e providers fake.

**Dependências:** MySQL 8+ e Redis reais e efêmeros, preferencialmente provisionados por Testcontainers. Serviços externos permanecem nos providers fake oficiais ou em servidores de contrato controlados.

**Foco:** comportamento que mocks não demonstram, como índices, constraints, isolamento, locks, atomicidade, ordenação, retry e concorrência.

### API

**Escopo:** aplicação NestJS exercitada por HTTP com Supertest.

**Foco:** autenticação, RBAC, validação de DTOs, status HTTP, corpo, cabeçalhos, paginação, filtros, ordenação, `correlation-id`, `request-id`, idempotência, rate limiting e formato uniforme de erro. Rotas sensíveis incluem teste sem credencial, credencial inválida, papel insuficiente e tenant divergente.

### Contrato

**Escopo:** compatibilidade entre a implementação e o OpenAPI aprovado, além dos contratos de webhooks e providers de pagamentos, notas e notificações.

**Foco:** schemas, campos obrigatórios, enums, versionamento, exemplos válidos, compatibilidade retroativa, assinatura e reentrega de webhook. Mudança incompatível exige nova versão ou decisão explicitamente aprovada no API Contract Loop.

### Componente — frontend

**Escopo:** componentes React isolados com estados e interações observáveis.

**Foco:** renderização, eventos, validação, feedback de erro, loading, estados vazios, permissões e feature flags. Detalhes internos não são alvo de asserção.

### Página — frontend

**Escopo:** páginas Next.js e a composição entre Server e Client Components, navegação e tratamento de respostas do backend.

**Foco:** metadados relevantes, estados de carregamento/erro/não autorizado, responsividade por classes e comportamento por tenant, plano e feature flag. A fronteira de dados deve impedir que conteúdo de outro tenant chegue à renderização.

### Acessibilidade

**Escopo:** componentes, páginas e jornadas críticas.

**Foco:** semântica, nome acessível, ordem de foco, navegação por teclado, contraste, mensagens de erro associadas, regiões dinâmicas e ausência de bloqueio por zoom. A automação detecta regressões comuns; validação manual complementa teclado, leitor de tela e fluxo cognitivo. O objetivo de conformidade será WCAG 2.2 nível AA, sujeito à aprovação do requisito de produto.

### E2E

**Escopo:** jornadas de maior valor ou risco com Playwright, a partir da interface e das APIs públicas.

**Jornadas iniciais:** autenticação e troca de unidade; gestão de usuários e permissões; produto até pedido; abertura de comanda até fechamento; pagamento fictício; nota fictícia; envio de e-mail fictício; restrição por tenant, plano e feature flag.

E2E não substitui testes de integração de concorrência ou falhas internas difíceis de observar pela interface.

## Testcontainers

Testcontainers é a estratégia preferencial para integração porque mantém fidelidade a MySQL e Redis sem compartilhar estado entre execuções.

Regras de uso futuro:

- fixar versões compatíveis com produção por variável ou configuração central;
- criar recursos isolados por suíte ou worker, sem depender de ordem;
- aplicar o schema pelo mesmo mecanismo validado pelo projeto;
- aguardar healthcheck real, não pausas arbitrárias;
- coletar logs do container apenas em falha e com sanitização;
- descartar containers e volumes ao final;
- usar reuso somente em desenvolvimento local e nunca como requisito do CI;
- não substituir MySQL por banco em memória;
- validar comportamento de Redis/BullMQ com Redis real nas suítes pertinentes;
- manter testes executáveis em máquinas e runners com runtime de containers disponível.

## Dados de teste

- Factories e builders criam apenas os dados necessários e explicitam `tenant_id` quando aplicável.
- IDs, datas, moedas e timezone são controlados para reprodutibilidade.
- Cada suíte usa tenant e unidade próprios; cenários de vazamento usam dois tenants deliberadamente distintos.
- Dados pessoais são sintéticos. Dumps de produção não entram em desenvolvimento ou CI.
- Seeds são versionados e mínimos; não ocultam pré-condições relevantes do cenário.
- Limpeza ocorre por descarte do ambiente ou transação segura, nunca por dependência em estado anterior.

## Dimensões transversais obrigatórias

### Multi-tenancy

Toda operação tenant-aware deve verificar leitura, escrita, atualização, exclusão lógica quando existente, consultas agregadas, cache, eventos e jobs. O `tenant_id` não pode ser aceito como autorização isolada: o contexto autenticado delimita o escopo.

### RBAC

Para cada ação sensível, cobrir pelo menos: papel permitido, papel negado, usuário suspenso, tenant suspenso e tentativa de referência a recurso de outro tenant.

### Feature flags e planos

Cobrir flag habilitada e desabilitada por ambiente, plano e tenant, incluindo precedência definida na especificação, cache invalidado e desligamento emergencial. Backend continua sendo a fronteira de enforcement; ocultar interface não concede proteção.

### Idempotência e concorrência

Criação de cobrança, captura, cancelamento, estorno, emissão de nota e consumidores assíncronos devem cobrir mesma chave/mesmo payload, mesma chave/payload divergente, reentrega, concorrência e retomada após falha parcial.

### Filas e outbox

Cobrir publicação atômica, processamento único do efeito, retry com backoff, limite de tentativas, dead-letter ou estado terminal definido, ordenação quando exigida e correlação ponta a ponta.

## Matriz inicial de cenários

| Área | Sucesso | Falha/rejeição | Timeout/indisponibilidade | Retry | Duplicidade/concorrência | Isolamento e autorização | Nível principal |
|---|---|---|---|---|---|---|---|
| Autenticação | credencial válida e contexto criado | credencial inválida ou usuário suspenso | dependência indisponível | política segura, sem amplificar brute force | sessões/tokens concorrentes conforme contrato | papel e tenant corretos | API, integração, E2E |
| Tenants e unidades | provisionamento e seleção | tenant suspenso/cancelado | falha de persistência | retomada idempotente | provisionamento repetido | nenhum acesso cruzado | unitário, integração, API |
| Usuários e RBAC | convite/atribuição permitida | privilégio insuficiente | entrega de convite indisponível | reenvio controlado | convite repetido | escalada vertical e horizontal negada | unitário, API, E2E |
| Feature flags/planos | feature ativa | feature desativada ou limite excedido | cache indisponível com fallback definido | recarga de configuração | atualização concorrente | override somente no tenant correto | unitário, integração, API |
| Cardápio | produto disponível no horário | item inválido/indisponível | mídia ou cache indisponível | recuperação de cache | alteração concorrente de preço | catálogo não vaza entre tenants | unitário, integração, página |
| Mesas/comandas | abertura, itens e fechamento | transição inválida/cancelamento negado | dependência financeira indisponível | retomada do fechamento | dois fechamentos simultâneos | unidade e tenant delimitados | unitário, integração, E2E |
| Pedidos | criação e baixa prevista | item/preço inválido | fila indisponível | publicação via outbox | submissão repetida | pedido de outro tenant invisível | unitário, integração, API |
| Pagamentos fictícios | criar, autorizar e capturar | falha, fraude e chargeback | timeout | retry seguro | chave idempotente e captura concorrente | cobrança só no tenant proprietário | contrato, integração, API, E2E |
| Notas fictícias | emitir, consultar e baixar artefato fake | rejeição e cancelamento inválido | indisponibilidade | reconsulta/reenvio | emissão repetida | artefatos isolados | contrato, integração, API, E2E |
| Notificações | e-mail/SMS/WhatsApp enviados pelo provider fake | provider retorna falha | provider expira | backoff e estado terminal | job/evento reentregue | template e destinatário do tenant correto | unitário, integração, contrato |
| Webhooks | evento válido processado | assinatura/schema inválido | receptor indisponível | reentrega | evento repetido ou fora de ordem | associação ao tenant validada | contrato, integração, API |
| Auditoria | evento crítico rastreável | gravação inválida bloqueada ou sinalizada | sink indisponível conforme política | entrega recuperada | repetição identificável | consulta restrita e mascarada | integração, API |
| Relatórios | totais e filtros corretos | intervalo/filtro inválido | consulta excede limite | processamento assíncrono retomado | duas gerações equivalentes | agregação nunca cruza tenants | unitário, integração, E2E seletivo |

## Execução no pipeline

Ordem recomendada: lint e format check; typecheck; unitários; integração; API e
contrato; componente/página/acessibilidade; E2E; build e gates finais. Etapas
independentes podem ser paralelizadas, mas os resultados são todos obrigatórios para
promoção.

Para o MVP local, a prioridade aprovada é: unitários, integração, API contract,
tenant isolation e E2E dos fluxos principais. A estratégia completa permanece como
destino obrigatório à medida que os módulos entrarem no escopo.

Pull requests executam o conjunto afetado e os gates obrigatórios. A branch de integração e candidatos a release executam a suíte completa. Testes noturnos podem ampliar navegadores, volume, concorrência e verificações não bloqueantes, sem substituir a suíte do pull request.

## Critérios de qualidade

- Cobertura é observada por arquivo e risco; um número global não substitui cenários. Limiares serão definidos após a primeira baseline aprovada.
- Código novo ou alterado não pode reduzir cobertura crítica nem deixar branch de regra de negócio sem justificativa.
- Zero falha nos gates obrigatórios e zero vulnerabilidade crítica aceita silenciosamente.
- Teste flakey é registrado com responsável, evidência e prazo; sua remoção do gate requer aprovação do QA Agent e do responsável técnico.
- Snapshots extensos, sleeps arbitrários, dependência de ordem e asserções apenas de status são sinais de teste frágil.
- Nenhum endpoint sensível implementado é aceito sem teste positivo, teste negativo,
  autorização/RBAC e isolamento de tenant quando aplicável.

## Testes não funcionais

Desempenho, capacidade, resiliência e recuperação terão planos vinculados aos SLOs e às ameaças. Antes de produção, deve haver baseline de latência e throughput para autenticação, cardápio, pedido, fechamento, filas e integrações; teste de restauração; comportamento sob perda de Redis/provider; e verificação de rate limiting. Resultados usam dados sintéticos e ambientes autorizados.

## Responsabilidades

- **QA Agent:** estratégia, cobertura de risco, matriz, evidências, flakiness e parecer de qualidade.
- **Backend/Frontend/Integration Agents:** implementação futura dos testes de sua camada e correção de defeitos.
- **Database Agent:** fixtures, Testcontainers, migrações e integridade de dados.
- **Security Agent:** cenários abusivos, autorização, dependency audit, SAST e interpretação de achados.
- **DevOps Agent:** runners, paralelismo, artifacts e gates do pipeline.
- **Code Review Agent:** rastreabilidade e suficiência dos testes na revisão.

## Saída do Testing Loop

O loop produz relatório de execução, evidências relevantes, defeitos com severidade, riscos residuais, flakiness conhecida e parecer de aprovação ou rejeição. A aprovação não apaga risco residual: ele permanece registrado com proprietário e decisão explícita.
