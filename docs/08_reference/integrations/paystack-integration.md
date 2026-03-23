# Paystack Integration

> Last updated: 2026-03-23
> Owner: Engineering
> Implementation: `Backend/core-api/src/services/PaystackService.ts`, `packages/payments/`

---

## Overview

Paystack is Vayva's sole payment gateway, chosen for its native Nigerian Naira support, widespread adoption among Nigerian consumers, and comprehensive API. Paystack handles all monetary transactions on the platform: subscription billing, storefront purchases, AI credit top-ups, and wallet withdrawals.

---

## API Configuration

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `PAYSTACK_SECRET_KEY` | Server-side API authentication | `sk_test_...` or `sk_live_...` |
| `PAYSTACK_PUBLIC_KEY` | Client-side checkout initialization | `pk_test_...` or `pk_live_...` |
| `PAYSTACK_LIVE_SECRET_KEY` | Production-only secret key (storefront) | `sk_live_...` |

### API Base URL

```
https://api.paystack.co
```

### Authentication

All server-side Paystack API calls use Bearer token authentication:

```typescript
const headers = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};
```

---

## Payment Flows

### Flow 1: Subscription Payment

Merchants pay for their monthly subscription (STARTER/PRO/PRO_PLUS).

```
1. Merchant selects a plan in the billing dashboard
2. Frontend calls POST /api/billing/subscribe
3. Backend creates a Paystack transaction:
   POST https://api.paystack.co/transaction/initialize
   {
     "email": merchant_email,
     "amount": plan_price_in_kobo,
     "currency": "NGN",
     "callback_url": "https://merchant.vayva.ng/billing/callback",
     "metadata": {
       "type": "subscription",
       "storeId": "...",
       "plan": "PRO",
       "billingPeriod": "monthly"
     }
   }
4. Paystack returns an authorization_url
5. Merchant is redirected to Paystack checkout page
6. Merchant completes payment (card, bank transfer, USSD)
7. Paystack redirects back to callback_url with reference
8. Backend verifies transaction via GET /transaction/verify/:reference
9. On success: subscription activated, plan features unlocked
10. Paystack also sends a webhook (see Webhook Handling below)
```

### Flow 2: Storefront Order Payment

Customers pay for products on a merchant's storefront.

```
1. Customer completes checkout on store.vayva.ng
2. Frontend calls POST /api/checkout/pay
3. Backend initializes a Paystack transaction:
   {
     "email": customer_email,
     "amount": order_total_in_kobo,
     "currency": "NGN",
     "callback_url": "https://store.vayva.ng/order/confirmation",
     "metadata": {
       "type": "order",
       "storeId": "...",
       "orderId": "...",
       "items": [...]
     }
   }
4. Customer completes payment
5. Webhook received -> order status updated to PAID
6. Funds added to merchant's wallet (minus Paystack fees)
7. Order confirmation email sent
```

### Flow 3: AI Credit Top-Up

Merchants purchase additional AI credits.

```
1. Merchant selects a credit package (Small/Medium/Large)
2. Backend initializes transaction:
   {
     "email": merchant_email,
     "amount": package_price_in_kobo,
     "currency": "NGN",
     "metadata": {
       "type": "credit_topup",
       "storeId": "...",
       "package": "medium",
       "credits": 8000
     }
   }
3. Payment completed
4. Credits added to MerchantAiSubscription.creditsRemaining
5. AiAddonPurchase record created
```

### Flow 4: Wallet Withdrawal

Merchants withdraw funds from their wallet to a bank account.

```
1. Merchant initiates withdrawal from wallet page
2. Merchant enters amount and wallet PIN
3. Backend verifies PIN and calculates 3% fee
4. Backend creates a Paystack transfer:
   POST https://api.paystack.co/transfer
   {
     "source": "balance",
     "amount": withdrawal_amount_in_kobo,
     "recipient": transfer_recipient_code,
     "reason": "Vayva wallet withdrawal"
   }
5. Paystack processes the bank transfer
6. Webhook confirms transfer success/failure
7. Wallet balance updated, Withdrawal record updated
```

---

## Webhook Handling

### Webhook Endpoint

```
POST /api/webhooks/paystack
```

### Webhook Verification

All incoming webhooks are verified using Paystack's signature mechanism:

```typescript
import crypto from 'crypto';

function verifyPaystackWebhook(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex');
  return hash === signature;
}
```

The webhook handler:
1. Reads the raw request body
2. Extracts the `x-paystack-signature` header
3. Computes HMAC-SHA512 of the body using the secret key
4. Compares the computed hash with the signature
5. Rejects the request if verification fails

### Webhook Events Handled

| Event | Action Taken |
|-------|-------------|
| `charge.success` | Verify transaction, update order/subscription/credit status |
| `transfer.success` | Mark withdrawal as completed, update wallet |
| `transfer.failed` | Mark withdrawal as failed, refund wallet balance |
| `transfer.reversed` | Reverse the withdrawal, credit wallet |
| `subscription.create` | Record new subscription |
| `subscription.disable` | Handle subscription cancellation |
| `invoice.create` | Record upcoming invoice |
| `invoice.payment_failed` | Flag subscription for grace period |
| `refund.processed` | Update refund status, notify merchant |

### Webhook Processing

Webhooks are processed asynchronously via the `webhook-processing` BullMQ queue:

1. Webhook endpoint receives the event and verifies the signature.
2. Event is enqueued in `webhook-processing` with priority 1 (critical).
3. Worker processes the event: verifies the transaction with Paystack API, updates the database, and triggers downstream actions.
4. If processing fails, the job retries up to 5 times with exponential backoff (15s base).

### Idempotency

Paystack may send the same webhook multiple times. The webhook handler uses the `reference` field as an idempotency key:

- Before processing, check if a transaction with this reference has already been processed.
- If already processed, return 200 OK without taking further action.
- This prevents duplicate order confirmations, double credit additions, or duplicate wallet operations.

---

## Transaction Amounts

All amounts in Paystack are in **kobo** (the smallest unit of Nigerian Naira):

```
1 NGN = 100 kobo
NGN 25,000 = 2,500,000 kobo
```

The Vayva database also stores all monetary values in kobo for consistency.

### Conversion Examples

| Tier | Monthly Price (NGN) | Amount in Kobo |
|------|--------------------|----|
| STARTER | NGN 25,000 | 2,500,000 |
| PRO | NGN 35,000 | 3,500,000 |
| PRO_PLUS | NGN 50,000 | 5,000,000 |

| Credit Package | Price (NGN) | Amount in Kobo |
|----------------|------------|----------------|
| Small (3,000 credits) | NGN 3,000 | 300,000 |
| Medium (8,000 credits) | NGN 7,000 | 700,000 |
| Large (20,000 credits) | NGN 15,000 | 1,500,000 |

---

## Supported Payment Methods

| Method | Description | Availability |
|--------|-------------|-------------|
| Card (Visa/Mastercard/Verve) | Direct card payment | All transactions |
| Bank Transfer | Pay via bank transfer | All transactions |
| USSD | Pay via USSD code from any bank | All transactions |
| Mobile Money | Mobile wallet payment | Selected regions |

Paystack automatically presents available payment methods to the customer based on their location and the transaction amount.

---

## Error Handling

### Common Paystack Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `Invalid key` | Wrong API key for environment | Verify `PAYSTACK_SECRET_KEY` matches the environment (test vs live) |
| `Transaction reference already exists` | Duplicate reference | Generate a new unique reference |
| `Amount too small` | Amount below Paystack minimum (NGN 100) | Validate amount before API call |
| `Invalid recipient` | Bad transfer recipient code | Re-create the transfer recipient |
| `Insufficient balance` | Paystack account balance too low for transfers | Fund the Paystack balance |

### Retry Strategy for Paystack API Calls

| Call Type | Retries | Backoff | Notes |
|-----------|---------|---------|-------|
| Transaction initialization | 0 | N/A | Fail fast, show error to user |
| Transaction verification | 3 | 5s, 10s, 20s | Critical for payment confirmation |
| Webhook processing | 5 | 15s exponential | Via BullMQ queue |
| Transfer creation | 2 | 10s, 30s | Financial operation, log all attempts |

---

## Testing

### Test Mode

Use Paystack test keys (`sk_test_...`, `pk_test_...`) in development and staging environments. Test mode transactions do not process real payments.

### Test Cards

| Card Number | Behavior |
|-------------|----------|
| `408 408 408 408 408 1` | Successful payment |
| `408 408 408 408 408 2` | Declined payment |
| `408 408 408 408 408 3` | Timeout / pending |

CVV: any 3 digits. Expiry: any future date. PIN: any 4 digits. OTP: `123456`.

### Webhook Testing

Use Paystack's webhook testing tool in the dashboard to send test events to your webhook endpoint. For local development, use a tunnel service (e.g., ngrok) to expose your local endpoint.

---

## Paystack Dashboard

Access the Paystack dashboard at `https://dashboard.paystack.com` for:

- Transaction history and search
- Settlement reports
- Transfer management
- Webhook delivery logs (see which webhooks were sent and their response status)
- API key management
- Compliance documents

---

## Security Considerations

1. **Never expose the secret key** in client-side code. Only `PAYSTACK_PUBLIC_KEY` is used on the frontend.
2. **Always verify webhooks** using the HMAC-SHA512 signature.
3. **Always verify transactions server-side** after receiving a callback. Never trust client-side payment confirmation alone.
4. **Use idempotency keys** for all financial operations to prevent duplicates.
5. **Log all payment events** in the audit log for compliance and dispute resolution.
6. **Store transaction references** for reconciliation with Paystack's records.

---

## Related Documents

- [Pricing and Billing](../../01_product/pricing-and-billing.md)
- [Backend Architecture](../../02_engineering/backend-architecture.md)
- [Environment Variables](../../04_deployment/environment-variables.md)
- [Deployment Checklist](../../04_deployment/procedures/deployment-checklist.md)
