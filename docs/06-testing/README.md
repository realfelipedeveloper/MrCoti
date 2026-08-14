# Qualidade e testes do Mr Coti

Este diretório define como a qualidade do Mr Coti será planejada, comprovada e mantida. Ele não contém testes executáveis nem antecipa a implementação. A estratégia parte dos riscos centrais do produto: isolamento entre tenants, autorização, consistência financeira e operacional, idempotência, integrações assíncronas, feature flags e proteção de dados.

## Documentos

- [Estratégia de testes](./test-strategy.md): pirâmide, tipos de teste, ambientes, dados, Testcontainers, critérios de qualidade e matriz inicial de cenários.

## Princípios

1. A especificação e os contratos aprovados definem o comportamento esperado.
2. O teste mais simples capaz de demonstrar um risco deve ser preferido.
3. Regras de domínio são verificadas majoritariamente sem infraestrutura; persistência, filas e integrações são verificadas com componentes reais e isolados.
4. Todo acesso a dado tenant-aware deve incluir cenários de isolamento positivo e negativo.
5. Operações com efeito financeiro, fiscal ou assíncrono devem demonstrar idempotência, rastreabilidade e recuperação.
6. Nenhuma evidência de teste pode expor segredo ou dado pessoal desnecessário.
7. Falhas intermitentes são defeitos. Quarentena é temporária, tem responsável e prazo, e não transforma falha em sucesso.
8. Testes de acessibilidade, segurança e contrato integram a definição de pronto; não são atividades posteriores.

## Fonte de verdade e rastreabilidade

Cada cenário deve apontar para um requisito, regra de negócio, critério de aceite, risco ou contrato. Mudanças de comportamento começam na especificação e percorrem os loops de contrato, implementação, teste, segurança e revisão. Evidências relevantes são preservadas pelo pipeline conforme a política de retenção de artefatos.

## Critério de pronto de qualidade

Uma entrega somente pode avançar quando:

- critérios de aceite estão cobertos no nível adequado;
- testes obrigatórios passam de forma determinística;
- não existe regressão crítica conhecida nem flakiness sem tratamento;
- contratos, migrações e isolamento de tenant foram verificados quando afetados;
- os resultados de acessibilidade e segurança atendem aos gates aplicáveis;
- evidências e desvios aceitos possuem vínculo rastreável com a mudança.

