# ADR-0012 — Disaster Recovery

- **Status:** Aceito como estratégia; metas finais pendentes
- **Data:** 2026-06-23
- **Decisão:** DR será orientado por classes de dados, restore testado e RPO/RTO progressivos

## Contexto

MySQL é fonte de verdade, Redis é reconstruível e storage contém artefatos. Docker local deve evoluir para AWS sem refazer domínio, com recuperação de falha de instância, banco, storage, zona e futura região.

## Drivers

- integridade tenant-aware;
- objetivos mensuráveis;
- backups realmente restauráveis;
- idempotência de replay/outbox;
- custo proporcional à fase;
- AWS-ready sem provisionamento agora.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| estratégia progressiva por classe | custo e maturidade alinhados, testável | metas variam por fase |
| backup diário sem exercício | barato | confiança falsa e RPO alto |
| multi-região ativa desde o MVP | RTO baixo | custo/consistência prematuros |

## Decisão

Manter backup criptografado/segregado, PITR futuro para MySQL, versionamento/backup de objetos e reconstrução de Redis. Restore mensal de amostra e exercícios periódicos validam RPO/RTO e isolamento antes de liberar tráfego. Multi-região permanece V3.

## Consequências

### Positivas

- recuperação é procedimento verificável;
- fontes de verdade e reconstruíveis ficam claras;
- metas podem amadurecer sem reescrever domínio.

### Negativas

- testes e cópias custam tempo/infra;
- restore regional inicial pode ser manual;
- metas finais dependem de orçamento.

## Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| backup corrompido | checksum e restore exercitado |
| replay duplicar efeitos | event/idempotency IDs preservados |
| vazamento no ambiente de restore | isolamento, acesso mínimo e eliminação |
| restore cross-tenant | validação automática e amostras negativas |

## Gatilhos de revisão

- primeiro ambiente produtivo;
- SLO contratual/RPO menor;
- adoção multi-região;
- incidente de perda/corrupção;
- mudança de RDS/storage/filas.
