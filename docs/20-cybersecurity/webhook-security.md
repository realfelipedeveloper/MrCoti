# Segurança de webhooks

Webhooks devem possuir:

- evento com ID único e versão;
- timestamp;
- assinatura/verificação;
- janela contra replay;
- schema versionado;
- deduplicação por consumidor;
- redelivery finito;
- logs sanitizados;
- estado consultável.

Eventos duplicados ou fora de ordem não podem regredir estado nem repetir efeito.
