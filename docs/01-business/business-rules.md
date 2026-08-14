# Regras de negócio transversais

| ID | Regra |
| --- | --- |
| BR-001 | nenhuma entidade tenant-aware pode referenciar entidade de outro tenant |
| BR-002 | uma unidade pertence a exatamente uma empresa e um tenant |
| BR-003 | toda mutação operacional requer tenant e unidade ativos, quando aplicável |
| BR-004 | preços usados em pedidos são snapshots e não mudam quando o catálogo é atualizado |
| BR-005 | comandas fechadas não recebem itens; reabertura é transição autorizada e auditada |
| BR-006 | divisão e pagamentos devem reconciliar com o total da conta dentro das regras de arredondamento |
| BR-007 | idempotency key repetida com mesmo payload devolve o resultado original; com payload diferente é conflito |
| BR-008 | efeitos externos não são executados dentro da transação do agregado; usam outbox e adapter |
| BR-009 | feature desabilitada/sem entitlement não pode ser contornada por chamada direta à API |
| BR-010 | downgrade não elimina dados; incompatibilidades viram pendências explícitas |
| BR-011 | toda ação crítica gera evento de auditoria imutável com ator, escopo, motivo e correlação |
| BR-012 | dados pessoais e credenciais não entram em logs, métricas ou traces |
| BR-013 | consentimento registra finalidade, versão, origem e momento; revogação não apaga obrigações legais |
| BR-014 | webhooks recebidos e enviados são autenticados, idempotentes e rastreáveis por tentativa |
