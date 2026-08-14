# Registro de aprovações da fundação SaaS

Silêncio não é aprovação. Cada decisão precisa de papel exercido, responsável, data,
versão/hash dos artefatos, decisão, justificativa, pendências e próxima revisão.

Este registro é o ponto de controle da T067 e do CHK081. Ele registra as decisões
dos papéis de governança para a fundação documental. A aprovação registrada aqui
autoriza apenas avançar para a próxima spec implementável local; não autoriza
produção comercial, deploy real, cobrança real, emissão fiscal real, provedores reais
ou tratamento real de dados pessoais.

**Atualização de escopo em 2026-07-11:** a fase ativa do Mr Coti passa a ser
dev/local only. Docker Desktop/local Docker será usado para rodar a aplicação local
após aprovação da spec; AWS readiness continua aprovado como prontidão arquitetural.
`local-prod`, produção, deploy real e AWS real não são perseguidos agora. CHK048
permanece `PENDING LEGAL REVIEW` apenas como gatilho futuro se produção ou dados
pessoais reais forem reabertos.

O modelo de governança por papéis está definido em
[`governance-roles.md`](governance-roles.md). Enquanto o Mr Coti for conduzido por
um único responsável técnico, a mesma pessoa pode exercer e assinar múltiplos papéis,
desde que cada aprovação seja registrada separadamente.

O pacote versionado para assinatura fica em
[`approval-evidence-manifest.md`](approval-evidence-manifest.md). A pessoa aprovadora
deve conferir o manifesto, os artefatos do seu papel e o parecer técnico em
[`../../specs/001-saas-platform-foundation/review-report.md`](../../specs/001-saas-platform-foundation/review-report.md)
antes de registrar decisão.

| Papel obrigatório | Responsável atual | Artefatos principais | Estado | Condições e impactos remanescentes |
| --- | --- | --- | --- | --- |
| Founder | Felipe Almeida | visão, estratégia, roadmap, posicionamento e decisão comercial macro | **APPROVED WITH CONDITIONS** | condições registradas em FND-01–FND-03 |
| Product Owner | Felipe Almeida | regras de negócio, planos, feature flags, entitlements, excedentes e mudança de plano | **APPROVED WITH CONDITIONS** | valores comerciais reais e billing real ficam para etapa futura |
| Software Architect | Felipe Almeida | arquitetura, DDD, ADRs, ownership, eventos, modularização, escala e AWS readiness | **APPROVED WITH CONDITIONS** | AWS readiness sem provisionamento/deploy nesta etapa |
| Security Officer | Felipe Almeida | RBAC, OWASP, threat model, auditoria, secrets, webhooks e controles LGPD técnicos | **APPROVED WITH CONDITIONS** | endpoints futuros exigem autenticação, autorização, policies/guards e testes |
| Data Governance | Felipe Almeida | retenção, bases legais, anonimização, exportação, backup e governança de dados | **APPROVED WITH CONDITIONS; PENDING LEGAL REVIEW BEFORE PRODUCTION/REAL DATA** | CHK048 permanece gatilho futuro; não bloqueia a fase dev/local sintética |
| DevOps Lead | Felipe Almeida | Docker Desktop/local Docker, CI/CD, observabilidade, DR, RPO/RTO, portas, SLO e AWS readiness operacional | **APPROVED WITH CONDITIONS; CHK038 SATISFIED 2026-06-26** | preflight de portas deve ser repetido antes de subir a futura stack local do Mr Coti |
| QA Lead | Felipe Almeida | rastreabilidade, critérios de aceite, estratégia/cobertura de testes, checklist e gates | **APPROVED** | gate documental de papéis satisfeito |
| FinOps | Felipe Almeida | custos AWS, billing, projeções, tags, budgets, alertas e otimização financeira | **APPROVED WITH CONDITIONS** | AWS readiness permanece documental; budgets monetários ficam pendentes até eventual AWS real |

## Decisões registradas em 2026-06-26

**Fonte:** `Sugestões por decisão.docx`, filtrada em
[`filtered-decisions-2026-06-26.md`](filtered-decisions-2026-06-26.md).  
**Data da fonte:** 2026-06-25.  
**Responsável:** Felipe Almeida.  
**Versão dos artefatos:** `approval-evidence-manifest.md` vigente após este registro.  
**Próxima revisão geral:** abertura da próxima spec implementável local ou entrada de
novo responsável por algum papel de governança.

### Founder

```text
Papel: Founder
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + README + spec + roadmap + vision-and-scope + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED WITH CONDITIONS
Justificativa: a fundação documental sustenta a visão portfolio local-first e commercial SaaS-ready, com roadmap demonstrável e sem promessa comercial antecipada.
Pendências: produção comercial, precificação real e promessa contratual continuam fora da aprovação.
Data prevista para revisão: próxima spec implementável local ou revisão de estratégia comercial.
```

### Product Owner

```text
Papel: Product Owner
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + docs/12-billing + docs/13-entitlements + docs/19-operations/slo.md + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED WITH CONDITIONS
Justificativa: planos Pro, Plus e Premium, trial de 14 dias, excedentes e mudanças de plano ficam aprovados como baseline demonstrativo para implementação local.
Pendências: valores comerciais, cobrança real, prorrata/crédito real e regras de venda permanecem para decisão futura antes de produção comercial.
Data prevista para revisão: antes de qualquer venda, cobrança real ou publicação de oferta comercial.
```

### Software Architect

```text
Papel: Software Architect
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + spec/plan/data-model + docs/02-architecture + docs/14-events + docs/15-ownership + ADR-0001–0018 + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED WITH CONDITIONS
Justificativa: monólito modular, DDD/Clean/hexagonal, ownership, outbox e AWS readiness estão coerentes com a estratégia local-first/SaaS-ready.
Pendências: outbox deve entrar primeiro nos fluxos fake críticos; AWS readiness não autoriza provisionamento nem deploy real.
Data prevista para revisão: antes de iniciar implementação local dos fluxos críticos ou propor extração de serviço.
```

### Security Officer

```text
Papel: Security Officer
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + docs/08-security + docs/18-governance/rbac-matrix-mvp.md + docs/20-cybersecurity + OpenAPI + threat model + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED WITH CONDITIONS
Justificativa: RBAC, threat model, tenant isolation, webhooks, secrets e supply chain estão aprovados como arquitetura obrigatória.
Pendências: todo endpoint implementado futuramente deve ter autenticação, autorização, policy/guard, teste positivo, teste negativo e isolamento tenant quando aplicável.
Data prevista para revisão: antes da implementação de rotas sensíveis ou da introdução de provedores reais.
```

### Data Governance

```text
Papel: Data Governance
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + data-model + data-retention-policy + legal-basis-lgpd + anonymization-policy + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED WITH CONDITIONS
Justificativa: retenção, exportação, anonimização, backup/restore local e legal hold ficam aprovados como desenho com dados sintéticos.
Pendências: PENDING LEGAL REVIEW permanece obrigatório antes de produção ou tratamento real de dados pessoais.
Data prevista para revisão: antes de operar dados pessoais reais, produção comercial ou contratação jurídica.
```

### DevOps Lead

```text
Papel: DevOps Lead
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + docs/07-devops + docs/16-disaster-recovery + docs/19-operations + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED WITH CONDITIONS
Justificativa: SLOs, perfil de carga, DR local e variáveis de portas ficam aprovados como objetivos técnicos demonstrativos.
Pendências: CHK038 foi satisfeito em 2026-06-26 com refresh/taskflow ativos; repetir preflight antes de subir stack local futura. SLOs não são promessa contratual.
Data prevista para revisão: antes de definir configuração local executável ou ativar Docker/projetos externos.
```

### QA Lead

```text
Papel: QA Lead
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + review-report + checklist + tasks + docs/06-testing + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED
Justificativa: rastreabilidade, critérios de aceite, cobertura documental e gates da fundação estão coerentes para encerrar a etapa documental.
Pendências: a próxima spec implementável deve manter testes unitários, integração, contrato API, isolamento tenant e E2E dos fluxos principais.
Data prevista para revisão: abertura da próxima spec implementável local.
```

### FinOps

```text
Papel: FinOps
Responsável: Felipe Almeida
Versão dos artefatos: approval-evidence-manifest.md + docs/17-finops + docs/12-billing + docs/13-entitlements + filtered-decisions-2026-06-26.md
Data: 2026-06-26
Decisão: APPROVED WITH CONDITIONS
Justificativa: tags, alocação por tenant, unit economics, alertas e relação billing/limites/custos ficam aprovados como modelo documental.
Pendências: budgets monetários e otimização sobre custo real permanecem pendentes até provisionamento AWS real.
Data prevista para revisão: antes de qualquer provisionamento AWS ou definição de orçamento real.
```

## Modelo de aprovação

```text
Papel:
Responsável:
Versão dos artefatos:
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

CHK081 está satisfeito neste registro porque todos os papéis obrigatórios listados
acima possuem decisão válida, ainda que exercidos pela mesma pessoa. As condições de
Data Governance não reabrem CHK081: elas mantêm CHK048 aberto no seu próprio gate.
DevOps teve CHK038 satisfeito em 2026-06-26, mantendo apenas o preflight operacional
futuro antes de subir stack local.

## Critérios mínimos para assinatura

Uma aprovação válida deve:

1. citar o papel correspondente à tabela acima;
2. identificar o responsável autorizado no papel, data/hora e timezone;
3. referenciar o manifesto de evidências e os hashes revisados;
4. declarar `APPROVED`, `APPROVED WITH CONDITIONS` ou `REJECTED`;
5. listar justificativa, pendências e próxima revisão;
6. não alterar `PENDING` de outro papel nem aprovar por silêncio.

## Blocos prontos para revisões futuras

Use estes blocos somente para novas revisões. As decisões válidas desta rodada já
estão registradas na seção “Decisões registradas em 2026-06-26”.

### Founder

```text
Papel: Founder
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + README + spec + roadmap + vision-and-scope
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

### Product Owner

```text
Papel: Product Owner
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + docs/12-billing + docs/13-entitlements + docs/19-operations/slo.md
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

### Software Architect

```text
Papel: Software Architect
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + spec/plan/data-model + docs/14-events + docs/15-ownership + ADR-0001–0019
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

### Security Officer

```text
Papel: Security Officer
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + docs/08-security + docs/18-governance/rbac-matrix-mvp.md + OpenAPI + threat model
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

### Data Governance

```text
Papel: Data Governance
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + data-model + data-retention-policy + legal-basis-lgpd + anonymization-policy
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

### DevOps Lead

```text
Papel: DevOps Lead
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + docs/07-devops + docs/16-disaster-recovery + docs/19-operations
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

### QA Lead

```text
Papel: QA Lead
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + review-report + checklist + tasks + docs/06-testing
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

### FinOps

```text
Papel: FinOps
Responsável:
Versão dos artefatos: approval-evidence-manifest.md + docs/17-finops + docs/12-billing + docs/13-entitlements
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```
