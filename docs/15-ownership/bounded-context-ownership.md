# Ownership por Bounded Context

Owner lógico é o papel/equipe responsável pela linguagem, invariantes, dados e contratos; não implica microsserviço ou equipe já formada.

| Contexto | Owner lógico | Responsabilidades/entidades próprias | Eventos produzidos / consumidos | Dependências permitidas | Dependências proibidas |
| --- | --- | --- | --- | --- | --- |
| Core SaaS | SaaS Platform | Tenant, Company, Unit, estado e provisionamento | produz Tenant* e FeatureFlagChanged; consome PlanChanged | Billing/Identity por contratos | tabelas operacionais e credenciais |
| Identity & Access | Identity & Security | Identity, Session, Membership, Role, Permission | produz mudanças de acesso; consome TenantSuspended | Core SaaS e policies | decidir plano/feature comercial |
| Restaurant Operations | Operations | Table, Tab, Order, OrderItem, Bill | produz Table/Order/Bill; consome catálogo e pagamentos | Menu snapshots, ports de integração | editar catálogo/billing |
| Menu Management | Catalog | Category, Product, Price, RecipeVersion | produz catálogo publicado; consome unidade ativa | Core SaaS e storage port | ler pedidos/estoque diretamente |
| Inventory | Inventory & Procurement | Ingredient, Stock, Movement, Supplier, Purchase | produz Stock*; consome OrderItem* | snapshots de receita/eventos | mutar pedido/caixa |
| Billing | SaaS Commercial | PlanVersion, Subscription, Trial, Entitlement, Usage | produz PlanChanged/EntitlementExceeded; consome uso | Core SaaS, métricas normalizadas | pagamento/cartão real nesta fase |
| Fake Payments | Integration Payments | FakeCharge, Operation, Refund, Chargeback | produz FakePayment*; consome intenção/conta fechada | Operations por port/outbox | alterar Bill/Subscription |
| Fake Invoices | Integration Invoices | FakeInvoice, Artifact | produz FakeInvoice*; consome captura/solicitação | Operations/storage port | regra fiscal real |
| Notifications | Communications | Notification, Attempt, Template | produz Notification*; consome intenções permitidas | fila, provider port, consent policy | acessar tabelas de origem |
| Reporting | Data Products | read models, report jobs/artifacts | produz ReportReady; consome eventos publicados | event catalog/storage | escrita em agregados de origem |
| Integrations | Integration Platform | webhooks, endpoints, adapters, idempotência | produz entregas; consome eventos allowlisted | ports dos contextos e outbox | lógica central de negócio |
| Observability | Platform Operations | telemetria, dashboards, alertas/SLO | consome sinais sanitizados | todos por interface de telemetria | PII/segredos e mutação de domínio |

## Regras

1. Somente owner escreve suas tabelas.
2. Dependência síncrona usa serviço/port publicado; assíncrona usa evento catalogado.
3. Relatório e observabilidade não se tornam fontes transacionais.
4. Um contexto não compartilha entidade, repository ou modelo Prisma.
5. Conflito de ownership é resolvido no Architecture Loop e, se durável, por ADR.
