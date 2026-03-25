# Webhooks Security & Verification (Runbook)

> **Audience:** Engineering + Ops  
> **Goal:** Define how inbound webhooks are authenticated, verified, and made idempotent across Vayva.

---

## Why this matters

Webhooks are **untrusted inbound traffic**. Every webhook handler must implement:

- **Authentication/verification** (signature, secret, or allowlist)
- **Idempotency** (avoid double-processing when providers retry)
- **Replay protection** (timestamp + nonce where possible)
- **Safe failure** (log, alert, and never partially apply state)

---

## Inbound webhook inventory (current)

| Provider | Endpoint (code) | Verification method | Notes |
|---|---|---|---|
| **Paystack** | `Backend/core-api/src/app/api/webhooks/paystack/route.ts` | Paystack signature verification (HMAC) | Must be idempotent by event/reference. |
| **Kwik Delivery** | `Backend/core-api/src/app/api/webhooks/delivery/kwik/route.ts` | `x-kwik-signature` HMAC | Map provider statuses to internal shipment lifecycle. |
| **Evolution API (WhatsApp)** | `Backend/core-api/src/app/api/whatsapp/webhook/route.ts` | **No signature verification (currently)** | **Risk:** endpoint should be treated as public; add verification/allowlist. |
| **Stripe** | `Backend/core-api/src/app/api/webhooks/stripe/route.ts` | Stripe signature (`STRIPE_WEBHOOK_SECRET`) | Document event types and idempotency keys. |
| **Shopify** | `Backend/core-api/src/app/api/webhooks/shopify/route.ts` | Shopify HMAC (`SHOPIFY_WEBHOOK_SECRET`) | Topic routing + store mapping. |

---

## Idempotency standard (Vayva)

### Rule

For every webhook handler, pick a **single unique idempotency key** from the provider payload and enforce **exactly-once side effects**.

Examples:
- Paystack: `event + data.reference` (or Paystack `event.id` if present)
- Stripe: `event.id`
- Shopify: `X-Shopify-Webhook-Id` (or payload id)
- Kwik: job/task id + status timestamp
- Evolution: message key id (`data.key.id`)

### What to store

Persist a “processed events” record (or reuse an existing table) with:
- `provider`
- `eventId` (idempotency key)
- `receivedAt`
- `payloadHash` (optional)
- `status` (processed/ignored/failed)

---

## Evolution API (WhatsApp) — current posture

Vayva **hosts Evolution API on our VPS**. Merchants “connect WhatsApp” by scanning a QR code / pairing code, and Evolution emits inbound events.

**Current code path:**

Evolution → `Frontend/merchant` proxy → Core API:
- Doc: `docs/08_reference/integrations/whatsapp-evolution-api.md`
- Proxy route: `Frontend/merchant/src/app/api/whatsapp/webhook/route.ts`
- Core ingress: `Backend/core-api/src/app/api/whatsapp/webhook/route.ts`

**Important:** The Core ingress currently does **not** verify a signature/secret. At minimum, enforce:
- **Shared secret** (header) between proxy and core-api, or
- **Network allowlist** (only accept from VPS IP / internal network), and
- **Idempotency** by message id.

### What the handler uses as identity

The handler extracts:
- `instanceName` from `rawBody.instance || rawBody.instanceName`
- `storeId` by requiring `instanceName` to start with `merchant_` and slicing the remainder

It then enqueues to `QUEUES.WHATSAPP_INBOUND` with an enriched payload including extracted `textContent` and `mediaType`.

---

## Logging & alerts

Minimum log fields for every inbound webhook:
- provider, handler route, requestId
- idempotency key
- verification result (pass/fail)
- side-effects summary (order updated, wallet credited, shipment updated)

Alert on:
- repeated verification failures
- spikes in webhook volume
- repeated processing failures (DLQ growth if queued)

