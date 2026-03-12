# Paystack Integration

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Document how Paystack is used in Vayva for:
- payments (orders)
- subscriptions (plans)
- webhooks

## Credentials
From `.env.example`:
- `PAYSTACK_SECRET_KEY` (server)
- `NEXT_PUBLIC_PAYSTACK_KEY` (client)

Never commit real keys.

## Environments
- Test keys for staging/dev
- Live keys for production

## Webhooks
### Signature verification
- Paystack signs requests with `x-paystack-signature`.
- The backend must verify the signature before trusting payloads.

### Callback URLs
Document the real production webhook URL(s) used in Vercel.

## Common failure modes
- **Webhook not firing**: incorrect URL, not publicly accessible
- **Signature mismatch**: body parsing changed raw payload
- **Payment verified but order not updated**: queue backlog or worker down

## Verification checklist
- Confirm `PAYSTACK_SECRET_KEY` is set in the correct environment.
- Trigger a test transaction.
- Confirm webhook receipt in logs.
- Confirm DB records updated.
