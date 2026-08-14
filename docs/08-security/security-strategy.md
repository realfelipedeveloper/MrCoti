# Estratégia de segurança do Mr Coti

## Objetivo e escopo

Esta estratégia integra segurança ao ciclo de especificação, arquitetura, contrato, implementação, teste, release e observabilidade. Abrange frontend, backend, banco, cache/filas, APIs públicas fictícias, webhooks, pipeline, imagens, ambientes e operação.

Mesmo sendo inicialmente um projeto de portfólio local-first, o Mr Coti trata
cybersecurity como requisito de primeira classe. O escopo funcional pode ser
incremental; os controles de segurança dos fluxos implementados são obrigatórios.

## Princípios

1. **Secure by design:** riscos são tratados antes do código.
2. **Deny by default:** ausência de decisão explícita resulta em negação.
3. **Least privilege:** usuário, serviço, job e pipeline recebem apenas o necessário.
4. **Tenant isolation:** toda fronteira de dado e execução preserva o tenant.
5. **Defense in depth:** autenticação, autorização, validação, constraints, rede e auditoria se complementam.
6. **Assume breach:** credenciais rotacionam, acessos são observados e o impacto é compartimentado.
7. **Privacy by design/default:** finalidade, minimização e retenção fazem parte do modelo.
8. **Fail securely:** falhas não ampliam privilégio, não revelam internals e não ignoram integridade.
9. **Traceability:** decisão, mudança, ação crítica e exceção possuem vínculo auditável.

## Identidade, autenticação e sessão

A estratégia exata será consolidada no ADR de autenticação. Independentemente do mecanismo:

- senhas, se usadas, recebem algoritmo adaptativo aprovado, salt e parâmetros versionados;
- resposta e tempo evitam enumeração trivial de contas;
- brute force é limitado por identidade, origem e risco, sem bloquear em massa um tenant por ataque externo;
- credenciais, tokens e sessões têm expiração, rotação e revogação;
- autenticação privilegiada e acesso operacional adotam MFA quando disponíveis;
- cookies, se usados, são `HttpOnly`, `Secure` e possuem `SameSite` adequado;
- tokens não são armazenados em logs, URLs ou storage de navegador inadequado;
- troca de senha, suspensão de usuário/tenant e incidente revogam acessos conforme política;
- recuperação de conta usa tokens únicos, curtos e não revela existência de usuário.

## Autorização e RBAC

RBAC define capacidades por papel; policies incorporam tenant, unidade, propriedade, estado do recurso, plano e feature flag. A interface pode ocultar ações, mas a API sempre revalida.

Para prevenir IDOR/BOLA:

- queries incluem o escopo confiável do tenant desde a raiz;
- identificador recebido nunca é usado para inferir autorização;
- repositórios expõem operações tenant-aware e evitam métodos globais em fluxo de negócio;
- cache keys, jobs, eventos, storage paths e relatórios incluem escopo de tenant;
- respostas de acesso negado evitam confirmar recurso de outro tenant;
- testes negativos cobrem leitura, alteração, exclusão, exportação e ação em lote.

Administração da plataforma é uma fronteira separada, com permissões explícitas, MFA, justificativa, auditoria reforçada e sem impersonation silenciosa.

No MVP local, a implementação pode começar pelos papéis essenciais aos fluxos
existentes: Platform Admin, Tenant Owner, Organization Admin, Unit Manager, Cashier,
Waiter e Kitchen Staff. Papéis de módulos futuros entram quando seus módulos forem
implementados. Todo endpoint implementado, porém, deve ter autenticação,
autorização, policy/guard, teste positivo, teste negativo e teste de isolamento
tenant quando aplicável.

## Validação e segurança de aplicação

- DTO Validation aplica allowlist, tipos, limites de tamanho e rejeição de campos inesperados.
- Regras de domínio revalidam invariantes; DTO não substitui aggregate/policy.
- Prisma usa parâmetros e não autoriza SQL dinâmico não revisado.
- Saída HTML, headers, redirects, filenames e planilhas recebem codificação/validação contextual.
- Upload futuro valida tamanho, tipo real, extensão, conteúdo, nome e armazenamento isolado; nunca executa arquivo do usuário.
- Paginação e filtros têm limites para reduzir abuso e consultas custosas.
- Erros públicos têm código estável e mensagem segura; stack trace permanece em telemetria restrita.
- `Helmet`, CSP e demais headers são planejados conforme frontend/API; exceções precisam de justificativa.
- CORS usa allowlist por ambiente e não combina origem arbitrária com credencial.

## OWASP Top 10 — tratamento planejado

| Risco | Controles principais | Evidência |
|---|---|---|
| A01 Broken Access Control | RBAC/policies, escopo tenant-aware, deny by default, testes de IDOR | testes API/E2E negativos e revisão |
| A02 Cryptographic Failures | TLS, secret store, criptografia em repouso, minimização, rotação | configuração e testes operacionais |
| A03 Injection | validação, parametrização Prisma, encoding contextual, CSP | SAST e testes adversariais |
| A04 Insecure Design | SDD, threat model, misuse cases, gates | aprovação do Security Loop |
| A05 Security Misconfiguration | baseline segura, config validada, headers, hardening, drift check | scan de configuração e staging |
| A06 Vulnerable Components | lockfile, dependency audit, SBOM, atualização com SLA | relatório do pipeline |
| A07 Identification/Auth Failures | política de sessão, MFA privilegiado, brute force protection | testes de autenticação e auditoria |
| A08 Software/Data Integrity Failures | commits revisados, actions fixadas, provenance, assinatura/verificação de webhooks | attestations e testes de contrato |
| A09 Logging/Monitoring Failures | eventos de segurança, alertas, correlação e runbooks | simulação e relatório operacional |
| A10 SSRF | allowlist de destinos, bloqueio de redes internas, URL parsing seguro, egress restrito | testes de integração e rede |

## APIs, idempotência e webhooks

- APIs públicas têm versionamento, autenticação, quotas, limites de payload e contrato OpenAPI.
- Chaves de idempotência são opacas, escopadas por tenant/operação, armazenadas com fingerprint da requisição e expiram por política.
- Reuso da mesma chave com payload diferente é rejeitado.
- Webhooks validam assinatura, timestamp/janela, origem lógica, schema e identificador de evento.
- Reentrega é segura; evento duplicado ou fora de ordem não repete efeito financeiro/fiscal.
- Respostas não incluem segredo de assinatura, decisão interna de fraude ou dado alheio à finalidade.

As APIs de pagamento e nota são fictícias e precisam ser visual e contratualmente identificadas como não reais. Nenhum dado real de cartão ou documento fiscal deve ser solicitado para simulação.

## Filas, eventos e outbox

Mensagens carregam somente dados necessários, versão de schema, `tenant_id` obtido de fonte confiável, IDs de correlação e deduplicação. Produtor e consumidor validam schema e autorização contextual. Retries têm limite e backoff; dead-letter ou estado terminal recebe acesso restrito e política de retenção. Poison messages não interrompem toda a fila.

Outbox preserva atomicidade entre mudança de estado e intenção de publicação. Consumidores são idempotentes porque entrega exatamente uma vez não é presumida.

## Rate limiting e disponibilidade

Limites são definidos por rota, identidade, tenant, origem e custo. Endpoints de login, recuperação, busca, exportação, relatórios, webhooks e integrações têm políticas distintas. Respostas informam limite de forma segura. Fallback não abre acesso quando Redis falha; o comportamento fail-open/fail-closed de cada rota é especificado pelo risco.

Timeouts, circuit breakers e bulkheads impedem que um provider esgote recursos. Limites de concorrência protegem workers e banco. Proteções contra abuso são observáveis e ajustadas para não discriminar tenants legítimos.

## Secrets e criptografia

- secrets entram por secret store e identidade de workload;
- nenhum secret em repositório, imagem, log, trace, artifact ou `.env.example`;
- rotação e revogação são testadas;
- chaves têm finalidade, custodiante, versão e ciclo de vida;
- TLS protege tráfego externo e interno conforme risco;
- RDS, ElastiCache, S3 e backups usarão criptografia gerenciada aprovada;
- criptografia de campo é considerada para dados de alta sensibilidade após inventário e ADR;
- hashes e tokens de busca não são tratados como anonimização automática.

## Auditoria de segurança

Eventos mínimos: login e falha, recuperação, MFA, mudança de papel/permissão, ação administrativa, troca/suspensão de tenant, exportação/anonimização, alteração de feature flag/plano, operação financeira/fiscal, mudança de secret/configuração e acesso emergencial.

Cada evento inclui momento, ator, tenant, unidade quando aplicável, ação, alvo por identificador não sensível, resultado, origem lógica e IDs de correlação. Conteúdo anterior/posterior é minimizado e mascarado. Logs de auditoria possuem acesso restrito, proteção contra alteração e retenção formal.

## Secure SDLC e gates

| Momento | Atividade | Gate |
|---|---|---|
| Spec Loop | requisitos, abuso, classificação de dados | requisitos de segurança testáveis |
| Architecture Loop | fronteiras e threat model | tratamentos e riscos residuais aprovados |
| API Contract Loop | auth, scopes, schemas, erros, idempotência | contrato sem exposição indevida |
| Implementation Loop | padrões seguros e revisão local | controles e testes implementados |
| Testing Loop | SAST, dependency audit, secret scan, auth/IDOR e abuso | nenhuma falha bloqueante |
| Review Loop | revisão humana e rastreabilidade | parecer técnico |
| Release Loop | imagem, SBOM, config, migration e runbook | risco aceitável e observabilidade pronta |
| Observability Loop | detecção, alerta, resposta e aprendizado | sinais e runbooks eficazes |

Achados críticos bloqueiam. Severidades e SLA de correção serão formalizados pela governança. Exceções exigem risco, compensação, proprietário, aprovação e expiração; não podem ocultar resultado de scanner.

Referências de maturidade ficam em `docs/20-cybersecurity/`: OWASP ASVS, NIST SSDF,
OWASP SAMM e SLSA. Controles empresariais dependentes de produção, cloud, equipe ou
fornecedor externo permanecem como roadmap obrigatório antes de produção comercial.

## Dependências e pipeline

O CI executará dependency audit, SAST, secret scanning e scan de imagem. Dependências têm origem confiável, versão travada, licença avaliada e necessidade comprovada. GitHub Actions usa versões imutáveis, tokens mínimos e separação entre PR não confiável e job com secrets. A SBOM acompanha releases.

## Resposta a incidentes

O fluxo mínimo é detectar, classificar, conter, preservar evidência, erradicar, recuperar, comunicar e aprender. Incidentes de dados pessoais acionam avaliação LGPD e comunicação conforme decisão do encarregado/jurídico. Runbooks devem cobrir credencial vazada, acesso cross-tenant, webhook abusivo, fraude simulada escapando de ambiente, indisponibilidade de provider e dependência vulnerável crítica.

## Critérios de aprovação de segurança

- threat model atualizado para fronteiras afetadas;
- controles e misuse cases rastreáveis;
- nenhum segredo/dado sensível exposto;
- autorização e isolamento demonstrados;
- scanners e testes bloqueantes aprovados;
- observabilidade e resposta definidas;
- risco residual formalmente aceito quando existir.
