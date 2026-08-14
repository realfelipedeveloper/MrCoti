# Limites por plano — baseline demonstrativa

Os nomes e números abaixo estão aprovados como baseline demonstrativa para portfólio.
Servem para validar tipos, unidades, medição, comportamento, entitlements e
overrides; não representam proposta comercial final, preço público ou contrato de
produção.

| Métrica | Unidade/período | `Pro` | `Plus` | `Premium` | Política inicial |
| --- | --- | ---: | ---: | ---: | --- |
| usuários ativos | quantidade corrente | 10 | 50 | 200 | hard block para novo usuário; adequação no downgrade |
| unidades ativas | quantidade corrente | 1 | 5 | 20 | hard block para nova unidade |
| pedidos | por mês civil do tenant | 5.000 | 30.000 | 150.000 | não interromper pedido; alerta/upgrade |
| notificações | por mês e canal | 5.000 | 50.000 | 500.000 | prioridade transacional e quota por canal |
| integrações instaladas | quantidade corrente | 1 | 5 | 20 | bloquear nova instalação |
| armazenamento | GB lógico | 10 | 100 | 1.000 | bloquear upload; preservar leitura/exportação |

## Regras de medição

- período usa timezone/fechamento configurado e guarda chave canônica;
- uso atual, reservado e confirmado são distintos;
- correção administrativa não reescreve histórico sem evento;
- métricas de custo interno não são automaticamente limites comerciais;
- `unlimited` é valor explícito, nunca ausência de configuração.

Preço, cobrança real e termos comerciais finais devem ser definidos antes de venda,
produção comercial ou billing real.
