# ADR-0008 — API fictícia de emissão de notas

- **Status:** Aceito
- **Data:** 2026-06-23
- **Decisão:** Módulo/adaptador fake no monólito modular

## Contexto

O MVP do **Mr Coti** precisa simular emissão, autorização, rejeição, cancelamento, consulta, download de XML/PDF fake e webhooks, incluindo indisponibilidade. O produto não implementará emissão fiscal real nesta fase.

O objetivo é validar contratos, estados e resiliência sem incorporar regras fiscais reais, credenciais governamentais ou um microsserviço prematuro.

## Drivers

- cumprir o fluxo MVP sem representar validade fiscal;
- API First, idempotência e webhooks testáveis;
- cenários determinísticos: autorizada, rejeitada e indisponível;
- separação entre fechamento de negócio e emissão externa;
- troca futura por emissor real via porta/adaptador;
- armazenamento e download tenant-aware de artefatos fake;
- baixo custo operacional do monólito modular.

## Opções consideradas

| Opção | Vantagens | Desvantagens |
|---|---|---|
| Módulo/adaptador fake no monólito | Fluxo completo, simples e testável | Não reproduz legislação/provider real; compartilha release |
| Microsserviço fiscal fake | Isolamento e deploy próprios | Complexidade proibida/prematura e contrato ainda imaturo |
| Mocks somente em testes | Baixo esforço | Não valida API, downloads, webhooks e indisponibilidade ponta a ponta |
| Emissor fiscal real no MVP | Realismo | Fora do escopo, alto risco fiscal, de secrets e operação |

## Decisão

Implementar futuramente a API REST fictícia de notas como **módulo e adaptador dentro do backend monolítico do Mr Coti**, sem processo, repositório ou banco separado.

Uma porta `InvoiceIssuer` conceitual isola os contextos consumidores. Solicitações são tenant-aware, idempotentes e mantêm snapshot mínimo necessário. O módulo modela estados pendente, autorizada, rejeitada, cancelada e indisponível/retriável. Rejeição é resultado de negócio; indisponibilidade usa retry com backoff.

XML e PDF são artefatos claramente marcados como fake e sem validade fiscal. Downloads exigem tenant/RBAC e não expõem caminho interno. O armazenamento passa por porta para permitir filesystem apenas em desenvolvimento controlado e S3 futuro sem alterar o domínio. Webhooks são assinados no contrato fake, deduplicados e processados assincronamente por outbox/BullMQ quando aplicável.

Nenhuma integração com autoridade fiscal, certificado real ou regra tributária real está autorizada por este ADR.

## Consequências

### Positivas

- emissão, rejeição, cancelamento e downloads são testáveis ponta a ponta;
- indisponibilidade e webhooks entram no desenho desde o início;
- integração fiscal real futura fica atrás de porta estável;
- não há custo de operar serviço adicional;
- o produto evita alegar validade fiscal inexistente.

### Negativas

- fake não valida schemas, regras e tempos de um emissor real;
- artefatos exigem retenção e controle de acesso mesmo sendo fictícios;
- regras futuras podem alterar significativamente o contrato normalizado;
- configuração de cenários precisa ser protegida por ambiente.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Documento fake confundido com fiscal | Marca d'água/texto explícito, metadados e nenhuma credencial real |
| Emissão duplicada | Idempotency key e restrição única por tenant/referência |
| Artefato de outro tenant | Namespace, autorização no download e testes negativos |
| Retry infinito na indisponibilidade | Limite, backoff e estado de intervenção |
| Webhook duplicado/fora de ordem | Event ID, deduplicação e máquina de estados |
| Acoplamento ao fake | Porta normalizada e testes de contrato de adaptador |
| Evolução silenciosa para fiscal real | Novo ADR, análise legal/fiscal, segurança e plano operacional |

## Gatilhos de revisão

- escolha de emissor fiscal real ou início de emissão com validade;
- entrada de certificados, secrets fiscais ou dados regulados;
- legislação/localidades exigirem modelos distintos por tenant/unidade;
- artefatos demandarem retenção legal, assinatura ou armazenamento especializado;
- volume exigir escala independente após otimização dos workers;
- contrato real não puder ser representado pela porta sem perda de semântica.
