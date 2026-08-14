# Versionamento de eventos

## Regras

- nome representa fato no passado; não é comando;
- `eventVersion` é inteiro crescente por nome;
- adição de campo opcional com default semântico pode permanecer na versão;
- remoção, renome, mudança de tipo/unidade/semântica ou obrigatoriedade cria nova versão;
- produtor publica uma forma imutável por `eventId`;
- consumidores ignoram campos desconhecidos e validam versão suportada;
- timestamps são UTC/RFC 3339; valores monetários carregam decimal e moeda;
- IDs são opacos; payload não embute agregados inteiros.

## Compatibilidade e migração

Mudança incompatível usa dual-publish ou adapter temporário com prazo, telemetria de consumidores e rollback. Cada consumidor declara versões aceitas. Retirada só ocorre quando nenhum consumidor ativo depende da versão antiga e replay histórico continua interpretável.

## Idempotência e ordem

`eventId` deduplica entrega. `aggregateVersion` detecta duplicata/fora de ordem por agregado. Consumidor registra resultado antes de confirmar. Uma nova versão do evento não representa novo fato; dual-publish compartilha `correlationId` e chave lógica de origem.

## Governança de schema

Schemas futuros ficam versionados junto ao contrato. CI valida exemplos e compatibilidade. Dados classificados como segredo, credencial, cartão, documento completo, corpo de notificação ou payload bruto de provider são proibidos mesmo que criptografados.
