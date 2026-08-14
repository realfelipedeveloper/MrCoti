# RPO e RTO

Metas abaixo são baselines aprovadas com condições e não SLO contratual. Para o MVP
local, RPO/RTO são demonstráveis por runbook, dump local versionado e dados
sintéticos.

| Componente/classe | Baseline documental | Meta MVP | Meta produção | Meta futura |
| --- | --- | --- | --- | --- |
| MySQL transacional | RPO ≤ 24 h / RTO ≤ 4 h | RPO ≤ 15 min / RTO ≤ 2 h | RPO ≤ 5 min / RTO ≤ 60 min | RPO ≤ 1 min / RTO ≤ 30 min |
| storage de artefatos | RPO ≤ 24 h / RTO ≤ 8 h | RPO ≤ 24 h / RTO ≤ 4 h | RPO ≤ 1 h / RTO ≤ 2 h | RPO ≤ 15 min / RTO ≤ 1 h |
| Redis/cache | sem RPO de negócio | reconstrução ≤ 30 min | reconstrução ≤ 15 min | recuperação automática ≤ 5 min |
| filas/outbox | outbox preserva intenção | backlog recuperado ≤ 2 h | backlog recuperado ≤ 1 h | backlog recuperado ≤ 15 min |
| região completa | não aplicável local | restore manual ≤ 8 h | RPO ≤ 30 min / RTO ≤ 4 h | RPO ≤ 5 min / RTO ≤ 1 h |

## Medição

RPO é diferença entre último dado confirmado antes do incidente e ponto restaurado. RTO começa na indisponibilidade/declaração conforme política e termina quando serviço íntegro volta ao SLO. Exercício registra ambos e volume/cenário.

**Condição de produção:** metas contratuais, orçamento que as sustenta, início oficial
do relógio e tier definitivo de cada módulo exigem revisão futura antes de produção
comercial.
**Condição aprovada:** no MVP local, RPO local demonstrável corresponde ao último
backup manual ou agendado; RTO local demonstrável busca restaurar o ambiente em até
1 hora a partir do README/runbook. Metas SaaS de produção exigem revisão futura.
