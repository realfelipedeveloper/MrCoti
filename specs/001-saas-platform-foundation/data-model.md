# Modelo de dados conceitual — Fundação da plataforma SaaS

**Produto:** Mr Coti  
**Feature:** `001-saas-platform-foundation`  
**Estado:** Conceitual; não é schema Prisma nem autoriza migration

## Objetivo e convenções

Este modelo define ownership, relações e invariantes necessárias para os requisitos
RF-001–042, RNF-001–014 e RSD-001–014. O modelo físico será derivado somente após os
gates da primeira etapa.

Convenções obrigatórias:

- Entidades tenant-aware usam `id` técnico e `tenant_id` imutável. Relações entre
  entidades tenant-aware incluem o tenant na validação e, sempre que viável, na
  constraint/chave composta.
- Entidades globais são exceções explícitas; não recebem `tenant_id`, mas não podem
  carregar dados operacionais de tenant.
- Identificadores públicos devem ser não sequenciais e não substituem autorização.
- Instantes são armazenados em UTC; `timezone` IANA da unidade orienta exibição e
  regras locais. Valores monetários usam unidade inteira mínima e `currency`.
- Exclusão lógica só é usada quando há requisito de recuperação/histórico. Eventos
  financeiros, fiscais fictícios e auditoria não são sobrescritos.
- Campos comuns, quando aplicáveis: `id`, `tenant_id`, `created_at`, `created_by`,
  `updated_at`, `updated_by`, `version` para concorrência otimista e `archived_at`.
- Dados pessoais, secrets e payloads brutos não são duplicados em logs ou auditoria.

## Visão de bounded contexts

| Contexto | Responsabilidade | Dados próprios | Dependências permitidas |
|---|---|---|---|
| Plataforma SaaS | tenant, plano, assinatura, limites e flags | Tenant, Plan, Subscription, Feature | IAM por contrato; publica eventos |
| IAM e acesso | identidade, sessão, membership, RBAC | Identity, Membership, Role, Session | consulta estado do tenant |
| Organização | empresas e unidades | Company, Unit | Plataforma SaaS |
| Catálogo | cardápio, preços, disponibilidade e ficha técnica | Product e composições | Organização; emite snapshots |
| Operação | mesas, comandas, pedidos e fechamento | ServiceTable, Tab, Order | Catálogo por contrato/snapshot |
| Pagamentos fake | cobranças e transições simuladas | FakeCharge, FakePaymentOperation | Operação por referência |
| Notas fake | emissão e artefatos simulados | FakeInvoice | Operação por snapshot mínimo |
| Notificações | templates, mensagens e tentativas | Notification, DeliveryAttempt | recebe comandos/eventos |
| Estoque e compras | saldo derivado, movimentos, fornecedores | StockMovement, PurchaseOrder | Catálogo por referência versionada |
| Caixa e relatórios | sessões de caixa e projeções | CashSession, ReportJob | consome eventos; não altera origem |
| Clientes e reservas | cliente, consentimento e reserva | Customer, Consent, Reservation | Organização e Operação |
| Confiabilidade | outbox, idempotência, webhook e auditoria | registros técnicos | metadados de todos os contextos |

Módulos não acessam tabelas de outro contexto. Referências externas ao aggregate são
IDs opacos e snapshots mínimos, resolvidos por serviços de aplicação ou eventos.

## Contexto Plataforma SaaS

| Entidade | Escopo | Atributos conceituais | Relações e invariantes |
|---|---|---|---|
| `Tenant` | global como raiz | `id`, `public_id`, `legal_name`, `display_name`, `slug`, `status`, `timezone_default`, `provisioned_at`, `suspended_at`, `cancelled_at`, `version` | `slug` único global; transições pela máquina de estados; nenhum dado operacional embutido |
| `Plan` | global | `id`, `code`, `name`, `status` | código único; agrega versões imutáveis |
| `PlanVersion` | global | `id`, `plan_id`, `version`, `effective_from`, `effective_to`, `commercial_metadata` | períodos não se sobrepõem; direitos vigentes não mudam retroativamente |
| `Subscription` | tenant | `id`, `tenant_id`, `plan_version_id`, `status`, `starts_at`, `current_period_start/end`, `change_effective_at`, `cancelled_at` | no máximo uma assinatura operacional vigente por tenant; não contém transações reais de billing |
| `Trial` | tenant | `id`, `tenant_id`, `subscription_id`, `starts_at`, `ends_at`, `status`, `eligibility_rule`, `extended_by/reason?` | uma concessão padrão conforme policy; extensão auditada; não implica cobrança |
| `PlanChange` | tenant | `id`, `subscription_id`, `from/to_plan_version_id`, `requested/effective_at`, `status`, `impact_snapshot`, `idempotency_key` | mudança idempotente; preview preservado; não reescreve histórico |
| `PlanEntitlement` | global | `plan_version_id`, `feature_id`, `enabled`, `limit_code`, `limit_value`, `unit` | unique por versão/feature/limite; direito comercial separado de rollout |
| `CommercialOverride` | tenant | `tenant_id`, `entitlement_key`, `value`, `valid_from/to`, `reason`, `approved_by` | expiração e aprovação obrigatórias; não contorna kill switch/RBAC |
| `UsageCounter` | tenant | `tenant_id`, `subscription_id`, `limit_code`, `period_key`, `used`, `reserved`, `version` | incremento/reserva atômicos; nunca negativo; chave única por tenant/assinatura/limite/período |
| `UsageMeasurement` | tenant | `id`, `tenant_id`, `metric`, `quantity`, `unit`, `period_key`, `source`, `idempotency_key` | append-only/idempotente; alimenta counter e FinOps, não fatura real |
| `OverageDecision` | tenant | `id`, `subscription_id`, `entitlement_key`, `limit/observed`, `action`, `grace_until?`, `override_id?` | decisão explicável; nunca apaga dado; ação segue policy versionada |
| `CommercialHistoryEntry` | tenant | `id`, `subscription_id`, `event_type`, `before/after_ref`, `reason`, `actor_id`, `occurred_at`, `correlation_id` | append-only; metadados minimizados; sem dados financeiros reais |
| `Feature` | global | `id`, `key`, `name`, `risk_class`, `default_behavior`, `owner`, `review_at`, `retirement_criteria` | `key` único e estável; default seguro obrigatório |
| `EnvironmentFeatureRule` | ambiente | `environment`, `feature_id`, `mode`, `rollout`, `valid_from/to`, `reason` | kill switch prevalece; ambiente vem de configuração confiável |
| `TenantFeatureOverride` | tenant | `tenant_id`, `feature_id`, `mode`, `limit_override`, `valid_from/to`, `reason`, `approved_by` | não concede feature proibida pelo plano sem exceção comercial explícita e auditada |
| `FeatureEvaluationAudit` | tenant quando aplicável | `tenant_id?`, `feature_id`, `environment`, `subject_hash?`, `decision`, `rule_source`, `evaluated_at`, `correlation_id` | amostragem/retencão devem evitar volume e dados pessoais; mudanças administrativas sempre auditadas |

### Estados

`Tenant`: `PROVISIONING → ACTIVE ↔ SUSPENDED → CANCELLED`. Falha de
provisionamento leva a `PROVISIONING_FAILED` e exige retry idempotente. `CANCELLED` é
terminal no fluxo normal; reativação excepcional requer política/novo vínculo.

`Subscription`: `PENDING → TRIAL|ACTIVE ↔ PAST_DUE → SUSPENDED → CANCELLED`, com
estados de billing apenas preparatórios. Transição de plano registra versão antiga,
nova e vigência; não reescreve histórico.

`Trial`: `PENDING → ACTIVE → CONVERTED|TRIAL_EXPIRED|CANCELLED`. Conversão ativa a
assinatura e recalcula entitlements de forma idempotente; expiração não apaga dados e
bloqueia novas operações comerciais até escolha/conversão de plano.

`PlanChange`: `REQUESTED → SCHEDULED|APPLYING → APPLIED|FAILED|CANCELLED`. Upgrade
pode aplicar imediatamente; downgrade é agendado por baseline. `FAILED` mantém a
versão anterior e pode ser retomado com a mesma idempotency key.

## Contextos IAM e Organização

| Entidade | Escopo | Atributos conceituais | Relações e invariantes |
|---|---|---|---|
| `Identity` | global | `id`, `email_normalized`, `password_hash`, `status`, `email_verified_at`, `last_login_at` | e-mail normalizado único; não armazena papel nem tenant corrente |
| `Session` | global vinculada a contexto | `id`, `identity_id`, `active_tenant_id`, `refresh_token_hash`, `issued_at`, `expires_at`, `rotated_from`, `revoked_at`, `risk_metadata` | token bruto nunca persistido; tenant ativo deve possuir membership válida |
| `Membership` | tenant | `id`, `tenant_id`, `identity_id`, `status`, `invited_at`, `accepted_at`, `expires_at` | unique `(tenant_id, identity_id)`; identidade global pode ter vários memberships independentes |
| `Role` | tenant ou template global | `id`, `tenant_id?`, `code`, `name`, `scope_type`, `system_managed` | papéis do sistema globais são templates; customizações pertencem ao tenant |
| `Permission` | global | `id`, `code`, `resource`, `action`, `risk_level` | catálogo estável e versionável |
| `RolePermission` | mesmo escopo do papel | `role_id`, `permission_id`, `conditions` | unique por papel/permissão; condições são allowlist validada |
| `RoleAssignment` | tenant | `tenant_id`, `membership_id`, `role_id`, `company_id?`, `unit_id?`, `valid_from/to` | escopo atribuído pertence ao mesmo tenant; privilégio mínimo |
| `Company` | tenant | `id`, `tenant_id`, `legal_name`, `trade_name`, `document_encrypted`, `status` | documento tem índice por hash quando necessário; dado integral protegido |
| `Unit` | tenant | `id`, `tenant_id`, `company_id`, `name`, `code`, `timezone`, `currency`, `status`, `address` | unique `(tenant_id, code)`; empresa do mesmo tenant; timezone IANA obrigatório |

Autorização combina membership ativa, estado do tenant, permission, escopo da
atribuição, feature/entitlement e política de negócio. A ordem não pode ser alterada
por dados enviados pelo cliente.

## Contexto Catálogo

| Entidade/aggregate | Escopo | Atributos conceituais | Relações e invariantes |
|---|---|---|---|
| `Category` | tenant/unidade ou empresa | `id`, `tenant_id`, `company_id`, `name`, `sort_order`, `status` | unique contextual; arquivar não altera pedidos passados |
| `Product` | tenant | `id`, `tenant_id`, `company_id`, `category_id`, `sku`, `name`, `description`, `status` | unique `(tenant_id, company_id, sku)`; category do mesmo tenant |
| `ProductVariant` | tenant | `id`, `tenant_id`, `product_id`, `name`, `sku_suffix`, `status` | produto do mesmo tenant; ao menos uma opção vendável |
| `AddOnGroup` / `AddOnOption` | tenant | nome, mínimo/máximo, preço e disponibilidade | seleção deve respeitar cardinalidade; referências do mesmo tenant |
| `Combo` / `ComboComponent` | tenant | nome, grupos de escolha, quantidades e preço | composição versionável; não cria ciclo entre combos |
| `ProductPrice` | tenant/unidade | `product/variant_id`, `unit_id?`, `amount_minor`, `currency`, `valid_from/to` | períodos conflitantes são rejeitados; valor não negativo |
| `AvailabilityWindow` | tenant/unidade | dias, horário local, timezone, início/fim e exceções | avaliada no timezone da unidade; intervalos validados |
| `MediaAsset` | tenant | `owner_type/id`, `storage_key`, `content_type`, `size`, `checksum`, `status` | chave inclui tenant; URL pública não é autoridade; sem binário no banco transacional |
| `Recipe` | tenant | `product/variant_id`, `version`, `yield`, `valid_from/to` | versões imutáveis após uso; uma versão vigente por item/contexto |
| `RecipeIngredient` | tenant | `recipe_id`, `ingredient_id`, `quantity`, `unit_of_measure` | ingrediente do mesmo tenant; quantidade positiva |

## Contexto Operação

| Entidade/aggregate | Escopo | Atributos conceituais | Relações e invariantes |
|---|---|---|---|
| `ServiceTable` | tenant/unidade | `id`, `tenant_id`, `unit_id`, `code`, `capacity`, `status` | unique `(tenant_id, unit_id, code)`; status deriva de operações válidas |
| `Tab` (comanda) | tenant/unidade | `id`, `tenant_id`, `unit_id`, `table_id?`, `public_number`, `status`, `opened_at/by`, `closed_at/by`, `reopen_reason`, `version` | número único no escopo/período definido; somente transições válidas; reabertura auditada |
| `Order` | tenant/unidade | `id`, `tenant_id`, `tab_id`, `sequence`, `status`, `placed_at/by`, `cancelled_at/by`, `cancel_reason` | pertence à comanda do mesmo tenant/unidade; cancelamento não apaga itens |
| `OrderItem` | tenant/unidade | `id`, `tenant_id`, `order_id`, `product_ref`, `description_snapshot`, `unit_price_minor`, `quantity`, `discount_minor`, `tax_metadata`, `recipe_version_ref`, `status` | valores e descrição são snapshot; totais inteiros; quantidade positiva |
| `OrderItemOption` | tenant | descrição/preço/quantidade em snapshot | pertence ao item; não depende do catálogo para reconstruir total |
| `Bill` | tenant/unidade | `id`, `tenant_id`, `tab_id`, `subtotal_minor`, `discount_minor`, `service_charge_minor`, `total_minor`, `status`, `closed_at` | `total = subtotal - desconto + taxa`; uma versão final conciliável |
| `BillSplit` | tenant | `bill_id`, `strategy`, `label`, `amount_minor` | soma das partes igual ao total devido, com política explícita de centavo residual |
| `PaymentAllocation` | tenant | `bill_id/split_id`, `fake_charge_id?`, `method`, `amount_minor`, `status` | soma capturada/confirmada igual ao valor quitado; referências idempotentes |

### Estados principais

- `Tab`: `OPEN → CLOSING → CLOSED`; `CLOSED → REOPENED → OPEN` somente com
  permissão/motivo. `CANCELLED` exige não haver saldo inconciliado.
- `Order`: `DRAFT → PLACED → IN_PREPARATION → READY → SERVED`; cancelamento é
  permitido por política a partir de estados definidos e nunca remove histórico.
- `Bill`: `OPEN → PARTIALLY_PAID → PAID → CLOSED`; estorno pode produzir estado
  `REFUND_PENDING/REFUNDED` sem alterar o total original.

Transações críticas: criação de pedido + itens + evento de outbox; fechamento +
alocações + evento; reabertura/cancelamento + motivo + auditoria. Locks/versionamento
devem evitar dois fechamentos ou consumo de limite concorrente.

## Contextos de integração fictícia

| Entidade | Escopo | Atributos conceituais | Relações e invariantes |
|---|---|---|---|
| `FakeCharge` | tenant | `id`, `tenant_id`, `external_reference`, `amount_minor`, `currency`, `status`, `scenario`, `authorized/captured/refunded_minor`, `version` | sem dados reais de cartão; valores acumulados não excedem regras do estado |
| `FakePaymentOperation` | tenant | `charge_id`, `type`, `amount_minor`, `status`, `failure_code`, `idempotency_record_id`, `occurred_at` | operação imutável; unique por idempotência; guarda transição |
| `FakeChargeback` | tenant | `charge_id`, `amount_minor`, `reason`, `status`, `opened_at`, `resolved_at` | simulação identificada; não apaga captura |
| `FakeInvoice` | tenant | `id`, `tenant_id`, `reference`, `status`, `scenario`, `recipient_snapshot_minimized`, `totals_snapshot`, `rejection_code`, `authorized_at`, `cancelled_at` | não fiscal; dados minimizados; estados monotônicos |
| `FakeInvoiceArtifact` | tenant | `invoice_id`, `kind`, `storage_key`, `checksum`, `generated_at`, `expires_at?` | XML/PDF contém marca d'água/declaração sem validade; storage segregado por tenant |
| `Notification` | tenant | `id`, `tenant_id`, `channel`, `recipient_protected`, `template_version_id`, `variables_protected`, `status`, `deduplication_key`, `scheduled_at` | destinatário protegido/mascarado; unique de deduplicação no escopo definido |
| `NotificationAttempt` | tenant | `notification_id`, `attempt_no`, `provider`, `status`, `started/finished_at`, `sanitized_error`, `provider_message_ref` | attempt sequencial; erro sem conteúdo pessoal; retry finito |
| `MessageTemplate` | tenant ou global | `id`, `tenant_id?`, `code`, `channel`, `version`, `content`, `status`, `approved_at` | versão usada é imutável; conteúdo validado por canal |

Máquina de `FakeCharge`: `PENDING → AUTHORIZED → CAPTURED`; cancelamento antes da
captura leva a `CANCELLED`; estorno após captura leva a `PARTIALLY_REFUNDED/REFUNDED`;
`FAILED`, `FRAUD_REJECTED` e `CHARGEBACK` preservam motivo e histórico. Timeout não é
estado final da cobrança: ela mantém o último estado estável enquanto a operação
interna fica `PROCESSING/UNKNOWN`; a API retorna timeout e permite consultar antes
de qualquer repetição.

Máquina de `FakeInvoice`: `DRAFT → PROCESSING → AUTHORIZED|REJECTED|FAILED`;
de `AUTHORIZED` pode transicionar por `CANCELLATION_PENDING` até `CANCELLED`.
`UNAVAILABLE` representa tentativa/erro,
não estado público final, permitindo retry idempotente até sucesso, rejeição ou
falha definitiva.

Máquina de `Notification`: `QUEUED → PROCESSING → SENT`; falhas recuperáveis retornam
a `QUEUED` conforme retry/backoff, falhas esgotadas passam por `FAILED` e terminam em
`DEAD_LETTER` para tratamento explícito. Reprocessamento da dead letter exige ação
autorizada, preserva tentativas anteriores e continua sujeito à deduplicação.

## Contextos planejados para V1–V3

| Entidade | Fase | Escopo e invariantes essenciais |
|---|---|---|
| `Ingredient` | V1 | tenant; unidade de medida canônica e status |
| `StockLocation` | V1 | tenant/unidade; depósito lógico, unique por unidade/código |
| `StockMovement` | V1 | tenant; append-only, entrada/saída/ajuste/baixa, quantidade assinada, origem e versão de receita |
| `Supplier` | V1 | tenant; dados pessoais/comerciais classificados |
| `PurchaseOrder` / `PurchaseItem` | V1 | tenant; estados, valores e recebimentos parciais conciliáveis |
| `CashSession` / `CashMovement` | V1 | tenant/unidade; abertura, sangria, suprimento e fechamento append-only |
| `ReportJob` / `ReportArtifact` | V1 | tenant; filtros, status, expiração, storage segregado e execução assíncrona |
| `Customer` | V2 | tenant; identidade do cliente não é `Identity`; dados minimizados e anonimizáveis |
| `Consent` | V2 | tenant; finalidade, base/texto/version, concessão e revogação append-only |
| `Reservation` | V2 | tenant/unidade; intervalo, party size, mesa opcional, status e no-show |
| `LoyaltyAccount` / `LoyaltyLedger` | V2 | tenant; saldo derivado de ledger imutável, feature-gated |
| `MarketplaceApp` / `TenantInstallation` | V3 | catálogo global + instalação tenant, scopes, versão e revogação |
| `PartnerCredential` | V3 | tenant; somente secret cifrado/referência a cofre, rotação e escopos |

Nenhuma entidade futura autoriza implementação antecipada. Seu detalhamento deve
ocorrer na spec da fase correspondente.

## Contexto Confiabilidade e governança

| Entidade | Escopo | Atributos conceituais | Invariantes |
|---|---|---|---|
| `IdempotencyRecord` | tenant | `tenant_id`, `operation`, `key_hash`, `payload_hash`, `status`, `resource_ref`, `response_code/body_safe`, `locked_until`, `expires_at` | unique `(tenant_id, operation, key_hash)`; payload diferente gera conflito; sem secrets |
| `OutboxEvent` | tenant quando aplicável | `id`, `tenant_id?`, `aggregate_type/id`, `event_type/version`, `payload_minimized`, `occurred_at`, `correlation_id`, `published_at`, `attempts`, `next_attempt_at` | gravado na transação do aggregate; imutável; publicação ao menos uma vez |
| `ProcessedMessage` | tenant | `tenant_id`, `consumer`, `message_id`, `processed_at`, `result_hash` | unique por tenant/consumer/message; impede efeito duplicado |
| `WebhookSubscription` | tenant | `id`, `tenant_id`, `event_types`, `endpoint`, `secret_ref`, `status`, `created_by` | HTTPS fora de local; secret no cofre, nunca em claro |
| `WebhookDelivery` | tenant | `subscription_id`, `event_id`, `attempt`, `status`, `response_code`, `duration`, `next_attempt_at`, `sanitized_error` | redelivery finito; payload versionado; proteção contra replay |
| `AuditEvent` | tenant quando aplicável | `id`, `tenant_id?`, `actor_type/id`, `action`, `target_type/id`, `result`, `reason`, `before/after_safe?`, `occurred_at`, `request/correlation_id`, `source` | append-only; relógio UTC; campos sensíveis omitidos; acesso restrito |
| `ActivityLog` | tenant | resumo operacional derivado de eventos | projeção descartável/reconstruível; não substitui auditoria |

## Constraints e índices obrigatórios no desenho físico futuro

1. Todo índice de acesso tenant-aware começa por `tenant_id` quando a seletividade e
   o plano de consulta justificarem; uniques de negócio incluem `tenant_id`.
2. FKs entre dados tenant-aware não podem aceitar combinação de tenants distintos;
   a aplicação também valida para produzir erro seguro.
3. Consultas de listas usam paginação estável por cursor ou chave composta; offsets
   extensos não são base de relatórios de milhões de registros.
4. Outbox, auditoria, tentativas e eventos preveem índice temporal e estratégia de
   particionamento/arquivamento quando volume medido exigir.
5. E-mail, documento e destinatário pesquisáveis usam normalização e hash separado do
   valor protegido quando a busca for requisito legítimo.
6. Colunas de estado usam vocabulário controlado e transições na camada de domínio;
   o banco protege nulidade, unicidade e faixas críticas.
7. Totais monetários não usam ponto flutuante; quantidades fracionárias usam decimal
   com precisão definida por unidade de medida.

## Isolamento, transações e consistência

- O contexto de tenant nasce na autenticação, é validado contra membership e estado,
  e é propagado como dado confiável até repositórios, eventos e jobs.
- Repositórios tenant-aware não oferecem método sem escopo; rotinas administrativas
  cross-tenant são separadas, autorizadas, limitadas e auditadas.
- Cache keys, storage paths, métricas de negócio, idempotência e deduplicação incluem
  ambiente e tenant. Logs podem pseudonimizar tenant, mas preservam correlação.
- Aggregates mantêm consistência imediata dentro do próprio limite. Entre contextos,
  eventos/outbox e consumidores idempotentes fornecem consistência eventual
  observável.
- Não há transação distribuída entre MySQL, Redis ou provider. Estado ambíguo é
  consultável e reconciliável.

## Classificação, retenção e ciclo de vida

| Classe | Exemplos | Tratamento | Retenção |
|---|---|---|---|
| Pública | nome comercial, cardápio publicado | integridade e versionamento | enquanto publicado + histórico necessário |
| Interna | configuração, feature/limite, métricas agregadas | RBAC e auditoria | conforme necessidade operacional |
| Pessoal | cliente, e-mail, telefone, consentimento | minimização, cifragem quando aplicável, export/anonimização | política LGPD a aprovar |
| Sensível/secret | hash de senha, tokens, webhook secret | cofre/hash, acesso mínimo, nunca logar | menor prazo tecnicamente necessário |
| Financeira/fiscal fake | cobranças e notas simuladas | marcação inequívoca, integridade e acesso restrito | política de testes/auditoria a aprovar |
| Auditoria | ação, alvo, resultado e correlação | append-only, acesso restrito, sem payload sensível | política regulatória/contratual a aprovar |
| Efêmera | cache, lock, artefato temporário | TTL, reconstruível | TTL explícito |

Os prazos concretos são gate de governança antes da produção. Cancelar tenant não
implica apagar imediatamente: inicia política de bloqueio, exportação, retenção e
eliminação/anonimização auditável.

## Eventos de domínio iniciais

- `TenantProvisioningRequested`, `TenantActivated`, `TenantSuspended`,
  `TenantCancelled`, `SubscriptionPlanChanged`, `PlanLimitReached`.
- `MembershipInvited`, `MembershipActivated`, `RoleAssigned`.
- `FeatureOverrideChanged`, `FeatureKillSwitchActivated`.
- `TabOpened`, `OrderPlaced`, `OrderItemCancelled`, `BillClosed`, `TabReopened`.
- `FakeChargeAuthorized`, `FakeChargeCaptured`, `FakeChargeFailed`,
  `FakeChargeRefunded`, `FakeChargebackOpened`.
- `FakeInvoiceAuthorized`, `FakeInvoiceRejected`, `FakeInvoiceCancelled`.
- `NotificationRequested`, `NotificationDelivered`, `NotificationFailed`.

O catálogo canônico e versionado de eventos compartilhados está em
`docs/14-events/domain-events-catalog.md`. A lista acima é apenas o inventário de
conceitos do modelo e não autoriza payload ou consumidor fora do catálogo.

Cada evento possui `event_id`, `event_type`, `event_version`, `occurred_at`,
`tenant_id` quando aplicável, `aggregate_id`, `correlation_id`, `causation_id` e
payload mínimo versionado.

## Validações obrigatórias antes do schema físico

- Matriz entidade × tenant revisada, sem entidade tenant-aware não identificada.
- Matriz RBAC por aggregate/comando aprovada.
- Estados e transições confrontados com contratos OpenAPI e UML.
- Entidades comerciais confrontadas com Billing/Entitlements e histórico sem cobrança real.
- Cada evento cross-context confrontado com catálogo, owner, schema e outbox.
- Retenção/anonimização confrontadas com Legal Review e propagação a cópias/backups.
- Constraints e índices avaliados com consultas e volumes esperados.
- Catálogo de dados, retenção e anonimização aprovados por segurança/dados/produto.
- Estratégia de migrations zero/baixo downtime e rollback/roll-forward documentada.
- Testes planejados para FK cross-tenant, uniques compostos, concorrência,
  idempotência, outbox e restauração.
