# Governança de aprovações — Mr Coti

## Objetivo

O Mr Coti é conduzido inicialmente por um único responsável técnico, atuando como
Founder, Product Owner e Software Architect. Portanto, as aprovações formais da
fundação não dependem obrigatoriamente de equipes distintas; dependem de validação
consciente, explícita e registrada de cada papel de governança exercido.

Enquanto o projeto estiver nessa fase solo, a mesma pessoa pode assinar múltiplos
papéis, desde que cada decisão seja registrada separadamente, com escopo, versão,
justificativa e pendências. Quando novos membros entrarem na equipe, as futuras
revisões devem migrar gradualmente para os responsáveis de cada área, sem exigir
reestruturação documental.

Silêncio, ausência de discordância ou criação do documento não equivalem a aprovação.

## Modelo de aprovação

Cada aprovação deve registrar:

- papel exercido;
- responsável;
- data;
- versão dos artefatos;
- decisão;
- justificativa;
- pendências;
- próxima revisão prevista.

As decisões válidas são:

- `APPROVED`;
- `APPROVED WITH CONDITIONS`;
- `REJECTED`.

## Papéis de governança

### Founder

Responsável por visão do produto, estratégia, roadmap, posicionamento e decisões
comerciais.

### Product Owner

Responsável por regras de negócio, backlog, prioridades, planos, feature flags e
entitlements.

### Software Architect

Responsável por arquitetura, DDD, ADRs, escalabilidade, modularização e AWS
Readiness.

### Security Officer

Responsável por RBAC, OWASP, LGPD, threat model e auditoria.

### Data Governance

Responsável por retenção, anonimização, exportação, backup e governança de dados.

### DevOps Lead

Responsável por Docker, CI/CD, observabilidade, Disaster Recovery e AWS Readiness.

### QA Lead

Responsável por critérios de aceite, rastreabilidade, cobertura de testes e qualidade
documental.

### FinOps

Responsável por custos AWS, billing, projeções e otimização financeira.

## Modelo de registro

```text
Papel:
Responsável:
Versão dos artefatos:
Data:
Decisão: APPROVED | APPROVED WITH CONDITIONS | REJECTED
Justificativa:
Pendências:
Data prevista para revisão:
```

## Gate CHK081

O CHK081 será considerado satisfeito quando todos os papéis obrigatórios da fundação
tiverem uma decisão registrada no `approval-record.md`, ainda que exercidos pela
mesma pessoa.

Para esta fundação documental, os papéis obrigatórios são: Founder, Product Owner,
Software Architect, Security Officer, Data Governance, DevOps Lead, QA Lead e
FinOps.

Decisões `APPROVED WITH CONDITIONS` podem encerrar o CHK081 somente quando as
condições forem explicitamente não bloqueantes para a primeira etapa documental e os
checks específicos permanecerem abertos quando aplicável. Exemplo: antes da evidência
local, uma aprovação condicionada à verificação futura de portas manteria CHK038
aberto; após o snapshot com `refresh` e `taskflow` ativos, esse check foi satisfeito.
