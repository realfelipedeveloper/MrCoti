# DevOps do Mr Coti

Este diretório reúne o planejamento operacional de entrega e execução do Mr Coti. A arquitetura nasce Docker-first e AWS-ready, mas esta etapa é exclusivamente documental: não cria workflow, imagem, Dockerfile, Compose, recurso cloud nem deploy.

## Documentos

- [CI/CD](./ci-cd.md): estágios, gates, artefatos, promoção e rollback.
- [Ambientes](./environments.md): finalidade, configuração, secrets, dados e promoção entre ambientes.
- [Estratégia Docker local](./local-docker-strategy.md): topologia planejada, ciclo de vida, healthchecks e política de portas, sem arquivo Compose.
- [Inventário local de portas](../19-operations/local-ports-inventory.md): snapshot, sugestões e verificações pendentes.
- [Disaster Recovery](../16-disaster-recovery/disaster-recovery-strategy.md) e [FinOps](../17-finops/aws-cost-strategy.md): continuidade e custos AWS futuros.

## Princípios operacionais

- um mesmo commit produz um artefato imutável promovido entre ambientes;
- configuração varia por ambiente e entra por variáveis ou secret store, nunca por alteração do artefato;
- infraestrutura e aplicação permanecem stateless quando possível;
- migrações são compatíveis com rollout progressivo, verificáveis e recuperáveis;
- logs, métricas, traces e healthchecks são requisitos de execução;
- toda promoção é rastreável até commit, especificação, testes e aprovações;
- dependências locais reproduzem as classes de serviço de produção sem criar acoplamento ao Docker Compose;
- decisões cloud preservam portabilidade para ECS Fargate/EKS, RDS, ElastiCache, S3, CloudFront, Route 53, CloudWatch, Secrets Manager, SES, SNS e SQS.

## Limites desta etapa

Não estão autorizados instalação de dependências, build de imagem, criação de Compose, provisionamento AWS, configuração real de secrets, execução de migration, deploy, commit ou push. Os documentos registram o contrato operacional que deverá ser aprovado antes dessas ações.

## Critério de evolução

A automação futura deve nascer de especificação aprovada, usar princípio de menor privilégio, registrar evidências e falhar de forma segura. Qualquer tecnologia complementar relevante requer ADR antes de adoção.
