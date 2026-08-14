# Entitlements

Entitlement é o direito comercial efetivo de um tenant usar uma capacidade ou consumir uma quantidade. Ele deriva de `PlanVersion`, assinatura, overrides comerciais e uso; não deriva do papel do usuário.

## Tipos

- booleano: módulo incluído/excluído;
- quantitativo: usuários, unidades, pedidos, notificações, integrações, armazenamento;
- rate/capacidade: chamadas por período, concorrência, retenção;
- temporal: trial, beta contratual ou override com expiração.

## Ordem de decisão

1. tenant existe e está em estado operacional permitido;
2. assinatura está ativa ou em estado de tolerância permitido;
3. `PlanVersion` vigente é resolvida no instante da ação;
4. entitlements/limites do plano são carregados;
5. overrides comerciais válidos são aplicados e auditados;
6. feature flag técnica/kill switch permite disponibilização;
7. contador/reserva de limite é avaliado atomicamente;
8. RBAC/policy autoriza o usuário no recurso e escopo.

Qualquer negação retorna código de razão estável sem revelar dados de outro tenant. Kill switch e segurança sempre prevalecem.

## Governança

Chaves são estáveis e versionadas; unidade/período são obrigatórios; alterações geram histórico e invalidam cache. Contadores usam reserva/commit/release para operações concorrentes e idempotência para retries.
