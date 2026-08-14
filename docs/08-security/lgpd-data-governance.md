# LGPD e governança de dados do Mr Coti

## Objetivo

Este documento estabelece uma base de privacy by design para dados pessoais e operacionais do Mr Coti. Ele não substitui parecer jurídico. Bases legais, prazos, papéis contratuais e comunicações à ANPD/titulares devem ser confirmados pelo encarregado e jurídico antes da produção.

As propostas canônicas por categoria ficam em [`../18-governance/data-retention-policy.md`](../18-governance/data-retention-policy.md), [`legal-basis-lgpd.md`](../18-governance/legal-basis-lgpd.md) e [`anonymization-policy.md`](../18-governance/anonymization-policy.md). Todas permanecem `PENDING LEGAL REVIEW`.

## Papéis

Em muitos fluxos, o restaurante/tenant tenderá a decidir finalidade e meios essenciais dos dados de seus clientes, enquanto o Mr Coti os tratará em seu nome. Em outros fluxos — conta da plataforma, cobrança SaaS, segurança e obrigações próprias — o Mr Coti pode possuir finalidade própria. A classificação entre controlador, operador, suboperador e controladoria conjunta deve ser feita por finalidade e contrato, não aplicada genericamente ao sistema inteiro.

Papéis internos:

- **Product/Business:** finalidade, necessidade e experiência dos direitos.
- **Encarregado/jurídico:** base legal, contratos, prazos, incidente e comunicação.
- **Data owner:** qualidade, acesso e ciclo de vida do conjunto.
- **Security Agent:** controles, threat model e incidentes.
- **Architect/Database Agents:** modelagem, isolamento, lineage e mecanismos de retenção.
- **DevOps:** backups, restauração, eliminação e evidências operacionais.
- **QA:** verificação dos direitos e não regressão.

## Inventário e registro de tratamento

Todo conjunto deve registrar: finalidade, titular, categorias, origem, campos, base legal proposta, controlador/operador, sistema e local, tenant, destinatários/suboperadores, transferência internacional, acesso, retenção, descarte, controles e data da revisão.

Nenhum novo campo pessoal é implementado apenas por conveniência. A spec deve explicar necessidade e uso; o data model associa classificação e ciclo de vida.

## Classificação inicial

| Classe | Exemplos no Mr Coti | Regra mínima |
|---|---|---|
| pública | conteúdo de cardápio publicado | integridade, versionamento e aprovação |
| interna | configuração não secreta, métricas agregadas | acesso organizacional necessário |
| confidencial de negócio | vendas, estoque, caixa, preços internos, relatórios | isolamento por tenant, criptografia e auditoria |
| pessoal | nome, contato, histórico, preferências, aniversário | finalidade, base legal, minimização e direitos |
| pessoal sensível | somente se uma finalidade aprovada realmente exigir | evitar por padrão; proteção e análise reforçadas |
| segredo/credencial | senha, token, chave, connection string | secret store, acesso mínimo, rotação; não registrar |

Dados de cartão reais não pertencem às APIs fictícias. Artefatos de nota são fake nesta fase e não devem conter documento fiscal/pessoal real.

## Princípios aplicados

- **finalidade e adequação:** usar o dado apenas no objetivo informado;
- **necessidade:** coletar o mínimo, com precisão e granularidade apropriadas;
- **livre acesso e transparência:** informar tratamento e viabilizar direitos;
- **qualidade:** permitir correção e manter origem/atualização;
- **segurança e prevenção:** controles proporcionais desde o desenho;
- **não discriminação:** não derivar uso abusivo de preferências/perfis;
- **responsabilização:** manter decisões, testes, contratos e evidências.

## Bases legais e consentimento

Cada finalidade tem uma base legal aprovada. Consentimento não é base universal nem pode ser acoplado a finalidade desnecessária. Quando usado, deve ser livre, informado, inequívoco, granular, versionado, demonstrável e revogável com a mesma facilidade da concessão.

O registro de consentimento deve conter titular/identificador adequado, finalidade, versão do aviso, momento, canal, estado e revogação, evitando guardar mais evidência do que necessário. Revogação interrompe tratamento dependente dela sem apagar registros que outra obrigação exija; esse conflito é explicado ao titular.

## Direitos dos titulares

O fluxo deve aceitar, autenticar proporcionalmente, protocolar e rastrear solicitações de:

- confirmação e acesso;
- correção;
- anonimização, bloqueio ou eliminação quando aplicável;
- portabilidade conforme regulamentação e contrato;
- informação sobre compartilhamentos e consentimento;
- revogação e oposição;
- revisão de decisão automatizada quando vier a existir.

Antes de responder, o sistema determina o controlador responsável e impede que um tenant acesse solicitações de outro. Exportações usam formato seguro, expiram, têm acesso auditado e não incluem dados de terceiros. Exceções legais e prazos de resposta são definidos por jurídico.

## Ciclo de vida

1. **Coleta:** finalidade e minimização aprovadas; validação no ponto de entrada.
2. **Uso:** autorização por papel, tenant e unidade; consulta necessária à tarefa.
3. **Compartilhamento:** contrato, finalidade, campos mínimos, segurança e registro.
4. **Armazenamento:** criptografia, segregação lógica, backup e integridade.
5. **Retenção:** prazo por finalidade e obrigação; bloqueio quando necessário.
6. **Anonimização ou eliminação:** processo verificável em dados ativos, derivados e filas.
7. **Backup:** expiração alinhada; restauração não reativa dado já eliminado sem reconciliação.

## Matriz de retenção a aprovar

Nenhum prazo definitivo é inventado nesta etapa. Antes da produção, cada linha abaixo terá prazo, gatilho, fundamento, owner e método de descarte aprovados.

| Conjunto | Gatilho | Critério para prazo | Destino final |
|---|---|---|---|
| conta de usuário | encerramento/revogação | obrigação contratual, segurança e defesa | eliminar ou anonimizar campos elegíveis |
| clientes do tenant | término da relação/finalidade | instrução do controlador e obrigações aplicáveis | exportar, eliminar ou anonimizar |
| pedidos/comandas/caixa | encerramento da operação | obrigação fiscal/contábil aplicável ao tenant | retenção legal e descarte seguro |
| consentimentos/avisos | revogação ou nova versão | prova da escolha e prescrição aplicável | retenção mínima da evidência |
| auditoria de segurança | data do evento | risco, investigação e obrigação | expiração controlada e verificável |
| logs/traces | coleta | necessidade operacional e segurança | janela curta e agregação quando possível |
| backups | criação | RPO/RTO, contrato e risco | expiração criptográfica/física controlada |
| leads de notificação | envio/falha | finalidade da comunicação e opt-out | eliminar ou agregar |

## Multi-tenancy e acesso

O `tenant_id` participa do modelo e de toda consulta aplicável, mas não é credencial. Contexto autenticado, RBAC/policies, constraints, cache namespaced, storage paths e jobs reforçam o isolamento. Exportação, anonimização, backup e suporte preservam o limite entre tenants.

Acesso operacional a conteúdo é excepcional, temporário, justificado, aprovado e auditado. Métricas agregadas entre tenants somente são admitidas quando finalidade, contrato e anonimização/redução de risco forem aprovados.

## Compartilhamento e suboperadores

Antes de provider ou serviço cloud receber dado, registrar necessidade, categorias, região, medidas, retenção, subcontratação, exclusão, incidente e mecanismo de transferência internacional. Contratos devem refletir instruções do controlador e cooperação com direitos/incidentes.

Providers fake recebem apenas dados sintéticos. Integrações futuras com SES, SNS, SQS, S3 ou outros serviços AWS passam por inventário e avaliação antes do uso.

## Anonimização, pseudonimização e ambiente não produtivo

Pseudonimização reduz exposição, mas dado reversível continua pessoal. Anonimização exige avaliação de reidentificação considerando dados auxiliares e atualizações. Hash isolado de e-mail/telefone pode ser reidentificável e não prova anonimização.

Local, CI, development, homologation e staging usam dados sintéticos. Cópia bruta de produção é proibida. Exceção depende de autorização jurídica e de segurança, minimização, transformação validada, acesso restrito e eliminação programada.

## Backups, restauração e eliminação

Backups são criptografados, segregados por ambiente, monitorados e periodicamente restaurados em ambiente controlado. A restauração mantém tenant e controles de acesso. Pedidos de eliminação são registrados também em um ledger mínimo de supressão, quando necessário, para que uma restauração não reintroduza o tratamento. O ledger não deve recriar o dado eliminado.

## Auditoria e observabilidade

Operações críticas registram quem, quando, tenant, ação, alvo não sensível, resultado e correlação. Os eventos não armazenam corpo integral, segredo nem dado pessoal desnecessário. Acesso à auditoria é restrito; retenção e integridade são formais. Dashboards usam agregação e labels de baixa cardinalidade, evitando nomes, e-mails, IDs de cliente e payloads.

## Incidentes de dados pessoais

Qualquer suspeita de acesso cross-tenant, exfiltração, perda, alteração indevida ou indisponibilidade relevante inicia triagem. O processo preserva evidências, contém o evento, identifica dados/titulares/tenants, avalia risco, envolve encarregado/jurídico e documenta decisão de comunicar controlador, ANPD e titulares nos termos aplicáveis.

Comunicação não é automatizada sem validação da autoridade responsável. O pós-incidente atualiza threat model, controles, testes, runbooks e registro de tratamento.

## Privacy gate

Uma mudança com dados pessoais somente avança se possuir finalidade, base legal proposta, owner, campos mínimos, classificação, acesso, retenção, compartilhamentos, direitos, auditoria e testes definidos. Dado sensível, biometria, decisão automatizada, monitoramento sistemático ou grande escala podem exigir RIPD antes da implementação.
