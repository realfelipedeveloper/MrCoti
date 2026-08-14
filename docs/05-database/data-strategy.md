# Estratégia de dados

## Plataforma

MySQL 8+ com Prisma, inicialmente em banco único e `tenant_id`. Redis não é fonte de verdade: cache, rate limit, locks cuidadosamente delimitados e BullMQ. Objetos/binários futuros usam abstração compatível com S3; metadados permanecem no banco.

## Ownership

Cada bounded context governa suas tabelas e expõe portas/serviços. Relações internas podem usar chaves estrangeiras; entre contextos, referências por ID e validação de aplicação evitam acoplamento estrutural. Relatórios usam projeções/read models em vez de consultas transacionais irrestritas.

## Convenções planejadas

- IDs não sequenciais externamente; estratégia final documentada antes da migration inicial.
- `tenant_id` obrigatório em dados tenant-aware e primeiro componente de índices/uniques relevantes.
- `created_at`, `updated_at` e versão otimista quando concorrência importar.
- Valores monetários em decimal de precisão definida + moeda; nunca float.
- Datas operacionais em UTC e timezone IANA configurado na unidade para exibição/cortes.
- Soft delete somente onde houver requisito; não é substituto de histórico/auditoria.

## Evolução

Migrations são forward-only, revisadas e testadas contra cópia representativa. Mudanças destrutivas usam expand/migrate/contract. Backfills são retomáveis, observáveis e limitados por lote.

## Volume

Pedidos, auditoria, outbox, webhooks e logs têm crescimento monitorado. Índices partem de padrões de consulta. Particionamento/arquivamento só entra com evidência, ADR e testes; não será otimização prematura.
