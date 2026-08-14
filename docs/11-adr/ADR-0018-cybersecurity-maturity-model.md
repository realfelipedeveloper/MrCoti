# ADR-0018 — Maturidade progressiva de cybersecurity

- **Status:** Aceito
- **Data:** 2026-06-26

## Contexto

O Mr Coti é um projeto local-first, mas representa uma plataforma SaaS multi-tenant.
Segurança adiada comprometeria o valor técnico do projeto; segurança empresarial
completa antes da primeira implementação criaria operação artificial.

## Decisão

Cybersecurity é requisito de primeira classe. O MVP local deve implementar segurança
real nos fluxos existentes: autenticação, autorização, RBAC/policies,
tenant-isolation, validação de entrada, rate limiting, auditoria, logs seguros,
dependency audit, SAST básico e webhooks seguros.

Controles empresariais dependentes de cloud, produção, equipe, contrato ou fornecedor
externo ficam como roadmap obrigatório antes de produção comercial.

As referências de maturidade são OWASP ASVS, NIST SSDF, OWASP SAMM e SLSA.

## Consequências

- Nenhuma rota sensível nasce temporariamente aberta.
- O escopo funcional pode ser incremental; os controles de segurança dos fluxos
  implementados são obrigatórios.
- O projeto ganha trilha `docs/20-cybersecurity`.
- Produção comercial exige revisão de maturidade e legal/security gates adicionais.

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
| --- | --- |
| Segurança depois do MVP | cria dívida crítica e enfraquece a proposta SaaS |
| Segurança empresarial completa já no local | cria complexidade irreal para portfólio |
| Segurança genérica sem framework | dificulta verificação e comunicação técnica |
