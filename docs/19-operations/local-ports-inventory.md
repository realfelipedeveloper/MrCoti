# Inventário de portas locais

**Snapshot mais recente:** 2026-06-26 11:21:48 -03:00, Windows local. Leitura
realizada com `docker ps`, labels do Docker Compose e `Get-NetTCPConnection`. O
Docker respondeu (`Client 28.4.0`, `Server 28.4.0`) e os containers de `refresh` e
`taskflow` estavam ativos. Nenhum arquivo externo foi alterado e nenhum segredo de
`.env` foi registrado.

**Snapshot intermediário:** 2026-06-26, Windows local. Leitura realizada com
`Get-NetTCPConnection`, inspeção somente leitura dos arquivos informados de
`refresh`/`taskflow` e `docker ps`. O Docker respondeu (`Server 28.4.0`), mas não
havia containers em execução. Nenhum arquivo externo foi alterado e nenhum segredo de
`.env` foi registrado.

**Snapshot anterior:** 2026-06-25 11:17:42 -03:00, Windows local. Leitura realizada com `Get-NetTCPConnection`; `docker ps` não conseguiu conectar ao Docker Desktop/Linux Engine local. Nenhum processo/porta identificável como `refresh` ou `tasks` estava ativo.

**Snapshot anterior:** 2026-06-23 16:57:50 -03:00, Windows local. Leitura realizada com `Get-NetTCPConnection`; `docker ps` não mostrou containers ativos. Nenhum processo/porta identificável como `refresh` ou `tasks` estava ativo.

## Portas observadas em escuta

No snapshot de 2026-06-26 11:21:48 -03:00, foram observadas as portas em escuta:
`1025`, `3000`, `3001`, `3100`, `3101`, `3306`, `3307`, `3333`, `8025`, `8081`,
`9000` e `9001`, todas associadas aos containers de `refresh` ou `taskflow`.

No snapshot intermediário de 2026-06-26, as portas candidatas extraídas de `refresh` e `taskflow`
estavam sem listener ativo: `587`, `1025`, `3000`, `3001`, `3100`, `3101`, `3306`,
`3307`, `3333`, `8025`, `8081`, `9000` e `9001`. Isso não significa que sejam
seguras para o Mr Coti, pois as configurações desses projetos reservam algumas delas
quando seus containers forem iniciados.

No snapshot de 2026-06-25 foram observadas as portas `135`, `139`, `445`, `5040`,
`5400`, `7070`, `7680`, `8053`, `28385`, `28390`, `49350`, `49351`,
`49664–49667`, `49670`, `49676` e `53970`.

No snapshot anterior foram observadas as portas `135`, `139`, `445`, `5040`,
`5400`, `7070`, `7680`, `8053`, `28385`, `28390`, `42050`, `49350`, `49351`,
`49664–49676` e `55542`.

O snapshot muda com o tempo e deve ser repetido antes de subir qualquer stack local
do Mr Coti. Para a fundação documental, CHK038 está satisfeito porque `refresh` e
`taskflow` foram observados em execução e seus bindings foram registrados sem alterar
projetos externos.

## Portas configuradas em projetos externos

As informações abaixo vêm de leitura dos arquivos enviados. Valores de `.env` foram
filtrados para registrar somente chaves/portas relevantes; segredos não foram
expostos.

| Projeto | Container | Serviço/origem | Porta host | Porta container/destino | Observação |
| --- | --- | --- | ---: | ---: | --- |
| refresh | `refresh-portal` | portal | 3100 | 3100 | colide com a sugestão antiga de web do Mr Coti |
| refresh | `refresh-worker` | refresh | 3101 | 3101 | colide com a sugestão antiga de Grafana do Mr Coti |
| refresh | `refresh-api` | api | 3333 | 3333 | API local do projeto externo |
| refresh | `refresh-mysql` | mysql | 3307 | 3306 | colide com a sugestão antiga de MySQL do Mr Coti |
| refresh | `refresh-minio` | minio | 9000 | 9000 | storage local do projeto externo |
| refresh | `refresh-minio` | minio console | 9001 | 9001 | console local do projeto externo |
| refresh | `refresh-mailpit` | mailpit SMTP/UI | 1025 / 8025 | 1025 / 8025 | mail local do projeto externo |
| refresh | n/a | `.env` SMTP externo | 587 | n/a | porta de SMTP referenciada; não é binding Docker observado |
| taskflow | `taskflow-web-dev` | tasks-web | 3000 | 3000 | web local do projeto externo |
| taskflow | `taskflow-api-dev` | nest-api | 3001 | 3001 | API local do projeto externo |
| taskflow | `taskflow-mysql-dev` | mysql-db | 3306 | 3306 | MySQL default do projeto externo |
| taskflow | `taskflow-nginx-dev` | nginx | 8081 | 80 | proxy local do projeto externo |

## Sugestões para o Mr Coti

| Componente | Porta host sugerida | Estado | Observação |
| --- | ---: | --- | --- |
| web Next.js | 3400 | proposta para evitar `refresh` 3100 e `taskflow` 3000 | configurável por `MRCOTI_WEB_PORT` |
| API NestJS | 3200 | proposta sem colisão observada/configurada | `MRCOTI_API_PORT` |
| Swagger preview | 3201 | proposta sem colisão observada/configurada | preferir `/docs` na API; porta separada só se ferramenta exigir |
| MySQL | 3308 | proposta para evitar `taskflow` 3306 e `refresh` 3307 | `MRCOTI_MYSQL_PORT` |
| Redis | 6380 | proposta livre nos snapshots | evita default comum 6379 |
| MinIO API/console | 9100 / 9101 | proposta livre nos snapshots | duas variáveis distintas |
| Mailpit SMTP/UI | 1026 / 8026 | proposta livre nos snapshots | somente desenvolvimento |
| Grafana | 3401 | proposta para evitar `refresh` 3101 | não confundir com web |
| Prometheus | 9091 | proposta livre nos snapshots | evita default 9090 |
| Loki | 3402 | proposta para agrupar observabilidade local do Mr Coti | evita colisão com web/default Loki |

## Protocolo obrigatório antes de subir stack

1. iniciar/identificar `refresh` e `taskflow`/`tasks` e registrar seus bindings;
2. repetir inventário TCP e `docker ps`;
3. comparar todas as sugestões e escolher por variável, sem fallback silencioso;
4. atualizar snapshot com data, processo/container e owner;
5. falhar antes de subir se qualquer porta estiver ocupada.

CHK038 está satisfeito para esta fundação documental. Antes de subir a futura stack
local do Mr Coti, o protocolo acima deve ser repetido como preflight operacional,
porque o ambiente local pode mudar.
