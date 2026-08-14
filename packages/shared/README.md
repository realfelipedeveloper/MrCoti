# Shared — Mr Coti

Pacote reservado para tipos e utilitários compartilhados.

Regras:

- não conter regra crítica de domínio que pertença a um bounded context;
- não expor dados sensíveis;
- não criar dependência circular entre apps/pacotes;
- não substituir contratos internos explícitos entre módulos.
