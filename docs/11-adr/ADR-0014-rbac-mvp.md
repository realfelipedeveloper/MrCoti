# ADR-0014 — RBAC do MVP

- **Status:** Aceito com condições — aprovado por Product Owner e Security Officer em 2026-06-26
- **Data:** 2026-06-23
- **Decisão:** RBAC com escopo e policies deny-by-default governará operações críticas do MVP

## Contexto

Papéis atuam em plataforma, tenant, organização e unidade. Uma matriz apenas de nomes não cobre estado, ownership, limites, segregação ou IDOR.

## Drivers

- menor privilégio e anti-escalada;
- escopo tenant/empresa/unidade;
- ações críticas auditáveis;
- suporte just-in-time;
- testes positivos/negativos reproduzíveis.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| RBAC + conditions/policies | compreensível e contextual | matriz e engine exigem disciplina |
| roles fixas sem escopo | simples | privilégios excessivos/IDOR |
| ABAC completo | flexível | complexidade prematura e difícil auditoria |

## Decisão

Usar permission codes estáveis, assignments com escopo e policies para tenant ativo, unidade, estado, entitlement e condição. Deny prevalece. A matriz canônica está em `docs/18-governance/rbac-matrix-mvp.md` e foi aprovada com condições em 2026-06-26.

O MVP pode implementar somente os papéis correspondentes aos módulos existentes, mas
todo endpoint implementado deve ter autenticação, autorização, policy/guard, teste
positivo, teste negativo e teste de isolamento tenant quando aplicável. Nenhuma rota
sensível pode existir sem controle de acesso.

## Consequências

### Positivas

- testes e reviews têm fonte verificável;
- papéis customizados não ultrapassam concedente;
- suporte não recebe acesso implícito.

### Negativas

- decisão pode exigir múltiplas consultas/cache;
- mudanças de papel precisam invalidar sessão/decisão;
- Produto deve arbitrar limites operacionais.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| frontend como única barreira | enforcement no backend |
| IDOR | query já tenant-scoped |
| privilege escalation | concessão limitada ao próprio alcance |
| suporte abusivo | JIT, expiração, motivo e auditoria |

## Gatilhos de revisão

- novos papéis/módulos premium;
- SSO/SCIM/organizações complexas;
- incidente de autorização;
- policy engine externa;
- marketplace/partner access.
