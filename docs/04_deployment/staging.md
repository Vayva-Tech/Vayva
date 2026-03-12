# Staging Deployment (End-to-end)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Goal
Stand up a staging environment that mirrors production closely enough to safely test:
- merchant onboarding
- product creation
- checkout/payment
- delivery scheduling
- WhatsApp linking
- ops-console flows

## What “staging” includes
- Vercel staging deployments for:
  - Marketing
  - Merchant Admin
  - Ops Console
- Optional staging VPS services (Evolution/MinIO/Redis) if you need WhatsApp + storage realism.

## 0) Pre-flight checklist
- You have access to Vercel projects.
- You have staging Paystack keys.
- You have a staging database.
- You have staging Redis.
- You have staging Evolution API and keys (if WhatsApp in scope).

## 1) Create/confirm Vercel staging environment
### 1.1 Branch model
Recommended:
- `main` → production
- `staging` → staging

### 1.2 Vercel environment variables
Set env vars in Vercel for the staging environment:
- `DATABASE_URL` (staging)
- `REDIS_URL` (staging)
- `NEXTAUTH_SECRET` (staging)
- `PAYSTACK_SECRET_KEY` + `NEXT_PUBLIC_PAYSTACK_KEY` (staging test)
- `RESEND_API_KEY` (staging)
- `GROQ_API_KEY_*` (staging)

Verification:
- In Vercel UI, confirm env vars show up for the correct environment.

## 2) DNS and domains
If using Vercel preview URLs only:
- you can skip DNS.

If using real staging subdomains:
- create staging subdomains and point them to Vercel.

## 3) Webhook wiring (staging)
### Paystack
- Set Paystack webhook URL to your staging backend webhook endpoint.

Verification:
- Trigger a test payment and confirm webhook logs.

### WhatsApp (if enabled)
- Configure Evolution webhook callback + auth.

Verification:
- Link a WhatsApp number and confirm inbound/outbound message test.

## 4) Smoke test checklist
### 4.1 Merchant signup
- Create merchant
- Complete onboarding

### 4.2 Product create
- Create product
- Confirm it appears in listing

### 4.3 Checkout
- Checkout from storefront
- Pay via Paystack test card
- Confirm order becomes PAID

### 4.4 Delivery
- If delivery enabled, confirm delivery job enqueued

### 4.5 Ops
- Log into ops console
- Confirm merchant appears

## Rollback
- Rollback Vercel projects (promote previous deployment)
- If staging DB schema changed: restore from backup
