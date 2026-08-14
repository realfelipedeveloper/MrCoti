# Matriz RBAC do MVP

**Estado:** matriz aprovada com condições para arquitetura de segurança. O MVP local
implementa primeiro os papéis correspondentes aos módulos existentes, mas todo
endpoint implementado deve possuir autenticação, autorização, policy/guard, teste
positivo, teste negativo e teste de isolamento tenant quando aplicável.

Cada linha positiva ainda exige tenant ativo, membership vigente, entitlement/flag, escopo do recurso e estado válido. “Negado” é o default e não revela se recurso alheio existe.

| Ator(es) | Comando | Recurso | Escopo | Condição | Decisão | Justificativa | Requisito |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Platform Admin | criar tenant | Tenant | plataforma | permissão `saas.tenant.create`, idempotência e auditoria | permitido | provisionamento é função da plataforma | RF-003, RSD-003, RSD-015 |
| demais atores | criar tenant | Tenant | qualquer | sem privilégio de plataforma | negado | impede autoelevação/tenant espúrio | RSD-003, RSD-015 |
| Platform Admin | suspender tenant | Tenant | plataforma | motivo, confirmação, auditoria e policy comercial | permitido | ação de alto impacto centralizada | RF-003, RSD-010, RSD-015 |
| demais atores | suspender tenant | Tenant | tenant/unidade | mesmo que owner local | negado | separa administração SaaS de operação | RSD-003, RSD-015 |
| Tenant Owner; Platform Admin JIT | alterar plano | Subscription | tenant | versão esperada, preview de impacto e idempotência | permitido | owner contrata; suporte só com concessão temporal | RF-004–006, RF-046 |
| demais atores | alterar plano | Subscription | empresa/unidade | qualquer | negado | impede mudança comercial não autorizada | RSD-015 |
| Tenant Owner; Organization Admin; Unit Manager* | criar usuário | Membership | tenant/empresa/unidade | *Unit Manager apenas sua unidade e papel inferior | permitido | delegação limitada ao próprio escopo | RF-007–008, RSD-015 |
| Cashier; Waiter; Kitchen Staff; Stock Manager; Finance Manager; Support Readonly | criar usuário | Membership | qualquer | sem administração de identidade | negado | menor privilégio | RSD-003, RSD-015 |
| Tenant Owner; Organization Admin* | alterar permissões | RoleAssignment | tenant/empresa | *sem conceder permissão superior à própria | permitido | administração com proteção anti-escalada | RF-008, RSD-003, RSD-015 |
| demais atores | alterar permissões | RoleAssignment | unidade/recurso | qualquer | negado | função crítica segregada | RSD-015 |
| Tenant Owner; Organization Admin | criar unidade | Unit | tenant/empresa | entitlement/limite disponível | permitido | gestão organizacional | RF-002, RF-005, RF-047 |
| demais atores | criar unidade | Unit | qualquer | sem privilégio organizacional | negado | protege limite e estrutura | RSD-015 |
| Unit Manager; Waiter; Cashier | abrir mesa | Table/Tab | unidade atribuída | mesa disponível e operação habilitada | permitido | função operacional local | RF-016–017, RSD-015 |
| demais atores | abrir mesa | Table/Tab | unidade | leitura/cozinha/estoque/financeiro | negado | separação operacional | RSD-015 |
| Unit Manager; Waiter; Cashier | criar pedido | Order | unidade/comanda | comanda aberta, catálogo vigente | permitido | atendimento autorizado | RF-018, RSD-015 |
| demais atores | criar pedido | Order | qualquer | sem papel de atendimento | negado | evita mutação indevida | RSD-015 |
| Unit Manager; Cashier; Waiter* | cancelar pedido | Order | unidade | motivo; *Waiter apenas próprio/estado permitido | permitido | exceção controlada e auditada | RF-020, RSD-010, RSD-015 |
| Kitchen Staff; Stock Manager; Finance Manager; Support Readonly | cancelar pedido | Order | qualquer | mesmo com visibilidade | negado | leitura/preparo não autoriza cancelamento | RSD-015 |
| Unit Manager; Cashier* | reabrir comanda | Tab | unidade | motivo; *Cashier com policy/limite; reconciliação | permitido | ação financeira excepcional | RF-017, RF-020, RSD-015 |
| demais atores | reabrir comanda | Tab | qualquer | qualquer | negado | reduz fraude/alteração histórica | RSD-015 |
| Unit Manager; Cashier | fechar conta | Bill | unidade | soma conciliada e versão vigente | permitido | atribuição de caixa/gestão | RF-019, RSD-015 |
| demais atores | fechar conta | Bill | qualquer | sem permissão financeira | negado | integridade monetária | RSD-015 |
| Unit Manager; Cashier* | aplicar desconto | Bill/Order | unidade | *até teto configurado; acima exige manager; motivo | permitido | delegação com limite e auditoria | RF-019, RSD-010, RSD-015 |
| Waiter; Kitchen Staff; Stock Manager; Support Readonly | aplicar desconto | Bill/Order | qualquer | sem policy específica | negado | previne abuso | RSD-015 |
| Unit Manager; Cashier | abrir caixa | CashSession | unidade | nenhum caixa conflitante; saldo inicial auditado | permitido | operação de caixa | RF-038, RSD-015 |
| demais atores | abrir caixa | CashSession | qualquer | qualquer | negado | segregação financeira | RSD-015 |
| Unit Manager; Cashier | fechar caixa | CashSession | unidade | conferência, divergência motivada e versão | permitido | encerramento reconciliado | RF-038, RSD-015 |
| demais atores | fechar caixa | CashSession | qualquer | qualquer | negado | integridade financeira | RSD-015 |
| Stock Manager; Unit Manager* | ajustar estoque | StockMovement | unidade | motivo, origem e *policy de valor/quantidade | permitido | owner operacional do estoque | RF-038, RSD-010, RSD-015 |
| demais atores | ajustar estoque | StockMovement | qualquer | leitura ou operação diversa | negado | impede manipulação de saldo | RSD-015 |
| Tenant Owner; Organization Admin; Unit Manager; Finance Manager | consultar relatório | Report | escopo atribuído | filtros tenant-aware e entitlement | permitido | gestão/finanças necessitam leitura | RF-041, RSD-001, RSD-015 |
| demais atores | consultar relatório | fora do escopo | outro tenant/unidade | qualquer | negado | evita vazamento agregado | RSD-001–003, RSD-015 |
| Platform Admin; Tenant Owner* | configurar feature flag | FeatureRule/Override | ambiente ou tenant | Platform: técnica; *Owner: override permitido, sem kill switch | permitido | separa rollout de concessão comercial | RF-012–015, RF-047 |
| demais atores | configurar feature flag | FeatureRule/Override | qualquer | qualquer | negado | evita bypass de plano/segurança | RSD-015 |
| Tenant Owner; Organization Admin*; Unit Manager*; Finance Manager*; Support Readonly JIT | consultar logs de auditoria | AuditEntry | escopo atribuído | necessidade, filtros, mascaramento; Support com expiração | permitido | investigação/governança controlada | RF-009–010, RSD-010, RSD-015 |
| demais atores | consultar logs de auditoria | AuditEntry | fora do escopo | qualquer | negado | auditoria pode conter metadados sensíveis | RSD-011, RSD-015 |

## Segregação e auditoria

Alterar plano, permissão, feature, suspensão, reabertura, desconto, ajuste,
exportação e acesso de suporte são operações críticas. Elas registram ator,
tenant/unidade, policy, motivo, antes/depois minimizado e correlation ID.

Papéis de destino como Stock Manager, Finance Manager e Support Readonly podem ser
implementados quando os módulos correspondentes entrarem no escopo. Isso não reduz
cybersecurity: nenhuma rota sensível nasce sem controle de acesso.
