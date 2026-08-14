# Política de retenção de dados

Todos os prazos são baseline aprovado com condições e permanecem sujeitos a
`PENDING LEGAL REVIEW` antes de produção ou tratamento real de dados pessoais. Legal
hold suspende eliminação somente para o conjunto e período justificados.

| Categoria | Finalidade | Base legal sugerida | Retenção sugerida | Anonimização | Exportação/exclusão | Acesso e auditoria |
| --- | --- | --- | --- | --- | --- | --- |
| tenant/contrato | operar relação SaaS e suporte | execução de contrato; obrigação legal; direitos | vigência + 5 anos | remover contatos/identificadores não necessários | owner exporta; elimina após retenção/hold | Platform/Billing restritos; toda mudança auditada |
| usuário administrativo | autenticar, autorizar e auditar | contrato/legítimo interesse; obrigação | ativo + 5 anos para trilha; perfil excedente minimizado antes | substituir PII por sujeito anonimizado, preservar ID técnico quando necessário | titular exporta; sessão/PII eliminadas conforme pedido | Identity/Security; acesso JIT |
| cliente final | atendimento, preferências e CRM | contrato com estabelecimento, legítimo interesse ou consentimento por finalidade | última interação + 2 anos como proposta | anonimizar contato/documento e desvincular preferências | tenant atende titular; exclusão por finalidade | perfis operacionais mínimos; trilha de consentimento |
| pedido/conta | executar e comprovar operação | execução de contrato; obrigação; direitos | 5 anos após transação como proposta | anonimizar cliente, preservar valores/itens | exportação tenant/titular quando aplicável; não apagar obrigação | operação/financeiro/auditoria |
| pagamento fake | testar fluxo sem dado real | legítimo interesse/execução técnica | 12 meses após encerramento | remover referências pessoais; manter estado sintético | exportável pelo tenant; eliminar após prazo | Finance/Integration, auditado |
| nota fake | testar emissão sem validade | execução técnica/legítimo interesse | 12 meses; artefato pode expirar em 90 dias | remover recipient snapshot | download autorizado; eliminar artefato antes do metadata | Integration/Finance |
| audit logs | segurança, fraude e accountability | obrigação/legítimo interesse/direitos | 5 anos para eventos críticos; menor para baixo risco | pseudonimizar ator após retenção de identidade quando legal | não editável pelo usuário; exportação controlada | Security/Auditor; acesso auditado |
| logs técnicos/traces | operar e diagnosticar | legítimo interesse | 30 dias hot / 90 dias total | não deve conter PII; hash/remoção na ingestão | sem exportação ampla; eliminação automática | DevOps/Security com need-to-know |
| notificações | entrega, retry e prova técnica | contrato/consentimento/legítimo interesse conforme canal | conteúdo 30 dias; metadata/tentativas 12 meses | mascarar destinatário e eliminar conteúdo | exportação/status ao tenant; opt-out por finalidade | Notifications/Support limitado |
| backups | recuperação e continuidade | mesmas bases dos dados de origem | rolling 35 dias; mensal até 12 meses como proposta | exclusão lógica se concretiza por expiração; restore reaplica tombstones | não é export source; acesso emergencial | DevOps/Security; restore auditado |

## Regras

- retenção é aplicada por classe, tenant, jurisdição e legal hold;
- cópias/read models não podem reter além da fonte sem justificativa;
- cancelamento de tenant inicia exportação, bloqueio, retenção e eliminação verificável;
- restauração de backup reexecuta pedidos de eliminação/tombstones posteriores;
- métricas provam backlog de eliminação e falhas sem expor PII.

CHK048 permanece aberto até Legal Review antes de produção ou tratamento real de
dados pessoais.
