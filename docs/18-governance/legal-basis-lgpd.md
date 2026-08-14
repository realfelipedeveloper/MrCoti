# Bases legais LGPD — matriz proposta

Este documento não é parecer jurídico. Toda base/finalidade é `PENDING LEGAL REVIEW` pelo controlador aplicável; o tenant pode ser controlador dos clientes finais e o Mr Coti operador/suboperador conforme contrato.

| Tratamento | Finalidade | Base sugerida | Condições/evidência |
| --- | --- | --- | --- |
| cadastro do tenant/owner | celebrar e operar SaaS | execução de contrato/procedimentos preliminares | contrato, versionamento de termos, minimização |
| identidade e sessão | autenticação e segurança | execução de contrato; legítimo interesse | LIA quando aplicável, logs mínimos, direitos |
| RBAC/auditoria | prevenir abuso e demonstrar ações | legítimo interesse, obrigação e exercício de direitos | necessidade, acesso restrito, retenção aprovada |
| pedido/conta | atender consumidor e registrar venda | execução de contrato; obrigação legal | dados mínimos e informação ao titular |
| CRM/preferências | relacionamento/personalização | consentimento ou legítimo interesse validado | finalidade separada, opt-out, LIA/consent record |
| marketing/notificação não transacional | comunicação promocional | consentimento quando exigido | opt-in granular, prova e revogação simples |
| notificação transacional | confirmar operação/segurança | execução de contrato/legítimo interesse | conteúdo mínimo e canal adequado |
| relatórios agregados | gestão da operação | legítimo interesse/contrato | agregação, acesso tenant-aware, sem uso incompatível |
| suporte/impersonation | resolver incidente | contrato/legítimo interesse | JIT, motivo, expiração, auditoria e mascaramento |
| backup/DR | continuidade e segurança | legítimo interesse/obrigação | criptografia, segregação e prazo |
| antifraude/segurança | proteger titulares/plataforma | legítimo interesse; obrigação | avaliação de impacto, proporcionalidade, contestação |

## Consentimento

Quando usado, registra titular, finalidade, texto/versão, canal, instante, origem e revogação. Consentimento não é agrupado com execução obrigatória do serviço nem usado quando não puder ser livremente revogado.

## Direitos

Workflow suporta confirmação, acesso, correção, portabilidade quando aplicável, informação, oposição, revogação, anonimização/bloqueio/eliminação e revisão de decisão automatizada futura. Identidade do solicitante é verificada sem coletar dado excessivo.
