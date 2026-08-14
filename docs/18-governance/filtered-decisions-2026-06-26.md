# Decisões filtradas — 2026-06-26

**Produto:** Mr Coti  
**Fonte recebida:** `Sugestões por decisão.docx`  
**Data da fonte:** 2026-06-25  
**Data de registro no repositório:** 2026-06-26  
**Responsável informado:** Felipe Almeida  
**Escopo:** fundação SaaS documental e autorização para próxima spec local implementável

Este documento transforma as sugestões recebidas em decisões registráveis, sem
promover automaticamente qualquer item que conflite com a Constituição, com o
`AGENTS.md` ou com as travas da feature `001-saas-platform-foundation`.

## Filtro aplicado

1. Decisões foram agrupadas por papel de governança, preservando a possibilidade de
   uma única pessoa exercer múltiplos papéis.
2. Itens condicionais foram registrados como `APPROVED WITH CONDITIONS`, não como
   aprovação irrestrita.
3. A diretriz “portfolio local-first, commercial SaaS-ready” foi incorporada como
   arquitetura de produto, não como renúncia ao modelo SaaS.
4. A autorização resultante permite avançar para a próxima spec implementável local,
   mas não autoriza produção comercial, deploy real, cobrança real, emissão fiscal
   real, pagamentos reais, mensageria real ou tratamento real de dados pessoais.
5. O pedido de ADR para cybersecurity foi registrado como ADR-0018, pois o ADR-0017
   foi usado para a decisão “portfolio local-first, commercial SaaS-ready”.

## Decisões oficiais filtradas

| ID | Papel principal | Decisão | Registro filtrado |
| --- | --- | --- | --- |
| FND-01 | Founder | APPROVED WITH CONDITIONS | O Mr Coti será conduzido inicialmente como portfolio local-first e comercialmente SaaS-ready. A implementação inicial deve privilegiar simplicidade local sem bloquear evolução SaaS. |
| FND-02 | Founder | APPROVED WITH CONDITIONS | O roadmap MVP/V1/V2/V3 fica aprovado como evolução demonstrável, não como promessa comercial ou contratual. |
| FND-03 | Founder | APPROVED | A fundação documental pode ser usada como base para abrir a próxima spec implementável local. |
| PO-01 | Product Owner | APPROVED WITH CONDITIONS | Planos `Pro`, `Plus` e `Premium` aprovados como baseline demonstrativo. Valores comerciais reais devem ser definidos antes de venda/produção. |
| PO-02 | Product Owner | APPROVED WITH CONDITIONS | Excedentes bloqueiam novas criações quando aplicável, preservam operações em andamento e não geram cobrança real no MVP local. |
| PO-03 | Product Owner | APPROVED WITH CONDITIONS | Upgrade/downgrade aprovados conceitualmente. Prorrata, crédito real e cobrança permanecem documentais até billing comercial. |
| PO-04 | Product Owner | APPROVED WITH CONDITIONS | Trial de 14 dias aprovado. Expiração preserva leitura/exportação e bloqueia novas operações comerciais. |
| PO-05 | Product Owner | APPROVED | Separação entre Feature Flag, Entitlement e RBAC aprovada. |
| PO-06 | Product Owner | APPROVED | Roadmap e prioridades documentais aprovados para sequência local. |
| ARCH-01 | Software Architect | APPROVED | Monólito modular permanece obrigatório. |
| ARCH-02 | Software Architect | APPROVED | DDD, Clean Architecture, portas/adaptadores e ownership por contexto permanecem obrigatórios. |
| ARCH-03 | Software Architect | APPROVED WITH CONDITIONS | Outbox deve entrar primeiro nos fluxos críticos demonstráveis de pagamento fake, nota fake e notificação fake. |
| ARCH-04 | Software Architect | APPROVED WITH CONDITIONS | AWS readiness é direção arquitetural; não há provisionamento ou deploy nesta etapa. |
| ARCH-05 | Software Architect | APPROVED | ADR-0017 registra “portfolio local-first, commercial SaaS-ready”. |
| SEC-01 | Security Officer | APPROVED WITH CONDITIONS | RBAC completo fica aprovado como arquitetura obrigatória. O MVP pode implementar apenas papéis correspondentes aos módulos existentes, mas todo endpoint implementado deve ter autenticação, autorização, policy/guard, teste positivo, teste negativo e teste de isolamento tenant quando aplicável. Nenhuma rota sensível pode existir sem controle de acesso. |
| SEC-02 | Security Officer | APPROVED | Threat model OWASP/IDOR/cross-tenant permanece obrigatório. |
| SEC-03 | Security Officer | APPROVED WITH CONDITIONS | Auditoria crítica começa em banco local; observabilidade externa fica para etapa futura. |
| SEC-04 | Security Officer | APPROVED | Segurança de webhooks, secrets e supply chain permanecem requisitos. |
| DATA-01 | Data Governance | APPROVED WITH CONDITIONS | Prazos de retenção aprovados como baseline de portfolio e sujeitos a revisão jurídica antes de produção comercial. |
| DATA-02 | Data Governance | APPROVED WITH CONDITIONS | `PENDING LEGAL REVIEW` permanece obrigatório antes de produção ou tratamento real de dados pessoais. |
| DATA-03 | Data Governance | APPROVED | Exportação e anonimização documentadas ficam aprovadas como desenho. |
| DATA-04 | Data Governance | APPROVED WITH CONDITIONS | Backup/restore local usa dados sintéticos. Legal hold permanece documental. |
| DEVOPS-01 | DevOps Lead | APPROVED WITH CONDITIONS | SLOs são objetivos técnicos demonstrativos no MVP local, não promessa contratual. |
| DEVOPS-02 | DevOps Lead | APPROVED WITH CONDITIONS | Perfil de carga fica separado em local demonstrável, SaaS inicial e SaaS futuro. |
| DEVOPS-03 | DevOps Lead | APPROVED WITH CONDITIONS | DR local será demonstrável por runbook e restore com dados sintéticos. |
| DEVOPS-04 | DevOps Lead | APPROVED WITH CONDITIONS | Portas propostas são variáveis configuráveis. CHK038 foi satisfeito em 2026-06-26 com `refresh` e `taskflow` ativos; o preflight deve ser repetido antes de subir a futura stack local do Mr Coti. |
| QA-01 | QA Lead | APPROVED | Rastreabilidade e qualidade documental aprovadas. |
| QA-02 | QA Lead | APPROVED WITH CONDITIONS | MVP prioriza testes unitários, integração, contrato API, isolamento tenant e E2E dos fluxos principais. |
| QA-03 | QA Lead | APPROVED | Gate documental pode ser fechado quando as decisões por papel estiverem registradas. |
| FIN-01 | FinOps | APPROVED WITH CONDITIONS | FinOps permanece documental até uso real de AWS. |
| FIN-02 | FinOps | APPROVED WITH CONDITIONS | Budgets monetários permanecem pendentes até provisionamento real de AWS. |
| FIN-03 | FinOps | APPROVED | Tags, alocação por tenant e unit economics permanecem obrigatórios no desenho. |
| FIN-04 | FinOps | APPROVED | Relação entre billing, limites e custos fica aprovada como modelo documental. |

## Impacto nos gates

| Gate | Resultado após filtro |
| --- | --- |
| CHK026 | Pode ser fechado: política comercial demonstrativa aprovada com condições. |
| CHK037 | Pode ser fechado: SLO/carga aprovados como objetivos demonstrativos, não contratuais. |
| CHK038 | Fechado: verificação local realizada com `refresh` e `taskflow` ativos, sem alterar projetos externos. |
| CHK046 | Pode ser fechado: matriz RBAC aprovada com condições reforçadas para endpoints. |
| CHK048 | Permanece aberto: exige revisão jurídica antes de produção/tratamento real de dados pessoais. |
| CHK081 | Pode ser fechado: todos os papéis obrigatórios possuem decisão registrada. |

## Limites explícitos da aprovação

Esta aprovação não autoriza:

- produção comercial;
- deploy real em AWS ou qualquer cloud;
- cobrança real ou processamento financeiro real;
- emissão fiscal real;
- uso real de provedores de pagamento, e-mail, SMS ou WhatsApp;
- tratamento real de dados pessoais;
- criação de código de aplicação dentro da feature `001-saas-platform-foundation`;
- instalação de dependências, migrations, Docker executável, commit ou push.

Ela autoriza apenas prosseguir para a próxima spec implementável local, mantendo os
gates ainda abertos onde aplicável.
