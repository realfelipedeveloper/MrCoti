# Matriz de escopo das entidades

O inventário detalhado de campos e invariantes vive em `specs/001-saas-platform-foundation/data-model.md`. Esta matriz classifica todas as entidades nomeadas ali. “Global controlado” exige allowlist e não pode carregar dados operacionais de cliente.

| Escopo | Entidades | Regra de isolamento |
| --- | --- | --- |
| global controlado | `Identity`, `Plan`, `PlanVersion`, `FeatureDefinition` | IDs globais; dados pessoais protegidos; planos/features sem dados operacionais |
| tenant | `Tenant`, `Company`, `Membership`, `Role`, `RolePermission`, `Subscription`, `Trial`, `PlanChange`, `CommercialOverride`, `UsageCounter`, `UsageMeasurement`, `OverageDecision`, `CommercialHistoryEntry`, `TenantFeatureOverride`, `AuditEntry` | raiz/`tenant_id`; uniques, cache, jobs e consultas incluem tenant |
| tenant + unidade | `Unit`, `UnitMembership`, `Table`, `Tab`, `Order`, `Bill` | `tenant_id` + `unit_id`; unidade pertence ao mesmo tenant |
| tenant — catálogo | `Category`, `Product`, `ProductVariant`, `ModifierGroup`, `Modifier`, `Combo`, `Price`, `AvailabilitySchedule`, `RecipeVersion` | publicação/visibilidade por unidade sem cruzar tenant; snapshots históricos |
| tenant — operação | `OrderItem`, `BillSplit`, `PaymentAllocation` | herdam tenant/unidade do agregado; referências validadas na mesma fronteira |
| tenant — integração | `FakeCharge`, `FakePaymentOperation`, `FakeChargeback`, `FakeInvoice`, `FakeInvoiceArtifact`, `Notification`, `NotificationAttempt`, `MessageTemplate`, `WebhookEndpoint`, `WebhookDelivery`, `IdempotencyRecord` | namespace/chave por tenant; artefato e endpoint autorizados no mesmo tenant |
| tenant — confiabilidade | `DomainEvent`, `OutboxMessage` | envelope inclui tenant, agregado, versão e correlação |
| tenant — V1 | `Ingredient`, `StockLocation`, `StockMovement`, `Supplier`, `PurchaseOrder`, `PurchaseItem`, `CashSession`, `CashMovement`, `ReportJob`, `ReportArtifact` | tenant obrigatório; unidade quando o local/operação exigir |
| tenant — V2 | `Customer`, `Consent`, `Reservation`, `LoyaltyAccount` | tenant obrigatório; finalidade/consentimento e unidade quando aplicável |
| tenant — V3 | `PartnerApp`, `TenantInstallation`, `ApiCredential`, `UsageRecord`, `ModuleEntitlement` | app pode ser global; instalação, credencial, uso e concessão são tenant-scoped |

## Relações e acesso

FK/validação composta impede linha de `tenant_id=A` referenciar pai de `tenant_id=B`. Repositórios recebem `TenantContext` obrigatório e não oferecem busca tenant-aware apenas por ID externo. Chaves únicas de negócio começam pelo tenant quando aplicável.

Adicionar entidade global exige justificativa no Data Model e revisão de Segurança/Arquitetura. Jobs de plataforma iteram tenants explicitamente. Acesso de suporte é temporário, motivado e auditado.
