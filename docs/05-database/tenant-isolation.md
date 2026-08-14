# Isolamento multi-tenant

## Regra estrutural

Dados de negócio compartilhados carregam `tenant_id NOT NULL`. Uniques são compostos com tenant; relações devem incluir/validar a mesma fronteira. Entidades globais (por exemplo, catálogo técnico de features) são explicitamente allowlisted.

## Defesa em profundidade

1. Resolver tenant confiável da autenticação/domínio.
2. Validar vínculo e estado do tenant.
3. Propagar `TenantContext` imutável pela requisição/job.
4. Repositórios exigem tenant; não oferecem busca tenant-aware por ID isolado.
5. Escritas validam que referências pertencem ao mesmo tenant.
6. Cache keys, locks, idempotência, outbox e métricas incluem tenant quando aplicável.
7. Testes automatizados tentam IDOR e acesso cruzado em cada padrão de endpoint.

Jobs globais iteram tenants de forma explícita, com checkpoint e limites; não executam consultas sem escopo acidentalmente. Suporte usa acesso just-in-time, motivo, expiração e auditoria.

## Migração futura

Tenants de alta exigência poderão migrar para shard/banco dedicado se métricas e contrato justificarem. IDs globais, abstração de repositório, ausência de joins cross-tenant e pipelines de export/import reduzem o custo dessa evolução.
