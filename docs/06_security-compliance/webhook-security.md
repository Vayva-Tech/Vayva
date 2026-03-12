# Webhook Security

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Ensure incoming webhooks cannot be forged.

## Global rules (applies to every webhook)
- **Authenticate first**: never process webhook side effects unless the request is verified.
- **Idempotency**: webhook handlers must tolerate duplicate deliveries.
- **Do not leak secrets**: never log raw secrets or full auth headers.
- **Prefer timing-safe comparisons** when comparing signatures.
- **Raw body**: some providers require signature verification against the raw payload (before JSON parsing).

## Minimal webhook handler checklist
1. Read headers
2. Read raw body
3. Verify signature/token
4. Parse JSON
5. Validate required fields
6. Apply idempotency check
7. Perform side effects
8. Return 2xx

## Paystack
- Verify signature header `x-paystack-signature`.
- Do not trust request body without signature verification.

### Verification procedure
- Compute HMAC SHA-512 of the raw request body using your Paystack webhook secret.
- Compare the result with the `x-paystack-signature` header.

### Idempotency
- Use Paystack `event` + `data.reference` (or provider event id) to dedupe.
- Store processed event ids in DB (preferred) or Redis.

### Testing
- Trigger a test transaction.
- Confirm webhook logs show:
  - signature verification passed
  - idempotency check did not block first delivery
  - order/subscription updated

## WhatsApp (Meta)
- Verify `x-hub-signature-256` with `WHATSAPP_APP_SECRET`.

### Verification procedure
- Meta sends `x-hub-signature-256: sha256=<hex>`
- Compute HMAC SHA-256 of the raw body using `WHATSAPP_APP_SECRET`
- Compare against the signature value.

### Testing
- Use Meta webhook verify flow to confirm the endpoint is reachable.
- Send a test message event and confirm it is received and logged.

## WhatsApp (Evolution)
- Require API key header (e.g. `apikey` or `Authorization`) matching configured secret.

### Verification procedure
- Accept either:
  - `apikey: <token>`
  - `Authorization: Bearer <token>`
- Compare against your configured `WHATSAPP_WEBHOOK_SECRET`.

### Testing
- Trigger an inbound webhook from Evolution.
- Confirm the handler rejects missing/invalid tokens and accepts valid tokens.

## Kwik
- If Kwik signature is used, verify with timing-safe comparison.

### Testing
- Trigger a staging delivery event.
- Confirm it updates delivery status exactly once (idempotent).

## Logging
- Never log full raw secrets.
- Redact sensitive headers.

Recommended:
- Log a request id + provider + verification result (pass/fail) + dedupe decision.
