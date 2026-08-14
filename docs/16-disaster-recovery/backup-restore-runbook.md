# Runbook de backup e restore

Este runbook é documental. Não executa comandos nem provisiona AWS.

## Papéis

- Incident Commander: autoriza declaração/encerramento e coordena comunicação.
- Database Owner: seleciona ponto, restaura e valida MySQL.
- DevOps: infraestrutura, secrets, containers, Redis/storage e tráfego.
- Security: contenção, cadeia de custódia e integridade quando houver incidente.
- Data/QA: reconciliação, amostras tenant-aware e aceite técnico.
- Product/Support: impacto, comunicação e prioridades de tenants.

## Preparação

1. confirmar incidente, escopo, último instante confiável e RPO alvo;
2. congelar mutações/rotas necessárias e preservar evidências;
3. registrar versão de aplicação, schema, configurações e fila/outbox;
4. validar disponibilidade, checksum, criptografia e autorização do backup;
5. criar ambiente isolado de restore, nunca sobrescrever origem sem decisão formal.

## Restore

1. restaurar MySQL no ponto selecionado e aplicar logs até o instante seguro;
2. validar migrations/schema e constraints;
3. executar verificações de contagem, checksums, referências e amostras por tenant;
4. restaurar objetos e comparar checksums/metadata;
5. reconstruir cache; reconciliar filas com outbox/estado durável;
6. iniciar aplicações sem tráfego, verificar health/readiness e smoke tests;
7. verificar idempotência, itens de outbox, jobs ambíguos e webhooks pendentes;
8. liberar tráfego gradualmente, observar SLI e registrar o instante de recuperação.

## Validação obrigatória

- nenhum recurso de tenant A aparece em amostra de tenant B;
- totais de assinatura, pedidos/contas, cobranças fake e outbox reconciliam;
- sessões/secrets comprometidos estão revogados;
- objetos apontados existem e seus checksums conferem;
- RPO e RTO medidos são registrados, não presumidos.

## Pós-incidente

Documentar perda efetiva, linha do tempo, causa, decisões, comunicação, gaps e ações com owner/prazo. Backups usados permanecem protegidos pelo período de investigação; dados temporários do teste são eliminados com evidência.
