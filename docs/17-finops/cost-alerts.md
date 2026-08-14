# Alertas e governança de custo

## Baseline de alertas

| Gatilho proposto | Ação |
| --- | --- |
| 50% do orçamento antes de 50% do mês | revisar forecast e tendência |
| 80% do orçamento | alertar owner/FinOps e abrir plano de contenção |
| 100% do orçamento | escalonar Produto/Engenharia/Finanças; congelar expansão não crítica |
| 120% ou anomalia diária > 30% da baseline | incidente FinOps e investigação imediata |
| custo unitário +20% por 7 dias | analisar regressão, tenant ruidoso ou mudança de preço AWS |

Percentuais e janelas estão aprovados como estratégia demonstrativa. Budgets
monetários reais ficam pendentes até provisionamento AWS.

## Destinatários e resposta

Alertas carregam ambiente, serviço, módulo, owner, orçamento, realizado/forecast, variação e runbook; nunca PII. DevOps confirma causa técnica, FinOps/Produto avaliam impacto, owners aplicam ação segura. Kill switch comercial não é usado para desligar operação crítica sem avaliação.

## Cadência

- diário: anomalias/forecast automatizados;
- semanal: custos por ambiente, módulo e top tenants;
- mensal: reconciliação com fatura, unit economics e compromissos;
- trimestral: arquitetura versus custo/SLO e revisão de tags/orçamentos.
