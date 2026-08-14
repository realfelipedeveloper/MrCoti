# ADR-0009 — Domínio de Billing

- **Status:** Aceito com condições para modelagem; cobrança real fora de escopo
- **Data:** 2026-06-23
- **Decisão:** Billing será subdomínio futuro do Core SaaS, sem processamento financeiro real nesta fase

## Contexto

O Mr Coti precisa governar planos, assinatura, trial, limites, excedentes, upgrade, downgrade, inadimplência, suspensão, reativação e cancelamento. Misturar essas regras em Tenant ou em um gateway de pagamento impediria histórico, evolução comercial e isolamento de responsabilidades.

## Drivers

- SaaS multi-plano desde a origem;
- versões comerciais imutáveis e auditáveis;
- separação de cobrança real, pagamento fake e direito de uso;
- mudanças idempotentes e sem perda de dados;
- futura integração de billing por porta/adaptador;
- medição de uso e excedente por tenant.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| Billing como subdomínio do Core SaaS | coesão comercial, transação local e evolução gradual | exige fronteiras internas rigorosas |
| campos de plano diretamente em Tenant | simples inicialmente | sem versão/histórico; regras espalhadas |
| serviço externo de billing desde o MVP | capacidades prontas | lock-in, custo e integração real fora do escopo |

## Decisão

Modelar `Plan/PlanVersion`, `Subscription`, `Trial`, `EntitlementSet`, `UsageMeasurement`, `OverageDecision`, `PlanChange` e histórico comercial. O módulo publica fatos por outbox e oferece decisão comercial normalizada. Não haverá preço, fatura, cartão ou provider real até nova Spec/ADR.

Upgrade é imediato e downgrade no próximo ciclo como baseline; dados não são
apagados. Planos, trial, excedentes e mudança de plano foram aprovados com condições
em 2026-06-26 para o MVP local demonstrável. Valores comerciais, prorrata/crédito
real e cobrança futura exigem revisão específica antes de venda ou produção.

## Consequências

### Positivas

- direito comercial e histórico ficam explícitos;
- billing real poderá entrar por adapter;
- alterações de plano não reescrevem passado;
- overage/limites são testáveis.

### Negativas

- mais conceitos antes do provider real;
- consistência entre assinatura, entitlement e cache exige disciplina;
- política comercial ainda bloqueia parte da implementação.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| virar gateway financeiro acidentalmente | fronteira explícita e proibição de cobrança real |
| alteração retroativa de plano | `PlanVersion` imutável |
| downgrade apagar/bloquear operação crítica | preview, vigência, tolerância e nunca deletar |
| medição duplicada | usage idempotente e período canônico |

## Gatilhos de revisão

- seleção de provider de billing real;
- exigência de prorrata, impostos ou invoice comercial;
- marketplace gerar revenue share;
- volume exigir escala independente comprovada;
- legislação/contrato alterar ciclo ou retenção comercial.
