# Matriz RBAC inicial do MVP

> Esta visão compacta é informativa. A matriz canônica ator × comando × recurso ×
> escopo × condição está em [`../18-governance/rbac-matrix-mvp.md`](../18-governance/rbac-matrix-mvp.md) e foi aprovada com condições em CHK046.

Esta matriz é baseline para especificação e testes. Papéis customizados podem agrupar permissões, mas não ultrapassar o escopo de quem os concede. `Platform Admin` não recebe acesso operacional implícito.

Legenda: **A** executa; **R** lê; **—** negado. Policies ainda verificam tenant ativo, unidade, entitlement/flag, estado e propriedade.

| Permissão/comando crítico | Platform Admin | Tenant Owner | Company Admin | Unit Manager | Waiter | Cashier | Kitchen | Inventory | Finance | Auditor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `saas.tenant.provision/suspend` | A | — | — | — | — | — | — | — | — | R |
| `saas.subscription.change` | — | A | — | — | — | — | — | — | R | R |
| `organization.company.manage` | — | A | A | — | — | — | — | — | — | R |
| `organization.unit.manage` | — | A | A | A | — | — | — | — | — | R |
| `identity.membership.manage` | — | A | A | A* | — | — | — | — | — | R |
| `identity.role.assign` | — | A | A* | A* | — | — | — | — | — | R |
| `catalog.product.manage` | — | A | A | A | R | R | R | R | R | R |
| `operation.table.manage` | — | R | R | A | A | A | R | — | — | R |
| `operation.tab.open/order` | — | R | R | A | A | A | R | — | — | R |
| `operation.order.cancel` | — | R | R | A | A* | A | — | — | — | R |
| `operation.tab.reopen` | — | R | R | A | — | A* | — | — | — | R |
| `operation.bill.close/split` | — | R | R | A | — | A | — | — | R | R |
| `finance.payment.capture` | — | R | R | A* | — | A | — | — | A | R |
| `finance.payment.refund` | — | R | R | A* | — | A* | — | — | A | R |
| `integration.invoice.issue/cancel` | — | R | R | A* | — | A | — | — | A | R |
| `integration.notification.send` | — | A | A | A | — | — | — | — | — | R |
| `audit.activity.read` | — | A | A* | A* | — | — | — | — | R* | R |
| `privacy.customer.export/anonymize` | — | A | A* | — | — | — | — | — | — | R |
| `platform.feature.kill-switch` | A | — | — | — | — | — | — | — | — | R |
| `saas.tenant.feature-override` | A* | A* | — | — | — | — | — | — | — | R |

`A*` exige escopo inferior ao ator, permissão separada, motivo, possível step-up/aprovação e auditoria. Um gerente nunca atribui privilégio superior ao próprio.

## Regras de decisão

1. Permissão é avaliada no backend e ligada a membership vigente.
2. O recurso é buscado dentro do `TenantContext`; ID alheio recebe resposta não enumerável.
3. Escopo de empresa/unidade restringe a matriz; “A” não significa todas as unidades.
4. Suspensão, kill switch ou falta de entitlement nega mesmo com RBAC positivo.
5. Cancelar, reabrir, estornar, alterar plano/flag/permissão, exportar e anonimizar exigem motivo/auditoria.
6. Suporte usa concessão just-in-time com expiração, nunca Platform Admin genérico.

Produto e Segurança ratificaram esta baseline com condições em 2026-06-26. Toda rota
sensível futura deve implementar autenticação, autorização, policy/guard e testes
positivos/negativos/isolamento tenant quando aplicável.
