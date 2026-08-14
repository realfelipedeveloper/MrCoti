# Estratégia AWS cloud ready

O **Mr Coti** começa em Docker Compose local, mas mantém fronteiras que permitem execução futura na AWS sem refatoração estrutural. Este documento é um mapa de portabilidade, não uma configuração de deploy real.

## Mapeamento de capacidades

| Capacidade local/lógica | Destino AWS futuro | Regra de portabilidade |
|---|---|---|
| Containers da API/web/workers | ECS Fargate inicialmente; EKS somente se houver necessidade comprovada | Imagens imutáveis, processo stateless, config externa e shutdown gracioso |
| MySQL 8+ | RDS MySQL | SQL e Prisma compatíveis, conexões TLS, migrations separadas do start da aplicação |
| Redis/BullMQ/cache | ElastiCache Redis | Sem persistência exclusiva de negócio; timeouts e reconexão controlados |
| Arquivos e imagens | S3 | Porta de armazenamento, nomes tenant-aware e URLs temporárias |
| Conteúdo web e assets | CloudFront | Cache explícito e invalidação versionada |
| DNS | Route 53 | Hostnames e certificados fora do domínio de aplicação |
| Logs, métricas e alarmes | CloudWatch | Saída estruturada em stdout/stderr e correlação ponta a ponta |
| Secrets | Secrets Manager | Nenhum secret em imagem, repositório, log ou configuração pública |
| E-mail | SES | Provider atrás da porta de notificação; adoção real exige ADR |
| SMS/eventos AWS | SNS | Adaptador futuro, sem acoplamento do domínio |
| Filas AWS | SQS | Alternativa futura a casos de fila/evento; migração exige ADR e análise semântica |

Serviços AWS listados são alvos autorizados pelo SDD, não decisões de ativação imediata. EKS, SES, SNS e SQS só entram quando o caso operacional existir e a decisão for registrada quando alterar a arquitetura.

## Topologia alvo de referência

CloudFront entrega conteúdo web e encaminha tráfego ao ponto de entrada regional. Serviços em containers executam API, frontend e workers em sub-redes privadas quando aplicável. RDS MySQL e ElastiCache não ficam expostos à Internet. S3 armazena objetos; Secrets Manager fornece segredos em runtime; CloudWatch recebe telemetria.

A implantação começa em uma região e múltiplas zonas de disponibilidade. Multi-região pertence ao roadmap V3 e exige decisões específicas sobre consistência, roteamento, residência de dados e recuperação.

Veja [deployment-aws.puml](../03-uml/deployment-aws.puml).

## Requisitos dos containers

- Imagem sem estado mutável necessário e sem secrets embutidos.
- Configuração por ambiente validada no start, com nomes estáveis.
- Endpoint de liveness apenas confirma processo; readiness verifica capacidade de servir sem causar cascata.
- Sinais de encerramento param novas requisições/jobs e aguardam conclusão limitada.
- Logs estruturados vão para stdout/stderr e nunca carregam dados sensíveis.
- Migrations rodam como etapa controlada do pipeline, uma vez por release, nunca por todas as réplicas simultaneamente.
- Uploads não dependem do filesystem efêmero do container.

## Rede e segurança

- Princípio do menor privilégio para identidades de workload e acesso a serviços.
- Banco e Redis aceitam somente origens necessárias; administração ocorre por canal auditado.
- TLS em trânsito e criptografia em repouso são requisitos.
- CORS é explícito por ambiente; rate limiting e brute-force protection protegem endpoints públicos.
- Secrets têm rotação, versionamento e acesso auditável.
- Ambientes `development`, `homologation`, `staging` e `production` são isolados por configuração e credenciais; produção não reutiliza recursos não produtivos.
- Backups, retenção e restauração do RDS são testados, não apenas habilitados.

## Escala e disponibilidade

API, frontend e workers escalam independentemente como processos do mesmo monorepo/monólito modular, sem transformar módulos em microsserviços. A API escala por CPU, memória, latência e requisições; workers por backlog e idade das filas. O pool total de conexões permanece limitado pela capacidade do RDS.

Rolling deployments mantêm versões N e N-1 compatíveis com schema e eventos durante a transição. Feature flags reduzem o raio de mudança, mas não substituem rollback de release.

## Observabilidade e operação

Cada requisição e job propaga `correlation-id`, `request-id`, tenant e versão de release em metadados seguros. Métricas mínimas: taxa/latência/erros da API, pool e queries do banco, hit rate de cache, profundidade/idade das filas, atraso da outbox, falhas de integrações e status de deploy.

OpenTelemetry, Prometheus, Grafana e Loki são tecnologias complementares autorizáveis por ADR, mas não são adotadas aqui. A primeira integração AWS pode usar CloudWatch mantendo uma camada de instrumentação independente do fornecedor.

## Recuperação e continuidade

Antes de produção, o produto define RPO e RTO por criticidade, executa restore em ambiente isolado e documenta failover. Recuperação inclui MySQL, objetos, configurações, secrets e reconstrução de cache/projeções. Outbox e idempotência evitam perder ou repetir efeitos durante retomada.

## Restrições contra lock-in

Domínio e aplicação não importam SDKs AWS. Serviços externos entram por portas. Recursos específicos da AWS ficam em adaptadores e infraestrutura. Uma troca BullMQ→SQS ou provider fake→SES/SNS não deve alterar agregados, embora diferenças de entrega e ordenação exijam ADR, testes de contrato e migração operacional.
