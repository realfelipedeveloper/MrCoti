# Roadmap

O roadmap descreve resultados, não datas. A passagem de fase depende de evidência dos gates de qualidade e operação.

## Etapa 1 — Fundação SDD (atual)

Constituição, Spec, Plan, Tasks, Research, Data Model, OpenAPI, UML, ADRs, agentes, loops e estratégias transversais aprovados. **Nenhum código de aplicação.**

## MVP — Operação essencial demonstrável

- Autenticação, tenants, usuários, papéis, permissões e unidades.
- Produtos, categorias, mesas, comandas, pedidos e fechamento.
- Pagamento fake, nota fake e e-mail fake.
- Feature flags, auditoria, outbox e observabilidade mínimas.
- Execução local via Docker Desktop/local Docker e configuração por ambiente quando a
  implementação for autorizada em nova spec.
- Critério de saída: jornada completa de tenant isolado coberta por testes e operável
  em ambiente local/desenvolvimento.
- Interpretação aprovada: o MVP não precisa ser vendável; precisa ser demonstrável,
  tecnicamente sólido e adequado a portfólio. O escopo ativo é dev/local only,
  executado via Docker Desktop/local Docker após aprovação, com AWS-ready preservado
  sem `local-prod`, produção ou AWS real.

## V1 — Controle operacional

- Estoque, fornecedores, compras, caixa e relatórios.
- SMS e WhatsApp fake com fila/retry.
- Critério de saída: reconciliação auditável e testes de carga dos caminhos críticos.
- Interpretação aprovada: provar estoque, caixa, relatórios, jobs e notificações
  fake.

## V2 — Relacionamento e eficiência

- Reservas, CRM, fidelidade, integrações e dashboard operacional.
- Critério de saída: consentimentos LGPD e rollout por tenant/plano comprovados.
- Interpretação aprovada: provar experiência de produto, CRM, reservas, dashboard e
  integrações mais maduras.

## V3 — Plataforma extensível

- BI, IA, marketplaces, SDK de parceiros e portal de desenvolvedores.
- Multi-região e módulos premium por tenant.
- Critério de entrada: escala, economia e requisitos regulatórios justificarem complexidade adicional; qualquer extração para microsserviços exige ADR e métricas.
- Interpretação aprovada: provar visão comercial, marketplace, SDK, portal de
  desenvolvedores, AWS real futura somente se o objetivo comercial voltar a exigir
  cloud real, e módulos premium.
