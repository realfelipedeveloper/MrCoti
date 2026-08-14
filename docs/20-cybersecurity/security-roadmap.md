# Roadmap de cybersecurity

Cybersecurity é requisito de primeira classe no Mr Coti. Mesmo sendo um projeto de
portfólio local-first, nenhum fluxo implementado deve nascer sem controles de
segurança proporcionais ao risco.

## Níveis

| Nível | Escopo | Objetivo |
| --- | --- | --- |
| Nível 1 — MVP local de portfólio | aplicação local, dados sintéticos, providers fake | segurança real nos fluxos implementados |
| Nível 2 — SaaS comercial inicial | ambiente homolog/staging/produção inicial | hardening, automação, monitoramento e revisão jurídica |
| Nível 3 — SaaS maduro/produção crítica | operação comercial com clientes reais | controles empresariais, auditorias e maturidade operacional |

## Obrigatório desde o MVP local

- autenticação segura;
- autorização, RBAC/policies e deny-by-default;
- proteção contra IDOR/cross-tenant;
- validação de entrada e erro seguro;
- rate limiting em login, APIs fake, webhooks, notificações e endpoints sensíveis;
- auditoria de ações críticas;
- logs seguros;
- dependency audit;
- SAST básico, secret scanning e verificação de `.env`;
- webhooks com assinatura, timestamp, replay protection, idempotência e redelivery
  finito.

## Roadmap obrigatório antes de produção comercial

WAF real, SIEM/SOC, pentest externo formal, bug bounty, ISO/SOC2 quando fizer
sentido, KMS/cloud secret manager real, GuardDuty/Security Hub ou equivalentes, DAST
pesado, MFA empresarial, SSO, segregação física avançada de tenants e legal review
completo.

## Referências de maturidade

- OWASP ASVS para requisitos verificáveis de aplicação.
- NIST SSDF para práticas de desenvolvimento seguro.
- OWASP SAMM para maturidade de segurança de software.
- SLSA para supply chain, provenance e integridade de build.
