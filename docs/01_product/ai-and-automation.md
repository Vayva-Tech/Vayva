# AI and Automation

> Last updated: 2026-03-23

---

## Overview

AI is not a bolt-on feature at Vayva -- it is central to the platform's value proposition. Every merchant gets an AI-powered sales agent that handles customer conversations on WhatsApp 24/7. Higher-tier merchants get autonomous operations through the Autopilot engine and a visual workflow builder for custom automations.

The AI system is designed for the Nigerian market: it handles Naira pricing, Nigerian English and Pidgin, and integrates with WhatsApp as the dominant customer channel.

---

## AI Models

Vayva uses a multi-model strategy, routing requests to the most cost-effective model for each task.

### Primary Model: GPT-4o Mini

- **Provider:** OpenRouter (`openai/gpt-4o-mini`)
- **Usage:** 95% of all AI requests
- **Cost:** NGN 0.24 per 1,000 tokens
- **Use cases:** Customer-facing chat, product recommendations, order assistance, FAQ responses, content generation
- **Why this model:** Best balance of cost, speed, multilingual capability, and quality for conversational commerce

### Autopilot Model: Llama 3.3 70B Instruct

- **Provider:** Groq (`meta-llama/llama-3.3-70b-instruct`)
- **Cost:** NGN 0.34 per 1,000 tokens
- **Use cases:** Autonomous business operations -- inventory optimization, marketing recommendations, customer re-engagement strategies
- **Why this model:** 67% cheaper than previous Llama 3 70B, fast inference on Groq hardware, strong reasoning for business logic

### Fallback Models (Auto-Routed)

| Model | Provider | Cost (NGN/1K tokens) | Use Case |
|-------|----------|---------------------|----------|
| Claude 3 Sonnet | Anthropic via OpenRouter | 2.40 | Complex reasoning, legal document analysis |
| Mistral Large | Mistral via OpenRouter | 1.60 | Code generation, technical tasks |

The `OpenRouterClient` automatically selects the appropriate model based on the request type. The default is always GPT-4o Mini unless the task requires specialized capabilities.

---

## Credit System

All AI usage is metered through a credit system to provide cost predictability for both Vayva and merchants.

### How Credits Work

1. Each subscription tier includes a monthly credit allocation (STARTER: 5,000 / PRO: 10,000 / PRO_PLUS: 25,000)
2. Credits are allocated when the subscription is activated
3. Every AI API call consumes credits based on the model used and tokens processed
4. When credits run low (200 remaining), the merchant receives an alert
5. When credits are exhausted, AI responses are blocked and a "credits exhausted" message is returned
6. Merchants can purchase top-up packages at any time

### Credit Consumption Formula

```
Credits = (Actual API Cost in NGN) / 0.9
```

This targets approximately a 70% profit margin on AI costs. The base credit value is NGN 3 per credit (derived from the NGN 3,000 / 1,000 credits small top-up package).

### Consumption by Activity

| Activity | Approximate Credit Cost |
|----------|------------------------|
| Single WhatsApp conversation turn | 1-3 credits |
| Product recommendation | 2-5 credits |
| Content generation (product description) | 3-8 credits |
| Image generation | 10 credits |
| Tool call (order lookup, inventory check) | 0.5 credits |
| Autopilot analysis (daily run) | 20-50 credits |

### Credit Budgets per Tier

| Tier | Monthly Credits | Estimated Conversations/Month |
|------|----------------|-------------------------------|
| STARTER | 5,000 | ~1,000 conversation turns |
| PRO | 10,000 | ~2,000 conversation turns |
| PRO_PLUS | 25,000 | ~5,000 conversation turns |

### Top-Up Packages

| Package | Credits | NGN Price |
|---------|---------|-----------|
| Small | 3,000 | NGN 3,000 |
| Medium | 8,000 | NGN 7,000 |
| Large | 20,000 | NGN 15,000 |

Top-ups are processed via Paystack and credits are added immediately. Multi-currency pricing is available (see `docs/01_product/pricing-and-billing.md`).

### Implementation

- **Credit service:** `Backend/core-api/src/lib/ai/credit-service.ts` (`AICreditService` class)
- **Usage tracking:** `AiUsageEvent` and `AiUsageDaily` database models
- **Subscription model:** `MerchantAiSubscription` tracks `totalCreditsPurchased`, `creditsRemaining`, `lastTopupAt`, `lastCreditAlertAt`
- **Top-up purchases:** `AiAddonPurchase` records each credit package purchase

---

## AI Sales Agent

The AI Sales Agent is the customer-facing component of Vayva's AI system. It engages with customers on behalf of the merchant via WhatsApp and web chat.

### Architecture

```
Customer Message (WhatsApp/Web)
    |
    v
Evolution API / Web Chat Widget
    |
    v
Vayva Webhook Handler
    |
    v
AI Sales Agent (SalesAgent class)
    |-- Loads merchant catalog and settings
    |-- Loads MerchantAiProfile (tone, name, rules)
    |-- Loads conversation history
    |-- Calls OpenRouter API (GPT-4o Mini)
    |-- Deducts credits via AICreditService
    |
    v
Response sent back to customer
    |
    v
Conversation logged (Conversation + Message models)
```

### Agent Capabilities

| Capability | Description |
|-----------|-------------|
| Product inquiry | Searches the merchant's catalog and provides product details, pricing, and availability |
| Order placement | Guides customers through product selection and order creation |
| Product recommendations | Suggests related or complementary products based on context |
| FAQ handling | Answers frequently asked questions from the merchant's knowledge base |
| Order status lookup | Retrieves and communicates order status to customers |
| Payment guidance | Directs customers to appropriate payment methods |
| Human handoff | Escalates conversations to merchant staff based on configurable rules |
| Image understanding | Can process and respond to images sent by customers (when enabled) |
| Voice note processing | Transcribes voice notes via the `VoiceProcessor` module |

### Agent Personality Configuration

Each merchant configures their AI agent through the `MerchantAiProfile` model:

**Tone Presets:**
- **Friendly** -- warm, approachable, uses casual language
- **Professional** -- formal, business-appropriate
- **Luxury** -- premium, refined, aspirational language
- **Playful** -- fun, energetic, uses emojis and informal expressions
- **Minimal** -- concise, direct, no filler

**Persuasion Levels:**
- **Level 0** -- purely informational, answers questions without selling
- **Level 1** -- gentle suggestions, mentions related products
- **Level 2** -- active recommendations, highlights deals and benefits
- **Level 3** -- assertive selling, creates urgency, pushes for conversion

**Brevity Modes:**
- **Short** -- concise responses, ideal for WhatsApp where long messages are ignored
- **Medium** -- balanced detail, suitable for web chat

**Additional Settings:**
- Custom greeting and sign-off templates
- Escalation rules (e.g., "escalate if customer mentions complaint or refund")
- Prohibited claims (e.g., "never claim we offer free shipping")
- Policy overrides
- Language preference

### PII Protection

Before any text is sent to the AI API, the `OpenRouterClient` sanitizes it by stripping:
- Email addresses (replaced with `[REDACTED_EMAIL]`)
- Phone numbers (replaced with `[REDACTED_PHONE]`)
- Card-like number sequences (replaced with `[REDACTED_SENSITIVE]`)

This ensures customer PII is never sent to external AI providers.

---

## WhatsApp Integration

WhatsApp is the primary customer engagement channel for Nigerian businesses. Vayva integrates with WhatsApp through the **Evolution API**, a self-hosted WhatsApp gateway.

### How It Works

1. **Instance setup** -- during onboarding, a WhatsApp instance is created for the merchant's store via Evolution API
2. **QR code connection** -- the merchant scans a QR code to link their WhatsApp Business number
3. **Webhook registration** -- Vayva registers a webhook URL with Evolution API to receive inbound messages
4. **Message flow:**
   - Customer sends a message to the merchant's WhatsApp number
   - Evolution API receives the message and forwards it to Vayva's webhook endpoint
   - The AI Sales Agent processes the message using the merchant's catalog and profile settings
   - The response is sent back through Evolution API to the customer
   - The entire conversation is logged in the `Conversation` and `Message` models

### WhatsApp Agent Settings

Per-store WhatsApp configuration (`WhatsAppAgentSettings` model):

| Setting | Description |
|---------|-------------|
| Business hours | Define operating hours; auto-reply outside hours |
| Auto-reply | Automatic response when unavailable |
| Catalog mode | `StrictCatalogOnly` (only discuss listed products) or `CatalogPlusFAQ` (products + general questions) |
| Image understanding | Enable/disable processing of customer-sent images |
| Order status access | Allow AI to look up and share order status |
| Payment guidance mode | How the AI directs customers to pay |
| Daily message limits | Maximum messages per user per day |
| Human handoff | Enable/disable and configure destination routing |
| Safety filters | Content filtering for inappropriate messages |

### Templates and Broadcasts

- **WhatsApp Templates** (`WhatsAppTemplate`) -- reusable message templates with variable substitution and an approval workflow
- **WhatsApp Broadcasts** (`WhatsAppBroadcast`) -- bulk message campaigns with segment targeting
- **Delivery tracking** (`WhatsAppBroadcastRecipient`) -- per-recipient status tracking (sent, delivered, read, failed)

---

## Workflow Builder (PRO_PLUS Only)

The visual workflow builder allows merchants to create custom automation flows without code.

### Components

| Component | Description |
|-----------|-------------|
| **Triggers** | Events that start a workflow |
| **Conditions** | Logic nodes that branch based on data |
| **Actions** | Operations performed by the workflow |
| **Delays** | Wait for a specified time before continuing |

### Available Triggers

| Trigger | Description |
|---------|-------------|
| `order_created` | New order is placed |
| `order_paid` | Payment is confirmed |
| `order_cancelled` | Order is cancelled |
| `inventory_low` | Stock falls below threshold |
| `customer_segment_entered` | Customer matches a segment criteria |
| `customer_segment_exited` | Customer no longer matches segment |
| `schedule` | Time-based trigger (cron) |
| `webhook` | External webhook received |
| `manual` | Manually triggered by merchant |
| `ai_intent_detected` | AI identifies a specific customer intent |
| `product_added` | New product is created |
| `product_updated` | Product is modified |
| `customer_created` | New customer is added |
| `payment_received` | Payment is processed |
| `refund_requested` | Refund is initiated |

### Available Actions

| Category | Actions |
|----------|---------|
| **Communication** | Send email, send SMS, send WhatsApp message, send push notification, send notification |
| **Commerce** | Update inventory, apply discount, create purchase order, update collection |
| **Customer** | Update customer record, tag customer, filter customers |
| **Operations** | Create task |
| **Industry-specific** | Fashion size alert, restaurant 86-item, and more |

### Logic Nodes

- **Condition** -- branch based on data evaluation (e.g., "if order total > NGN 50,000")
- **Delay** -- wait for a specified duration before proceeding
- **Split** -- parallel execution paths
- **Merge** -- rejoin parallel paths
- **Loop** -- repeat actions for a set of items

### Implementation

- **Engine:** `packages/workflow/engine/executor.ts` -- executes workflow definitions
- **Scheduler:** `packages/workflow/engine/scheduler.ts` -- manages time-based triggers
- **Node registry:** `packages/workflow/nodes/registry.ts` -- all available node types
- **Trigger registry:** `packages/workflow/triggers/registry.ts` -- all available triggers
- **Validation:** `packages/workflow/validation/` -- validates workflow definitions before execution

---

## AI Autopilot Engine

The Autopilot engine is an AI-powered operations assistant that analyzes store data and generates actionable recommendations for merchants. The **Autopilot add-on** (`vayva.autopilot` / `StoreAddOn.extensionId`) gates access. Merchants use **Dashboard → Autopilot** to run analysis, review runs, and approve or dismiss recommendations.

### How It Works

1. The engine collects a **business snapshot** -- a structured summary from Prisma (orders, products, bookings, carts with items for this store, disputes, invoices, flash sales ending soon, portfolio projects when present, etc.)
2. Industry-specific **rules** are evaluated against the snapshot (configured in `Backend/core-api/src/config/autopilot-rules.ts`)
3. Each triggered rule is sent to **OpenRouter** using a **Llama** instruct model (default `meta-llama/llama-3.3-70b-instruct`, overridable via `AUTOPILOT_OPENROUTER_MODEL`). Triggered rules are processed **in parallel** with bounded concurrency (`AUTOPILOT_RULE_CONCURRENCY`, default 4) to reduce wall-clock time
4. Recommendations are saved as `AutopilotRun` records with status `PROPOSED`
5. Merchants approve or dismiss runs via the API / dashboard; approving does not auto-execute commerce actions in-app (use webhooks or workflows separately if needed)

### Scheduling and integrations

- **Vercel Cron** (core-api `vercel.json`): `GET /api/jobs/cron/autopilot-evaluate` on a daily schedule, authorized with `Authorization: Bearer ${CRON_SECRET}`. Processes stores in **batches**: `AUTOPILOT_CRON_MAX_STORES` per batch (default 40), up to `AUTOPILOT_CRON_MAX_BATCHES` batches per invocation (default 5). If the JSON response includes `nextCursor`, call again with `?cursor=<storeId>` (same secret) until `hasMore` is false
- **External industry context (n8n, etc.)**: `POST /api/internal/autopilot/context` with JSON `{ "storeId", "externalBrief" }` and `Authorization: Bearer ${AUTOPILOT_INBOUND_SECRET}` (falls back to `CRON_SECRET` if unset). Merges into `Store.settings.autopilot.externalBrief` and is appended to LLM prompts when non-empty
- **Optional webhook** after each `PROPOSED` run: set `Store.settings.autopilot.proposedWebhookUrl` and `proposedWebhookSecret`; Vayva sends a JSON POST with `X-Autopilot-Signature: hex(hmac-sha256(secret, body))`
- **Optional webhook on approve**: when a merchant approves a run, if `approvedWebhookUrl` and `approvedWebhookSecret` are set (aliases: `automationWebhookUrl` / `automationWebhookSecret`), Vayva POSTs `event: autopilot.approved` with `runId`, `ruleSlug`, `title`, `summary`, `reasoning`, and `input` (snapshot JSON). If dispatched, `AutopilotRun.executedAt` is set and `output.automationWebhookDispatched` is true; n8n or a worker can apply discounts, send messages, etc.

### Configuration (environment)

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | Required for Autopilot LLM calls |
| `AUTOPILOT_OPENROUTER_MODEL` | Optional model id (default Llama 3.3 70B instruct on OpenRouter) |
| `AUTOPILOT_RULE_CONCURRENCY` | Parallel rule completions (1–8, default 4) |
| `AUTOPILOT_OPENROUTER_MAX_RETRIES` | Retries for OpenRouter 429/502/503 and transient errors (default 4) |
| `AUTOPILOT_CRON_MAX_BATCHES` | Autopilot cron: max batches per run (default 5) |
| `AUTOPILOT_INBOUND_SECRET` | Auth for internal context endpoint |
| `CRON_SECRET` | Auth for cron (and fallback for context endpoint) |
| `OPENROUTER_HTTP_REFERER` | Optional Referer header for OpenRouter |

### Business Snapshot Data Points

| Category | Metrics Analyzed |
|----------|-----------------|
| **Inventory** | Dead stock, low-velocity / low-stock signals from sales, flash sales ending soon |
| **Marketing** | Weak descriptions / SEO titles, top sellers, **abandoned carts** (carts with items for this store, stale updatedAt), external brief |
| **Customer Engagement** | Dormant customers, VIP customers, recent buyers (review signal placeholder), lapsed donors (nonprofit) |
| **Operations** | No-shows and booking utilization (same-day bookings), open disputes, overdue invoices |

### Industry-Specific Rules

Each industry vertical has its own set of autopilot rules. For example:
- **Restaurant:** Monitor prep times, flag kitchen backlog, suggest menu optimization
- **Retail:** Identify dead stock, recommend flash sales, flag overstock
- **Events:** Track no-shows, optimize booking slots, re-engage past attendees
- **Nonprofit:** Identify lapsed donors, suggest re-engagement campaigns

---

## ML Modules (On-Device)

The `packages/ai-agent/` package includes lightweight ML modules that run without external API calls:

| Module | Purpose |
|--------|---------|
| `SentimentAnalyzer` | Analyze customer message sentiment |
| `SalesForecaster` | Predict future sales trends |
| `RecommendationEngine` | Generate product recommendations |
| `IntentClassifier` | Classify customer message intent |
| `SimpleEmbedding` | Text embeddings for similarity search |

These modules use simple statistical models and heuristics, providing baseline intelligence without consuming AI credits.

---

## Data Governance

The AI system includes a `DataGovernanceService` (from `packages/ai-agent/`) that manages:

- Merchant consent tracking (`aiConsentGivenAt` on Store model)
- Data retention policies for AI-processed conversations
- AI agency status management (`INACTIVE`, `ACTIVE`, `RESTRICTED`)
- Compliance with Nigerian Data Protection Regulation (NDPR)
