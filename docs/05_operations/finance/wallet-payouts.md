# Wallet, Payouts, Withdrawals (Ops Runbook)

> **Audience:** Ops + Engineering  
> **Goal:** Explain how merchant balances move through the system and how to troubleshoot payout issues.

---

## Source of truth (data model)

Wallet and payout semantics are implemented in the Prisma schema and Paystack webhook handlers:

- Schema: `platform/infra/db/prisma/schema.prisma` (Wallet / Withdrawal / related models)
- Paystack webhook: `Backend/core-api/src/app/api/webhooks/paystack/route.ts`

---

## Core concepts

- **available**: funds the merchant can withdraw now
- **pending**: funds awaiting settlement/confirmation (or within a hold window)
- **payout**: a withdrawal request + processing lifecycle

Document the exact fields used in the schema (e.g. `availableKobo`, `pendingKobo`) and when they change.

---

## Typical lifecycle (high level)

1. Customer pays for an order (Paystack).
2. Paystack webhook arrives and is verified.
3. Order payment status is updated and wallet balances are adjusted.
4. Merchant initiates a withdrawal.
5. Payout is processed and recorded (success/failure + reference ids).

---

## Troubleshooting checklist

- Confirm Paystack webhook is being received and verified.
- Confirm wallet fields updated for the store.
- Check withdrawal record status and references.
- Confirm idempotency (avoid double-credit / double-withdrawal).

