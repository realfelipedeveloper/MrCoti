# Alocação de custo por tenant

## Modelo

`CustoTenant = custos diretos + parcela de custos compartilhados + custo variável de uso`.

| Categoria | Driver de alocação |
| --- | --- |
| API/web compartilhado | requests ponderadas por custo/latência ou compute-seconds |
| workers/filas | jobs e tempo de processamento por tenant/fila |
| MySQL | storage lógico, I/O estimada e consultas pesadas; base compartilhada por tenant ativo |
| Redis | memória/chaves e operações aproximadas por namespace tenant |
| storage/CDN | GB-mês, requests e egress por objeto tenant-aware |
| notificações | tentativas por canal e provider |
| observabilidade | eventos/log bytes/traces atribuíveis, com parcela comum |
| recursos dedicados | 100% ao tenant/contrato correspondente |

## Telemetria

Usage records usam tenant ID técnico, período, métrica, quantidade, unidade e origem; não levam PII. Medição FinOps não é automaticamente faturamento. Diferenças entre estimativa e fatura AWS são reconciliadas mensalmente.

## Indicadores

- custo por tenant ativo e faixa de plano;
- margem de contribuição futura por plano;
- custo por pedido/notificação/GB/milhão de eventos;
- top tenants por custo e custo anômalo;
- custo ocioso por ambiente/módulo;
- custo de observabilidade como percentual da plataforma.

Política de showback/chargeback e uso comercial exigem revisão futura antes de AWS
real, orçamento monetário ou oferta comercial.
