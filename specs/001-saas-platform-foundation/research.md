# Pesquisa e decisões — Fundação da plataforma SaaS

**Produto:** Mr Coti  
**Feature:** `001-saas-platform-foundation`  
**Data:** 2026-06-23  
**Estado:** Decisões de planejamento; ADRs são os registros normativos finais

## Método

As decisões abaixo resolvem as principais incertezas do SDD antes de qualquer
implementação. Cada decisão registra motivo, alternativas, consequências e requisitos
atendidos. Quando houver ADR correspondente, o ADR prevalece e esta pesquisa deve ser
atualizada se ele mudar de estado.

## D-01 — Estilo arquitetural

**Decisão:** iniciar o Mr Coti como monólito modular, com bounded contexts, DDD,
Clean Architecture e dependências hexagonais nas integrações.

**Motivo:** a fase inicial exige velocidade, consistência transacional e baixo custo
operacional. Limites modulares e eventos internos preservam a opção de extração
futura sem pagar agora o custo distribuído.

**Alternativas consideradas:**

- **Microsserviços desde o início:** rejeitado por introduzir consistência eventual,
  rede, observabilidade distribuída, deploys e governança antes de limites e carga
  estarem comprovados.
- **Monólito em camadas técnicas globais:** rejeitado porque favorece acoplamento e
  acesso transversal a dados de outros domínios.

**Consequências:** módulos possuem dados e contratos próprios; acesso direto entre
módulos é proibido; comunicação ocorre por serviços de aplicação ou eventos. Uma
extração futura requer ADR e evidência. Relaciona-se a RNF-001 e ao ADR-0001.

## D-02 — Estratégia de repositório

**Decisão:** planejar monorepo para backend, frontend, contratos, pacotes
compartilháveis e infraestrutura documental, com limites de dependência verificáveis.

**Motivo:** coordena mudanças atômicas de contrato e consumidores, simplifica gates e
versionamento no estágio inicial e combina com monólito modular.

**Alternativas consideradas:**

- **Multirepo:** útil para equipes e ciclos independentes, mas antecipa coordenação de
  versões e automação ainda desnecessária.
- **Repositório único sem limites de pacotes:** simples no curto prazo, mas permite
  acoplamento acidental e não oferece caminho claro de extração.

**Consequências:** o pipeline deve detectar áreas afetadas sem reduzir gates; pacotes
compartilhados não podem carregar regras de domínio de múltiplos contextos. A decisão
final pertence ao ADR-0002.

## D-03 — Persistência e Prisma

**Decisão:** MySQL 8+ como fonte transacional e Prisma ORM como acesso padrão,
mantendo SQL/recursos específicos encapsulados e justificados.

**Motivo:** Prisma foi previamente aprovado no SDD; tipagem, migrations versionadas e
produtividade atendem a stack obrigatória. MySQL oferece integridade transacional e
caminho direto a RDS MySQL.

**Alternativas consideradas:** TypeORM/Sequelize foram rejeitados porque reabririam
decisão já aprovada sem novo requisito; SQL manual como padrão foi rejeitado pelo
custo de consistência, embora possa ser admitido por decisão localizada para consultas
críticas mensuradas.

**Consequências:** constraints do banco continuam obrigatórias; nenhuma regra de
isolamento pode depender somente do ORM; migrations futuras exigem validação e plano
de rollback/roll-forward. Relaciona-se a RNF-002 e ao ADR-0003.

## D-04 — Modelo multi-tenant

**Decisão:** banco único, schema compartilhado e `tenant_id` obrigatório em toda
entidade tenant-aware.

**Motivo:** tem menor custo, operação simples, bom aproveitamento de recursos e
facilita migrations, backup e evolução para centenas ou milhares de tenants. Índices
e uniques compostos por `tenant_id` evitam colisões lógicas.

**Alternativas consideradas:**

- **Banco por tenant:** isolamento forte e restauração individual simples, mas custo,
  pools, migrations e observabilidade crescem linearmente; pode ser opção premium ou
  regulatória futura.
- **Schema por tenant:** isolamento intermediário, porém MySQL não oferece o mesmo
  modelo de schemas independentes de outros bancos e a gestão continua multiplicada.

**Consequências:** contexto do tenant é derivado da sessão/credencial, nunca aceito
como autoridade do payload; repositórios exigem escopo; cache, arquivos, jobs,
eventos e auditoria incorporam tenant; testes negativos são gate. Tabelas globais
precisam de justificativa. Estratégia de migração futura deve usar fronteiras e
chaves já existentes. Relaciona-se a RF-001–011, RSD-001–002 e ADR-0004.

## D-05 — Autenticação e autorização

**Decisão:** identidade separada de membership; autenticação baseada em credencial
segura com sessão/token de curta duração e renovação rotativa/revogável; autorização
RBAC por tenant e unidade com políticas para condições de negócio.

**Motivo:** uma pessoa pode participar de mais de um tenant, enquanto papéis e escopo
não podem vazar entre eles. Sessões curtas limitam exposição e a renovação rotativa
permite experiência aceitável com revogação.

**Alternativas consideradas:** sessão stateful central como única estratégia foi
rejeitada por criar dependência forte de armazenamento e dificultar portabilidade;
JWT longo sem revogação foi rejeitado pelo risco; permissões diretamente no usuário
foram rejeitadas por não modelarem membership/escopo.

**Consequências:** troca explícita de contexto de tenant, MFA futuro, proteção contra
brute force, hash forte, auditoria e revogação são requisitos. O formato final e a
ameaça de tokens devem ser fechados no ADR-0005 antes de implementação.

## D-06 — Feature flags e direitos comerciais

**Decisão:** modelar catálogo de features, entitlement de plano, override de tenant e
regra de ambiente como conceitos distintos, avaliados no servidor com precedência
determinística e cache de curta duração.

**Motivo:** misturar plano e flag impede distinguir direito comercial de rollout
operacional. Conceitos separados suportam beta, kill switch, módulo premium e limites
sem enfraquecer autorização.

**Alternativas consideradas:** condicionais em código foram rejeitadas por não serem
auditáveis; serviço SaaS externo de flags não foi adotado inicialmente por custo e
dependência, mas um adaptador pode permitir adoção futura via ADR.

**Consequências:** bloqueio emergencial de ambiente prevalece, seguido por direito do
plano e override controlado do tenant; ausência/erro usa fallback seguro. Cada flag
tem owner, validade e remoção. UI pode ocultar, mas backend sempre aplica. Atende
RF-012–015.

## D-07 — API First, erros e idempotência

**Decisão:** OpenAPI 3.x é produzido e validado antes do código; APIs públicas usam
prefixo de versão, autenticação explícita, envelope de erro consistente, IDs de
requisição/correlação e idempotência persistida para comandos relevantes.

**Motivo:** contratos permitem revisão, mocks e testes independentes. A persistência
da idempotência é necessária para sobreviver a restart e tratar timeout ambíguo.

**Alternativas consideradas:** documentação posterior por decorators foi rejeitada
porque transforma implementação em fonte da verdade; idempotência apenas em memória
ou Redis foi rejeitada por não ser fonte durável; GraphQL como API pública inicial foi
rejeitado por fugir do escopo REST.

**Consequências:** a chave de idempotência possui escopo `(tenant, operação, chave)`,
hash do payload, resposta/estado e expiração; reuso com payload diferente é conflito.
Erros possuem código estável, mensagem segura e detalhes validados. Atende RF-024–036,
RNF-007–008.

## D-08 — Eventos, Outbox Pattern e filas

**Decisão:** mudanças transacionais e registros de outbox são persistidos na mesma
transação; um dispatcher publica para BullMQ/Redis, com consumidor idempotente,
retry finito e tratamento de falha.

**Motivo:** evita o dual write entre banco e fila e preserva rastreabilidade sem
introduzir broker adicional fora da stack.

**Alternativas consideradas:** publicar diretamente após commit foi rejeitado pela
janela de perda; transação distribuída foi rejeitada por complexidade e suporte;
SQS direto no desenvolvimento local foi adiado, mantendo adaptadores AWS-friendly.

**Consequências:** publicação é ao menos uma vez, logo consumidores devem deduplicar;
outbox precisa de retenção/particionamento; lag, falhas e dead letters são métricas.
Jobs carregam tenant e correlação, nunca credenciais. Atende RNF-001, RNF-006,
RNF-008 e princípio VII.

## D-09 — APIs fictícias

**Decisão:** pagamentos e notas são bounded contexts de simulação com máquinas de
estado e cenários determinísticos; notificações usam provider abstrato e providers
fake assíncronos.

**Motivo:** testes precisam reproduzir sucesso e falhas sem dependência financeira,
fiscal ou de mensageria real.

**Alternativas consideradas:** integrar sandbox de fornecedor real foi rejeitado por
credenciais, instabilidade e risco de acoplamento; simples respostas fixas sem estado
foram rejeitadas por não exercitarem idempotência, consulta e webhooks.

**Consequências:** todo artefato fiscal é marcado sem validade; nenhum dado real de
cartão é aceito; cenários são selecionáveis por campo/header exclusivo de teste,
proibido em produção real futura. As transições devem poder ser consultadas após
timeout. Relaciona-se aos ADRs 0006, 0007 e 0008.

## D-10 — Cache e degradação

**Decisão:** MySQL permanece fonte da verdade; Redis é usado para cache, rate
limiting e BullMQ, com nomes de chave que incluem ambiente e tenant e políticas
explícitas de TTL/invalidação.

**Motivo:** Redis melhora latência e coordena trabalho assíncrono, mas não pode ser a
única cópia de dados de negócio.

**Alternativas consideradas:** cache local por instância foi rejeitado para decisões
de autorização/flags devido à inconsistência; uso de Redis como persistência primária
foi rejeitado por requisitos de integridade e recuperação.

**Consequências:** falha do cache permite fallback controlado ao banco; falha da fila
degrada capacidades assíncronas e gera alerta; rate limiting deve adotar estratégia
segura em indisponibilidade. Atende RNF-006 e casos de borda.

## D-11 — Observabilidade

**Decisão:** adotar telemetria vendor-neutral com logs JSON, métricas e tracing
correlacionados; OpenTelemetry é a opção preferida sujeita a ADR quando introduzido.

**Motivo:** portabilidade evita dependência de CloudWatch e permite ambiente local
com stack autorizada. Correlação é indispensável em API, outbox, filas e webhook.

**Alternativas consideradas:** logs textuais foram rejeitados por baixa capacidade de
consulta; somente APM proprietário foi rejeitado por lock-in; registrar payloads
integrais foi rejeitado por privacidade.

**Consequências:** schema de log com timestamp, nível, serviço, módulo, ambiente,
tenant pseudonimizado, request/correlation ID, operação, duração e resultado; campos
sensíveis são mascarados/omitidos. Dashboards medem latência, erros, saturação, fila,
outbox e integrações. Atende RNF-011 e RSD-011.

## D-12 — Testes e ambientes

**Decisão:** pirâmide de testes com Jest para unidade/integração, Supertest para API,
Playwright para E2E e acessibilidade, e bancos/Redis reais efêmeros por containers para
integração; contratos e isolamento têm suites próprias.

**Motivo:** mocks são úteis em unidade, mas não validam constraints, transações,
serialização ou isolamento. Containers aproximam produção sem infraestrutura
compartilhada.

**Alternativas consideradas:** banco em memória foi rejeitado por divergência do
MySQL; apenas E2E foi rejeitado por lentidão e diagnóstico ruim; ambientes manuais
compartilhados como gate foram rejeitados por não determinismo.

**Consequências:** fixtures sempre identificam tenant; cada bug recebe regressão;
contratos cobrem exemplos e mudanças incompatíveis; matriz inclui sucesso, falha,
timeout, retry e duplicidade. Atende RNF-009–010.

## D-13 — Segurança e LGPD

**Decisão:** incorporar threat modeling por fluxo, classificação de dados, RBAC,
auditoria append-only, minimização e políticas de retenção desde a especificação.

**Motivo:** tenancy amplia o impacto de IDOR; clientes e consentimentos envolvem
dados pessoais; logs e exports são superfícies frequentes de vazamento.

**Alternativas consideradas:** revisão apenas antes do release foi rejeitada por
custo tardio; armazenar snapshots completos na auditoria foi rejeitado por ampliar
exposição; exclusão física indiscriminada foi rejeitada por quebrar integridade e
retenções legítimas.

**Consequências:** cada contexto define classificação e retenção; anonimização preserva
referências quando necessário; export/delete são assíncronos, autorizados e auditados;
CI inclui SAST/dependências/imagem. Atende RSD-001–014.

## D-14 — AWS e portabilidade

**Decisão:** containers stateless, configuração por ambiente, abstração de storage e
mensageria e dependências compatíveis com ECS/EKS, RDS, ElastiCache, S3, CloudFront,
CloudWatch, Secrets Manager, SES, SNS e SQS.

**Motivo:** mantém Docker Compose simples e evita refatoração estrutural na migração.

**Alternativas consideradas:** recursos exclusivos locais e filesystem persistente
foram rejeitados; Kubernetes desde o início foi rejeitado por complexidade; uso
imediato de todos os serviços AWS foi rejeitado porque não há deploy real nesta fase.

**Consequências:** adapters separam providers, health probes são distintas, processos
tratam desligamento gracioso e nenhuma sessão depende da instância. A escolha ECS
versus EKS fica para momento de implantação com evidência de operação. Atende
RNF-003, RNF-011 e princípio VIII.

## D-15 — Backup, restauração e retenção

**Decisão:** baseline inicial RPO ≤ 24 h e RTO ≤ 4 h, backups criptografados e testes
regulares de restauração; retenção definida por classe de dado e obrigação.

**Motivo:** o SDD exige backup/restauração, mas não fornece metas. O baseline torna o
gate mensurável sem prometer alta disponibilidade ainda não desenhada.

**Alternativas consideradas:** metas zero foram rejeitadas por custo e irrealismo;
backup sem teste foi rejeitado porque não demonstra recuperabilidade; retenção única
para tudo foi rejeitada por LGPD e custo.

**Consequências:** metas devem ser revistas antes de produção e podem ser reduzidas
por plano/criticidade; restore valida integridade, isolamento e trilha. Atende RNF-012,
RSD-008 e RSD-012.

## D-16 — Portas e configuração local

**Decisão:** não fixar no desenho portas possivelmente ocupadas; todos os bindings
devem ser configuráveis por ambiente e o quickstart de implementação futura deverá
detectar conflitos com `refresh` e `tasks`.

**Motivo:** o SDD proíbe utilizar portas desses serviços, mas não informa os números.

**Alternativas consideradas:** reservar números arbitrários foi rejeitado por não
garantir ausência de colisão; encerrar serviços existentes foi rejeitado por estar
fora de escopo e poder afetar o ambiente do usuário.

**Consequências:** nenhuma configuração futura assume porta fixa; o inventário exige
inspeção/override sem alterar serviços existentes. O snapshot de 2026-06-26 observou
`refresh` e `taskflow` ativos, registrou seus bindings reais e ajustou as sugestões do
Mr Coti para evitar colisões. Atende RNF-014 e RNF-018.

## D-17 — Billing como domínio SaaS, sem cobrança real

**Decisão:** modelar Billing no Core SaaS com PlanVersion, Subscription, Trial,
PlanChange, Usage/Overage e histórico, sem gateway ou fatura real.

**Motivo:** plano e ciclo comercial precisam de versão, vigência e auditoria; campos
soltos em Tenant impedem evolução e provider real agora é prematuro.

**Alternativas consideradas:** campos diretos em Tenant e provider externo desde o
MVP foram rejeitados. **Consequências:** parâmetros comerciais continuam pendentes;
decisão registrada no ADR-0009. Atende RF-043–046.

## D-18 — Entitlements separados de flags e RBAC

**Decisão:** entitlement expressa direito/limite comercial; flag controla rollout;
RBAC/policy controla ator/recurso. Todas as decisões são cumulativas e fail-safe.

**Motivo:** um booleano único permite bypass comercial e de segurança.

**Alternativas consideradas:** flag como plano e papel como licença foram rejeitados.
**Consequências:** cache/versionamento e testes combinatórios são obrigatórios;
ADR-0010. Atende RF-047.

## D-19 — Catálogo de eventos e ownership

**Decisão:** eventos cross-context usam catálogo/envelope versionado, owner,
consumidores, dados proibidos, idempotência e outbox; cada contexto escreve apenas
seus dados.

**Motivo:** eventos ad hoc criam semântica divergente, PII e acoplamento oculto.

**Alternativas consideradas:** mensagens sem schema e broker/event sourcing completo
foram rejeitados. **Consequências:** mudanças incompatíveis exigem nova versão e
migração; ADR-0011. Atende RF-048–049.

## D-20 — Disaster Recovery progressivo

**Decisão:** DR por classe de dado com restore testado, MySQL como fonte, Redis
reconstruível, outbox reconciliável e metas progressivas.

**Motivo:** backup sem restore comprovado não oferece continuidade; multi-região no
MVP seria custo prematuro.

**Alternativas consideradas:** backup diário sem teste e multi-região ativa foram
rejeitados. **Consequências:** targets finais dependem de orçamento/aprovação;
ADR-0012. Atende RNF-015.

## D-21 — FinOps AWS por drivers de uso

**Decisão:** usar tags por recurso/ambiente/módulo e alocar compartilhados por
requests, jobs, storage, notificações e telemetria tenant-aware.

**Motivo:** fatura por conta não revela custo por tenant; recurso dedicado por tenant
é inviável em escala.

**Alternativas consideradas:** apenas cost explorer por conta e infraestrutura
dedicada foram rejeitadas. **Consequências:** showback é estimativa reconciliada, não
billing; ADR-0013. Atende RNF-016.

## D-22 — RBAC do MVP por comando e condição

**Decisão:** matriz deny-by-default com permission, recurso, escopo, condição e
negação explícita, complementada por policy tenant-aware.

**Motivo:** nomes de papéis isolados não impedem IDOR ou privilege escalation.

**Alternativas consideradas:** roles fixas sem escopo e ABAC completo foram
rejeitados. **Consequências:** a matriz está proposta, mas aguarda Produto/Segurança;
ADR-0014. Atende RSD-015.

## D-23 — Retenção e anonimização por categoria

**Decisão:** cada categoria registra finalidade, base sugerida, prazo, acesso,
exportação, eliminação e anonimização; legal hold e backup têm tratamento explícito.

**Motivo:** prazo único é excessivo ou insuficiente e exclusão parcial ressuscita
dados em cópias.

**Alternativas consideradas:** retenção longa única e exclusão imediata irrestrita
foram rejeitadas. **Consequências:** todas as sugestões aguardam Legal Review;
ADR-0015. Atende RSD-016.

## D-24 — SLO e carga por fase

**Decisão:** documentar baseline, MVP, produção e futuro para disponibilidade,
latência, throughput, jobs, webhooks, notificações, restore e volumes.

**Motivo:** “escalável” sem números não é testável; meta máxima precoce gera custo.

**Alternativas consideradas:** metas máximas desde o MVP e ausência de números foram
rejeitadas. **Consequências:** números são hipóteses até benchmark/aprovação;
ADR-0016. Atende RNF-017.

## Questões que permanecem para validação antes da implementação

Nenhuma das questões abaixo autoriza suposição silenciosa:

1. Aprovação de Produto para excedentes, limites e vigência de upgrade/downgrade.
2. Aprovação de Produto/Segurança da matriz RBAC detalhada do MVP.
3. Legal Review dos prazos, bases e técnicas de anonimização propostas.
4. Aprovação de SLO/carga por Produto, Arquitetura, QA e Operações.
5. Algoritmo e experiência de autenticação final no ADR-0005, inclusive MFA futuro.
6. Aprovação de frequência de restore/DR e metas de produção.
7. Critério quantitativo para extrair módulo do monólito.
8. Portas efetivamente ocupadas por `refresh` e `tasks` quando estiverem ativos.
9. Orçamentos, thresholds e showback/chargeback FinOps.

Itens 1 a 6 bloqueiam a implementação das partes diretamente afetadas, mas não a
conclusão desta fundação documental quando registrados com responsável e gate.
