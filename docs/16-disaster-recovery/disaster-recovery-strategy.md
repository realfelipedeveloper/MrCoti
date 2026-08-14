# Estratégia de Disaster Recovery

## Objetivo

Recuperar o Mr Coti com integridade, isolamento por tenant e evidência auditável. DR não substitui alta disponibilidade; backup não é válido até ser restaurado e verificado.

## Cenários e resposta

| Cenário | Impacto | Resposta planejada | Fonte de recuperação |
| --- | --- | --- | --- |
| container/API/worker perdido | instância indisponível | substituir imagem imutável, drenar/reprocessar com idempotência | registry/configuração declarativa |
| Redis perdido | cache/filas/rate limit indisponíveis | fail-safe por risco, reconstruir cache, restaurar/reconciliar jobs a partir de estado durável/outbox | MySQL/outbox; Redis não é fonte de negócio |
| MySQL corrompido/perdido | indisponibilidade e risco de perda | isolar escrita, escolher restore point, restaurar, aplicar logs, validar integridade/tenancy | backup criptografado + PITR futuro |
| storage perdido | imagens/relatórios/artefatos fake ausentes | restaurar versão/replicação, verificar checksums e referências | backup/versionamento de objetos |
| deploy/configuração defeituosa | erro sistêmico | rollback de artefato/config, preservar migrations compatíveis | imagem anterior e config versionada |
| zona AWS indisponível | capacidade parcial | redistribuir containers e usar serviços Multi-AZ futuros | ECS/EKS, RDS/ElastiCache Multi-AZ |
| região AWS indisponível | indisponibilidade regional | declarar desastre, recuperar em região definida conforme runbook e RPO/RTO | cópias cross-region futuras |
| credencial/secret comprometido | acesso indevido | revogar/rotacionar, conter, investigar e recuperar somente de fonte confiável | Secrets Manager futuro e backups verificados |

## Princípios

- ordem de restauração: identidade/configuração → banco → storage → filas/cache → aplicações → tráfego;
- não liberar escrita antes de validar schema, integridade, outbox e isolamento;
- replay preserva IDs e não duplica pagamento/nota/notificação fake;
- toda decisão registra incident commander, timestamps, evidências e comunicação;
- backups são criptografados, segregados da conta/credencial primária e testados.

## Frequência proposta

- restore automatizado de amostra em ambiente isolado: mensal;
- tabletop de perda de banco/Redis: trimestral;
- simulado técnico completo de DR: semestral antes de produção madura;
- teste regional futuro: anual ou após mudança material.

Frequências e metas foram aprovadas com condições como objetivos demonstrativos. Metas
contratuais de produção e orçamento operacional exigem revisão futura antes de
produção comercial.
