# Estratégia de ambientes do Mr Coti

## Princípio

Ambientes representam níveis diferentes de confiança, não versões diferentes do produto. O artefato é imutável; apenas configuração, capacidade, dados autorizados e integrações variam. A nomenclatura não deve ser embutida em regra de domínio.

## Matriz de ambientes

| Ambiente | Finalidade | Dados | Deploy | Integrações | Persistência |
|---|---|---|---|---|---|
| local | desenvolvimento e testes manuais isolados | sintéticos, por desenvolvedor | manual/local | providers fake | descartável por padrão |
| development | integração contínua compartilhada | sintéticos e seeds controlados | automático após branch principal | fake/sandbox autorizada | recriável |
| homologation | aceite funcional e integração entre áreas | massa sintética representativa | promoção controlada | fake/sandbox | estável durante o ciclo de aceite |
| staging | ensaio operacional equivalente à produção | sintéticos, nunca cópia bruta de produção | promoção com gates de release | endpoints de sandbox ou fake contratual | configuração próxima de produção |
| production | atendimento real aos tenants | dados reais protegidos | aprovação e rollout controlados | providers aprovados | backup, restauração e retenção formais |

## Paridade

Staging deve se aproximar de produção em topologia, versão de runtime, banco, Redis, política de rede, observabilidade e processo de deploy. Diferenças inevitáveis — escala, domínio, credenciais e providers — ficam registradas. Homologation otimiza aceite; não é substituta de staging.

## Configuração

A configuração futura deverá entrar por variáveis de ambiente ou mecanismo de secrets. Uma camada de validação falha no startup quando valor obrigatório está ausente, malformado ou inseguro. O inventário deve classificar cada chave como pública, sensível ou secret e registrar proprietário, ambientes, formato e política de rotação.

Categorias esperadas, sem definir valores nesta fase:

- identidade do ambiente e versão;
- URLs públicas e origens CORS;
- conexão MySQL e Redis;
- chaves e política de autenticação;
- providers de pagamento, notas e notificações;
- storage de objetos;
- feature flags e limites operacionais;
- observabilidade e nível de log;
- portas e bindings;
- timeouts, retries e concorrência de workers.

Arquivos `.env.example` futuros contêm apenas nomes e exemplos não secretos. `.env` real nunca entra no repositório ou em artifact.

## Secrets

- um segredo por finalidade e ambiente;
- menor privilégio, expiração e rotação;
- acesso auditável e concedido a identidades de workload, não compartilhado por pessoas;
- produção em AWS deverá usar Secrets Manager ou serviço aprovado;
- rotação deve aceitar período de sobreposição quando o provider exigir;
- logs e mensagens de erro nunca exibem valor ou connection string completa;
- comprometimento inicia revogação, rotação, investigação e avaliação de incidente.

## Dados e privacidade

Local, development, homologation e staging usam dados sintéticos. Se um caso excepcional exigir dados derivados de produção, ele depende de base legal, aprovação, minimização, anonimização validada, ambiente controlado e prazo de eliminação. Mascaramento simples não é automaticamente anonimização.

Cada ambiente possui banco, Redis, bucket e credenciais próprios. Não há rota de escrita de não produção para produção. Backups e restaurações seguem a classificação do dado e são testados sem expor conteúdo.

## Multi-tenancy em ambientes não produtivos

As massas devem incluir múltiplos tenants, planos, unidades, usuários e combinações de feature flags. Cenários de demonstração não compartilham identidades com testes automatizados. Tenants sintéticos têm ciclo de vida claro e podem ser recriados.

## Política de portas

Nenhum número de porta é escolhido neste documento. Toda exposição local deve:

1. receber a porta do host por variável de ambiente;
2. manter um inventário único com serviço, finalidade, protocolo, dono, ambiente e status;
3. consultar previamente portas ocupadas pelo sistema e reservadas por outros projetos;
4. tratar explicitamente `refresh` e `tasks` como reservas externas que não podem ser reutilizadas;
5. falhar com mensagem clara se a porta solicitada estiver indisponível, sem escolher silenciosamente outra;
6. distinguir porta interna do container de binding no host;
7. evitar exposição no host para dependência acessada apenas pela rede interna.

A criação do inventário executável e a escolha de valores pertencem à fase de implementação de infraestrutura, com validação no ambiente do usuário.

## Promoção de configuração

Configurações são revisadas como contrato. A promoção verifica chaves obrigatórias, referências de secrets, domínios, CORS, providers, flags e capacidade. Valores não são copiados cegamente entre ambientes. Uma mudança emergencial de configuração ou flag é auditada e reconciliada posteriormente com a fonte declarativa.

## Acesso

Local é controlado pelo desenvolvedor. Ambientes compartilhados usam SSO/MFA quando disponível, RBAC, menor privilégio e logs de acesso. Produção restringe operação privilegiada, separa aprovação de execução e prevê acesso emergencial temporário, justificado e auditado.

## Critérios de saída por ambiente

- **Development:** build íntegro e suíte de integração aprovada.
- **Homologation:** critérios de aceite e contratos validados.
- **Staging:** ensaio de deploy, migration, smoke, alertas e rollback concluído.
- **Production:** release aprovada, SLOs protegidos, runbooks disponíveis e monitoramento ativo.

