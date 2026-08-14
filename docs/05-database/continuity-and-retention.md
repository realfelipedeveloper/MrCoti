# Continuidade, backup e retenção

Os runbooks e objetivos progressivos canônicos estão em [`../16-disaster-recovery/`](../16-disaster-recovery/disaster-recovery-strategy.md); prazos por categoria e Legal Review ficam em [`../18-governance/data-retention-policy.md`](../18-governance/data-retention-policy.md).

## Classes

| Classe | Exemplos | Direção inicial |
| --- | --- | --- |
| transacional crítica | pedidos, pagamentos, caixa, assinatura | backup contínuo/PITR; retenção legal/contratual |
| operacional | catálogo, mesas, estoque | snapshots + binlog; restauração por ambiente |
| auditoria | ações críticas e segurança | imutabilidade lógica e retenção estendida |
| integração | outbox, tentativas, webhooks | retenção suficiente para replay/reconciliação |
| observabilidade | logs, métricas, traces | janelas curtas por custo/privacidade, agregação histórica |
| pessoal | clientes, consentimentos | minimização, exportação, anonimização/eliminação governada |

Prazos numéricos serão aprovados com jurídico/negócio antes da produção.

## Recuperação

RPO e RTO são definidos por ambiente/classe. Backups são criptografados, segregados e têm acesso mínimo. Um backup só é considerado válido após teste de restauração. Exercícios registram duração, integridade, dependências e ações corretivas.

## Exportação e eliminação

Exportações são assíncronas, autorizadas, auditadas, criptografadas e expiram. Cancelamento de tenant inicia workflow com legal hold, janela de recuperação, anonimização/eliminação e certificado de conclusão. Excluir tenant não significa apagar auditoria necessária; dados retidos são minimizados e segregados.
