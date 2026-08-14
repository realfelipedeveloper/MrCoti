# Especificação da feature: MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Branch:** `002-mvp-local-first-slice`  
**Criada em:** 2026-06-26  
**Atualizada em:** 2026-07-11  
**Estado:** Aprovada com condições; T001–T003 concluídas; implementação autorizada em
ordem a partir de T004  
**Entrada:** continuidade autorizada pela fundação `001-saas-platform-foundation`

## Resumo executivo

Esta feature define a primeira fatia implementável local do Mr Coti: um fluxo
vertical demonstrável que prova autenticação, tenant, unidade, catálogo, mesa,
comanda, pedido, fechamento e pagamento fake em ambiente local com dados sintéticos.

A intenção não é entregar um SaaS comercial nem produção. O objetivo é criar a menor
versão tecnicamente séria do MVP, preservando monólito modular, tenant isolation,
RBAC, contratos API-first, auditoria, idempotência, outbox e testes desde o começo.
O alvo ativo desta fase é somente ambiente de desenvolvimento local. Docker local
via Docker Desktop/local Docker é o runtime previsto após aprovação da spec, e AWS
readiness continua como diretriz arquitetural. `local-prod`, produção, deploy real e
AWS real ficam fora do escopo ativo.

Esta spec não autoriza código automaticamente. Ela deve ser aprovada antes de criar
aplicações NestJS/Next.js, instalar dependências, gerar lockfiles, criar migrations,
subir Docker Compose executável ou implementar rotas.

## Histórias de usuário e validação

### História US-01 — Entrar no ambiente local com tenant sintético (Prioridade: P1)

**Como** avaliador do portfólio, **quero** autenticar em um tenant sintético local,
**para** demonstrar a base SaaS sem usar dados reais.

**Validação independente:** iniciar o ambiente local futuro, autenticar com um usuário
sintético, obter o tenant/unidade corrente e confirmar que todo retorno contém apenas
dados daquele tenant.

**Cenários de aceite:**

1. **Dado** um tenant sintético provisionado, **quando** o usuário autorizado fizer
   login, **então** receberá sessão/token local, tenant ativo, unidade permitida e
   papéis/permissions mínimos.
2. **Dado** um usuário sem membership no tenant, **quando** tentar acessar qualquer
   recurso tenant-aware, **então** receberá negação segura sem revelar existência de
   recurso.
3. **Dado** token ausente, expirado ou malformado, **quando** uma rota protegida for
   chamada, **então** a API negará a operação, registrará telemetria segura e não
   retornará dados parciais.

### História US-02 — Montar catálogo mínimo da unidade (Prioridade: P1)

**Como** gestor de unidade, **quero** cadastrar categorias e produtos simples,
**para** operar pedidos com preço e disponibilidade controlados por tenant.

**Validação independente:** criar categoria e produto, listar catálogo da unidade e
confirmar que outro tenant não consegue ver, alterar ou usar esses itens.

**Cenários de aceite:**

1. **Dado** uma unidade ativa, **quando** o gestor criar categoria e produto com preço
   em centavos, **então** o item ficará disponível somente no tenant/unidade corretos.
2. **Dado** um produto indisponível, **quando** o atendente tentar incluí-lo em uma
   comanda, **então** a operação será negada com erro de domínio seguro.
3. **Dado** alteração posterior de nome ou preço, **quando** uma venda passada for
   consultada, **então** o pedido manterá snapshot histórico do item.

### História US-03 — Abrir mesa/comanda e registrar pedido (Prioridade: P1)

**Como** atendente autorizado, **quero** abrir uma comanda e adicionar itens,
**para** demonstrar o fluxo operacional principal do restaurante.

**Validação independente:** abrir uma mesa, criar comanda, adicionar itens e observar
estados, totais parciais, snapshots, auditoria e eventos sem cruzar tenants.

**Cenários de aceite:**

1. **Dado** uma mesa livre, **quando** o atendente abrir uma comanda, **então** a mesa
   ficará ocupada e a comanda ficará aberta no mesmo tenant/unidade.
2. **Dado** uma comanda aberta, **quando** itens válidos forem adicionados, **então**
   quantidade, preço, autoria, data e snapshot do produto serão preservados.
3. **Dado** uma comanda fechada ou cancelada, **quando** houver tentativa de adicionar
   item, **então** a operação será negada e auditada.

### História US-04 — Fechar conta com pagamento fake (Prioridade: P1)

**Como** caixa autorizado, **quero** fechar a conta usando pagamento fake,
**para** demonstrar conciliação financeira sem processar pagamento real.

**Validação independente:** fechar uma comanda com itens, desconto/taxa simples e
pagamento fake, confirmando total em centavos, idempotência e estado final.

**Cenários de aceite:**

1. **Dado** uma comanda aberta com itens, **quando** o caixa solicitar fechamento,
   **então** o Mr Coti calculará subtotal, desconto, taxa, total e saldo em centavos.
2. **Dado** pagamento fake aprovado, **quando** o total for quitado, **então** a conta
   ficará fechada, a mesa será liberada e eventos/auditoria serão registrados.
3. **Dado** mesma chave de idempotência e mesmo payload, **quando** o fechamento for
   reenviado, **então** o resultado anterior será retornado sem duplicar pagamento.
4. **Dado** mesma chave de idempotência e payload divergente, **quando** o fechamento
   for reenviado, **então** a API responderá conflito e não alterará o estado.

### História US-05 — Demonstrar qualidade, segurança e operação local (Prioridade: P1)

**Como** responsável técnico, **quero** que a primeira fatia já tenha testes, logs,
auditoria e preflight local, **para** evitar dívida estrutural desde o primeiro código.

**Validação independente:** executar os gates futuros de lint/tipos/testes/contrato,
rodar cenários negativos de tenant/RBAC/idempotência e verificar ausência de segredo
ou dado pessoal real em logs/fixtures.

**Cenários de aceite:**

1. **Dado** a suite futura, **quando** os testes forem executados, **então** haverá
   cobertura unitária, integração, contrato API e E2E mínimo da jornada principal.
2. **Dado** tentativa de IDOR/cross-tenant, **quando** APIs forem chamadas com IDs de
   outro tenant, **então** nenhuma resposta revelará existência ou conteúdo alheio.
3. **Dado** ambiente local, **quando** a stack futura for preparada, **então** portas
   configuráveis não colidirão com `refresh`/`taskflow` observados na fundação.

## Casos de borda

- Token válido de usuário sem unidade ativa DEVE negar rotas operacionais.
- Usuário com RBAC de leitura NÃO DEVE criar, fechar ou cancelar comandas.
- Duas requisições simultâneas para fechar a mesma comanda DEVEM produzir um único
  fechamento efetivo.
- Alteração de produto durante uma comanda aberta NÃO DEVE alterar item já lançado.
- Valores monetários DEVEM ser inteiros em centavos; ponto flutuante é proibido para
  cálculo financeiro.
- Comanda sem item NÃO DEVE ser fechada como venda concluída.
- Falha do pagamento fake DEVE manter a conta consultável e sem pagamento duplicado.
- Logs, fixtures e seeds DEVEM usar dados sintéticos, sem pessoa real, segredo real ou
  credencial versionada.

## Requisitos

### Requisitos funcionais

- **RF-001:** O Mr Coti DEVE permitir autenticação local de usuário sintético com
  sessão/token de curta duração e contexto de tenant/unidade.
- **RF-002:** O Mr Coti DEVE provisionar ou semear ao menos um tenant sintético, uma
  empresa, uma unidade e usuários de demonstração sem dados pessoais reais.
- **RF-003:** O Mr Coti DEVE aplicar tenant context confiável em todas as rotas
  tenant-aware, ignorando `tenant_id` vindo do payload como autoridade.
- **RF-004:** O Mr Coti DEVE implementar RBAC mínimo para `Tenant Owner`, `Unit
  Manager`, `Waiter`, `Cashier` e `Auditor`, com deny-by-default.
- **RF-005:** O Mr Coti DEVE permitir criar, listar, atualizar e desativar categorias
  e produtos no escopo de uma unidade.
- **RF-006:** O Mr Coti DEVE armazenar preços monetários em centavos inteiros e
  validar moeda/limites antes de persistir.
- **RF-007:** O Mr Coti DEVE permitir criar e listar mesas por unidade, com estados
  `AVAILABLE`, `OCCUPIED` e `BLOCKED`.
- **RF-008:** O Mr Coti DEVE permitir abrir uma comanda vinculada a mesa, tenant,
  unidade e ator autorizado.
- **RF-009:** O Mr Coti DEVE permitir adicionar, alterar quantidade e cancelar itens
  de comanda aberta, preservando snapshot do produto e motivo quando aplicável.
- **RF-010:** O Mr Coti DEVE calcular subtotal, desconto, taxa simples, total, pago e
  saldo em centavos, com invariantes verificáveis.
- **RF-011:** O Mr Coti DEVE permitir fechar a conta com pagamento fake e estado final
  consultável, sem gateway financeiro real.
- **RF-012:** O Mr Coti DEVE aplicar idempotência em comandos mutáveis críticos,
  incluindo abertura de comanda, inclusão de item e fechamento.
- **RF-013:** O Mr Coti DEVE registrar auditoria para login, mudança de catálogo,
  abertura/fechamento/cancelamento de comanda e pagamento fake.
- **RF-014:** O Mr Coti DEVE persistir eventos de domínio/outbox para os fatos
  `TabOpened`, `OrderItemAdded`, `BillClosed` e `FakePaymentRecorded`.
- **RF-015:** O Mr Coti DEVE fornecer interface web local para login, seleção de
  unidade, catálogo, mesas, comanda e fechamento.
- **RF-016:** O Mr Coti DEVE retornar erros padronizados, seguros e correlacionáveis
  em todas as APIs desta fatia.

### Requisitos não funcionais

- **RNF-001:** A implementação futura DEVE seguir monólito modular em monorepo com
  backend NestJS, frontend Next.js, TypeScript, Prisma, MySQL 8+, Redis/BullMQ quando
  fila/cache forem usados.
- **RNF-002:** A stack dev/local futura DEVE rodar com Docker Desktop/local Docker e
  portas configuráveis sugeridas: web `3400`, API `3200`, Swagger `/docs` ou `3201`,
  MySQL `3308`, Redis `6380`.
- **RNF-003:** Mutations críticas DEVEM ser transacionais, persistindo aggregate,
  auditoria e outbox quando aplicável.
- **RNF-004:** APIs próprias desta fatia DEVEM mirar p95 ≤ 500 ms em ambiente local
  demonstrável com dados sintéticos modestos, sem promessa contratual.
- **RNF-005:** Testes futuros DEVEM incluir unitários, integração com banco/cache,
  contrato OpenAPI, isolamento tenant, RBAC negativo e E2E da jornada principal.
- **RNF-006:** A API DEVE propagar `X-Request-Id` e `X-Correlation-Id`; quando ausente,
  o backend deve gerar identificadores seguros.
- **RNF-007:** O frontend DEVE expor estados loading, empty, error e denied para as
  telas da jornada local.
- **RNF-008:** Nenhuma dependência, tecnologia relevante ou provider real fora da
  fundação aprovada PODE ser adotado sem ADR.
- **RNF-009:** Configuração local DEVE vir de ambiente ou arquivos exemplo sem
  segredo real; valores sensíveis não podem ser versionados.
- **RNF-010:** A feature DEVE manter compatibilidade com evolução SaaS comercial sem
  exigir reescrita estrutural, sem implementar ambiente produtivo nesta fase.

### Requisitos de segurança e dados

- **RSD-001:** Toda rota protegida DEVE exigir autenticação e autorização server-side;
  bloqueio apenas no frontend é proibido.
- **RSD-002:** Testes negativos DEVEM comprovar zero acesso cross-tenant para IDs,
  listas, filtros, cache, eventos e auditoria desta fatia.
- **RSD-003:** Seeds, fixtures e demonstrações DEVEM usar somente dados sintéticos e
  não podem representar pessoa real identificável.
- **RSD-004:** Logs, métricas e traces NÃO DEVEM conter senha, token, payload sensível,
  documento pessoal, e-mail real ou telefone real.
- **RSD-005:** Senhas de usuários sintéticos DEVEM ser armazenadas com hash forte; a
  senha em claro só pode existir em documentação local de demonstração não secreta.
- **RSD-006:** Erros de autenticação, autorização e IDOR NÃO DEVEM revelar se recurso
  de outro tenant existe.
- **RSD-007:** Auditoria DEVE registrar ator, tenant, unidade, ação, recurso, motivo
  quando aplicável, estado anterior/posterior mínimo e correlação.
- **RSD-008:** Rate limiting ou proteção equivalente DEVE existir para login e rotas
  mutáveis críticas quando a API for implementada.
- **RSD-009:** O pagamento fake DEVE ser inequivocamente marcado como simulação e não
  pode coletar dados de cartão, PIX real ou credencial financeira.
- **RSD-010:** O escopo ativo DEVE permanecer restrito a ambiente dev/local com dados
  sintéticos. `local-prod`, produção, domínio público e tratamento real de dados
  pessoais continuam fora desta feature; CHK048 permanece `PENDING LEGAL REVIEW`
  apenas como gatilho futuro se esse escopo for reaberto.

### Entidades e conceitos

- **Identity/User:** identidade de login sintética; não é tenant por si só.
- **Tenant:** fronteira SaaS de isolamento; owner do escopo de dados operacionais.
- **Company/Unit:** empresa e unidade operacional dentro do tenant.
- **Membership/RoleAssignment:** vínculo de usuário a tenant/unidade e permissões.
- **Category/Product:** catálogo da unidade, com preço em centavos e disponibilidade.
- **RestaurantTable:** mesa operacional da unidade.
- **Tab/Comanda:** agregado de atendimento aberto, fechado ou cancelado.
- **OrderItem:** item lançado com snapshot de produto/preço e autoria.
- **Bill:** resumo financeiro conciliável da comanda.
- **FakePayment:** registro simulado de pagamento, sem validade financeira real.
- **IdempotencyRecord:** chave, hash de payload, resultado e status por tenant/rota.
- **AuditEntry:** registro append-only de ação crítica.
- **OutboxEvent:** fato de domínio persistido para publicação futura idempotente.

## Critérios de sucesso

- **CS-001:** Uma pessoa avaliadora consegue autenticar, selecionar unidade, criar
  catálogo, abrir comanda, adicionar item, fechar conta e ver pagamento fake em
  ambiente local.
- **CS-002:** 100% das rotas tenant-aware desta fatia possuem teste positivo,
  autorização insuficiente e tentativa cross-tenant.
- **CS-003:** Comandos de fechamento repetidos com a mesma idempotency key e payload
  produzem um único efeito; payload divergente retorna conflito.
- **CS-004:** Todos os cálculos monetários da jornada principal conciliam em centavos
  inteiros em testes unitários e de integração.
- **CS-005:** OpenAPI da fatia valida estruturalmente e cobre auth, catálogo, mesas,
  comandas, itens, fechamento, erros e headers de correlação/idempotência.
- **CS-006:** Nenhum log, fixture, seed ou exemplo contém segredo real ou dado pessoal
  real.
- **CS-007:** O preflight local confirma ausência de colisão com portas observadas de
  `refresh` e `taskflow` antes de subir a stack futura do Mr Coti.
- **CS-008:** Lint, format, typecheck, testes unitários, integração, contrato e E2E
  passam antes de considerar a fatia demonstrável.

## Premissas e dependências

- A fundação `001-saas-platform-foundation` é a fonte de decisões arquiteturais,
  segurança, billing, entitlements, RBAC, portas e governança.
- CHK048 permanece aberto como `PENDING LEGAL REVIEW` apenas para eventual produção
  ou tratamento real de dados pessoais; não é pendência a resolver nesta fatia
  dev/local com dados sintéticos.
- As portas locais sugeridas partem do snapshot com `refresh` e `taskflow` ativos em
  2026-06-26; o preflight deve ser repetido antes da implementação.
- Pagamento fake nesta fatia é adapter local/simulado, não API financeira real.
- Nota fake, e-mail fake e notificações ficam para incremento posterior, salvo se a
  aprovação desta spec ampliar explicitamente o escopo.

## Fora de escopo

- Ambientes `local-prod`, staging/homologação, produção comercial, deploy real, AWS
  real provisionada ou domínio público.
- Billing real, cobrança, cartão, PIX real, conciliação bancária ou fiscalidade real.
- Tratamento de dados pessoais reais, clientes reais ou usuários reais.
- Nota fiscal fake, e-mail fake, SMS/WhatsApp fake e webhooks externos nesta primeira
  fatia local.
- Estoque, compras, caixa avançado, relatórios, reservas, CRM, fidelidade, BI, IA,
  marketplace e SDK.
- Microsserviços, multi-região, Kubernetes/EKS e extração de módulo.
- Implementação sem aprovação explícita desta spec e checklist.

## Rastreabilidade

| História | Requisitos | Critérios de sucesso | Evidência planejada |
|---|---|---|---|
| US-01 | RF-001–004, RNF-006, RSD-001–006 | CS-001, CS-002, CS-006 | testes auth/RBAC/tenant, E2E login |
| US-02 | RF-005–006, RF-012–013, RNF-003, RSD-001–004 | CS-002, CS-004, CS-005 | testes catálogo, contrato API |
| US-03 | RF-007–010, RF-012–014, RNF-003, RSD-001–007 | CS-001–004 | testes domínio/operação, E2E comanda |
| US-04 | RF-010–014, RF-016, RNF-003, RNF-006, RSD-007–009 | CS-001, CS-003–005 | testes fechamento/idempotência/fake payment |
| US-05 | RNF-001–010, RSD-001–010 | CS-002, CS-005–008 | pipeline, testes, preflight e revisão de segurança |
