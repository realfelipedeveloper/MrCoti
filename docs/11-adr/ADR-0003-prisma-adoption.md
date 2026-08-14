# ADR-0003 — Adoção do Prisma ORM

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** Prisma ORM com MySQL 8+

## Contexto

O SDD do **Mr Coti** aprova explicitamente Prisma ORM para o backend NestJS/TypeScript e MySQL. A persistência precisa reforçar multi-tenancy, transações, migrations revisáveis, índices para grande volume e separação entre domínio e infraestrutura.

O ORM não pode se tornar o modelo de domínio nem ocultar necessidades de performance e integridade do banco.

## Drivers

- tipagem e produtividade no ecossistema TypeScript;
- suporte ao MySQL 8+ e a transações;
- schema e migrations versionados;
- onboarding e experiência de desenvolvimento consistentes;
- integração testável com repositórios por módulo;
- observabilidade e revisão de queries críticas;
- decisão já aprovada pelo SDD.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Prisma ORM | Tipagem, tooling, schema explícito e migrations | Abstração pode gerar queries inadequadas; exige mapeamento de domínio |
| SQL manual como padrão | Controle completo | Mais repetição, mapeamento e risco de inconsistência na equipe |
| Outro ORM | Pode oferecer padrões diferentes | Fora da decisão aprovada e adiciona avaliação/tecnologia sem benefício demonstrado |

## Decisão

Adotar Prisma como adaptador padrão de persistência para MySQL 8+. Cada bounded context mantém repositórios e mapeadores próprios. Tipos e modelos Prisma não atravessam a camada de infraestrutura e não são usados como entidades de domínio ou DTOs públicos.

Toda operação tenant-aware passa `tenant_id` explicitamente e aplica o filtro no repositório. Restrições e índices no MySQL reforçam integridade, inclusive unicidade composta por tenant. Transações têm escopo curto e não incluem chamadas externas. Migrations são versionadas, revisadas e executadas em etapa controlada do pipeline.

SQL específico poderá ser usado pelo adaptador quando uma consulta crítica não for expressável ou eficiente no Prisma, com parâmetros seguros, teste de integração, escopo de tenant e justificativa documentada. Isso não altera o ORM padrão.

## Consequências

### Positivas

- acesso ao banco tipado e consistente;
- schema central versionado e reproduzível;
- produtividade para CRUD e transações comuns;
- menor acoplamento a SQL espalhado pela aplicação;
- testes de repositório podem validar tenancy e mapeamento.

### Negativas

- camada de mapeamento entre persistência e domínio é necessária;
- queries geradas precisam de inspeção em caminhos quentes;
- algumas capacidades do MySQL podem exigir SQL específico;
- mudanças de schema exigem disciplina de deploy compatível.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Vazamento entre tenants | Repositórios com `TenantContext`, filtros obrigatórios e testes negativos |
| N+1/queries lentas | Métricas, explain plan, seleção de campos e índices orientados a acesso |
| Models Prisma contaminarem domínio | Mapeadores e proibição de imports Prisma fora dos adaptadores |
| Migration bloquear produção | Expand/contract, revisão, teste com volume e execução única |
| Recurso do ORM insuficiente | SQL parametrizado localizado e testado; ADR se surgir nova tecnologia |

## Gatilhos de revisão

- Prisma não suportar requisito crítico do MySQL ou padrão de consulta sem workaround seguro;
- performance permanecer insuficiente após índices, modelagem e SQL localizado;
- migrations não atenderem estratégia de disponibilidade requerida;
- mudança de banco ser aprovada por novo ADR;
- vulnerabilidade ou descontinuação tornar o uso incompatível com o risco do produto.
