# Padrões de API

## Convenções

- REST sobre HTTPS, JSON UTF-8 e prefixo `/v1`.
- Bearer token para chamadas protegidas; scopes por família de API.
- IDs opacos (UUID/ULID como decisão de implementação); clientes não inferem sequência.
- Datas em RFC 3339 UTC; dinheiro como objeto `{amount, currency}` com `amount` decimal em string.
- Erros seguem `application/problem+json`, com `type`, `title`, `status`, `code`, `detail`, `instance`, `requestId` e violações.

## Correlação e idempotência

`X-Request-Id` é gerado/validado no edge e sempre retornado. `X-Correlation-Id` agrupa uma jornada e é propagado a filas, outbox, logs e webhooks. `Idempotency-Key` é obrigatório em comandos externos com efeito; escopo inclui tenant, rota e credencial. A chave armazena hash do payload e resposta por período documentado.

## Coleções

Paginação cursor-based é preferida em dados volumosos (`page[size]`, `page[after]`). Filtros usam campos allowlisted (`filter[status]`), e ordenação usa `sort=createdAt,-status`. Respostas retornam `data`, `meta` e `links`. Limites máximos evitam abuso.

## Compatibilidade

Adições opcionais são compatíveis; remoção, renome ou semântica alterada exige nova versão. Deprecações informam prazo e telemetria de uso. O consumidor nunca deve depender de ordem de propriedades ou campos desconhecidos serem ausentes.

## Segurança

Validação rejeita campos inesperados quando o contrato assim exigir, payloads têm limites, CORS é allowlist, rate limit é por credencial/tenant/IP conforme risco, e respostas não expõem stack, segredo ou existência de recurso fora do escopo.
