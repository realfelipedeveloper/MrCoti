# Arquitetura SaaS e multi-tenancy

O **Mr Coti** não é um sistema single-company adaptado: tenant, plano, ciclo de vida e isolamento são conceitos centrais. A estratégia inicial é **Single Database + `tenant_id`**, conforme [ADR-0004](../11-adr/ADR-0004-multi-tenancy-model.md).

## Hierarquia de tenancy

```text
Tenant (fronteira comercial, segurança e assinatura)
└── Empresa (entidade legal ou grupo operacional)
    └── Unidade (restaurante, loja, cozinha ou ponto operacional)
        └── Dados operacionais por unidade quando aplicável
```

Um tenant pode possuir várias empresas e unidades. Usuários se vinculam ao tenant e recebem escopos de empresa/unidade por cargo ou atribuição. Registros globais existem apenas quando explicitamente modelados, como catálogo técnico de features; nunca carregam dados operacionais de clientes.

## Regras de isolamento

1. Toda tabela de domínio tenant-aware contém `tenant_id` obrigatório e imutável após a criação.
2. Chaves únicas tenant-aware incluem `tenant_id`, por exemplo `(tenant_id, external_id)`.
3. Relações entre registros tenant-aware incluem verificação de tenant; não basta que ambos os IDs existam.
4. O `tenant_id` efetivo vem da identidade/sessão validada ou do envelope confiável de um job, nunca apenas de entrada controlada pelo cliente.
5. Repositórios recebem `TenantContext` obrigatório e sempre filtram leituras, atualizações e exclusões.
6. Operações em lote, exportações, relatórios, cache, filas, arquivos e logs também preservam o escopo.
7. Acesso administrativo entre tenants é excepcional, auditado, com autorização específica e sem impersonação silenciosa.
8. Falha na resolução de tenant resulta em negação, não em consulta sem filtro.

Índices começam por `tenant_id` quando o padrão de acesso é tenant-scoped. Identificadores internos não são considerados segredo nem controle de acesso; a proteção contra IDOR depende do escopo e da autorização.

## Resolução do contexto

Após autenticar o token, a API valida a sessão, o tenant ativo, a associação do usuário e os escopos permitidos. O contexto resultante contém, no mínimo, `tenant_id`, `user_id`, papéis/permissões, unidade quando necessária, `correlation_id` e `request_id`. O domínio recebe apenas os atributos necessários ao caso de uso.

Cache keys e job IDs recebem namespace por ambiente e tenant. Eventos sempre carregam `tenant_id`, versão do schema, ID do evento, instante e correlation ID. Dados pessoais desnecessários não são copiados para eventos.

## Ciclo de vida do tenant

| Estado | Comportamento |
|---|---|
| `provisioning` | Cria metadados, plano inicial, administrador e configurações; operação ainda indisponível |
| `active` | Uso conforme plano, limites, features e permissões |
| `suspended` | Bloqueia mutações de negócio e novos logins conforme política; preserva dados e permite rotinas administrativas autorizadas |
| `cancelling` | Executa política de exportação, retenção e encerramento de integrações |
| `cancelled` | Acesso operacional encerrado; dados seguem retenção e requisitos legais |

Provisionamento e mudanças de estado são idempotentes e auditados. Falhas parciais ficam retomáveis, sem criar um segundo tenant. Reativação, exclusão e anonimização futuras devem respeitar LGPD e obrigações legais.

## Planos, assinatura, limites e billing futuro

- O Core SaaS é proprietário de plano, assinatura, entitlement e limite.
- O acesso a uma capacidade exige: tenant ativo, feature disponível no ambiente, entitlement do plano, override do tenant quando permitido, limite não excedido e autorização RBAC.
- Limites devem possuir unidade e janela claras, como usuários ativos, unidades, pedidos por mês ou armazenamento.
- Upgrade pode liberar capacidade imediatamente; downgrade exige política para recursos acima do novo limite, sem perda silenciosa.
- Billing futuro consome fatos de uso idempotentes e não acopla os agregados operacionais a um provedor financeiro.
- Módulos premium e marketplace futuro usam o mesmo mecanismo de entitlement e feature flags.

## Backup, restauração e portabilidade

O backup físico inicial cobre o banco compartilhado. Exportações e restaurações lógicas por tenant exigem ferramentas tenant-aware, validação de integridade e auditoria. Toda restauração deve impedir colisão de identificadores e referências cruzadas. Testes periódicos de restauração são obrigatórios antes de produção.

Arquivos futuros em armazenamento de objetos devem usar namespace de tenant e políticas coerentes com o banco. Secrets de integração nunca ficam em campos comuns sem proteção e controle de acesso.

## Caminho de escala e migração

O banco compartilhado suporta centenas ou milhares de tenants com índices, paginação, arquivamento e observabilidade. Caso tenants específicos exijam isolamento ou capacidade dedicada, a arquitetura deve permitir um resolvedor de localização de dados e migração por tenant. Essa evolução não é automática: requer evidência, ADR, tooling e plano de consistência.

Veja também [tenant-domain.puml](../03-uml/tenant-domain.puml) e [feature-flags.md](./feature-flags.md).
