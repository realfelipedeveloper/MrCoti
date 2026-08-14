# Modelo de dados conceitual — MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Feature:** `002-mvp-local-first-slice`  
**Data:** 2026-06-26  
**Estado:** modelo conceitual para implementação futura

## Regras globais

- Toda entidade operacional possui `tenant_id`, exceto entidades explicitamente
  globais de plataforma.
- IDs são opacos e não carregam autoridade.
- `tenant_id` do payload nunca define escopo; o escopo vem de autenticação/membership.
- Valores monetários são inteiros em centavos.
- Dados de demonstração são sintéticos.
- Exclusões operacionais preferem estado/soft delete auditável quando houver histórico.

## Entidades

| Entidade | Owner | Escopo | Campos principais | Observações |
| --- | --- | --- | --- | --- |
| `IdentityUser` | IAM | global | id, display_name, email_sintetico, password_hash, status | usuário sintético; sem PII real |
| `Tenant` | Plataforma SaaS | global | id, name, status, plan_code | tenant de demonstração |
| `Company` | Organização | tenant | id, tenant_id, name, status | empresa do tenant |
| `Unit` | Organização | tenant | id, tenant_id, company_id, name, status | unidade operacional |
| `Membership` | IAM | tenant | id, tenant_id, user_id, status | vínculo usuário-tenant |
| `RoleAssignment` | IAM | tenant/unidade | id, tenant_id, membership_id, role, unit_id? | RBAC mínimo |
| `Category` | Catálogo | tenant/unidade | id, tenant_id, unit_id, name, status, sort_order | agrupamento de produtos |
| `Product` | Catálogo | tenant/unidade | id, tenant_id, unit_id, category_id, name, price_cents, status | preço vigente |
| `RestaurantTable` | Operação | tenant/unidade | id, tenant_id, unit_id, code, status | mesa física/lógica |
| `Tab` | Operação | tenant/unidade | id, tenant_id, unit_id, table_id, status, opened_by, closed_at | comanda |
| `OrderItem` | Operação | tenant/unidade | id, tenant_id, tab_id, product_id, snapshot, quantity, unit_price_cents, status | item lançado |
| `Bill` | Operação | tenant/unidade | id, tenant_id, tab_id, subtotal_cents, discount_cents, service_fee_cents, total_cents, paid_cents, status | resumo conciliável |
| `FakePayment` | Pagamentos Fake | tenant/unidade | id, tenant_id, bill_id, amount_cents, method, status, scenario | sem gateway real |
| `IdempotencyRecord` | Plataforma/API | tenant | key, route, payload_hash, response_ref, status, expires_at | por tenant e operação |
| `AuditEntry` | Governança | tenant | id, tenant_id, actor_id, action, resource, before_ref, after_ref, reason, correlation_id | append-only no fluxo normal |
| `OutboxEvent` | Plataforma/Eventos | tenant | id, tenant_id, type, version, payload, status, occurred_at | publicação futura idempotente |

## Estados

### `RestaurantTable`

```text
AVAILABLE -> OCCUPIED
AVAILABLE -> BLOCKED
OCCUPIED -> AVAILABLE
BLOCKED -> AVAILABLE
```

Transições exigem tenant/unidade, ator autorizado e auditoria.

### `Tab`

```text
OPEN -> CLOSING -> CLOSED
OPEN -> CANCELLED
CLOSING -> OPEN    # somente falha recuperável no fechamento
CLOSING -> CLOSED
```

Não é permitido adicionar item em `CLOSING`, `CLOSED` ou `CANCELLED`.

### `OrderItem`

```text
ACTIVE -> CANCELLED
```

Cancelamento exige motivo e permissão. Item cancelado permanece no histórico e não
compõe total ativo, salvo se a regra de relatório futuro decidir exibir bruto/líquido.

### `Bill`

```text
DRAFT -> PAYMENT_PENDING -> PAID -> CLOSED
PAYMENT_PENDING -> PAYMENT_FAILED
PAYMENT_FAILED -> PAYMENT_PENDING
```

`CLOSED` exige `paid_cents == total_cents` nesta fatia.

### `FakePayment`

```text
REQUESTED -> APPROVED -> RECORDED
REQUESTED -> DECLINED
REQUESTED -> FAILED
```

Estados são simulados. Não há autorização financeira real.

## Invariantes

- `Bill.total_cents = subtotal_cents - discount_cents + service_fee_cents`.
- `Bill.total_cents >= 0`.
- `Bill.paid_cents <= Bill.total_cents` até fechamento; no fechamento desta fatia,
  `paid_cents == total_cents`.
- `OrderItem.unit_price_cents` vem do snapshot no momento da inclusão.
- Uma mesa não pode ter mais de uma comanda `OPEN`/`CLOSING` ao mesmo tempo.
- Um fechamento idempotente não pode criar dois `Bill`/`FakePayment` efetivos para a
  mesma comanda.
- Toda leitura/mutação operacional inclui `tenant_id` e, quando aplicável, `unit_id`.

## Eventos de domínio/outbox

| Evento | Quando ocorre | Payload mínimo | Consumidores futuros |
| --- | --- | --- | --- |
| `TabOpened.v1` | comanda aberta | tenant_id, unit_id, tab_id, table_id, actor_id | auditoria, relatório |
| `OrderItemAdded.v1` | item ativo lançado | tenant_id, tab_id, item_id, product_id, quantity, unit_price_cents | cozinha futura, relatório |
| `BillClosed.v1` | conta fechada | tenant_id, tab_id, bill_id, total_cents, paid_cents | caixa/relatório futuro |
| `FakePaymentRecorded.v1` | pagamento fake registrado | tenant_id, bill_id, payment_id, amount_cents, method | relatório, integrações fake futuras |

Payloads não carregam segredo, token, senha, documento pessoal ou dado financeiro
real.

## Índices e constraints conceituais

- `Tenant.status`.
- `Membership(tenant_id, user_id)` único.
- `RoleAssignment(tenant_id, membership_id, role, unit_id)`.
- `Category(tenant_id, unit_id, name)` único para ativos.
- `Product(tenant_id, unit_id, category_id, status)`.
- `RestaurantTable(tenant_id, unit_id, code)` único.
- `Tab(tenant_id, unit_id, table_id, status)` com proteção para uma comanda ativa.
- `OrderItem(tenant_id, tab_id, status)`.
- `IdempotencyRecord(tenant_id, route, key)` único.
- `AuditEntry(tenant_id, occurred_at, action)`.
- `OutboxEvent(status, occurred_at)` e `OutboxEvent(tenant_id, type, occurred_at)`.

## Dados sintéticos sugeridos

- Tenant: `tenant-demo-bistro`.
- Unidade: `Bistrô Demo Local`.
- Usuários: `owner.demo@mrcoti.local`, `waiter.demo@mrcoti.local`,
  `cashier.demo@mrcoti.local`.
- Categorias: Bebidas, Pratos, Sobremesas.
- Produtos: Café, Suco, Sanduíche, Bolo.

Esses valores são exemplos sintéticos e não representam pessoa, empresa ou cliente
real.
