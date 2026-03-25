# Vendor & Pricing Register (Vayva)

> **Purpose:** single source of truth for *what third-party services Vayva uses*, *where they are used in code*, and *how they are billed*.\n
> **Audience:** Exec + Ops + Engineering\n
> **Status:** Living document — update when vendors or plans change.\n

## Baseline (current known expenses)

- **VPS (InterServer)**: **$70 / month** total (**$35 DB VPS + $35 App/Services VPS**)
- **Vercel Pro**: **$20 / month** (baseline)
- **Business email**: **$5 / month** (baseline)
- **OpenRouter launch deposit**: **$50** (prepaid deposit; re-deposit from merchant revenue once subscriptions start)

## Exchange rate convention (docs)

- **Default assumption for NGN conversions:** **$1 = ₦1,600**\n
  - If you want to use a different rate, update numbers *everywhere* consistently (expenses, unit economics, AI pricing).

---

## Vendor register (what exists in repo today)

### Payments — Paystack

- **Provider**: Paystack
- **What we use it for**: subscription billing, storefront checkout payments, AI credit top-ups, wallet withdrawals/transfers
- **Primary code entrypoints**:
  - `Backend/core-api/src/services/PaystackService.ts`
  - `docs/08_reference/integrations/paystack-integration.md`
- **Key env vars**:
  - `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_KEY` (legacy: `PAYSTACK_PUBLIC_KEY`) (see `.env.example`, `.env.production.example`)
- **Pricing model (to document in finance docs)**:
  - Paystack fees are typically **per-transaction** (percentage + fixed fee + cap). These are usually borne by the payer or deducted from merchant proceeds.
  - Treat Paystack as **variable cost** tied to GMV + subscription billing volume.

### AI — OpenRouter

- **Provider**: OpenRouter
- **What we use it for**: AI chat/completions across merchant app + agent workflows
- **Primary code entrypoints**:
  - `Backend/core-api/src/lib/ai/openrouter-client.ts` (calls `https://openrouter.ai/api/v1/chat/completions`)
  - `docs/08_reference/ai-pricing-and-credits.md`
- **Key env vars**:
  - `OPENROUTER_API_KEY`
- **Pricing model**:
  - Provider bills **per token** (input vs output; some models also bill audio/image tokens).
  - In Vayva, AI spend is a **variable cost**; internal “credits” are a billing abstraction.
- **Launch cash-flow note**:
  - Add **$50 initial deposit** as **prepay** (not a monthly recurring fee).

### Email — Resend

- **Provider**: Resend
- **What we use it for**: transactional emails (OTP, order confirmations, password reset, trial reminders, etc.)\n
  - Resend is used to **send** email as `no-reply@vayva.ng` / `support@vayva.ng`.\n
  - Our **business inboxes** for `@vayva.ng` are handled separately via **hosting.com**.
- **Primary code entrypoints**:
  - `packages/shared/emails/src/send.ts` (uses `resend` SDK)
- **Key env vars**:
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`
- **Pricing model**:
  - Typically billed by **email volume/month** (tiered plans) with optional add-ons.

### Delivery/Logistics — Kwik Delivery

- **Provider**: Kwik Delivery
- **What we use it for**: delivery quote/dispatch + delivery status updates via webhook
- **Primary code entrypoints**:
  - `Backend/core-api/src/lib/delivery/DeliveryService.ts` (provider selection and auto-dispatch)
  - `Backend/core-api/src/app/api/webhooks/delivery/kwik/route.ts` (status webhooks; `x-kwik-signature` HMAC)
  - `Backend/core-api/src/lib/delivery/DeliveryProvider.ts` (provider registry)
  - `Frontend/merchant/src/app/api/shipping/kwik/quote/route.ts` (quote)
- **Key env vars**:
  - `KWIK_API_KEY`, `KWIK_WEBHOOK_SECRET`
  - (legacy/dev envs also reference `KWIK_EMAIL`, `KWIK_PASSWORD`, `KWIK_BASE_URL`)
- **Pricing model**:
  - Kwik pricing is computed **per task/job** based on **Google distance**, **service charge**, and optional add-ons (e.g., loaders, insurance, COD fees).\n
  - In their API docs, pricing is calculated via the **Pricing Logic** endpoints (e.g. `send_payment_for_task` / estimated fare breakdown). See `[Kwik API docs](https://apikwik.docs.apiary.io)`.\n
  - Public-facing guidance: Kwik states delivery fees are **distance-based** and can start from **₦400** (see `[Kwik FAQ](https://kwik.delivery/faq/)`).\n
  - For business budgeting in Vayva: treat Kwik as a **variable COGS** line item tied to order volume, distance, vehicle type, surge, and whether **delivery fee is charged to buyer** or absorbed by merchant.\n
  - For merchant-facing checkout: always compute a **quote/estimate** at order time (don’t hardcode flat rates). Kwik has an estimator UI at `[Kwik pricing](https://kwik.delivery/pricing/)`.

### WhatsApp gateway — Evolution API (self-hosted)

- **Provider**: Evolution API (self-hosted WhatsApp Web gateway)
- **What we use it for**: WhatsApp messaging (instance management, inbound webhooks, outbound messages)
- **Primary code entrypoints**:
  - `Backend/core-api/src/services/whatsapp/manager.server.ts`
  - `docs/08_reference/integrations/whatsapp-evolution-api.md`
- **Key env vars**:
  - `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`
- **Pricing model**:
  - Software is self-hosted; cost is captured under **VPS cost** (fixed monthly).
  - Operational risks are availability + WhatsApp account bans; not strictly a “price” line item.

### Storage — MinIO/S3-compatible (primary) + optional Vercel Blob

- **Provider**: MinIO or any S3-compatible storage (self-hosted or managed)
- **What we use it for**: file uploads (branding, product images, dispute evidence)
- **Primary code entrypoints**:
  - `Backend/core-api/src/app/api/uploads/create/route.ts` (pre-signed upload URL; AWS SDK)
  - `Backend/core-api/src/app/api/uploads/finalize/route.ts` (HEAD + MIME sniff + finalize + entity attach)
  - `Backend/core-api/src/lib/storage/storageService.ts`
  - `Frontend/merchant/src/lib/storage/storageService.ts`
- **Key env vars**:
  - `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION`, `MINIO_PUBLIC_BASE_URL`
  - Optional: `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- **Pricing model**:
  - If self-hosted MinIO: storage cost is mostly **VPS disk** (fixed-ish) + bandwidth.
  - If managed S3/R2/etc: **per GB stored + bandwidth + operations** (variable).

### Monitoring — Sentry

- **Provider**: Sentry
- **What we use it for**: error tracking in Next.js apps
- **Code indicators**:
  - Dependencies: `@sentry/nextjs` across apps (merchant/storefront/ops-console)
  - Env: `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`
- **Pricing model**:
  - Usually billed by **events/month** (tiered).

### Social integrations (optional) — Meta / Google / TikTok

- **Providers**: Meta (Facebook/Instagram), Google, TikTok
- **What we use it for**: social connections + ads platform integrations (connect/callback routes exist)
- **Repo indicators**:
  - Files under `Frontend/merchant/src/app/api/auth/*` and `*/api/socials/instagram/*`
  - Env in `.env.example` for `META_APP_ID`, `META_APP_SECRET`, `GOOGLE_CLIENT_ID`, `TIKTOK_APP_ID`, etc.
- **Pricing model**:
  - OAuth integrations are usually **free** (cost is engineering + compliance).
  - Ads spend is an operator budget item (variable) — see marketing strategy docs.

---

## Notes / gaps to close (tracked by docs tasks)

- **Kwik Delivery pricing** needs confirmation from vendor docs and should be added here with concrete per-job/fee rules.\n
- **SMS / Push** in `packages/notification-engine` is currently a stub/simulator; if we adopt a provider (Termii/Twilio/etc.), it must be added here with pricing.

