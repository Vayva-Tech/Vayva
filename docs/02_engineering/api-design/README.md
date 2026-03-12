# API Design

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Vayva's API design follows RESTful principles with consistent patterns across all endpoints. This document outlines our API conventions, authentication, and best practices.

## API Architecture

### Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.vayva.ng/v1` |
| Staging | `https://api-staging.vayva.ng/v1` |
| Local | `http://localhost:3001/v1` |

### Authentication

All API requests require authentication using Bearer tokens:

```http
Authorization: Bearer <token>
```

Tokens are obtained through:
- Better Auth session cookies
- API keys (Pro plan only)

## Endpoint Conventions

### URL Structure

```
/api/{resource}/{action}
```

Examples:
- `GET /api/merchant/products` - List products
- `POST /api/merchant/products` - Create product
- `GET /api/merchant/products/:id` - Get single product
- `PATCH /api/merchant/products/:id` - Update product
- `DELETE /api/merchant/products/:id` - Delete product

### HTTP Methods

| Method | Action |
|--------|--------|
| GET | Retrieve resource(s) |
| POST | Create resource |
| PATCH | Partial update |
| PUT | Full replacement |
| DELETE | Remove resource |

### Response Format

All responses follow a consistent structure:

**Success (200-299):**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error (400-599):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

## Core APIs

### Merchant API

Base: `/api/merchant`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | GET | List products |
| `/products` | POST | Create product |
| `/products/:id` | GET | Get product |
| `/products/:id` | PATCH | Update product |
| `/products/:id` | DELETE | Delete product |
| `/orders` | GET | List orders |
| `/orders/:id` | GET | Get order details |
| `/orders/:id/status` | PATCH | Update order status |
| `/customers` | GET | List customers |
| `/customers/:id` | GET | Get customer |
| `/inventory` | GET | Get inventory status |
| `/analytics` | GET | Get merchant analytics |

### Storefront API

Base: `/api/storefront`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stores/:slug` | GET | Get store details |
| `/stores/:slug/products` | GET | List store products |
| `/stores/:slug/products/:id` | GET | Get product details |
| `/checkout` | POST | Initiate checkout |
| `/orders/:ref` | GET | Get order by reference |

### Webhook API

Base: `/api/webhooks`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/paystack` | POST | Paystack payment events |
| `/evolution` | POST | WhatsApp message events |
| `/kwik` | POST | Delivery status updates |

### Ops Console API

Base: `/api/ops`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/merchants` | GET | List all merchants |
| `/merchants/:id` | GET | Get merchant details |
| `/merchants/:id/impersonate` | POST | Impersonate merchant |
| `/support/tickets` | GET | List support tickets |
| `/analytics/platform` | GET | Platform-wide analytics |
| `/rescue/incidents` | GET | List rescue incidents |

## Query Parameters

### Pagination

```
GET /api/merchant/products?page=1&limit=20
```

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `page` | 1 | - | Page number |
| `limit` | 20 | 100 | Items per page |

### Sorting

```
GET /api/merchant/products?sort=-createdAt
```

- Prefix with `-` for descending order
- Multiple sorts: `sort=-createdAt,name`

### Filtering

```
GET /api/merchant/products?status=active&category=electronics
```

### Search

```
GET /api/merchant/products?q=laptop
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

| Plan | Requests/Minute |
|------|-----------------|
| Free | 60 |
| Starter | 120 |
| Pro | 300 |

Rate limit headers:
```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1640995200
```

## API Versioning

Current version: `v1`

Version is specified in URL path:
```
/api/v1/merchant/products
```

Breaking changes will increment version (v2, v3, etc.)

## SDK & Client Libraries

### Official SDKs

- JavaScript/TypeScript: `@vayva/api-client`

### Example Usage

```typescript
import { VayvaClient } from '@vayva/api-client';

const client = new VayvaClient({
  apiKey: 'your-api-key',
  environment: 'production'
});

// List products
const products = await client.products.list({
  page: 1,
  limit: 20
});

// Create product
const product = await client.products.create({
  name: 'New Product',
  price: 10000,
  inventory: 50
});
```

## Webhooks

### Events

| Event | Description |
|-------|-------------|
| `order.created` | New order placed |
| `order.paid` | Order payment confirmed |
| `order.shipped` | Order dispatched |
| `order.delivered` | Order completed |
| `payment.success` | Payment successful |
| `payment.failed` | Payment failed |

### Webhook Payload

```json
{
  "event": "order.created",
  "timestamp": "2026-03-07T10:30:00Z",
  "data": {
    "orderId": "12345",
    "refCode": "ORD-12345",
    "total": 26500,
    "customer": { ... }
  }
}
```

## Testing

### Sandbox Environment

Use staging API for testing:
```
https://api-staging.vayva.ng/v1
```

### Test Cards (Paystack)

| Card Number | Result |
|-------------|--------|
| 4084 0840 8408 4081 | Success |
| 5060 6660 6666 6666 666 | Success (Verve) |

---

**Questions?** Contact api-support@vayva.ng
