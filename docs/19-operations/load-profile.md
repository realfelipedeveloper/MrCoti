# Perfil de carga

Os valores são envelopes propostos para desenho e teste, não promessa comercial.

## Camadas aprovadas

| Camada | Finalidade | Interpretação |
| --- | --- | --- |
| Perfil local demonstrável | provar arquitetura em máquina individual com dados sintéticos | não é promessa de escala comercial |
| Perfil SaaS inicial | orientar desenho e testes de capacidade antes de produção inicial | exige benchmark e ambiente autorizado |
| Perfil SaaS futuro | orientar evolução sem reescrita estrutural | exige orçamento, FinOps e SLO aprovados |

| Dimensão | Baseline documental | Meta MVP | Meta produção | Meta futura |
| --- | ---: | ---: | ---: | ---: |
| tenants ativos | 100 | 100 | 1.000 | 5.000 |
| unidades ativas | 300 | 500 | 5.000 | 25.000 |
| usuários cadastrados/concorrentes | 5.000 / 500 | 10.000 / 1.000 | 100.000 / 10.000 | 500.000 / 50.000 |
| pedidos por dia | 100.000 | 200.000 | 1.000.000 | 10.000.000 |
| eventos por dia | 2.000.000 | 4.000.000 | 20.000.000 | 200.000.000 |
| notificações por dia | 100.000 | 200.000 | 2.000.000 | 20.000.000 |
| pico HTTP | 100 req/s | 200 req/s | 2.000 req/s | 10.000 req/s |

## Modelo de teste

- carga média, pico 5×, burst curto e tenant ruidoso;
- ramp-up, teste sustentado, soak, spike e recuperação;
- mix representativo: leitura de cardápio/mesa, criação de pedido, fechamento, consulta e jobs;
- MySQL/Redis reais efêmeros e providers fake determinísticos;
- medir latência/erro, pool, locks, query, backlog/idade, memória, custo e fairness;
- falhas de Redis/provider/storage e replay de outbox durante carga.

## Critérios

Zero acesso cross-tenant, zero duplicidade de efeito, invariantes financeiras intactas
e SLO atendido sem pool esgotado. Dados de teste são sintéticos. Distribuição por
rota, sazonalidade e envelopes finais exigem validação por benchmark antes de
produção comercial.

O load profile atual fica aprovado como baseline de desenho e demonstração, não como
promessa contratual.
