# Branch 3 API Reference - AI & Intelligent Services

Quick reference for all migrated AI service endpoints.

---

## Base URL
```
http://localhost:3001/api/v1
```

---

## AI Service (`/ai`)

### Health Check
```http
GET /api/v1/ai/health
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "status": "ready",
    "ai_enabled": true,
    "api_key_configured": true,
    "model": "llama-3.1-70b-versatile"
  }
}
```

### Chat
```http
POST /api/v1/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "channel": "web" // or "whatsapp" or "app"
}

Response:
{
  "success": true,
  "data": { ...ai_response },
  "timestamp": "2026-03-27T..."
}
```

### Get Conversations
```http
GET /api/v1/ai/conversations?page=1&limit=50&status=completed&platform=whatsapp
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "conversations": [...],
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### Get Analytics
```http
GET /api/v1/ai/analytics
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalConversations": 150,
    "activeConversations": 25,
    "completedConversations": 120,
    "totalSaleValue": 5000.00,
    "period": "24h"
  }
}
```

### WhatsApp Webhook
```http
POST /api/v1/ai/whatsapp/webhook
Authorization: Bearer <token>
Content-Type: application/json

Body: { ...whatsapp_payload }

Response:
{
  "success": true,
  "data": { ...ai_response }
}
```

---

## AI Agent Service (`/ai-agent`)

### Get Profile
```http
GET /api/v1/ai-agent/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "profile": {
      "id": "maip-...",
      "name": "Assistant",
      "prompt": "",
      "isLive": false,
      "features": []
    },
    "store": { ... },
    "config": {
      "name": "My Agent",
      "avatarUrl": "...",
      "tone": "professional",
      "signature": ""
    }
  }
}
```

### Update Profile Draft
```http
PUT /api/v1/ai-agent/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "My Agent",
  "avatarUrl": "https://...",
  "tone": "friendly",
  "signature": "Best regards"
}

Response:
{
  "success": true,
  "data": {
    "ok": true,
    "config": { ... }
  }
}
```

### Publish Profile
```http
POST /api/v1/ai-agent/profile/publish
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "ok": true,
    "profile": { ... }
  }
}
```

### Test Message
```http
POST /api/v1/ai-agent/test-message
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "message": "Hello, test message"
}

Response:
{
  "success": true,
  "data": { ...ai_response }
}
```

---

## Automation Service (`/automation`)

### List Rules
```http
GET /api/v1/automation/rules
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "ar-...",
        "key": "welcome_email",
        "name": "Welcome Email",
        "triggerType": "CUSTOMER_CREATED",
        "actionType": "SEND_EMAIL",
        "mfaEnabled": false,
        "config": { ... },
        "createdAt": "2026-03-27T...",
        "updatedAt": "2026-03-27T..."
      }
    ]
  }
}
```

### Create Rule
```http
POST /api/v1/automation/rules
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "key": "abandoned_cart",
  "name": "Abandoned Cart Reminder",
  "triggerType": "ABANDONED_CHECKOUT",
  "actionType": "SEND_EMAIL",
  "config": {
    "delay": 3600,
    "templateId": "..."
  }
}

Response:
{
  "success": true,
  "data": {
    "rule": { ... }
  }
}
```

### Update Rule
```http
PUT /api/v1/automation/rules/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "config": { ... }
}

Response:
{
  "success": true,
  "data": {
    "rule": { ... }
  }
}
```

### Delete Rule
```http
DELETE /api/v1/automation/rules/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {}
}
```

### Toggle Rule
```http
POST /api/v1/automation/rules/:id/toggle
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "rule": {
      "id": "...",
      "enabled": false
    }
  }
}
```

### Execute Rule
```http
POST /api/v1/automation/rules/:id/execute
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "customerId": "cust-...",
  "orderId": "ord-..."
}

Response:
{
  "success": true,
  "data": {
    "action": "email_sent",
    "ruleId": "..."
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

The token is obtained from the `/api/v1/auth/login` endpoint.

---

## Rate Limiting

**Note:** Rate limiting should be implemented at the gateway level for production. Recommended limits:

- AI Chat: 100 requests/minute per store
- Conversations: 60 requests/minute
- Automation: 30 requests/minute
- Webhooks: 1000 requests/minute

---

## Environment Configuration

Required environment variables:

```env
# AI Configuration
ENABLE_AI_ASSISTANT=true
OPENROUTER_API_KEY=your-api-key-here
AI_MODEL=llama-3.1-70b-versatile

# Server Configuration
JWT_SECRET=your-secret-key-min-32-characters
PORT=3001

# Optional
LOG_LEVEL=info
```
