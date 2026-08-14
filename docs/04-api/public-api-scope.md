# Escopo das APIs públicas

## Pagamentos fictícios

Criar, consultar, autorizar, capturar, cancelar e estornar cobranças. Cenários determinísticos `success`, `failure`, `timeout`, `fraud` e `chargeback` existem somente para teste. Nenhum dinheiro real é movimentado.

## Emissão fictícia de notas

Emitir, consultar e cancelar documento, além de baixar XML/PDF fake. Simulações: `authorized`, `rejected` e `unavailable`. Artefatos são claramente marcados sem valor fiscal.

## Notificações

Enviar e consultar e-mail, SMS e WhatsApp fake, com status, tentativas e logs sanitizados. O contrato não promete entrega a redes reais.

## Webhooks

Cadastro de endpoints e callbacks de mudança de estado. Assinatura, timestamp, event ID e retry são obrigatórios. O consumidor responde rapidamente e processa de forma idempotente.

## Não exposto publicamente nesta fase

Mesas, comandas, pedidos, cardápio, estoque, caixa, clientes, reservas e relatórios. Essas APIs serão especificadas por features futuras antes de implementação/exposição.
