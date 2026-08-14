# Feature flags técnicas

Feature flags são parte do Core SaaS do **Mr Coti**. Elas permitem ativação gradual,
beta por tenant e desligamento emergencial sem espalhar condicionais inconsistentes.
Composição de planos e limites pertence a
[`docs/13-entitlements`](../13-entitlements/feature-flags-vs-entitlements.md); RBAC
continua sendo a autorização do ator, conforme ADR-0010.

## Modelo conceitual

| Conceito | Papel |
|---|---|
| **FeatureDefinition** | Chave estável, descrição, tipo, estado de ciclo de vida e valor padrão seguro |
| **EnvironmentRule** | Disponibilidade por `local`, `development`, `homologation`, `staging` ou `production` |
| **PlanEntitlement** | Habilitação e limites padrão de uma feature em um plano |
| **TenantOverride** | Exceção auditada para um tenant, com motivo e validade opcional |
| **UsageCounter** | Consumo tenant-aware em uma janela definida |
| **FeatureEvaluation** | Resultado e razão da avaliação para contexto, feature e instante |

Chaves são imutáveis e legíveis, por exemplo `crm.enabled`, `reservations.enabled` e `integrations.payment.fake`. Remover uma feature exige primeiro remover consumidores e depois arquivar a definição.

## Ordem de avaliação

Para uma ação, o serviço de aplicação avalia nesta ordem:

1. tenant existe e está ativo;
2. definição da feature está ativa;
3. ambiente permite a feature e não há kill switch;
4. plano concede o entitlement;
5. override de tenant, quando permitido, ajusta a concessão;
6. limites e janela de uso permitem a ação;
7. RBAC e regras do recurso autorizam o usuário.

O resultado é `enabled`, `disabled` ou `limited`, sempre acompanhado de uma razão estável. **Feature flag não substitui autorização** e um usuário sem permissão continua bloqueado.

## Regras operacionais

- Defaults de produção são conservadores; ausência ou falha de configuração não libera features premium.
- Kill switch de ambiente prevalece sobre plano e tenant.
- Overrides têm autor, motivo, timestamps e, preferencialmente, expiração para betas.
- Alterações são auditadas e propagadas com invalidação de cache.
- A fonte de verdade é MySQL. Redis pode armazenar avaliações cacheadas de curta duração.
- Cache keys incluem ambiente, tenant, feature e versão da configuração.
- Avaliações críticas podem ignorar cache após suspensão, downgrade ou desligamento emergencial.
- Jobs reavaliam a feature antes de efeitos irreversíveis; não confiam indefinidamente no estado do momento de enfileiramento.

## Limites por plano

Um limite define métrica, valor, janela e política de excedente. Contadores devem ser idempotentes para evitar cobrança ou bloqueio duplicado. Onde consistência estrita for essencial, a reserva do limite ocorre em transação no MySQL; Redis pode acelerar leitura, mas não é autoridade única.

O comportamento ao atingir o limite é explícito: bloquear nova criação, manter leitura, oferecer upgrade ou permitir tolerância configurada. Downgrade nunca apaga recursos automaticamente; impede crescimento e inicia um fluxo assistido quando o uso estiver acima do novo plano.

## Rollout e ciclo de vida

1. cadastrar a definição desabilitada por padrão;
2. habilitar em ambiente não produtivo;
3. habilitar tenants internos ou beta por override;
4. observar erros, latência e uso;
5. expandir por plano/tenant;
6. tornar o comportamento padrão quando estável;
7. remover condicionais antigas e arquivar a flag temporária.

Rollout percentual somente deve ser introduzido mediante especificação de chave de segmentação estável e ADR se exigir tecnologia adicional. Flags permanentes de entitlement não seguem necessariamente o mesmo ciclo das flags temporárias de release.

## Auditoria e privacidade

Registrar quem alterou definição, plano ou override, valores anterior/novo, motivo, tenant afetado e instante. Logs de avaliação agregados não devem conter dados pessoais. A interface administrativa exige permissão específica e proteção contra alteração cruzada de tenant.

## Testes mínimos

- tabela de decisão cobrindo ambiente, plano, tenant, limite e RBAC;
- defaults e falha fechada em configuração ausente;
- suspensão, upgrade e downgrade;
- expiração de override e invalidação de cache;
- isolamento entre tenants com a mesma feature;
- idempotência e concorrência dos contadores de limite.
