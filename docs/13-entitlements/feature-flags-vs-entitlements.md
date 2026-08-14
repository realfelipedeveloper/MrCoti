# Feature Flags versus Entitlements

| Controle | Pergunta | Owner | Exemplos | Falha segura |
| --- | --- | --- | --- | --- |
| Feature Flag | a capacidade técnica está disponível agora? | Produto/Engenharia | rollout de CRM, beta de reservas, kill switch de BI | desabilitar capacidade de risco |
| Entitlement | o tenant tem direito comercial e qual limite? | Produto/Billing | 10 usuários, 5 unidades, módulo CRM | negar nova utilização e explicar upgrade |
| RBAC/Policy | este ator pode executar esta ação neste recurso? | Identity/Security | caixa pode fechar conta na unidade | negar |

## Precedência

Tenant ativo → assinatura ativa → plano vigente → entitlement → override comercial → feature flag técnica → limite/reserva → RBAC/policy. Segurança, suspensão e kill switch podem negar em qualquer estágio; um estágio positivo nunca ignora os seguintes.

## Exemplos

- CRM incluído no plano mas flag global desligada: indisponível.
- CRM em rollout, mas plano sem entitlement: indisponível.
- Tenant com CRM e flag habilitada, usuário sem permissão: indisponível ao usuário.
- Limite de usuários excedido: sessões existentes seguem política; novo convite é negado.

## Anti-padrões proibidos

- usar feature flag como licença permanente sem catálogo comercial;
- esconder botão como única autorização;
- guardar limite em constante de frontend;
- override sem expiração/motivo;
- conceder entitlement por header controlado pelo cliente.

Decisão normativa: ADR-0010.
