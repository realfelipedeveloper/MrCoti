# Estratégia de webhooks

## Envelope

Cada evento contém `id`, `type`, `version`, `occurredAt`, `tenantId`, `correlationId` e `data`. O payload é imutável por `id`; novas formas usam nova versão.

## Autenticidade

O envio inclui `X-MrCoti-Event-Id`, `X-MrCoti-Timestamp` e `X-MrCoti-Signature`. A assinatura será HMAC do timestamp + corpo bruto com segredo por endpoint. Rotação aceita segredo atual/anterior por janela curta. Segredos nunca são retornados integralmente após criação.

## Entrega

- Persistir intenção e payload antes do envio.
- Timeout curto e retries exponenciais com jitter.
- `2xx` confirma; demais respostas e falhas de rede geram retry.
- Após máximo de tentativas, marcar dead-letter e permitir replay autorizado.
- Desabilitar endpoint após falhas prolongadas conforme policy e alertar o proprietário.

## Recebimento

Validar assinatura e tolerância de relógio antes do parse de negócio, deduplicar por event ID, persistir recebimento e responder rápido. Processamento ocorre por fila. Replay não repete efeito.

## Privacidade

Eventos carregam apenas campos necessários à integração. Logs registram hashes/IDs e resultado, nunca segredo ou conteúdo pessoal completo.
