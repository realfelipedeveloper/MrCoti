# Visão e escopo do Mr Coti

## Visão

O Mr Coti será o sistema operacional SaaS de operações de alimentação: uma base
segura e extensível que conecta atendimento, cardápio, estoque, caixa,
relacionamento com clientes e integrações sem exigir que cada cliente mantenha
infraestrutura própria.

O Mr Coti nasce como projeto de portfólio local-first, executado inicialmente em
ambiente local individual. Mesmo assim, sua arquitetura deve ser desenhada para
evolução futura como SaaS comercial escalável, sem reescrita estrutural.
No horizonte ativo atual, o produto será executado somente em ambiente dev/local.
Docker Desktop/local Docker será usado para rodar a aplicação local após aprovação da
spec; AWS readiness permanece como prontidão arquitetural. `local-prod`, produção,
deploy real e AWS real não fazem parte desta fase.

## Públicos

- Proprietários e administradores de tenant.
- Gestores de empresa e unidade.
- Operadores de salão, caixa, cozinha e estoque.
- Equipes financeira, comercial e de suporte da plataforma.
- Parceiros de integração e desenvolvedores, em fases futuras.

## Resultados esperados

- Iniciar um tenant e suas unidades com configuração previsível e auditável.
- Processar o ciclo de atendimento sem vazamento de dados entre tenants.
- Permitir expansão por plano, feature flag e módulo premium.
- Integrar pagamentos, documentos fiscais fictícios e notificações de modo resiliente.
- Evoluir de centenas para milhares de tenants sem reescrita estrutural.

## Dentro do horizonte do produto

Core SaaS, operação, cardápio, estoque, financeiro, clientes, reservas, relatórios, integrações externas, BI, IA e marketplace, conforme o roadmap.

## Fora da primeira etapa

- Código de aplicação e scaffolding de frameworks.
- Processamento financeiro ou fiscal real.
- Microsserviços, multi-região ativa e marketplace operacional.
- Billing real; apenas seu modelo, limites e pontos de extensão.
- Promessas contratuais de SLO, orçamento AWS, `local-prod`, produção comercial ou
  tratamento real de dados pessoais de clientes finais.

## Princípios de experiência

- Interface responsiva e adequada ao ritmo operacional.
- Ações críticas confirmáveis, idempotentes quando aplicável e auditáveis.
- Falhas externas não podem ocultar o estado interno nem duplicar efeitos.
- Recursos indisponíveis por plano devem ser explicados, não apenas desaparecer.
