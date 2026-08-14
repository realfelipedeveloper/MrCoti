# Agentes e Loop Engineering do Mr Coti

Este diretório descreve como agentes especializados colaboram no ciclo Spec-Driven Development do Mr Coti. Agentes produzem análise e evidência; não substituem responsabilidade humana, aprovação autorizada nem a fonte de verdade do projeto.

## Documentos

- [Loops de engenharia](./loops.md): entradas, responsáveis, processo, aprovação, rejeição e saídas dos nove loops.
- [Catálogo de agentes](./roles.md): responsabilidades, limites e RACI resumido dos perfis especializados.

## Agentes participantes

- **Architect Agent:** arquitetura, fronteiras, NFRs e coerência entre decisões.
- **Business Analyst Agent:** problema, regras, critérios de aceite, roadmap e linguagem do domínio.
- **Backend NestJS Agent:** aplicação backend futura, APIs internas e casos de uso.
- **Frontend NextJS Agent:** experiência web futura, acessibilidade e integração com contratos.
- **Database Agent:** modelo, Prisma, MySQL, migrations, isolamento e desempenho de dados.
- **Integration Agent:** APIs fictícias, webhooks, filas, idempotência e providers.
- **QA Agent:** estratégia, cenários, automação, evidências e parecer de qualidade.
- **Security Agent:** threat model, controles, LGPD técnica e risco residual.
- **DevOps Agent:** CI/CD, ambientes, containers, release e operação.
- **Code Review Agent:** revisão independente, rastreabilidade e consolidação de achados.

O detalhamento normativo de responsabilidades permanece no `AGENTS.md` da raiz. Este diretório regula a colaboração por loops.

## Princípios de colaboração

1. A Spec aprovada é fonte de verdade do comportamento.
2. Artefatos derivados não podem contradizer a Spec; divergência retorna ao loop de origem.
3. Um agente é dono da coordenação de cada loop, mas especialistas aprovam seus próprios domínios.
4. Mudanças de alto risco exigem revisão independente e separação entre autoria e aprovação.
5. Aprovação precisa de evidência; silêncio, ausência de teste ou timeout de revisão não aprovam.
6. Rejeição é resultado técnico normal e deve ser acionável, rastreável e respeitosa.
7. Nenhum loop posterior corrige informalmente um artefato anterior; ele devolve o trabalho ao loop apropriado.
8. Decisões relevantes fora da stack aprovada ou com trade-off duradouro exigem ADR.

## Estado e handoff

Cada execução de loop registra:

- item/spec e versão analisados;
- entrada e pré-condições;
- agente coordenador, participantes e aprovadores;
- decisões, evidências, riscos e pendências;
- estado: `draft`, `in-review`, `approved`, `rejected` ou `superseded`;
- saída e próximos loops autorizados.

Somente `approved` autoriza o handoff. `Rejected` contém motivo, severidade, referência, responsável pela correção e loop de retorno. `Superseded` preserva histórico e aponta para a nova versão.

## Escalonamento

Conflito de requisito retorna ao Business Analyst e Product owner. Conflito técnico sem resposta na documentação vai ao Architect e, se duradouro, a ADR. Risco de segurança/LGPD não pode ser aceito pelo autor do controle; requer Security e autoridade de negócio/jurídica conforme impacto. Exceção operacional requer DevOps, owner e prazo.

## Regra desta primeira etapa

O Implementation Loop permanece apenas documentado e inativo até que Spec, arquitetura, modelo, contratos, tarefas, checklists e decisões necessárias estejam consistentes e aprovados. Nenhum agente está autorizado por estes documentos a instalar, implementar, migrar, provisionar, fazer deploy, commit ou push.
