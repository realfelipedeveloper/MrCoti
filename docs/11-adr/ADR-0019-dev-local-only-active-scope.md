# ADR-0019 — Escopo ativo dev/local com Docker Desktop e AWS-ready preservado

- **Status:** Aceito
- **Data:** 2026-07-11
- **Refina:** ADR-0017

## Contexto

O Mr Coti continua sendo um projeto de portfólio local-first e SaaS-ready. Após a
revisão do objetivo de portfólio, ficou claro que ambientes `local-prod`, produção
comercial, deploy real e operação em AWS real não trazem retorno proporcional agora.

Ao mesmo tempo, Docker não é apenas prontidão futura: ele faz parte do ambiente local
ativo. A aplicação deve ser executada localmente com Docker Desktop/local Docker após
a aprovação da spec. A distinção necessária é: Docker é runtime local ativo; AWS
readiness permanece como diretriz arquitetural para evolução futura.

## Decisão

O escopo ativo do Mr Coti na spec `002-mvp-local-first-slice` é **dev/local only**.

Isto significa:

- NÃO criar ambiente `local-prod`, staging/homologação ou produção nesta fase;
- NÃO provisionar AWS real, domínio público, deploy real, gateway real, fiscalidade
  real ou billing real;
- NÃO perseguir Legal Review agora, pois dados pessoais reais e produção comercial
  estão fora do escopo ativo;
- manter CHK048 como `PENDING LEGAL REVIEW` apenas como gatilho futuro, caso produção
  ou tratamento real de dados pessoais sejam reabertos;
- usar Docker Desktop/local Docker como runtime ativo do ambiente dev/local após a
  aprovação da spec, com Docker Compose local, portas configuráveis, preflight e
  ausência de segredos reais;
- preservar AWS readiness como diretriz arquitetural: domínio sem acoplamento à AWS,
  configuração externa, boundaries claros, observabilidade planejada, FinOps
  documental e caminho de evolução sem reescrita.

## Consequências

- O próximo passo prático é aprovar ou ajustar a spec 002; não é resolver produção,
  local-prod, jurídico ou orçamento cloud.
- DevOps na fase atual significa ambiente local de desenvolvimento com Docker
  Desktop/local Docker, preflight, Docker Compose local após gate, scripts e
  qualidade operacional local.
- FinOps e AWS continuam como documentação de prontidão, não como custo real.
- SLOs, DR e observabilidade continuam úteis como engenharia responsável, mas não são
  promessa contratual nem gate de release produtivo.
- Qualquer retorno de produção, AWS real, dados pessoais reais ou venda comercial
  exige nova spec/revisão de governança antes de implementação.

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
| --- | --- |
| Tratar Docker apenas como readiness | contradiz a decisão de rodar a aplicação localmente via Docker Desktop |
| Remover AWS readiness | reduz maturidade técnica e aumenta chance de reescrita futura |
| Manter local-prod/produção como meta ativa | adiciona custo e complexidade sem ganho claro para portfólio neste momento |
| Tratar Legal Review como pendência atual | desvia energia para um cenário fora do escopo ativo e sem dados reais |

## Gatilhos de revisão

- decisão de publicar o Mr Coti em domínio público;
- uso de dados pessoais reais;
- integração com provider real de pagamento, fiscal, e-mail, SMS ou WhatsApp;
- provisionamento AWS real ou orçamento cloud;
- entrada de equipe ou objetivo comercial que exija ambientes além de dev/local.
