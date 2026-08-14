# Estratégia Docker local do Mr Coti

## Escopo

Este documento planeja a experiência local baseada em containers. Não cria `docker-compose.yml`, Dockerfile, volumes, redes ou serviços. A implementação futura deverá ser pequena, previsível, segura e compatível com a arquitetura cloud-ready.

## Topologia planejada

| Componente | Papel local | Exposição ao host | Persistência padrão |
|---|---|---|---|
| backend NestJS | API e workers quando implementados | configurável; somente quando consumido pelo host | código montado apenas no perfil de desenvolvimento |
| frontend Next.js | interface web | configurável | sem estado de negócio |
| MySQL 8+ | persistência transacional | preferencialmente somente rede interna; binding opt-in | volume nomeado e opção descartável |
| Redis | cache e BullMQ | preferencialmente somente rede interna; binding opt-in | descartável, salvo cenário explícito |
| provider de pagamento fake | contrato público fictício | configurável conforme teste | descartável |
| provider de notas fake | contrato público fictício | configurável conforme teste | descartável |
| providers de notificação fake | envio, status e logs sintéticos | configurável conforme teste | descartável |
| observabilidade | coleta local opcional após ADR | somente no perfil observability | volume opcional |

A decomposição em containers não transforma o modular monolith em microsserviços. Providers fake podem ser processos separados apenas por representarem fronteiras externas contratuais.

## Perfis futuros

- **core:** backend, frontend, MySQL e Redis.
- **integrations:** providers fake de pagamentos, notas e notificações.
- **observability:** collector e ferramentas aprovadas por ADR.
- **test:** dependências efêmeras adequadas à suíte; Testcontainers continua preferido para isolamento automatizado.

Perfis evitam iniciar tudo para toda tarefa. Os nomes são conceituais e serão confirmados na implementação.

## Imagens

- imagens base oficiais, mínimas e fixadas por digest quando operacionalmente viável;
- builds multi-stage para separar dependências, compilação e runtime;
- processo não-root, filesystem somente leitura quando compatível e capabilities removidas;
- healthcheck próprio e sinais corretamente encaminhados ao processo;
- nenhum secret em `ARG`, camada, histórico ou arquivo copiado;
- labels com nome Mr Coti, versão, commit e origem;
- mesma imagem validada localmente e promovida no pipeline.

## Rede

Uma rede interna conecta aplicação e dependências por nomes de serviço. Apenas interfaces usadas pelo navegador ou por ferramentas do host recebem binding. Banco, Redis e endpoints administrativos permanecem internos por padrão. Serviços devem escutar no endereço adequado dentro do container sem transformar isso em exposição pública do host.

## Política obrigatória de portas

Nenhuma porta de host é definida ou sugerida nesta etapa. A alocação futura seguirá este protocolo:

1. carregar o binding de variáveis como `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT` e equivalentes documentadas;
2. consultar um inventário central de portas antes de subir a stack;
3. verificar ocupação real no host;
4. excluir qualquer porta reservada pelos projetos/processos `refresh` e `tasks`;
5. registrar serviço, variável, protocolo, exposição, proprietário e data de revisão;
6. recusar conflito com diagnóstico explícito;
7. não aplicar fallback automático, porque ele torna URLs e testes imprevisíveis.

Portas internas definidas pelas imagens são distintas das portas do host. Componentes somente internos não consomem porta do host. O inventário deverá ser revisado sempre que um novo provider ou ferramenta for adicionado.

## Configuração local

Um arquivo de exemplo futuro lista variáveis sem valores secretos. Overrides pessoais ficam fora do versionamento. Defaults só são aceitos para valores não sensíveis e seguros. O startup valida URLs, portas, credenciais sintéticas, timeouts e nomes de banco antes de aceitar tráfego.

## Dados e volumes

O fluxo padrão deve permitir duas modalidades:

- **efêmera:** recria dependências e seeds sintéticos para teste e diagnóstico reprodutível;
- **persistente:** conserva dados locais em volumes nomeados para desenvolvimento contínuo.

Comandos futuros de limpeza devem distinguir claramente cache, dados e imagens, pedir confirmação para dados persistentes e nunca alcançar diretórios fora do projeto. Dumps reais de produção são proibidos. Seeds precisam ser idempotentes, mínimos e multi-tenant.

## Startup, saúde e desligamento

Dependência entre serviços usa condições de saúde, não apenas ordem de criação. MySQL deve aceitar conexão e schema esperado; Redis deve responder; aplicações devem expor liveness e readiness distintas. Readiness fica negativa durante migration incompatível ou dependência essencial indisponível.

O desligamento deve drenar HTTP, parar consumo de novos jobs, concluir ou devolver jobs em andamento de forma segura, fechar conexões e respeitar um prazo antes do término forçado.

## Migrations e seeds

Containers não executam migrations destrutivas implicitamente em todo startup. Um job ou comando explícito, idempotente e observável aplica migrations após validação. Seeds são separados das migrations e só executam em ambientes permitidos. A aplicação não inicia pronta para tráfego se o schema for incompatível.

## Experiência de desenvolvimento

Os comandos futuros devem cobrir subir por perfil, acompanhar logs sanitizados, consultar saúde, executar migration/seed autorizados, reiniciar um serviço e desligar. Hot reload é uma conveniência do perfil local; não altera a imagem de produção. Documentação deve registrar pré-requisitos e diagnóstico de runtime sem instalar nada automaticamente.

## Testes locais

Testcontainers provisiona MySQL/Redis efêmeros para suites automatizadas e reduz dependência do estado do Compose. A stack local serve a exploração manual, E2E e integração entre aplicações. Uma suíte nunca presume que dados persistentes pessoais existem.

## Segurança local

- credenciais são sintéticas e exclusivas do projeto;
- serviços não escutam interfaces externas sem escolha explícita;
- containers rodam sem privilégio e sem montagem do socket do runtime;
- volumes e logs evitam secrets e dados pessoais;
- imagens e dependências são escaneadas no CI;
- endpoints fake deixam evidente que não representam pagamento ou emissão fiscal real.

## Paridade com AWS

Os containers preservam os contratos de processo, configuração, saúde e desligamento esperados em ECS Fargate ou EKS. MySQL, Redis e storage entram por adapters/configuração para permitir RDS, ElastiCache e S3. Docker Compose será uma orquestração local, não uma abstração necessária ao domínio.

## Critérios para implementar a stack

A criação futura do Compose depende de arquitetura e ADRs aplicáveis aprovados, inventário de portas validado no host, imagens e variáveis documentadas, healthchecks definidos, política de dados/secrets revisada e smoke test planejado. Esta documentação, isoladamente, não autoriza provisionamento ou deploy.
