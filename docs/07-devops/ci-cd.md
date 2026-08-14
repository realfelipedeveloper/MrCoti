# Estratégia de CI/CD do Mr Coti

## Objetivo

O pipeline deve transformar um commit revisado em artefato imutável, comprovado e rastreável. A promoção usa o mesmo digest; recompilar por ambiente é proibido porque quebra a equivalência entre o que foi testado e o que foi entregue.

## Eventos de execução

- **Pull request:** validações rápidas e completas necessárias à revisão, sem deploy de produção.
- **Atualização da branch principal:** suíte completa, build, geração de SBOM e publicação em registry autorizado após aprovação da política.
- **Tag ou release candidate:** validações de release e promoção para ambientes não produtivos.
- **Promoção manual controlada:** staging e produção com gates, segregação de função e registro de aprovador.
- **Agenda:** testes ampliados, auditorias, verificação de drift e cenários de maior duração.
- **Operação manual excepcional:** somente com justificativa, autorização, escopo e trilha de auditoria.

## Estágios planejados

| Ordem | Estágio | Evidência mínima | Condição de falha |
|---|---|---|---|
| 1 | install | lockfile íntegro e dependências restauradas | lockfile divergente ou fonte não confiável |
| 2 | lint | relatório ESLint | erro de lint |
| 3 | format check | relatório Prettier | arquivo fora do padrão |
| 4 | typecheck | compilação estática dos workspaces | erro de tipo |
| 5 | unit tests | resultado Jest e cobertura | falha, flakiness ou limiar crítico |
| 6 | integration tests | resultado Jest com MySQL/Redis efêmeros | falha de integração, schema ou isolamento |
| 7 | API/contract tests | Supertest e validação OpenAPI/webhooks | incompatibilidade ou comportamento divergente |
| 8 | component/page/accessibility | relatórios do frontend | regressão funcional ou acessível bloqueante |
| 9 | E2E tests | relatório Playwright e evidência de falhas | jornada crítica falha |
| 10 | build | bundles reproduzíveis | build incompleto ou warning classificado como bloqueante |
| 11 | security scan | SAST, secret scan e verificações de configuração | achado acima da política sem exceção válida |
| 12 | dependency audit | vulnerabilidades, licenças e SBOM das dependências | componente proibido ou vulnerável acima da política |
| 13 | Docker build | digest, labels e scan da imagem | imagem não reproduzível, vulnerável ou sem provenance |
| 14 | migration check | validação em banco efêmero e análise de compatibilidade | migration destrutiva não aprovada ou rollback/roll-forward indefinido |
| 15 | quality gate | consolidação das evidências | qualquer gate obrigatório reprovado |

Etapas independentes podem rodar em paralelo depois de `install`. O quality gate consolida todos os resultados; paralelismo não permite ignorar falha.

## Reprodutibilidade e supply chain

- Node.js LTS e package manager têm versões fixadas de modo central.
- Instalação respeita lockfile sem atualização implícita.
- Actions de terceiros são fixadas por versão imutável ou commit e passam por revisão.
- Permissões do token do workflow começam em somente leitura e são elevadas apenas no job necessário.
- Build registra commit, data, versão, digest e origem, sem inserir segredo na camada da imagem.
- SBOM e attestations acompanham o artefato conforme a política aprovada.
- Caches são separados por SO, runtime e hash do lockfile; nunca armazenam secrets.
- Dependabot ou solução equivalente pode ser planejado, mas a adoção deve respeitar as decisões de ferramenta do projeto.

## Estratégia de branches e mudanças

Pull requests devem ser pequenos, vinculados a uma spec/tarefa e usar Conventional Commits. Commitlint valida mensagens; Husky e lint-staged aceleram feedback local, mas o CI repete as verificações e é a autoridade. Proteções exigem revisão, conversas resolvidas, branch atualizada e gates obrigatórios.

Alterações de contrato, segurança, tenancy, migrations ou pipeline exigem revisão do agente especialista correspondente. Autoria e aprovação final não devem ficar com a mesma identidade em mudanças de alto risco.

## Migrações

O pipeline futuro valida migrations contra MySQL efêmero criado do zero e, quando houver baseline segura, contra cópia sanitizada do schema anterior. A estratégia preferencial é expandir/migrar/contrair:

1. adicionar estrutura compatível;
2. publicar aplicação capaz de conviver com versões antiga e nova;
3. migrar ou preencher dados de forma observável e retomável;
4. verificar uso e integridade;
5. remover estrutura antiga em release posterior.

Rollback de aplicação não pressupõe reversão automática de dado. Cada mudança registra estratégia de roll-forward, backup e restauração. DDL destrutivo ou potencialmente bloqueante exige aprovação explícita do Database, DevOps e Security Agents.

## Artefatos e evidências

O pipeline preserva pelo prazo definido em política:

- relatórios de teste e cobertura;
- resultados de acessibilidade e segurança;
- logs sanitizados de jobs com falha;
- OpenAPI validado;
- SBOM e scan de imagem;
- digest da imagem e metadados do build;
- resultado de migration check;
- decisão do quality gate e aprovações de promoção.

Artefatos não podem conter tokens, `.env`, dumps, PII, payloads sensíveis ou chaves privadas.

## Promoção

O fluxo planejado é `development` → `homologation` → `staging` → `production`. Promoção referencia digest já construído, aplica configuração do ambiente e executa smoke tests. Produção requer:

- quality gate aprovado;
- release notes e impacto conhecidos;
- migration e compatibilidade revisadas;
- observabilidade e alertas prontos;
- plano de rollback/roll-forward;
- aprovador autorizado e janela compatível com o risco.

Feature flags permitem rollout gradual, canário por tenant/plano e desligamento emergencial, mas não substituem compatibilidade, teste ou autorização.

## Deploy e rollback planejados

O mecanismo futuro deve suportar rolling update ou estratégia equivalente, readiness antes de tráfego e drenagem segura de requisições/jobs. Smoke tests verificam saúde, autenticação, acesso tenant-aware e jornada mínima sem criar efeitos indevidos.

Rollback pode repromover o digest anterior apenas quando schema e contratos permanecem compatíveis. Caso contrário, o runbook usa roll-forward. A decisão observa error budget, segurança, integridade de dados e impacto aos tenants.

## Segurança de ambientes

Cada ambiente usa identidade e secret store próprios. Jobs de pull request de origem não confiável não recebem secrets nem permissões de publicação. OIDC de curta duração é preferível a credenciais cloud estáticas quando a integração AWS for implementada. A política exata depende de ADR e aprovação de segurança.

## Gates e exceções

Gates bloqueantes não podem ser convertidos em warning para concluir uma entrega. Uma exceção temporária exige risco descrito, proprietário, compensação, prazo de expiração e aprovação dos responsáveis de qualidade/segurança conforme o tema. Expiração reabre o bloqueio automaticamente.

## Métricas do fluxo

DevOps acompanhará lead time, frequência de deploy, taxa de falha de mudança, tempo de restauração, duração/fila do pipeline, flakiness e causas de rejeição. Métricas são usadas para melhorar o sistema, não para avaliar individualmente pessoas.
