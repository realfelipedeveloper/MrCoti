# Gates de segurança no CI

Quando houver implementação, o CI deve bloquear:

- falha de lint/typecheck/build;
- teste de autorização/tenant isolation quebrado;
- vulnerabilidade crítica sem exceção formal;
- secret detectado;
- imagem Docker vulnerável crítica;
- OpenAPI incompatível;
- migration insegura ou sem rollback/roll-forward aprovado.

Exceções são temporárias, com owner, justificativa, compensação e expiração.
