# Registro de aprovação — Spec 002 MVP dev/local

**Produto:** Mr Coti  
**Spec:** `specs/002-mvp-local-first-slice`  
**Responsável:** Felipe Almeida  
**Data:** 2026-07-11  
**Versão dos artefatos:** `docs/18-governance/approval-evidence-manifest.md`  
**Decisão geral:** APPROVED WITH CONDITIONS

## Decisão registrada

Felipe Almeida autorizou o avanço da Spec 002 como primeira fatia vertical
executável do Mr Coti, restrita ao ambiente dev/local, usando somente dados
sintéticos e Docker Desktop/local Docker.

A implementação deve entregar uma jornada funcional completa, demonstrável e
tecnicamente consistente:

```text
login → tenant/unidade → catálogo → mesa/comanda → itens → fechamento → pagamento fake
```

Continuam fora de escopo: `local-prod`, staging, homologação, produção, AWS real,
provedores externos reais, dados pessoais reais, fiscalidade real, billing real,
microsserviços, brokers externos, nota/e-mail/SMS/WhatsApp fake nesta fatia, estoque,
compras, caixa avançado, relatórios, CRM, BI, IA, marketplace e SDK.

AWS readiness permanece como diretriz arquitetural. Nenhum recurso AWS real deve ser
provisionado e nenhum código deve depender exclusivamente de serviços AWS.

## Decisões por item

| Item | Decisão | Condições principais |
| --- | --- | --- |
| SPEC-01 | APPROVED | Spec 002 é a próxima etapa do projeto |
| SPEC-02 | APPROVED WITH CONDITIONS | CHK024 formalizado; T001–T003 antes do scaffold; ordem das tasks respeitada |
| SPEC-03 | APPROVED | Funcionalidades fora de escopo não devem ser antecipadas |
| SPEC-04 | APPROVED WITH CONDITIONS | Docker Desktop/local Docker é runtime local; AWS-ready sem AWS real |
| FND2-01 | APPROVED | Valor de portfólio exige jornada completa, testes e documentação |
| FND2-02 | APPROVED | MVP técnico local, sem promessa comercial/SLA/produção |
| PO2-01 | APPROVED | Login, tenant, unidade, RBAC, catálogo, mesas, comandas, itens, fechamento e pagamento fake |
| PO2-02 | APPROVED | Nota/e-mail/SMS/WhatsApp fake, estoque, compras, caixa avançado, relatórios, clientes, reservas e CRM ficam para depois |
| PO2-03 | APPROVED WITH CONDITIONS | Seeds determinísticos, dados `.local`, fictícios e sem CPF/CNPJ/telefone/credencial real |
| PO2-04 | APPROVED WITH CONDITIONS | Pagamento fake sem gateway, PIX/cartão real, dados bancários, adquirente, chargeback ou webhook externo |
| ARCH2-01 | APPROVED | Monorepo, NestJS, Next.js, MySQL, Docker, monólito modular e sem microsserviços |
| ARCH2-02 | APPROVED WITH CONDITIONS | Módulos com responsabilidades definidas e sem dependências circulares |
| ARCH2-03 | APPROVED WITH CONDITIONS | Outbox simples em MySQL, transacional, versionado, idempotente e sem broker externo |
| ARCH2-04 | APPROVED WITH CONDITIONS | OpenAPI `/api/v1` como contrato verificável |
| SEC2-01 | APPROVED WITH CONDITIONS OBRIGATÓRIAS | Endpoint sensível exige auth, autorização, RBAC, tenant/unit guard e testes positivos/negativos/cross-tenant |
| SEC2-02 | APPROVED | Dados reais proibidos em banco, seeds, fixtures, logs, prints, vídeos, docs, testes e exemplos |
| SEC2-03 | APPROVED WITH CONDITIONS | Erros seguros, anti-IDOR, sem confirmação de recurso de outro tenant |
| SEC2-04 | APPROVED WITH CONDITIONS | Rate limiting/proteção equivalente em login e mutações críticas |
| DATA2-01 | APPROVED WITH CONDITIONS | CHK048 não bloqueia fase sintética local; reabre antes de produção/dados reais |
| DATA2-02 | APPROVED | Seeds/fixtures fictícios, reproduzíveis e sem segredos |
| DATA2-03 | APPROVED WITH CONDITIONS | Auditoria mínima sem senha, token, segredo ou before/after sensível completo |
| DEVOPS2-01 | APPROVED WITH CONDITIONS | Portas configuráveis; stack mínima; serviços não usados não sobem por padrão |
| DEVOPS2-02 | APPROVED | Preflight obrigatório antes de subir stack |
| DEVOPS2-03 | APPROVED | Docker Compose local após CHK024 e T001–T003, com healthcheck e volume MySQL |
| DEVOPS2-04 | APPROVED | Apenas Docker local, Compose local, env example, scripts, migrations, seeds, healthchecks, gates locais e CI |
| QA2-01 | APPROVED WITH CONDITIONS | Unit, integração, contrato, auth/RBAC negativo, cross-tenant, E2E, migrations, seeds, scans |
| QA2-02 | APPROVED WITH CONDITIONS | Tasks T001–T053 devem respeitar dependências e evidência verificável |
| QA2-03 | APPROVED | Spec fecha somente com CS-001–CS-008, E2E, OpenAPI, Postman, testes e docs |
| FIN2-01 | APPROVED | Sem serviço cloud pago nesta fatia |
| FIN2-02 | APPROVED WITH CONDITIONS | Controlar complexidade e consumo local; evitar containers/serviços desnecessários |

## Consolidação por papel

| Papel | Decisão |
| --- | --- |
| Founder | APPROVED |
| Product Owner | APPROVED |
| Software Architect | APPROVED WITH CONDITIONS |
| Security Officer | APPROVED WITH CONDITIONS OBRIGATÓRIAS |
| Data Governance | APPROVED WITH CONDITIONS |
| DevOps Lead | APPROVED WITH CONDITIONS |
| QA Lead | APPROVED WITH CONDITIONS |
| FinOps | APPROVED |

## Condições globais obrigatórias

1. Nenhum endpoint sensível sem autenticação, autorização, RBAC e testes.
2. Nenhuma operação multi-tenant sem validação server-side de tenant.
3. Nenhum dado pessoal, empresarial ou segredo real.
4. Nenhuma produção, AWS real ou provedor externo real.
5. Nenhum microsserviço nesta spec.
6. Nenhum broker de mensageria nesta fase.
7. Outbox deve ser simples, transacional e idempotente.
8. Docker deve ser usado somente após os gates iniciais.
9. Portas devem ser configuráveis.
10. Serviços locais não utilizados não devem subir.
11. Segurança e testes devem ser implementados junto às funcionalidades.
12. Mudanças materiais de escopo exigem nova decisão humana.
13. Agentes não podem substituir decisões arquiteturais humanas.
14. Dívidas técnicas que afetem segurança, isolamento tenant ou integridade bloqueiam
    o encerramento.
15. A Spec 002 só fecha com jornada E2E, OpenAPI, Postman, testes e documentação
    funcionando.

## Próximas revisões

Próxima revisão prevista: após T001–T003 e antes do primeiro scaffold executável.

Revisões adicionais obrigatórias:

- após o scaffold inicial;
- após autenticação e RBAC;
- após o primeiro fluxo multi-tenant;
- antes da implementação do fechamento;
- antes do pagamento fake;
- antes do fechamento final da Spec 002.
