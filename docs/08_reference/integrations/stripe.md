# Stripe Integration (Reference)

> **Audience:** Engineering + Ops  
> **Scope:** Webhook handling + required configuration.

---

## Code entrypoint

- Webhook handler: `Backend/core-api/src/app/api/webhooks/stripe/route.ts`

---

## Environment variables

- `STRIPE_WEBHOOK_SECRET` (required for webhook signature verification)

---

## Events (implemented)

The webhook handler currently processes:

- `payment_intent.succeeded`
  - If `paymentIntent.metadata.merchantId` is present, we update the merchant record and create a payment record.
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
  - Finds merchant by `stripeCustomerId` and updates plan tier + subscription status/period end.
- `invoice.payment_failed`
  - Marks merchant as `PAST_DUE` and creates an in-app notification.

---

## Idempotency

Stripe retries webhook delivery. Use `event.id` as the idempotency key and ensure side effects are exactly-once.

**Current implementation note:** the route processes events directly without an explicit “processed events” ledger, so add idempotency persistence if you observe duplicates in production.

