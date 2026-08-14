# Plano de implementação: [NOME]

**Produto:** Mr Coti  
**Branch:** `[NNN-nome]`  
**Especificação:** `[caminho/spec.md]`  
**Estado:** Planejado

## Resumo

[Resultado técnico e abordagem em duas ou três frases.]

## Contexto técnico

| Dimensão | Decisão ou restrição |
|---|---|
| Arquitetura | [decisão] |
| Tenancy | [estratégia e isolamento] |
| Dados | [persistência e ownership] |
| Comercial | [Billing, entitlements, flags e políticas de plano] |
| API | [contratos e versionamento] |
| Qualidade | [testes e gates] |
| Operação | [telemetria e recuperação] |
| Custo | [FinOps, drivers, budgets e alertas] |

## Constitution Check

| Princípio | Estado | Evidência ou ação |
|---|---|---|
| I. Especificação | PASSA/PENDENTE/FALHA | [referência] |

Uma FALHA não justificada bloqueia o avanço. Exceções exigem ADR.

## Estrutura de artefatos

```text
specs/[NNN-nome]/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── checklists/
└── tasks.md
```

## Desenho da solução

### Limites de domínio

[Bounded contexts, ownership e dependências permitidas.]

### Fluxos e contratos

[Fluxos síncronos, eventos, idempotência e falhas.]

### Dados, segurança e privacidade

[Invariantes, tenant, autorização, auditoria, retenção e LGPD.]

### Qualidade e observabilidade

[Matriz de testes, SLOs, logs, métricas, traces e alertas.]

## Fases e gates

1. [Fase]: [entregáveis, dependências e condição de saída].

## Riscos

| Risco | Probabilidade/impacto | Mitigação | Evidência de encerramento |
|---|---|---|---|
| [risco] | [nível] | [ação] | [evidência] |
