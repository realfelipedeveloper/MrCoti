# Arquitetura do Mr Coti

Este diretório descreve a arquitetura alvo do **Mr Coti**, uma plataforma SaaS multi-tenant para operações de alimentação. Nesta etapa, os documentos são prescritivos: estabelecem limites, decisões e critérios para a implementação futura, sem conter código de aplicação.

## Direção arquitetural

- **Monólito modular** no backend NestJS, com módulos alinhados aos bounded contexts e fronteiras explícitas.
- **Monorepo** para backend NestJS, frontend Next.js, contratos e configurações compartilhadas.
- **DDD estratégico e tático**, Clean Architecture e integrações externas em Arquitetura Hexagonal.
- **API First**, com contratos OpenAPI versionados antes da implementação.
- **SaaS desde o domínio**, usando banco MySQL único e colunas `tenant_id` em dados tenant-aware.
- **Eventos internos** e **Outbox Pattern** para efeitos assíncronos confiáveis.
- **Redis e BullMQ** para cache e filas; filas não substituem a fonte de verdade no MySQL.
- **Segurança por padrão**, com RBAC, escopo de tenant, auditoria e negação quando o contexto estiver ausente ou inconsistente.
- **Cloud ready e AWS ready**, preservando portabilidade entre Docker Compose e serviços gerenciados AWS.
- Nenhuma tecnologia relevante fora da stack definida no SDD pode ser adotada sem ADR.

Microsserviços estão deliberadamente fora da arquitetura inicial. A extração de um módulo somente poderá ocorrer após evidência operacional e um novo ADR.

## Documentos

| Documento | Finalidade |
|---|---|
| [Mapa de contextos](./context-map.md) | Contextos, relações, responsabilidades e linguagem compartilhada |
| [Monólito modular](./modular-monolith.md) | Fronteiras, camadas, dependências e evolução do monorepo |
| [SaaS e multi-tenancy](./saas-multi-tenancy.md) | Hierarquia de tenant, isolamento, ciclo de vida e planos |
| [Feature flags](./feature-flags.md) | Avaliação por ambiente, plano e tenant, com limites e auditoria |
| [Escalabilidade](./scalability.md) | Estratégias para carga, dados, filas, cache e relatórios |
| [AWS cloud ready](./aws-cloud-ready.md) | Mapeamento da execução local para uma implantação futura na AWS |
| [Eventos e outbox](./event-driven-outbox.md) | Publicação confiável, idempotência, retries e observabilidade |
| [Integrações hexagonais](./integrations-hexagonal.md) | Portas, adaptadores e APIs fictícias de pagamentos, notas e notificações |
| [Capacidades futuras](./future-capability-map.md) | Contextos, eventos, flags e gates para V1–V3 |

Os diagramas ficam em [docs/03-uml](../03-uml/README.md) e as decisões arquiteturais em [docs/11-adr](../11-adr/README.md).

## Invariantes arquiteturais

1. Toda operação tenant-aware recebe um contexto autenticado com `tenant_id`; o identificador não é confiado quando vem apenas do corpo ou da query da requisição.
2. Consultas e mutações tenant-aware sempre aplicam o escopo do tenant e, quando cabível, de empresa e unidade.
3. Módulos não acessam tabelas de outros módulos diretamente; colaboram por contratos de aplicação ou eventos internos.
4. Regras de domínio não dependem de NestJS, Prisma, Redis, BullMQ ou provedores externos.
5. Eventos destinados a efeitos assíncronos duráveis são persistidos na outbox na mesma transação da mudança de estado.
6. Consumidores e webhooks são idempotentes, rastreáveis por `correlation-id` e seguros contra duplicidade.
7. Feature flags não concedem autorização: uma feature habilitada ainda exige RBAC e isolamento de tenant.
8. MySQL é a fonte de verdade; cache e filas podem ser reconstruídos sem perda de estado de negócio.
9. Nenhum log contém secrets, tokens, dados de pagamento ou dados pessoais além do mínimo necessário e permitido.
10. Alterações que rompam essas invariantes exigem atualização da especificação e ADR.

## Critério de prontidão arquitetural

Uma funcionalidade está pronta para planejamento de implementação quando possui contexto de domínio, regra de tenancy, autorização, contrato de API quando aplicável, eventos e idempotência, requisitos de auditoria, estratégia de teste e impacto operacional definidos.
