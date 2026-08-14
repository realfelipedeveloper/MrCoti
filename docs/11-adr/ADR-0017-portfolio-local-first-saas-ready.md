# ADR-0017 — Portfolio local-first, commercial SaaS-ready

- **Status:** Aceito
- **Data:** 2026-06-26

## Contexto

O Mr Coti é inicialmente um projeto de portfólio executado em máquina individual. Ao
mesmo tempo, a documentação exige fundação SaaS madura: multi-tenancy, RBAC,
entitlements, feature flags, eventos, outbox, OpenAPI, adapters, AWS-ready e
escalabilidade futura.

Sem uma decisão explícita, há dois riscos opostos: subarquitetar como CRUD local sem
futuro ou superarquitetar como plataforma distribuída antes de necessidade real.

## Decisão

O Mr Coti DEVE iniciar como portfolio local-first e commercial SaaS-ready.

A implementação inicial deve priorizar simplicidade operacional local, Docker Compose
futuro, dados sintéticos, providers fake e documentação clara. A arquitetura deve
preservar fronteiras SaaS e permitir evolução futura sem reescrita estrutural.

Microsserviços NÃO são usados no início. Extração futura exige evidência objetiva:
escala, gargalo medido, deploy independente, equipe separada, SLA distinto ou custo
operacional justificável.

## Consequências

- O MVP local é demonstrável, não necessariamente vendável.
- AWS readiness é diretriz arquitetural, não requisito de deploy inicial.
- Billing real, fiscalidade real, observabilidade gerenciada, alta disponibilidade,
  Kubernetes/EKS e deploy AWS ficam fora do MVP local.
- O monólito modular deve manter boundaries fortes para extração futura.

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
| --- | --- |
| CRUD local simples | não demonstra maturidade SaaS nem prepara evolução |
| Microsserviços desde o início | aumenta custo local, debug, observabilidade, deploy e consistência antes de necessidade |
| SaaS cloud real já no MVP | antecipa custo, operação e risco sem ganho proporcional para portfólio |
