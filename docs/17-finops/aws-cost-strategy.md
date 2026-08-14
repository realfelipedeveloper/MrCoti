# Estratégia FinOps para AWS

Este documento não configura recursos AWS. Ele define como custo será tornado visível,
atribuível e governável. FinOps permanece documental até existir AWS real.

## Dimensões

- conta/ambiente: local, development, homologation, staging, production;
- produto/módulo: API/web, workers, MySQL, Redis/filas, storage/CDN, notificações, observabilidade;
- custo direto e compartilhado por tenant;
- custo unitário: por pedido, notificação, GB-mês, milhão de eventos e tenant ativo;
- compromisso versus on-demand e custo de ociosidade.

## Tags AWS obrigatórias futuras

`Product=MrCoti`, `Environment`, `Service`, `Module`, `Owner`, `CostCenter`, `ManagedBy`, `DataClassification`, `Criticality`. `TenantId` só é tag de recurso dedicado; recursos compartilhados usam alocação por telemetria, evitando explosão/PII em tags.

## Orçamento proposto

Cada ambiente recebe orçamento mensal, forecast e owner. Produção possui reserva de
crescimento/incidente; ambientes não produtivos têm agendamento/TTL quando seguro.
Valores monetários reais ficam pendentes até provisionamento AWS.

## Otimização sem comprometer confiabilidade

- right-sizing guiado por p95/p99, backlog e pool de conexões;
- autoscaling com limites de custo e capacidade;
- lifecycle/compactação de objetos e logs;
- retenção de métricas/traces por valor;
- RDS/ElastiCache dimensionados por SLO, não média simples;
- revisar custo de alta disponibilidade contra RPO/RTO aprovados;
- nenhuma economia remove backup, isolamento, segurança ou telemetria essencial.

## Risco de escala

Cardinalidade de logs/métricas, relatórios pesados, retries, egress, imagens, notificações e tenants ruidosos podem crescer mais rápido que receita. Quotas, sampling, lifecycle, fairness e métricas unitárias são controles obrigatórios.
