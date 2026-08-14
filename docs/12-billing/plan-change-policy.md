# Política de mudança de plano

**Estado:** baseline demonstrativa aprovada com condições; prorrata/crédito e
cobrança real permanecem documentais até billing comercial.

## Upgrade

- vigência imediata por padrão, registrada com `effective_at`;
- entitlements/limites aumentam atomicamente e caches são invalidados;
- feature flags técnicas continuam independentes: direito adquirido não força rollout;
- nenhuma cobrança real é criada nesta etapa;
- prorrata/crédito futuro permanecem somente documentados no MVP local;
- falha parcial mantém a versão anterior e permite retry idempotente.

## Downgrade

- vigência no próximo ciclo por padrão;
- preview lista features removidas e usuários, unidades, integrações, storage e uso acima do novo limite;
- dados existentes nunca são apagados;
- até a vigência, direitos atuais permanecem; depois, bloqueia-se crescimento e inicia-se adequação conforme `overage-policy.md`;
- módulos removidos deixam de aceitar mutações, mantendo exportação/leitura definida pela política.

## Inadimplência, suspensão e reativação

`PAST_DUE` inicia avisos/tolerância. Expirada a tolerância aprovada, `SUSPENDED` restringe mutações. Reativação após regularização recalcula entitlement/flags, invalida cache e revalida jobs. Nenhum job financeiro, notificação ou integração é repetido sem idempotência.

## Concorrência e histórico

Mudança usa versão otimista da assinatura. Cada solicitação possui idempotency key. O histórico guarda plano anterior/novo, vigência, ator, origem, justificativa, impactos aceitos e overrides.

**Condição aprovada:** prorrata, crédito futuro e cobrança real ficam documentais
até billing comercial. Restrições de tenant suspenso devem ser reavaliadas na spec de
implementação afetada.
