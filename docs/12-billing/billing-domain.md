# Domínio de Billing do Mr Coti

**Estado:** baseline arquitetural aprovada; valores e políticas comerciais exigem aprovação de Produto.

Billing é um subdomínio futuro do Core SaaS. Ele governa o vínculo comercial entre tenant, plano e assinatura, mas não processa pagamento real nesta fase.

## Responsabilidades

- catálogo e versões imutáveis de planos;
- assinatura, trial, ciclo, upgrade, downgrade, suspensão, reativação e cancelamento;
- entitlements e limites comerciais vigentes;
- medição de uso, excedentes e overrides autorizados;
- inadimplência como estado comercial, sem integração de cobrança real;
- histórico append-only de decisões comerciais;
- publicação de eventos para provisionamento, acesso e observabilidade.

## Agregados e conceitos

| Agregado/conceito | Responsabilidade | Invariantes |
| --- | --- | --- |
| `Plan` / `PlanVersion` | oferta comercial versionada | versão publicada é imutável e possui vigência sem sobreposição |
| `Subscription` | plano efetivo e ciclo do tenant | no máximo uma assinatura operacional vigente por tenant |
| `Trial` | período experimental e conversão | elegibilidade e datas são auditadas; extensão exige autorização |
| `EntitlementSet` | direitos/limites derivados do plano | direito comercial não é feature flag técnica |
| `UsageMeasurement` | consumo por métrica e período | incremento idempotente e tenant-aware |
| `OverageDecision` | tratamento do limite excedido | não apaga dado nem interrompe operação crítica silenciosamente |
| `PlanChange` | mudança agendada/aplicada | registra plano anterior/novo, vigência, impacto e autor |
| `CommercialHistoryEntry` | trilha comercial | append-only, com motivo, ator e correlation ID |

## Estado da assinatura

`PENDING → TRIALING|ACTIVE ↔ PAST_DUE → SUSPENDED → CANCELLING → CANCELLED`.

- `PAST_DUE` preserva operação durante a tolerância aprovada.
- `SUSPENDED` bloqueia novas mutações conforme política, preservando exportação e recuperação autorizadas.
- `CANCELLED` é terminal no fluxo normal; retorno exige nova assinatura ou decisão excepcional auditada.
- reativação restaura entitlements da versão vigente e invalida caches antes de liberar acesso.

## Fronteiras

Billing fornece decisões comerciais ao Core SaaS e ao avaliador de entitlements. Identity/RBAC continua decidindo quem pode agir. Feature Flags decide rollout técnico. Contextos operacionais consultam uma decisão normalizada, nunca tabelas de Billing.

## Exclusões

Não há gateway, cartão, fatura real, cálculo tributário ou cobrança automática. Um provider de billing real exigirá especificação, ADR, compliance, segurança e adapter próprio.

## Eventos principais

`PlanChanged`, `EntitlementExceeded`, mudanças de assinatura/trial e suspensão do tenant são persistidos via outbox quando consumidos por outros contextos. O catálogo canônico está em `docs/14-events/domain-events-catalog.md`.
