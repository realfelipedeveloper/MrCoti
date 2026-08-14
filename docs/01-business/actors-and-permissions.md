# Atores, escopos e permissões

## Atores iniciais

| Ator | Escopo típico | Responsabilidades |
| --- | --- | --- |
| Platform Admin | plataforma | suporte controlado, catálogo de planos, flags globais; acesso a tenant exige justificativa/auditoria |
| Tenant Owner | tenant | assinatura, empresas, administradores e exportação |
| Company Admin | empresa | unidades e políticas da empresa |
| Unit Manager | unidade | operação, equipe e relatórios locais |
| Waiter | unidade | mesas, comandas e pedidos |
| Cashier | unidade | caixa, fechamento e pagamentos |
| Kitchen Operator | unidade | visualizar/preparar itens autorizados |
| Inventory Operator | unidade/empresa | estoque, compras e fornecedores |
| Finance Analyst | tenant/empresa | caixa, relatórios e conciliação |
| Auditor/Support | escopo temporário | leitura específica, com motivo e expiração |

## Modelo de autorização

RBAC fornece o conjunto base de ações; policies avaliam tenant ativo, vínculo, unidade, propriedade do recurso, feature/entitlement e estado do agregado. Toda decisão é server-side. O contexto de tenant nunca é aceito apenas do payload: deriva da sessão/host e é confrontado com o recurso.

Permissões usam a forma `context.resource.action`, por exemplo `operation.order.cancel`. Atribuições possuem escopo (`tenant`, `company`, `unit`), vigência e autor. Funções de plataforma e de tenant são separadas.

## Ações críticas

Cancelamento/reabertura de comanda, estorno, sangria, suprimento, alteração de plano, impersonation de suporte, exportação e mudança de permissão exigem permissão específica, motivo e auditoria antes/depois. Step-up authentication poderá ser exigida por policy.
