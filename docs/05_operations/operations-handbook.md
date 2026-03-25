# Vayva Operations Handbook (How Vayva Works)

**Audience:** Executive overview + deep technical runbook\n
**Goal:** Give anyone a detailed understanding of Vayva’s internal operating flow.\n

---

## Executive overview (1-page)

Vayva is a WhatsApp-first commerce OS. Merchants onboard, connect channels (Paystack, WhatsApp), add products, and start receiving orders. **Vayva hosts the WhatsApp gateway (Evolution API) on our VPS** — merchants simply **scan a QR code (or use pairing code)** to link their WhatsApp number.

### Systems (high level)

```mermaid
flowchart LR
  marketing[Marketing_Site_vayva_ng] --> merchantSignup[Merchant_Signup]
  merchantSignup --> merchantApp[Merchant_Dashboard]
  merchantApp --> coreApi[Core_API_Nextjs_Route_Handlers]
  opsConsole[Ops_Console] --> coreApi
  storefront[Storefront] --> coreApi
  worker[Worker_Jobs] --> coreApi

  coreApi --> db[(Postgres_Prisma)]
  coreApi --> redis[(Redis)]

  coreApi --> paystack[Paystack]
  coreApi --> resend[Resend]
  coreApi --> openrouter[OpenRouter]
  coreApi --> kwik[Kwik_Delivery]
  coreApi --> evolution[EVOLUTION_API]
  coreApi --> storage[MinIO_S3]
```

---

## Deep technical handbook

## Core data model (conceptual)

```mermaid
flowchart TB
  user[User] --> membership[Membership]
  membership --> store[Store]
  store --> product[Product]
  store --> customer[Customer]
  store --> order[Order]
  order --> shipment[Shipment]
  store --> aiSub[MerchantAiSubscription]
  store --> wallet[Wallet]
```

---

## New merchant onboarding flow (new user)

### What the merchant experiences
- Create account → verify email/OTP
- Create store → choose industry
- Add first product/service
- Connect Paystack
- (Optional) connect WhatsApp channel (scan QR / pairing code)
- Configure delivery (Kwik) and store policies
- Publish storefront

### System flow

```mermaid
flowchart TD
  user[User] --> signup[POST_auth_register]
  signup --> verify[OTP_Verification]
  verify --> createStore[Create_Store]
  createStore --> onboarding[Onboarding_Steps_Save]
  onboarding --> paystackConnect[Paystack_Config]
  onboarding --> waConnect[Evolution_API_Instance_Connect]
  onboarding --> deliverySettings[Delivery_Settings_Kwik]
  onboarding --> publish[Publish_Storefront]
  publish --> ready[Ready_For_Sales]
```

---

## Existing merchant flow (daily usage)

```mermaid
flowchart TD
  merchant[Merchant] --> dashboard[Dashboard_Login]
  dashboard --> manageProducts[Manage_Products]
  dashboard --> manageOrders[Manage_Orders]
  dashboard --> runCampaigns[Marketing_Campaigns]
  dashboard --> aiTools[AI_Tools]
  manageOrders --> dispatch[Dispatch_Delivery]
  dispatch --> track[Track_Shipment]
  track --> customerNotify[Customer_Notifications]
```

---

## Checkout + payment (storefront order)

```mermaid
sequenceDiagram
  participant Customer
  participant Storefront
  participant CoreAPI
  participant Paystack
  participant DB
  participant Resend

  Customer->>Storefront: Checkout
  Storefront->>CoreAPI: Initialize payment
  CoreAPI->>Paystack: transaction/initialize
  Paystack-->>Customer: Redirect to checkout
  Paystack-->>CoreAPI: Webhook/callback with reference
  CoreAPI->>Paystack: Verify transaction
  CoreAPI->>DB: Mark order PAID
  CoreAPI->>Resend: Send receipt/order confirmation
  CoreAPI-->>Storefront: Payment confirmed
```

---

## Delivery dispatch + tracking (Kwik)

### Key concepts from Kwik docs
- Pricing is computed per job (distance + service charge + surge + add-ons).\n
  Reference: `https://apikwik.docs.apiary.io` and Kwik public FAQ.
- Kwik sends status updates to Vayva via webhook; Vayva maps to internal shipment statuses.

```mermaid
flowchart TD
  orderPaid[Order_PAID] --> dispatchRequest[Dispatch_Request]
  dispatchRequest --> quote[Kwik_Quote_or_Pricing]
  quote --> createTask[Kwik_Create_Task]
  createTask --> shipmentCreated[Shipment_CREATED_trackingCode]
  kwikWebhook[Kwik_Webhook_Status] --> mapStatus[Map_to_Vayva_Status]
  mapStatus --> updateShipment[Update_Shipment_Status]
  updateShipment --> notifyCustomer[Notify_Customer_Status]
```

---

## AI usage + credits (OpenRouter)

```mermaid
sequenceDiagram
  participant Merchant
  participant CoreAPI
  participant OpenRouter
  participant DB

  Merchant->>CoreAPI: AI request (chat/action)
  CoreAPI->>DB: Check credits / plan caps
  CoreAPI->>OpenRouter: chat/completions
  OpenRouter-->>CoreAPI: response + token usage
  CoreAPI->>DB: Deduct credits + log AiUsageEvent
  CoreAPI-->>Merchant: AI response
```

---

## Webhooks overview (what hits Vayva)

```mermaid
flowchart LR
  paystackWH[Paystack_Webhook] --> coreApi[Core_API]
  kwikWH[Kwik_Webhook] --> coreApi
  evolutionWH[Evolution_API_Webhook] --> merchantProxy[Merchant_App_Proxy] --> coreApi
  coreApi --> db[(DB)]
  coreApi --> worker[Worker_Jobs]
```

---

## Failure modes (ops checklist)

- **Payments**: webhook retries/idempotency; verify by reference; guard against double-credit/double-fulfillment.\n
- **Delivery**: webhook signature validation; ignore unknown statuses; prevent status rollback.\n
- **AI**: enforce credit deduction and block when insufficient.\n
- **WhatsApp**: Evolution instance disconnect; implement health checks and merchant alerts.\n
- **Storage**: MinIO credentials missing → disable upload features; pre-signed URL expiry.\n

---

## Further reading (runbooks & references)

- Webhook verification and idempotency: `docs/06_security_compliance/webhooks.md`
- Rate limiting policy: `docs/06_security_compliance/rate-limiting.md`
- Cron jobs: `docs/05_operations/automation/cron-jobs.md`
- Job queues: `docs/05_operations/automation/job-queue-operations.md`
- Wallet & payouts: `docs/05_operations/finance/wallet-payouts.md`
- Stripe: `docs/08_reference/integrations/stripe.md`
- Shopify: `docs/08_reference/integrations/shopify.md`

