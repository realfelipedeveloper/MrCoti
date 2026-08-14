# Política de anonimização

## Distinções

- anonimização: transformação razoavelmente irreversível considerando meios disponíveis;
- pseudonimização: substituição reversível sob chave segregada; continua dado pessoal;
- mascaramento: redução de exposição em tela/log; não é anonimização.

## Processo

1. receber pedido/gatilho de retenção e autenticar autoridade;
2. mapear finalidade, base, legal hold e sistemas/cópias afetados;
3. definir campos a eliminar, generalizar, tokenizar ou manter por obrigação;
4. executar de forma idempotente e tenant-aware;
5. propagar tombstone para read models, search, cache, storage e integrações;
6. validar não reidentificação, integridade de agregados e ausência de acesso cruzado;
7. registrar resultado, exceção legal, prazo de backup e evidência sem reter o dado removido.

## Estratégias por domínio

| Dado | Tratamento proposto |
| --- | --- |
| identidade inativa | eliminar contato/credencial, revogar sessões; manter ID técnico pseudônimo quando auditoria exigir |
| cliente final | remover nome, contato, documento, endereço e preferências; manter fatos financeiros agregados sem vínculo |
| pedido/conta | desvincular cliente/observações pessoais; preservar valores, itens e timestamps necessários |
| notificação | eliminar corpo/variáveis e mascarar/hash do destinatário |
| logs | impedir PII na origem; redigir/indexar novamente em incidente |
| artefatos/backup | eliminar objeto ativo; expirar backup e reaplicar tombstone após restore |

## Critérios de aceite

Teste tenta buscar por identificadores originais, cruzar quasi-identifiers e restaurar backup. Resultado não pode reidentificar razoavelmente nem quebrar conciliação obrigatória. Técnica e limiar de risco são `PENDING LEGAL/SECURITY DECISION`.
