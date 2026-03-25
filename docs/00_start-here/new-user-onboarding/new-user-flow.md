# New user flow (Merchant) — Vayva

**Audience:** Exec + product + engineering\n
**Goal:** Explain what happens when a new merchant signs up and goes live.\n

---

## Executive summary

New merchants go through: **Signup → Store creation → Onboarding setup → Connect Paystack → (Optional) link WhatsApp by scanning QR → Add products → Publish → First order**.

---

## Step-by-step flow (product)

```mermaid
flowchart TD
  visit[Visit_vayva_ng] --> signup[Create_account]
  signup --> verify[Verify_email_or_OTP]
  verify --> createStore[Create_store]
  createStore --> onboarding[Onboarding_wizard]
  onboarding --> addProducts[Add_first_products]
  onboarding --> connectPaystack[Connect_Paystack]
  onboarding --> connectWhatsApp[Connect_WhatsApp_optional]
  onboarding --> configureDelivery[Configure_delivery_optional]
  onboarding --> publish[Publish_storefront]
  publish --> firstSale[First_sale]
```

---

## Deep technical flow (engineering)

### Main systems involved
- Merchant dashboard (`Frontend/merchant`)
- Core API (`Backend/core-api`)
- DB (Postgres/Prisma)
- Paystack, Resend, OpenRouter, Evolution API (optional), Kwik (optional)
- **Note:** Vayva hosts Evolution API on our VPS — “Connect WhatsApp” means **scan a QR code (or use pairing code)** to link the merchant’s WhatsApp number.

```mermaid
sequenceDiagram
  participant Browser
  participant MerchantApp
  participant CoreAPI
  participant DB
  participant Resend
  participant Paystack

  Browser->>MerchantApp: Signup
  MerchantApp->>CoreAPI: Create user + OTP
  CoreAPI->>Resend: Send verification email/OTP
  CoreAPI->>DB: Persist user + otp
  Browser->>MerchantApp: Verify OTP
  MerchantApp->>CoreAPI: Verify OTP + create store
  CoreAPI->>DB: Create Store + Membership
  Browser->>MerchantApp: Connect Paystack
  MerchantApp->>CoreAPI: Save Paystack settings
  CoreAPI->>DB: Store payment config
  Browser->>MerchantApp: Publish
  MerchantApp->>CoreAPI: Mark store published
  CoreAPI->>DB: Store status updated
```

