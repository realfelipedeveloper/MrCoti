# Diagramas UML do Mr Coti

Os diagramas PlantUML deste diretório registram as visões arquiteturais do **Mr Coti**. Eles não substituem a especificação nem os ADRs; representam visualmente as decisões vigentes.

| Diagrama | Visão |
|---|---|
| [system-context.puml](./system-context.puml) | Atores, sistema e serviços externos presentes/futuros |
| [container.puml](./container.puml) | Frontend, backend, workers, MySQL, Redis e fronteiras externas |
| [bounded-contexts.puml](./bounded-contexts.puml) | Bounded contexts do monólito modular e dependências principais |
| [tenant-domain.puml](./tenant-domain.puml) | Modelo conceitual SaaS, planos, features e escopos |
| [order-lifecycle.puml](./order-lifecycle.puml) | Máquina de estados de comanda/pedido e integrações de fechamento |
| [integration-sequence.puml](./integration-sequence.puml) | Persistência, outbox, BullMQ e adaptadores fake |
| [deployment-aws.puml](./deployment-aws.puml) | Topologia AWS futura de referência |

## Convenções

- Setas sólidas representam chamadas síncronas; setas tracejadas representam eventos, jobs ou respostas.
- Todos os módulos de negócio pertencem ao mesmo backend implantável; caixas separadas não significam microsserviços.
- APIs de pagamento e nota fake são módulos/adaptadores do monólito.
- Tecnologias complementares não decididas por ADR não aparecem como componentes adotados.

## Validação

Os arquivos devem ser renderizados com uma versão compatível do PlantUML em CI quando a infraestrutura documental for criada. Mudanças de fronteira arquitetural devem atualizar o diagrama afetado e o ADR correspondente na mesma alteração.
