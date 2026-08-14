# ADR-0002 — Monorepo ou múltiplos repositórios

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** Monorepo

## Contexto

O **Mr Coti** terá frontend Next.js, backend NestJS, contratos OpenAPI, testes, documentação e infraestrutura correlacionados. No estágio greenfield, mudanças de contrato frequentemente afetam vários desses artefatos e precisam passar juntas pelo mesmo quality gate.

Não há, neste momento, equipes independentes nem políticas de acesso que exijam separação física de repositórios.

## Drivers

- alterações atômicas entre API, web, contratos, testes e documentação;
- uma fonte de verdade para versões e padrões de qualidade;
- descoberta e refatoração simples;
- pipeline coerente com lint, testes, build e verificações por área afetada;
- compartilhamento controlado de contratos, sem duplicar domínio;
- suporte ao monólito modular e à equipe inicial.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Monorepo | Mudanças atômicas, padrões únicos, rastreabilidade e refatoração | CI e ownership precisam escalar com o repositório |
| Repositório por aplicação | Autonomia de pipeline e acesso | Drift de contratos, mudanças coordenadas e versionamento adicional |
| Repositório por bounded context | Isolamento físico forte | Simula microsserviços, amplia overhead e dificulta o monólito inicial |

## Decisão

Adotar **monorepo** para aplicações web/API, módulos do backend, contratos, documentação, testes e infraestrutura do Mr Coti. O compartilhamento se limita a contratos, configurações e utilitários genuinamente transversais; entidades de domínio não formam um pacote global.

Cada área possui ownership e dependências explícitas. Pipelines devem executar verificações completas de integração antes de release, ainda que usem seleção por caminhos para feedback rápido. O monorepo não autoriza importações privadas entre módulos.

## Consequências

### Positivas

- um pull request pode atualizar especificação, contrato, consumidores e testes;
- padronização de TypeScript, lint, formatação e Conventional Commits;
- onboarding e navegação mais simples;
- release compatível do monólito e frontend;
- redução de versões intermediárias de pacotes internos.

### Negativas

- pipeline pode ficar lento sem cache e seleção cuidadosa;
- permissões de repositório são menos granulares;
- risco de criar dependências indevidas por proximidade física;
- crescimento exige ownership e governança de paths.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| CI demorado | Jobs paralelos, cache, seleção por área afetada e quality gate integral de release |
| Pacote compartilhado virar depósito | Critérios de compartilhamento e ownership explícito |
| Acoplamento entre módulos | Regras de importação, fachadas públicas e testes de arquitetura futuros |
| Release de tudo por qualquer mudança | Pipelines e imagens por aplicação/processo, mantendo compatibilidade |
| Acesso excessivo | Revisão de ownership e proteção de branches |

## Gatilhos de revisão

- políticas legais ou de segurança exigirem controle de acesso por repositório;
- equipes independentes precisarem de ciclos incompatíveis e o CI/ownership não resolver;
- tamanho e tempo de operações Git/CI permanecerem impeditivos após otimização;
- parte do produto adquirir ciclo de vida e distribuição realmente independentes;
- extração de serviço ser aprovada por ADR e justificar repositório próprio.
