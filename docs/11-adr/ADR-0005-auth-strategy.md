# ADR-0005 — Estratégia de autenticação

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** JWT de curta duração + refresh token rotativo

## Contexto

O **Mr Coti** expõe uma API para frontend web e integrações futuras, com múltiplos tenants, RBAC e rotas sensíveis. A autenticação precisa limitar o impacto de roubo de token, permitir revogação de sessão, impedir reutilização de refresh token e propagar um contexto de tenant confiável.

Autenticação não basta: toda operação também exige autorização e isolamento contra IDOR.

## Drivers

- baixo tempo de validade de credenciais expostas;
- renovação segura sem exigir login frequente;
- revogação por sessão, usuário e tenant;
- detecção de replay de refresh token;
- compatibilidade com frontend Next.js e API NestJS;
- contexto multi-tenant explícito;
- auditabilidade, rate limiting e brute-force protection;
- portabilidade entre Docker e AWS.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| JWT curto + refresh rotativo | API stateless no caminho comum e sessões revogáveis | Fluxo de rotação/replay exige estado e cuidado no cliente |
| JWT de longa duração sem refresh | Simples | Janela de abuso grande e revogação difícil |
| Sessão opaca em toda requisição | Revogação direta e claims sempre atuais | Consulta central em todo acesso e maior dependência do store de sessão |

## Decisão

Emitir **access token JWT assinado e de curta duração** e **refresh token opaco, aleatório, de uso único e com rotação**. A duração exata será configurada por ambiente segundo política de segurança; não será codificada no domínio.

O JWT contém somente claims mínimas: emissor/audiência, usuário, tenant ativo, sessão, `jti`, emissão e expiração. Não contém dados pessoais nem uma lista extensa de permissões. Tenant ativo e associação do usuário são validados no login/refresh; autorizações sensíveis podem validar estado atual/cacheado para que suspensão e mudanças críticas tenham efeito rápido.

O servidor armazena apenas o digest do refresh token, família, sessão, usuário, tenant, expiração, estado e metadados seguros. Cada refresh invalida o token anterior e emite outro da mesma família. Reutilização de um token já rotacionado revoga a família inteira e gera evento de segurança. Logout revoga a sessão; suspensão pode revogar todas as sessões do tenant.

No cliente web, refresh token deve usar cookie `HttpOnly`, `Secure` em ambientes HTTPS e política `SameSite` apropriada. O access token deve evitar persistência insegura e ser enviado somente ao destino previsto. Endpoints baseados em cookie recebem proteção contra CSRF compatível com sua política. Secrets/chaves de assinatura ficam em gestão segura e têm rotação planejada.

## Consequências

### Positivas

- tokens de acesso roubados expiram rapidamente;
- refresh tokens permitem sessão utilizável e revogável;
- replay é detectável por família;
- APIs podem validar a maior parte das requisições sem sessão de servidor completa;
- tenant ativo fica explícito e assinado.

### Negativas

- rotação concorrente entre abas/dispositivos exige protocolo cuidadoso;
- armazenamento e limpeza de sessões são necessários;
- revogação imediata do JWT pode exigir verificação adicional ou denylist curta;
- cookies introduzem considerações de CSRF.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Roubo de access token | TTL curto, TLS, audience/issuer e não persistir em storage inseguro |
| Roubo/replay de refresh | Digest no servidor, rotação unitária e revogação da família |
| Corrida no refresh | Atualização atômica, tolerância definida e cliente serializando renovação |
| Tenant adulterado | Claim assinada e validação da membership; não confiar em header/body isolado |
| Permissão obsoleta | Access token curto e validação atual em operações críticas |
| Brute force/credential stuffing | Rate limiting, atrasos controlados, auditoria e respostas não enumeráveis |
| Chave comprometida | Secrets Manager futuro, rotação, versionamento de chave e runbook |

## Gatilhos de revisão

- adoção de identidade corporativa/federação ou SSO;
- exigência de MFA ou autenticação de parceiros com perfil distinto;
- novos clientes além do navegador exigirem estratégia de credencial própria;
- incidentes mostrarem que TTL/revogação atuais são inadequados;
- requisitos regulatórios exigirem sessão totalmente stateful ou prova adicional;
- escala do store de sessões/revogação não atender SLOs após otimização.
