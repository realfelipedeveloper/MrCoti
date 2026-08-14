# ADR-0016 — SLO e perfil de carga

- **Status:** Aceito com condições — SLO/carga demonstrativos aprovados em 2026-06-26
- **Data:** 2026-06-23
- **Decisão:** usar baselines progressivos e perfil nominal/pico explícito por fase

## Contexto

“Escalável” sem volumes, latência, disponibilidade e restore não é verificável. Uma meta única também pode impor custo prematuro ou esconder classes críticas.

## Drivers

- testes de capacidade reproduzíveis;
- error budget e release gate;
- planejamento AWS/FinOps;
- crescimento para milhares de tenants;
- SLO de API, jobs, webhooks e restore.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| baselines por fase e classe | mensurável e economicamente evolutivo | requer revisão/benchmark |
| meta máxima desde MVP | ambiciosa | custo e complexidade sem demanda |
| sem números até produção | evita chute | impede arquitetura/teste/gate |

## Decisão

Adotar propostas em `docs/19-operations/slo.md` e `load-profile.md`, distinguindo local demonstrável, SaaS inicial e SaaS futuro. Medir p95/p99, erro, throughput, backlog, fairness e restore; simulações intencionais ficam classificadas. Os valores aprovados nesta rodada são objetivos técnicos demonstrativos, não promessa contratual de produção.

## Consequências

### Positivas

- qualidade e custo podem ser comparados;
- SLO guia capacidade e release;
- extração/distribuição exige evidência.

### Negativas

- números iniciais são hipóteses;
- testes de carga têm custo e precisam de dados sintéticos;
- definição inadequada pode incentivar otimização errada.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| vanity SLO | SLI ligado a jornada real |
| média esconder tenant ruidoso | percentis, fairness e cortes seguros |
| teste não representar produção | mix/versionamento e revisão periódica |
| meta sem orçamento | integrar FinOps/DR/capacidade |

## Gatilhos de revisão

- primeiro benchmark e produção;
- mudança de plano/volume/módulo;
- consumo recorrente de error budget;
- migração AWS ou mudança de arquitetura;
- compromisso contratual de disponibilidade.
