# WhatsApp — Evolution API Integration

> Last updated: March 2026
> Owner: Engineering
> Implementation files:
> - `packages/ai-agent/src/services/whatsapp.ts` — `WhatsappManager` class (shared service)
> - `Frontend/merchant/src/app/api/whatsapp/webhook/route.ts` — webhook ingress proxy
> - `Frontend/ops-console/src/app/api/ops/config/global/route.ts` — Evolution API feature flag

---

## Overview

Vayva uses **Evolution API** as a self-hosted WhatsApp Business gateway. Evolution API wraps the WhatsApp Web protocol and exposes a REST interface for sending messages, managing connections (instances), and receiving inbound events via webhooks.

The integration enables the Vayva AI agent to communicate with merchants over WhatsApp — sending order alerts, answering merchant questions, and delivering automated reports — without requiring Meta's official Cloud API approval.

**Production gateway:** `http://163.245.209.202:8080`

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `EVOLUTION_API_URL` | Base URL of the Evolution API server | `http://163.245.209.202:8080` |
| `EVOLUTION_API_KEY` | Global API key for Evolution API authentication | Set by ops |

These are set in `turbo.json`'s `globalPassThroughEnv` and must be present in the Vercel project environment for both the merchant and ops-console frontends.

---

## Instance Management

Evolution API organises WhatsApp connections as **instances**. Each instance represents one WhatsApp number connected to the gateway.

### Creating an instance

```
POST /instance/create
Headers: { apikey: <EVOLUTION_API_KEY> }
Body: {
  "instanceName": "<unique-name>",
  "token": "<unique-name>",
  "qrcode": true
}
```

`instanceName` is used as the identifier for all subsequent calls. The `token` field doubles as a per-instance auth token (currently set equal to the instance name for simplicity).

### Connecting (fetching QR code)

```
GET /instance/connect/<instanceName>
Headers: { apikey: <EVOLUTION_API_KEY> }
```

Returns a QR code payload that the merchant scans with their WhatsApp mobile app to authenticate the session.

### Pairing by phone number (alternative to QR)

```
POST /instance/connect/<instanceName>/phonenumber
Headers: { apikey: <EVOLUTION_API_KEY>, Content-Type: application/json }
Body: { "phoneNumber": "2348012345678" }
```

Returns `{ "pairingCode": "ABCD-1234" }`. The merchant enters this code in WhatsApp Settings > Linked Devices.

### Checking instance state

```
GET /instance/fetchInstances
Headers: { apikey: <EVOLUTION_API_KEY> }
```

Returns all instances and their connection states (`open`, `connecting`, `close`).

---

## Sending Messages

### Text message

```
POST /message/sendText/<instanceName>
Headers: { apikey: <EVOLUTION_API_KEY>, Content-Type: application/json }
Body: {
  "number": "2348012345678",
  "options": { "delay": 1200, "presence": "composing" },
  "textMessage": { "text": "Hello from Vayva!" }
}
```

- `number` must be in E.164 format **without** the `+` prefix (e.g., `2348012345678` for a Nigerian number).
- The `WhatsappManager.sendMessage()` method strips all non-digit characters from the phone number before sending.
- `delay` is a simulated typing delay in milliseconds. `presence: "composing"` shows the "typing..." indicator to the recipient.

### Media message

Media is retrieved from messages via:

```
POST /chat/getBase64FromMediaMessage/<instanceName>
Headers: { apikey: <EVOLUTION_API_KEY>, Content-Type: application/json }
Body: {
  "message": {
    "key": {
      "id": "<messageId>",
      "remoteJid": "<jid>",
      "fromMe": false,
      "participant": "<participant-jid-for-groups>"
    }
  }
}
```

Returns `{ "base64": "...", "mimetype": "image/jpeg" }`.

---

## Webhook Setup

### How it works

Inbound WhatsApp events flow from the Evolution API server to the merchant backend via webhook. The merchant Next.js app proxies the event to the API gateway rather than processing it directly:

```
Evolution API server
  → POST /api/whatsapp/webhook  (merchant frontend, port 3000)
    → POST <NEXT_PUBLIC_API_URL>/webhooks/whatsapp/evolution  (core API gateway)
      → AI agent / notification engine
```

### Configuring the webhook on Evolution API

Register the webhook URL for an instance via the Evolution API admin panel or API call:

```
POST /webhook/set/<instanceName>
Headers: { apikey: <EVOLUTION_API_KEY>, Content-Type: application/json }
Body: {
  "url": "https://merchant.vayva.ng/api/whatsapp/webhook",
  "webhook_by_events": false,
  "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"]
}
```

For local development, use a tunnel tool (e.g., `ngrok`) to expose your local port:

```bash
ngrok http 3000
# Use the generated https URL as the webhook URL
```

### Webhook payload (inbound message example)

```json
{
  "event": "messages.upsert",
  "instance": "my-merchant-instance",
  "data": {
    "key": {
      "remoteJid": "2348012345678@s.whatsapp.net",
      "fromMe": false,
      "id": "ABCDEF123456"
    },
    "message": {
      "conversation": "I need help with my order"
    },
    "messageTimestamp": 1710000000,
    "pushName": "Customer Name"
  }
}
```

The merchant webhook route (`Frontend/merchant/src/app/api/whatsapp/webhook/route.ts`) forwards the raw body to the core API gateway, preserving the `apikey` and `authorization` headers. The gateway is responsible for parsing, validating, and routing the event.

> If `NEXT_PUBLIC_API_URL` is not set or is not an absolute URL, the webhook route returns HTTP 410 Gone with an error message explaining the misconfiguration. This prevents silent failures during local development.

---

## AI Agent Integration

The `@vayva/ai-agent` package (`packages/ai-agent/src/services/whatsapp.ts`) exports the same `WhatsappManager` class used by the ops-console. The AI agent calls `WhatsappManager.sendMessage()` to push outbound messages after processing an inbound webhook event.

Typical flow:

1. Merchant customer sends a WhatsApp message to the merchant's connected number.
2. Evolution API fires a `messages.upsert` webhook to `merchant.vayva.ng/api/whatsapp/webhook`.
3. The proxy forwards it to the API gateway at `<NEXT_PUBLIC_API_URL>/webhooks/whatsapp/evolution`.
4. The gateway routes the event to the AI agent service.
5. The AI agent (powered by Groq LLM via `GROQ_WHATSAPP_KEY`) generates a reply.
6. The AI agent calls `WhatsappManager.sendMessage(instanceName, customerPhone, replyText)`.
7. Evolution API delivers the message to the customer's WhatsApp.

---

## Ops Console Control

The Evolution API integration can be toggled on/off without a deployment via the ops console global configuration endpoint (`/api/ops/config/global`). The `evolutionApiEnabled` flag is checked by the AI agent before sending any messages. This flag is stored in memory on the ops-console instance; for multi-instance deployments it should be migrated to Redis or a `SystemConfig` database table.

---

## Rate Limits and Best Practices

### WhatsApp-enforced limits

WhatsApp Business accounts have per-number messaging limits that scale with account tier:

| Tier | 24-hour limit |
|------|--------------|
| Unverified | 250 conversations |
| Tier 1 | 1,000 conversations |
| Tier 2 | 10,000 conversations |
| Tier 3 | 100,000 conversations |

A "conversation" in WhatsApp's model is a 24-hour session opened by the first message in either direction. Limits apply to business-initiated conversations; customer-initiated conversations in response to a merchant message do not count against the business-initiated quota.

### Application-level best practices

- **Simulated typing delay:** All outbound text messages include `"delay": 1200` (1.2 seconds) and `"presence": "composing"` to make the AI agent feel more natural. Increase this for longer messages.
- **Phone number normalisation:** Always strip non-digit characters and ensure the number uses the full international format without `+` (e.g., `2348012345678`). The `WhatsappManager.sendMessage()` method does this automatically.
- **Error handling:** Catch `WhatsappManager` errors and log them with context (`instanceName`, `phone`). Do not expose Evolution API error responses to end-users.
- **Instance health:** Monitor instance connection state periodically. A disconnected instance (`close` state) will silently drop outbound messages. Reconnect or alert the merchant to re-scan the QR code.
- **One instance per merchant:** Each merchant WhatsApp number should have its own Evolution API instance. Do not reuse instances across merchants.
- **Webhook idempotency:** The API gateway should deduplicate incoming webhook events by `data.key.id` to handle Evolution API's at-least-once delivery guarantee.
- **Avoid bulk messaging:** Do not build bulk-broadcast flows on top of this integration. WhatsApp actively detects and bans numbers sending unsolicited bulk messages. Use official WhatsApp Business API templates for broadcast scenarios.
