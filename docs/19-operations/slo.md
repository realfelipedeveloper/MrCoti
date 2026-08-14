# SLOs demonstrativos e objetivos técnicos

**Estado:** baseline aprovada com condições. No MVP local, estes SLOs são objetivos
técnicos demonstrativos, sem promessa contratual. SLO contratual de produção
comercial exige revisão futura, benchmark e decisão de release.

| SLI | Baseline documental | Meta MVP | Meta produção | Meta futura |
| --- | --- | --- | --- | --- |
| disponibilidade API operacional | 99,5% | 99,9% | 99,9% | 99,95% |
| latência API sem provider, p95/p99 | ≤ 500 ms / ≤ 1 s | ≤ 500 ms / ≤ 1 s | ≤ 400 ms / ≤ 800 ms | ≤ 250 ms / ≤ 500 ms |
| throughput sustentável | 100 req/s | 200 req/s | 2.000 req/s | 10.000 req/s |
| job padrão até conclusão | ≤ 15 min | ≤ 10 min | ≤ 5 min | por classe, p95 ≤ 2 min |
| webhook: commit até primeira tentativa | ≤ 2 min | ≤ 60 s | ≤ 30 s | ≤ 10 s |
| notificação transacional: queue até primeira tentativa | ≤ 2 min | ≤ 60 s | ≤ 30 s | ≤ 10 s |
| restore MySQL | ≤ 4 h | ≤ 2 h | ≤ 60 min | ≤ 30 min |

## Definições

Disponibilidade mede requisições válidas elegíveis com resposta não atribuível a falha do Mr Coti. Simulações intencionais e erro do cliente são classificados separadamente. Latência usa p95/p99 por rota/classe e tenant sem cardinalidade insegura.

Jobs/webhooks/notificações têm SLO por criticidade; tempo em retry por indisponibilidade simulada é reportado, não escondido. Restore só termina após validação de integridade/tenancy.

## Error budget e aprovação

Com 99,9% em 28 dias, o budget aproximado é 40,3 minutos. Consumo acelerado congela
release arriscado e prioriza confiabilidade. Carga, janela, exclusões e targets
contratuais futuros precisam de nova revisão antes de produção comercial.
