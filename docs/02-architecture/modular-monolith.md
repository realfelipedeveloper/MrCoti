# Monólito modular e monorepo

O **Mr Coti** começa como um monólito modular: um backend implantável, com módulos de domínio isolados, acompanhado pelo frontend e artefatos compartilhados em um monorepo. A decisão privilegia consistência transacional, velocidade de evolução, custo operacional menor e observabilidade simples.

Esta decisão é reforçada pela diretriz portfolio local-first, commercial SaaS-ready:
o produto deve ser simples para rodar localmente, sério o suficiente para escalar e
modular o suficiente para extração futura quando houver evidência objetiva.

## Topologia lógica

O monorepo deverá acomodar, quando a implementação for autorizada:

- aplicação web em Next.js;
- API backend em NestJS;
- módulos de domínio e aplicação organizados por bounded context;
- contratos OpenAPI, tipos realmente compartilháveis e configurações de qualidade;
- testes unitários, de integração, de contrato e ponta a ponta;
- infraestrutura local Docker Compose e descritores de pipeline.

Isto é uma orientação, não autorização para criar aplicações nesta etapa documental. A estrutura física final deve ser confirmada pelo plano de implementação.

## Camadas por módulo

Cada módulo segue dependências voltadas para dentro:

| Camada | Conteúdo | Pode depender de |
|---|---|---|
| **Domínio** | Agregados, entidades, value objects, serviços de domínio, políticas, eventos e interfaces de repositório | Apenas linguagem e tipos do próprio domínio |
| **Aplicação** | Casos de uso, comandos, queries, DTOs internos, autorização contextual e coordenação transacional | Domínio e portas publicadas |
| **Adaptadores de entrada** | Controllers REST, validação, autenticação, guards e mapeamento OpenAPI | Aplicação; nunca regras persistentes próprias |
| **Adaptadores de saída** | Prisma, Redis, BullMQ, providers fake e clientes externos | Portas do domínio/aplicação e infraestrutura autorizada |

DTOs de transporte não são entidades de domínio. Modelos Prisma não atravessam a fronteira do adaptador de persistência.

## Fronteiras modulares

- Cada bounded context tem uma API interna explícita e ownership de suas tabelas.
- Importações internas devem apontar para a fachada pública do módulo, não para arquivos privados.
- O acesso ao banco de outro módulo, inclusive por Prisma, é proibido.
- Colaboração síncrona é aceita quando curta, local e necessária à resposta; efeitos desacopláveis usam eventos.
- Dependências cíclicas são defeitos arquiteturais e devem ser removidas por contrato, evento ou redefinição de ownership.
- Tarefas BullMQ chamam casos de uso; regras de negócio não residem em processors de fila.

## Transações e consistência

Mudanças dentro de um agregado são atômicas. Quando um fato precisa acionar outro módulo, a transação persiste a alteração e um registro de outbox; o processamento posterior é ao menos uma vez e exige idempotência. Não se prometem transações distribuídas.

Para respostas síncronas, o módulo chamador controla o caso de uso e traduz falhas do módulo colaborador. Para fluxos assíncronos, o estado visível deve distinguir `pendente`, `processando`, `concluído` e `falhou`, quando esses estados forem relevantes ao usuário.

## Aplicação das regras SaaS

O contexto de requisição carrega identidade, `tenant_id`, papéis, permissões, unidade e identificadores de rastreio. Guards validam autenticação e autorização; repositórios reforçam o filtro de tenant. Essa defesa em profundidade evita que um controller esquecido produza vazamento entre tenants.

Jobs e consumidores não herdam um contexto HTTP: sua mensagem contém o `tenant_id` e identificadores mínimos, que são revalidados antes do uso.

## Evolução sem microsserviços prematuros

O desenho mantém limites extraíveis, mas não otimiza antecipadamente para distribuição. Um módulo só é candidato à extração quando houver, de forma mensurada:

- necessidade de escalabilidade ou disponibilidade independente;
- cadência de mudança incompatível com o restante;
- ownership por equipe autônoma;
- fronteira de dados e contratos madura;
- benefício superior ao custo de consistência eventual, rede, observabilidade e operação.

Qualquer extração requer novo ADR, plano de migração e testes de contrato. Até lá, os módulos permanecem no mesmo processo e no mesmo banco, respeitando ownership lógico.

### Evidência mínima para propor extração

A proposta deve apresentar baseline e período de observação, SLO/erro atribuível ao módulo, perfil de CPU/memória/I/O/fila, carga atual e projetada, frequência de deploy, incidentes, dependências transacionais e custo total comparando permanecer versus distribuir. Deve demonstrar que otimização interna, réplica do monólito, isolamento de worker/fila, índice/cache ou read model foram testados e insuficientes. Sem números reproduzíveis e benefício líquido após custo de rede, consistência, operação e equipe, o ADR de extração é rejeitado.

## Verificação de conformidade

Revisões arquiteturais devem procurar importações privadas entre módulos, acesso cruzado a tabelas, regras em controllers/processors, ausência de `tenant_id`, eventos sem versionamento e efeitos externos dentro da transação principal. Testes de arquitetura poderão automatizar essas restrições quando houver código.

Decisões relacionadas: [ADR-0001](../11-adr/ADR-0001-architecture-style.md) e [ADR-0002](../11-adr/ADR-0002-monorepo-or-multirepo.md).
Decisão complementar: [ADR-0017](../11-adr/ADR-0017-portfolio-local-first-saas-ready.md).
