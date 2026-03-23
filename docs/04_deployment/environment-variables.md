# Environment Variables

> All environment variables used across the Vayva platform, organized by category and app.

## Quick Reference

| Variable | Apps | Required | Description |
|----------|------|----------|-------------|
| `DATABASE_URL` | merchant, ops-console, storefront | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | merchant | Yes | NextAuth.js signing secret |
| `NEXTAUTH_URL` | merchant | Yes | Canonical URL for auth callbacks |
| `AUTH_TRUST_HOST` | merchant | No | Trust proxy headers (default `"true"`) |
| `BACKEND_API_URL` | merchant | Yes | Backend API server base URL |
| `REDIS_URL` | merchant, ops-console | No | Redis connection URL (default `redis://localhost:6379`) |
| `NODE_ENV` | all | Auto | `development`, `production`, or `test` |
| `NEXT_PUBLIC_APP_URL` | merchant, storefront | Yes | Public-facing app URL |
| `NEXT_PUBLIC_API_URL` | merchant, storefront | Yes | Public API base URL |
| `NEXT_PUBLIC_WS_URL` | merchant | No | WebSocket URL for real-time updates |
| `OPENROUTER_API_KEY` | merchant | Yes | OpenRouter API key for AI features |
| `EVOLUTION_API_URL` | merchant | Yes | Evolution API URL for WhatsApp |
| `EVOLUTION_API_KEY` | merchant | Yes | Evolution API authentication key |
| `PAYSTACK_SECRET_KEY` | merchant, ops-console, storefront | Yes | Paystack secret key (test or live) |
| `PAYSTACK_PUBLIC_KEY` | merchant, storefront | Yes | Paystack public key (client-side) |
| `PAYSTACK_LIVE_SECRET_KEY` | storefront | Prod | Paystack live secret key (production only) |
| `RESEND_API_KEY` | merchant, ops-console | Yes | Resend email API key |
| `NEXT_PUBLIC_ANALYTICS_ID` | merchant | No | Analytics tracking ID |

---

## Database

### `DATABASE_URL`
- **Format**: `postgresql://user:password@host:port/database?schema=public`
- **Used by**: merchant, ops-console, storefront (via `@vayva/db` / Prisma)
- **Notes**: Connection pooling recommended in production. Use `?pgbouncer=true&connection_limit=1` for serverless environments.

---

## Authentication

### `NEXTAUTH_SECRET`
- **Format**: Random string (minimum 32 characters)
- **Used by**: merchant
- **Generate**: `openssl rand -base64 32`
- **Notes**: Must be the same across all instances of the merchant app. Changing this invalidates all existing sessions.

### `NEXTAUTH_URL`
- **Format**: Full URL, e.g., `https://merchant.vayva.ng`
- **Used by**: merchant
- **Notes**: Must match `MERCHANT_ORIGIN` in production. Used for OAuth callback URLs and CSRF token generation.

### `AUTH_TRUST_HOST`
- **Format**: `"true"` or `"false"`
- **Default**: `"true"`
- **Used by**: merchant
- **Notes**: Set to `"true"` when behind a reverse proxy (Vercel). Allows NextAuth to trust the `Host` header.

---

## Backend API

### `BACKEND_API_URL`
- **Format**: Full URL, e.g., `https://api.vayva.ng`
- **Used by**: merchant
- **Notes**: Base URL only — do NOT include `/api` suffix. The merchant app rewrites `/api/*` requests to `${BACKEND_API_URL}/api/*`.

### `MERCHANT_API_URL`
- **Format**: Full URL
- **Used by**: merchant (next.config.js rewrites)
- **Notes**: Optional. When set, enables API proxying through Next.js rewrites. If not set, API routes are handled locally.

### `OPS_CONSOLE_URL`
- **Format**: Full URL, e.g., `https://ops.vayva.ng`
- **Used by**: merchant (next.config.js rewrites)
- **Notes**: Optional. When set, enables proxying `/ops/*` routes to the ops console.

---

## Redis

### `REDIS_URL`
- **Format**: `redis://[:password@]host:port[/db]`
- **Default**: `redis://localhost:6379`
- **Used by**: merchant, ops-console
- **Notes**: Used for rate limiting, caching, session storage, and BullMQ job queues. Ops console checks for availability before enabling Redis-dependent features.

---

## AI Services

### `OPENROUTER_API_KEY`
- **Format**: API key string (starts with `sk-or-`)
- **Used by**: merchant (via backend)
- **Notes**: Powers AI Autopilot, AI insights, product descriptions, and the AI agent. Usage is metered per tier (STARTER: 10K tokens, PRO: 100K, PRO_PLUS: 200K per month).

### `GROQ_API_KEY_RESCUE`
- **Format**: API key string
- **Used by**: ops-console
- **Notes**: Groq API key specifically for the merchant rescue feature (AI-assisted merchant intervention).

---

## WhatsApp Integration

### `EVOLUTION_API_URL`
- **Format**: Full URL, e.g., `http://localhost:8080`
- **Default**: `http://localhost:8080`
- **Used by**: merchant
- **Notes**: Evolution API instance URL for WhatsApp Business integration. Handles message sending, receiving, and webhook events.

### `EVOLUTION_API_KEY`
- **Format**: API key string
- **Default**: `global-api-key`
- **Used by**: merchant
- **Notes**: Authentication key for the Evolution API instance.

### `WHATSAPP_ACCESS_TOKEN`
- **Format**: Token string
- **Used by**: merchant
- **Notes**: WhatsApp Cloud API access token (alternative to Evolution API for direct Meta integration).

### `WHATSAPP_PHONE_ID`
- **Format**: Phone number ID string
- **Used by**: merchant
- **Notes**: WhatsApp Business phone number ID for the Cloud API.

---

## Payments (Paystack)

### `PAYSTACK_SECRET_KEY`
- **Format**: `sk_test_*` (test) or `sk_live_*` (live)
- **Used by**: merchant, ops-console, storefront
- **Notes**: Server-side key for Paystack API calls. The ops-console uses this for health checks. The storefront uses this for webhook signature verification.

### `PAYSTACK_PUBLIC_KEY`
- **Format**: `pk_test_*` (test) or `pk_live_*` (live)
- **Used by**: merchant, storefront (client-side)
- **Notes**: Client-side key for Paystack Inline.js checkout widget. Should be prefixed as `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` for client access.

### `PAYSTACK_LIVE_SECRET_KEY`
- **Format**: `sk_live_*`
- **Used by**: storefront
- **Notes**: Production-only. The storefront switches between test and live keys based on `NODE_ENV`.

---

## Email

### `RESEND_API_KEY`
- **Format**: `re_*` API key
- **Used by**: merchant, ops-console
- **Notes**: Used for transactional emails (order confirmations, password resets, trial reminders, ops team invitations).

### `RESEND_FROM_EMAIL`
- **Format**: Email address
- **Default**: `no-reply@vayva.ng`
- **Used by**: merchant, ops-console
- **Notes**: The `From` address for outgoing emails. The ops console defaults to `Vayva Operations <ops@vayva.ng>`.

### `EMAIL_FROM`
- **Format**: Email address
- **Default**: `no-reply@vayva.ng`
- **Used by**: merchant
- **Notes**: Validated in the merchant env schema. Used as the default sender address.

### `EMAIL_PROVIDER`
- **Format**: `resend`, `sendgrid`, or `mock`
- **Default**: `resend`
- **Used by**: merchant
- **Notes**: Selects the email transport. Use `mock` for local development.

---

## Analytics and Monitoring

### `NEXT_PUBLIC_ANALYTICS_ID`
- **Format**: Analytics tracking ID
- **Used by**: merchant
- **Notes**: Client-side analytics tracking identifier.

### `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`
- **Format**: Sentry DSN URL
- **Used by**: merchant, ops-console, storefront
- **Notes**: Error tracking. Instrumentation only runs in `nodejs` or `edge` runtime. Disabled when `VAYVA_E2E_MODE=true`.

### `VAYVA_E2E_MODE`
- **Format**: `"true"` or `"false"`
- **Used by**: merchant
- **Notes**: When `true`, disables Sentry instrumentation during end-to-end tests.

---

## Uploads and Storage

### `UPLOADS_BUCKET`
- **Format**: S3 bucket name
- **Used by**: merchant
- **Notes**: Optional. S3-compatible bucket for file uploads.

### `UPLOADS_PUBLIC_BASE_URL`
- **Format**: Full URL
- **Used by**: merchant
- **Notes**: Optional. Public URL prefix for accessing uploaded files.

### `UPLOADS_SIGNING_SECRET`
- **Format**: Secret string
- **Used by**: merchant
- **Notes**: Optional. Used to sign upload URLs.

---

## Ops Console Specific

### `SLACK_WEBHOOK_URL`
- **Format**: Slack webhook URL
- **Used by**: ops-console
- **Notes**: Used by the monitoring system to send alerts to Slack when platform issues are detected.

### `FRAUD_WEBHOOK_SECRET`
- **Format**: Secret string
- **Used by**: ops-console
- **Notes**: Shared secret for authenticating incoming fraud detection webhook payloads.

### `OPS_RESCUE_ENABLE`
- **Format**: `"true"` or `"false"`
- **Used by**: ops-console
- **Notes**: Feature flag to enable/disable the AI-powered merchant rescue system.

### `NEXT_PUBLIC_OPS_CONSOLE_URL` / `NEXT_PUBLIC_BASE_URL`
- **Format**: Full URL
- **Used by**: ops-console
- **Notes**: Used for generating invitation links and public-facing ops console URLs.

---

## General / Runtime

### `NODE_ENV`
- **Values**: `development`, `production`, `test`
- **Used by**: all apps
- **Notes**: Automatically set by Vercel in production. Controls secure cookie settings, error display, API key selection (test vs. live), and Sentry initialization.

### `NEXT_PUBLIC_APP_URL`
- **Format**: Full URL
- **Used by**: merchant, storefront
- **Notes**: Public-facing application URL. Used for generating absolute URLs in robots.txt, sitemap, tracking links, and email templates.

### `NEXT_PUBLIC_API_URL`
- **Format**: Full URL or relative path (e.g., `/api`)
- **Default**: `/api`
- **Used by**: merchant, storefront
- **Notes**: Base URL for API requests from the client. In production, typically set to the backend API URL. Defaults to `/api` (relative to current domain).

### `VERCEL_ENV`
- **Values**: `production`, `preview`, `development`
- **Used by**: merchant
- **Notes**: Automatically set by Vercel. Used to adjust cookie settings (secure cookies only in production).

### `CI`
- **Format**: `"true"` when in CI
- **Used by**: merchant
- **Notes**: Skips env validation during CI builds.

---

## Domain Environment Variables (via `@vayva/shared`)

These are validated through `DomainEnvSchema` in the shared package:

### `MERCHANT_ORIGIN`
- **Format**: Full URL, e.g., `https://merchant.vayva.ng`
- **Notes**: Must match `NEXTAUTH_URL` in production. Used for CORS and origin validation.

---

## Setup Checklist

For a new deployment, ensure these minimum variables are set:

**All apps**:
- `DATABASE_URL`
- `NODE_ENV=production`

**Merchant**:
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `BACKEND_API_URL`
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
- `RESEND_API_KEY`
- `OPENROUTER_API_KEY`
- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`

**Ops Console**:
- `REDIS_URL`
- `PAYSTACK_SECRET_KEY`
- `RESEND_API_KEY`

**Storefront**:
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_LIVE_SECRET_KEY`
