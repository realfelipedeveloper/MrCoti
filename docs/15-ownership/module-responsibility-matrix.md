# Matriz de responsabilidade dos módulos

R = responsável por executar; A = accountable pela decisão; C = consultado; I = informado.

| Capacidade | Core SaaS | Identity | Operations | Catalog | Inventory | Billing | Fake Pay/Invoice | Notifications | Reporting | Integrations | Observability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| provisionar/suspender tenant | A/R | C | I | I | I | C | I | I | I | I | C |
| autenticar/autorizar | C | A/R | C | C | C | C | C | C | C | C | I |
| plano/assinatura/limite | C | I | I | I | I | A/R | I | I | C | I | C |
| avaliar feature/entitlement | A/R | C | C | C | C | C | C | C | C | C | I |
| catálogo vendável | C | I | C | A/R | C | I | I | I | C | I | I |
| pedido/conta | C | C | A/R | C | I | I | C | I | C | I | C |
| estoque/compra | C | C | C | C | A/R | I | I | I | C | I | C |
| pagamento/nota fake | I | C | A | I | I | I | R | I | C | C | C |
| notificação | I | C | C | I | I | I | I | A/R | C | C | C |
| webhook/adapters | I | C | C | I | I | I | C | C | I | A/R | C |
| relatório/read model | I | C | C | C | C | C | C | C | A/R | I | C |
| SLO/telemetria/alerta | I | C | C | C | C | C | C | C | C | C | A/R |

Accountability de Produto, Segurança, Dados e Operações humanas permanece registrada nos loops e no approval record; esta matriz cobre ownership técnico/lógico.
