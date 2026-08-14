# ADR-0004 — Modelo de multi-tenancy

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** Single Database + `tenant_id`

## Contexto

O **Mr Coti** precisa nascer SaaS, suportar múltiplos tenants, empresas, unidades, planos e milhares de clientes, mantendo custo e operação adequados ao estágio inicial. O SDD solicita comparação entre database por tenant, schema por tenant e coluna `tenant_id`, com preferência pelo banco compartilhado.

O modelo precisa equilibrar isolamento, manutenção, backups, migrations e caminho de escala/migração futura.

## Drivers

- custo eficiente para muitos tenants pequenos e médios;
- provisionamento rápido e uniforme;
- migrations e observabilidade centralizadas;
- uso eficiente de conexões e infraestrutura;
- consultas e relatórios operacionais tenant-scoped;
- backup/restauração operacionalmente viáveis;
- possibilidade futura de mover tenants excepcionais.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Database por tenant | Isolamento físico e restauração individual mais direta | Alto custo, muitas conexões/migrations e operação complexa em larga quantidade |
| Schema por tenant | Isolamento lógico maior que coluna | Gestão de milhares de schemas, migrations e suporte limitado do modelo/tooling escolhido |
| Single Database + `tenant_id` | Custo, pooling, migrations e operação simples | Isolamento depende de controles rigorosos; restore por tenant é lógico |

## Decisão

Adotar **um banco MySQL compartilhado com `tenant_id` obrigatório** em toda tabela de domínio tenant-aware. Tenant é a fronteira comercial e de segurança; empresas e unidades pertencem a um tenant.

O contexto autenticado fornece o tenant efetivo. Repositórios sempre recebem o contexto, filtram leituras e mutações e validam relações no mesmo tenant. Índices, chaves únicas, cache keys, jobs, eventos, arquivos, auditoria e logs operacionais preservam o tenant. Ausência ou inconsistência resulta em falha fechada.

Tabelas realmente globais devem ser explicitamente classificadas e não podem conter dados operacionais de clientes. Acesso de suporte entre tenants exige permissão especial, motivo e auditoria.

## Consequências

### Positivas

- custo e utilização de infraestrutura eficientes;
- onboarding sem criação de banco/schema;
- migrations, monitoramento e backup físico centralizados;
- pool de conexões administrável;
- modelo adequado a centenas ou milhares de tenants.

### Negativas

- uma consulta sem filtro pode causar incidente grave;
- noisy neighbor precisa de limites e monitoramento;
- restauração/exportação de um tenant exige tooling lógico;
- requisitos futuros de isolamento dedicado exigirão migração.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| IDOR ou vazamento cross-tenant | Contexto autenticado, filtro no repositório, RBAC e testes negativos |
| Relação cruzada entre tenants | Validação e constraints/índices compostos quando aplicáveis |
| Tenant ruidoso | Limites por plano, rate limiting, quotas de fila e observabilidade |
| Cache/job sem escopo | Namespace e envelope obrigatórios com ambiente + `tenant_id` |
| Restore individual difícil | Exportação/restauração lógica testada e trilha de auditoria |
| Migração futura complexa | IDs estáveis, ownership de dados e resolvedor de localização como evolução planejada |

## Gatilhos de revisão

- obrigação contratual/regulatória exigir banco dedicado;
- tenant excepcional comprometer capacidade apesar de quotas e otimização;
- restore/backup individual se tornar requisito frequente com RTO incompatível;
- escala do banco ultrapassar limites após índices, arquivamento e leitura otimizada;
- residência de dados ou multi-região exigir localização física por tenant;
- risco residual de isolamento superar a tolerância definida pelo produto.
