# OWASP ASVS — mapeamento inicial

| Área ASVS | Aplicação no Mr Coti |
| --- | --- |
| V1 Arquitetura | SDD, ADRs, threat model e boundaries tenant-aware |
| V2 Autenticação | hash forte, sessão/token curto, revogação e brute force protection |
| V3 Sessão | rotação, expiração, logout seguro e token fora de logs |
| V4 Controle de acesso | RBAC/policies, deny-by-default e testes IDOR |
| V5 Validação | DTO allowlist, limites e erros seguros |
| V7 Erros/logs | auditoria crítica e logs sem segredos/PII desnecessária |
| V8 Dados | minimização, retenção, exportação e anonimização |
| V10 Código malicioso | dependency audit, SAST e supply chain |
| V13 APIs | OpenAPI, idempotência, rate limit e webhooks seguros |

O nível-alvo inicial é uma seleção proporcional ao MVP local; produção comercial
exige revisão formal da cobertura.
