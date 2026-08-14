# Constituição do Mr Coti

<!--
Registro de mudança
- Versão anterior: 1.1.0
- Versão atual: 1.1.1
- Princípios adicionados: I a IX
- Princípios removidos: nenhum
- Princípios ampliados: nenhum
- Esclarecimentos: aprovação por papel de governança; uma pessoa pode exercer múltiplos papéis na fase solo
- Modelos sincronizados nesta ratificação:
  - .specify/templates/constitution-template.md
  - .specify/templates/spec-template.md
  - .specify/templates/plan-template.md
  - .specify/templates/tasks-template.md
  - .specify/templates/checklist-template.md
-->

## Princípios fundamentais

### I. A especificação é a fonte da verdade

Toda mudança do Mr Coti DEVE começar por uma especificação versionada, revisável e
rastreável antes de qualquer implementação. A especificação DEVE declarar problema,
escopo, histórias priorizadas, requisitos identificáveis, critérios mensuráveis,
premissas, dependências e itens fora de escopo. Plano, contratos, modelo de dados,
tarefas, testes e código DEVEM referenciar os requisitos que realizam. Uma decisão
que altere comportamento, limites, segurança, dados ou operação NÃO PODE existir
somente no código ou em comunicação informal.

**Motivo:** o Mr Coti adota Spec-Driven Development e GitHub Spec Kit para reduzir
ambiguidade, impedir divergência entre produto e engenharia e preservar decisões ao
longo de anos de evolução.

### II. SaaS e isolamento de tenants desde a concepção

O Mr Coti DEVE ser modelado como plataforma SaaS, nunca como sistema de uma única
empresa. Identidade de tenant, empresas, unidades, usuários, planos, assinaturas,
limites, estados de ciclo de vida e feature flags DEVEM ser conceitos explícitos.
Toda informação de domínio sujeita a isolamento DEVE ser tenant-aware. Autorização,
consultas, comandos, eventos, cache, filas, arquivos, logs e métricas DEVEM preservar
o contexto do tenant e impedir acesso cruzado, inclusive por IDOR. O modelo inicial
adotado é banco único com `tenant_id`; qualquer exceção ou migração de estratégia
EXIGE ADR, análise de isolamento e plano de migração.

**Motivo:** isolamento e ciclo de vida SaaS são propriedades estruturais que não
podem ser acrescentadas com segurança no fim do desenvolvimento.

### III. Segurança, privacidade e governança por padrão

Nenhuma rota sensível do Mr Coti PODE operar sem autenticação e autorização
compatíveis com o risco. Toda especificação DEVE analisar OWASP Top 10, RBAC,
validação de entrada, IDOR, abuso, rate limiting, força bruta, CORS, proteção de
secrets e minimização de dados. Operações críticas DEVEM gerar auditoria imutável e
correlacionável, sem registrar credenciais, tokens, dados de pagamento ou dados
pessoais desnecessários. Consentimento LGPD, retenção, exportação, restauração,
anonimização futura e trilha histórica DEVEM ser planejados antes da implementação.
SAST, análise de dependências e varredura de imagens DEVEM compor os gates de CI.

**Motivo:** confiança, privacidade e isolamento são requisitos de produto, não
atividades opcionais de endurecimento posterior.

### IV. API First e integrações resilientes

Toda API pública do Mr Coti DEVE possuir contrato OpenAPI aprovado antes da
implementação. Os contratos DEVEM explicitar versão, autenticação, autorização,
paginação, filtros, ordenação, erros, exemplos, `request-id`, `correlation-id`,
idempotência e webhooks quando aplicáveis. Integrações externas DEVEM usar portas e
adaptadores, providers abstratos, timeouts, retries limitados, backoff, idempotência,
observabilidade e isolamento de falhas. Eventos internos relevantes DEVEM ser
modelados como eventos de domínio; publicação confiável DEVE considerar Outbox
Pattern. Mudanças incompatíveis EXIGEM nova versão ou estratégia de compatibilidade.

**Motivo:** os limites externos são compromissos duradouros e precisam ser testáveis,
evolutivos e independentes de fornecedores.

### V. Monólito modular com limites de domínio explícitos

A arquitetura inicial do Mr Coti DEVE ser um monólito modular, organizado por
bounded contexts e orientado por DDD estratégico e tático, Clean Architecture e
dependências apontando para o domínio. Módulos NÃO PODEM acessar diretamente as
tabelas ou detalhes internos de outros módulos; interação DEVE ocorrer por contratos
de aplicação ou eventos definidos. Entidades, value objects, aggregates,
repositórios, serviços, políticas e eventos DEVEM possuir responsabilidade clara.
Microsserviços são proibidos nesta fase e uma futura extração EXIGE ADR apoiado por
evidência operacional e limites já estabilizados.

**Motivo:** o monólito modular oferece simplicidade, baixo custo e consistência
transacional sem sacrificar a possibilidade de evolução.

### VI. Qualidade verificável e automação obrigatória

Todo requisito do Mr Coti DEVE possuir estratégia de verificação. Mudanças futuras
de código somente poderão ser aceitas com testes proporcionais ao risco: unitários,
integração, API/contrato, componente, acessibilidade e ponta a ponta. Integrações
DEVEM cobrir sucesso, falha, timeout, retry e duplicidade. Correções de defeitos DEVEM
incluir teste de regressão. O pipeline DEVE bloquear merge diante de falha em lint,
formatação, tipos, testes, build, segurança, auditoria de dependências, imagem Docker
ou validação de migração. Exceções temporárias DEVEM ter responsável, justificativa e
prazo registrados.

**Motivo:** critérios executáveis transformam intenções em garantias repetíveis.

### VII. Observabilidade e operação fazem parte do desenho

Funcionalidades do Mr Coti DEVEM definir logs estruturados, métricas, traces,
healthcheck, readiness, liveness, alertas e indicadores de sucesso antes da entrega.
Toda requisição e processamento assíncrono DEVEM propagar identificadores de
correlação e contexto de tenant de forma segura. Filas DEVEM definir retry, dead
letter, idempotência, concorrência e sinais de saturação. Objetivos de desempenho,
capacidade e disponibilidade DEVEM ser mensuráveis. Dados sensíveis NUNCA DEVEM
aparecer em telemetria.

**Motivo:** um SaaS não está pronto quando apenas funciona; ele precisa ser
diagnosticável, recuperável e operável em escala.

### VIII. Cloud-ready, portável e AWS-friendly

O Mr Coti DEVE executar localmente em Docker Compose e manter portabilidade para
serviços gerenciados AWS sem refatoração estrutural: ECS Fargate ou EKS, RDS MySQL,
ElastiCache Redis, S3, CloudFront, Route 53, CloudWatch, Secrets Manager, SES, SNS e
SQS. Processos DEVEM ser stateless sempre que possível; estado persistente DEVE
residir em serviços próprios. Configuração DEVE vir do ambiente, secrets não podem
ser versionados e armazenamento local efêmero não pode ser requisito funcional.
Portas locais DEVEM ser configuráveis e verificadas para não conflitar com serviços
`refresh` e `tasks` já existentes.

Disaster Recovery DEVE possuir runbook, restore exercitado e RPO/RTO por classe.
Custos AWS futuros DEVEM ter owner, tags, orçamento, alertas e alocação por ambiente,
módulo e driver tenant-aware sem expor PII. Otimização de custo não pode remover
controles de segurança, backup ou observabilidade essenciais.

**Motivo:** portabilidade preserva opções de implantação e reduz custo de migração.

### IX. Evolução controlada por feature flags e ADRs

Funcionalidades relevantes DEVEM poder ser habilitadas, desabilitadas ou limitadas
por tenant, plano e ambiente. Feature Flags controlam disponibilidade técnica/rollout;
Entitlements controlam direito e limite comercial; RBAC/Policies controlam o ator e
recurso. Os três controles DEVEM permanecer separados, cumulativos, tenant-aware e
com precedência determinística, fallback seguro, auditoria e kill switch. Flags não
podem substituir entitlement/autorização nem permanecer indefinidamente sem owner e
critério de remoção. Decisões arquiteturais relevantes, adoção de tecnologia fora da stack
aprovada ou alteração de princípios EXIGEM ADR com contexto, opções, consequências e
estado. A stack mandatória somente pode ser desviada por ADR aprovado.

**Motivo:** flags e ADRs permitem experimentar sem perder governança nem acumular
decisões invisíveis.

## Restrições técnicas e de produto

- O backend alvo é NestJS, TypeScript, Prisma ORM, MySQL 8+, Redis, BullMQ, Jest,
  Supertest e uma solução de testes com containers.
- O frontend alvo é Next.js com App Router, TypeScript, Tailwind CSS, React Server
  Components quando adequados, responsividade, testes de componente e Playwright.
- Infraestrutura alvo: Node.js LTS, Docker, Docker Compose e GitHub Actions.
- Qualidade alvo: ESLint, Prettier, Husky, lint-staged, Commitlint e Conventional
  Commits.
- Capacidades adicionais somente podem entrar mediante ADR. Isso inclui, entre
  outras, OpenTelemetry, Prometheus, Grafana, Loki, MinIO, Nodemailer, provedores
  falsos, Nginx, Zod e class-validator.
- As únicas APIs públicas iniciais são pagamentos fictícios, emissão fictícia de
  notas e notificações. Nenhum artefato pode sugerir processamento financeiro ou
  fiscal real.
- A ordem de evolução oficial é MVP, V1, V2 e V3; mudança de fase ou inclusão de
  escopo exige atualização da especificação e do roadmap.
- Na primeira etapa são permitidos somente especificação, arquitetura, contratos,
  UML, ADRs, loops, estratégias, planejamento e governança. É proibido criar
  aplicações, instalar dependências, executar migrações ou configurar deploy real.

## Fluxo de trabalho e gates de qualidade

Toda feature DEVE percorrer os loops de especificação, arquitetura, contrato de API,
implementação, testes, segurança, revisão, release e observabilidade. Na primeira
etapa, o loop de implementação termina no planejamento e não autoriza código.

Antes de avançar para implementação, uma feature DEVE atender a todos os gates:

1. **Gate de especificação:** histórias priorizadas, requisitos identificados,
   cenários de aceite, fora de escopo e critérios de sucesso mensuráveis.
2. **Gate constitucional:** verificação explícita de cada princípio aplicável, sem
   violações não justificadas.
3. **Gate arquitetural:** limites de contexto, dependências, modelo de tenancy,
   decisões de consistência e ADRs necessários aprovados.
4. **Gate de dados:** entidades, ownership, isolamento, invariantes, retenção,
   auditoria e migração conceitual definidos.
5. **Gate de contrato:** OpenAPI validável, exemplos, erros, idempotência e webhooks
   revisados para toda API pública afetada.
6. **Gate de qualidade e segurança:** matrizes de teste e ameaça cobrem os requisitos,
   inclusive isolamento entre tenants e cenários de falha.
7. **Gate operacional:** SLOs/SLIs, telemetria, capacidade, recuperação e rollback
   planejados.
8. **Gate de consistência:** `spec.md`, `plan.md`, `tasks.md`, pesquisa, modelo de
   dados, contratos, quickstart, checklists e documentação relacionada não se
   contradizem.
9. **Gate de aprovação:** decisões dos papéis obrigatórios de governança têm
   responsável autorizado, versão/evidência, justificativa, pendências, próxima
   revisão e estado registrados; `PENDING` nunca equivale a aprovação.

Na fase solo do Mr Coti, uma mesma pessoa PODE exercer múltiplos papéis de
governança, como Founder, Product Owner, Software Architect, Security Officer, Data
Governance, DevOps Lead, QA Lead e FinOps. Isso NÃO reduz o gate: cada papel DEVE
registrar decisão separada, versão/evidência, justificativa, pendências e próxima
revisão. Com a entrada de novos membros, revisões futuras DEVEM migrar gradualmente
para os responsáveis de cada área.

Qualquer gate rejeitado retorna o trabalho ao loop responsável. Aprovações DEVEM ser
registradas no checklist da feature. Dúvidas abertas com impacto em segurança,
isolamento, contrato público ou integridade de dados bloqueiam implementação.

## Governança

Esta constituição prevalece sobre planos, tarefas, documentação e preferências de
implementação do Mr Coti. Revisores DEVEM verificar conformidade constitucional em
toda especificação e pull request.

Emendas DEVEM:

1. descrever motivação e impacto;
2. atualizar os modelos afetados;
3. registrar plano de migração para artefatos incompatíveis;
4. obter aprovação dos responsáveis por produto, arquitetura, segurança e dados;
5. incrementar a versão por SemVer: MAJOR para remoção ou redefinição incompatível de
   princípios, MINOR para novo princípio ou expansão normativa e PATCH para
   esclarecimentos sem mudança semântica.

Conformidade DEVE ser revisada a cada ciclo de release e, no mínimo, trimestralmente.
Complexidade que contrarie um princípio somente pode ser aceita por ADR, com
justificativa, alternativas recusadas, risco, responsável e data de reavaliação.

**Versão:** 1.1.1 | **Ratificada em:** 2026-06-23 | **Última emenda:** 2026-06-25
