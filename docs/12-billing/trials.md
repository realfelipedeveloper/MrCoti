# Trials

Trial é uma assinatura temporária com vigência e entitlements explícitos, não uma exceção informal.

## Regras propostas

- elegibilidade por tenant/organização, não apenas e-mail;
- uma concessão padrão por tenant; extensão manual exige motivo e expiração;
- trial padrão de 14 dias;
- extensão permitida manualmente por Platform Admin, com motivo e nova expiração;
- início, fim, entitlements e limites imutavelmente auditados;
- avisos antes da expiração e decisão explícita de conversão/cancelamento;
- sem cobrança real nem captura de meio de pagamento nesta etapa;
- dados criados permanecem sujeitos à mesma segurança/LGPD de um tenant pago.

## Expiração

Na expiração, o tenant entra em `TRIAL_EXPIRED`: novas operações comerciais ficam
bloqueadas, enquanto owner autorizado pode consultar/exportar e escolher plano dentro
da janela de saída. Dados não são apagados automaticamente.

## Conversão

Conversão para `ACTIVE` seleciona `PlanVersion`, recalcula limites, preserva IDs/dados e registra `PlanChanged`/histórico comercial. Consumo do trial não é misturado ao primeiro ciclo sem regra explícita.

Janela de saída e entitlements específicos do trial devem ser revalidados na spec de
implementação do fluxo comercial.
