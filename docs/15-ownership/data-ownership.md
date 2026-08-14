# Ownership de dados

| Dado | Sistema/contexto de registro | Pode escrever | Pode ler por contrato | Exportação/eliminação |
| --- | --- | --- | --- | --- |
| tenant/empresa/unidade | Core SaaS | Core SaaS | todos com TenantContext mínimo | owner autorizado; retenção contratual |
| identidade/sessão/papel | Identity & Access | Identity | policies e auditoria | titular/admin conforme segurança |
| plano/assinatura/entitlement | Billing | Billing | Core SaaS, evaluator, reporting agregado | histórico comercial preservado |
| produto/preço/receita | Menu Management | Catalog | Operations/Inventory por snapshot | tenant; histórico vendido imutável |
| mesa/comanda/pedido/conta | Restaurant Operations | Operations | Reporting/Inventory/Integrations por evento | tenant; retenção transacional |
| estoque/fornecedor/compra | Inventory | Inventory | Reporting por projeção | tenant; dados pessoais classificados |
| cobrança fake | Fake Payments | Fake Payments | Operations/Reporting por estado normalizado | sem dado financeiro real |
| nota/artefato fake | Fake Invoices | Fake Invoices | Operations por autorização | marca fake e storage tenant-aware |
| mensagem/tentativa/template | Notifications | Notifications | solicitante por status/log sanitizado | conteúdo com retenção curta |
| webhook/idempotência | Integrations | Integrations | contexto solicitante/auditoria | retenção operacional |
| read model/relatório | Reporting | Reporting | usuário autorizado | reconstruível; expiração explícita |
| audit log | Audit/Core SaaS | serviço de auditoria | perfis autorizados | append-only; anonimização controlada |
| log/métrica/trace | Observability | pipeline de telemetria | Operations/Security | retenção curta, sem PII |

Cache, fila e storage não alteram ownership. Cópia carrega origem, versão, classificação e política de retenção; consumidores não corrigem a fonte diretamente.
