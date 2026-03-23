# Pricing and Billing

> Last updated: 2026-03-23
> Source of truth: `Backend/core-api/src/config/pricing.ts` (version `2026-03-23_v3`)

---

## Pricing Philosophy

Vayva uses a simple three-tier subscription model priced in Nigerian Naira (NGN). There is no free tier -- the platform provides substantial value from day one, and the pricing reflects that. All tiers include AI capabilities, with higher tiers unlocking more advanced automation and higher usage limits.

> **Current promotion:** STARTER tier includes a 1-month free trial to drive adoption.

---

## Subscription Tiers

### STARTER -- NGN 25,000/month

*"Grow without the busywork. AI handles your orders 24/7."*

Best for solo merchants and small businesses getting started with online selling.

| Feature | Limit |
|---------|-------|
| Staff seats | 1 |
| Products | 500 |
| Orders/month | 500 |
| Customers | 1,000 |
| AI credits/month | 5,000 |
| WhatsApp messages/month | 500 |
| Campaign sends/month | 1,000 |
| Automation rules | 3 |
| Dashboard widgets | 6 |
| Templates included | 1 (additional at NGN 5,000 each) |
| Analytics retention | 90 days |
| Trial period | 7 days |

**Included features:** Online store, WhatsApp and Instagram automation, AI assistant, inbox operations, reports, advanced analytics, financial charts.

**Not included:** AI Autopilot, custom domain, remove branding, API access, approval workflows, industry dashboards, visual workflow builder, priority support.

### PRO -- NGN 35,000/month

*"Scale with AI doing the heavy lifting. Your team, unlimited growth."*

Best for growing businesses that need team collaboration, automation, and API access.

| Feature | Limit |
|---------|-------|
| Staff seats | 3 |
| Products | 1,000 |
| Orders/month | 10,000 |
| Customers | Unlimited |
| AI credits/month | 10,000 |
| WhatsApp messages/month | 5,000 |
| Campaign sends/month | 10,000 |
| Automation rules | 20 |
| Dashboard widgets | 10 |
| Templates included | 2 (additional at NGN 5,000 each) |
| Analytics retention | 365 days |
| Trial period | 7 days |

**Additional features over STARTER:** AI Autopilot, custom domain, remove branding, API access, approval workflows, industry dashboards, multi-store support.

**Not included:** Visual workflow builder, merged industry dashboard, priority support.

### PRO_PLUS -- NGN 50,000/month

*"Everything unlocked. Maximum power for serious businesses."*

Best for established businesses that need maximum automation and all features unlocked.

| Feature | Limit |
|---------|-------|
| Staff seats | 5 |
| Products | Unlimited |
| Orders/month | Unlimited |
| Customers | Unlimited |
| AI credits/month | 25,000 |
| WhatsApp messages/month | 10,000 |
| Campaign sends/month | 50,000 |
| Automation rules | Unlimited |
| Dashboard widgets | Unlimited |
| Templates included | 5 |
| Analytics retention | Unlimited |
| Trial period | None |

**All features unlocked:** Everything in PRO plus visual workflow builder, merged industry dashboard, priority support.

---

## Feature Matrix

| Feature | STARTER | PRO | PRO_PLUS |
|---------|---------|-----|----------|
| Online storefront | Yes | Yes | Yes |
| WhatsApp automation | Yes | Yes | Yes |
| Instagram automation | Yes | Yes | Yes |
| AI assistant | Yes | Yes | Yes |
| Inbox operations | Yes | Yes | Yes |
| Reports | Yes | Yes | Yes |
| Advanced analytics | Yes | Yes | Yes |
| Financial charts | Yes | Yes | Yes |
| Approval workflows | -- | Yes | Yes |
| AI Autopilot | -- | Yes | Yes |
| Custom domain | -- | Yes | Yes |
| Remove branding | -- | Yes | Yes |
| API access | -- | Yes | Yes |
| Industry dashboards | -- | Yes | Yes |
| Merged industry dashboard | -- | -- | Yes |
| Visual workflow builder | -- | -- | Yes |
| Priority support | -- | -- | Yes |

---

## AI Credits System

AI usage is metered through a credit system. Credits are consumed whenever a merchant's AI agent processes messages, generates content, or performs automated actions.

### Credit Allocation per Tier

| Tier | Monthly Credits |
|------|----------------|
| STARTER | 5,000 |
| PRO | 10,000 |
| PRO_PLUS | 25,000 |

Credits are allocated on subscription activation and do not roll over between billing periods.

### Credit Consumption Rates

| Model | Use Case | Cost per 1K Tokens |
|-------|----------|-------------------|
| GPT-4o Mini (OpenRouter) | Primary AI -- 95% of requests | 0.24 credits |
| Llama 3.3 70B (Groq) | Autopilot operations | 0.34 credits |
| Claude 3 Sonnet | Complex reasoning, legal documents | 2.40 credits |
| Mistral Large | Code generation, technical tasks | 1.60 credits |

Additional costs:
- Image generation: 10 credits per image
- Tool calls: 0.5 credits per call

### Credit Top-Up Packages

Merchants can purchase additional credits when their allocation runs low.

| Package | Credits | NGN Price | USD Price |
|---------|---------|-----------|-----------|
| Small | 3,000 | NGN 3,000 | $7 |
| Medium | 8,000 | NGN 7,000 | $16 |
| Large | 20,000 | NGN 15,000 | $35 |

Multi-currency pricing is available for merchants outside Nigeria:
- EUR: 6.50 / 15 / 32
- GBP: 5.50 / 13 / 28
- KES: 910 / 2,080 / 4,550
- GHS: 85 / 195 / 425
- ZAR: 130 / 295 / 645

A low-credit alert is triggered at 200 credits remaining, with a 24-hour cooldown between alerts.

---

## Transaction Fees

| Fee Type | Rate | Notes |
|----------|------|-------|
| Withdrawal fee | 3% | Applied to every payout from merchant wallet |
| Paystack processing | Standard Paystack rates | Borne by customer or merchant (configurable) |

All internal amounts are stored in **kobo** (1 NGN = 100 kobo) for precision.

---

## Payment Processing (Paystack)

Vayva uses **Paystack** as its sole payment gateway, chosen for its native Nigerian Naira support and widespread adoption.

### Supported Payment Methods
- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- USSD
- Mobile money

### Integration Points

| Component | Purpose |
|-----------|---------|
| `PaystackService.ts` | Transaction initialization, verification, and webhook processing |
| Subscription payments | Monthly tier billing |
| Store transactions | Customer purchases on storefronts |
| Credit top-ups | AI credit package purchases |
| Wallet withdrawals | Merchant payout processing |

### Transaction Flow

1. Merchant or customer initiates a payment
2. Paystack transaction is initialized with a callback URL
3. Customer completes payment on Paystack's checkout page
4. Paystack sends a webhook notification to Vayva
5. Transaction is verified server-side via Paystack API
6. Payment is recorded and the corresponding action is taken (subscription activated, order confirmed, credits added, etc.)

---

## Subscription Lifecycle

### Activation

1. Merchant signs up and completes onboarding
2. Trial period begins (7 days for STARTER and PRO, none for PRO_PLUS)
3. During trial, all tier features are available
4. At trial end, merchant must subscribe to continue

### Billing Cycle

- Subscriptions are billed monthly
- Payment is processed via Paystack
- On successful payment, the subscription renews for another month
- On failed payment, the store enters a grace period

### Plan Changes

- **Upgrades** are applied immediately; the merchant is charged the prorated difference
- **Downgrades** take effect at the end of the current billing period
- Feature access is adjusted automatically based on the new plan's gating rules

### Cancellation

- Merchants can cancel their subscription from the billing page
- Access continues until the end of the current billing period
- After expiration, the store becomes inaccessible to customers (not deleted)

---

## Wallet System

Each store has a **Wallet** that holds funds from customer orders. Key features:

- **Balance tracking** in kobo with deposits and payouts
- **Lock mechanism** -- wallet can be locked (`isLocked`, `lockReason`, `lockedBy`) for security or compliance holds
- **Withdrawal processing** -- merchants request withdrawals, which are processed after the 3% fee deduction
- **Bank beneficiary management** -- merchants save bank account details for recurring withdrawals (`BankBeneficiary` model)
- **Wallet PIN** -- hashed PIN required for withdrawal authorization

---

## Feature Gating Implementation

Feature access is enforced at two levels:

1. **Backend** (`Backend/core-api/src/lib/billing/plans.ts`) -- the `PLANS` configuration object defines limits and feature flags per tier. API routes check the store's plan before allowing operations.

2. **Frontend** (`Frontend/merchant/src/lib/access-control/tier-limits.ts`) -- helper functions `isFeatureAvailable(tier, feature)` and `getFeatureLimit(tier, feature)` control UI visibility and enforce client-side limits.

3. **Feature overrides** -- the `MerchantFeatureOverride` model allows per-store feature toggles, enabling the ops team to grant or restrict specific features for individual merchants regardless of their plan.
