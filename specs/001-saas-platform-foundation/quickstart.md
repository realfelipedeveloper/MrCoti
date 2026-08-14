# Quickstart de revisão — Fundação da plataforma SaaS

**Produto:** Mr Coti  
**Feature:** `001-saas-platform-foundation`  
**Finalidade:** revisar e aprovar a primeira etapa documental; não executar aplicação

## Resultado esperado

Ao final deste roteiro, uma pessoa revisora deve conseguir:

1. explicar o escopo e as exclusões do Mr Coti;
2. rastrear uma história até requisitos canônicos `RF-###`, `RNF-###` e `RSD-###`;
3. verificar tenancy, limites, flags, segurança, contratos e operação;
4. identificar decisão registrada, condição pendente, responsável e gate afetado;
5. emitir parecer de aprovação ou rejeição sem instalar ou executar código.

## Pré-condições

- Acesso somente de leitura é suficiente.
- Não instale dependências, não execute migrations e não suba containers.
- Não crie aplicações NestJS/Next.js nem configure deploy.
- Considere `.specify/memory/constitution.md` a norma superior e `spec.md` a fonte
  canônica dos requisitos desta feature.
- Toda referência ao produto deve usar exatamente **Mr Coti**.

## 1. Leia na ordem de decisão

1. `.specify/memory/constitution.md`: princípios e gates.
2. `specs/001-saas-platform-foundation/spec.md`: histórias, requisitos e critérios.
3. `specs/001-saas-platform-foundation/research.md`: alternativas e decisões.
4. `specs/001-saas-platform-foundation/data-model.md`: ownership e invariantes.
5. `specs/001-saas-platform-foundation/plan.md`: como os artefatos e gates se
   conectam.
6. Contrato OpenAPI das três APIs, UML e ADRs 0001–0018.
7. `docs/12-billing` a `docs/20-cybersecurity`: políticas complementares, decisões
   e pendências.
8. `docs/18-governance/governance-roles.md` e
   `docs/18-governance/approval-record.md` e
   `docs/18-governance/filtered-decisions-2026-06-26.md`: papéis de governança,
   aprovações humanas e impactos.
9. `specs/001-saas-platform-foundation/tasks.md`: estado e dependências.
10. `specs/001-saas-platform-foundation/checklists/requirements.md`: parecer final.

Quando um artefato contradizer a constituição ou a spec, não escolha silenciosamente
um lado: registre a inconsistência e rejeite o gate afetado.

## 2. Faça verificações estáticas rápidas

Os comandos abaixo apenas leem arquivos e não são requisito de ferramenta. Em
PowerShell, a partir da raiz do repositório:

```powershell
# Confirmar que os artefatos Spec Kit esperados existem
Get-ChildItem .specify,specs/001-saas-platform-foundation -Recurse

# Encontrar IDs canônicos e referências
rg -n "(RF|RNF|RSD)-[0-9]{3}" .specify specs docs

# Confirmar complemento e ADRs adicionais
Get-ChildItem docs/12-billing,docs/13-entitlements,docs/14-events,docs/15-ownership,docs/16-disaster-recovery,docs/17-finops,docs/18-governance,docs/19-operations,docs/20-cybersecurity
Get-ChildItem docs/11-adr/ADR-00*.md

# Encontrar termos proibidos ou identidade inconsistente para revisão manual
rg -n -i "microsservi|single.company|pagamento real|fiscal real" .specify specs docs

# Conferir que nenhum scaffold de aplicação foi introduzido nesta etapa
rg --files -g "package.json" -g "*.ts" -g "schema.prisma" -g "Dockerfile*"
```

Resultados esperados:

- todos os IDs referenciados existem na `spec.md` e usam o mesmo prefixo/número;
- menções a microsserviços ou operações reais aparecem apenas como alternativa
  rejeitada, proibição ou escopo futuro;
- a última busca não retorna código/scaffolding produzido pela primeira etapa;
- portas não estão fixadas sem validação e há alerta sobre `refresh` e `tasks`.

## 3. Percorra as jornadas de aceite

### Jornada A — Tenant e plano

1. Localize RF-001–011, RF-012–015 e RSD-001–003.
2. No modelo, siga `Tenant → Subscription → PlanVersion → PlanEntitlement`.
3. Confirme que empresa, unidade, membership, role, cache, jobs e auditoria preservam
   tenant.
4. Simule provisionamento, suspensão, cancelamento, upgrade e downgrade acima do
   limite.
5. Rejeite se houver perda silenciosa, autoridade de tenant vinda do payload ou
   consulta sem escopo.

### Jornada B — Comanda até fechamento

1. Localize RF-016–023 e a história US-03.
2. Siga mesa → comanda → pedido → item snapshot → conta → divisão → alocação de
   pagamento.
3. Confirme invariantes monetárias, motivos de cancelamento/reabertura, autoria,
   auditoria e eventos.
4. Verifique que mudanças de cardápio não alteram vendas passadas.

### Jornada C — Integrações fictícias

1. Localize RF-024–036, RNF-006–008 e RSD-014.
2. Nos contratos, verifique todos os endpoints, estados, erros e exemplos.
3. Simule duplicidade, payload divergente com mesma chave, timeout ambíguo, webhook
   repetido/fora de ordem e falha definitiva.
4. Confirme que pagamento e nota são inequivocamente fictícios e que XML/PDF não têm
   validade fiscal.

### Jornada D — Feature flag

1. Localize RF-012–015.
2. Avalie bloqueio de ambiente, direito do plano, override do tenant e rollout.
3. Confirme fallback seguro, auditoria, owner, revisão e remoção.
4. Garanta que uma flag jamais substitui permission RBAC.

### Jornada E — Falha e recuperação

1. Localize RNF-004–014 e RSD-006–013.
2. Siga uma requisição por banco/outbox/fila/provider usando request-id e
   correlation-id.
3. Verifique retry finito, deduplicação, destino de falha, alerta e consulta de estado
   ambíguo.
4. Confirme metas de capacidade, RPO/RTO, backup/restore e ausência de dado sensível
   em telemetria.

### Jornada F — Billing, entitlement e mudança de plano

1. Localize RF-043–047 e ADR-0009/0010.
2. Percorra trial → active → past due → suspended/cancelled e reativação.
3. Simule upgrade imediato, downgrade futuro e excedentes de cada dimensão.
4. Confirme que dados não são apagados e flag/RBAC não substituem entitlement.
5. Verifique que valores comerciais, cobrança real, prorrata/crédito real e venda
   continuam fora da aprovação local e exigem revisão futura.

### Jornada G — Eventos, ownership, DR, FinOps e operação

1. Amostre cada grupo do catálogo e confira owner, payload, versão, idempotência,
   criticidade, outbox e dados proibidos.
2. Confirme que somente o owner escreve seus dados e dependências proibidas estão claras.
3. Execute tabletop do runbook: MySQL, Redis, storage e região, medindo RPO/RTO.
4. Compare SLO/load com orçamento/FinOps e verifique que custo não reduz segurança.
5. Repita o inventário de portas com `refresh`/`tasks` ativos antes de configurar stack.

## 4. Aplique o Constitution Check

Para cada princípio I–IX, registre:

- artefato e seção que o atende;
- requisito canônico associado;
- evidência futura ou checklist;
- pendência, risco, responsável e prazo;
- resultado `PASSA`, `PENDENTE` ou `FALHA`.

`FALHA` bloqueia. `PENDENTE` bloqueia quando afeta tenant, segurança, integridade,
contrato público ou decisão estrutural. Exceção exige ADR aprovado; comentário em
task não é suficiente.

## 5. Verifique contratos e modelos

- Todo status do OpenAPI deve existir nas máquinas de estado do `data-model.md`.
- Campos tenant-aware não devem permitir selecionar outro tenant.
- Erros não revelam existência de recurso alheio, stack ou secret.
- Todo comando mutável sujeito a retry define idempotência.
- Todo webhook define versão, ID, timestamp, autenticação/replay e redelivery.
- Toda relação entre contextos usa contrato/evento, não tabela alheia.
- Toda entidade operacional possui `tenant_id` ou justificativa explícita de escopo
  global.

## 6. Revise rastreabilidade

Use a tabela da spec e as tarefas para amostrar ao menos um requisito de cada grupo:

| Grupo | Pergunta de revisão |
|---|---|
| RF-001–015 | O core SaaS e as flags possuem modelo, decisão e cenário? |
| RF-016–023 | O fluxo operacional possui invariantes e evidência planejada? |
| RF-024–036 | O requisito aparece no contrato e na matriz de falhas? |
| RF-037–042 | A fase, o contexto e a flag futura estão explícitos? |
| RNF-001–014 | A meta é mensurável e existe estratégia de verificação? |
| RSD-001–014 | O controle possui ameaça, owner e teste/inspeção planejado? |
| RF-043–049 | Billing, entitlement, evento e ownership possuem decisão/owner/gate? |
| RNF-015–019 | DR, FinOps, SLO, portas e aprovação possuem baseline/evidência? |
| RSD-015–016 | RBAC e LGPD possuem matriz, Legal Review e negações explícitas? |

IDs inexistentes, órfãos ou renumerados são falha. Novos requisitos devem entrar
primeiro em `spec.md` e só então ser propagados.

## 7. Registre a decisão

Atualize `checklists/requirements.md` com evidências. A aprovação requer:

- CS-001–008 atendidos nesta etapa;
- zero pendência crítica da fundação documental;
- ADRs 0001–0018 com decisão e consequências;
- OpenAPI válido e coerente com modelo/UML;
- requisitos ligados a tasks documentais e evidências futuras;
- confirmação de que nenhuma ação de implementação foi executada.
- approval record com decisões dos papéis Founder, Product Owner, Software Architect,
  Security Officer, Data Governance, DevOps Lead, QA Lead e FinOps; o mesmo
  responsável pode exercer múltiplos papéis, mas cada decisão deve ser registrada
  separadamente; CHK048 continua bloqueando produção/dados reais e nunca deve ser
  tratado como aprovação por silêncio. CHK038 foi satisfeito para a fundação, mas o
  preflight de portas deve ser repetido antes de subir a futura stack local.

Registre o parecer com data, responsável e papel exercido. Não marque tarefas
pertencentes a outro artefato como concluídas por mera presença: confira conteúdo e
consistência.

## Próximo passo permitido

Com o gate documental aprovado, o próximo passo é abrir/revisar uma especificação
para o primeiro incremento vertical do MVP e gerar novo plano e tasks de
implementação. Este quickstart não autoriza código automaticamente.
