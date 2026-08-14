# Especificação da feature: Fundação da plataforma SaaS

**Produto:** Mr Coti  
**Branch:** `001-saas-platform-foundation`  
**Criada em:** 2026-06-23  
**Estado:** Especificada; implementação bloqueada pelos gates da primeira etapa  
**Entrada:** SDD do Mr Coti

## Resumo executivo

Esta especificação estabelece a fundação de produto e os requisitos de longo prazo
do Mr Coti, uma plataforma SaaS para bares, restaurantes, lanchonetes, cafeterias,
food trucks, dark kitchens, franquias e operações similares. A plataforma deve
atender múltiplos tenants, empresas, unidades, usuários e planos comerciais, com
isolamento de dados, feature flags, auditoria e evolução controlada.

O Mr Coti é inicialmente um projeto de portfólio executado em ambiente local
individual, mas sua arquitetura deve ser desenhada para evolução futura como SaaS
comercial escalável, sem reescrita estrutural. A diretriz aprovada é projetar para
escalar e implementar inicialmente com simplicidade local.

A primeira etapa entrega somente especificações, arquitetura, contratos, decisões,
modelos, estratégias e gates. Os cenários abaixo são critérios para o desenho e para
a futura validação do produto; não autorizam código de aplicação. A implementação só
pode começar quando os artefatos obrigatórios estiverem completos, consistentes e
aprovados.

## Atores e partes interessadas

- **Responsável da plataforma:** administra tenants, planos, limites, flags e ciclo
  de vida SaaS sem acessar dados operacionais além do estritamente autorizado.
- **Proprietário do tenant:** configura empresa, unidades, usuários e módulos do seu
  contrato.
- **Gestor de unidade:** administra cardápio, estoque, caixa, equipe e relatórios no
  limite de sua unidade e permissões.
- **Atendente/caixa:** opera mesas, comandas, pedidos e fechamento de conta.
- **Cliente do estabelecimento:** consome atendimento, reserva e benefícios futuros;
  seus dados pessoais estão sujeitos a consentimento e LGPD.
- **Integrador externo:** utiliza as APIs públicas fictícias e recebe webhooks.
- **Produto, engenharia, segurança, dados e operações:** aprovam requisitos,
  decisões, riscos, qualidade e prontidão operacional.

## Histórias de usuário e validação

### História US-01 — Aprovar uma fundação sem ambiguidades (Prioridade: P1)

**Como** responsável por produto e arquitetura, **quero** uma fonte da verdade
rastreável e submetida a gates, **para** iniciar o Mr Coti sem decisões críticas
implícitas ou implementação prematura.

**Validação independente:** revisar o pacote da feature e demonstrar que todo
requisito possui origem, prioridade, tarefa documental, evidência planejada e gate,
sem código de aplicação no repositório.

**Cenários de aceite:**

1. **Dado** o pacote documental da primeira etapa, **quando** os revisores aplicarem
   o checklist, **então** constituição, spec, plan, tasks, pesquisa, modelo de dados,
   contratos, quickstart, UML, ADRs, loops e estratégias obrigatórias estarão
   presentes e coerentes.
2. **Dada** uma contradição ou decisão de alto impacto sem ADR, **quando** o gate de
   consistência for executado, **então** a etapa será rejeitada e a implementação
   permanecerá bloqueada.
3. **Dada** uma tecnologia não prevista, **quando** ela for proposta, **então** sua
   adoção dependerá de ADR aprovado antes de alterar plano ou tarefas.

### História US-02 — Operar o ciclo de vida de um tenant com isolamento (Prioridade: P1)

**Como** responsável da plataforma, **quero** provisionar, ativar, suspender,
cancelar e alterar o plano de um tenant, **para** operar o Mr Coti como SaaS com
limites e isolamento verificáveis.

**Validação independente:** percorrer no modelo os estados do tenant e da assinatura,
confirmando escopo de empresa/unidade, permissões, flags, limites e auditoria em cada
transição.

**Cenários de aceite:**

1. **Dado** um tenant recém-contratado, **quando** o provisionamento for concluído,
   **então** organização, assinatura, plano, primeira unidade e administrador estarão
   vinculados ao mesmo contexto de tenant e a operação ficará auditada.
2. **Dados** dois tenants com identificadores internos semelhantes, **quando** um
   usuário consultar um recurso, **então** somente recursos do tenant e das unidades
   permitidas poderão ser retornados.
3. **Dado** um tenant suspenso ou cancelado, **quando** houver tentativa de operação,
   **então** comandos de negócio serão negados, preservando apenas acessos
   administrativos explicitamente previstos e auditados.
4. **Dado** um downgrade com consumo acima do novo limite, **quando** a troca for
   solicitada, **então** nenhuma informação será apagada silenciosamente e a política
   de bloqueio ou período de adequação será apresentada.

### História US-03 — Executar a operação essencial de restaurante (Prioridade: P1)

**Como** atendente ou caixa autorizado, **quero** abrir mesas/comandas, registrar
pedidos e fechar a conta, **para** realizar o fluxo principal da operação com
rastreabilidade financeira e operacional.

**Validação independente:** simular conceitualmente uma comanda desde a abertura até
o fechamento com produto disponível, divisão de conta, taxa de serviço, pagamento
fictício e emissão fictícia de nota.

**Cenários de aceite:**

1. **Dada** uma mesa disponível e um cardápio vigente, **quando** o atendente abrir a
   comanda e adicionar itens, **então** preços, adicionais, quantidades, autoria e
   momento da inclusão serão preservados como snapshot.
2. **Dada** uma conta com múltiplos itens e taxa de serviço, **quando** o caixa dividir
   e fechar a conta, **então** o total pago será exatamente conciliável com itens,
   descontos, taxa, arredondamentos e formas de pagamento.
3. **Dada** uma comanda fechada, **quando** um usuário sem permissão tentar reabri-la
   ou cancelar item, **então** a ação será negada; com permissão, exigirá motivo e
   gerará auditoria.

### História US-04 — Integrar por APIs fictícias e resilientes (Prioridade: P1)

**Como** integrador externo, **quero** contratos estáveis para pagamentos, notas e
notificações fictícias, **para** desenvolver e testar integrações sem processar
transações financeiras ou fiscais reais.

**Validação independente:** validar o contrato OpenAPI das três APIs e percorrer exemplos de
sucesso, falha, timeout, fraude/chargeback, rejeição, indisponibilidade, retry,
duplicidade e webhook.

**Cenários de aceite:**

1. **Dadas** duas requisições de criação com a mesma chave de idempotência e mesmo
   payload, **quando** forem aceitas no mesmo tenant, **então** representarão uma
   única operação e devolverão resultado compatível; payload divergente será
   rejeitado.
2. **Dado** um cenário de timeout ou indisponibilidade simulada, **quando** a operação
   for processada, **então** seu estado permanecerá consultável e retries não
   produzirão cobrança, nota ou mensagem duplicada.
3. **Dado** um webhook repetido ou fora de ordem, **quando** o consumidor o receber,
   **então** identificador, versão, assinatura simulada e estado permitirão consumo
   idempotente.
4. **Dado** um documento fiscal fictício, **quando** XML ou PDF for baixado, **então**
   o conteúdo será inequivocamente marcado como simulação sem validade fiscal.

### História US-05 — Controlar módulos por plano, tenant e ambiente (Prioridade: P2)

**Como** responsável por produto, **quero** configurar feature flags e limites sem
deploy, **para** realizar rollout, beta, desligamento emergencial e diferenciação de
planos de forma segura.

**Validação independente:** avaliar uma feature em combinações de ambiente, plano e
tenant e verificar precedência, fallback, auditoria e bloqueio consistente no backend
e frontend.

**Cenários de aceite:**

1. **Dada** uma feature desabilitada globalmente no ambiente, **quando** um tenant
   tentar usá-la, **então** a negação global prevalecerá sobre habilitações mais
   específicas.
2. **Dada** uma feature incluída no plano e liberada para beta somente a um tenant,
   **quando** usuários desse tenant e de outro consultarem a capacidade, **então**
   somente o tenant elegível a receberá.
3. **Dada** indisponibilidade do mecanismo de avaliação, **quando** uma feature
   sensível for consultada, **então** será aplicado fallback seguro e o incidente será
   observável.

### História US-06 — Operar com segurança, escala e recuperabilidade (Prioridade: P2)

**Como** responsável por operações e segurança, **quero** isolamento, telemetria,
filas resilientes, backup e controles automatizados, **para** sustentar milhares de
clientes sem perder dados ou capacidade de diagnóstico.

**Validação independente:** revisar cenários de ameaça, capacidade, falha de
dependência, restauração e correlação de uma requisição síncrona com seus eventos e
jobs, sem exposição de dados sensíveis.

**Cenários de aceite:**

1. **Dada** uma operação crítica, **quando** ela atravessar API, domínio, outbox e
   fila, **então** tenant, request-id e correlation-id serão propagados e a trilha
   poderá ser reconstruída.
2. **Dada** falha persistente de um provider, **quando** os retries se esgotarem,
   **então** a mensagem irá para tratamento de falha, gerará alerta e não bloqueará
   operações não relacionadas.
3. **Dado** um pedido de restauração, **quando** o procedimento for exercitado,
   **então** os objetivos de RPO e RTO serão mensurados e a integridade por tenant
   será verificada.

### História US-07 — Evoluir por roadmap sem reescrita estrutural (Prioridade: P3)

**Como** responsável por estratégia, **quero** limites de domínio e fases explícitas,
**para** adicionar estoque, reservas, CRM, BI, IA e marketplaces sem romper o core
SaaS nem antecipar microsserviços.

**Validação independente:** mapear cada módulo de V1 a V3 a bounded contexts,
eventos, flags e dependências, sem acesso direto a dados internos de outro contexto.

**Cenários de aceite:**

1. **Dada** uma capacidade futura, **quando** ela entrar no roadmap, **então** terá
   fase, flag, ownership, contrato e impacto de tenancy definidos antes de tarefas de
   implementação.
2. **Dada** uma proposta de microsserviço, **quando** não houver evidência de escala
   ou autonomia que justifique extração, **então** a proposta será rejeitada em favor
   do monólito modular.

### História US-08 — Fechar lacunas de governança SaaS (Prioridade: P1)

**Como** responsável pela fundação do produto, **quero** políticas verificáveis de
billing, entitlements, eventos, ownership, recuperação, custo, acesso, dados e SLO,
**para** que a próxima fase não dependa de decisões implícitas.

**Validação independente:** localizar os artefatos `docs/12` a `docs/19`, os ADRs
0009–0016 e rastrear cada baseline à decisão, owner, gate e pendência humana.

**Cenários de aceite:**

1. **Dado** um upgrade, downgrade ou limite excedido, **quando** a decisão comercial
   for avaliada, **então** vigência, entitlement, flag, RBAC, dados existentes e
   pendência de Produto estarão explícitos sem cobrança real.
2. **Dado** um evento cross-context, **quando** ele for publicado/consumido, **então**
   terá owner, payload mínimo, versão, idempotência, criticidade, outbox e dados
   proibidos documentados.
3. **Dada** uma falha ou crescimento de carga/custo, **quando** Arquitetura e Operações
   revisarem a fundação, **então** DR, RPO/RTO, SLO, load profile e FinOps fornecerão
   baselines mensuráveis e aprovações pendentes.
4. **Dada** uma operação crítica ou categoria de dado, **quando** o gate for aplicado,
   **então** matriz RBAC, finalidade/base, retenção, anonimização e approval record
   indicarão a decisão e o impacto enquanto não aprovada.

## Casos de borda

- Convites expirados, e-mail já associado a outro tenant e usuário participante de
  mais de um tenant devem ter comportamento explícito e sem vazamento de existência.
- IDs válidos de outro tenant, filtros sem `tenant_id`, chaves de cache colidentes e
  jobs sem contexto devem falhar de forma segura e gerar sinal de segurança.
- Mudança de plano concorrente com criação de recurso deve respeitar uma única versão
  do limite e nunca ultrapassá-lo silenciosamente.
- Flag alterada enquanto job está em fila deve obedecer política documentada: decisão
  registrada na criação ou reavaliação segura na execução.
- Fechamento com divisão não exata, centavos residuais, taxa de serviço parcial,
  múltiplas formas de pagamento ou estorno parcial deve manter soma invariável.
- Produto indisponível após inclusão no pedido não deve apagar o snapshot do item;
  cancelamento exige regra e auditoria.
- Baixa automática de estoque concorrente, estoque negativo permitido por política e
  ficha técnica alterada após venda devem preservar histórico.
- Webhooks duplicados, atrasados, fora de ordem ou com assinatura inválida não podem
  regredir estado nem repetir efeito.
- Timeout após processamento remoto deve resultar em estado indeterminado consultável,
  nunca em retry cego de operação não idempotente.
- Suspensão durante sessão ativa deve invalidar novas operações e tratar jobs em
  andamento conforme política auditável.
- Exclusão/anonimização LGPD deve conciliar direitos do titular com retenções legais e
  auditoria, usando pseudonimização quando a remoção integral for impedida.
- Relatórios extensos devem ser assíncronos e não degradar o caminho transacional.
- Horários de venda, reservas e relatórios devem considerar fuso da unidade e horário
  de verão sem alterar instantes históricos.
- Falha de Redis não pode comprometer a fonte persistente; degradação de cache e filas
  deve ser explícita e observável.
- Portas locais devem ser configuráveis e não podem colidir com os serviços `refresh`
  e `tasks` existentes.
- Tenant em trial/downgrade/suspensão não pode perder dados nem obter direito por flag
  técnica; mudanças concorrentes usam versão e idempotência.
- Restore não pode reativar sessões revogadas, pedidos de anonimização já concluídos,
  eventos duplicados ou jobs sem revalidação.
- Custo/telemetria por tenant não pode expor PII nem criar cardinalidade sem limite.

## Requisitos

### Requisitos funcionais — Core SaaS

- **RF-001:** O Mr Coti DEVE representar tenant como raiz de isolamento e associar a
  ele empresas, unidades, usuários, assinatura, limites, flags e dados de domínio.
- **RF-002:** O Mr Coti DEVE suportar um tenant com múltiplas empresas e cada empresa
  com múltiplas unidades, preservando autorização por escopo.
- **RF-003:** O Mr Coti DEVE suportar provisionamento, ativação, suspensão,
  reativação e cancelamento de tenants por máquina de estados auditável.
- **RF-004:** O Mr Coti DEVE suportar múltiplos planos, versões de plano, assinatura,
  período de vigência e preparação para billing futuro, sem processar billing real no
  MVP.
- **RF-005:** O Mr Coti DEVE aplicar limites de plano de forma atômica e informar
  consumo, limite, unidade e ação de adequação quando um limite for atingido.
- **RF-006:** O Mr Coti DEVE tratar upgrade e downgrade sem perda silenciosa de dados,
  com vigência e política de excedentes explícitas.
- **RF-007:** O Mr Coti DEVE permitir que uma identidade participe de tenants e
  unidades autorizados sem misturar papéis, sessões ou dados.
- **RF-008:** O Mr Coti DEVE implementar cargos, permissões e políticas RBAC com
  escopo de tenant e, quando aplicável, empresa/unidade.
- **RF-009:** O Mr Coti DEVE registrar autoria, tenant, alvo, ação, instante,
  resultado e correlação para toda operação crítica.
- **RF-010:** O Mr Coti DEVE manter logs de atividade consultáveis somente por perfis
  autorizados e segundo política de retenção.
- **RF-011:** O Mr Coti DEVE preparar catálogo de módulos premium, direitos do plano
  e consumo de limites para billing e marketplace futuros.

### Requisitos funcionais — Feature flags

- **RF-012:** O Mr Coti DEVE habilitar, desabilitar ou limitar cada funcionalidade
  relevante por ambiente, plano e tenant.
- **RF-013:** O Mr Coti DEVE aplicar precedência determinística: bloqueio emergencial
  do ambiente, regra do plano, override do tenant e fallback seguro documentado.
- **RF-014:** O Mr Coti DEVE auditar criação, alteração, avaliação administrativa e
  remoção de flags, incluindo responsável, motivo e vigência.
- **RF-015:** O Mr Coti DEVE associar cada flag a proprietário, data de revisão,
  estratégia de rollout, fallback e critério de remoção; flags não substituem RBAC.

### Requisitos funcionais — Operação e cardápio

- **RF-016:** O Mr Coti DEVE gerenciar mesas, estados de disponibilidade e vínculo
  com unidade.
- **RF-017:** O Mr Coti DEVE abrir, movimentar, reabrir e encerrar comandas, exigindo
  permissão e motivo para ações excepcionais.
- **RF-018:** O Mr Coti DEVE registrar pedidos e itens com snapshots de descrição,
  preço, adicionais, variações, quantidade, descontos e autoria.
- **RF-019:** O Mr Coti DEVE calcular fechamento, taxa de serviço, divisão de conta,
  descontos, arredondamentos e múltiplas formas de pagamento preservando conciliação
  exata.
- **RF-020:** O Mr Coti DEVE registrar cancelamentos e reaberturas sem apagar o
  histórico original.
- **RF-021:** O Mr Coti DEVE gerenciar categorias, produtos, adicionais, combos,
  variações, preços, imagens, disponibilidade e horários de venda por unidade.
- **RF-022:** O Mr Coti DEVE versionar efeitos de mudança de cardápio para que vendas
  históricas não sejam reinterpretadas.
- **RF-023:** O Mr Coti DEVE suportar ficha técnica por produto para futura baixa de
  estoque, preservando a versão aplicável à venda.

### Requisitos funcionais — Integrações públicas fictícias

- **RF-024:** A API fictícia de pagamentos do Mr Coti DEVE oferecer criação de
  cobrança, autorização, captura, cancelamento, estorno e consulta.
- **RF-025:** A API fictícia de pagamentos DEVE simular sucesso, falha, timeout,
  fraude e chargeback de forma determinística quando solicitado pelo ambiente de
  teste.
- **RF-026:** Operações mutáveis de pagamentos DEVEM aceitar chave de idempotência
  com escopo de tenant, operação e payload.
- **RF-027:** Transições de pagamento DEVEM seguir máquina de estados e impedir
  captura, cancelamento ou estorno incompatível com o estado corrente.
- **RF-028:** Eventos de pagamento DEVEM gerar webhooks versionados, identificáveis,
  repetíveis e consumíveis de forma idempotente.
- **RF-029:** A API fictícia de notas DEVE oferecer emissão, autorização, rejeição,
  cancelamento, consulta e downloads de XML/PDF falsos.
- **RF-030:** A API fictícia de notas DEVE simular autorização, rejeição e
  indisponibilidade sem sugerir validade fiscal real.
- **RF-031:** Transições de nota e seus webhooks DEVEM preservar idempotência,
  correlação, estado e motivo de rejeição/cancelamento.
- **RF-032:** A API de notificações DEVE oferecer envio, consulta de status e logs
  para e-mail, WhatsApp e SMS, conforme fase do roadmap.
- **RF-033:** Cada canal de notificação DEVE possuir contrato de provider abstrato,
  provider fake, templates, fila, retries limitados e trilha de entrega.
- **RF-034:** O Mr Coti DEVE impedir duplicidade lógica de notificação em retries e
  registrar tentativa, resultado e erro sanitizado por canal.
- **RF-035:** As APIs públicas DEVEM emitir webhooks com identificador do evento,
  versão, instante, tenant, correlação e mecanismo de verificação de autenticidade
  compatível com o ambiente fictício.
- **RF-036:** As demais capacidades ERP NÃO DEVEM ser expostas como APIs públicas
  nesta fase, embora APIs internas versionadas possam ser especificadas.

### Requisitos funcionais — Evolução por roadmap

- **RF-037:** O MVP DEVE abranger autenticação, tenants, usuários, permissões,
  unidades, produtos, categorias, mesas, comandas, pedidos, fechamento, pagamento
  fake, nota fake e e-mail fake.
- **RF-038:** A V1 DEVE planejar estoque, ingredientes/insumos, movimentações,
  fornecedores, compras, caixa, relatórios e SMS/WhatsApp fake.
- **RF-039:** A V2 DEVE planejar reservas, cadastro e histórico de clientes,
  preferências, consentimento LGPD, CRM, fidelidade, integrações e dashboard
  operacional.
- **RF-040:** Reservas DEVEM considerar criação, confirmação, cancelamento, no-show e
  vínculo com mesa/unidade.
- **RF-041:** Relatórios DEVEM contemplar vendas, ticket médio, produtos, categorias,
  estoque crítico e fluxo de caixa, com execução assíncrona quando pesada.
- **RF-042:** A V3 DEVE planejar BI, IA, marketplace de integrações e extensões, SDK,
  portal de desenvolvedores, multi-região e módulos premium por tenant.

### Requisitos funcionais — Fechamento da fundação SaaS

- **RF-043:** O Mr Coti DEVE modelar Billing como subdomínio futuro com plano/version,
  assinatura, trial, inadimplência, suspensão, reativação, cancelamento, mudanças,
  excedentes e histórico, sem cobrança real nesta fase.
- **RF-044:** Trials DEVEM possuir elegibilidade, vigência, entitlements, limites,
  conversão, expiração e extensão auditáveis.
- **RF-045:** Cada limite comercial DEVE definir medição, alerta, comportamento ao
  atingir/exceder, tolerância, override e impacto, sem apagar dados.
- **RF-046:** Upgrade e downgrade DEVEM definir vigência, impacto em entitlements,
  flags, usuários, unidades, integrações, armazenamento e dados já criados.
- **RF-047:** Entitlements DEVEM representar direito/limite comercial separado de
  feature flags técnicas e RBAC, obedecendo precedência determinística.
- **RF-048:** Eventos compartilhados DEVEM constar em catálogo com owner, produtor,
  consumidores, payload mínimo, versão, idempotência, criticidade, outbox e dados
  proibidos.
- **RF-049:** Todo bounded context DEVE possuir owner lógico, responsabilidades,
  entidades/dados próprios, eventos e dependências permitidas/proibidas.

### Requisitos não funcionais

- **RNF-001:** A arquitetura do Mr Coti DEVE ser monólito modular com DDD, Clean
  Architecture, abordagem hexagonal nas integrações, eventos de domínio e Outbox
  Pattern; microsserviços são proibidos nesta fase.
- **RNF-002:** O backend alvo DEVE usar NestJS, TypeScript, Prisma ORM, MySQL 8+,
  Redis e BullMQ; o frontend alvo DEVE usar Next.js App Router, TypeScript e Tailwind
  CSS.
- **RNF-003:** A solução DEVE ser executável em Node.js LTS e Docker Compose local e
  portável para os serviços AWS definidos na constituição, sem depender de disco
  local persistente ou estado de sessão em processo.
- **RNF-004:** O desenho DEVE suportar pelo menos 1.000 tenants, milhares de usuários
  concorrentes e crescimento para milhões de pedidos, logs e eventos sem reescrita
  dos limites de domínio; os números devem ser revalidados por teste de capacidade
  antes de produção.
- **RNF-005:** APIs transacionais próprias DEVEM adotar como objetivo inicial p95 de
  até 500 ms e p99 de até 1 s sob carga nominal acordada, excluindo atrasos de
  cenários externos intencionalmente simulados.
- **RNF-006:** Jobs assíncronos DEVEM declarar timeout, máximo de tentativas, backoff,
  idempotência, concorrência e destino de falha; nenhum retry pode ser infinito.
- **RNF-007:** Toda API pública DEVE possuir OpenAPI 3.x validável antes da
  implementação, versionamento explícito, autenticação, erros padronizados, exemplos,
  paginação, filtros e ordenação quando aplicáveis.
- **RNF-008:** Toda requisição DEVE receber ou gerar `request-id` e `correlation-id`;
  sua propagação deve alcançar eventos, outbox, filas e webhooks.
- **RNF-009:** O pipeline futuro DEVE bloquear merge em falhas de instalação, lint,
  formatação, tipos, testes unitários, integração, E2E, build, segurança, dependências,
  Docker, migração ou quality gate.
- **RNF-010:** A estratégia de testes DEVE cobrir unidade, integração, API, contrato,
  componente, página, acessibilidade e E2E, incluindo sucesso, falha, timeout, retry,
  duplicidade e isolamento de tenant.
- **RNF-011:** O Mr Coti DEVE expor healthcheck, readiness e liveness distintos e
  produzir logs estruturados, métricas e traces sem dados sensíveis.
- **RNF-012:** O baseline de continuidade DEVE buscar RPO de até 24 horas e RTO de
  até 4 horas, com restauração exercitada; metas menores exigidas por produção devem
  ser definidas por ADR/SLO antes do lançamento.
- **RNF-013:** Relatórios pesados, downloads e integrações demoradas DEVEM ser
  assíncronos, paginados ou transmitidos sem bloquear o caminho transacional.
- **RNF-014:** Configurações e portas DEVEM ser externas ao artefato; portas locais
  não podem colidir com os serviços `refresh` e `tasks` existentes.
- **RNF-015:** O Mr Coti DEVE possuir estratégia e runbook de Disaster Recovery com
  cenários, responsabilidades, restore testado e RPO/RTO por classe/fase.
- **RNF-016:** A arquitetura AWS futura DEVE possuir estratégia FinOps com tags,
  orçamento, alertas, custo por ambiente/módulo/tenant e métricas unitárias.
- **RNF-017:** SLOs e perfil de carga DEVEM separar baseline, MVP, produção e futuro,
  cobrindo disponibilidade, latência, throughput, jobs, webhooks, notificações,
  restore, tenants, unidades, usuários, pedidos e eventos.
- **RNF-018:** O inventário de portas DEVE registrar snapshot, sugestões configuráveis,
  processos/containers observados e, quando houver reservas não observáveis,
  `PENDING LOCAL VERIFICATION`, sem alterar `refresh`, `taskflow` ou `tasks`.
- **RNF-019:** Decisões humanas bloqueantes DEVEM possuir approval record com papel,
  artefato, estado, impacto, pessoa/data/evidência quando aprovadas.

### Requisitos de segurança, privacidade e dados

- **RSD-001:** Toda consulta e mutação tenant-aware DEVE aplicar o contexto de tenant
  no servidor; valores fornecidos pelo cliente nunca são autoridade suficiente.
- **RSD-002:** Testes negativos de isolamento DEVEM provar que IDs, buscas, exports,
  caches, filas e arquivos de um tenant não são acessíveis por outro.
- **RSD-003:** Nenhuma rota sensível PODE existir sem autenticação e autorização RBAC
  explícitas; tentativas negadas relevantes devem ser auditáveis.
- **RSD-004:** Entradas DEVEM ser validadas por allowlist/DTO, saídas sanitizadas e
  respostas não devem revelar secrets, stack traces ou existência de recurso de
  outro tenant.
- **RSD-005:** Autenticação DEVE prever hash forte de senha, rotação/revogação de
  sessão, proteção contra força bruta, rate limiting e recuperação segura.
- **RSD-006:** Secrets DEVEM vir de mecanismo externo seguro e nunca ser versionados,
  incluídos em imagens, logs, exemplos reais ou respostas.
- **RSD-007:** Dados em trânsito DEVEM usar TLS fora do ambiente local; criptografia
  em repouso e gestão de chaves devem ser previstas para dados e backups.
- **RSD-008:** O catálogo de dados DEVE classificar dados pessoais e sensíveis,
  finalidade, base legal, retenção, acesso, exportação e estratégia de anonimização.
- **RSD-009:** Consentimento LGPD DEVE ser versionado e registrar titular, finalidade,
  texto/versão, instante, origem e revogação sem apagar a trilha necessária.
- **RSD-010:** Auditoria DEVE ser append-only no fluxo normal e guardar antes/depois
  apenas quando permitido, preferindo metadados e referências a dados sensíveis.
- **RSD-011:** Logs, métricas e traces NÃO DEVEM conter senhas, tokens, secrets,
  documentos completos, dados de pagamento ou corpo integral de mensagens pessoais.
- **RSD-012:** Backup, restauração, exportação e anonimização DEVEM preservar
  isolamento por tenant e possuir autorização, auditoria e procedimento testável.
- **RSD-013:** SAST, dependency scanning, auditoria de pacotes e varredura de imagem
  Docker DEVEM bloquear vulnerabilidades críticas sem exceção formal vigente.
- **RSD-014:** Webhooks DEVEM prever autenticação/verificação, proteção contra replay,
  idempotência e política de redelivery.
- **RSD-015:** Operações críticas do MVP DEVEM constar em matriz RBAC ator × comando ×
  recurso × escopo × condição × decisão, incluindo negações e requisito relacionado.
- **RSD-016:** Cada categoria de dado DEVE possuir finalidade, base legal sugerida,
  retenção, anonimização, exportação, exclusão, acesso e impacto em auditoria, com
  Legal Review explícito antes da produção.

## Entidades e conceitos centrais

- **Tenant:** raiz de isolamento, ciclo de vida e ownership SaaS.
- **Empresa:** pessoa/organização operadora pertencente a um tenant.
- **Unidade:** estabelecimento físico ou virtual, com fuso, configurações e escopo
  operacional próprios.
- **Identidade, vínculo e papel:** autenticação global separada do vínculo e das
  permissões dentro de cada tenant/unidade.
- **Plano, versão de plano e assinatura:** direitos, limites e vigência comercial.
- **Trial, mudança e excedente:** ciclo comercial temporário, alteração versionada e
  decisão rastreável ao ultrapassar limite.
- **Entitlement:** concessão/limite comercial efetivo, independente de rollout e RBAC.
- **Feature, regra e avaliação:** catálogo da capacidade, regras por ambiente/plano/
  tenant e decisão auditável.
- **Mesa, comanda, pedido e item:** aggregates do fluxo operacional; itens preservam
  snapshots de venda.
- **Categoria, produto, variação, adicional, combo e ficha técnica:** catálogo e
  composição comercial/operacional.
- **Cobrança e transação fictícia:** máquina de estados de pagamento simulado.
- **Nota fictícia:** máquina de estados de emissão simulada e artefatos sem validade.
- **Notificação, tentativa e template:** mensagem lógica, entregas por provider e
  conteúdo versionado.
- **Evento de domínio, outbox e webhook:** fato interno, publicação confiável e
  entrega externa.
- **Registro de auditoria:** trilha append-only de operações críticas.

O detalhamento, relações, invariantes e retenção estão em `data-model.md`.

## Critérios de sucesso

- **CS-001:** 100% dos artefatos obrigatórios da primeira etapa existem e nenhum
  arquivo de aplicação, dependência instalada, migration executada ou deploy real foi
  produzido.
- **CS-002:** 100% dos requisitos RF/RNF/RSD possuem ao menos uma história, tarefa
  documental ou matriz de verificação rastreável antes da aprovação final.
- **CS-003:** O checklist de requisitos encerra com zero item crítico pendente e zero
  contradição aberta entre constituição, spec, plano, dados, contratos, ADRs e
  estratégias.
- **CS-004:** O modelo de dados cobre 100% das entidades do Core SaaS e demonstra
  `tenant_id` ou justificativa explícita para cada entidade sem escopo de tenant.
- **CS-005:** A matriz RBAC e a análise de ameaças cobrem 100% das operações críticas
  do MVP, incluindo testes negativos de IDOR e acesso entre tenants.
- **CS-006:** O contrato público das três APIs valida como OpenAPI 3.x e contém exemplos
  de todos os cenários obrigatórios, erros, idempotência, correlação e webhooks.
- **CS-007:** Cada ADR inicial apresenta pelo menos duas alternativas, consequências
  e estado; decisões sem ADR bloqueiam o gate arquitetural.
- **CS-008:** Toda feature relevante do roadmap possui fase, bounded context,
  feature flag e dependências identificadas.
- **CS-009:** Antes de produção, testes de isolamento apresentam zero acesso cruzado
  em 100% dos casos e testes de capacidade demonstram as metas RNF-004/RNF-005.
- **CS-010:** Antes de produção, um exercício de restauração demonstra RPO ≤ 24 h e
  RTO ≤ 4 h, com validação de integridade e isolamento.
- **CS-011:** Antes de produção, 100% das operações críticas emitem auditoria e 100%
  dos fluxos amostrados propagam correlação sem dados proibidos na telemetria.
- **CS-012:** 100% dos artefatos obrigatórios em `docs/12`–`docs/20` e ADRs
  0009–0018 existem, estão indexados e possuem owner/estado.
- **CS-013:** O catálogo cobre todos os eventos mínimos do complemento e cada linha
  declara payload, versão, idempotência, criticidade, outbox e dados proibidos.
- **CS-014:** Billing, entitlements, flags, RBAC e ownership estão separados por
  responsabilidade e precedência sem decisão implícita.
- **CS-015:** DR, FinOps, SLO e perfil de carga possuem baselines mensuráveis,
  aprovados como objetivos demonstrativos quando aplicável.
- **CS-016:** RBAC e todas as categorias LGPD solicitadas possuem matriz/política
  verificável; Legal Review permanece gate antes de produção ou dados reais.
- **CS-017:** O inventário de portas registra snapshot local sem colisão observada nas
  sugestões e marca `refresh`/`tasks` como pendentes quando não executados.
- **CS-018:** Nenhum código, dependência, migration, deploy, commit ou push é produzido
  durante o fechamento das lacunas.

## Premissas e dependências

- Prisma ORM está aprovado e não será reavaliado nesta feature.
- A estratégia inicial de tenancy é banco único e `tenant_id`, sujeita ao ADR-0004.
- Billing comercial é domínio futuro sem provider real; fiscalidade, pagamentos e
  notificações externas permanecem fictícios ou futuros nesta etapa.
- A implantação inicial será Docker Compose local, mas decisões devem ser compatíveis
  com AWS.
- Identificação das portas ocupadas por `refresh` e `tasks` depende do ambiente local;
  nenhum número fixo deve ser assumido.
- As metas de desempenho e continuidade são baselines iniciais e devem ser validadas
  por testes e SLOs antes da produção.
- Contratos, UML, ADRs, loops e estratégias detalhadas são artefatos irmãos desta
  especificação e devem referenciar os IDs aqui definidos.

## Fora de escopo da primeira etapa

- Criar aplicações NestJS ou Next.js, pacotes, código executável ou scaffolding.
- Instalar dependências, executar migrations, criar schema físico ou dados seed.
- Configurar, provisionar ou publicar infraestrutura/deploy real.
- Implementar microsserviços ou integrar provedores financeiros, fiscais ou de
  comunicação reais.
- Processar billing, pagamento ou emissão fiscal reais.
- Fazer commit, push, release ou abertura de ambiente.
- Resolver detalhes de interface visual além dos princípios necessários à
  especificação e acessibilidade.
- Tratar a fase local de portfólio como promessa de produção comercial, SLO
  contratual, billing real, fiscalidade real ou processamento real de dados pessoais
  de clientes finais.

## Rastreabilidade

| História | Requisitos principais | Critérios | Evidência planejada |
|---|---|---|---|
| US-01 | RNF-001–014, RSD-013 | CS-001–003, CS-007 | Constituição, ADRs, checklists e gates |
| US-02 | RF-001–015, RSD-001–012 | CS-004–005, CS-009–011 | Modelo, ADR de tenancy, RBAC e threat model |
| US-03 | RF-016–023, RF-037, RSD-003–010 | CS-005, CS-008, CS-011 | Fluxos/UML, modelo e estratégia de testes |
| US-04 | RF-024–036, RNF-006–008, RSD-014 | CS-006, CS-011 | OpenAPI, exemplos e matriz de contrato |
| US-05 | RF-012–015, RF-037–042 | CS-008 | Modelo de flags, roadmap e casos de decisão |
| US-06 | RNF-003–014, RSD-001–014 | CS-005, CS-009–011 | Segurança, AWS, testes e observabilidade |
| US-07 | RF-038–042, RNF-001, RNF-004 | CS-007–009 | Roadmap, bounded contexts e ADRs |
| US-08 | RF-043–049, RNF-015–019, RSD-015–016 | CS-012–018 | docs/12–20, ADR-0009–0018, matrizes, cybersecurity e approval record |
