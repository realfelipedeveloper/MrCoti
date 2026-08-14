# Matriz de módulos, entitlements e flags

Esta matriz não fixa nomes ou preços de planos. Ela define as chaves que qualquer `PlanVersion` deverá resolver e impede que disponibilidade comercial fique codificada na aplicação.

| Fase | Capacidade/módulo | Bounded context owner | Entitlement/flag planejada | Dimensão de limite | Mapeamento a plano |
| --- | --- | --- | --- | --- | --- |
| MVP | Core SaaS e RBAC | Core SaaS / Identity | `core.saas`, sem flag para desligar isolamento | usuários, empresas, unidades | obrigatório em todo plano ativo |
| MVP | Cardápio | Catalog | `catalog.enabled` | produtos, imagens/armazenamento | catálogo de `PlanVersion` |
| MVP | Operação de salão | Service Operation | `operation.service.enabled` | mesas, pedidos/mês | catálogo de `PlanVersion` |
| MVP | Pagamento fake | Integrations / Finance | `integrations.payment.fake` | operações/minuto | ambientes/tenants autorizados |
| MVP | Nota fake | Integrations | `integrations.invoice.fake` | emissões/mês | ambientes/tenants autorizados |
| MVP | E-mail fake | Integrations | `notifications.email.fake` | mensagens/mês | catálogo de `PlanVersion` |
| V1 | Estoque e compras | Inventory & Procurement | `inventory.enabled`, `procurement.enabled` | locais, SKUs, compras/mês | decisão comercial pendente |
| V1 | Caixa | Cash & Finance | `cash.enabled` | caixas/unidade, movimentos/mês | decisão comercial pendente |
| V1 | Relatórios | Reporting | `reports.standard` | execuções, retenção de artefatos | decisão comercial pendente |
| V1 | SMS/WhatsApp fake | Integrations | `notifications.sms.fake`, `notifications.whatsapp.fake` | mensagens por canal/mês | decisão comercial pendente |
| V2 | Reservas | Reservations | `reservations.enabled` | reservas/mês | decisão comercial pendente |
| V2 | CRM/fidelidade | Customer & Consent | `crm.enabled`, `loyalty.enabled` | clientes ativos, campanhas/mês | decisão comercial pendente |
| V2 | Dashboard operacional | Reporting | `dashboard.operational` | atualização/retenção | decisão comercial pendente |
| V3 | BI/IA | capacidades futuras | `bi.enabled`, `ai.enabled` | consultas/tokens/artefatos | premium; política futura |
| V3 | Marketplaces/SDK/portal | Platform futura | `marketplace.*`, `developer.portal` | apps, credenciais, chamadas | premium; política futura |
| V3 | Multi-região | Platform/DevOps | `platform.multiregion` | regiões e residência | contrato específico futuro |

## Regra de avaliação

A linha apenas declara a capacidade. A decisão efetiva combina ambiente/kill switch, versão do plano, entitlement, override com validade, rollout, contador de limite, tenant ativo e RBAC. Uma flag não concede permissão e um plano não ignora kill switch.

## Governança

Cada chave tem owner, justificativa, default seguro, ambientes, data de revisão, telemetria, fallback e plano de remoção quando temporária. Valores comerciais e associação definitiva a planos permanecem pendentes de Produto; isso bloqueia a regra comercial afetada, não esta modelagem.
