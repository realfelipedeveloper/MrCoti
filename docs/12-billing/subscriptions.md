# Assinaturas

## Máquina de estados

| De | Para | Condições mínimas |
| --- | --- | --- |
| `PENDING` | `TRIALING` | tenant elegível e trial configurado |
| `PENDING`/`TRIALING` | `ACTIVE` | plano/version vigentes e ativação autorizada |
| `ACTIVE` | `PAST_DUE` | inadimplência futura informada por adapter autorizado |
| `PAST_DUE` | `ACTIVE` | regularização e reativação idempotente |
| `PAST_DUE` | `SUSPENDED` | tolerância expirada e aprovação da política |
| `ACTIVE` | `CANCELLING` | cancelamento agendado para fim do ciclo |
| `SUSPENDED`/`CANCELLING` | `CANCELLED` | data efetiva e workflow de saída iniciado |

Toda transição inclui tenant, versão anterior/nova, razão, ator/sistema, instante, effective-at e correlation ID.

## Inadimplência e suspensão

`PAST_DUE` não apaga entitlements nem dados. A baseline aprovada com condições propõe
avisos e tolerância antes da suspensão. Para o MVP local, novas criações podem ser
bloqueadas quando aplicável e operações em andamento devem ser preservadas. Duração
comercial exata e cobrança real exigem revisão futura. Exportação administrativa e
regularização devem continuar possíveis conforme segurança.

## Reativação

Reativação valida plano vigente, recalcula entitlements, encerra restrições, invalida cache e registra histórico. Jobs suspensos não são retomados cegamente: cada intenção é revalidada e deduplicada.

## Cancelamento

Cancelamento preserva dados pelo prazo aprovado, oferece exportação e inicia retenção/anonimização. Não reaproveita identificador de assinatura e não reabre uma assinatura `CANCELLED` silenciosamente.
