# ADR-0015 — Retenção e anonimização LGPD

- **Status:** Aceito com condições — PENDING LEGAL REVIEW antes de produção/dados reais
- **Data:** 2026-06-23
- **Decisão:** retenção será definida por categoria, finalidade/base e legal hold; anonimização será workflow verificável

## Contexto

O Mr Coti tratará dados de tenant, usuários, clientes, pedidos, auditoria, notificações e backups. Um prazo único viola minimização ou obrigações; apagar a fonte sem cópias/read models/backups deixa dados recuperáveis.

## Drivers

- LGPD e direitos do titular;
- obrigações contratuais/legais;
- auditoria/defesa;
- minimização e custo;
- cópias, storage e backup;
- responsabilidades controlador/operador.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| policy por classe/finalidade | proporcional e auditável | exige catálogo/workflows |
| retenção única longa | simples | excesso de dados/risco/custo |
| exclusão imediata total | minimização máxima | pode violar obrigação/auditoria e backups |

## Decisão

Adotar matriz de retenção sugerida, base legal revisada e anonimização/tombstones propagados. Legal hold é explícito. Restore reaplica eliminações. Prazos e bases ficam aprovados como baseline de portfolio em 2026-06-26, mas somente se tornam normativos para produção ou tratamento real de dados pessoais após Legal Review.

## Consequências

### Positivas

- tratamento tem finalidade/prazo/owner;
- eliminação alcança derivados;
- auditoria preserva o necessário sem PII excessiva.

### Negativas

- workflows e catálogo precisam de manutenção;
- anonimização pode reduzir utilidade analítica;
- backups têm eliminação diferida até expiração.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| anonimização reversível | teste de reidentificação e key segregation |
| apagar obrigação | legal hold/base aprovada |
| restore ressuscitar dado | tombstone/replay pós-restore |
| prazo sem jurídico | status PENDING e gate CHK048 |

## Gatilhos de revisão

- parecer jurídico/contrato novo;
- novo dado sensível ou IA;
- mudança de jurisdição;
- incidente/pedido de titular;
- alteração de backup/analytics/provider.
