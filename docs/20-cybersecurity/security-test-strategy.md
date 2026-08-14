# Estratégia de testes de segurança

## MVP local

- testes positivos/negativos de autenticação;
- testes de RBAC/policy para toda rota sensível;
- testes de isolamento tenant em leitura, escrita, cache, fila e storage quando
  aplicável;
- validação de payload inválido;
- rate limit em login, APIs fake, webhooks e notificações;
- idempotência e replay de webhook;
- verificação de logs sem secrets/PII desnecessária.

## Produção futura

Adicionar DAST, pentest externo, revisão de configuração cloud, exercícios de
resposta a incidente e validação de supply chain.
