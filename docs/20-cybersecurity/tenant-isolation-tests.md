# Testes de isolamento tenant

## Superfícies obrigatórias

- APIs de leitura e escrita;
- listas, filtros, busca e exports;
- cache keys;
- jobs e filas;
- outbox/inbox;
- storage paths;
- webhooks;
- relatórios;
- restore/backup.

Critério: zero acesso cruzado. Recurso de outro tenant deve retornar negação segura
sem revelar existência.
