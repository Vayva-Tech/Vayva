# Kwik Integration (Delivery)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Kwik provides delivery quoting and delivery scheduling.

## Credentials
From `.env.example`:
- `KWIK_BASE_URL`
- `KWIK_EMAIL`
- `KWIK_PASSWORD`
- `KWIK_DOMAIN_NAME`

## Typical flow
1. Merchant configures pickup/delivery settings.
2. Checkout requests a shipping quote.
3. After payment, a delivery can be scheduled.

## Webhooks
If Kwik webhooks are used:
- Validate signature if provided.
- Ensure idempotency.

## Common failure modes
- Quote fails: wrong credentials/base URL
- Deliveries not scheduled: worker down/backlog

## Verification
- Use staging Kwik environment first.
- Ensure logs show successful quote/schedule requests.
