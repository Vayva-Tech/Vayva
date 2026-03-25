# Shopify Integration (Reference)

> **Audience:** Engineering + Ops  
> **Scope:** Webhook handling + verification + data mapping.

---

## Code entrypoints

- Webhook handler: `Backend/core-api/src/app/api/webhooks/shopify/route.ts`
- Signature helper: `Backend/core-api/src/lib/webhooks/signature.ts`

---

## Environment variables

- `SHOPIFY_WEBHOOK_SECRET` (required for HMAC verification)

---

## Headers used

The webhook handler uses these Shopify headers:

- `X-Shopify-Hmac-Sha256` (signature)
- `X-Shopify-Topic` (topic routing)
- `X-Shopify-Shop-Domain` (shop origin)

---

## Topics (implemented)

The webhook handler currently routes:

### Orders
- `orders/create` → upsert `Order` using `externalId = shopify_<order.id>`
- `orders/updated` → update existing `Order`
- `orders/cancelled` → mark cancelled
- `orders/delete` → delete handler (as implemented in code)

### Products
- `products/create`
- `products/update`
- `products/delete`

### Customers
- `customers/create`
- `customers/update`

### Fulfillments
- `fulfillments/create`

**Merchant/store mapping:** the handler attempts to extract `merchantId` from:
- `order.merchant_id`, or
- an order tag like `merchant_id:<id>`

---

## Idempotency

Shopify retries webhook delivery. Prefer `X-Shopify-Webhook-Id` (if present) as the idempotency key; otherwise use `topic + payload.id`.

**Current implementation note:** the handler relies on `upsert` (for create) and direct updates (for updates) rather than a dedicated processed-events table.

