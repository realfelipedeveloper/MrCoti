# ADR-0001 — Estilo arquitetural

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** Monólito modular

## Contexto

O **Mr Coti** é uma plataforma SaaS greenfield que precisa evoluir rapidamente, manter consistência em pedidos e financeiro e suportar centenas ou milhares de tenants. O domínio é amplo, mas a equipe e a carga real ainda não justificam a complexidade de sistemas distribuídos. O SDD determina que a arquitetura inicial não use microsserviços.

O sistema precisa preservar fronteiras que permitam evolução futura, integrar pagamentos/notas/notificações, processar eventos internos e operar localmente em Docker com caminho para AWS.

## Drivers

- simplicidade de desenvolvimento, teste, deploy e operação;
- menor custo inicial e menor superfície de falhas de rede;
- consistência transacional no MySQL;
- velocidade de entrega do MVP e evolução incremental;
- isolamento conceitual dos bounded contexts;
- capacidade de escalar horizontalmente sem reescrita estrutural;
- extração futura possível, porém guiada por evidência.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Monólito modular | Operação simples, transações locais, baixo custo e limites lógicos | Disciplina de módulos é obrigatória; deploy ainda é conjunto |
| Microsserviços desde o início | Escala/deploy independentes em teoria | Rede, consistência eventual, contratos e observabilidade prematuros; custo alto |
| Monólito sem fronteiras explícitas | Início aparentemente rápido | Forte acoplamento, ownership difuso e evolução arriscada |

## Decisão

Adotar um **monólito modular** em NestJS, organizado por bounded contexts e um único backend implantável. Cada módulo aplica DDD estratégico/tático, dependências inspiradas em Clean Architecture e expõe contratos de aplicação explícitos. Integrações externas usam Arquitetura Hexagonal.

O domínio não depende de NestJS, Prisma, Redis, BullMQ ou providers. Módulos não acessam tabelas ou classes privadas de outros módulos. Colaborações usam fachadas de aplicação ou eventos internos versionados. Efeitos assíncronos duráveis usam Domain Events, eventos de integração e Outbox Pattern.

API e workers podem executar como processos/containers distintos do mesmo monorepo e base modular para escalar workloads, sem converter cada módulo em serviço.

## Consequências

### Positivas

- deploy, depuração e testes ponta a ponta mais simples;
- transações locais para invariantes críticas;
- refatoração de fronteiras com baixo custo de rede;
- desenvolvimento coordenado e menor custo de infraestrutura;
- caminho para replicação horizontal de API/workers.

### Negativas

- uma release implanta o backend como unidade;
- falhas de isolamento de código podem criar acoplamento se não forem verificadas;
- workloads extremos compartilham o mesmo artefato e banco inicialmente;
- extração futura exigirá contratos, migração de dados e operação distribuída.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Monólito virar “big ball of mud” | Ownership por módulo, fachadas públicas, revisão e futuros testes de arquitetura |
| Dependências cíclicas | Eventos, portas e revisão do ownership do conceito |
| Workload assíncrono afetar API | Workers BullMQ separados, limites de concorrência e backpressure |
| Banco compartilhado gerar acoplamento | Ownership lógico de tabelas e proibição de acesso cruzado |
| Extração prematura por preferência técnica | Exigir métricas, critérios e novo ADR |

## Gatilhos de revisão

- um módulo precisar de disponibilidade ou escala independente comprovada por métricas;
- equipes autônomas terem cadências de release incompatíveis;
- blast radius do backend não ser controlável por isolamento de processo e feature flags;
- requisitos regulatórios exigirem isolamento físico de um contexto;
- limites do banco compartilhado persistirem após otimização, leitura especializada e arquivamento;
- custo operacional de manter o monólito superar, com evidência, o custo de distribuição.
