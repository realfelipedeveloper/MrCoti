# AGENTS.md — Mr Coti

## Missão do repositório

Construir o Mr Coti por Spec-Driven Development. A Spec aprovada é a fonte da
verdade; ADRs registram decisões; contratos precedem implementação. Sempre use o
nome oficial **Mr Coti**. O Mr Coti é inicialmente um projeto de portfólio executado
em ambiente local individual, mas sua arquitetura deve permanecer preparada para
evolução futura como SaaS comercial escalável, sem reescrita estrutural.
O escopo ativo atual é dev/local only: Docker Desktop/local Docker será usado para
rodar a aplicação local após os gates iniciais já registrados, enquanto AWS readiness
permanece como prontidão arquitetural. `local-prod`, produção, deploy real e AWS real
não devem ser perseguidos nesta fase.

## Fase vigente: implementação da primeira fatia dev/local

Na feature ativa `specs/002-mvp-local-first-slice/`, CHK024 foi satisfeito em
2026-07-11 por aprovação explícita de Felipe Almeida. T001–T003 também foram
concluídas. Agentes podem prosseguir em ordem a partir de T004, respeitando
`approval-record.md`, `tasks.md`, contratos e Constitution Gates.

Agentes **podem** criar/scaffoldar, instalar dependências, gerar lockfiles, criar
migrations, executar banco e criar Docker Compose local somente quando a task
correspondente autorizar. Tudo deve ser dev/local, com Docker Desktop/local Docker,
dados sintéticos e stack mínima.

Agentes **não podem**:

- criar `local-prod`, staging, homologação ou produção;
- provisionar AWS real;
- integrar provedores externos reais;
- usar dados pessoais/empresariais/segredos reais;
- criar microsserviços;
- introduzir broker externo nesta spec;
- subir serviços locais não utilizados pela jornada;
- fazer commit ou push sem pedido explícito.

A fundação `001-saas-platform-foundation` está aprovada com condições e CHK048
permanece `PENDING LEGAL REVIEW` apenas como gatilho futuro para produção/dados
reais; ela não bloqueia a spec local sintética. Se uma solicitação tentar reabrir
produção/local-prod/AWS real/dados reais sem nova spec, pare e aponte o gate
pendente.

## Ordem de leitura

1. `.specify/memory/constitution.md`.
2. Fundação: `specs/001-saas-platform-foundation/spec.md` e checklist vigente.
3. Spec ativa: `specs/002-mvp-local-first-slice/spec.md`, `plan.md`, `research.md`,
   `data-model.md`, `contracts/openapi.json`, `quickstart.md` e checklist.
4. ADRs e documentação da área.
5. `tasks.md` da spec ativa somente após confirmar consistência dos itens anteriores.
6. Para mudanças SaaS transversais, leia `docs/12-billing` a `docs/20-cybersecurity`,
   `docs/18-governance/governance-roles.md` e
   `docs/18-governance/approval-record.md` antes de concluir que há aprovação.

## Regras arquiteturais obrigatórias

- Modular Monolith; não extrair microsserviço sem métricas e ADR.
- Monorepo planejado para backend NestJS e frontend Next.js.
- TypeScript, Prisma e MySQL 8+; Redis/BullMQ para filas/cache.
- Single Database + `tenant_id`; toda consulta tenant-aware recebe escopo confiável.
- DDD, Clean Architecture e portas/adaptadores nas integrações.
- Domain events + transactional outbox; consumidores idempotentes.
- API-first, OpenAPI versionado, `Idempotency-Key`, `X-Request-Id` e `X-Correlation-Id`.
- RBAC + policies; deny-by-default, auditoria e proteção contra IDOR.
- Feature, plano, entitlement, flag, limite e RBAC são controles distintos.
- Nenhuma tecnologia relevante fora da stack aprovada sem ADR.
- Cloud/AWS ready sem dependência direta de serviço AWS no domínio.
- Billing modela plano/assinatura/trial/overage, mas não processa cobrança real.
- Entitlement (direito comercial), Feature Flag (rollout) e RBAC (ator/recurso) são
  controles cumulativos e nunca intercambiáveis.
- Eventos cross-context devem existir no catálogo, usar envelope/versionamento e
  outbox; somente o contexto owner escreve seus dados.
- RPO/RTO, SLO, carga e custos são baselines de prontidão; não os transforme em
  promessa contratual nem em obrigação de produção para a fase dev/local.
- Cybersecurity é requisito de primeira classe: escopo funcional pode ser
  incremental, mas nenhum fluxo implementado nasce sem controles de segurança
  proporcionais ao risco.

## Qualidade documental

- Requisitos usam `RF-###`, `RNF-###` e `RSD-###`; tarefas usam `T###`; decisões usam `ADR-####`.
- Uma alteração atualiza links, rastreabilidade, modelos, contrato e ADRs impactados.
- Declare suposições e questões abertas; não invente decisão comercial.
- Use exatamente `PENDING HUMAN DECISION`, `PENDING LEGAL REVIEW` ou
  `PENDING LOCAL VERIFICATION` quando o aprovador/evidência não existir. Nunca marque
  silêncio ou a criação do documento como aprovação.
- Enquanto o Mr Coti estiver em fase solo, a mesma pessoa pode exercer múltiplos
  papéis de governança, mas cada papel exige decisão separada no approval record.
- Critérios devem ser verificáveis. Evite expressões como “rápido”, “seguro” ou “escalável” sem medida/evidência.
- Diagramas PlantUML devem compilar e usar nomes consistentes com o glossário.
- O OpenAPI da fundação vive em `specs/001-saas-platform-foundation/contracts/`; o
  contrato da fatia local ativa vive em `specs/002-mvp-local-first-slice/contracts/`.

## Segurança e dados

- Nunca registrar ou incluir em fixtures dados pessoais/segredos reais.
- Não expor existência de recurso de outro tenant.
- Ações críticas incluem ator, tenant, unidade, motivo, estado anterior/posterior e correlação na auditoria.
- Credenciais ficam fora do repositório; rotação e acesso mínimo são requisitos.
- Logs, métricas e traces carregam IDs técnicos, não conteúdo sensível.
- Todo endpoint implementado deve possuir autenticação/autorização quando sensível,
  policy/guard, teste positivo, teste negativo e teste de isolamento tenant quando
  aplicável.

## Coordenação de agentes

- Só use subagentes quando o usuário pedir delegação/paralelismo.
- Atribua escopos de arquivos sem sobreposição e um resultado verificável.
- O agente principal mantém decisões transversais, resolve conflitos e faz a revisão final.
- Agentes especializados não ampliam escopo nem tomam decisões de produto por conta própria.
- Antes de concluir, rode as validações documentais disponíveis e liste riscos/pendências reais.

Os perfis carregáveis pelo Codex ficam em `.codex/agents/`; o catálogo de responsabilidades está em `docs/10-agents/roles.md`.

## Fluxo Git obrigatório

Quando o usuário autorizar commit, push e PR, toda task implementável deve seguir
este fluxo, sem atalhos:

1. Criar branch curta a partir de `development`, com prefixo `feature/`, `fix/`,
   `chore/` ou `docs/`.
2. Ao terminar a task, abrir PR da branch de trabalho para `development`.
3. Depois que o PR para `development` estiver mergeado, abrir PR
   `development -> homologation` e mergear essa promoção.
4. Depois que `homologation` receber a promoção, abrir PR
   `homologation -> main` e mergear essa promoção.

Regras adicionais:

- Nunca abrir PR de `feature/*`, `fix/*`, `chore/*` ou `docs/*` diretamente para
  `homologation` ou `main`.
- Nunca promover `development` direto para `main`.
- Promoções entre branches longas (`development -> homologation` e
  `homologation -> main`) devem usar merge commit, não squash/rebase, para preservar
  ancestralidade e evitar divergência recorrente.
- PRs de promoção devem ter título e corpo em PT-BR, citar PR de origem,
  validações executadas e escopo preservado.
- Se uma promoção conflitar por divergência histórica, fazer reparo explícito via PR,
  sem force-push e sem reescrever histórico publicado.
