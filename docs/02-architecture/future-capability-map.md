# Mapa de capacidades futuras

| Fase | Capacidade | Contexto owner | Entrada/evento principal | Flag | Risco/dependência | Gate de entrada |
| --- | --- | --- | --- | --- | --- | --- |
| V1 | estoque/baixa automática | Inventory & Procurement | `OrderItemConfirmed/Cancelled`, receita versionada | `inventory.enabled` | concorrência, medida, estoque negativo | invariantes e reconciliação aprovadas |
| V1 | fornecedores/compras | Inventory & Procurement | pedido, recebimento, `StockReceived` | `procurement.enabled` | dados comerciais e recebimento parcial | catálogo/roles/data policy aprovados |
| V1 | caixa | Cash & Finance | abertura, recebimento, sangria, suprimento, fechamento | `cash.enabled` | integridade e segregação de função | RBAC e conciliação aprovados |
| V1 | relatórios | Reporting | eventos publicados e read models | `reports.standard` | carga, staleness, exportação | execução assíncrona, SLO e retenção aprovados |
| V1 | SMS/WhatsApp fake | Integrations | `NotificationRequested` | flags por canal | consentimento, templates, retries | contrato/opt-out/dead-letter aprovados |
| V2 | clientes/CRM | Customer & Consent | venda/reserva referenciada, consentimento | `crm.enabled` | LGPD, duplicidade, finalidade | catálogo/base legal aprovados |
| V2 | fidelidade | Customer & Consent | `OrderClosed`, regras versionadas | `loyalty.enabled` | fraude, expiração, ledger | regras/ledger/contestação aprovados |
| V2 | reservas | Reservations | criação/confirmação/no-show, disponibilidade | `reservations.enabled` | fuso, concorrência, notificação | estados e testes aprovados |
| V2 | dashboard | Reporting | projeções de pedidos/caixa/estoque | `dashboard.operational` | freshness e consultas pesadas | SLI de staleness/carga aprovado |
| V3 | BI | Analytics futura | snapshots/eventos minimizados | `bi.enabled` | custo, retenção, consistência | data platform ADR/governança aprovados |
| V3 | IA | AI capability futura | dados minimizados/casos autorizados | `ai.enabled` | privacidade, explicabilidade, custo | risco/RIPD/ADR aprovados |
| V3 | marketplaces/SDK/portal | Platform Extensions futura | manifestos, eventos, APIs versionadas | `marketplace.*` | supply chain, scopes, compatibilidade | confiança/review aprovados |
| V3 | multi-região | Platform/DevOps | replicação, roteamento, localização | `platform.multiregion` | consistência, residência, failover | SLO/RPO/RTO + ADR aprovado |

Capacidade futura continua no monólito modular enquanto seus limites amadurecem. Evento listado é contrato planejado, não autorização para criá-lo nesta etapa.
