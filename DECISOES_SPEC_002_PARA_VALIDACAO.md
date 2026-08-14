# Decisões para validação — Spec 002 MVP dev/local

Este documento reuniu as decisões humanas necessárias para aprovar ou rejeitar a
spec `002-mvp-local-first-slice` e liberar, se aprovado, o início das tarefas locais
de implementação do MVP do Mr Coti.

Ele segue o mesmo modelo do documento anterior de decisões, com IDs, papel,
evidência, decisão, justificativa, pendências e próxima revisão.

> **Status em 2026-07-11:** APROVADA COM CONDIÇÕES. A fundação
> `001-saas-platform-foundation` está aprovada com condições. A spec 002 foi
> reformulada para **dev/local only**, usando Docker Desktop/local Docker como runtime
> local após aprovação e mantendo AWS-ready como prontidão arquitetural. CHK048 permanece `PENDING LEGAL REVIEW` apenas como
> gatilho futuro se produção ou dados pessoais reais forem reabertos. O gate
> específico desta spec, CHK024, foi satisfeito por Felipe Almeida em 2026-07-11.
> T001–T003 também foram concluídas; a implementação deve prosseguir em ordem a
> partir de T004, respeitando `specs/002-mvp-local-first-slice/approval-record.md`.

## Resultado registrado

- **Decisão geral:** APPROVED WITH CONDITIONS.
- **Responsável:** Felipe Almeida.
- **Data:** 2026-07-11.
- **Registro canônico:** `specs/002-mvp-local-first-slice/approval-record.md`.
- **Efeito:** CHK024 satisfeito; T001–T003 concluídas; implementação dev/local
  autorizada em ordem pelas tasks.
- **Limites preservados:** sem `local-prod`, produção, AWS real, provedores reais,
  dados reais, billing real, fiscalidade real, microsserviços ou broker externo.

Enquanto o projeto estiver em fase solo, a mesma pessoa pode exercer múltiplos
papéis. Mesmo assim, cada papel precisa ter decisão própria registrada.

## Como responder do jeito mais fácil

Bloco histórico usado como modelo de resposta em lote:

```text
Responsável: Felipe Almeida
Data: 2026-07-11
Versão dos artefatos: docs/18-governance/approval-evidence-manifest.md
Spec: specs/002-mvp-local-first-slice

SPEC-01: APPROVED
SPEC-02: APPROVED
SPEC-03: APPROVED
SPEC-04: APPROVED
Founder: APPROVED
Product Owner: APPROVED
Software Architect: APPROVED
Security Officer: APPROVED WITH CONDITIONS — todo endpoint sensível deve nascer com auth/RBAC/testes
Data Governance: APPROVED WITH CONDITIONS — apenas dados sintéticos; CHK048 não será perseguido agora
DevOps Lead: APPROVED WITH CONDITIONS — Docker Desktop/local Docker será usado no dev/local após gate; repetir preflight antes de subir stack local
QA Lead: APPROVED
FinOps: APPROVED

Decisão geral: APPROVED WITH CONDITIONS
Justificativa: autorizo iniciar a implementação dev/local com dados sintéticos conforme a spec 002, usando Docker Desktop/local Docker e preservando AWS-ready sem produção ativa.
Pendências: local-prod, produção, dados reais, AWS real, provedores reais, billing real e fiscalidade real continuam fora de escopo; CHK048 permanece gatilho futuro.
Próxima revisão prevista: após T001–T003 ou antes do primeiro scaffold.
```

Use uma destas decisões:

- `APPROVED`
- `APPROVED WITH CONDITIONS`
- `REJECTED`

Se preferir, responda por papel:

```text
Papel: Software Architect
Responsável: Felipe Almeida
Versão dos artefatos: docs/18-governance/approval-evidence-manifest.md
Spec: specs/002-mvp-local-first-slice
Data: 2026-07-11
Decisão geral: APPROVED WITH CONDITIONS
Itens:
- ARCH2-01: APPROVED
- ARCH2-02: APPROVED
- ARCH2-03: APPROVED WITH CONDITIONS — revisar outbox antes do fechamento final
Justificativa:
Pendências:
Data prevista para revisão:
```

Não responda apenas “ok” ou “aprovado geral” se houver ressalvas. Diga o ID do item
e a condição.

## Gates que dependiam destas decisões

| Gate | Fecha quando |
| --- | --- |
| CHK024 da spec 002 | Fechado em 2026-07-11 por aprovação explícita de Felipe Almeida |
| T001–T003 da spec 002 | Concluídos em 2026-07-11; spec dev/local, dados sintéticos e preflight local reconfirmados antes de scaffold |
| CHK048 da fundação | Permanece `PENDING LEGAL REVIEW` como gatilho futuro se produção/dados pessoais reais forem reabertos |

## 1. Decisão geral da spec

### SPEC-01 — Aprovar a spec 002 como próxima fatia local

Decidir se a spec `002-mvp-local-first-slice` representa corretamente o próximo passo
do Mr Coti: uma fatia local demonstrável, com dados sintéticos, cobrindo login,
tenant/unidade, catálogo, mesa/comanda, itens, fechamento e pagamento fake.

Evidência:

- `specs/002-mvp-local-first-slice/spec.md`
- `specs/002-mvp-local-first-slice/review-report.md`

### SPEC-02 — Autorizar início de tarefas de código locais

Decidir se, após fechar CHK024, as tarefas T001–T053 podem começar em ordem,
incluindo scaffold controlado, backend, frontend, testes e gates locais.

Evidência:

- `specs/002-mvp-local-first-slice/tasks.md`
- `AGENTS.md`

### SPEC-03 — Preservar limites de escopo

Decidir se permanecem fora desta fatia:

- `local-prod`;
- staging/homologação;
- produção;
- dados pessoais reais;
- AWS real provisionada;
- billing real;
- pagamento real;
- fiscalidade real;
- e-mail/SMS/WhatsApp reais;
- nota fake/e-mail fake neste primeiro corte;
- estoque, caixa avançado, relatórios, CRM, BI, IA, marketplace e SDK;
- microsserviços.

Evidência:

- `specs/002-mvp-local-first-slice/spec.md`
- `specs/002-mvp-local-first-slice/plan.md`

### SPEC-04 — Usar Docker local ativo e preservar AWS-ready sem produção ativa

Decidir se aprova que o alvo executável desta fase seja somente dev/local, mantendo:

- Docker Desktop/local Docker como runtime da aplicação local após CHK024 e T001–T003;
- portas configuráveis e preflight obrigatório;
- AWS readiness como diretriz arquitetural, sem provisionar AWS real;
- ausência de `local-prod`, staging/homologação e produção nesta spec.

Evidência:

- `docs/11-adr/ADR-0019-dev-local-only-active-scope.md`
- `specs/002-mvp-local-first-slice/spec.md`
- `specs/002-mvp-local-first-slice/plan.md`

## 2. Founder

### FND2-01 — Valor de portfólio

Decidir se a fatia local proposta demonstra valor suficiente para portfólio técnico:
uma jornada completa e operável, em vez de apenas scaffold vazio.

Evidência: `spec.md`, US-01–US-05, CS-001.

### FND2-02 — Dev/local sem promessa comercial

Decidir se está correto manter a fatia como dev/local e demonstrável, sem venda,
SLA, `local-prod`, produção, AWS real ou promessa comercial, usando Docker
Desktop/local Docker no dev/local e preservando AWS-ready como arquitetura.

Evidência: `spec.md`, “Fora de escopo”; `plan.md`.

## 3. Product Owner

### PO2-01 — Escopo funcional do primeiro corte

Decidir se aprova este corte funcional:

- login local sintético;
- tenant/unidade;
- RBAC mínimo;
- categorias/produtos;
- mesas;
- comandas;
- itens;
- fechamento;
- pagamento fake.

Evidência: `spec.md`, RF-001–016.

### PO2-02 — O que fica para depois

Decidir se aprova adiar para incrementos posteriores:

- nota fake;
- e-mail fake;
- SMS/WhatsApp fake;
- estoque;
- compras;
- caixa avançado;
- relatórios;
- clientes/reservas/CRM.

Evidência: `spec.md`, “Fora de escopo”; `docs/00-product/roadmap.md`.

### PO2-03 — Dados sintéticos de demonstração

Decidir se aprova nomes/e-mails sintéticos `.local`, produtos demo e tenant demo
como base de demonstração.

Evidência: `data-model.md`, “Dados sintéticos sugeridos”.

### PO2-04 — Pagamento fake embutido neste corte

Decidir se aprova pagamento fake simples apenas para fechar a jornada, sem gateway,
cartão, PIX, adquirente, chargeback real ou conciliação bancária.

Evidência: `research.md` D-06; `spec.md` RF-011/RSD-009.

## 4. Software Architect

### ARCH2-01 — Monorepo e monólito modular

Decidir se aprova que a futura implementação comece com monorepo, backend NestJS,
frontend Next.js e módulos internos, sem microsserviços.

Evidência: `plan.md`, `docs/02-architecture/modular-monolith.md`, ADR-0001/0002.

### ARCH2-02 — Fronteiras dos módulos

Decidir se aprova os módulos da fatia:

- Plataforma/IAM;
- Organização;
- Catálogo;
- Operação;
- Pagamentos Fake;
- Governança/Auditoria;
- Eventos/Outbox.

Evidência: `plan.md`, “Limites de domínio”; `data-model.md`.

### ARCH2-03 — Outbox desde o fluxo crítico

Decidir se aprova persistir outbox para:

- `TabOpened.v1`;
- `OrderItemAdded.v1`;
- `BillClosed.v1`;
- `FakePaymentRecorded.v1`.

Evidência: `research.md` D-05; `data-model.md`, “Eventos de domínio/outbox”.

### ARCH2-04 — Contrato OpenAPI da fatia

Decidir se aprova o contrato REST local em `/api/v1`, com auth, catálogo, mesas,
comandas, itens, fechamento, erros, correlação e idempotência.

Evidência: `contracts/openapi.json`.

## 5. Security Officer

### SEC2-01 — Nenhuma rota sensível sem auth/RBAC

Decidir se aprova que todo endpoint sensível da futura implementação deve possuir:

- autenticação server-side;
- autorização/RBAC;
- policy/guard;
- teste positivo;
- teste negativo;
- teste de isolamento tenant quando aplicável.

Evidência: `spec.md` RSD-001/RSD-002; `tasks.md` T011–T013, T048.

### SEC2-02 — Dados reais proibidos

Decidir se aprova que fixtures, seeds, logs, prints e exemplos devem usar somente
dados sintéticos. CHK048 permanece `PENDING LEGAL REVIEW` apenas como gatilho futuro
se produção ou dados pessoais reais forem reabertos.

Evidência: `spec.md` RSD-003/RSD-010; `data-model.md`.

### SEC2-03 — Erros seguros e anti-IDOR

Decidir se aprova que erros de autorização/IDOR não devem revelar existência de
recurso de outro tenant.

Evidência: `spec.md` RSD-006; `contracts/openapi.json`.

### SEC2-04 — Rate limiting/proteção equivalente

Decidir se aprova exigir rate limiting ou proteção equivalente para login e mutações
críticas quando implementadas.

Evidência: `spec.md` RSD-008; `tasks.md` T043.

## 6. Data Governance

### DATA2-01 — Escopo dev/local e CHK048 como gatilho futuro

Decidir se aprova que, nesta fase, não vale a pena perseguir revisão jurídica porque
o produto não terá produção nem dados pessoais reais. CHK048 permanece
`PENDING LEGAL REVIEW` apenas como gatilho futuro se esse escopo mudar, sem bloquear
a implementação dev/local sintética.

Evidência:

- `specs/001-saas-platform-foundation/checklists/requirements.md`
- `specs/002-mvp-local-first-slice/spec.md` RSD-010

### DATA2-02 — Seeds e fixtures sintéticos

Decidir se aprova que dados de demo sejam `.local` e claramente fictícios, sem
telefone, CPF, CNPJ, e-mail real, cliente real ou segredo real.

Evidência: `data-model.md`, “Dados sintéticos sugeridos”; `tasks.md` T014/T049.

### DATA2-03 — Auditoria mínima sem PII

Decidir se aprova auditoria com ator, tenant, unidade, ação, recurso, motivo e
correlação, minimizando before/after sensível.

Evidência: `spec.md` RSD-007; `data-model.md` `AuditEntry`.

## 7. DevOps Lead

### DEVOPS2-01 — Portas locais do Mr Coti

Decidir se aprova as portas futuras sugeridas:

| Componente | Porta |
| --- | ---: |
| Web | 3400 |
| API | 3200 |
| Swagger preview opcional | 3201 |
| MySQL | 3308 |
| Redis | 6380 |
| MinIO | 9100/9101 |
| Mailpit | 1026/8026 |
| Grafana | 3401 |
| Prometheus | 9091 |
| Loki | 3402 |

Evidência: `docs/19-operations/local-ports-inventory.md`.

### DEVOPS2-02 — Preflight obrigatório antes de subir stack

Decidir se aprova repetir `docker ps` e listeners TCP antes de qualquer Docker Compose
do Mr Coti.

Evidência: `quickstart.md`, “Preflight local antes de subir stack futura”.

### DEVOPS2-03 — Docker Desktop/local Docker após aprovação

Decidir se aprova que Docker Compose executável, banco local e Redis só sejam criados
após CHK024 e T001–T003.

Evidência: `tasks.md`, Fase 0 e Fase 1.

### DEVOPS2-04 — Sem local-prod/prod nesta spec

Decidir se aprova que DevOps nesta fase cobre apenas ambiente dev/local: Docker
Desktop/local Docker, portas, Docker Compose local após gate, `.env.example`, scripts
e gates locais. `local-prod`, produção, deploy real e AWS real ficam fora desta spec.

Evidência: `docs/11-adr/ADR-0019-dev-local-only-active-scope.md`; `plan.md`.

## 8. QA Lead

### QA2-01 — Testes mínimos obrigatórios

Decidir se aprova que a fatia só será demonstrável com:

- unitários;
- integração;
- contrato OpenAPI;
- auth/RBAC negativo;
- isolamento tenant;
- E2E da jornada principal;
- scan/checklist de dados reais/segredos.

Evidência: `tasks.md` T044–T049; `spec.md` CS-002–CS-008.

### QA2-02 — Tasks T001–T053

Decidir se aprova a fila de tarefas planejada e sua ordem de dependência.

Evidência: `tasks.md`.

### QA2-03 — Critério para fechar a spec 002

Decidir se aprova que a feature só fecha quando CS-001–CS-008 passarem e não houver
dado real, provider real, `local-prod`, produção, AWS real, billing real, fiscalidade
real ou microsserviço.

Evidência: `tasks.md`, “Critério de conclusão”; `review-report.md`.

## 9. FinOps

### FIN2-01 — Sem custo cloud nesta fatia

Decidir se aprova que esta fatia não usa AWS real, não exige budget monetário agora
e mantém AWS readiness apenas como desenho arquitetural.

Evidência: `plan.md`, “Contexto técnico”; `spec.md`, fora de escopo.

### FIN2-02 — Custo local e observabilidade futura

Decidir se aprova registrar custo/complexidade apenas como local-first por enquanto,
mantendo FinOps AWS para fases futuras.

Evidência: `docs/17-finops/`, `plan.md`.

## Resposta curta usada para aprovar início local

Se concordar com a spec 002 como está:

```text
Responsável: Felipe Almeida
Data: 2026-07-11
Versão dos artefatos: docs/18-governance/approval-evidence-manifest.md
Spec: specs/002-mvp-local-first-slice

Founder: APPROVED
Product Owner: APPROVED
Software Architect: APPROVED
Security Officer: APPROVED WITH CONDITIONS
- Condições: nenhum endpoint sensível sem auth/RBAC/testes; sem dados reais.
Data Governance: APPROVED WITH CONDITIONS
- Condições: CHK048 permanece PENDING LEGAL REVIEW apenas como gatilho futuro se produção/dados reais forem reabertos.
DevOps Lead: APPROVED WITH CONDITIONS
- Condições: Docker Desktop/local Docker será usado no dev/local após gate; repetir preflight antes de subir stack local; sem local-prod/prod nesta spec.
QA Lead: APPROVED
FinOps: APPROVED

Decisão geral: APPROVED WITH CONDITIONS
Justificativa: autorizo iniciar a implementação dev/local da fatia vertical com dados sintéticos conforme a spec 002, usando Docker Desktop/local Docker e preservando AWS-ready sem produção ativa.
Pendências: local-prod, produção, dados reais, AWS real, billing real, fiscalidade real e provedores reais continuam fora de escopo.
Próxima revisão prevista: após T001–T003 e antes do primeiro scaffold executável.
```

## Resposta granular recomendada

Se quiser máxima precisão:

```text
SPEC-01: APPROVED
SPEC-02: APPROVED
SPEC-03: APPROVED
SPEC-04: APPROVED
FND2-01: APPROVED
FND2-02: APPROVED
PO2-01: APPROVED
PO2-02: APPROVED
PO2-03: APPROVED
PO2-04: APPROVED
ARCH2-01: APPROVED
ARCH2-02: APPROVED
ARCH2-03: APPROVED
ARCH2-04: APPROVED
SEC2-01: APPROVED
SEC2-02: APPROVED
SEC2-03: APPROVED
SEC2-04: APPROVED
DATA2-01: APPROVED WITH CONDITIONS — CHK048 fica apenas como gatilho futuro
DATA2-02: APPROVED
DATA2-03: APPROVED
DEVOPS2-01: APPROVED
DEVOPS2-02: APPROVED
DEVOPS2-03: APPROVED
DEVOPS2-04: APPROVED
QA2-01: APPROVED
QA2-02: APPROVED
QA2-03: APPROVED
FIN2-01: APPROVED
FIN2-02: APPROVED
```

Esse formato é o melhor para agentes e subagentes porque cada decisão possui ID,
papel, evidência e impacto.
