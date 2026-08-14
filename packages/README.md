# Packages

Pacotes compartilhados do monorepo Mr Coti.

- `contracts/`: contratos OpenAPI e artefatos derivados para validação/consumo.
- `shared/`: tipos e utilitários compartilhados sem acoplar regras de domínio entre
  módulos.

Pacotes compartilhados não devem virar atalho para burlar fronteiras de bounded
contexts.
