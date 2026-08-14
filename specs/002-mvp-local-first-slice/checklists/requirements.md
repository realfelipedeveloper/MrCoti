# Checklist de qualidade — MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Especificação:** `specs/002-mvp-local-first-slice/spec.md`  
**Revisor:** Codex / responsável técnico  
**Data:** 2026-07-11  
**Estado:** spec aprovada com condições; implementação dev/local autorizada em ordem
pelas tasks

> Este checklist avalia a qualidade da especificação. Ele não atesta implementação.

## Completude

- [x] CHK001 A feature possui escopo dev/local claro e não promete `local-prod` ou
  produção.
- [x] CHK002 Histórias US-01–US-05 têm ator, objetivo, valor, prioridade e validação
  independente.
- [x] CHK003 Cenários de aceite cobrem sucesso, negação, falha e idempotência.
- [x] CHK004 Requisitos RF-001–016, RNF-001–010 e RSD-001–010 são verificáveis.
- [x] CHK005 Entidades, estados, invariantes e eventos mínimos estão definidos em
  `data-model.md`.
- [x] CHK006 Decisões e alternativas estão documentadas em `research.md`.
- [x] CHK007 Contrato OpenAPI inicial cobre auth, unidade, catálogo, mesas, comandas,
  itens, fechamento e erros.
- [x] CHK008 Tasks T001–T053 cobrem aprovação, scaffold futuro, domínio, frontend,
  testes e gates.

## Consistência constitucional

- [x] CHK009 Princípio I: spec precede implementação.
- [x] CHK010 Princípio II: tenant isolation aparece em auth, dados, API, testes e
  auditoria.
- [x] CHK011 Princípio III: segurança, privacidade, dados sintéticos e CHK048 como
  gatilho futuro permanecem explícitos.
- [x] CHK012 Princípio IV: OpenAPI foi criado antes de código.
- [x] CHK013 Princípio V: monólito modular e ownership por módulo estão preservados.
- [x] CHK014 Princípio VI: testes unitários, integração, contrato, segurança e E2E
  estão planejados.
- [x] CHK015 Princípio VII: logs, correlação, auditoria e outbox estão planejados.
- [x] CHK016 Princípio VIII: execução local via Docker Desktop/local Docker, portas
  configuráveis e AWS-ready sem provisionamento real evitam colisões e lock-in.
- [x] CHK017 Princípio IX: nenhuma nova tecnologia relevante foi autorizada sem ADR.

## Segurança, dados e operação

- [x] CHK018 Dados reais continuam proibidos; fixtures/seeds serão sintéticos.
- [x] CHK019 Pagamento fake não coleta dado financeiro real.
- [x] CHK020 RBAC mínimo é deny-by-default e exige testes negativos.
- [x] CHK021 Idempotência cobre comandos mutáveis críticos.
- [x] CHK022 Auditoria inclui ator, tenant, unidade, motivo quando aplicável e
  correlação.
- [x] CHK023 O preflight de portas é obrigatório antes de subir stack local futura.
- [x] CHK024 Aprovação humana explícita desta spec foi registrada antes de iniciar
  tarefas de código. **APPROVED WITH CONDITIONS em 2026-07-11 por Felipe Almeida;
  evidência:** `approval-record.md`.

## Rastreabilidade

- [x] CHK025 Cada história possui requisitos e critérios de sucesso associados.
- [x] CHK026 Cada requisito possui pelo menos uma tarefa planejada.
- [x] CHK027 Critérios CS-001–008 possuem evidência futura em tasks/quickstart.
- [x] CHK028 Fora de escopo exclui `local-prod`, produção, dados reais, provedores
  reais, billing real, fiscalidade real, AWS real provisionada e microsserviços.

## Decisão

- **Resultado:** APROVADA COM CONDIÇÕES PARA IMPLEMENTAÇÃO DEV/LOCAL — a
  especificação foi aprovada por Felipe Almeida em 2026-07-11. A implementação deve
  seguir `tasks.md` em ordem, respeitar `approval-record.md` e não ampliar escopo.
- **Pendências bloqueantes para iniciar código:** nenhuma após T001–T003 concluídas.
- **Gatilho futuro fora do escopo ativo:** CHK048 da fundação continua
  `PENDING LEGAL REVIEW` para eventual produção ou tratamento real de dados pessoais,
  mas não bloqueia esta fatia dev/local com dados sintéticos.
- **Evidências:** `spec.md`, `plan.md`, `research.md`, `data-model.md`,
  `contracts/openapi.json`, `quickstart.md`, `tasks.md`, `approval-record.md` e
  `review-report.md`.
