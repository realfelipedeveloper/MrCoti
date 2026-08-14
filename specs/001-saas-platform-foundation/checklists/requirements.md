# Checklist de qualidade dos requisitos — Fundação da plataforma SaaS

**Produto:** Mr Coti  
**Feature:** `001-saas-platform-foundation`  
**Data da elaboração:** 2026-06-23  
**Estado:** pacote documental, complemento, quickstart final, decisões por papel e verificação local de portas validados; CHK048 pendente

> Este checklist avalia completude, clareza, consistência e mensurabilidade da
> especificação. Ele não atesta que o produto foi implementado ou testado.

## 1. Escopo e linguagem

- [x] CHK001 A finalidade SaaS do Mr Coti e os segmentos atendidos estão explícitos.
- [x] CHK002 A primeira etapa está limitada a documentação, decisões e planejamento.
- [x] CHK003 As ações proibidas (aplicação, dependências, migrations, deploy real,
  microsserviços, commit e push) estão explícitas.
- [x] CHK004 MVP, V1, V2 e V3 estão separados e não prometem entrega antecipada.
- [x] CHK005 APIs fictícias são distinguidas de pagamentos, fiscalidade e providers
  reais.
- [x] CHK006 Termos normativos usam DEVE/NÃO DEVE e comportamentos verificáveis.
- [x] CHK007 Premissas, dependências, questões abertas e fora de escopo estão
  identificados.

## 2. Histórias e cenários

- [x] CHK008 Histórias US-01–US-07 possuem ator, objetivo, valor e prioridade P1–P3.
- [x] CHK009 Cada história possui validação independente aplicável ao desenho.
- [x] CHK010 Os cenários usam Dado/Quando/Então e incluem negação/falha relevante.
- [x] CHK011 US-02 cobre provisionamento, suspensão, cancelamento e mudança de plano.
- [x] CHK012 US-03 cobre o fluxo mesa/comanda/pedido/conta e exceções autorizadas.
- [x] CHK013 US-04 cobre idempotência, timeout, duplicidade, webhook e natureza fake.
- [x] CHK014 US-05 separa ambiente, plano, tenant, fallback e RBAC.
- [x] CHK015 US-06 cobre correlação, filas, falha de provider e restore.
- [x] CHK016 Casos de borda incluem concorrência, tempo, centavos, LGPD, Redis e portas.

## 3. Core SaaS e domínio funcional

- [x] CHK017 RF-001–011 definem tenant, organização, acesso, ciclo, plano, limites,
  auditoria e evolução comercial.
- [x] CHK018 RF-012–015 definem flag, precedência, auditoria e ciclo de vida.
- [x] CHK019 RF-016–023 cobrem operação e cardápio com snapshots e conciliação.
- [x] CHK020 RF-024–028 cobrem pagamentos fake e todos os cenários obrigatórios.
- [x] CHK021 RF-029–031 cobrem notas fake, estados, downloads e ausência de validade.
- [x] CHK022 RF-032–036 cobrem notificações, providers, fila, retries, logs e limite de
  exposição pública.
- [x] CHK023 RF-037–042 cobrem integralmente o roadmap MVP/V1/V2/V3.
- [x] CHK024 Cada entidade de Core SaaS tem ownership e escopo de tenant no modelo.
- [x] CHK025 Máquinas de estado evitam transições inválidas e preservam histórico.
- [x] CHK026 Política comercial exata de excedente e vigência de mudança de plano foi
  aprovada pelo papel Product Owner/Founder. **Baseline:** `docs/12-billing`;
  **APPROVED WITH CONDITIONS em 2026-06-26.** Planos `Pro`, `Plus` e `Premium`,
  trial de 14 dias, overage e mudança de plano valem como baseline demonstrativo.
  **Bloqueia apenas:** cobrança real, prorrata/crédito real e oferta comercial antes
  de nova decisão.

## 4. Requisitos não funcionais

- [x] CHK027 RNF-001 fixa monólito modular, DDD/Clean/hexagonal, eventos e outbox.
- [x] CHK028 RNF-002–003 fixam stack obrigatória, Docker local e portabilidade AWS.
- [x] CHK029 RNF-004–005 possuem baselines mensuráveis de escala e latência.
- [x] CHK030 RNF-006 define propriedades obrigatórias de jobs e retries.
- [x] CHK031 RNF-007–008 tornam OpenAPI, versão, idempotência e correlação verificáveis.
- [x] CHK032 RNF-009–010 definem pipeline bloqueante e camadas/cenários de teste.
- [x] CHK033 RNF-011 diferencia telemetria e probes operacionais.
- [x] CHK034 RNF-012 define baseline mensurável de RPO/RTO e exercício de restore.
- [x] CHK035 RNF-013 exige tratamento assíncrono para operações pesadas.
- [x] CHK036 RNF-014 exige configuração externa e não colisão com `refresh`/`tasks`.
- [x] CHK037 Carga nominal, SLO de disponibilidade e metas finais de produção foram
  aprovados pelos papéis Product Owner, Software Architect, DevOps Lead e QA Lead.
  **Baseline:** `docs/19-operations`; **APPROVED WITH CONDITIONS em 2026-06-26.**
  SLOs e carga são objetivos técnicos demonstrativos, não promessa contratual.
  **Bloqueia apenas:** release/compromisso de produção comercial.
- [x] CHK038 Portas efetivamente ocupadas no ambiente foram inventariadas sem alterar
  `refresh`/`taskflow`/`tasks`. **Snapshots criados; arquivos `.env`/Compose de
  `refresh` e `taskflow` inspecionados sem expor segredos; Docker local disponível;
  containers ativos observados em 2026-06-26 11:21:48 -03:00.** Bindings externos
  registrados e sugestões do Mr Coti ajustadas para evitar colisões.

## 5. Segurança, privacidade e governança

- [x] CHK039 RSD-001–002 cobrem autoridade do tenant e testes negativos de isolamento.
- [x] CHK040 RSD-003–005 cobrem rotas sensíveis, DTOs, autenticação, força bruta e rate
  limiting.
- [x] CHK041 RSD-006–007 cobrem secrets, TLS e criptografia em repouso/backups.
- [x] CHK042 RSD-008–012 cobrem catálogo, consentimento, auditoria, telemetria, backup,
  exportação e anonimização.
- [x] CHK043 RSD-013–014 cobrem supply chain e segurança/resiliência de webhooks.
- [x] CHK044 Auditoria é append-only no fluxo normal e minimiza before/after sensível.
- [x] CHK045 Logs, métricas e traces proíbem credenciais, tokens e dados pessoais
  desnecessários.
- [x] CHK046 Matriz RBAC ator × comando × escopo × condição foi aprovada para todas as
  operações críticas do MVP. **APPROVED WITH CONDITIONS em 2026-06-26 pelos papéis
  Product Owner e Security Officer.** O MVP pode implementar os papéis correspondentes
  aos módulos existentes, mas nenhuma rota sensível poderá existir sem autenticação,
  autorização, policy/guard e testes positivos/negativos/isolamento tenant quando
  aplicável.
- [x] CHK047 Threat model formal cobre OWASP, IDOR/cross-tenant, abuso e integrações.
  **Bloqueia:** implementação dos fluxos afetados.
- [ ] CHK048 Prazos de retenção, bases legais e política de anonimização foram aprovados
  pelos papéis Product Owner, Security Officer e Data Governance, com ressalva de
  revisão jurídica quando aplicável. **Políticas criadas; PENDING LEGAL REVIEW.**
  **Bloqueia:** produção e tratamento real de dados.

## 6. APIs e integrações

- [x] CHK049 A spec exige autenticação, versão, paginação, filtros, ordenação, erros,
  exemplos, IDs, idempotência e webhooks quando aplicáveis.
- [x] CHK050 A semântica de idempotência trata chave igual/payload igual e chave
  igual/payload diferente.
- [x] CHK051 Timeouts ambíguos permanecem consultáveis e não autorizam retry cego.
- [x] CHK052 Webhooks exigem ID, versão, timestamp, autenticação/replay, deduplicação e
  redelivery finito.
- [x] CHK053 As três APIs no contrato OpenAPI 3.1 passam em validação estrutural.
  **Bloqueia:** aprovação do gate de contrato.
- [x] CHK054 OpenAPI, UML, ADRs e máquinas de estado usam os mesmos estados, transições
  e erros. **Bloqueia:** aprovação do gate de consistência.
- [x] CHK055 Todos os exemplos obrigatórios de sucesso, falha, timeout,
  fraude/chargeback, rejeição, indisponibilidade, retry e duplicidade estão nos
  contratos. **Bloqueia:** aprovação do gate de contrato.

## 7. Mensurabilidade e critérios de sucesso

- [x] CHK056 CS-001–008 medem a conclusão da primeira etapa documental.
- [x] CHK057 CS-009–011 estão claramente marcados como gates futuros antes de produção.
- [x] CHK058 Metas de isolamento exigem zero acesso cruzado, não apenas “boa
  segurança”.
- [x] CHK059 Metas de auditoria e correlação são expressas como cobertura percentual.
- [x] CHK060 RPO/RTO e latência incluem limiar e condição de validação.
- [x] CHK061 Baselines que precisam de confirmação foram registrados como questões e
  tarefas, sem desaparecer do gate.

## 8. Rastreabilidade canônica

- [x] CHK062 A spec usa somente os prefixos canônicos RF-###, RNF-### e RSD-### para
  requisitos.
- [x] CHK063 Plan, tasks, research, data model e quickstart referenciam os mesmos IDs e
  não criam requisitos canônicos paralelos.
- [x] CHK064 A tabela história → requisitos → critérios → evidência cobre US-01–US-07.
- [x] CHK065 Tasks documentais cobrem RF-001–042, RNF-001–014 e RSD-001–014.
- [x] CHK066 Documentos, ADRs, UML e OpenAPI irmãos referenciam IDs existentes e não
  os renumeram. **Bloqueia:** gate final de consistência.
- [x] CHK067 Existe evidência revisada para cada requisito, sem requisito órfão ou
  documento sem fonte. **Bloqueia:** gate final de rastreabilidade.

## 9. Constitution Gates

- [x] CHK068 Princípio I: a spec é a fonte da verdade e precede implementação.
- [x] CHK069 Princípio II: tenancy aparece em dados, auth, cache, fila, storage e
  telemetria.
- [x] CHK070 Princípio III: segurança, LGPD e governança são requisitos, não backlog
  implícito.
- [x] CHK071 Princípio IV: APIs são contract-first e integrações têm resiliência.
- [x] CHK072 Princípio V: monólito modular e ownership de dados estão explícitos.
- [x] CHK073 Princípio VI: cada grupo de requisitos possui estratégia de verificação.
- [x] CHK074 Princípio VII: sinais, probes, filas, SLO e recuperação são planejados.
- [x] CHK075 Princípio VIII: Docker local e destinos AWS não criam lock-in estrutural.
- [x] CHK076 Princípio IX: flags/entitlements são separados e ADRs governam mudanças.
- [x] CHK077 Constitution Check foi repetido após integração de todos os artefatos
  irmãos, com zero FALHA e exceções formalizadas. **Bloqueia:** handoff.

## 10. Gate de primeira etapa

- [x] CHK078 Constitution, spec, plan, tasks, research, data model, quickstart,
  contratos e checklists estão presentes e consistentes.
- [x] CHK079 OpenAPI, UML, AGENTS, subagentes, ADRs, loops e estratégias SaaS, flags,
  AWS, escala, segurança, testes e observabilidade estão presentes e revisados.
- [x] CHK080 Não existe código de aplicação, dependência instalada, migration executada,
  deploy real ou microsserviço produzido nesta etapa.
- [x] CHK081 Todos os papéis obrigatórios de governança registraram decisão:
  Founder, Product Owner, Software Architect, Security Officer, Data Governance,
  DevOps Lead, QA Lead e FinOps. **O mesmo responsável pode exercer múltiplos papéis;
  decisões registradas em `docs/18-governance/approval-record.md` e filtradas em
  `docs/18-governance/filtered-decisions-2026-06-26.md`.** CHK048 segue aberto no
  seu próprio gate.

## 11. Fechamento de lacunas SaaS

- [x] CHK082 Billing Domain cobre planos, assinatura, trial, mudanças, suspensão,
  inadimplência, excedentes e histórico sem cobrança real.
- [x] CHK083 Entitlements e limites por plano estão documentados com unidades,
  medição, overrides e parâmetros humanos pendentes.
- [x] CHK084 Feature Flags, Entitlements e RBAC possuem semântica e precedência
  separadas e cumulativas.
- [x] CHK085 Catálogo de eventos cobre SaaS, Operação, pagamentos/notas fake e
  notificações com payload, versão, idempotência, criticidade, outbox e dados proibidos.
- [x] CHK086 Ownership por bounded context, dado e módulo define owners, entidades,
  eventos e dependências permitidas/proibidas.
- [x] CHK087 Disaster Recovery possui cenários, responsabilidades, runbook, testes de
  restore e RPO/RTO progressivos.
- [x] CHK088 FinOps AWS documenta custo por tenant/ambiente/módulo, tags, budgets,
  alertas e riscos sem provisionar cloud.
- [x] CHK089 Matriz RBAC MVP possui atores, comandos, recursos, escopos, condições,
  decisão, justificativa e requisito; aprovação com condições registrada em CHK046.
- [x] CHK090 Retenção, bases LGPD e anonimização cobrem todas as categorias requeridas;
  aprovação permanece em CHK048.
- [x] CHK091 SLO e perfil de carga propõem local demonstrável, SaaS inicial e SaaS
  futuro; aprovação demonstrativa com condições registrada em CHK037.
- [x] CHK092 Inventário de portas registra snapshot com `refresh` e `taskflow` ativos,
  sugestões sem colisão e confirmação de que projetos externos não foram alterados.
- [x] CHK093 ADR-0009–0019 registram as novas decisões e seu estado real.
- [x] CHK094 Approval record identifica aprovadores, artefatos, estado, condições e
  impacto de cada decisão registrada; CHK081 está satisfeito.

## 12. Decisões filtradas e cybersecurity

- [x] CHK095 Decisões recebidas em `Sugestões por decisão.docx` foram filtradas,
  registradas e sincronizadas sem transformar condições futuras em aprovação
  irrestrita.
- [x] CHK096 Diretriz portfolio local-first, dev/local only ativo e commercial
  SaaS-ready está refletida em README, AGENTS, visão, spec, arquitetura, ADR-0017 e
  ADR-0019.
- [x] CHK097 Cybersecurity progressiva está documentada em `docs/20-cybersecurity` e
  ADR-0018, com ASVS, SSDF, SAMM, SLSA, RBAC, isolamento tenant, webhooks, secrets,
  auditoria e incident response.
- [x] CHK098 A próxima spec implementável local está autorizada; `local-prod`,
  produção comercial, deploy real, AWS real, billing real, fiscalidade real,
  provedores reais e tratamento real de dados pessoais continuam fora de escopo até
  gates próprios. Docker Desktop/local Docker será usado no dev/local após aprovação,
  e AWS-ready permanece como prontidão.

## Resultado atual

- **Decisão:** PACOTE DOCUMENTAL APROVADO COM CONDIÇÕES — os artefatos, contrato,
  gates técnicos, complemento, quickstart final e decisões por papel foram revisados.
  O Mr Coti fica registrado como portfolio local-first, dev/local only no escopo
  ativo e commercial SaaS-ready por arquitetura. Docker Desktop/local Docker será
  usado para rodar a aplicação local após aprovação da spec; AWS-ready permanece como
  prontidão. `local-prod`, produção, deploy real e AWS real não são perseguidos agora.
  Permanece CHK048: `PENDING LEGAL REVIEW` apenas como gatilho futuro antes de
  produção ou tratamento real de dados pessoais. CHK038 foi satisfeito com snapshot
  local de `refresh` e `taskflow` ativos.
- **Falhas críticas conhecidas na spec:** nenhuma.
- **Autorização de implementação:** esta feature não autoriza código diretamente. Está
  autorizada apenas a abertura/prosseguimento da próxima spec implementável local,
  mantendo proibidos nesta etapa: aplicação, dependências, migrations, Docker
  executável, deploy real, microsserviços, commit e push.
