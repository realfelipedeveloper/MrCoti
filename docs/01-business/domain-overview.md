# Visão do domínio

## Bounded contexts

| Contexto | Responsabilidade | Dados que governa |
| --- | --- | --- |
| Core SaaS | tenant, organização, estado, flags técnicas e auditoria | Tenant, Company, Unit, FeatureFlag, AuditEntry |
| Billing | ciclo comercial futuro, trial, plan change, overage e histórico | PlanVersion, Subscription, Trial, PlanChange, UsageMeasurement |
| Identity & Access | identidade, sessão, vínculo, papéis e políticas | User, Membership, Role, Permission, Session |
| Organization | empresas e unidades | Company, Unit |
| Catalog | oferta vendável e ficha técnica | Category, Product, Modifier, Combo, Price, Availability |
| Service Operation | mesas, comandas, pedidos e conta | Table, Tab, Order, OrderItem, Bill |
| Inventory & Procurement | insumos, movimentos, compras e fornecedores | Ingredient, StockMovement, Purchase, Supplier |
| Cash & Finance | caixa, pagamentos e recibos | CashSession, CashMovement, Payment, Receipt |
| Customer & Consent | cliente, preferências e LGPD | Customer, Consent, Preference |
| Reservations | reserva, confirmação, no-show e mesa | Reservation |
| Reporting | projeções e leituras analíticas | read models, snapshots |
| Integrations | pagamentos/notas/notificações e webhooks | IntegrationAttempt, WebhookDelivery, Notification |

Core SaaS, Identity e Organization são fundacionais. Os demais contextos referenciam seus identificadores, mas não alteram seus dados diretamente.

## Fluxo central do MVP

O usuário autenticado escolhe uma unidade autorizada, abre ou acessa uma comanda, registra pedidos a partir do catálogo vigente, fecha/divide a conta, processa pagamento fake e solicita documento fake. Eventos internos atualizam auditoria, estoque futuro, relatórios e notificações sem ampliar a transação principal.

## Integração entre contextos

- Chamadas de aplicação síncronas para invariantes que exigem resposta imediata.
- Domain events após sucesso transacional.
- Outbox para efeitos assíncronos confiáveis.
- IDs e contratos explícitos; nunca acesso informal às tabelas de outro contexto.
