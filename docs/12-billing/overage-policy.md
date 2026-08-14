# Política de excedentes

**Estado:** baseline demonstrativa aprovada com condições; cobrança real permanece
fora do MVP local.

## Princípios

- nunca apagar dados para adequar um tenant;
- não interromper pedido/fechamento já iniciado;
- diferenciar criação de novo recurso, uso operacional crítico e consumo assíncrono;
- avisar em 80%/100% como baseline configurável;
- registrar decisão, consumo, limite, período e override;
- cobrança por excedente não será implementada inicialmente; o MVP local registra o
  excedente, bloqueia novas ações quando aplicável e recomenda upgrade;
- cobrança por excedente só existe após Billing real, contrato e ADR próprios.

## Baseline por dimensão

| Dimensão | Ao atingir limite | Excedente por downgrade | Direção comercial proposta |
| --- | --- | --- | --- |
| usuários ativos | bloquear novo convite/reativação; manter leitura | manter usuários, bloquear crescimento e abrir adequação | exigir upgrade ou desativação assistida; tolerância proposta de 30 dias |
| unidades | bloquear criação/reativação adicional | preservar dados; unidades excedentes entram em adequação, sem deleção | exigir upgrade; eventual read-only somente após decisão de Produto |
| pedidos/mês | nunca abortar pedido em andamento; alertar e medir | não aplicável a dado histórico | permitir faixa de tolerância e exigir upgrade no ciclo seguinte; cobrança futura fora do MVP |
| integrações | bloquear nova instalação; aplicar quota/rate limit a novas chamadas | preservar configurações e reconciliação/webhooks críticos | exigir upgrade ou desativação escolhida pelo owner |
| armazenamento | bloquear novo upload ao atingir teto, preservar download/exportação | não apagar objetos | tolerância temporal para exportar/limpar ou fazer upgrade |
| notificações | reservar transacionais críticas; bloquear/adiar não críticas | manter histórico | upgrade ou pacote adicional; cobrança futura por canal fica fora do MVP |

## Exceções

Override comercial tem limite/valor, início/fim, motivo, aprovador e auditoria. Nunca contorna isolamento, segurança ou kill switch. Falha do medidor não concede cota infinita: o comportamento fail-safe é definido por criticidade.

## Pendências humanas

Percentuais, dias de tolerância e classificação de mensagem crítica estão aprovados
como baseline demonstrativa. Eventual preço e cobrança real permanecem decisão futura
antes de venda/produção.
