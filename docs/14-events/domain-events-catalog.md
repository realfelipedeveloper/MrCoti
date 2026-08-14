# Catálogo de Domain Events

## Envelope obrigatório

Todo evento contém `eventId`, `eventName`, `eventVersion`, `occurredAt`, `tenantId` quando aplicável, `aggregateType`, `aggregateId`, `aggregateVersion`, `correlationId`, `causationId`, `producer` e `payload`. O payload é mínimo, versionado e não transporta segredo ou entidade completa.

Idempotência padrão: consumidor registra `(consumer, eventId)`; ordenação por agregado usa `aggregateVersion`. Eventos consumidos fora do módulo produtor são gravados em outbox na mesma transação da mudança.

## Core SaaS e Billing

| Evento | Contexto/produtor | Consumidores | Payload mínimo | Versão/idempotência | Criticidade/outbox | Dados proibidos |
| --- | --- | --- | --- | --- | --- | --- |
| `TenantProvisioned` | Core SaaS / Provisioning | Identity, Billing, Audit | tenantId, ownerIdentityId, initialUnitId, provisionedAt | v1; eventId + tenant version | alta / sim | senha, token, documentos completos |
| `TenantSuspended` | Core SaaS | Identity, Operations, Integrations | tenantId, reasonCode, effectiveAt | v1; eventId + tenant version | crítica / sim | motivo livre sensível, credenciais |
| `TenantCancelled` | Core SaaS | Billing, Data Governance, Integrations | tenantId, effectiveAt, retentionPolicyId | v1; eventId + tenant version | crítica / sim | dump de dados, PII |
| `PlanChanged` | Billing | Entitlements, Core SaaS, Audit | tenantId, subscriptionId, fromPlanVersionId, toPlanVersionId, effectiveAt | v1; eventId + subscription version | alta / sim | preço negociado livre, dados de pagamento |
| `EntitlementExceeded` | Entitlements/Billing | Product telemetry, Notifications, Audit | tenantId, entitlementKey, limit, observed, periodKey, action | v1; eventId + measurement version | alta / sim | conteúdo do recurso, PII |
| `FeatureFlagChanged` | Core SaaS Feature Management | cache invalidator, Audit, affected modules | featureKey, environment, tenantId?, fromMode, toMode, effectiveAt | v1; eventId + rule version | alta / sim | actor token, segmentação com PII |

## Restaurant Operations

| Evento | Contexto/produtor | Consumidores | Payload mínimo | Versão/idempotência | Criticidade/outbox | Dados proibidos |
| --- | --- | --- | --- | --- | --- | --- |
| `TableOpened` | Restaurant Operations | Reporting, Audit | tenantId, unitId, tableId, tabId, openedAt | v1; eventId + table version | média / sim | nome/contato do cliente |
| `OrderCreated` | Restaurant Operations | Inventory, Reporting, Audit | tenantId, unitId, orderId, tabId, itemCount, createdAt | v1; eventId + order version | alta / sim | item completo, observação pessoal livre |
| `OrderItemAdded` | Restaurant Operations | Inventory, Kitchen projection, Reporting | tenantId, unitId, orderId, itemId, productSnapshotId, quantity | v1; eventId + order version | alta / sim | receita completa, preço não necessário ao consumidor |
| `OrderCancelled` | Restaurant Operations | Inventory, Reporting, Audit | tenantId, unitId, orderId, reasonCode, cancelledAt | v1; eventId + order version | alta / sim | motivo livre com PII |
| `BillClosed` | Restaurant Operations | Billing metrics, Fake Payments, Reporting | tenantId, unitId, billId, total, currency, closedAt | v1; eventId + bill version | crítica / sim | dados de cartão, itens completos |
| `ServiceFeeApplied` | Restaurant Operations | Reporting, Audit | tenantId, unitId, billId, baseAmount, feeAmount, policyId | v1; eventId + bill version | média / sim | identidade pessoal não necessária |

## Fake Payments

| Evento | Contexto/produtor | Consumidores | Payload mínimo | Versão/idempotência | Criticidade/outbox | Dados proibidos |
| --- | --- | --- | --- | --- | --- | --- |
| `FakePaymentCreated` | Fake Payments | Operations, Audit | tenantId, chargeId, externalReference, amount, currency, scenario | v1; eventId + charge version | alta / sim | cartão/CVV/PIX real |
| `FakePaymentAuthorized` | Fake Payments | Operations, Reporting | tenantId, chargeId, amount, authorizedAt | v1; eventId + charge version | crítica / sim | credencial/provider payload |
| `FakePaymentCaptured` | Fake Payments | Operations, Fake Invoices, Reporting | tenantId, chargeId, amount, capturedAt | v1; eventId + charge version | crítica / sim | cartão/dados bancários |
| `FakePaymentFailed` | Fake Payments | Operations, Notifications, Audit | tenantId, chargeId, failureCode, failedAt | v1; eventId + charge version | alta / sim | stack trace, resposta bruta |
| `FakePaymentTimedOut` | Fake Payments | Operations, Observability | tenantId, chargeId, operationId, timedOutAt, lastStableStatus | v1; eventId + operation version | alta / sim | request/response integral |
| `FakePaymentRefunded` | Fake Payments | Operations, Reporting, Audit | tenantId, chargeId, refundId, amount, refundedAt | v1; eventId + refund version | crítica / sim | conta bancária, motivo pessoal |
| `FakeChargebackSimulated` | Fake Payments | Operations, Reporting, Notifications | tenantId, chargeId, amount, reasonCode, simulatedAt | v1; eventId + chargeback version | alta / sim | PII ou dados financeiros reais |

## Fake Invoices

| Evento | Contexto/produtor | Consumidores | Payload mínimo | Versão/idempotência | Criticidade/outbox | Dados proibidos |
| --- | --- | --- | --- | --- | --- | --- |
| `FakeInvoiceRequested` | Fake Invoices | worker de emissão, Audit | tenantId, invoiceId, reference, total, scenario | v1; eventId + invoice version | alta / sim | certificado, documento real completo |
| `FakeInvoiceAuthorized` | Fake Invoices | Operations, Notifications, Reporting | tenantId, invoiceId, fakeAccessKey, authorizedAt | v1; eventId + invoice version | alta / sim | XML/PDF integral no evento |
| `FakeInvoiceRejected` | Fake Invoices | Operations, Notifications, Audit | tenantId, invoiceId, rejectionCode, rejectedAt | v1; eventId + invoice version | alta / sim | resposta bruta, PII |
| `FakeInvoiceCancelled` | Fake Invoices | Operations, Reporting, Audit | tenantId, invoiceId, reasonCode, cancelledAt | v1; eventId + invoice version | alta / sim | artefato integral, segredo |

## Notifications

| Evento | Contexto/produtor | Consumidores | Payload mínimo | Versão/idempotência | Criticidade/outbox | Dados proibidos |
| --- | --- | --- | --- | --- | --- | --- |
| `NotificationQueued` | Notifications | notification worker, Observability | tenantId, notificationId, channel, templateVersionId, queuedAt | v1; eventId + notification version | alta / sim | destinatário aberto, corpo renderizado |
| `NotificationSent` | Notifications | requesting context, Reporting | tenantId, notificationId, channel, providerRefHash, sentAt | v1; eventId + notification version | média / sim | mensagem, telefone/e-mail completo |
| `NotificationFailed` | Notifications | requesting context, Observability, Audit | tenantId, notificationId, channel, errorCode, terminal, failedAt | v1; eventId + attempt version | alta / sim | stack/provider response/PII |
| `NotificationRetried` | Notifications | Observability | tenantId, notificationId, attempt, nextAttemptAt, reasonCode | v1; eventId + attempt number | média / sim | payload da mensagem |

## Mudança do catálogo

Novo evento ou versão exige owner, schema, classificação de dados, consumidores, SLO, retry, compatibilidade, retenção e atualização deste catálogo. Evento sem consumidor não é publicado “para o futuro”.
