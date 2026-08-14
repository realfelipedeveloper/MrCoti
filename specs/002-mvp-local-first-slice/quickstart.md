# Quickstart de revisão — MVP local-first — fatia vertical essencial

**Produto:** Mr Coti  
**Feature:** `002-mvp-local-first-slice`  
**Finalidade:** revisar a spec antes de autorizar implementação local

## Resultado esperado

Ao final deste roteiro, a pessoa revisora ou agente deve conseguir confirmar que a
fatia aprovada continua pronta para implementação dev/local, sem ampliar escopo nem
executar ações fora da task corrente.

## Pré-condições

- Leia primeiro `.specify/memory/constitution.md`.
- Leia a fundação `specs/001-saas-platform-foundation/` e confirme que o escopo ativo
  desta fatia é dev/local com dados sintéticos. CHK048 permanece `PENDING LEGAL
  REVIEW` apenas como gatilho futuro se produção ou dados reais forem reabertos.
- Não instale dependências, não gere lockfiles, não crie migrations, não suba stack
  do Mr Coti e não faça commit/push durante a revisão desta spec.

## Ordem de leitura

1. `specs/002-mvp-local-first-slice/spec.md`.
2. `research.md`.
3. `data-model.md`.
4. `contracts/openapi.json`.
5. `plan.md`.
6. `tasks.md`.
7. `checklists/requirements.md`.
8. Artefatos base quando houver dúvida: `docs/02-architecture`,
   `docs/06-testing`, `docs/08-security`, `docs/18-governance`,
   `docs/19-operations` e `docs/20-cybersecurity`.

## Verificações estáticas de revisão

```powershell
rg -n "(RF|RNF|RSD)-[0-9]{3}|CS-[0-9]{3}" specs/002-mvp-local-first-slice
python -m json.tool specs/002-mvp-local-first-slice/contracts/openapi.json > $null
rg --files -g "package.json" -g "*.ts" -g "*.tsx" -g "schema.prisma" -g "Dockerfile*" -g "docker-compose*.yml"
```

Resultado esperado:

- IDs existem e são rastreáveis dentro da feature.
- OpenAPI é JSON válido.
- A última busca não deve retornar arquivos criados por esta feature antes de
  aprovação de implementação.

## Jornada de aceite futura

Quando a implementação for autorizada e concluída, validar:

1. Login com `waiter.demo@mrcoti.local` ou usuário sintético equivalente.
2. Contexto retorna tenant, unidade, papéis e permissões.
3. Gestor cria categoria e produto.
4. Atendente abre mesa/comanda e adiciona item.
5. Caixa fecha conta com pagamento fake aprovado.
6. Reenvio com mesma `Idempotency-Key` retorna o mesmo efeito.
7. Reenvio com payload divergente retorna conflito.
8. Usuário de outro tenant ou sem papel recebe negação segura.
9. Logs/auditoria possuem correlação e não expõem segredo/dado real.

## Preflight local antes de subir stack futura

Antes de qualquer Docker Compose do Mr Coti:

1. confirmar se `refresh` e `taskflow` estão ativos;
2. repetir `docker ps` e listeners TCP;
3. confirmar portas candidatas: web `3400`, API `3200`, MySQL `3308`, Redis `6380`,
   Mailpit `1026/8026`, observabilidade `3401/3402/9091`;
4. ajustar variáveis se houver colisão;
5. registrar evidência no review da feature.

## Critério satisfeito para aprovação desta spec

A spec foi aprovada com condições em 2026-07-11. O critério permanece como referência
para revisões futuras e mudanças de escopo:

- checklist desta feature não tiver pendência bloqueante;
- OpenAPI cobrir as rotas planejadas;
- tasks distinguirem aprovação, scaffold, domínio, frontend, testes e gates;
- Docker Desktop/local Docker permanecer como runtime dev/local após aprovação, e AWS
  readiness permanecer como prontidão arquitetural, não como produção ativa;
- não houver promessa de `local-prod`, produção, AWS real provisionada, billing real,
  fiscalidade real, provedores reais ou dados pessoais reais.
