# ADR-0010 — Feature Flags versus Entitlements

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** rollout técnico, direito comercial e autorização serão controles distintos e cumulativos

## Contexto

Uma capacidade pode estar tecnicamente disponível, incluída ou não no plano, limitada em volume e autorizada apenas a certos usuários. Um único booleano não representa essas dimensões e permite bypass comercial ou de segurança.

## Drivers

- kill switch e rollout seguros;
- planos/limites auditáveis;
- overrides temporários;
- RBAC server-side;
- respostas explicáveis e cacheáveis;
- ausência de liberação por falha.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| separar flags, entitlements, limits e RBAC | semântica clara e defesa em profundidade | mais etapas na avaliação |
| feature flag representar plano | implementação curta | mistura operação/comercial e dificulta billing |
| RBAC representar módulos | centraliza acesso | papéis não representam contrato/rollout |

## Decisão

Aplicar a ordem: tenant → assinatura → plano → entitlement → override comercial → feature flag/kill switch → limite → RBAC/policy. Uma etapa positiva não contorna as seguintes; segurança, suspensão e kill switch negam. Cache inclui ambiente, tenant, versão comercial e configuração.

## Consequências

### Positivas

- rollout não concede licença;
- plano não concede permissão;
- decisão possui reason code e owner;
- módulos premium/beta usam a mesma base.

### Negativas

- invalidação e teste combinatório são necessários;
- indisponibilidade do avaliador exige fallback por risco;
- UX precisa distinguir motivo de bloqueio sem vazar dados.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| ordem divergente entre frontend/backend | backend canônico e tabela de decisão |
| cache obsoleto após plano/flag | versão + evento de invalidação |
| override permanente | expiração, motivo e revisão |
| falha abrir feature premium | fail-closed/default conservador |

## Gatilhos de revisão

- adoção de plataforma externa de flags/entitlements;
- pricing baseado em uso real;
- rollout percentual/segmentação complexa;
- marketplace com licenças de terceiros.
