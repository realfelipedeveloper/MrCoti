# Mapa de contextos do Mr Coti

O mapa organiza o domínio do **Mr Coti** em bounded contexts dentro do mesmo monólito modular. A separação é lógica e de ownership; não implica processos ou bancos independentes.

## Bounded contexts

| Contexto | Responsabilidade e conceitos principais | Não é responsável por |
|---|---|---|
| **Core SaaS** | Tenant, empresa, unidade, estado, feature flags técnicas, provisionamento, suspensão e cancelamento | Autenticação, regras comerciais e operação do restaurante |
| **Billing** | PlanVersion, assinatura, trial, mudança de plano, entitlements, limites, overage e histórico comercial futuro | Cobrança/pagamento real e operação do restaurante |
| **Identidade e Acesso** | Usuário, credencial, sessão, cargo, permissão, RBAC, contexto autenticado e vínculo com tenant/unidade | Planos comerciais e regras de pedidos |
| **Cardápio** | Categoria, produto, adicional, combo, variação, preço, disponibilidade, horário, imagem e ficha técnica | Saldo de estoque e venda realizada |
| **Operação e Pedidos** | Mesa, comanda, pedido, item, taxa de serviço, divisão e fechamento de conta, cancelamento e reabertura | Captura financeira pelo provedor e emissão fiscal |
| **Estoque e Compras** | Ingrediente, insumo, movimentação, estoque mínimo, fornecedor, compra e baixa automática | Definição comercial do produto |
| **Financeiro e Caixa** | Caixa, abertura, fechamento, sangria, suprimento, forma de pagamento, recebimento e recibo | Autorização externa de pagamento |
| **Clientes e CRM** | Cliente, histórico, preferência, consentimento LGPD, aniversário e fidelidade futura | Identidade de usuário administrativo |
| **Reservas** | Reserva, confirmação, cancelamento, no-show e vínculo com mesa | Ciclo de vida da comanda |
| **Relatórios** | Projeções de vendas, ticket médio, produtos, categorias, estoque crítico e fluxo de caixa | Escrita dos agregados operacionais de origem |
| **Integrações** | Orquestração, portas, adaptadores, idempotência, webhooks e estado de interações com pagamentos, notas e notificações | Regras centrais dos contextos consumidores |
| **Auditoria** | Trilha imutável de ações críticas, ator, tenant, alvo, instante e metadados seguros | Logs técnicos e observabilidade de infraestrutura |

As APIs fictícias são módulos/adaptadores do monólito. Elas não são microsserviços e não autorizam dependências diretas do domínio em detalhes de transporte.

## Relações entre contextos

| Upstream | Downstream | Contrato | Padrão de relação |
|---|---|---|---|
| Core SaaS | Todos os contextos tenant-aware | Contexto de tenant, status, plano, limites e features | Conformist com política anticorrupção local |
| Billing | Core SaaS e contextos com consumo | Plano/assinatura vigente, entitlement, limite e eventos comerciais | Serviço de aplicação + eventos; sem leitura de tabela |
| Identidade e Acesso | APIs e aplicações | Identidade, tenant ativo, papéis e permissões | Serviço de aplicação publicado |
| Cardápio | Operação e Pedidos | Snapshot vendável de produto, preço e adicionais | Customer/Supplier; pedido preserva snapshot histórico |
| Operação e Pedidos | Estoque e Compras | Eventos de item confirmado/cancelado | Eventos internos; consumidor idempotente |
| Operação e Pedidos | Financeiro e Caixa | Total a receber e eventos de fechamento | Contrato de aplicação e eventos internos |
| Financeiro e Caixa | Integrações | Solicitação e resultado de cobrança | Porta de pagamento; adaptador fake inicial |
| Operação/Financeiro | Integrações | Solicitação e resultado de emissão fictícia | Porta fiscal; adaptador fake inicial |
| Contextos de negócio | Integrações | Intenção de notificação | Porta de notificação e fila BullMQ |
| Contextos de negócio | Auditoria | Evento de ação crítica | Evento interno/outbox quando durabilidade for necessária |
| Contextos operacionais | Relatórios | Eventos e projeções de leitura | Published Language interno, assíncrono |
| Clientes e CRM | Reservas | Identificação e preferências permitidas do cliente | Open Host Service interno com mínimo de dados |

## Linguagem e ownership

- **Tenant** é a fronteira comercial e de isolamento SaaS. Empresa e unidade pertencem a um tenant.
- **Usuário** é uma identidade de acesso; **cliente** é a pessoa atendida pela operação. Os termos não são intercambiáveis.
- **Produto** pertence ao Cardápio; o **item do pedido** contém um snapshot dos dados necessários para preservar o histórico.
- **Cobrança** é a interação com a API de pagamento; **recebimento** é o fato financeiro interno.
- **Emissão fictícia** simula o ciclo fiscal e nunca representa validade fiscal real.
- Cada entidade tenant-aware possui um único contexto proprietário. Outros contextos usam identificadores, snapshots mínimos ou eventos, não escrita direta.

## Regras de dependência

1. Dependências síncronas seguem contratos de aplicação publicados e têm timeout explícito quando atravessam adaptadores externos.
2. Eventos são fatos no passado; comandos não são disfarçados como eventos.
3. Um contexto não compartilha entidades de domínio ou repositórios com outro contexto.
4. Transações abrangem um agregado e, quando necessário, alterações coordenadas no mesmo módulo. Efeitos entre módulos usam eventos/outbox.
5. Relatórios não devem impor modelos de leitura aos contextos transacionais.

Consulte a visão gráfica em [bounded-contexts.puml](../03-uml/bounded-contexts.puml).
