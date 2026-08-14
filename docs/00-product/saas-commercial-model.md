# Modelo SaaS e comercial

O domínio comercial detalhado e suas políticas propostas estão em
[`docs/12-billing`](../12-billing/billing-domain.md) e os limites em
[`docs/13-entitlements`](../13-entitlements/entitlements.md). Parâmetros comerciais
seguem pendentes de aprovação de Produto.

## Hierarquia

`Tenant` é a fronteira contratual e de isolamento. Um tenant possui uma ou mais empresas; empresas possuem unidades; usuários recebem vínculos e papéis em escopos autorizados.

## Ciclo do tenant

| Estado | Permissões principais |
| --- | --- |
| `PROVISIONING` | configuração interna; uso operacional bloqueado |
| `ACTIVE` | uso conforme assinatura, limites e flags |
| `PAST_DUE` | período de tolerância e avisos; políticas comerciais controlam restrições |
| `SUSPENDED` | leitura administrativa/exportação conforme política; mutações operacionais bloqueadas |
| `CANCELLING` | janela de saída e exportação |
| `CANCELLED` | acesso bloqueado; retenção e eliminação seguem política LGPD/contratual |

Transições são explícitas, autorizadas, idempotentes e auditadas.

## Planos, assinatura e limites

- `Plan` define catálogo versionado de capacidades e limites padrão.
- `Subscription` fixa a versão comercial efetiva, ciclo e estado.
- `Entitlement` resolve se uma feature está disponível ao tenant.
- `UsageCounter` mede consumo no período com chave idempotente.
- Overrides comerciais têm motivo, autor, validade e trilha de auditoria.

Upgrade pode habilitar capacidades imediatamente. Downgrade precisa de análise de incompatibilidade (por exemplo, unidades ou usuários acima do novo limite) e plano de remediação; dados nunca são apagados silenciosamente.

## Resolução de acesso a features

Uma ação é permitida somente se: tenant ativo, assinatura válida, feature existente no ambiente, plano/override concedendo a feature, flag de rollout permitindo-a, limite não excedido e usuário autorizado por RBAC/policy. Deny prevalece em kill switch de segurança.

## Billing futuro

O domínio registra eventos comerciais (`SubscriptionActivated`, `PlanChanged`, `UsageRecorded`) sem acoplar um provedor. Cobrança real será conectada por porta/adaptador após ADR e requisitos próprios.

## Marketplace futuro

Integrações/extensões terão manifesto, permissões mínimas, versão, isolamento de credenciais, eventos assinados e processo de revisão. O marketplace não terá acesso implícito a todos os tenants ou módulos.
