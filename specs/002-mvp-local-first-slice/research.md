# Pesquisa e decisões — MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Feature:** `002-mvp-local-first-slice`  
**Data:** 2026-06-26  
**Estado:** decisões aprovadas com condições em 2026-07-11; implementação dev/local
autorizada em ordem pelas tasks

## D-01 — Fatiamento vertical local-first

**Decisão:** implementar primeiro uma fatia vertical completa e pequena: login
sintético → tenant/unidade → catálogo → mesa/comanda → item → fechamento → pagamento
fake.

**Alternativas consideradas:**

| Alternativa | Motivo para rejeitar agora |
| --- | --- |
| Construir todo o MVP funcional de uma vez | aumenta risco, demora feedback e mistura muitos domínios |
| Começar por scaffold técnico vazio | prova pouco valor e pode acumular arquitetura sem fluxo real |
| Começar só pelo frontend | atrasaria validação de tenant, RBAC, persistência e idempotência |

**Consequência:** nota fake, e-mail fake, estoque e relatórios ficam para increments
posteriores. A primeira fatia precisa ser demonstrável ponta a ponta.

## D-02 — Dados sintéticos obrigatórios

**Decisão:** seeds/fixtures usarão tenants, usuários, produtos e mesas sintéticos.
Nenhum dado pessoal real será usado.

**Motivo:** CHK048 permanece como `PENDING LEGAL REVIEW` apenas para eventual
produção ou tratamento real de dados pessoais. O portfólio dev/local não precisa nem
deve tratar dados reais.

**Conseqüência:** documentação, testes e screenshots devem evitar e-mails, telefones,
nomes ou documentos reais.

## D-03 — Autenticação local simples, com fronteiras reais

**Decisão:** autenticação inicial será local, com usuários sintéticos, hash de senha,
sessão/token curto e middleware/guard criando `TenantContext`.

**Alternativas consideradas:**

| Alternativa | Motivo para rejeitar agora |
| --- | --- |
| SSO/OAuth externo | adiciona provider real e complexidade sem necessidade local |
| Login mockado no frontend | enfraquece RBAC, auditoria e testes de isolamento |
| Token fixo de desenvolvimento | risco de hábitos inseguros e pouca rastreabilidade |

**Conseqüência:** SSO, MFA, SCIM e recuperação de senha ficam fora desta fatia.

## D-04 — Contrato REST interno do produto antes do código

**Decisão:** a fatia terá contrato OpenAPI próprio em
`specs/002-mvp-local-first-slice/contracts/openapi.json`.

**Motivo:** embora não seja API pública externa como pagamentos/notas/notificações,
as rotas do produto precisam de forma estável para backend, frontend e testes.

**Conseqüência:** controllers futuros devem seguir o contrato ou atualizar a spec
antes de divergir.

## D-05 — Outbox desde o primeiro fluxo de fechamento

**Decisão:** fatos críticos da jornada (`TabOpened`, `OrderItemAdded`, `BillClosed`,
`FakePaymentRecorded`) terão registros de outbox persistidos na mesma transação do
aggregate.

**Alternativas consideradas:**

| Alternativa | Motivo para rejeitar agora |
| --- | --- |
| Eventos só em memória | não prova resiliência nem replay |
| Adiar outbox para integração real | criaria refatoração no fluxo mais crítico |
| Broker externo obrigatório | pesado para portfólio local inicial |

**Conseqüência:** publicação/worker pode começar simples, mas o registro durável do
fato já existe.

## D-06 — Pagamento fake embutido como adapter local

**Decisão:** o fechamento usará pagamento fake interno/adaptador local, claramente
marcado como simulado e sem dados financeiros reais.

**Motivo:** permite completar a jornada sem gateway financeiro, mantendo fronteira
para evoluir ao contrato fake mais amplo.

**Conseqüência:** cartão, PIX, adquirente, chargeback real e conciliação bancária
ficam fora desta fatia.

## D-07 — Portas locais do Mr Coti

**Decisão:** usar portas sugeridas sem colisão com `refresh`/`taskflow`: web `3400`,
API `3200`, Swagger `/docs` ou `3201`, MySQL `3308`, Redis `6380`.

**Motivo:** CHK038 foi satisfeito com containers externos ativos e bindings
registrados. Mesmo assim, ambiente local muda; preflight deve rodar antes de subir a
stack futura.

**Conseqüência:** nenhum código futuro deve assumir porta fixa; todas são variáveis
de ambiente.

## D-08 — Testes como parte do primeiro incremento

**Decisão:** a fatia só será considerada demonstrável com testes unitários,
integração, contrato OpenAPI, isolamento tenant/RBAC e E2E principal.

**Motivo:** a primeira entrega de código cria o padrão de qualidade do projeto.

**Conseqüência:** uma implementação manualmente “funcionando” sem gates não fecha a
feature.

## Questões abertas

| Questão | Estado | Impacto |
| --- | --- | --- |
| Biblioteca concreta de validação DTO | PENDING HUMAN DECISION/ADR se sair da stack aprovada | bloqueia adoção de tecnologia não prevista |
| Estratégia exata de sessão/token | decisão de implementação dentro do desenho aprovado | não bloqueia spec se cumprir RSD/RNF |
| UI visual final | fora desta spec; basta usabilidade local clara | não bloqueia API/domínio |
| Legal Review | PENDING LEGAL REVIEW | gatilho futuro se produção/dados reais forem reabertos; não bloqueia a fatia dev/local sintética |
