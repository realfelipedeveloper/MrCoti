# Agentes, subagentes e Loop Engineering — Mr Coti

Este documento descreve os perfis de agentes disponíveis no repositório, como eles
podem atuar como subagentes, quais “skills” técnicas cada um cobre e como o trabalho
flui na prática pelos loops de engenharia do Mr Coti.

> **Importante:** este documento não cria automação autônoma nem autoriza ampliar
> escopo. Subagentes só devem ser usados quando o usuário pedir delegação,
> paralelismo ou revisão especializada. O agente principal continua responsável por
> consolidar decisões, resolver conflitos e preservar a Constituição.
>
> **Escopo ativo:** a fase atual do Mr Coti é dev/local only. Docker Desktop/local
> Docker será usado para rodar a aplicação local após aprovação da spec; AWS readiness
> continua como prontidão arquitetural. `local-prod`, produção, deploy real e AWS real
> ficam fora da spec ativa.

## Conceitos

- **Agente principal:** instância ativa do Codex que conversa com o usuário, lê a
  Constituição, decide o plano de trabalho, coordena arquivos e entrega a resposta
  final.
- **Subagente:** instância especializada que pode ser criada sob demanda para um
  escopo limitado, por exemplo “Security revisa a spec 002” ou “QA valida a matriz de
  testes”. No repositório, os perfis carregáveis ficam em `.codex/agents/*.toml`.
- **Skill do agente:** competência operacional documentada no perfil: arquitetura,
  backend, segurança, QA, DevOps etc. Não significa permissão para ignorar gates.
- **Loop Engineering:** ciclo controlado de Spec → Architecture → API Contract →
  Implementation → Testing → Security → Review → Release → Observability.

## Regras de coordenação

1. O agente principal lê `.specify/memory/constitution.md`, `AGENTS.md` e a spec ativa.
2. Subagentes só são acionados se o usuário pedir ou se houver autorização explícita
   para paralelismo/delegação.
3. Cada subagente recebe escopo de arquivos sem sobreposição e resultado verificável.
4. Subagente não decide produto, risco legal, `local-prod`, produção, billing real,
   provider real ou tecnologia fora da stack sozinho.
5. O agente principal integra os achados, resolve conflitos e atualiza checklist,
   plan, tasks, contratos, ADRs ou docs impactados.
6. Se qualquer achado mudar escopo, comportamento, contrato, arquitetura, segurança ou
   dados, o trabalho retorna ao loop apropriado antes de implementar.

## Agentes disponíveis

| Perfil `.codex/agents` | Nome operacional | Skill principal | Quando usar | Entrega típica |
| --- | --- | --- | --- | --- |
| `business_analyst.toml` | Business Analyst Agent | requisitos, jornadas, linguagem ubíqua, critérios e rastreabilidade | Spec Loop, refinamento de escopo, ambiguidade de negócio | spec, histórias, critérios, glossário, matriz requisito→evidência |
| `architect.toml` | Architect Agent | arquitetura, bounded contexts, NFRs, ADRs, coerência técnica | Architecture Loop, trade-offs, modularização, AWS readiness | ADR, diagrama, plano arquitetural, parecer de fronteiras |
| `integration.toml` | Integration Agent | OpenAPI, adapters, filas, webhooks, idempotência e providers fake | API Contract Loop e integrações | contrato OpenAPI, cenários de falha, política de idempotência |
| `backend_nestjs.toml` | Backend NestJS Agent | casos de uso, domínio, API interna, guards, transactions, outbox e testes backend | Implementation Loop após aprovação | módulos backend, use cases, controllers, testes unit/integration |
| `frontend_nextjs.toml` | Frontend NextJS Agent | experiência web, App Router, UI states, acessibilidade e testes de frontend | Implementation Loop após aprovação | telas, componentes, estados loading/empty/error/denied, testes |
| `database.toml` | Database Agent | modelo Prisma/MySQL, tenant isolation, índices, migrations e continuidade | Architecture/Data Loop e implementação de dados após gate | data model, índices, migration plan, validação de constraints |
| `qa.toml` | QA Agent | matriz de testes, cobertura, evidências e quality gates | Testing Loop, checklist e aceite | plano de testes, casos, relatório de cobertura por risco |
| `security.toml` | Security Agent | threat model, RBAC, LGPD, secrets, supply chain e riscos | Security Loop, revisão de auth/dados/API | threat model, findings, mitigação, parecer de segurança |
| `devops.toml` | DevOps Agent | CI/CD, Docker local, ambientes dev, portas, AWS readiness e operação local | Release/Observability Loop futuro, preflight e runbooks | pipeline, runbook, portas, health/readiness, checklist local |
| `code_review.toml` | Code Review Agent | revisão independente de diff, regressão, segurança e aderência à spec | Review Loop | findings priorizados, bloqueadores, sugestões e parecer |

## Skills detalhadas por agente

### Business Analyst Agent

**Skills:**

- transformar intenção em histórias e critérios verificáveis;
- separar MVP/V1/V2/V3;
- manter linguagem ubíqua;
- diferenciar tenant, empresa, unidade, usuário, plano, assinatura, entitlement,
  feature flag, limite e RBAC;
- rastrear requisito → task → evidência.

**Não faz sozinho:** escolher stack, implementar, inventar política comercial ou
aprovar requisito ambíguo.

### Architect Agent

**Skills:**

- definir bounded contexts e ownership;
- preservar monólito modular, DDD, Clean Architecture e portas/adaptadores;
- avaliar NFRs, escalabilidade, consistência, outbox e AWS readiness;
- comparar alternativas e propor ADRs;
- rejeitar microsserviço prematuro sem evidência.

**Não faz sozinho:** priorizar produto, aceitar risco de segurança ou adotar tecnologia
fora da stack sem ADR.

### Integration Agent

**Skills:**

- modelar contratos OpenAPI;
- definir headers, erros, idempotência, versionamento e webhooks;
- desenhar providers fake, retries, backoff, dead-letter e deduplicação;
- garantir que pagamentos/notas/notificações fake não pareçam reais.

**Não faz sozinho:** conectar provider real, mudar contrato público unilateralmente ou
expor segredo/payload sensível.

### Backend NestJS Agent

**Skills:**

- implementar casos de uso por bounded context após gates;
- criar controllers/DTOs/guards/policies respeitando OpenAPI;
- aplicar `TenantContext`, transações, auditoria e outbox;
- escrever testes unitários e integração backend.

**Não faz sozinho:** iniciar scaffold antes de aprovação, acoplar domínio ao Nest/Prisma
ou consultar recurso tenant-aware apenas por ID externo.

### Frontend NextJS Agent

**Skills:**

- implementar telas e fluxos após gates;
- tratar loading, empty, error, denied e offline;
- manter acessibilidade WCAG 2.2 AA nos fluxos críticos;
- refletir plano/flag/RBAC sem substituir autorização server-side.

**Não faz sozinho:** conceder acesso no frontend, criar app antes do gate ou decidir
contrato backend.

### Database Agent

**Skills:**

- modelar entidades tenant-aware;
- propor índices e constraints;
- planejar migrations expand/migrate/contract;
- preservar centavos, UTC, ownership e restore;
- revisar riscos de vazamento cross-tenant.

**Não faz sozinho:** gerar schema/migration antes de aprovação ou decidir retenção
legal.

### QA Agent

**Skills:**

- converter riscos em testes;
- montar matriz requisito → cenário → evidência;
- planejar unit, integration, API/contract, component, accessibility e E2E;
- exigir cenários de concorrência, idempotência, falha externa e isolamento tenant.

**Não faz sozinho:** dispensar gate ou aceitar teste frágil sem evidência.

### Security Agent

**Skills:**

- modelar ameaças por fronteira de confiança;
- revisar IDOR/cross-tenant, auth, RBAC/policies, webhooks, filas, injection, abuse e
  exposição de dados;
- exigir rate limit, auditoria, secrets management, SAST e dependency scanning;
- registrar risco residual e mitigação.

**Não faz sozinho:** aceitar risco de negócio/legal, inserir segredo em artefato ou
liberar dado real sem Legal Review.

### DevOps Agent

**Skills:**

- planejar Docker local, CI/CD, environments e portas;
- mapear AWS readiness sem acoplar domínio à AWS;
- definir health/readiness/liveness, rollback e migration gate;
- preservar secrets fora do repo;
- coordenar release e observability loops quando o escopo exigir.

**Não faz sozinho:** configurar `local-prod`, deploy real, AWS real, subir stack antes
do gate ou escolher porta colidindo com `refresh`/`taskflow`.

### Code Review Agent

**Skills:**

- comparar diff com Constituição, spec, ADRs, contratos e tasks;
- priorizar bugs, regressão, autorização, tenant isolation, perda de dados,
  idempotência, concorrência e testes ausentes;
- diferenciar bloqueadores de sugestões;
- emitir parecer independente.

**Não faz sozinho:** reescrever escopo sem pedido ou aprovar artefatos divergentes.

## Como funciona na prática dentro do Loop Engineering

### 1. Spec Loop

**Coordenador natural:** Business Analyst Agent.  
**Participantes úteis:** Architect, QA, Security.

Na prática:

1. O usuário traz objetivo ou mudança.
2. O agente principal confirma a spec ativa.
3. Business Analyst refina histórias, requisitos, critérios e fora de escopo.
4. QA verifica se cada requisito é testável.
5. Security aponta riscos de dados/auth/tenant.
6. O agente principal consolida `spec.md`, checklist e pendências.

**Saída:** spec revisável e rastreável.

### 2. Architecture Loop

**Coordenador natural:** Architect Agent.  
**Participantes úteis:** Backend, Frontend, Database, Integration, Security, DevOps.

Na prática:

1. Architect mapeia requisitos a módulos e boundaries.
2. Database valida tenant_id, constraints e dados.
3. Integration define eventos/contratos.
4. DevOps valida Docker local, portas e AWS readiness.
5. Security valida ameaças e controles.
6. O agente principal consolida plan, research, ADRs e data model.

**Saída:** plano técnico com trade-offs explícitos.

### 3. API Contract Loop

**Coordenador natural:** Integration Agent.  
**Participantes úteis:** Backend, Frontend, QA, Security.

Na prática:

1. Integration desenha recursos, schemas, erros e exemplos.
2. Backend valida implementabilidade.
3. Frontend valida consumo.
4. QA deriva testes de contrato.
5. Security revisa exposição, auth, IDOR e payloads.

**Saída:** OpenAPI validável antes do código.

### 4. Implementation Loop

**Coordenadores naturais:** Backend, Frontend, Database ou Integration, conforme a
task.  
**Estado atual:** liberado com condições a partir de T004. CHK024 foi satisfeito e
T001–T003 foram concluídas em 2026-07-11.

Na prática, após aprovação:

1. O agente principal escolhe a próxima task aberta.
2. O agente especializado implementa somente aquele escopo.
3. Testes e documentação acompanham o incremento.
4. Qualquer divergência retorna ao loop correto, em vez de “resolver no código”.

**Saída:** incremento pequeno, testável e rastreável.

### 5. Testing Loop

**Coordenador natural:** QA Agent.  
**Participantes úteis:** Backend, Frontend, Database, Integration, Security.

Na prática:

1. QA mapeia requisitos a testes.
2. Implementadores criam/ajustam testes no nível adequado.
3. QA verifica determinismo, isolamento e evidência.
4. Falha de comportamento volta para Implementation ou Spec.

**Saída:** evidência de que o comportamento foi demonstrado.

### 6. Security Loop

**Coordenador natural:** Security Agent.  
**Participantes úteis:** Architect, Backend, Frontend, Database, DevOps, QA.

Na prática:

1. Security revisa ameaça, dados, auth, RBAC, IDOR e logs.
2. QA/Backend/Frontend comprovam cenários negativos.
3. DevOps valida secrets e pipeline.
4. Risco residual só é aceito com autoridade humana.

**Saída:** parecer de segurança e riscos tratados.

### 7. Review Loop

**Coordenador natural:** Code Review Agent.

Na prática:

1. Code Review compara diff com spec/tasks/contratos.
2. Bloqueadores voltam ao autor/loop correspondente.
3. Sugestões não bloqueantes ficam separadas.
4. O agente principal consolida decisão e próximos passos.

**Saída:** parecer independente de manutenibilidade e aderência.

### 8. Release Loop

**Coordenador natural:** DevOps Agent.  
**Estado para o Mr Coti agora:** fora do escopo ativo; sem `local-prod`, sem produção
real e sem AWS real. Em dev/local, o equivalente prático é validar gates, scripts,
Docker Desktop/local Docker, preflight e evidências de demonstração.

Na prática futura:

1. DevOps valida artefato, configuração, migrations, secrets e rollout.
2. QA/Security confirmam gates atuais.
3. Product/Owner aprova promoção.
4. Sem aprovação e nova spec, não há promoção para ambiente além de dev/local.

**Saída:** demonstração local validada, ou release futuro bloqueado/promovido com
evidência quando esse escopo existir.

### 9. Observability Loop

**Coordenador natural:** DevOps Agent com owner de domínio.

Na prática futura:

1. Validar logs, métricas, traces, auditoria e SLOs.
2. Observar backlog, erro, latência, custo e sinais de segurança.
3. Incidente ou lacuna vira nova spec/task.

**Saída:** aprendizado operacional rastreável.

## Exemplo de uso prático na spec 002

Para implementar `T009–T014` da spec 002:

1. **Business Analyst** confirma que US-01 e RF-001–004 estão claros.
2. **Architect** confirma módulo IAM/Plataforma e fronteira com Organização.
3. **Database** revisa entidades `IdentityUser`, `Tenant`, `Membership` e índices.
4. **Backend NestJS** implementa login, guards e contexto tenant após CHK024.
5. **Security** revisa auth, senha, RBAC e IDOR.
6. **QA** valida testes positivos/negativos/cross-tenant.
7. **Code Review** revisa diff e aderência.
8. **DevOps** só entra se a task afetar ambiente, portas ou pipeline.

## Como subagentes devem ser chamados

Quando o usuário pedir paralelismo, o agente principal deve passar instruções assim:

```text
Subagente: Security
Escopo: revisar specs/002-mvp-local-first-slice/spec.md e contracts/openapi.json
Arquivos permitidos: somente leitura
Entregar: riscos bloqueantes, sugestões e requisitos afetados
Não fazer: editar arquivos, ampliar escopo, aprovar local-prod/produção
```

Para trabalho com edição:

```text
Subagente: QA
Escopo: atualizar apenas specs/002-mvp-local-first-slice/checklists/requirements.md
Entregar: checklist consistente com RF/RNF/RSD e CS
Não fazer: alterar spec.md, tasks.md ou contrato
```

## Matriz de propriedade de arquivos

| Arquivo/área | Agente primário | Revisores |
| --- | --- | --- |
| `spec.md` | Business Analyst | Architect, QA, Security |
| `plan.md` | Architect | Backend, Frontend, Database, DevOps, Security |
| `research.md` | Architect ou BA | especialistas afetados |
| `data-model.md` | Database | Architect, Backend, Security |
| `contracts/openapi.json` | Integration | Backend, Frontend, QA, Security |
| `tasks.md` | QA + agente principal | todos os owners afetados |
| `checklists/requirements.md` | QA | BA, Architect, Security |
| ADRs | Architect | área afetada + Security/DevOps quando aplicável |
| `docs/19-operations` | DevOps | QA, Security, Architect |
| `docs/20-cybersecurity` | Security | QA, DevOps, Architect |

## Estado atual do projeto

- Fundação `001-saas-platform-foundation`: aprovada com condições.
- Escopo ativo: dev/local only, usando Docker Desktop/local Docker e preservando
  AWS-ready.
- CHK048: permanece `PENDING LEGAL REVIEW` apenas como gatilho futuro para
  produção/tratamento real de dados pessoais.
- Spec ativa `002-mvp-local-first-slice`: aprovada com condições.
- CHK024 da spec 002: satisfeito em 2026-07-11; T001–T003 concluídas; implementação
  dev/local autorizada em ordem a partir de T004.
- Subagentes runtime: nenhum subagente persistente foi criado por este documento.
  Existem perfis disponíveis para uso quando o usuário autorizar delegação.

## Regra de ouro

Agentes aceleram análise e execução, mas não substituem decisão humana. Quando houver
dúvida entre avançar rápido e preservar rastreabilidade, o Mr Coti escolhe
rastreabilidade.
