# Plano — Fundação da plataforma SaaS

**Produto:** Mr Coti  
**Branch:** `001-saas-platform-foundation`  
**Especificação:** `specs/001-saas-platform-foundation/spec.md`  
**Data:** 2026-06-23  
**Estado:** Plano documental aprovado com condições; próxima spec implementável local autorizada

## Resumo

O plano transforma o SDD do Mr Coti em uma fundação aprovada antes de código. O
resultado é uma arquitetura de monólito modular SaaS, banco único com `tenant_id`,
contratos API First para as três integrações fictícias, feature flags por ambiente,
plano e tenant, qualidade automatizada, segurança/LGPD, observabilidade e caminho
portável para AWS.

Esta feature encerra no gate documental. O plano descreve a solução-alvo para tornar
decisões verificáveis, mas não cria aplicações, dependências, migrations, containers
executáveis ou infraestrutura real.

## Contexto técnico

| Dimensão | Decisão ou restrição |
|---|---|
| Produto | SaaS multi-tenant para operações de alimentação |
| Arquitetura | Monólito modular; DDD estratégico/tático; Clean; hexagonal em integrações; eventos internos e outbox |
| Backend alvo | NestJS, TypeScript, Prisma, MySQL 8+, Redis, BullMQ |
| Frontend alvo | Next.js App Router, TypeScript, Tailwind CSS, RSC quando adequado |
| Testes alvo | Jest, Supertest, Playwright e containers efêmeros |
| Infra alvo | Node.js LTS, Docker/Compose, GitHub Actions; AWS-ready |
| Tenancy | Banco/schema compartilhado com `tenant_id`; identidade separada de membership |
| APIs públicas | Pagamentos fake, notas fake e notificações; OpenAPI 3.x antes do código |
| Segurança | RBAC, DTO validation, rate limiting, auditoria, CORS, secrets, OWASP, SAST e LGPD |
| Escala | baseline de 1.000 tenants e milhões de pedidos/logs/eventos; validar por capacidade |
| Desempenho | objetivo inicial p95 ≤ 500 ms e p99 ≤ 1 s em APIs próprias sob carga nominal |
| Continuidade | baseline RPO ≤ 24 h e RTO ≤ 4 h, sujeito a revisão antes de produção |
| Restrições locais | portas configuráveis; não colidir com `refresh`, `taskflow` e `tasks` |

Incertezas e alternativas estão resolvidas em `research.md`; decisões comerciais
demonstrativas, RBAC, SLO/carga e portas efetivas foram aprovados/verificados com
condições em 2026-06-26. Legal Review permanece gate explícito em CHK048.

## Constitution Check

| Princípio | Estado | Evidência neste plano |
|---|---|---|
| I. Especificação é fonte da verdade | PASSA | Requisitos RF/RNF/RSD, histórias, rastreabilidade, tasks e checklist da feature |
| II. SaaS e isolamento | PASSA | `tenant_id`, membership, índices compostos, matriz de isolamento e testes negativos planejados |
| III. Segurança, privacidade e governança | PASSA | RSD-001–014, threat model, catálogo de dados, auditoria e gates de segurança |
| IV. API First e integrações resilientes | PASSA | contrato OpenAPI prévio para as três APIs, idempotência, webhooks, provider ports e outbox |
| V. Monólito modular | PASSA | bounded contexts, ownership de dados e dependências por contratos/eventos |
| VI. Qualidade verificável | PASSA | matriz de testes e pipeline bloqueante definidos antes de implementação |
| VII. Observabilidade operacional | PASSA | logs/métricas/traces, probes, SLOs, fila/outbox e alertas planejados |
| VIII. AWS-friendly | PASSA | containers stateless, adapters, configuração externa e mapeamento AWS |
| IX. Flags e ADRs | PASSA | modelo de entitlement/flag, precedência, kill switch e oito ADRs iniciais |

**Reavaliação obrigatória:** o Constitution Check deve ser repetido após aprovação do
desenho e antes de qualquer tarefa de implementação. Uma falha não justificada por
ADR bloqueia a transição.

## Escopo de entrega desta feature

### Artefatos Spec Kit

```text
.specify/
├── memory/constitution.md
└── templates/
    ├── constitution-template.md
    ├── spec-template.md
    ├── plan-template.md
    ├── tasks-template.md
    └── checklist-template.md

specs/001-saas-platform-foundation/
├── spec.md
├── plan.md
├── tasks.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.json
└── checklists/
    └── requirements.md
```

### Artefatos irmãos obrigatórios

A conclusão integral da primeira etapa também depende de documentação de produto,
arquitetura, UML, APIs, dados, testes, DevOps, segurança, observabilidade, agentes,
loops, roadmap, Billing, Entitlements, Events, Ownership, DR, FinOps, Governance,
Operations, Cybersecurity e ADRs 0001–0018. Esses artefatos devem citar os IDs desta
spec e não podem redefini-los silenciosamente.

```text
docs/
├── 00-product/ ... 11-adr/
├── 12-billing/
├── 13-entitlements/
├── 14-events/
├── 15-ownership/
├── 16-disaster-recovery/
├── 17-finops/
├── 18-governance/
├── 19-operations/
└── 20-cybersecurity/
```

## Desenho da solução-alvo

### Limites de domínio

O monólito é particionado nos contextos abaixo. Cada contexto possui regras, dados e
interfaces de aplicação próprios.

| Contexto | Fase | Responsabilidade | Eventos/contratos de saída |
|---|---|---|---|
| Plataforma SaaS | MVP | tenant, planos, assinatura, limites, feature flags | tenant/assinatura/flag alterados |
| Billing | fundação/futuro | PlanVersion, trial, mudança, overage e histórico comercial | PlanChanged, EntitlementExceeded |
| IAM e Acesso | MVP | identidade, sessão, membership, RBAC | membership e papel alterados |
| Organização | MVP | empresas e unidades | unidade criada/alterada |
| Catálogo | MVP | categorias, produtos, preços, disponibilidade, ficha técnica | produto/preço alterado |
| Operação | MVP | mesas, comandas, pedidos, conta | pedido criado, conta fechada |
| Pagamentos Fake | MVP | cobrança e estados simulados | cobrança autorizada/capturada/falha |
| Notas Fake | MVP | emissão simulada e artefatos fake | nota autorizada/rejeitada/cancelada |
| Notificações | MVP/V1 | e-mail fake; depois SMS/WhatsApp fake | entrega/falha |
| Estoque e Compras | V1 | insumos, movimentos, fornecedor e compra | estoque movimentado/baixo |
| Caixa e Relatórios | V1 | sessão/movimentos e projeções | caixa fechado/relatório pronto |
| Clientes e Reservas | V2 | cliente, consentimento, CRM, reserva, fidelidade | consentimento/reserva alterados |
| Plataforma de Extensões | V3 | apps, SDK, instalações, marketplace | app instalado/revogado |

Regras de dependência:

1. Domínio não importa framework, ORM, HTTP, fila ou provider.
2. Contexto não lê tabela de outro contexto; usa contrato de aplicação ou evento.
3. Operação recebe snapshot do Catálogo; histórico não muda com o catálogo.
4. Pagamento/nota fake recebem referências e snapshots mínimos; não controlam a
   transação principal da comanda.
5. Relatórios são projeções reconstruíveis e não se tornam fonte transacional.

### Fluxo SaaS e isolamento

1. Autenticação resolve `Identity` e sessão.
2. Seleção de tenant valida `Membership`, estado do tenant e escopo de unidade.
3. Middleware/guard cria contexto confiável; `tenant_id` do payload é ignorado como
   autoridade.
4. Política verifica RBAC, entitlement/flag, limite e estado do aggregate.
5. Repositório aplica tenant em consulta/constraint; cache e storage usam namespace
   ambiente+tenant.
6. Transação grava aggregate, outbox e auditoria necessária.
7. Telemetria propaga IDs sem expor dados pessoais.

Rotinas de plataforma cross-tenant são separadas das rotas tenant, têm permissão
especial, paginação, razão, rate limit e auditoria. Suspensão bloqueia novos comandos
de negócio e aciona política para sessões/jobs, sem apagar dados.

### Avaliação de feature e limite

A avaliação usa a seguinte ordem:

1. configuração/kill switch do ambiente;
2. estado do tenant e assinatura;
3. entitlement e limite da versão do plano;
4. override válido e aprovado do tenant;
5. rollout determinístico e fallback seguro.

O backend é autoridade; a interface só reflete a decisão. Consumo de limite que
permite concorrência usa reserva/incremento atômico e chave de período. Flags têm
owner, validade, motivo e remoção; não concedem permission RBAC.

### API, idempotência e webhooks

- OpenAPI 3.x versionado define os três domínios públicos antes do código.
- Cabeçalhos padronizados: autenticação, `X-Request-Id`, `X-Correlation-Id` e
  `Idempotency-Key` em comandos aplicáveis.
- Recurso de idempotência persiste hash da chave/payload e resultado; mesma chave com
  payload divergente gera conflito.
- Erros possuem status HTTP, código de domínio estável, mensagem segura,
  correlation-id e detalhes validados.
- Paginação é limitada; filtros/ordenação têm allowlist e critério estável.
- Webhooks carregam ID e versão de evento, timestamp, tenant, correlação e assinatura
  simulada; entrega é ao menos uma vez com retry finito.
- Timeout ambíguo não dispara repetição cega: cliente consulta o recurso pela chave ou
  referência.

### Persistência, eventos e consistência

MySQL é a fonte da verdade. A unidade transacional do aggregate inclui registro de
outbox; dispatcher publica para BullMQ/Redis. Consumidores usam inbox/deduplicação e
operações idempotentes. A semântica é ao menos uma vez.

Redis contém cache reconstruível, rate limits e filas, nunca a única cópia de dados
de negócio. TTL, invalidação, backlog, retries, dead letters e degradação são
explícitos. Relatórios e downloads pesados são jobs com storage abstrato.

### Segurança e privacidade

Antes de implementação, cada fluxo do MVP terá análise de ameaça contendo spoofing,
tampering, repúdio, exposição, negação de serviço e elevação de privilégio, com foco
em IDOR/cross-tenant. A matriz RBAC mapeia ator × comando × escopo × condição.

Dados são classificados e minimizados. Secrets e tokens usam hash/cofre; logs omitem
conteúdo sensível. Consentimento é versionado. Exportação, anonimização e restauração
são autorizadas, auditadas e preservam isolamento. CORS usa allowlist por ambiente,
entradas usam DTO/allowlist e rate limiting protege autenticação e APIs públicas.

### Qualidade e estratégia de testes

| Camada | Objetivo | Evidências obrigatórias futuras |
|---|---|---|
| Unidade | invariantes, estados, cálculos, flags e políticas | casos positivos, negativos e bordas |
| Integração | MySQL/Prisma, Redis/BullMQ, outbox, constraints | containers reais, concorrência e rollback |
| API/contrato | OpenAPI, auth, erros, idempotência e paginação | Supertest + validação de schema/exemplos |
| Isolamento | IDOR, query, cache, job, export e storage | matriz de dois ou mais tenants, zero vazamento |
| Integrações fake | estados e resiliência | sucesso, falha, timeout, fraude/chargeback, rejeição, retry e duplicidade |
| Frontend | componentes, páginas, responsividade e acessibilidade | estados loading/empty/error/denied e teclado |
| E2E | jornadas MVP | provisionamento, pedido, conta e integrações fake |
| Segurança | OWASP e supply chain | SAST, dependências, imagem, secrets e DAST quando aplicável |
| Capacidade/recuperação | RNF-004/005/012 | carga, soak, backup/restore e integridade por tenant |

O pipeline futuro executa install, lint, format check, typecheck, unit, integration,
E2E, build, security scan, dependency audit, Docker build, migration check e quality
gate. Nenhuma etapa é implementada nesta feature; sua definição documental é gate.

### Observabilidade e operação

Sinais mínimos:

- logs JSON com módulo, ambiente, tenant pseudonimizado, operação, resultado, duração,
  request-id e correlation-id;
- métricas RED para APIs, métricas de negócio sem alta cardinalidade, lag/outbox,
  backlog/falha de filas, integrações e pool/banco;
- traces de API → aplicação → banco/outbox → job/provider;
- health (processo), readiness (capacidade de servir) e liveness (progresso do
  processo) com semânticas distintas;
- alertas para erro/latência, saturação, backlog, outbox preso, DLQ, falha de webhook,
  backup/restore e tentativas de cross-tenant.

Dados sensíveis, bodies integrais e labels com alta cardinalidade são proibidos.

### Portabilidade AWS

| Capacidade local/abstrata | Destino AWS possível | Restrição de desenho |
|---|---|---|
| containers Docker | ECS Fargate ou EKS | stateless, shutdown gracioso, probes |
| MySQL | RDS MySQL | SQL/migration compatíveis, pool configurável |
| Redis/BullMQ | ElastiCache Redis | dados reconstruíveis; estratégia de fila pode evoluir |
| object storage adapter | S3 + CloudFront | sem dependência de filesystem local |
| logs/métricas/traces | CloudWatch ou stack autorizada | formato vendor-neutral |
| secrets por ambiente | Secrets Manager | nenhuma credencial em arquivo/imagem |
| providers de mensagem | SES/SNS/SQS via adapters | contrato do domínio independente |
| DNS/edge | Route 53/CloudFront | URLs/configuração externas |

Não se escolhe ECS versus EKS nesta etapa. A decisão futura considera equipe, escala e
custo. Docker Compose continua sendo o ambiente inicial.

## Fases deste plano documental

### Fase 0 — Constituição e compatibilidade Spec Kit

**Saída:** constituição ratificada, modelos compatíveis e regras de governança.  
**Gate:** princípios normativos, versionamento e templates sincronizados.

### Fase 1 — Especificação e pesquisa

**Saída:** histórias P1–P3, requisitos RF/RNF/RSD, critérios, pesquisa e decisões.  
**Gate:** nenhuma ambiguidade crítica sem dono; rastreabilidade inicial completa.

### Fase 2 — Arquitetura, dados e contratos

**Saída:** bounded contexts, UML, modelo conceitual, OpenAPI, ADRs e decisões de
tenancy/flags/outbox.  
**Gate:** contratos validáveis, modelo tenant-aware e ADRs aprovados.

### Fase 3 — Estratégias transversais

**Saída:** segurança/LGPD, testes, CI/CD, AWS, escala, observabilidade, agentes,
loops e roadmap.  
**Gate:** cada requisito transversal possui verificação, owner e evidência planejada.

### Fase 4 — Consistência e prontidão

**Saída:** tasks documentais encerradas, quickstart de revisão executado, checklist e
parecer de aprovação.  
**Gate:** CS-001–008 atendidos, zero pendência crítica e nenhum código de aplicação.

### Fase 5 — Fechamento de lacunas da fundação

**Saída:** Billing/Entitlements, catálogo de eventos, ownership, DR, FinOps,
RBAC/LGPD/SLO/carga, inventário de portas, cybersecurity e ADR-0009–0018 documentados.  
**Gate:** parâmetros da fundação foram aprovados com condições; CHK038 foi satisfeito
por snapshot local com `refresh` e `taskflow` ativos, e CHK048 permanece para Legal
Review antes de produção/dados reais.

### Fase futura — Planejamento de implementação

Após aprovação das Fases 4–5 e registro das decisões filtradas, pode ser criada uma
nova spec ou revisão explicitamente autorizada com tarefas de código para o primeiro
incremento vertical local do MVP. As tasks desta feature não se convertem
implicitamente em autorização de implementação.

## Rastreabilidade de requisitos a artefatos

| Grupo | Artefato primário | Evidência/gate |
|---|---|---|
| RF-001–015 | data model, ADR tenancy/auth e arquitetura SaaS/flags | matriz tenant/entitlement/RBAC |
| RF-016–023 | modelo, UML e arquitetura de domínio | cenários de comanda/conta e invariantes |
| RF-024–036 | contrato OpenAPI das três APIs e ADRs de integrações | validação OpenAPI + matriz de cenários |
| RF-037–042 | roadmap e bounded contexts | matriz fase × feature × flag |
| RNF-001–003 | ADRs 0001–0003 e estratégia AWS | Constitution Check e portability review |
| RNF-004–014 | escala, testes, CI/CD, observabilidade e quickstart | SLO/capacidade/restore planejados |
| RSD-001–014 | segurança, data governance, RBAC e threat model | security/privacy gate |
| RF-043–047 | Billing, trials, overage, plano e entitlements | docs/12–13 + ADR-0009/0010 |
| RF-048–049 | catálogo de eventos e ownership | docs/14–15 + ADR-0011 |
| RNF-015–019 | DR, FinOps, SLO/carga, portas e aprovações | docs/16–19 + ADR-0012/0013/0016 |
| RSD-015–016 | matriz RBAC, governança LGPD e cybersecurity progressiva | docs/18–20 + ADR-0014/0015/0018 |

## Riscos e mitigação

| Risco | Probabilidade/impacto | Mitigação | Evidência de encerramento |
|---|---|---|---|
| Vazamento cross-tenant por query/cache/job | média/crítico | contexto confiável, repositórios escopados, chaves namespaced e testes negativos | matriz de isolamento com zero falha |
| Escopo documental amplo e contraditório | alta/alto | spec única, IDs, owner por artefato, checklist e revisão cruzada | CS-002/003 aprovados |
| Flags misturarem rollout, plano e autorização | média/alto | entidades e precedência separadas; backend como autoridade | cenários RF-012–015 aprovados |
| Eventos duplicados ou perdidos | média/alto | outbox, at-least-once, inbox/idempotência e monitoramento | testes de falha/replay planejados |
| APIs fake confundidas com serviços reais | baixa/crítico | nomenclatura, marca d'água, ausência de dados reais e ambientes explícitos | revisão de contrato/segurança |
| Monólito perder modularidade | média/alto | ownership de dados e verificação de dependências | architecture gate sem acesso transversal |
| Meta de escala não ser realista | média/alto | carga nominal, testes de capacidade e revisão de SLO antes de produção | relatório de capacidade futuro |
| Lock-in ou refatoração para AWS | baixa/alto | containers stateless e ports/adapters | portability review |
| Retenção LGPD indefinida | alta/alto | catálogo, baseline aprovado e Legal Review antes de produção | CHK048 fechado somente após revisão jurídica |
| Conflito de portas locais | média/médio | descoberta e configuração por ambiente | quickstart futuro sem conflito |

## Complexity Tracking

Não há violação constitucional aprovada. Tecnologias complementares e decisões
futuras permanecem condicionadas a ADR. Microsserviços, billing/fiscal real e
infraestrutura real não são necessários para atender esta feature.

## Condição de saída

Este plano está concluído somente quando:

1. todos os artefatos da Fase 0–5 existem e passam no checklist documental;
2. contratos e diagramas são consistentes com os estados do modelo;
3. decisões críticas estão nos ADRs 0001–0018 e decisões por papel têm approval record;
4. RF/RNF/RSD estão rastreados a tarefas e evidências;
5. pendências de segurança, tenancy, integridade ou contrato que bloqueariam a próxima
   spec local são zero; CHK048 preserva o marco de produção/dados reais;
6. o repositório continua sem código de aplicação ou ações proibidas pelo SDD.
