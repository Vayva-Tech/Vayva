# Frontend API Calls → Fastify Route Mapping

## Core Commerce Pages

### Products Page (`/dashboard/products`)

| Frontend Call   | Fastify Route      | Status             |
| --------------- | ------------------ | ------------------ |
| `/api/products` | `/api/v1/products` | ⚠️ Prefix mismatch |

### Orders Page (`/dashboard/orders`)

| Frontend Call          | Fastify Route             | Status             |
| ---------------------- | ------------------------- | ------------------ |
| `/api/orders`          | `/api/v1/orders`          | ⚠️ Prefix mismatch |
| `/api/orders?status=X` | `/api/v1/orders?status=X` | ⚠️ Prefix mismatch |
| `/api/dashboard/kpis`  | `/api/v1/dashboard`       | ⚠️ Prefix mismatch |

### Customers Page (`/dashboard/customers`)

| Frontend Call    | Fastify Route       | Status             |
| ---------------- | ------------------- | ------------------ |
| `/api/customers` | `/api/v1/customers` | ⚠️ Prefix mismatch |

### Finance Page (`/dashboard/finance`)

| Frontend Call              | Fastify Route     | Status              |
| -------------------------- | ----------------- | ------------------- |
| `/api/v1/finance/overview` | `/api/v1/finance` | ✅ Already correct! |

### Billing Page (`/dashboard/billing`)

| Frontend Call                     | Fastify Route     | Status            |
| --------------------------------- | ----------------- | ----------------- |
| `/api/merchant/billing/status`    | `/api/v1/billing` | ⚠️ Different path |
| `/api/billing/downgrade`          | `/api/v1/billing` | ⚠️ Different path |
| `/api/merchant/billing/subscribe` | `/api/v1/billing` | ⚠️ Different path |

## Required Changes

### Option A: Update Frontend API Client

Change `NEXT_PUBLIC_API_URL` to point to Fastify:

```
NEXT_PUBLIC_API_URL=https://api.vayva.ng/api/v1
```

### Option B: Update Frontend Endpoint Paths

Change all `/api/` calls to `/api/v1/` calls.

### Option C: Both

1. Change api-client base URL to Fastify
2. Update endpoint paths to match Fastify routes
