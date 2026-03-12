# API Entrypoints (Where APIs live)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Vayva is a monorepo with multiple Next.js apps, and API routes exist in multiple places. This doc tells you where to look.

## Primary backend API
- **Core API:** `Backend/core-api/src/app/api/**`
  - Next.js route handlers
  - This is the primary shared backend surface.

## App-specific APIs
Some apps ship their own route handlers for app-local needs.

- **Ops Console API:** `Frontend/ops-console/src/app/api/ops/**`
  - Ops-only endpoints
  - Must enforce ops session/auth

- **Merchant Admin API:** `Frontend/merchant-admin/src/app/api/**`
  - Merchant-specific endpoints
  - Many routes should use the canonical auth wrapper.

- **Storefront API:** `Frontend/storefront/src/app/api/**`
  - Public/customer endpoints
  - Must be careful about rate limiting + tenant isolation

- **Marketing API:** `Frontend/marketing/src/app/api/**`
  - Public endpoints (if any)
  - Must be rate-limited for anything calling paid providers

## How to find an endpoint
### Search patterns
- Find route handlers:
  - Search for `route.ts` under app folders.

From repo root (examples):
```bash
# list all route handler files
find Backend Frontend -name route.ts

# find Paystack-related routes
rg -n "paystack" Backend Frontend

# find webhook routes
rg -n "webhooks" Backend Frontend

# find Evolution/WhatsApp routes
rg -n "evolution|whatsapp" Backend Frontend
```

### Entry points per feature
- Payments: Paystack initialization + verification routes (search for `paystack`)
- Webhooks: `webhooks` routes (search for `/webhooks/`)
- WhatsApp: Evolution integration routes (search for `evolution`)

## Conventions
- Always validate input.
- Always scope by tenant (`storeId`) where applicable.
- Never leak provider errors directly to clients.

## Ownership
- If you add a new API route, add it to the relevant section above.
- Document required env vars.
- Document auth requirements (public vs merchant vs ops).
