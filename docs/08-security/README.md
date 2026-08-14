# Segurança e privacidade do Mr Coti

A segurança do Mr Coti é requisito de produto e condição de operação. Este diretório planeja controles para uma plataforma SaaS multi-tenant, com especial atenção a autorização, IDOR, integridade de pedidos e transações, integrações assíncronas, rastreabilidade e LGPD.

## Documentos

- [Estratégia de segurança](./security-strategy.md): princípios, controles, Secure SDLC, gates e resposta a incidentes.
- [Modelo de ameaças](./threat-model.md): ativos, fronteiras de confiança, ameaças STRIDE, abusos e tratamentos.
- [Matriz RBAC](./rbac-matrix.md): baseline de papéis, comandos críticos, escopos e condições.
- [LGPD e governança de dados](./lgpd-data-governance.md): papéis, classificação, ciclo de vida, direitos, retenção e auditabilidade.
- [Cybersecurity progressiva](../20-cybersecurity/security-roadmap.md): trilha
  local-first, SaaS comercial inicial e SaaS maduro/produção crítica.

## Regras invariantes

- negar por padrão e conceder o menor privilégio necessário;
- obter tenant, usuário e escopo de unidade de contexto autenticado confiável;
- aplicar autorização no servidor a toda operação sensível e a todo objeto;
- validar entradas e codificar saídas na fronteira adequada;
- não registrar senhas, tokens, secrets, dados de cartão, documentos completos ou payloads pessoais desnecessários;
- proteger confidencialidade em trânsito e em repouso;
- tornar operação crítica auditável sem transformar auditoria em repositório de dados sensíveis;
- tratar providers fake como fronteiras externas não confiáveis;
- falhar de forma segura e preservar evidências;
- exigir threat model e revisão antes de nova fronteira, dado sensível ou privilégio.

## Governança

O Security Agent mantém estratégia, threat model e parecer técnico. Product/Business define necessidade e finalidade; Architect define fronteiras; os agentes de implementação futura aplicam controles; QA demonstra comportamento; DevOps protege pipeline e runtime; Code Review verifica aderência. Risco residual exige proprietário, compensação, prazo e aceite formal por autoridade de negócio compatível com o impacto.

## Limite desta etapa

Os documentos não configuram autenticação, scanner, WAF, secrets, criptografia, cloud
ou monitoramento. As escolhas de mecanismo e ferramenta dependem de ADR quando
aplicável e dos contratos aprovados. O MVP local deve implementar segurança real nos
fluxos existentes; controles empresariais como WAF real, SIEM/SOC e compliance formal
ficam como gate de produção comercial.
