# Modelo de ameaças do Mr Coti

## Método e escopo

O modelo usa STRIDE, casos de abuso e análise de fronteiras. Ele é inicial e deve ser revisado a cada mudança de arquitetura, integração, dado, papel ou fluxo crítico. O modelo não pressupõe confiança em frontend, rede, payload de provider fake ou identificador fornecido pelo cliente.

Escopo inicial: navegador, frontend Next.js, backend NestJS modular monolith, MySQL, Redis/BullMQ, outbox, APIs fictícias de pagamentos/notas/notificações, webhooks, storage futuro, pipeline e operação.

## Ativos

- identidade, credenciais, sessões e fatores de autenticação;
- dados pessoais de clientes, usuários e contatos;
- tenants, unidades, papéis, permissões, planos e feature flags;
- cardápio, estoque, pedidos, comandas, caixa e relatórios;
- estados e evidências de pagamento e nota fictícios;
- templates, destinos e logs de notificações;
- trilhas de auditoria, logs, métricas e traces;
- schemas, migrations, código, imagens, SBOM e pipeline;
- secrets, chaves de webhook e configuração de ambientes;
- disponibilidade e reputação do serviço.

## Atores e pressupostos

- usuário legítimo com diferentes papéis;
- administrador do tenant;
- operador privilegiado da plataforma;
- cliente externo das APIs públicas;
- provider externo ou fake comprometido/malformado;
- atacante anônimo;
- usuário legítimo malicioso ou conta comprometida;
- processo, job ou pipeline com credencial;
- pessoa com acesso operacional indevido.

Todo ator e componente pode falhar. Acesso autenticado não implica autorização; rede interna não implica confiança; provider fake não implica payload seguro.

## Fronteiras de confiança e fluxos

1. **Navegador → frontend/backend:** internet, entrada hostil, cookies/tokens e dados pessoais.
2. **Frontend → backend:** chamadas server-side/client-side; identidade deve ser validada no backend.
3. **Backend → MySQL:** fronteira de persistência e principal risco de isolamento cross-tenant.
4. **Backend/workers → Redis/BullMQ:** cache, rate limiting, jobs e contexto de tenant.
5. **Transação → outbox → consumidor:** entrega assíncrona, duplicidade e ordenação.
6. **Backend → providers:** egress para pagamento, nota e notificação fictícios; risco de SSRF/timeout.
7. **Providers → webhooks:** entrada pública, assinatura, replay e schema.
8. **Aplicação → telemetria:** risco de exfiltração por logs/traces.
9. **CI/CD → registry/ambientes:** supply chain e elevação de privilégio.
10. **Operação → produção:** acesso privilegiado, erro humano e insider threat.

## Matriz STRIDE inicial

| ID | Categoria | Ameaça/caso de abuso | Impacto | Tratamento principal | Evidência esperada |
|---|---|---|---|---|---|
| T01 | Spoofing | credential stuffing ou sessão roubada | acesso indevido | MFA privilegiado, rate limit, sessão revogável, detecção | testes de auth e alertas |
| T02 | Spoofing | webhook forjado ou replay | efeito financeiro/fiscal indevido | assinatura, timestamp, event ID e deduplicação | teste de contrato/replay |
| T03 | Tampering | alterar `tenant_id`/resource ID no request | vazamento ou alteração cross-tenant | tenant do contexto, query escopada, policy por objeto | testes IDOR de leitura/escrita |
| T04 | Tampering | modificar preço/total no frontend | perda financeira/integridade | cálculo autoritativo no domínio e versão de preço | unitário/API |
| T05 | Tampering | alterar mensagem em fila ou outbox | job no tenant errado | acesso de rede, schema, contexto confiável e integridade | integração e auditoria |
| T06 | Repudiation | operador nega cancelamento, estorno ou permissão | disputa e perda de confiança | auditoria imutável/minimizada e correlação | consulta e retenção testadas |
| T07 | Information disclosure | logs/traces expõem token, PII ou payload | incidente LGPD | redaction, allowlist de campos, acesso restrito | teste de sanitização |
| T08 | Information disclosure | cache key sem tenant retorna dado alheio | vazamento cross-tenant | namespace obrigatório e teste com dois tenants | integração |
| T09 | Information disclosure | exportação/relatório sem escopo | vazamento em massa | policy, filtros server-side, limite e auditoria | API/E2E adversarial |
| T10 | Denial of service | login, busca ou relatório caro em volume | indisponibilidade | rate limit, paginação, timeout, filas e quotas | carga e alerta |
| T11 | Denial of service | provider lento esgota conexões/workers | cascata | timeout, circuit breaker, bulkhead e backoff | teste de resiliência |
| T12 | Denial of service | poison message ou retry infinito | fila paralisada/custo | limite, estado terminal, DLQ e alerta | integração |
| T13 | Elevation | usuário comum atribui papel privilegiado | tomada do tenant | policy administrativa e prevenção de autoelevação | API negativo e auditoria |
| T14 | Elevation | feature flag no cliente habilita módulo premium | uso indevido | enforcement backend por tenant/plano/ambiente | unitário/API |
| T15 | Elevation | pipeline de PR obtém secret/deploy | comprometimento supply chain | token mínimo, jobs separados, environment protection | revisão de workflow |
| T16 | Tampering | mesma idempotency key com payload diferente | estado financeiro ambíguo | fingerprint e rejeição de conflito | API/integração |
| T17 | Tampering | dupla captura/fechamento concorrente | cobrança/caixa duplicado | transação, constraint, lock/versão e consumidor idempotente | teste concorrente |
| T18 | Information disclosure | URL externa força SSRF a metadata/rede interna | roubo de credencial/scan | destinos permitidos, egress restrito e parser seguro | testes SSRF |
| T19 | Spoofing | provider fake confundido com serviço real | decisão operacional inválida | ambientes separados, marcação explícita e secrets distintos | contrato/configuração |
| T20 | Repudiation | suporte acessa tenant sem justificativa | abuso privilegiado | acesso JIT, justificativa, MFA e auditoria reforçada | revisão periódica |
| T21 | Tampering | migration apaga/corrompe dados | perda de dados | expand-contract, backup, check e aprovação | ensaio em staging |
| T22 | Information disclosure | erro retorna stack/query/schema | apoio ao atacante | error envelope seguro e telemetria restrita | API negativo |
| T23 | Elevation | mass assignment altera campo protegido | privilégio/estado indevido | DTO allowlist e comando explícito | fuzz/API |
| T24 | Tampering | dependência/action comprometida | código malicioso | lockfile, pin, SBOM, review e provenance | scans/attestation |

## Casos de abuso prioritários

### Acesso horizontal entre tenants

Um usuário troca ID de pedido, cliente, relatório, arquivo, job ou unidade. O backend deve obter tenant da identidade, aplicar o escopo na consulta inicial e retornar resposta segura. A tentativa gera sinal de segurança sem incluir o dado alvo.

### Escalada vertical

Um gerente tenta atribuir permissão acima de sua alçada, alterar plano, liberar feature premium ou operar tenant suspenso. A policy valida capacidade do ator, alcance do papel e estado do tenant; a tentativa é negada e auditada.

### Duplicação de efeito

Um cliente repete request, webhook ou job durante timeout. Idempotência, constraint/transação e deduplicação devem produzir um único efeito e uma resposta coerente, inclusive sob concorrência.

### Exfiltração por telemetria

Um payload injeta token, documento ou texto controlado e provoca erro. Logs estruturados usam allowlist/redaction, evitam corpo integral e neutralizam quebra de linha/log forging. O acesso ao backend de logs é restrito.

### Esgotamento de recursos

Um ator combina filtros caros, exportações, grandes payloads e retries. Limites de tamanho/paginação, quotas, custo por rota, filas e timeouts mantêm disponibilidade e geram alertas acionáveis.

## Priorização e risco residual

Impacto considera confidencialidade, integridade, disponibilidade, LGPD, finanças, isolamento de tenant e operação. Probabilidade considera exposição, pré-requisito, detectabilidade e controles existentes. O Security Agent classifica risco antes e depois do tratamento. Não existe aceite tácito: risco residual tem proprietário de negócio, prazo/revisão, controles compensatórios e decisão registrada.

## Verificação

- testes unitários de policy e invariantes;
- testes API de auth, IDOR, mass assignment e rate limits;
- integração com dois tenants, concorrência, cache, fila e outbox;
- contrato de assinatura/replay de webhooks;
- SAST, dependency audit, secret scan, SBOM e scan de imagem;
- testes de resiliência de timeout/retry/poison messages;
- inspeção de logs/traces para sanitização;
- ensaio de incidentes e acesso emergencial antes de produção.

## Gatilhos de revisão

O modelo é revisto ao adicionar módulo, papel, integração, webhook, dado pessoal/sensível, upload, URL fornecida por usuário, exportação, cache, fila, storage, mudança de tenancy/auth, ferramenta de observabilidade, deploy ou incidente. A revisão também ocorre antes de cada marco de release.

