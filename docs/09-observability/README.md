# Observabilidade do Mr Coti

Este diretório define os sinais necessários para compreender saúde, desempenho, falhas e comportamento operacional do Mr Coti. Observabilidade serve diagnóstico e decisão; não deve se transformar em vigilância de usuários nem em cópia de dados de negócio.

## Documentos

- [Estratégia de observabilidade](./observability-strategy.md): logs, métricas, traces, healthchecks, dashboards, alertas e resposta.
- [SLOs e SLIs](./slo-sli.md): linguagem, fórmulas, indicadores, objetivos iniciais e error budgets.

## Princípios

- correlação ponta a ponta entre HTTP, domain event, outbox, job, provider e webhook;
- sinais estruturados, versionados e úteis para uma pergunta operacional;
- nenhum segredo ou dado pessoal desnecessário em logs, labels, baggage ou traces;
- baixa cardinalidade em métricas e dimensões controladas em logs;
- healthcheck simples e distinto de métrica de negócio;
- alerta acionável, com severidade, owner e runbook;
- SLO orientado à experiência do tenant, não apenas à saúde de processo;
- vendor neutrality: OpenTelemetry, Prometheus, Grafana, Loki e integrações AWS só serão adotados após ADR aplicável.

## Responsabilidades

O Observability Loop é coordenado por DevOps com Architect, agentes de implementação, QA, Security e responsáveis de domínio. Cada módulo futuro define sinais, SLI, dashboard e runbook junto com o comportamento, não depois da release.

## Limite desta etapa

Não são instalados collector, SDK, exporter, dashboard ou alerta. Os documentos estabelecem o contrato de instrumentação e as condições de aprovação para implementação futura.

