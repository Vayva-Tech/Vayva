# Vayva Platform Glossary

> Last updated: 2026-03-23
> A comprehensive glossary of terms used across the Vayva platform.

---

## A

### AI Agent
The AI-powered sales assistant that handles customer conversations on behalf of a merchant. Each store has its own AI agent configured through the MerchantAiProfile. The agent can answer product questions, take orders, recommend products, and escalate to human staff when needed. Powered by GPT-4o Mini via OpenRouter.

### AI Credits
A metered unit of AI usage. Credits are consumed whenever the AI agent processes messages, generates content, or performs automated actions. Each tier includes a monthly credit allocation (STARTER: 5,000 / PRO: 10,000 / PRO_PLUS: 25,000). Credits do not roll over between billing periods. The base consumption rate is 0.24 credits per 1,000 tokens for GPT-4o Mini.

### API Access
The ability for merchants to programmatically interact with their store data via RESTful API endpoints. Available on PRO and PRO_PLUS tiers only. Authenticated via API keys stored in the `ApiKey` model.

### Approval Workflow
A business process requiring manager sign-off before certain actions are executed (e.g., large discounts, refunds above a threshold). Available on PRO and PRO_PLUS tiers.

### Audit Log
A chronological record of significant actions taken within a store or across the platform. Stored in the `AuditLog` (merchant-level) and `AdminAuditLog` (ops-level) database models. Used for compliance, debugging, and accountability.

### Autopilot
An AI-driven operations engine that analyzes a merchant's business data daily and generates actionable recommendations. Uses Llama 3.3 70B via Groq. Available on PRO and PRO_PLUS tiers. Merchants review and approve/reject each recommendation from the Autopilot dashboard.

### Autopilot Run
A single execution of the Autopilot engine for a specific store. Each run produces a business snapshot analysis and a set of recommendations stored as `AutopilotRun` records with status `PROPOSED`, `APPROVED`, or `REJECTED`.

---

## B

### Bank Beneficiary
A saved bank account that a merchant uses for wallet withdrawals. Stored in the `BankBeneficiary` model with bank name, account number, and account name.

### Brevity Mode
An AI agent configuration setting that controls response length. Options are `Short` (concise, ideal for WhatsApp) and `Medium` (more detailed, suitable for web chat).

### Broadcast
A bulk messaging feature allowing merchants to send WhatsApp messages to a targeted segment of customers. Managed through `WhatsAppBroadcast` with per-recipient delivery tracking.

### BullMQ
The job queue library used for background processing. Backed by Redis. Handles email delivery, AI processing, webhook handling, scheduled tasks, and more.

---

## C

### Catalog Mode
A WhatsApp agent setting that controls what the AI agent can discuss. `StrictCatalogOnly` limits responses to listed products only. `CatalogPlusFAQ` allows the agent to also answer general questions from the knowledge base.

### Collection
A curated group of products organized by theme, season, or category. Used on storefronts for merchandising and navigation.

### Conversation
A thread of messages between a customer and a merchant's AI agent (or human staff). Stored in the `Conversation` model with associated `Message` records. Can originate from WhatsApp or web chat.

### Core API
The primary backend service (`Backend/core-api/`) that handles authentication, business logic, and data operations. Built as Next.js API routes.

### Credit Top-Up
A one-time purchase of additional AI credits. Available in three packages: Small (3,000 credits / NGN 3,000), Medium (8,000 / NGN 7,000), Large (20,000 / NGN 15,000). Processed via Paystack.

### Custom Domain
The ability for a merchant to use their own domain name (e.g., `shop.mybusiness.com`) instead of the default `store.vayva.ng/slug`. Available on PRO and PRO_PLUS tiers. Verified via DNS checks.

---

## D

### Dashboard
The main interface of the merchant application, showing key metrics: revenue, orders, customers, AI usage, and recent activity. Data is cached in Redis with a 5-minute TTL.

### Dashboard Widget
A configurable card on the merchant dashboard displaying a specific metric or chart. Widget count is limited by tier (STARTER: 6, PRO: 10, PRO_PLUS: unlimited).

### Dead Letter Queue (DLQ)
A queue where failed BullMQ jobs are moved after exhausting all retry attempts. DLQ jobs are retained for 7 days and reviewed daily by the operations team.

---

## E

### Escalation
The process of transferring a customer conversation from the AI agent to a human staff member. Triggered by configurable rules (e.g., customer mentions "complaint" or "refund") or by AI judgment.

### Evolution API
A self-hosted WhatsApp gateway that Vayva uses to send and receive WhatsApp messages. Each merchant's WhatsApp instance is managed through Evolution API. Hosted at the VPS infrastructure.

### Extension
A plugin that adds functionality to a merchant's store. Managed through the `packages/extensions/` package.

---

## F

### Feature Gating
The mechanism that controls which features a merchant can access based on their subscription tier. Enforced at both the backend (`PLANS` configuration) and frontend (`isFeatureAvailable()`, `getFeatureLimit()`). Can be overridden per-store via `MerchantFeatureOverride`.

### Feature Override
A per-store configuration (`MerchantFeatureOverride`) that allows the ops team to grant or restrict specific features for individual merchants regardless of their subscription tier.

---

## G

### Groq
An AI inference provider used for running the Llama 3.3 70B model. Selected for its fast inference speed and cost efficiency. Used exclusively for the Autopilot engine.

---

## H

### Health Check
An endpoint (`/healthz`) exposed by each application that reports the status of the system and its dependencies (database, Redis). Used for synthetic monitoring.

### Human Handoff
The process and configuration for routing conversations from the AI agent to human merchant staff. Includes destination routing, notification preferences, and handoff criteria.

---

## I

### Idempotency Key
A unique identifier sent with payment API requests to prevent duplicate transactions. Implemented in `Backend/core-api/src/lib/idempotency.ts`.

### Industry Module
A specialized package (`packages/industry-*`) that adds vertical-specific features to a merchant's store. Examples: restaurant menu management, fashion size charts, event ticketing, real estate listings. Over 20 industry verticals are supported.

### Industry Dashboard
A dashboard view with metrics and tools specific to the merchant's industry vertical. Available on PRO and PRO_PLUS tiers.

---

## K

### Kill Switch
An emergency mechanism (`PlatformKillSwitch` model) that allows the ops team to immediately disable specific platform features without deploying code. Used for security incidents or runaway processes.

### Knowledge Base
A collection of information entries (`KnowledgeBaseEntry`) that the AI agent uses to answer questions beyond the product catalog. Merchants can add FAQ entries, policies, and custom information.

### Kobo
The smallest unit of Nigerian Naira currency (1 NGN = 100 kobo). All monetary values in the Vayva database are stored in kobo to avoid floating-point precision issues.

### KYC (Know Your Customer)
The identity verification process that merchants complete to unlock certain features (e.g., wallet withdrawals). Managed through the `KycRecord` model.

---

## M

### Membership
The association between a `User` and a `Store`, defining the user's role within that store. Roles include `OWNER`, `ADMIN`, and `STAFF`. Stored in the `Membership` model.

### Merchant
A business owner or operator who uses Vayva to sell products or services. A merchant can own one or more stores.

### Merchant AI Profile
The configuration object (`MerchantAiProfile`) that defines how a merchant's AI agent behaves: tone, persuasion level, brevity, greeting, escalation rules, prohibited claims, and language.

### MinIO
An S3-compatible object storage system used for file uploads (product images, voice notes, attachments). Self-hosted on the VPS infrastructure.

### Multi-Tenant
The architectural pattern where all merchant data is stored in a shared database but isolated by `storeId`. Every query is scoped to prevent cross-tenant data access.

---

## N

### NDPR (Nigeria Data Protection Regulation)
Nigeria's data protection law that governs how personal data is collected, stored, and processed. Vayva implements NDPR compliance through consent tracking, data retention policies, and the right to deletion.

---

## O

### OpenRouter
An AI model routing service that provides access to multiple AI models (GPT-4o Mini, Claude 3 Sonnet, Mistral Large) through a single API. Vayva uses OpenRouter as the primary AI provider, with automatic model selection based on task type.

### Ops Console
The internal operations application (`ops.vayva.ng`) used by the Vayva team to manage the platform. Provides views for merchant management, financial oversight, AI monitoring, compliance, and system health. Separate authentication from the merchant dashboard.

### Outbox Pattern
A reliability pattern where events are first written to a database table (`OutboxEvent`, `NotificationOutbox`) before being processed by workers. Ensures events are not lost even if the worker is temporarily unavailable.

---

## P

### Paystack
The payment gateway used for all financial transactions on Vayva. Supports card payments, bank transfers, USSD, and mobile money in Nigerian Naira. Handles subscription billing, store transactions, credit top-ups, and wallet withdrawals.

### Persuasion Level
An AI agent configuration (0-3) that controls how aggressively the agent sells. Level 0 is purely informational; Level 3 actively creates urgency and pushes for conversion.

### PgBouncer
A connection pooler for PostgreSQL that sits between the application and the database. Uses transaction-mode pooling to efficiently manage database connections from serverless functions.

### PII Sanitization
The process of stripping personally identifiable information (email addresses, phone numbers, card numbers) from text before sending it to external AI providers. Implemented in the `OpenRouterClient`.

### Prisma
The TypeScript ORM used to interact with PostgreSQL. Provides type-safe database queries, schema management, and migration tooling. The schema is at `platform/infra/db/prisma/schema.prisma`.

---

## R

### Rate Limiting
Tier-based request throttling that prevents abuse and ensures fair usage. Implemented in both in-memory (development) and Redis-backed (production) variants. Limits are defined per tier: STARTER (500 req/hr), PRO (2,000 req/hr), PRO_PLUS (10,000 req/hr).

### Resend
The email delivery service used for transactional and marketing emails. Emails are templated using React Email (`packages/emails/`).

---

## S

### Soft Delete
A data deletion pattern where records are marked with a `deletedAt` timestamp rather than being physically removed from the database. Used for critical models (User, Product, Order, Customer) to support data recovery and compliance requirements.

### Staff Seat
A user account within a merchant's store. The number of available seats is limited by tier (STARTER: 1, PRO: 3, PRO_PLUS: 5).

### Store
The central tenant entity in Vayva. Every merchant resource (products, orders, customers, AI settings) belongs to a store. Identified by a unique `storeId` (UUID).

### Storefront
The customer-facing web store hosted at `store.vayva.ng/{slug}` or on a custom domain. Displays the merchant's products, handles checkout, and processes payments.

### Subscription
A recurring monthly payment that gives a merchant access to Vayva's features. Three tiers: STARTER (NGN 25,000/mo), PRO (NGN 35,000/mo), PRO_PLUS (NGN 50,000/mo). Billed via Paystack.

---

## T

### Tone Preset
A predefined personality configuration for the AI agent. Options: Friendly, Professional, Luxury, Playful, Minimal. Affects the language, formality, and style of AI responses.

### Top-Up
See Credit Top-Up.

### Trial Period
A complimentary access period for new merchants. STARTER and PRO tiers include a 7-day trial. PRO_PLUS has no trial. All tier features are available during the trial.

### TurboRepo
The build system orchestrator that manages task execution across all packages in the monorepo. Handles dependency-aware builds, caching, and parallel execution.

---

## V

### Vercel
The hosting platform for all Vayva frontend applications. Each app (merchant, storefront, ops-console, marketing) is deployed as a separate Vercel project from the same GitHub repository.

### Voice Note
An audio message sent by a customer via WhatsApp. Processed by the `VoiceProcessor` module which transcribes the audio into text for the AI agent to respond to.

---

## W

### Wallet
A per-store balance that holds funds from customer orders. Merchants can withdraw funds to their bank account after a 3% fee deduction. Protected by a hashed PIN and supports locking for security holds.

### WhatsApp Agent Settings
Per-store configuration (`WhatsAppAgentSettings`) that controls the WhatsApp AI agent's behavior: business hours, auto-reply, catalog mode, image understanding, daily message limits, human handoff, and safety filters.

### WhatsApp Template
A reusable message structure with variable placeholders, used for broadcast messages and automated notifications. Templates go through an approval workflow before they can be used.

### Withdrawal
The process of transferring funds from a merchant's wallet to their bank account. Subject to a 3% platform fee. Requires wallet PIN authorization. Managed through the `Withdrawal` model.

### Workflow Builder
A visual drag-and-drop interface for creating custom automation flows. Supports triggers (order events, inventory changes, schedules), conditions, actions (send messages, update data), and delays. Available on PRO_PLUS tier only. Powered by `packages/workflow/`.

---

## Numbers and Symbols

### 3% Withdrawal Fee
The platform fee applied to every merchant wallet withdrawal. Deducted automatically from the withdrawal amount before bank transfer.

### 0.24 Credits per 1K Tokens
The base credit consumption rate for GPT-4o Mini, the primary AI model. Other models have higher rates (Llama 3.3 70B: 0.34, Claude 3 Sonnet: 2.40, Mistral Large: 1.60).
