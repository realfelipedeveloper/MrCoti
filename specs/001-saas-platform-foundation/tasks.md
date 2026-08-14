# Tarefas — Fundação da plataforma SaaS

**Produto:** Mr Coti  
**Feature:** `001-saas-platform-foundation`  
**Escopo:** somente documentação, decisões e gates  
**Estado:** 92/92 concluídas; CHK048 permanece como gate específico futuro

## Convenções

- Formato: `TNNN [P?] [US-??] descrição — requisitos — caminho/evidência`.
- `[P]` indica tarefa paralelizável em arquivo distinto, desde que sua dependência
  esteja atendida.
- `[x]` significa que o artefato foi produzido; ainda pode depender dos gates finais.
- IDs `RF-###`, `RNF-###` e `RSD-###` são canônicos e não podem ser renumerados fora
  de `spec.md`.
- Nenhuma tarefa desta feature autoriza código, instalação, migration, container
  executável, deploy, commit ou push.

## Fase 0 — Fundação Spec Kit

**Objetivo:** estabelecer norma, modelos e fonte da verdade.  
**Gate de saída:** constituição e templates coerentes; spec sem lacuna crítica.

- [x] T001 Ratificar princípios, gates e governança do Mr Coti — RNF-001–014,
  RSD-001–014 — `.specify/memory/constitution.md`
- [x] T002 [P] Criar templates compatíveis de constituição, spec, plan, tasks e
  checklist — RNF-009 — `.specify/templates/`
- [x] T003 Consolidar histórias, requisitos canônicos, casos de borda, critérios e
  rastreabilidade — RF-001–042, RNF-001–014, RSD-001–014 —
  `specs/001-saas-platform-foundation/spec.md`
- [x] T004 Resolver alternativas de arquitetura, tenancy, flags, integração,
  segurança e operação — RF-001–015, RF-024–036, RNF-001–014, RSD-001–014 —
  `specs/001-saas-platform-foundation/research.md`

## Fase 1 — História US-01: fundação aprovável (P1)

**Objetivo:** transformar decisões em um pacote documental completo e navegável.  
**Validação independente:** executar o quickstart e localizar requisito, decisão,
tarefa e evidência sem depender de comunicação informal.

- [x] T005 [US-01] Documentar o plano e o Constitution Check — RNF-001–014,
  RSD-001–014 — `specs/001-saas-platform-foundation/plan.md`
- [x] T006 [P] [US-01] Documentar modelo conceitual, ownership, estados e invariantes
  — RF-001–042, RSD-001–012 —
  `specs/001-saas-platform-foundation/data-model.md`
- [x] T007 [P] [US-01] Criar roteiro somente leitura de revisão e aprovação —
  RNF-007–014, RSD-001–014 —
  `specs/001-saas-platform-foundation/quickstart.md`
- [x] T008 [US-01] Criar checklist de qualidade de requisitos e gates —
  RF-001–042, RNF-001–014, RSD-001–014 —
  `specs/001-saas-platform-foundation/checklists/requirements.md`
- [x] T009 [P] [US-01] Documentar visão, personas, escopo e métricas de produto —
  RF-037–042 — `docs/00-product/`
- [x] T010 [P] [US-01] Documentar regras, glossário e processos de negócio —
  RF-001–042 — `docs/01-business/`
- [x] T011 [P] [US-01] Documentar estrutura e índice de artefatos — RNF-001,
  RNF-007, RNF-009 — `README.md` e índices documentais
- [x] T012 [P] [US-01] Definir papéis dos agentes e limites de atuação — RNF-009,
  RSD-013 — `AGENTS.md` e `docs/10-agents/`
- [x] T013 [P] [US-01] Documentar Spec, Architecture, API Contract,
  Implementation, Testing, Security, Review, Release e Observability Loops com
  entrada, responsáveis, processo, aprovação, rejeição e saída — RNF-009–011,
  RSD-013 — `docs/10-agents/`

## Fase 2 — História US-02: ciclo SaaS e isolamento (P1)

**Objetivo:** tornar tenant, organização, plano, acesso, limites e governança
inequívocos.  
**Validação independente:** percorrer provisionamento → ativo → suspenso → cancelado e
provar isolamento em empresa, unidade, usuário, cache, job, arquivo e auditoria.

- [x] T014 [P] [US-02] Documentar arquitetura SaaS, ciclo do tenant, planos,
  assinaturas, limites, billing futuro e módulos premium — RF-001–011 —
  `docs/02-architecture/`
- [x] T015 [P] [US-02] Registrar decisão do banco único com `tenant_id`, alternativas,
  riscos e migração futura — RF-001–003, RSD-001–002 —
  `docs/11-adr/ADR-0004-multi-tenancy-model.md`
- [x] T016 [P] [US-02] Registrar autenticação, sessão, troca de tenant, revogação e
  RBAC — RF-007–010, RSD-003–007 —
  `docs/11-adr/ADR-0005-auth-strategy.md`
- [x] T017 [US-02] Criar matriz entidade × tenant e justificar todas as entidades
  globais — RF-001–011, RSD-001–002 — `docs/05-database/`
- [x] T018 [P] [US-02] Criar matriz ator × comando × escopo × condição para o MVP —
  RF-007–010, RSD-003–005 — `docs/08-security/`
- [x] T019 [P] [US-02] Documentar catálogo de dados, finalidade, base legal, retenção,
  exportação e anonimização — RF-009–010, RSD-008–012 — `docs/05-database/` e
  `docs/08-security/`
- [x] T020 [US-02] Especificar casos negativos cross-tenant para ID, lista, busca,
  cache, fila, webhook, storage, export e restore — RSD-001–003, RSD-012, RSD-014 —
  `docs/06-testing/`
- [x] T021 [US-02] Resolver política comercial de excedente, upgrade/downgrade e
  vigência ou registrar bloqueio com responsável — RF-004–006 —
  `docs/00-product/` e checklist da feature

## Fase 3 — História US-03: operação essencial (P1)

**Objetivo:** especificar o fluxo MVP de mesa, comanda, pedido e conta sem
ambiguidade monetária ou histórica.  
**Validação independente:** reconstruir uma venda completa e conciliar o total a
partir dos snapshots e eventos.

- [x] T022 [P] [US-03] Documentar bounded contexts, aggregates e dependências do
  monólito modular — RF-016–023, RNF-001 — `docs/02-architecture/`
- [x] T023 [P] [US-03] Criar contexto, containers, componentes e sequência do fluxo
  comanda → pedido → fechamento → integrações fake — RF-016–023, RF-024–035 —
  `docs/03-uml/`
- [x] T024 [US-03] Especificar máquinas de estado de mesa, comanda, pedido e conta,
  incluindo cancelamento e reabertura — RF-016–020 — `docs/01-business/` e
  `docs/03-uml/`
- [x] T025 [US-03] Especificar snapshots, divisão, taxa, desconto, arredondamento,
  formas de pagamento e invariantes de conciliação — RF-018–023 —
  `docs/01-business/`
- [x] T026 [P] [US-03] Mapear eventos de domínio, boundaries transacionais e outbox
  do fluxo MVP — RF-016–023, RNF-001, RNF-006, RNF-008 —
  `docs/02-architecture/`
- [x] T027 [P] [US-03] Criar matriz de testes de estados, concorrência, snapshots e
  centavos residuais — RF-016–023, RNF-010 — `docs/06-testing/`

## Fase 4 — História US-04: APIs fictícias (P1)

**Objetivo:** fornecer contratos públicos completos e resilientes sem operação real.  
**Validação independente:** validar OpenAPI e percorrer sucesso, falha, timeout,
fraude/chargeback, rejeição, retry, duplicidade e webhooks.

- [x] T028 [P] [US-04] Definir convenções API: versão, auth, erros, paginação,
  filtros, ordenação, IDs, idempotência e webhooks — RF-024–036, RNF-007–008,
  RSD-014 — `docs/04-api/`
- [x] T029 [US-04] Especificar e validar OpenAPI de pagamentos fake —
  RF-024–028, RNF-007–008, RSD-014 —
  `specs/001-saas-platform-foundation/contracts/`
- [x] T030 [US-04] Especificar e validar OpenAPI de notas fake — RF-029–031,
  RNF-007–008, RSD-014 — `specs/001-saas-platform-foundation/contracts/`
- [x] T031 [US-04] Especificar e validar OpenAPI de notificações — RF-032–035,
  RNF-006–008, RSD-014 — `specs/001-saas-platform-foundation/contracts/`
- [x] T032 [P] [US-04] Registrar provider abstrato, providers fake, filas, retries,
  templates e logs sanitizados — RF-032–034, RNF-006, RSD-011 —
  `docs/11-adr/ADR-0006-notification-strategy.md`
- [x] T033 [P] [US-04] Registrar estados e limites da API de pagamento fictício —
  RF-024–028 — `docs/11-adr/ADR-0007-fake-payment-api.md`
- [x] T034 [P] [US-04] Registrar estados, artefatos sem validade e limites da API de
  nota fictícia — RF-029–031 — `docs/11-adr/ADR-0008-fake-invoice-api.md`
- [x] T035 [US-04] Revisar consistência OpenAPI × máquinas de estado × UML × modelo e
  registrar todos os cenários obrigatórios — RF-024–035, RNF-007–008, RSD-014 —
  checklist da feature

## Fase 5 — História US-05: flags e planos (P2)

**Objetivo:** separar direito comercial, rollout e autorização.  
**Validação independente:** obter decisão determinística para combinações de
ambiente, plano, tenant e falha do avaliador.

- [x] T036 [P] [US-05] Documentar catálogo de feature, entitlement, override,
  kill switch, rollout, precedência e fallback — RF-012–015 —
  `docs/02-architecture/`
- [x] T037 [P] [US-05] Criar tabela módulo × fase × plano × flag × limite × owner —
  RF-011–015, RF-037–042 — `docs/00-product/`
- [x] T038 [US-05] Especificar auditoria, expiração, revisão e remoção de flags —
  RF-014–015, RSD-009–011 — `docs/08-security/`
- [x] T039 [US-05] Criar casos de decisão para bloqueio de ambiente, ausência de
  entitlement, override, rollout e indisponibilidade — RF-012–015, RNF-010 —
  `docs/06-testing/`

## Fase 6 — História US-06: qualidade operacional (P2)

**Objetivo:** demonstrar que o desenho é seguro, testável, observável, recuperável e
AWS-ready.  
**Validação independente:** seguir falha de dependência e restauração, com telemetria
e metas mensuráveis.

- [x] T040 [P] [US-06] Registrar monólito modular e critérios de extração — RNF-001,
  RNF-004 — `docs/11-adr/ADR-0001-architecture-style.md`
- [x] T041 [P] [US-06] Registrar monorepo versus multirepo — RNF-009 —
  `docs/11-adr/ADR-0002-monorepo-or-multirepo.md`
- [x] T042 [P] [US-06] Registrar adoção do Prisma e limites de SQL — RNF-002 —
  `docs/11-adr/ADR-0003-prisma-adoption.md`
- [x] T043 [P] [US-06] Documentar testes backend/frontend/contrato/isolamento/E2E,
  fixtures, ambientes e quality gates — RNF-009–010, RSD-002–005, RSD-013–014 —
  `docs/06-testing/`
- [x] T044 [P] [US-06] Documentar pipeline, environments, migration check, Docker e
  política de release/rollback — RNF-003, RNF-009, RSD-013 — `docs/07-devops/`
- [x] T045 [P] [US-06] Documentar estratégia AWS, portabilidade, stateless, storage,
  configuração, secrets e decisão futura ECS/EKS — RNF-003, RNF-011–014,
  RSD-006–007 — `docs/07-devops/`
- [x] T046 [P] [US-06] Documentar threat model OWASP, IDOR, brute force, rate limit,
  CORS, criptografia, supply chain e gestão de vulnerabilidade — RSD-001–014 —
  `docs/08-security/`
- [x] T047 [P] [US-06] Documentar logs, métricas, tracing, probes, dashboards,
  alertas e proibição de dados sensíveis — RNF-008, RNF-011, RSD-011 —
  `docs/09-observability/`
- [x] T048 [P] [US-06] Documentar escala, carga nominal, índices, cache, filas,
  relatórios e plano de capacidade — RNF-004–006, RNF-013 —
  `docs/02-architecture/`
- [x] T049 [P] [US-06] Documentar backup, restore, RPO/RTO, retenção, export e
  anonimização — RNF-012, RSD-008–012 — `docs/05-database/` e
  `docs/07-devops/`
- [x] T050 [US-06] Resolver SLO final e frequência de continuidade ou registrar owner
  e bloqueio de produção — RNF-004–005, RNF-012 — checklist da feature
- [x] T051 [US-06] Documentar descoberta/override de portas locais sem interromper
  `refresh` ou `tasks` — RNF-014 — `docs/07-devops/`

## Fase 7 — História US-07: roadmap evolutivo (P3)

**Objetivo:** evoluir do MVP à V3 sem antecipar implementação ou microsserviços.  
**Validação independente:** cada módulo futuro tem fase, contexto, dependências,
feature flag, risco de dados e critério de entrada.

- [x] T052 [P] [US-07] Consolidar roadmap MVP/V1/V2/V3 e critérios de promoção —
  RF-037–042 — `docs/00-product/`
- [x] T053 [P] [US-07] Mapear estoque, compras, caixa e relatórios aos contextos e
  eventos de V1 — RF-038, RF-041, RNF-001 — `docs/02-architecture/`
- [x] T054 [P] [US-07] Mapear clientes, consentimento, reservas, CRM e fidelidade aos
  contextos/flags de V2 — RF-039–040, RSD-008–012 — `docs/02-architecture/`
- [x] T055 [P] [US-07] Mapear BI, IA, marketplaces, SDK, portal, multi-região e módulos
  premium aos gates de V3 — RF-042, RNF-003–004 — `docs/02-architecture/`
- [x] T056 [US-07] Definir evidências quantitativas mínimas para propor extração de
  microsserviço — RNF-001, RNF-004 — `docs/02-architecture/`

## Fase 8 — Gates finais da primeira etapa

**Objetivo:** emitir decisão formal e impedir handoff prematuro.

- [x] T057 Validar nomenclatura **Mr Coti**, estrutura e presença de todos os
  artefatos requeridos — CS-001 — checklist da feature
- [x] T058 Auditar IDs canônicos e matriz história → requisito → tarefa → evidência,
  sem órfãos — RF-001–049, RNF-001–019, RSD-001–016, CS-002 — checklist da feature
- [x] T059 Repetir Constitution Check I–IX após integração dos artefatos e registrar
  evidências — RNF-001–019, RSD-001–016, CS-003 — checklist da feature
- [x] T060 Validar 100% das entidades quanto a tenant e isolamento — RF-001–011,
  RSD-001–002, CS-004 — checklist da feature
- [x] T061 Validar matriz RBAC e threat model das operações críticas — RF-007–010,
  RSD-001–016, CS-005 — checklist da feature
- [x] T062 Validar sintaxe e cenários das três APIs no contrato OpenAPI — RF-024–035,
  RNF-007–008, RSD-014, CS-006 — checklist da feature
- [x] T063 Revisar alternativas, consequências e estados dos ADRs 0001–0018 —
  RNF-001–003, RSD-001–014, CS-007 — checklist da feature
- [x] T064 Validar matriz roadmap × contexto × flag × dependência — RF-037–042,
  CS-008 — checklist da feature
- [x] T065 Executar `quickstart.md`, registrar todas as ressalvas e fechar pendências
  críticas — RF-001–049, RNF-001–019, RSD-001–016 —
  `specs/001-saas-platform-foundation/review-report.md`
- [x] T066 Confirmar que não houve aplicação, instalação, migration, deploy real,
  microsserviço, commit ou push nesta etapa — CS-001 — parecer de revisão
- [x] T067 Obter aprovação registrada dos papéis obrigatórios de governança —
  Founder, Product Owner, Software Architect, Security Officer, Data Governance,
  DevOps Lead, QA Lead e FinOps — CS-001–008 —
  `docs/18-governance/approval-record.md` e `checklists/requirements.md`

## Fase 9 — Fechamento de lacunas SaaS (US-08)

**Objetivo:** eliminar decisões implícitas e formalizar os parâmetros que ainda
dependem de aprovação humana, sem iniciar implementação.

- [x] T068 [US-08] Modelar Billing, planos, assinaturas e trials — RF-043–044 —
  `docs/12-billing/`
- [x] T069 [US-08] Propor overage e mudança de plano, com pendências de Produto —
  RF-045–046 — `docs/12-billing/overage-policy.md` e `plan-change-policy.md`
- [x] T070 [US-08] Documentar entitlements, limites por plano e separação de flags —
  RF-047 — `docs/13-entitlements/`
- [x] T071 [US-08] Criar catálogo, versionamento e governança de outbox — RF-048 —
  `docs/14-events/`
- [x] T072 [US-08] Definir ownership de contextos, dados e módulos — RF-049 —
  `docs/15-ownership/`
- [x] T073 [US-08] Documentar DR, runbook e RPO/RTO progressivos — RNF-015 —
  `docs/16-disaster-recovery/`
- [x] T074 [US-08] Documentar FinOps AWS, custos por tenant e alertas — RNF-016 —
  `docs/17-finops/`
- [x] T075 [US-08] Criar matriz RBAC verificável do MVP — RSD-015 —
  `docs/18-governance/rbac-matrix-mvp.md`
- [x] T076 [US-08] Propor retenção, bases LGPD e anonimização com Legal Review —
  RSD-016 — `docs/18-governance/`
- [x] T077 [US-08] Propor SLOs e perfil de carga por fase — RNF-017 —
  `docs/19-operations/slo.md` e `load-profile.md`
- [x] T078 [US-08] Inventariar listeners, sugerir portas e preservar refresh/taskflow/tasks —
  RNF-018 — `docs/19-operations/local-ports-inventory.md`
- [x] T079 [US-08] Registrar Billing, Entitlements e Eventos — RF-043–048 —
  `docs/11-adr/ADR-0009*` a `ADR-0011*`
- [x] T080 [US-08] Registrar DR e FinOps — RNF-015–016 —
  `docs/11-adr/ADR-0012*` e `ADR-0013*`
- [x] T081 [US-08] Registrar RBAC, LGPD e SLO/load — RNF-017, RSD-015–016 —
  `docs/11-adr/ADR-0014*` a `ADR-0016*`
- [x] T082 [US-08] Sincronizar Spec, Plan, Research, Data Model, Quickstart, AGENTS e
  Loops — RF-043–049, RNF-015–019, RSD-015–016 — artefatos canônicos
- [x] T083 [US-08] Atualizar checklist com lacunas, novos gates e estado de aprovação —
  RNF-019 — `checklists/requirements.md`
- [x] T084 [US-08] Validar arquivos, links, IDs, eventos, ADRs, portas e ausência de
  código — CS-012–018 — evidência de revisão
- [x] T085 [US-08] Criar approval record e formalizar toda decisão humana pendente —
  RNF-019 — `docs/18-governance/approval-record.md`
- [x] T086 [US-08] Confirmar que não houve código, dependência, migration, deploy,
  commit ou push — CS-018 — parecer final

## Fase 10 — Registro das decisões filtradas

**Objetivo:** transformar as decisões recebidas em aprovações por papel, preservando
condições e limites de autorização.

- [x] T087 Filtrar `Sugestões por decisão.docx` e registrar decisões oficiais
  por papel, sem promover condições futuras a aprovação irrestrita — CS-001–008 —
  `docs/18-governance/filtered-decisions-2026-06-26.md`
- [x] T088 Incorporar a diretriz portfolio local-first e commercial SaaS-ready
  em README, AGENTS, visão, spec, arquitetura e governança — RNF-001, RNF-003,
  RNF-019 — artefatos canônicos
- [x] T089 Sincronizar decisões de billing, entitlements, trial, RBAC,
  SLO/carga, DR, portas e FinOps — RF-004–006, RF-043–047, RNF-015–018, RSD-015–016 —
  `docs/12-billing/`, `docs/13-entitlements/`, `docs/18-governance/`,
  `docs/19-operations/`, `docs/17-finops/`
- [x] T090 Registrar ADR-0017 e ADR-0018 e atualizar estados dos ADRs afetados
  — RNF-001, RNF-017, RSD-013–016 — `docs/11-adr/`
- [x] T091 Criar trilha de cybersecurity progressiva com ASVS, SSDF, SAMM,
  SLSA, RBAC, isolamento tenant, webhooks, secrets, auditoria e incident response —
  RSD-001–016 — `docs/20-cybersecurity/`
- [x] T092 Atualizar checklist, review report e manifesto de evidências após
  decisões filtradas, confirmando ausência de código/dependências/migrations/deploy —
  CS-001–018 — checklist, review report e manifesto

## Dependências e paralelismo

- Fase 0 precede todas as demais.
- Fase 1 fornece os artefatos canônicos; T009–T013 podem ocorrer em paralelo após
  T003/T005.
- Fases 2–7 podem avançar em paralelo por arquivo, mas T017/T020 dependem de T015 e
  T018 depende de T016.
- T029–T031 são sequenciais no contrato canônico após T028; T035 depende das três APIs e
  dos ADRs T032–T034.
- T039 depende de T036; T050 depende de T043, T047–T049.
- A Fase 8 depende de todas as tarefas documentais aplicáveis. Gates não são
  paralelizáveis quando revisam o mesmo conjunto integrado.
- T068–T078 precedem T079–T083; T084–T086 dependem de todos os artefatos da Fase 9.
- T087 precede T088–T092; T092 depende das atualizações documentais e do manifesto.

## Critério de conclusão

A feature termina quando T057–T092 estiverem concluídas, CS-001–018 forem atendidos
e nenhuma pendência crítica da fundação documental permanecer. CHK048 segue aberto
como gate específico para produção/tratamento real de dados pessoais. CHK038 foi
satisfeito por snapshot local com `refresh` e `taskflow` ativos, mas o preflight de
portas deve ser repetido antes de subir a futura stack local do Mr Coti. CS-009–011
são gates futuros de implementação/produção; parâmetros condicionais ficam
registrados no approval record e jamais são falsamente marcados como aprovação
irrestrita.
