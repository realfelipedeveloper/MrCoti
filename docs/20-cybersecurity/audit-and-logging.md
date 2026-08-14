# Auditoria e logging seguro

## Auditoria crítica inicial

- login e falha de login;
- criação/alteração de usuário;
- mudança de papel;
- criação/suspensão de tenant;
- abertura/fechamento de comanda;
- cancelamento de pedido;
- fechamento de conta;
- operação fake de pagamento;
- operação fake de nota;
- envio/retry/falha de notificação.

## Proibições em logs

Senha, token, segredo, documento completo, dados pessoais desnecessários, corpo
integral de mensagem e payload financeiro sensível.

No MVP local, auditoria começa no banco. Exportação para stack externa de
observabilidade fica futura.
