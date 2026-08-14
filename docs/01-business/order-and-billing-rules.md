# Operação, snapshots e conciliação

## Ciclo principal

Uma mesa pode ter atendimento aberto segundo política da unidade. A comanda é o agregado de consumo; pedidos confirmados registram itens como snapshots. Fechamento congela a base de cálculo da conta. Reabertura é uma nova transição, nunca a remoção do fechamento anterior.

## Snapshot obrigatório do item

O item vendido preserva produto/variação, descrição exibida, quantidade, preço unitário, adicionais, descontos alocados, taxas simuladas quando houver, versão da ficha técnica aplicável e autor/instante. Alterar ou desativar o produto não reinterpreta pedido histórico.

## Invariantes monetárias

- Valores usam decimal/moeda definidos; nunca ponto flutuante binário.
- `subtotal = soma(quantidade × preço + adicionais − descontos de item)`.
- `total = subtotal − descontos da conta + taxa de serviço + ajustes permitidos`.
- Toda divisão aloca exatamente o total; a soma das parcelas, inclusive resíduo, é igual à conta.
- Resíduo de arredondamento é atribuído por regra determinística e mostrado; nunca desaparece.
- Pagamentos confirmados + saldo pendente = total. Captura/estorno parcial atualiza alocações, não o valor histórico.
- Taxa de serviço registra base, percentual/valor e política; redução exige permissão conforme unidade.

## Exceções e concorrência

Cancelamento registra estado anterior, valor revertido, motivo, ator e compensação. Comanda fechada rejeita novos itens. Reabertura exige permissão, motivo e nova versão; pagamento/nota já processados criam pendências explícitas de reconciliação.

Comandos carregam versão esperada. Fechamento concorrente com inclusão falha com conflito. Idempotency key impede duplicar pedido, fechamento ou alocação repetida.

## Evidências futuras

Testes cobrem centavos residuais, taxa parcial, descontos, múltiplas formas, captura/estorno parcial, reabertura autorizada/negada, alteração posterior do catálogo e concorrência. A soma deve ser exata em todos os cenários.
