# API — Mr Coti

Backend futuro da Spec 002.

Responsabilidades iniciais:

- autenticação local sintética;
- tenant context e RBAC;
- catálogo, mesas, comandas, itens e fechamento;
- pagamento fake;
- auditoria, idempotência e outbox local.

Restrições:

- não usar dados reais;
- não integrar provedores reais;
- não criar microsserviços;
- não depender exclusivamente de AWS;
- não acessar dados de outro módulo fora dos contratos permitidos.
