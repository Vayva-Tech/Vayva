# Vayva Ops Console API Documentation

## Overview

The Ops Console provides administrative APIs for managing the Vayva platform.

## Authentication

All API routes require authentication via `OpsAuthService` session middleware.

```
Authorization: Bearer <token> (Cookie-based session)
```

## Core Endpoints

### Dashboard & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ops/dashboard/stats` | Platform-wide statistics |
| GET | `/api/ops/analytics/platform` | Detailed analytics data |

### Merchant Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ops/merchants` | List merchants with pagination |
| GET | `/api/ops/merchants/:id` | Get merchant details |
| PATCH | `/api/ops/merchants/:id` | Update merchant status |
| POST | `/api/ops/merchants/:id/suspend` | Suspend merchant |
| POST | `/api/ops/merchants/:id/activate` | Activate merchant |

### KYC Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ops/kyc` | List KYC submissions |
| PATCH | `/api/ops/kyc/:id` | Update KYC status |

### Support Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ops/support` | List support tickets |
| GET | `/api/ops/support/:id` | Get ticket details |
| PATCH | `/api/ops/support/:id` | Update ticket status |
| GET | `/api/ops/support/stats` | Support metrics |

### Feature Flags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ops/config/feature-flags` | Get feature flags |
| POST | `/api/ops/config/feature-flags` | Update feature flags |

### Tools & Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ops/tools/health` | System health check |
| POST | `/api/ops/tools/maintenance` | Toggle maintenance mode |

## Response Format

All responses follow the standard format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing session |
| 403 | Forbidden - Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |

## Audit Logging

All write operations are automatically logged with:
- User ID
- IP address
- User agent
- Request ID
- Timestamp
- Changes made

## Rate Limiting

Ops console APIs have stricter rate limits:
- 100 requests per minute per user
- 10 failed login attempts per 5 minutes
