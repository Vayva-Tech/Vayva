# AI Agent

> **Package:** `packages/ai-agent`
> **Type:** Shared library + standalone server
> **Language:** TypeScript

## Purpose

The AI Agent package is Vayva's conversational commerce engine. It powers the AI sales assistant that communicates with customers via WhatsApp, recommending products, answering questions, processing orders, and escalating to human support when necessary. The agent is profile-aware (each merchant configures their own personality), limit-enforced (respects credit and subscription limits), and RAG-powered (retrieves store-specific knowledge to generate accurate responses).

## How It Works

### High-Level Flow

```
Customer sends WhatsApp message
  --> Evolution API receives the message
  --> Worker (whatsapp-inbound queue) picks up the message
  --> Worker calls SalesAgent.handleMessage(storeId, messages)
  --> SalesAgent pipeline:
      1. Check AI usage limits (credits, subscription tier)
      2. Detect escalation triggers (payment disputes, fraud, negative sentiment)
      3. Load store context (profile, products, policies, fulfillment settings)
      4. Classify customer objections (ConversionService)
      5. Build persona-aware system prompt
      6. Retrieve relevant knowledge via RAG (MerchantBrainService)
      7. Call LLM for response generation (Groq API)
      8. Track AI usage (tokens consumed, credits deducted)
  --> Worker sends response via WhatsApp (whatsapp-outbound queue)
  --> Customer receives the reply
```

### Entry Point

The primary entry point is the `SalesAgent` class exported from `packages/ai-agent/src/lib/ai/sales-agent.ts`:

```typescript
SalesAgent.handleMessage(storeId: string, messages: IncomingMessage[], options?: HandleMessageOptions)
```

This method orchestrates the entire conversation pipeline and returns a response message along with metadata (status, escalation data, usage info).

## Conversation Flow

### 1. Limit Check

Before processing any message, the agent checks whether the merchant has sufficient AI credits:

- **AiUsageService.checkLimits()** -- Verifies the store's credit balance and subscription allowances
- If limits are exceeded, the agent returns a friendly message explaining the limitation and suggests the merchant upgrade or purchase additional credits
- The response includes a `requiredAction: "BUY_ADDON_OR_UPGRADE"` flag for the frontend to display an upgrade prompt

### 2. Escalation Detection

The agent scans the customer's message for triggers that require human intervention:

| Trigger | Detection Method | Priority |
|---------|-----------------|----------|
| `PAYMENT_DISPUTE` | Keywords related to payment problems, refunds, chargebacks | Urgent |
| `FRAUD_RISK` | Suspicious patterns, known fraud indicators | Urgent |
| `BILLING_ERROR` | Pricing discrepancies, incorrect charges | High |
| `SENTIMENT` | Negative sentiment exceeding threshold | Medium |

When a trigger is detected:
- A support ticket is created with appropriate priority
- A `HandoffEvent` audit record is logged
- The customer receives a handoff message (e.g., "I'm connecting you with our support team who can help with this...")
- The conversation is flagged for human review

### 3. Context Loading

The agent loads four categories of context in parallel for maximum performance:

- **Store data** -- Store name, category, and settings from the database
- **Merchant AI profile** -- Agent name, tone preset, brevity mode, persuasion level
- **RAG context** -- Top 3 most relevant knowledge chunks retrieved by `MerchantBrainService.retrieveContext()` based on the customer's message
- **Fulfillment policy** -- Pickup/delivery availability, delivery provider, pickup point locations

### 4. Conversion Intelligence

The `ConversionService` analyzes the customer's message for purchase objections and determines persuasion strategy:

- **Objection classification** -- Identifies objections like "too expensive", "not sure about quality", "need to think about it"
- **Persuasion strategy** -- Determines the appropriate level of sales pressure based on the merchant's configured persuasion level (1-5)
- **Objection tracking** -- Records objection events for analytics

### 5. Response Generation

The agent constructs a system prompt incorporating:
- Store identity and branding
- Agent personality (name, tone, brevity)
- Product catalog knowledge
- Fulfillment policies (delivery areas, pickup points)
- Return and refund policies
- Business hours
- RAG-retrieved context specific to the customer's question

The prompt is sent to the LLM along with the conversation history, and the response is returned to the customer.

## Product Recommendation Engine

The `packages/ai-agent/src/lib/ml/recommendation-engine.ts` module powers product recommendations:

- **Collaborative filtering** -- Recommends products based on what similar customers purchased
- **Content-based filtering** -- Suggests products similar to what the customer has viewed or asked about
- **Contextual awareness** -- Factors in the current conversation topic when making recommendations
- **Real-time scoring** -- Ranks recommendations by relevance to the active conversation

The recommendation engine runs locally (no API calls) using statistical models, making it cost-free for merchants.

## Order Placement via Chat

Customers can complete purchases entirely within WhatsApp:

1. **Product inquiry** -- Customer asks about a product; agent provides details and pricing
2. **Add to cart** -- Customer expresses purchase intent; agent confirms items and quantities
3. **Delivery details** -- Agent collects delivery address or confirms pickup location
4. **Payment** -- Agent sends a Paystack payment link via WhatsApp
5. **Confirmation** -- Once payment is verified, the agent confirms the order and provides an order number

## Escalation to Human

### Automatic Escalation

The `EscalationService` handles handoffs from AI to human support:

```typescript
EscalationService.triggerHandoff({
  storeId,
  conversationId,
  trigger,        // PAYMENT_DISPUTE | FRAUD_RISK | BILLING_ERROR | SENTIMENT
  reason,         // Human-readable explanation
  aiSummary,      // AI-generated summary of the conversation so far
})
```

The service:
1. Creates a `SupportTicket` with priority mapped from the trigger type
2. Creates a `HandoffEvent` audit record linking the conversation to the ticket
3. Logs the escalation for operational monitoring

### Priority Mapping

| Trigger | Priority |
|---------|----------|
| `PAYMENT_DISPUTE` | Urgent |
| `FRAUD_RISK` | Urgent |
| `BILLING_ERROR` | High |
| `SENTIMENT` | Medium |
| Other | Low |

### Manual Takeover

Merchants can manually take over any AI conversation from the Merchant Admin Dashboard. When a merchant responds, the AI pauses its auto-replies for that conversation.

## Configurable Personality and Tone

Each merchant's AI agent has a unique personality defined by the `MerchantAiProfile`:

| Setting | Options | Effect |
|---------|---------|--------|
| **Agent name** | Any string | Used in greetings and sign-offs (e.g., "Hi! I'm Aisha from FashionHub") |
| **Tone preset** | `friendly`, `professional`, `casual`, `luxury` | Controls vocabulary, emoji usage, and formality level |
| **Brevity mode** | `concise`, `balanced`, `detailed` | Determines response length and depth |
| **Persuasion level** | 1-5 (integer) | Controls how actively the agent promotes products and pushes for conversions |

### Tone Examples

**Friendly tone:**
> "Hey there! Great choice -- that dress is one of our bestsellers. Want me to check what sizes we have?"

**Professional tone:**
> "Thank you for your interest. The item you've selected is available in multiple sizes. Shall I provide the size chart for your reference?"

**Luxury tone:**
> "An excellent selection. This piece is crafted from premium Italian silk. I'd be delighted to arrange a viewing for you."

## Supported AI Models

### Groq (Primary Provider)

Used for all real-time WhatsApp conversations:

| Model | Use Case | Speed |
|-------|----------|-------|
| `llama-3.1-8b-instant` | Quick responses, simple queries | Ultra-fast |
| `llama-3.1-70b-versatile` | Default for most conversations | Fast |
| `mixtral-8x7b-32768` | Complex reasoning, detailed product comparisons | Moderate |

### DeepSeek (Secondary Provider)

Used for backend AI tasks and complex reasoning:

| Model | Use Case |
|-------|----------|
| `deepseek-chat` | General conversational AI |
| `deepseek-coder` | Code generation and analysis (internal tools) |
| `deepseek-reasoner` | Complex reasoning tasks |

### Local ML Models (Free)

The agent also uses locally-running ML models that incur no API costs:

| Model | Type | Use Case |
|-------|------|----------|
| Lexicon-based | Sentiment | Analyze customer message sentiment |
| Rule-based | Intent | Classify customer intent (browsing, buying, complaining) |
| Statistical | Forecast | Sales forecasting for merchants |
| Collaborative filter | Recommendation | Product recommendations |
| TF-IDF | Embedding | Text similarity for knowledge retrieval |

## Package Structure

```
packages/ai-agent/src/
  index.ts                    # Package exports
  sales-agent.ts              # Re-exports SalesAgent class
  server.ts                   # Standalone server entry point
  voice-commerce.service.ts   # Voice commerce capabilities
  lib/
    ai/
      sales-agent.ts          # Core SalesAgent class
      groq-client.ts          # Groq API client
      deepseek-client.ts      # DeepSeek API client
      openrouter-client.ts    # OpenRouter API client
      providers.ts            # Provider configuration
      ai-usage.service.ts     # Credit tracking and limit enforcement
      conversion.service.ts   # Objection classification and persuasion
      merchant-brain.service.ts  # RAG context retrieval
      voice-processor.ts      # Voice message processing
    ml/
      index.ts                # ML module exports
      intent-classifier.ts    # Intent classification
      sentiment-analyzer.ts   # Sentiment analysis
      recommendation-engine.ts # Product recommendations
      sales-forecaster.ts     # Sales prediction
      ml-client.ts            # ML model client
      simple-embedding.ts     # TF-IDF embeddings
    support/
      escalation.service.ts   # Human handoff service
    governance/
      data-governance.service.ts # Data privacy and governance
    error.ts                  # Error handling utilities
    logger.ts                 # Logging
  services/
    notifications.ts          # Notification dispatch
    whatsapp.ts              # WhatsApp message sending
```

## Credit and Usage Tracking

Every AI interaction is metered:

- **Token counting** -- Input and output tokens are counted per LLM call
- **Credit deduction** -- 0.24 credits per 1,000 tokens consumed
- **Usage logging** -- Each interaction is logged with store ID, conversation ID, model used, and tokens consumed
- **Real-time balance** -- Credit balance is updated in real-time and available via the merchant dashboard
- **Limit enforcement** -- When credits are exhausted, the agent gracefully declines to respond and notifies the merchant

## Data Governance

The `DataGovernanceService` ensures compliance with data handling requirements:

- **PII handling** -- Customer personal data is processed according to governance policies
- **Data retention** -- Conversation logs respect configured retention periods
- **Consent tracking** -- Customer consent for data processing is tracked
- **Audit trail** -- All data access and processing events are logged
