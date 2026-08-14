# Planos e versões comerciais

## Modelo

`Plan` é a identidade durável da oferta. `PlanVersion` contém entitlements, limites, moeda/metadados comerciais e vigência. Uma assinatura sempre aponta para uma versão, impedindo alteração retroativa.

## Ciclo

| Estado | Uso permitido |
| --- | --- |
| `DRAFT` | edição interna e simulação; não pode receber assinatura |
| `ACTIVE` | disponível para novas assinaturas/mudanças |
| `GRANDFATHERED` | mantém assinaturas existentes, não aceita novas |
| `RETIRED` | não recebe nem renova assinatura; migração controlada |

Publicar uma versão exige código estável, entitlements completos, unidades de medida, política de excedente, migração/downgrade, owner e aprovação de Produto.

## Conteúdo mínimo de uma versão

- identificação e vigência;
- capacidades incluídas e excluídas;
- limites e período de medição;
- tratamento de excedente por limite;
- módulos premium compatíveis;
- regras de trial, upgrade, downgrade e cancelamento;
- política de suporte e SLO contratual, se aplicável;
- referência à aprovação e aos termos comerciais.

## Planos de trabalho aprovados para baseline demonstrativa

Os planos `Pro`, `Plus` e `Premium` estão aprovados como baseline demonstrativa de
portfólio. Eles validam entitlements, limites, upgrade/downgrade e governança SaaS,
mas não representam proposta comercial final, preço público ou contrato de venda.

Os valores ficam em `docs/13-entitlements/limits-by-plan.md`. Preço, cobrança real e
termos comerciais para produção exigem revisão futura antes de venda/produção.

## Governança

Alterações criam nova `PlanVersion`. Migração em massa exige preview por tenant, comunicação, rollback lógico e eventos idempotentes. Preço e cobrança real permanecem fora do modelo desta etapa.
