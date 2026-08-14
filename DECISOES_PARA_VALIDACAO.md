# Decisões para validação — Mr Coti

Este documento reúne tudo o que precisa de decisão humana para fechar a fundação
documental do Mr Coti. Ele foi feito para você responder por tópicos, com o mínimo
de ambiguidade possível para mim, agentes e subagentes.

> **Status em 2026-06-26:** respondido via `Sugestões por decisão.docx`, filtrado em
> `docs/18-governance/filtered-decisions-2026-06-26.md` e registrado em
> `docs/18-governance/approval-record.md`. CHK026, CHK037, CHK046, CHK081 e T067
> foram fechados com as condições registradas. CHK038 foi fechado em 2026-06-26 após
> snapshot com `refresh` e `taskflow` ativos. CHK048 permanece aberto.

Enquanto o projeto estiver em fase solo, a mesma pessoa pode exercer múltiplos
papéis. Mesmo assim, cada papel precisa ter decisão própria registrada.

## Como responder do jeito mais fácil

Você pode responder em lote usando este formato:

```text
Responsável: [nome]
Data: [AAAA-MM-DD]
Versão dos artefatos: docs/18-governance/approval-evidence-manifest.md

FND-01: APPROVED
FND-02: APPROVED
PO-01: APPROVED WITH CONDITIONS — ajustar limites Pro/Plus antes da implementação
ARCH-01: APPROVED
SEC-01: REJECTED — revisar regra de Support Readonly JIT
...
Próxima revisão prevista: [data ou marco]
```

Use uma destas decisões:

- `APPROVED`
- `APPROVED WITH CONDITIONS`
- `REJECTED`

Se preferir, você pode responder por papel:

```text
Papel: Product Owner
Responsável:
Versão dos artefatos: docs/18-governance/approval-evidence-manifest.md
Data:
Decisão geral: APPROVED WITH CONDITIONS
Itens:
- PO-01: APPROVED
- PO-02: APPROVED WITH CONDITIONS — tolerância será 15 dias, não 30
- PO-03: APPROVED
Justificativa:
Pendências:
Data prevista para revisão:
```

Não responda apenas “ok/aprovado geral” se houver ressalvas. Diga o ID do item e a
condição.

## Gates que dependem destas decisões

| Gate | Fecha quando |
| --- | --- |
| CHK026 | Product Owner/Founder aprova política comercial, limites, excedentes e vigência de plano |
| CHK037 | Product Owner, Software Architect, DevOps Lead e QA Lead aprovam SLO/carga/metas finais |
| CHK038 | Fechado quando DevOps Lead valida portas reais com `refresh`, `taskflow`/`tasks` e Docker ativos |
| CHK046 | Product Owner e Security Officer aprovam matriz RBAC |
| CHK048 | Product Owner, Security Officer e Data Governance aprovam retenção, bases e anonimização; revisão jurídica fica registrada quando aplicável |
| CHK081 / T067 | Todos os papéis obrigatórios registram decisão: Founder, Product Owner, Software Architect, Security Officer, Data Governance, DevOps Lead, QA Lead e FinOps |

## 1. Founder

### FND-01 — Visão e escopo do produto

Decidir se a fundação representa corretamente o Mr Coti como SaaS para bares,
restaurantes, lanchonetes, cafeterias, food trucks, dark kitchens, franquias e
operações similares.

Evidência: `specs/001-saas-platform-foundation/spec.md`, `docs/00-product/`.

### FND-02 — Roadmap MVP/V1/V2/V3

Decidir se a ordem evolutiva está correta:

- MVP: autenticação, tenants, usuários, permissões, unidades, produtos, categorias,
  mesas, comandas, pedidos, fechamento, pagamento fake, nota fake e e-mail fake.
- V1: estoque, compras, caixa, relatórios e SMS/WhatsApp fake.
- V2: reservas, clientes, consentimento, CRM, fidelidade e dashboard operacional.
- V3: BI, IA, marketplace, SDK, portal de desenvolvedores, multi-região e módulos
  premium.

Evidência: `docs/00-product/roadmap.md`, `spec.md` RF-037–RF-042.

### FND-03 — Trava de implementação

Decidir se permanece correta a regra de que esta etapa não autoriza código,
dependências, migrations, Docker executável, deploy real, microsserviços, commit ou
push.

Evidência: `AGENTS.md`, `spec.md`, `tasks.md`, `review-report.md`.

## 2. Product Owner

### PO-01 — Planos e limites comerciais

Decidir se aprova, rejeita ou altera os nomes e limites propostos:

| Métrica | Pro | Plus | Premium |
| --- | ---: | ---: | ---: |
| usuários ativos | 10 | 50 | 200 |
| unidades ativas | 1 | 5 | 20 |
| pedidos/mês | 5.000 | 30.000 | 150.000 |
| notificações/mês/canal | 5.000 | 50.000 | 500.000 |
| integrações instaladas | 1 | 5 | 20 |
| armazenamento lógico | 10 GB | 100 GB | 1.000 GB |

Evidência: `docs/13-entitlements/limits-by-plan.md`.

### PO-02 — Política de excedentes

Decidir:

- alertas em 80% e 100%;
- bloquear novo usuário/unidade/integração ao atingir limite;
- não interromper pedido em andamento;
- preservar leitura/exportação de dados existentes;
- tolerância proposta de 30 dias para adequação em downgrade;
- se haverá cobrança futura por excedente ou apenas exigência de upgrade.

Evidência: `docs/12-billing/overage-policy.md`.

### PO-03 — Upgrade e downgrade

Decidir:

- upgrade imediato por padrão;
- downgrade no próximo ciclo por padrão;
- preview obrigatório de impacto antes da mudança;
- política de prorrata/crédito futuro;
- restrições para tenant suspenso;
- duração da tolerância em `PAST_DUE`.

Evidência: `docs/12-billing/plan-change-policy.md`.

### PO-04 — Trial

Decidir:

- duração padrão do trial;
- elegibilidade;
- se extensão é permitida;
- quem aprova extensão;
- quais entitlements/limites valem no trial;
- comportamento ao expirar sem conversão.

Evidência: `docs/12-billing/trials.md`.

### PO-05 — Feature flags versus entitlements

Decidir se aprova que:

- entitlement é direito/limite comercial;
- feature flag é rollout técnico;
- RBAC é autorização de ator/recurso;
- os três controles são cumulativos e nenhum substitui o outro.

Evidência: `docs/13-entitlements/feature-flags-vs-entitlements.md`,
`ADR-0010`.

### PO-06 — Escopo de APIs fictícias

Decidir se pagamentos, notas e notificações continuam fictícios nesta fase e não
processam dinheiro, fiscalidade ou envio real.

Evidência: `contracts/openapi.json`, ADR-0007, ADR-0008.

## 3. Software Architect

### ARCH-01 — Arquitetura principal

Decidir se aprova:

- monólito modular;
- DDD/Clean/hexagonal;
- monorepo planejado;
- NestJS/Next.js como stack futura;
- Prisma + MySQL;
- Redis/BullMQ;
- sem microsserviços nesta fase.

Evidência: ADR-0001, ADR-0002, ADR-0003, `docs/02-architecture/`.

### ARCH-02 — Multi-tenancy

Decidir se aprova banco único com `tenant_id`, isolamento por tenant e exceções
globais justificadas.

Evidência: ADR-0004, `data-model.md`, `docs/05-database/entity-tenancy-matrix.md`.

### ARCH-03 — Eventos, outbox e ownership

Decidir se aprova:

- catálogo de eventos versionado;
- envelope padrão;
- outbox;
- consumidores idempotentes;
- owner por bounded context;
- somente o contexto owner escreve seus dados.

Evidência: `docs/14-events/`, `docs/15-ownership/`, ADR-0011.

### ARCH-04 — AWS readiness

Decidir se aprova a direção AWS-friendly sem provisionamento real nesta etapa:
ECS/EKS futuro, RDS MySQL, ElastiCache, S3, CloudFront, CloudWatch, Secrets Manager,
SES/SNS/SQS via adapters.

Evidência: `docs/02-architecture/aws-cloud-ready.md`, `docs/07-devops/`.

## 4. Security Officer

### SEC-01 — Matriz RBAC MVP

Decidir se aprova a matriz ator × comando × recurso × escopo × condição.

Pontos sensíveis para revisar:

- Platform Admin cria/suspende tenant;
- Tenant Owner altera plano;
- Unit Manager pode criar usuário apenas na própria unidade e com papel inferior;
- Organization Admin não pode conceder permissão superior à própria;
- Waiter cancela apenas pedido próprio/estado permitido;
- Cashier reabre comanda apenas com policy/motivo;
- Support Readonly só acessa auditoria com JIT, expiração e necessidade.

Evidência: `docs/18-governance/rbac-matrix-mvp.md`.

### SEC-02 — Threat model

Decidir se aprova cobertura de OWASP, IDOR/cross-tenant, brute force, rate limiting,
CORS, secrets, supply chain, webhooks e integrações fake.

Evidência: `docs/08-security/threat-model.md`.

### SEC-03 — Auditoria e logs

Decidir se aprova:

- auditoria append-only para ações críticas;
- before/after minimizado;
- correlation ID obrigatório;
- proibição de senha, token, secret, documento completo, dados de pagamento e corpo
  integral de mensagem pessoal em logs/traces.

Evidência: `docs/08-security/security-strategy.md`, `docs/09-observability/`.

### SEC-04 — Webhooks e APIs públicas

Decidir se aprova autenticação/verificação, replay protection, idempotência,
redelivery finito, erros seguros e `NotFound` sem revelar recurso de outro tenant.

Evidência: `docs/04-api/webhooks.md`, `contracts/openapi.json`.

## 5. Data Governance

### DATA-01 — Retenção por categoria

Decidir se aprova ou ajusta prazos sugeridos:

| Categoria | Retenção sugerida |
| --- | --- |
| tenant/contrato | vigência + 5 anos |
| usuário administrativo | ativo + 5 anos para trilha |
| cliente final | última interação + 2 anos |
| pedido/conta | 5 anos após transação |
| pagamento fake | 12 meses após encerramento |
| nota fake | 12 meses; artefato pode expirar em 90 dias |
| audit logs | 5 anos para eventos críticos |
| logs técnicos/traces | 30 dias hot / 90 dias total |
| notificações | conteúdo 30 dias; metadata/tentativas 12 meses |
| backups | rolling 35 dias; mensal até 12 meses |

Evidência: `docs/18-governance/data-retention-policy.md`.

### DATA-02 — Bases legais LGPD

Decidir se aprova a matriz de bases sugeridas ou se exige revisão jurídica externa
antes de qualquer produção/tratamento real.

Evidência: `docs/18-governance/legal-basis-lgpd.md`.

### DATA-03 — Anonimização e exclusão

Decidir se aprova:

- anonimização/pseudonimização/mascaramento como conceitos separados;
- tombstone para read models, busca, cache, storage e integrações;
- restore reaplicando tombstones;
- preservação de conciliação financeira/operacional sem PII.

Evidência: `docs/18-governance/anonymization-policy.md`.

### DATA-04 — Backup e legal hold

Decidir:

- se backups seguem os prazos propostos;
- como legal hold será registrado;
- quem autoriza restore com dados pessoais;
- se restore exige revalidação de isolamento por tenant.

Evidência: `docs/16-disaster-recovery/`, `docs/05-database/continuity-and-retention.md`.

## 6. DevOps Lead

### DEVOPS-01 — SLO e disponibilidade

Decidir se aprova ou altera:

- janela móvel de 28 dias;
- disponibilidade MVP/produção de 99,9%;
- futura 99,95%;
- error budget aproximado de 40,3 minutos para 99,9%;
- congelamento de release arriscado quando error budget for consumido.

Evidência: `docs/19-operations/slo.md`.

### DEVOPS-02 — Perfil de carga

Decidir se aprova ou altera envelopes:

- produção: 1.000 tenants, 5.000 unidades, 100.000 usuários, 10.000 concorrentes;
- 1.000.000 pedidos/dia;
- 20.000.000 eventos/dia;
- pico HTTP 2.000 req/s.

Evidência: `docs/19-operations/load-profile.md`.

### DEVOPS-03 — RPO/RTO e DR

Decidir:

- RPO/RTO por classe;
- frequência de teste de restore;
- responsabilidades no runbook;
- critérios para restore terminar somente após integridade/tenancy.

Evidência: `docs/16-disaster-recovery/`.

### DEVOPS-04 — Portas locais

Decidir/validar:

- iniciar ou identificar projetos `refresh` e `tasks`;
- ativar Docker local quando aplicável;
- repetir inventário;
- confirmar ou alterar portas propostas:
  - web 3400;
  - API 3200;
  - Swagger 3201;
  - MySQL 3308;
  - Redis 6380;
  - MinIO 9100/9101;
  - Mailpit 1026/8026;
  - Grafana 3401;
  - Prometheus 9091;
  - Loki 3402.

Evidência: `docs/19-operations/local-ports-inventory.md`.

## 7. QA Lead

### QA-01 — Checklist e rastreabilidade

Decidir se aprova que:

- RF-001–049, RNF-001–019 e RSD-001–016 estão rastreados;
- T001–T092 estão sequenciais;
- CHK001–CHK098 estão sequenciais;
- pendências remanescentes estão explícitas e não escondidas.

Evidência: `requirements.md`, `tasks.md`, `review-report.md`.

### QA-02 — Estratégia de testes

Decidir se aprova cobertura futura de:

- unidade;
- integração;
- API/contrato;
- isolamento tenant;
- integrações fake;
- frontend;
- E2E;
- segurança;
- capacidade/recuperação.

Evidência: `docs/06-testing/test-strategy.md`.

### QA-03 — Critérios para avançar

Decidir se aprova que esta fundação documental só libera a próxima spec de
implementação após os gates humanos, e não autoriza código automaticamente.

Evidência: `quickstart.md`, `tasks.md`, `AGENTS.md`.

## 8. FinOps

### FIN-01 — Tags e alocação de custo

Decidir se aprova tags futuras:

`Product`, `Environment`, `Service`, `Module`, `Owner`, `CostCenter`, `ManagedBy`,
`DataClassification`, `Criticality`.

Decidir também se `TenantId` só será usado em recurso dedicado e se recursos
compartilhados terão alocação por telemetria.

Evidência: `docs/17-finops/aws-cost-strategy.md`.

### FIN-02 — Budgets e alertas

Decidir se aprova ou ajusta:

- 50% do orçamento antes de 50% do mês: revisar forecast;
- 80%: alertar owner/FinOps;
- 100%: escalonar e congelar expansão não crítica;
- 120% ou anomalia diária > 30%: incidente FinOps;
- custo unitário +20% por 7 dias: investigar regressão.

Evidência: `docs/17-finops/cost-alerts.md`.

### FIN-03 — Métricas unitárias

Decidir se aprova custo por:

- pedido;
- notificação;
- GB-mês;
- milhão de eventos;
- tenant ativo;
- módulo/ambiente.

Evidência: `docs/17-finops/cost-by-tenant.md`.

### FIN-04 — Custo versus confiabilidade

Decidir se aprova a regra de que economia de custo não pode remover backup,
isolamento, segurança ou telemetria essencial.

Evidência: `docs/17-finops/aws-cost-strategy.md`.

## Resposta curta para aprovar a fundação documental com pendências explícitas

Se você concordar com as baselines documentais, mas quiser manter pendências de
produção/implementação onde já indicado, responda algo assim:

```text
Responsável: [nome]
Data: [AAAA-MM-DD]
Versão dos artefatos: docs/18-governance/approval-evidence-manifest.md

Founder: APPROVED
Product Owner: APPROVED WITH CONDITIONS
- Condições: valores comerciais, preços e cobrança real serão definidos antes da implementação de billing real.

Software Architect: APPROVED
Security Officer: APPROVED WITH CONDITIONS
- Condições: RBAC será revalidado na spec de implementação do MVP.

Data Governance: APPROVED WITH CONDITIONS
- Condições: revisão jurídica externa antes de produção/tratamento real de dados.

DevOps Lead: APPROVED WITH CONDITIONS
- Condições: CHK038 foi satisfeito em 2026-06-26; repetir preflight antes de subir a stack local futura.

QA Lead: APPROVED
FinOps: APPROVED WITH CONDITIONS
- Condições: valores monetários de budget serão definidos antes de provisionamento AWS.

Próxima revisão prevista: antes da primeira spec de implementação do MVP.
```

Eu ainda vou respeitar as condições. Por exemplo, se você aprovar DevOps com a
condição de repetir preflight de portas antes de subir a stack local futura.

## Resposta granular recomendada

Se quiser máxima precisão, responda com os IDs:

```text
FND-01: APPROVED
FND-02: APPROVED
FND-03: APPROVED
PO-01: APPROVED WITH CONDITIONS — ajustar preços depois
PO-02: APPROVED
PO-03: APPROVED
...
FIN-04: APPROVED
```

Esse formato é o mais fácil para agentes/subagentes entenderem, porque cada decisão
tem ID, papel, evidência e impacto.
