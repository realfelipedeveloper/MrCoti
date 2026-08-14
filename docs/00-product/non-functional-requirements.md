# Requisitos não funcionais

Os alvos abaixo orientam o projeto e serão refinados com dados reais. São objetivos de qualidade (`QT`) que complementam os requisitos canônicos `RNF`/`RSD` da Spec; não os substituem nem substituem SLOs operacionais.

| ID | Atributo | Requisito verificável inicial |
| --- | --- | --- |
| QT-001 | Isolamento | toda leitura/escrita tenant-aware deve aplicar `tenant_id` no servidor; testes negativos comprovam ausência de acesso cruzado |
| QT-002 | Disponibilidade | desenhar APIs síncronas do MVP para SLO mensal de 99,9%, excluídas janelas anunciadas |
| QT-003 | Latência | p95 de comandos operacionais síncronos abaixo de 500 ms sem dependência externa, sob carga de referência documentada |
| QT-004 | Escala | particionamento lógico, índices compostos e arquivamento devem suportar milhões de pedidos, eventos e logs |
| QT-005 | Consistência | transações locais preservam invariantes; publicação assíncrona usa outbox e consumidores idempotentes |
| QT-006 | Segurança | nenhuma rota sensível sem autenticação, autorização contextual e auditoria; cobertura OWASP Top 10 |
| QT-007 | Privacidade | consentimento, exportação e futura anonimização LGPD são rastreáveis por titular e tenant |
| QT-008 | Observabilidade | requisições e jobs propagam `request-id`, `correlation-id` e contexto de tenant sem PII nos logs |
| QT-009 | Recuperação | RPO/RTO por classe de dado e testes periódicos de restauração documentados |
| QT-010 | Portabilidade | execução local em containers e migração para serviços AWS gerenciados sem mudança de domínio |
| QT-011 | Compatibilidade | APIs públicas versionadas e mudanças incompatíveis exigem nova versão e janela de depreciação |
| QT-012 | Acessibilidade | fluxos web do MVP buscam WCAG 2.2 AA e são cobertos por testes automáticos e manuais |

## Orçamentos e limites

Limites de requisição, volume, armazenamento, usuários e unidades pertencem à assinatura do tenant. Enforcement deve ocorrer na aplicação e ser observável; nunca apenas na interface. Números comerciais serão configuráveis e não codificados no domínio.
