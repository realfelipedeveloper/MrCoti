# Loops de engenharia do Mr Coti

## Visão geral

Loop Engineering transforma feedback em um ciclo controlado, não em uma sequência rígida que esconde problemas. Cada loop tem contrato de entrada e saída. Um item pode retornar a loops anteriores quantas vezes forem necessárias; toda devolução preserva contexto e evidência.

| Ordem lógica | Loop | Coordenador | Decisão principal |
|---|---|---|---|
| 1 | Spec Loop | Business Analyst Agent | o problema e o comportamento estão claros e testáveis? |
| 2 | Architecture Loop | Architect Agent | a solução estrutural atende requisitos e restrições? |
| 3 | API Contract Loop | Integration Agent | consumidores e providers compartilham contrato seguro e evolutivo? |
| 4 | Implementation Loop | agente implementador da camada | a mudança futura implementa exatamente o aprovado? |
| 5 | Testing Loop | QA Agent | o comportamento e os riscos foram demonstrados? |
| 6 | Security Loop | Security Agent | controles e riscos residuais são aceitáveis? |
| 7 | Review Loop | Code Review Agent | mudança e evidências estão coerentes e manteníveis? |
| 8 | Release Loop | DevOps Agent | o artefato está pronto para promoção controlada? |
| 9 | Observability Loop | DevOps Agent com owner de domínio | a entrega é compreensível e operável em produção? |

A ordem é lógica, mas alguns loops trabalham em paralelo. Security e Testing começam ainda na Spec; Observability define sinais na arquitetura; Review ocorre incrementalmente. A aprovação final usa a versão coerente de todos os artefatos.

## Regras comuns

### Aprovação

Uma aprovação contém identidade do aprovador, versão/commit ou hash do artefato, data, checklist e evidência. Aprovação condicional só é válida quando a condição é não bloqueante, tem owner e prazo; requisito de segurança, integridade, contrato ou aceite não pode ser adiado informalmente.

### Rejeição

Uma rejeição descreve: artefato, requisito/risco violado, evidência, severidade, correção esperada e loop de retorno. Achados duplicados são consolidados sem apagar autoria. O autor responde com correção ou justificativa rastreável; fechar comentário não equivale a resolver risco.

### Mudança de escopo

Se implementação, teste ou operação revelar novo comportamento, o item retorna ao Spec Loop. Se revelar trade-off estrutural, retorna ao Architecture Loop e pode gerar ADR. Mudança incompatível de interface retorna ao API Contract Loop. Hotfix não elimina essa reconciliação.

### Definição de responsáveis

O coordenador mantém o fluxo e consolida a decisão. Participantes produzem artefatos/evidências. Aprovadores têm autoridade no domínio. Um humano autorizado mantém responsabilidade final por produto, risco e release.

---

## 1. Spec Loop

### Entrada

- problema ou oportunidade com contexto de negócio;
- objetivo do produto/roadmap e público afetado;
- feedback de operação, incidente, segurança ou loop posterior;
- restrições SaaS, multi-tenancy, planos, feature flags, LGPD e stack;
- hipóteses, termos do domínio e evidências disponíveis.

### Responsáveis

- **Coordenador:** Business Analyst Agent.
- **Participantes:** Architect, QA, Security e agentes dos domínios afetados.
- **Aprovação:** responsável humano de produto/negócio; Architect para NFRs e coerência; QA para testabilidade; Security para requisitos de risco/privacidade.

### Processo

1. Delimitar problema, atores, tenant/unidade, valor e não objetivos.
2. Registrar glossário e regras sem antecipar design desnecessário.
3. Escrever jornadas, estados, invariantes e critérios Given/When/Then ou equivalentes.
4. Definir comportamento de sucesso, falha, timeout, retry, duplicidade e concorrência quando aplicável.
5. Identificar dados, finalidade, classificação, autorização, auditoria e direitos LGPD.
6. Definir comportamento por plano, tenant, ambiente e feature flag, inclusive fallback.
7. Registrar NFRs mensuráveis: capacidade, latência, disponibilidade, segurança, acessibilidade e retenção.
8. Mapear dependências, riscos, perguntas abertas e itens fora de escopo.
9. Validar consistência entre spec, research, data model, contracts, plan, tasks e checklists.

### Critérios de aprovação

- problema, resultado e fronteiras entendidos;
- critérios de aceite inequívocos e verificáveis;
- regras multi-tenant, RBAC, flags e planos explícitas;
- falhas e edge cases relevantes descritos;
- dados/finalidades e riscos identificados;
- nenhuma contradição conhecida com constitution ou roadmap;
- perguntas bloqueantes resolvidas ou decisão formal indicada.

### Critérios de rejeição

- linguagem ambígua como “rápido”, “seguro” ou “adequado” sem medida;
- fluxo feliz sem erros, idempotência ou autorização aplicáveis;
- modelagem single-company implícita;
- dado pessoal sem finalidade/base legal proposta;
- escopo não delimitado ou critério impossível de testar;
- solução técnica imposta sem necessidade/research/ADR.

### Tratamento da rejeição

O Business Analyst classifica lacunas, consulta Product/especialistas e publica nova versão. Conflitos de objetivo são resolvidos pelo responsável de produto; conflitos arquiteturais são encaminhados ao Architecture Loop. A versão rejeitada permanece rastreável.

### Saída

Spec versionada e aprovada, glossário, critérios de aceite, NFRs, casos de abuso iniciais, dados classificados, dependências, riscos e handoff para arquitetura/contrato/planejamento.

---

## 2. Architecture Loop

### Entrada

- Spec e NFRs aprovados;
- constitution, research e ADRs vigentes;
- contexto arquitetural do modular monolith e bounded contexts;
- projeções de escala, integrações, dados, segurança e operação;
- restrições NestJS, Next.js, Prisma, MySQL, Redis/BullMQ, Docker e AWS-ready.

### Responsáveis

- **Coordenador:** Architect Agent.
- **Participantes:** Backend, Frontend, Database, Integration, Security, DevOps e QA Agents.
- **Aprovação:** Architect; especialistas aprovam sua fronteira; responsável técnico humano decide trade-offs de alto impacto.

### Processo

1. Mapear requisitos a bounded contexts, módulos, aggregates e ports/adapters.
2. Definir dependências permitidas e impedir ciclos entre módulos.
3. Modelar fluxo síncrono, domain events, outbox, filas, cache e consistência.
4. Verificar tenant awareness em banco, cache, eventos, jobs, storage e relatórios.
5. Avaliar transações, concorrência, idempotência, falhas e recuperação.
6. Definir contratos internos, observabilidade, healthchecks, SLI e capacidade.
7. Atualizar threat model e impactos LGPD.
8. Comparar alternativas; registrar ADR para decisão relevante ou tecnologia complementar.
9. Validar migração futura para serviços AWS sem acoplar o domínio à nuvem.
10. Revisar diagramas e plano contra a Spec.

### Critérios de aprovação

- requisitos mapeados a componentes e responsabilidades;
- fronteiras coesas, dependências explícitas e modular monolith preservado;
- modelo de consistência e falha definido;
- isolamento multi-tenant demonstrável;
- riscos de escala, segurança, dados e operação tratados;
- decisões duradouras cobertas por ADR;
- testabilidade, deploy e observabilidade viáveis.

### Critérios de rejeição

- microsserviço prematuro ou acoplamento circular;
- regra de domínio em controller/provider/infrastructure sem justificativa;
- transação, idempotência ou outbox indefinidos em fluxo crítico;
- trust em `tenant_id` do cliente;
- tecnologia fora da stack sem ADR;
- dependência que bloqueia AWS readiness ou teste isolado;
- NFR sem mecanismo ou capacidade planejada.

### Tratamento da rejeição

O Architect documenta alternativas, solicita research/benchmark quando necessário e revisa diagramas/ADRs. Se o problema for do requisito, devolve ao Spec Loop; se for apenas interface externa, aciona o API Contract Loop após corrigir a fronteira.

### Saída

Plano arquitetural aprovado, diagramas, decisões/ADRs, modelo de dados conceitual, fronteiras, fluxos, riscos/tratamentos, estratégia de testes/observabilidade e handoff para contratos/tarefas.

---

## 3. API Contract Loop

### Entrada

- Spec e arquitetura aprovadas;
- casos de uso expostos e consumidores identificados;
- modelos de dados e estados relevantes;
- padrões de autenticação, autorização, erro, versionamento e observabilidade;
- contratos existentes e requisitos de pagamentos, notas, notificações e webhooks.

### Responsáveis

- **Coordenador:** Integration Agent.
- **Participantes:** Backend, Frontend, Business Analyst, QA, Security e Database Agents.
- **Aprovação:** Integration e Architect; consumidores Backend/Frontend; QA para verificabilidade; Security para exposição/autorização.

### Processo

1. Modelar recursos, operações, schemas, estados, enums e exemplos.
2. Definir autenticação, scopes/policies e resposta a acesso negado.
3. Padronizar versionamento, paginação, filtros, ordenação e envelope de erro.
4. Definir `request-id`, `correlation-id`, idempotency key e limites.
5. Especificar webhooks: evento, versão, assinatura, timestamp, replay e reentrega.
6. Incluir sucesso, validação, conflito, rate limit, timeout e indisponibilidade.
7. Avaliar compatibilidade retroativa e estratégia de depreciação.
8. Validar OpenAPI e exemplos com ferramentas aprovadas no futuro.
9. Derivar cenários de contrato para consumidor e provider.

### Critérios de aprovação

- OpenAPI válido e sem lacuna entre operação/schema/exemplo;
- semântica HTTP e erros consistentes;
- auth, tenant e idempotência explícitos;
- webhooks seguros e reentregáveis;
- consumidores confirmam suficiência;
- mudanças compatíveis ou nova versão/depreciação aprovadas;
- nenhum dado além da finalidade exposto.

### Critérios de rejeição

- contrato reflete detalhes internos em vez de capacidade estável;
- schema ambíguo ou exemplo incompatível;
- quebra silenciosa, enum fechado alterado ou campo removido sem versão;
- recurso tenant-aware sem autorização objetiva;
- operação mutável sem estratégia de idempotência quando necessária;
- webhook sem autenticidade/deduplicação;
- erro revela stack, query ou dado de outro tenant.

### Tratamento da rejeição

Integration Agent corrige contrato e cenários. Divergência de comportamento retorna ao Spec Loop; limitação estrutural retorna ao Architecture Loop. Consumidores revisam novamente a versão completa, não apenas o fragmento alterado.

### Saída

OpenAPI e schemas/webhooks aprovados, exemplos, política de compatibilidade, cenários de contrato, mocks/providers fake especificados e handoff para tasks/implementação futura.

---

## 4. Implementation Loop

> Este loop está inativo na etapa documental atual. Sua descrição governa fases futuras e não autoriza criação de aplicação, instalação, migration ou deploy.

### Entrada

- Spec, arquitetura, ADRs e contratos aprovados;
- tasks pequenas, ordenadas e rastreáveis;
- critérios de aceite e estratégia de teste;
- threat model, controles e observabilidade esperada;
- ambiente de desenvolvimento autorizado.

### Responsáveis

- **Coordenador:** Backend NestJS, Frontend NextJS, Database ou Integration Agent conforme a tarefa.
- **Participantes:** especialistas afetados, QA, Security e DevOps.
- **Aprovação de saída:** agente da camada e revisor técnico; aprovação global ocorre nos loops Testing, Security e Review.

### Processo

1. Confirmar versão dos artefatos e escopo da task.
2. Produzir menor incremento vertical que preserva contratos.
3. Implementar domínio antes de adapters quando aplicável.
4. Aplicar tenant/RBAC, validação, idempotência e auditoria desde o início.
5. Criar testes no nível mais barato e observabilidade definida.
6. Manter migrations compatíveis e sem efeitos implícitos.
7. Executar checks locais autorizados e revisar diff/artefatos.
8. Atualizar documentação derivada e registrar desvio ou nova descoberta.
9. Entregar incremento sem commit/push automático salvo autorização explícita do fluxo.

### Critérios de aprovação

- comportamento corresponde à Spec e contrato;
- arquitetura e dependências respeitadas;
- testes e sinais acompanham o código;
- nenhum secret, dado real ou bypass de tenant/RBAC;
- mudança pequena, legível, tipada e sem escopo acidental;
- migrations e compatibilidade avaliadas;
- lint, format e typecheck aprovados.

### Critérios de rejeição

- implementação antecede aprovação dos artefatos;
- alteração oportunista sem task;
- regra duplicada ou camada violada;
- mock esconde integração crítica;
- TODO de segurança/tenancy em caminho executável;
- contrato modificado unilateralmente;
- teste removido ou gate contornado para obter sucesso.

### Tratamento da rejeição

O coordenador corrige a task ou devolve ao loop que contém a divergência. Descoberta funcional retorna à Spec; trade-off à Architecture; interface ao API Contract. O código futuro não deve cristalizar uma decisão ainda aberta.

### Saída

Incremento implementado e documentado, testes, migration quando aprovada, sinais, diff revisável, evidências locais, limitações e handoff para Testing/Security/Review.

---

## 5. Testing Loop

### Entrada

- critérios de aceite e matriz de risco;
- contratos e incremento candidato;
- estratégia de testes e ambientes;
- threat model e cenários de falha;
- evidências produzidas pelo Implementation Loop.

### Responsáveis

- **Coordenador:** QA Agent.
- **Participantes:** agentes de implementação, Database, Integration, Security e DevOps Agents.
- **Aprovação:** QA; especialistas validam achados de domínio e segurança.

### Processo

1. Mapear requisito/risco a unitário, integração, API, contrato, componente, página, acessibilidade ou E2E.
2. Revisar dados sintéticos, isolamento e determinismo.
3. Executar checks estáticos e suítes na ordem de feedback.
4. Usar MySQL/Redis efêmeros via Testcontainers quando aplicável.
5. Cobrir sucesso, falha, timeout, retry, duplicidade, concorrência e cross-tenant.
6. Verificar contratos, migrations, filas/outbox e acessibilidade.
7. Registrar defeitos com reprodução, severidade e requisito.
8. Reexecutar correções e regressão; analisar flakiness.
9. Consolidar cobertura de risco e parecer.

### Critérios de aprovação

- critérios de aceite demonstrados;
- gates obrigatórios verdes e determinísticos;
- riscos críticos cobertos no nível adequado;
- isolamento, autorização e idempotência verificados;
- contrato e migrations compatíveis;
- acessibilidade aplicável atendida;
- nenhuma flakiness bloqueante ou defeito crítico aberto.

### Critérios de rejeição

- teste ausente para regra/risco crítico;
- suite depende de ordem, dado compartilhado ou sleep arbitrário;
- mocks substituem banco/fila no único teste do comportamento real;
- erro intermitente ignorado;
- cobertura numérica usada para ocultar branch sem cenário;
- evidência contém segredo/PII;
- teste alterado apenas para aceitar comportamento divergente.

### Tratamento da rejeição

Defeito de implementação retorna ao Implementation Loop; comportamento esperado ambíguo retorna ao Spec Loop; contrato divergente ao API Contract; risco novo ao Security/Architecture. QA mantém o item reprovado até evidência da correção.

### Saída

Relatório de testes, cobertura por risco, artifacts sanitizados, defeitos, flakiness, riscos residuais e parecer aprovado/rejeitado para Security e Review.

---

## 6. Security Loop

### Entrada

- Spec, arquitetura, contratos e classificação de dados;
- threat model e casos de abuso;
- incremento candidato e dependências/SBOM quando houver;
- evidências de teste, SAST, dependency audit, secret e image scan;
- configuração e plano operacional afetados.

### Responsáveis

- **Coordenador:** Security Agent.
- **Participantes:** Architect, agentes de implementação, Database, QA e DevOps.
- **Aprovação:** Security para controles técnicos; autoridade humana de negócio/jurídica para risco residual/LGPD quando aplicável.

### Processo

1. Determinar mudança de ativos, atores, dados e fronteiras.
2. Atualizar STRIDE, misuse cases e risco inerente/residual.
3. Revisar auth, RBAC, IDOR, tenant, validação, criptografia e secrets.
4. Verificar APIs, webhook, idempotência, rate limiting, filas e auditoria.
5. Avaliar dependency/SAST/secret/image scans e falsos positivos com evidência.
6. Revisar finalidade, minimização, retenção, rights flow e suboperadores.
7. Testar cenários negativos e sanitização de telemetria.
8. Definir mitigação, compensação e resposta a incidente.
9. Emitir parecer e registrar risco residual.

### Critérios de aprovação

- threat model atualizado;
- controles rastreáveis e testados;
- isolamento e menor privilégio comprovados;
- nenhum secret/PII indevido em código, artifact ou sinal;
- nenhum achado bloqueante aberto;
- LGPD técnica e auditoria atendidas;
- riscos residuais possuem aceite autorizado, owner e revisão.

### Critérios de rejeição

- rota/objeto sensível sem autorização server-side;
- confiança em tenant ou papel enviado pelo cliente;
- vulnerabilidade crítica/alta acima da política sem tratamento;
- secret exposto ou credencial ampla;
- log/payload coleta dado sem finalidade;
- webhook sem assinatura/replay protection;
- exceção sem expiração, compensação ou autoridade.

### Tratamento da rejeição

Security registra exploração/impacto de modo seguro e encaminha: controle local à Implementation; design à Architecture; requisito/base legal à Spec; contrato à API Contract; ambiente/pipeline à DevOps. Incidente ativo interrompe o fluxo normal e aciona resposta.

### Saída

Threat model e registro de risco atualizados, achados/tratamentos, evidências, requisitos operacionais, parecer de segurança e handoff para Review/Release.

---

## 7. Review Loop

### Entrada

- versão coerente de Spec, arquitetura, contratos e ADRs;
- diff/incremento candidato futuro;
- relatórios de Testing e Security;
- migrations, documentação e artifacts relevantes;
- lista de riscos, exceções e decisões.

### Responsáveis

- **Coordenador:** Code Review Agent.
- **Participantes:** autores e especialistas do domínio afetado.
- **Aprovação:** revisor independente; code owner humano conforme proteção; Security/Database/Architect mantêm veto técnico em suas fronteiras bloqueantes.

### Processo

1. Confirmar escopo, origem e rastreabilidade.
2. Revisar comportamento contra Spec, não apenas estilo.
3. Verificar arquitetura, contratos, dados, segurança, observabilidade e testes.
4. Procurar complexidade, duplicação, erro de concorrência, compatibilidade e impacto não intencional.
5. Classificar comentário como bloqueante, recomendação ou pergunta.
6. Exigir evidência para resolução e reavaliar o conjunto após mudanças.
7. Confirmar documentação e release impact.
8. Consolidar decisão sem apagar dissenso relevante.

### Critérios de aprovação

- mudança corresponde ao escopo e artefatos aprovados;
- Testing e Security aprovados;
- bloqueantes resolvidos com evidência;
- código/artefato mantenível e sem surpresa operacional;
- migrations, compatibilidade e documentação revisadas;
- autoria e aprovação segregadas quando exigido.

### Critérios de rejeição

- diff inclui escopo ou dependência não aprovada;
- comentário bloqueante encerrado sem correção/evidência;
- testes frágeis ou ausência de cenário crítico;
- ADR/contrato/documentação desatualizados;
- mudança grande demais para revisão confiável;
- qualidade ou segurança delegada inteiramente a ferramenta.

### Tratamento da rejeição

Cada achado aponta ao loop de origem. O autor responde e solicita nova revisão; alterações substanciais invalidam aprovações afetadas e reabrem Testing/Security. Discordância técnica duradoura vai ao Architect/ADR, não a votação informal.

### Saída

Parecer de revisão, comentários resolvidos/pendentes, aprovações, riscos/exceções, versão candidata e autorização para Release Loop.

---

## 8. Release Loop

### Entrada

- candidato aprovado por Spec/Architecture/Contract quando afetados, Testing, Security e Review;
- artefato imutável, digest, SBOM e provenance;
- migration/compatibilidade, configuração e feature flags;
- release notes, SLOs, dashboards, alertas e runbooks;
- plano de rollout, smoke, rollback/roll-forward e comunicação.

### Responsáveis

- **Coordenador:** DevOps Agent.
- **Participantes:** Architect, QA, Security, Database, agentes de implementação e owner de produto/operação.
- **Aprovação:** autoridade humana de release/operação; QA e Security mantêm gates; Database aprova migration; Product aprova impacto/rollout.

### Processo

1. Validar integridade do artefato e todas as evidências.
2. Confirmar ambiente, secret references, capacidade, compatibilidade e inventário de configuração.
3. Ensaiar deployment/migration e smoke em staging.
4. Avaliar error budget, incidentes ativos, janela e impacto.
5. Promover o mesmo digest com rollout gradual/flag quando aplicável.
6. Acompanhar readiness, smoke e SLIs; registrar versão/mudança em dashboards.
7. Pausar, rollback ou roll-forward diante de degradação.
8. Comunicar resultado, preservar evidências e atualizar status.

### Critérios de aprovação

- todos os gates obrigatórios aprovados e atuais;
- artefato identificável e sem rebuild por ambiente;
- migration segura e recuperável;
- secrets/configuração validados sem exposição;
- observabilidade e suporte prontos;
- rollout e reversão possíveis;
- error budget e janela permitem a mudança;
- aprovadores autorizados registrados.

### Critérios de rejeição

- artifact mutable ou origem/digest desconhecidos;
- teste/scan ausente, expirado ou falho;
- migration destrutiva sem plano;
- alerta/runbook/owner ausente em jornada crítica;
- conflito de configuração/porta/secret;
- incidente ativo ou budget esgotado sem justificativa de recuperação;
- dependência de ação manual irreproduzível.

### Tratamento da rejeição

DevOps não contorna gate. O candidato retorna ao loop correspondente; a mesma evidência pode ser reaproveitada apenas se a mudança não a invalidar. Emergência segue runbook e autoridade especial, com reconciliação posterior obrigatória.

### Saída

Release promovida ou bloqueada, digest/ambiente, migration, aprovações, resultados de smoke/SLI, decisão de rollout/reversão, comunicação e handoff ao Observability Loop.

---

## 9. Observability Loop

### Entrada

- release e marcações de mudança;
- SLOs/SLIs, error budget e baseline;
- logs, métricas, traces, auditoria e healthchecks sanitizados;
- dashboards, alertas, runbooks e feedback de suporte/tenants;
- incidentes, anomalias, custo e capacidade.

### Responsáveis

- **Coordenador:** DevOps Agent.
- **Participantes:** owner do domínio, Architect, agentes de implementação, QA, Security e Business Analyst.
- **Aprovação:** owner operacional/SRE quando existir; Product para percepção/jornada; Security para sinais sensíveis; Architect para mudanças estruturais.

### Processo

1. Confirmar ingestão, correlação, redaction e qualidade dos sinais.
2. Observar burn-rate, latência, backlog, erro e capacidade por janela.
3. Correlacionar degradação com deploy, migration, flag, tenant agregado ou provider.
4. Executar runbook, mitigar e validar recuperação pelo SLI.
5. Revisar alertas por acionabilidade, falsos positivos/negativos e cobertura.
6. Avaliar custo/cardinalidade/retenção sem perder sinal necessário.
7. Conduzir post-incident sem culpabilização e registrar ações.
8. Transformar aprendizado em nova Spec, arquitetura, teste, segurança ou tarefa operacional.
9. Revisar objetivos e baseline sem reescrever histórico.

### Critérios de aprovação

- jornadas críticas visíveis ponta a ponta;
- SLIs confiáveis e dentro do objetivo ou plano de recuperação ativo;
- alertas acionáveis e runbooks testados;
- nenhuma PII/secret ou cardinalidade descontrolada;
- filas/outbox/providers têm sinais de atraso, retry e perda;
- incidentes e feedback geraram owners e ações;
- capacidade e custo não indicam risco imediato sem plano.

### Critérios de rejeição

- “tudo verde” baseado apenas em processo vivo enquanto jornada falha;
- lacuna de correlação entre HTTP, outbox, job e webhook;
- log/trace contém dado proibido;
- SLI sem fonte/query confiável;
- alerta sem owner/runbook ou silenciado indefinidamente;
- backlog/drop de telemetria invisível;
- incidente encerrado sem verificação ou aprendizado rastreável.

### Tratamento da rejeição

Problema de instrumentação retorna à Implementation e Testing; necessidade de novo comportamento ao Spec; limite estrutural à Architecture; exposição de dado ao Security; release degradante ao Release para pausa/reversão. A operação continua acompanhada até restauração e validação do SLI.

### Saída

Parecer operacional, saúde dos SLOs/error budgets, ações de capacidade/confiabilidade, incidentes/postmortems, ajustes de sinais/runbooks e feedback rastreável que reinicia os loops necessários.

---

## Gates complementares da fundação SaaS

| Artefato/decisão | Loop coordenador | Revisores obrigatórios | Rejeitar quando |
| --- | --- | --- | --- |
| Billing, overage e mudança de plano | Spec + Architecture | Produto, Architect, Dados | política implícita, perda de dado ou cobrança real não especificada |
| Entitlements versus flags/RBAC | Architecture + Security | Produto, Security, Backend, QA | um controle contorna outro ou fallback abre acesso |
| catálogo de eventos/outbox | Architecture + API Contract | owners produtores/consumidores, Security | evento sem owner/schema/idempotência ou com dado proibido |
| ownership de contexto/dado | Architecture | todos os context owners | escrita cruzada, dependência circular ou owner ausente |
| DR e RPO/RTO | Release + Observability | DevOps, Database, Security, QA | backup sem restore, meta sem teste/owner |
| FinOps | Architecture + Release | DevOps, FinOps/Produto | custo sem driver/alerta ou economia reduz controle crítico |
| RBAC MVP | Security | Produto, Security, QA | operação crítica sem negação/escopo/condição |
| retenção/base/anonimização | Security | Dados/Privacy, Jurídico, Produto | base/prazo não revisados ou eliminação incompleta |
| SLO/load profile | Testing + Observability | Produto, Architect, QA, DevOps | SLI não mensurável ou carga sem envelope/mix |
| portas locais | Release | DevOps e owner local | refresh/taskflow/tasks não verificados ou binding fixo em colisão |

Decisão humana pendente é registrada em `docs/18-governance/approval-record.md` com
impacto e mantém o gate afetado fechado. `PENDING` não é aprovação condicional. O
loop só altera o estado quando pessoa autorizada registra versão/evidência.

## Matriz de retornos

| Descoberta | Loop de retorno primário |
|---|---|
| requisito ambíguo ou novo comportamento | Spec Loop |
| fronteira, consistência ou escala inadequada | Architecture Loop |
| incompatibilidade ou exposição de interface | API Contract Loop |
| defeito localizado no incremento | Implementation Loop |
| lacuna de cenário, dado ou determinismo | Testing Loop |
| vulnerabilidade, privacidade ou risco novo | Security Loop |
| inconsistência geral/manutenibilidade | Review Loop |
| artefato/configuração/migration/promoção | Release Loop |
| sinal, alerta, SLO, capacidade ou runbook | Observability Loop |

## Encerramento de um ciclo

Um ciclo está encerrado quando a versão entregue é rastreável à Spec; as decisões arquiteturais e contratos são coerentes; testes, segurança e revisão estão aprovados; a release é identificável; e a operação consegue medir, detectar, responder e devolver aprendizado. O próximo ciclo começa desse aprendizado, sem apagar o histórico do anterior.
