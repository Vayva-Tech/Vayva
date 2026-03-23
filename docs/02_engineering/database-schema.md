# Vayva Database Schema Reference

> Last updated: 2026-03-23
> Schema file: `infra/db/prisma/schema.prisma` (~10,100 lines, 150+ models)
> Database: PostgreSQL via Prisma ORM

---

## Schema Overview

The database follows a multi-tenant architecture where nearly every table is scoped by `storeId`. The `Store` model is the central entity with 100+ relations. All primary keys use UUID (`@default(uuid())` or `@default(cuid())`).

---

## Core Models

### Store

The central tenant entity. Every merchant has one Store.

| Field                | Type                  | Purpose                                     |
|----------------------|-----------------------|----------------------------------------------|
| id                   | String (UUID)         | Primary key                                  |
| name                 | String                | Store display name                           |
| slug                 | String (unique)       | URL-friendly identifier                      |
| plan                 | SubscriptionPlan      | STARTER / PRO / PRO_PLUS                     |
| category             | String                | Business category (default: "general")       |
| type                 | MerchantType          | INDIVIDUAL / RETAILER / WHOLESALER / etc.    |
| industrySlug         | String?               | Industry vertical identifier                 |
| isLive               | Boolean               | Whether store is publicly accessible         |
| isActive             | Boolean               | Account active status                        |
| onboardingStatus     | OnboardingStatus      | NOT_STARTED / IN_PROGRESS / COMPLETED        |
| onboardingCompleted  | Boolean               | Quick check for completed onboarding         |
| kycStatus            | KycStatus             | NOT_STARTED / PENDING / APPROVED / REJECTED  |
| verificationLevel    | StoreVerificationLevel| NONE / BASIC / VERIFIED / GOLD               |
| aiAgencyStatus       | StoreAiAgencyStatus   | INACTIVE / ACTIVE / RESTRICTED               |
| aiConsentGivenAt     | DateTime?             | When merchant consented to AI usage          |
| payoutsEnabled       | Boolean               | Whether withdrawals are allowed              |
| walletPin            | String?               | Hashed PIN for wallet security               |
| version              | Int                   | Optimistic locking counter                   |
| trialStartDate       | DateTime?             | Trial period start                           |
| trialEndDate         | DateTime?             | Trial period end                             |
| trialExpired         | Boolean               | Whether trial has expired                    |
| seoTitle/Description | String?               | SEO metadata                                 |
| branding             | Json?                 | Brand colors, fonts, etc.                    |
| settings             | Json?                 | Store-level settings                         |
| contacts             | Json?                 | Contact information                          |

**Key relations:** memberships, products, orders, customers, collections, wallet, subscription, aiSubscription, whatsAppChannel, conversations, and 80+ more.

### User

Platform user (merchant staff). Linked to stores via Membership.

| Field            | Type    | Purpose                        |
|------------------|---------|--------------------------------|
| id               | UUID    | Primary key                    |
| email            | String  | Unique login identifier        |
| password         | String  | bcrypt-hashed password         |
| firstName        | String? | First name                     |
| lastName         | String? | Last name                      |
| phone            | String? | Phone number                   |
| avatarUrl        | String? | Profile picture URL            |
| isEmailVerified  | Boolean | Email verification status      |
| isPhoneVerified  | Boolean | Phone verification status      |
| sessionVersion   | Int     | Incremented to invalidate JWTs |
| deletedAt        | DateTime?| Soft delete timestamp         |

**Key relations:** memberships, carts, merchantSessions, passwordResetTokens, tenantMemberships

### Membership (StoreUser)

Join table linking Users to Stores with roles.

| Field     | Type             | Purpose                           |
|-----------|------------------|-----------------------------------|
| id        | UUID             | Primary key                       |
| userId    | String           | FK to User                        |
| storeId   | String           | FK to Store                       |
| role_enum | AppRole          | OWNER / ADMIN / STAFF             |
| roleName  | String           | Legacy text role name             |
| status    | MembershipStatus | ACTIVE / SUSPENDED / etc.         |
| roleId    | String?          | FK to custom Role (granular RBAC) |

**Unique constraint:** `[userId, storeId]`

---

## Commerce Models

### Product

| Field           | Type          | Purpose                              |
|-----------------|---------------|--------------------------------------|
| id              | UUID          | Primary key                          |
| storeId         | String        | FK to Store                          |
| title           | String        | Product name                         |
| description     | String?       | Product description                  |
| handle          | String        | URL slug (unique per store)          |
| status          | ProductStatus | DRAFT / ACTIVE / ARCHIVED            |
| productType     | String?       | Product category type                |
| brand           | String?       | Brand name                           |
| tags            | String[]      | Searchable tags                      |
| price           | Decimal(10,2) | Base price                           |
| compareAtPrice  | Decimal?      | Original/compare price               |
| costPrice       | Decimal?      | Cost to merchant (for margin calc)   |
| sku             | String?       | Stock keeping unit                   |
| barcode         | String?       | Barcode (UPC/EAN)                    |
| trackInventory  | Boolean       | Whether to track stock levels        |
| allowBackorder  | Boolean       | Allow orders when out of stock       |
| weight/width/height/depth | Float? | Physical dimensions             |
| seoTitle/seoDescription | String? | SEO metadata                     |
| metadata        | Json?         | Flexible category-specific data      |
| condition       | String?       | NEW / USED / REFURBISHED             |
| moq             | Int           | Minimum order quantity (default: 1)  |
| deletedAt       | DateTime?     | Soft delete                          |

**Key relations:** productVariants, productImages, collectionProducts, inventoryItems, bookings, pricingTiers

**Unique constraints:** `[storeId, handle]`, `[storeId, sku]`

### ProductVariant

| Field          | Type          | Purpose                           |
|----------------|---------------|-----------------------------------|
| id             | UUID          | Primary key                       |
| storeId        | String        | FK to Store                       |
| productId      | String        | FK to Product                     |
| title          | String        | Variant name (e.g., "Large / Blue")|
| sku            | String?       | Variant-level SKU                 |
| price          | Decimal(10,2) | Variant price                     |
| compareAtPrice | Decimal?      | Compare-at price                  |
| costPrice      | Decimal?      | Cost price                        |
| inventory      | Int           | Current stock count               |
| options        | Json?         | Option values (e.g., `{size: "M"}`)|
| imageUrl       | String?       | Variant-specific image            |
| position       | Int           | Display order                     |
| isActive       | Boolean       | Whether variant is available      |

**Key relations:** cartItems, inventoryItems, inventoryAdjustments, orderItems

### Order

| Field              | Type              | Purpose                            |
|--------------------|-------------------|------------------------------------|
| id                 | UUID              | Primary key                        |
| storeId            | String            | FK to Store                        |
| orderNumber        | Int               | Sequential order number per store  |
| refCode            | String?           | Unique reference code              |
| status             | OrderStatus       | DRAFT / CONFIRMED / PROCESSING / etc.|
| paymentStatus      | PaymentStatus     | PENDING / PAID / FAILED / REFUNDED |
| fulfillmentStatus  | FulfillmentStatus | UNFULFILLED / PARTIAL / FULFILLED  |
| total              | Decimal(10,2)     | Order total                        |
| subtotal           | Decimal(10,2)     | Subtotal before tax/shipping       |
| tax                | Decimal(10,2)     | Tax amount                         |
| shippingTotal      | Decimal(10,2)     | Shipping cost                      |
| discountTotal      | Decimal(10,2)     | Total discounts applied            |
| currency           | String            | Default: "NGN"                     |
| source             | OrderSource       | STOREFRONT / WHATSAPP / POS / etc. |
| customerEmail      | String?           | Customer email                     |
| customerPhone      | String?           | Customer phone                     |
| customerId         | String?           | FK to Customer                     |
| deliveryMethod     | String?           | Delivery method chosen             |
| paymentMethod      | String?           | Payment method used                |
| deletedAt          | DateTime?         | Soft delete                        |

**Key relations:** items (OrderItem[]), customer, shipments, paymentIntents, paymentTransactions, receipts, disputes, refunds, fulfillmentGroups, orderEvents, timelineEvents

**Unique constraint:** `[storeId, orderNumber]`

### OrderItem

| Field      | Type          | Purpose                    |
|------------|---------------|----------------------------|
| id         | UUID          | Primary key                |
| orderId    | String        | FK to Order                |
| productId  | String?       | FK to Product              |
| variantId  | String?       | FK to ProductVariant       |
| title      | String        | Snapshot of product title   |
| sku        | String?       | Snapshot of SKU            |
| price      | Decimal(10,2) | Unit price at time of order|
| quantity   | Int           | Quantity ordered           |

### Cart

| Field          | Type               | Purpose                         |
|----------------|--------------------|---------------------------------|
| id             | UUID               | Primary key                     |
| userId         | String?            | FK to User (if logged in)       |
| sessionToken   | String?            | Anonymous session identifier    |
| email          | String?            | For abandoned cart recovery      |
| phone          | String?            | For WhatsApp cart recovery       |
| recoveryStatus | CartRecoveryStatus | NONE / SENT / RECOVERED / etc.  |
| checkoutUrl    | String?            | Pre-built checkout link          |

**Key relations:** items (CartItem[])

### CartItem

| Field     | Type | Purpose                       |
|-----------|------|-------------------------------|
| cartId    | FK   | FK to Cart                    |
| variantId | FK   | FK to ProductVariant          |
| quantity  | Int  | Quantity in cart               |

**Unique constraint:** `[cartId, variantId]`

### Collection

| Field       | Type    | Purpose                        |
|-------------|---------|--------------------------------|
| id          | UUID    | Primary key                    |
| storeId     | String  | FK to Store                    |
| title       | String  | Collection name                |
| handle      | String  | URL slug                       |
| description | String? | Collection description          |

**Key relations:** collectionProducts (many-to-many with Product via CollectionProduct)

---

## Customer Models

### Customer

| Field             | Type     | Purpose                           |
|-------------------|----------|-----------------------------------|
| id                | UUID     | Primary key                       |
| storeId           | String   | FK to Store                       |
| email             | String?  | Customer email                    |
| phone             | String?  | Customer phone                    |
| firstName         | String?  | First name                        |
| lastName          | String?  | Last name                         |
| whatsappContactId | String?  | Link to WhatsApp contact          |
| tags              | String[] | Customer tags for segmentation    |
| marketingOptIn    | Boolean  | Marketing consent                 |
| status            | String   | "new" / "active" / "inactive"     |
| passwordHash      | String?  | For customer portal login         |
| deletedAt         | DateTime?| Soft delete                       |

**Unique constraints:** `[storeId, email]`, `[storeId, phone]`
**Key relations:** orders, addresses, customerNotes, bookings, supportTickets, referralCodes

### CustomerAddress

| Field          | Type    | Purpose                    |
|----------------|---------|----------------------------|
| id             | UUID    | Primary key                |
| storeId        | String  | FK to Store                |
| customerId     | String  | FK to Customer             |
| label          | String? | "Home" / "Office" / etc.   |
| isDefault      | Boolean | Default shipping address   |
| recipientName  | String? | Name for delivery          |
| recipientPhone | String? | Phone for delivery         |
| addressLine1   | String  | Street address             |
| city           | String  | City                       |
| state          | String  | State/region               |
| country        | String  | Default: "NG"              |

### CustomerNote

| Field        | Type   | Purpose                      |
|--------------|--------|------------------------------|
| id           | UUID   | Primary key                  |
| storeId      | String | FK to Store                  |
| customerId   | String | FK to Customer               |
| content      | Text   | Note content                 |
| authorUserId | String | Who wrote the note           |

### CustomerRiskProfile

| Field      | Type     | Purpose                      |
|------------|----------|------------------------------|
| merchantId | String   | FK to Store                  |
| customerId | String?  | FK to Customer               |
| phoneE164  | String?  | Phone in E.164 format        |
| riskScore  | Int      | 0-100 risk score             |
| flags      | String[] | Risk flags                   |

### CustomerAccount

Separate from Customer -- represents a customer's cross-store login account.

| Field      | Type    | Purpose                      |
|------------|---------|------------------------------|
| id         | UUID    | Primary key                  |
| email      | String? | Unique customer email        |
| phone      | String? | Unique customer phone        |
| isVerified | Boolean | Account verification status  |

### Segment

Customer segmentation for targeted marketing.

---

## AI Models

### MerchantAiSubscription

Per-store AI subscription managing credits and usage.

| Field                 | Type                 | Purpose                          |
|-----------------------|----------------------|----------------------------------|
| id                    | UUID                 | Primary key                      |
| storeId               | String (unique)      | FK to Store                      |
| planId                | String               | FK to AiPlan                     |
| planKey               | String               | STARTER / PRO / PRO_PLUS         |
| status                | AiSubscriptionStatus | TRIAL_ACTIVE / ACTIVE / etc.     |
| currency              | String               | Merchant's preferred currency    |
| totalCreditsPurchased | Int                  | Lifetime credits (plan + top-ups)|
| creditsRemaining      | Int                  | Current available credits        |
| lastTopupAt           | DateTime?            | Last credit top-up               |
| lastCreditAlertAt     | DateTime?            | Last low-credit alert            |
| monthTokensUsed       | Int                  | MTD token usage (analytics)      |
| monthImagesUsed       | Int                  | MTD image generation count       |
| monthRequestsUsed     | Int                  | MTD API request count            |
| monthMessagesUsed     | Int                  | MTD message count                |
| trialStartedAt        | DateTime             | Trial start                      |
| trialExpiresAt        | DateTime             | Trial end                        |
| graceEndsAt           | DateTime?            | Post-trial grace period end      |
| closureScheduledAt    | DateTime?            | Scheduled account closure        |

**Key relations:** store, plan (AiPlan), addonPurchases

### AiPlan

Defines available AI plans with limits.

| Field               | Type   | Purpose                    |
|---------------------|--------|----------------------------|
| name                | String | Plan name (unique)         |
| monthlyTokenLimit   | Int    | Monthly token cap           |
| monthlyImageLimit   | Int    | Monthly image gen cap       |
| monthlyRequestLimit | Int    | Monthly request cap         |
| maxRps              | Int    | Rate limit (req/sec)        |
| overagePolicy       | String | BLOCK / THROTTLE / BILL     |

### AiAddonPurchase

Records credit top-up purchases.

| Field           | Type   | Purpose                           |
|-----------------|--------|-----------------------------------|
| storeId         | String | FK to Store                       |
| subscriptionId  | String | FK to MerchantAiSubscription      |
| packType        | String | CREDITS_3000 / CREDITS_8000 / etc.|
| priceKobo       | BigInt | Price paid in kobo                |
| currency        | String | NGN / USD / EUR / GBP / KES / GHS / ZAR |
| priceInCurrency | Float  | Price in merchant's currency      |
| transactionId   | String | Paystack transaction reference    |
| creditsAdded    | Int    | Credits added to balance          |
| bonusCredits    | Int    | Bonus credits (if any)            |

### AiUsageEvent

Per-request AI usage logging.

| Field            | Type    | Purpose                          |
|------------------|---------|----------------------------------|
| storeId          | String  | FK to Store                      |
| channel          | String  | WHATSAPP / WEBCHAT / INAPP / OPS_TEST |
| conversationId   | String? | FK to Conversation               |
| model            | String  | AI model used                    |
| inputTokens      | Int     | Input token count                |
| outputTokens     | Int     | Output token count               |
| imageCount       | Int     | Images generated                 |
| toolCallsCount   | Int     | Tool calls made                  |
| creditsUsed      | Int     | Credits consumed                 |
| success          | Boolean | Whether request succeeded        |
| errorType        | String? | Error classification             |
| costEstimateKobo | BigInt  | Estimated cost in kobo           |
| latencyMs        | Int?    | Response latency                 |
| requestId        | String? | Unique request ID                |

### AiUsageDaily

Aggregated daily AI usage for dashboards.

| Field           | Type   | Purpose                     |
|-----------------|--------|-----------------------------|
| storeId         | String | FK to Store                 |
| date            | Date   | Aggregation date            |
| tokensCount     | Int    | Total tokens used           |
| requestsCount   | Int    | Total requests              |
| imagesCount     | Int    | Total images generated      |
| toolCallsCount  | Int    | Total tool calls            |
| costKobo        | BigInt | Total cost in kobo          |
| overLimitBlocks | Int    | Requests blocked (over limit)|
| rateLimitBlocks | Int    | Requests blocked (rate limit)|

### MerchantAiProfile

Per-store AI agent customization.

| Field            | Type    | Purpose                              |
|------------------|---------|--------------------------------------|
| storeId          | String  | FK to Store (unique)                 |
| agentName        | String? | Custom AI agent name                 |
| tonePreset       | String  | Friendly/Professional/Luxury/Playful/Minimal |
| greetingTemplate | String? | Custom greeting message              |
| signoffTemplate  | String? | Custom sign-off message              |
| persuasionLevel  | Int     | 0-3 persuasion intensity             |
| brevityMode      | String  | Short / Medium response length       |
| oneQuestionRule  | Boolean | Ask one question at a time           |
| escalationRules  | Json?   | When to escalate to human            |
| prohibitedClaims | Json?   | Claims AI must not make              |
| policyOverrides  | Json?   | Custom policy overrides              |

### AiActionRun

Tracks AI-initiated actions with approval workflow.

| Field            | Type           | Purpose                        |
|------------------|----------------|--------------------------------|
| storeId          | String         | FK to Store                    |
| conversationId   | String         | FK to Conversation             |
| actionDefId      | String         | FK to AiActionDefinition       |
| status           | AiActionStatus | PROPOSED / APPROVED / EXECUTED / REJECTED |
| arguments        | Json           | Action parameters              |
| requiresApproval | Boolean        | Whether human approval needed  |
| result           | Json?          | Action result                  |
| error            | String?        | Error message if failed        |

### KnowledgeBaseEntry

Merchant knowledge base for AI agent context.

| Field      | Type   | Purpose                         |
|------------|--------|---------------------------------|
| storeId    | String | FK to Store                     |
| content    | String | Knowledge content               |
| sourceType | String | MANUAL / IMPORTED / AI_GENERATED|

### CreditAllocation

Per-store monthly credit allocation (re-gating system).

| Field          | Type     | Purpose                        |
|----------------|----------|--------------------------------|
| storeId        | String   | FK to Store (unique)           |
| plan           | String   | FREE / STARTER / PRO           |
| monthlyCredits | Int      | Credits allocated per month    |
| usedCredits    | Int      | Credits consumed this period   |
| resetDate      | DateTime | Next reset date                |

### CreditUsageLog

Tracks individual credit consumption events.

| Field       | Type   | Purpose                                    |
|-------------|--------|--------------------------------------------|
| storeId     | String | FK to CreditAllocation                     |
| amount      | Int    | Credits consumed                           |
| feature     | String | ai_message / template_change / autopilot_run |
| description | Text   | Human-readable description                 |

---

## Billing Models

### Subscription

Store-level billing subscription.

| Field                  | Type               | Purpose                       |
|------------------------|--------------------|-------------------------------|
| id                     | UUID               | Primary key                   |
| storeId                | String (unique)    | FK to Store                   |
| planKey                | String             | STARTER / PRO / PRO_PLUS      |
| status                 | SubscriptionStatus | TRIALING / ACTIVE / PAST_DUE / CANCELED |
| provider               | BillingProvider    | STRIPE / PAYSTACK             |
| providerSubscriptionId | String?            | External subscription ID      |
| currentPeriodStart     | DateTime           | Billing period start          |
| currentPeriodEnd       | DateTime           | Billing period end            |
| cancelAtPeriodEnd      | Boolean            | Cancel on next renewal        |
| trialEndsAt            | DateTime?          | Trial expiry                  |
| gracePeriodEndsAt      | DateTime?          | Grace period after failed payment |

### InvoiceV2

| Field          | Type    | Purpose                        |
|----------------|---------|--------------------------------|
| storeId        | String  | FK to Store                    |
| subscriptionId | String  | FK to Subscription             |
| number         | String  | Invoice number (unique)        |
| status         | String  | DRAFT / OPEN / PAID / VOID     |
| subtotal       | Decimal | Subtotal before tax            |
| tax            | Decimal | Tax amount                     |
| total          | Decimal | Invoice total                  |
| currency       | String  | Default: "NGN"                 |
| dueDate        | DateTime| Payment due date               |
| paidAt         | DateTime?| When payment was received     |

**Key relations:** lines (InvoiceLineV2[])

### PaymentIntent

| Field           | Type    | Purpose                       |
|-----------------|---------|-------------------------------|
| storeId         | String  | FK to Store                   |
| orderId         | String? | FK to Order                   |
| provider        | String  | Payment provider              |
| amount          | Decimal | Payment amount                |
| currency        | String  | Payment currency              |
| status          | String  | CREATED / PROCESSING / SUCCEEDED / FAILED |
| providerIntentId| String  | External payment intent ID    |

### PaymentTransaction

| Field             | Type    | Purpose                         |
|-------------------|---------|---------------------------------|
| storeId           | String  | FK to Store                     |
| orderId           | String? | FK to Order                     |
| provider          | String  | Payment provider                |
| amount            | Decimal | Transaction amount              |
| currency          | String  | Transaction currency            |
| status            | String  | Transaction status              |
| providerReference | String  | External reference              |

### Charge

Payment charge record with refund tracking.

| Field            | Type         | Purpose                     |
|------------------|--------------|-----------------------------|
| storeId          | String       | FK to Store                 |
| orderId          | String?      | FK to Order                 |
| provider         | String       | Payment provider            |
| providerChargeId | String       | External charge ID          |
| status           | ChargeStatus | PENDING / SUCCEEDED / FAILED|
| amount           | Decimal      | Charge amount               |
| currency         | String       | Charge currency             |
| receiptUrl       | String?      | Payment receipt URL         |

**Key relations:** refunds, paymentIntent

### Wallet

Per-store financial wallet.

| Field         | Type    | Purpose                         |
|---------------|---------|---------------------------------|
| storeId       | String  | FK to Store (unique)            |
| balance       | Int     | Balance in kobo                 |
| currency      | String  | Default: "NGN"                  |
| isLocked      | Boolean | Lock status                     |
| lockReason    | String? | Why wallet is locked            |
| totalDeposits | Int     | Lifetime deposits in kobo       |
| totalPayouts  | Int     | Lifetime payouts in kobo        |

### Payout

| Field            | Type         | Purpose                     |
|------------------|--------------|-----------------------------|
| storeId          | String       | FK to Store                 |
| provider         | String       | Payout provider             |
| providerPayoutId | String       | External payout ID          |
| status           | PayoutStatus | PENDING / PAID / FAILED     |
| amount           | Decimal      | Payout amount               |
| currency         | String       | Payout currency             |
| arrivalDate      | DateTime?    | Expected arrival date       |

### Withdrawal

| Field          | Type             | Purpose                    |
|----------------|------------------|----------------------------|
| storeId        | String           | FK to Store                |
| amountKobo     | BigInt           | Requested amount           |
| feeKobo        | BigInt           | Fee charged                |
| amountNetKobo  | BigInt           | Net amount after fee       |
| feePercent     | Decimal          | Fee percentage (default 5%)|
| status         | WithdrawalStatus | PENDING / APPROVED / etc.  |
| referenceCode  | String (unique)  | Unique reference           |

### BankBeneficiary

Store's bank account details for payouts.

| Field         | Type   | Purpose                    |
|---------------|--------|----------------------------|
| storeId       | String | FK to Store                |
| bankCode      | String | Bank code                  |
| bankName      | String | Bank display name          |
| accountNumber | String | Account number             |
| accountName   | String | Account holder name        |
| isDefault     | Boolean| Default payout destination |

---

## WhatsApp Models

### WhatsappChannel

Per-store WhatsApp connection.

| Field              | Type                  | Purpose                      |
|--------------------|-----------------------|------------------------------|
| storeId            | String (unique)       | FK to Store                  |
| provider           | String                | "meta" (default)             |
| wabaId             | String?               | WhatsApp Business Account ID |
| phoneNumberId      | String?               | Phone number ID              |
| displayPhoneNumber | String?               | Display phone number         |
| businessName       | String?               | WhatsApp business name       |
| status             | WhatsappChannelStatus | DISCONNECTED / CONNECTED / etc.|

**Key relations:** whatsappCredential

### WhatsAppAgentSettings

Per-store AI agent configuration for WhatsApp.

| Field                   | Type    | Purpose                                    |
|-------------------------|---------|--------------------------------------------|
| storeId                 | String  | FK to Store (unique)                       |
| enabled                 | Boolean | Agent active status                        |
| businessHours           | Json?   | Operating hours configuration              |
| autoReplyOutsideHours   | Boolean | Auto-reply when closed                     |
| catalogMode             | String  | StrictCatalogOnly / CatalogPlusFAQ         |
| allowImageUnderstanding | Boolean | Process images sent by customers           |
| orderStatusAccess       | Boolean | Agent can look up order status             |
| paymentGuidanceMode     | String  | ExplainOnly / ExplainAndLink               |
| maxDailyMsgsPerUser     | Int     | Rate limit per customer (default: 50)      |
| humanHandoffEnabled     | Boolean | Allow escalation to human                  |
| handoffDestination      | String? | Where to route escalations                 |
| safetyFilters           | Json?   | Content safety configuration               |

### WhatsAppTemplate

Reusable message templates for WhatsApp.

| Field           | Type    | Purpose                           |
|-----------------|---------|-----------------------------------|
| storeId         | String  | FK to Store                       |
| name            | String  | Template name                     |
| category        | String  | marketing / transactional / utility|
| content         | String  | Template body                     |
| variables       | String[]| Variable placeholders             |
| isApproved      | Boolean | Meta approval status              |
| approvalStatus  | String  | pending / approved / rejected     |
| usageCount      | Int     | Times template has been used      |

### WhatsAppBroadcast

Bulk WhatsApp message campaigns.

| Field           | Type      | Purpose                          |
|-----------------|-----------|----------------------------------|
| storeId         | String    | FK to Store                      |
| name            | String    | Campaign name                    |
| segmentId       | String?   | Target customer segment          |
| templateId      | String?   | FK to WhatsAppTemplate           |
| content         | String    | Message content                  |
| status          | String    | draft / scheduled / sending / sent / failed |
| totalRecipients | Int       | Total recipients                 |
| sentCount       | Int       | Successfully sent                |
| failedCount     | Int       | Failed deliveries                |
| openCount       | Int       | Messages opened                  |
| clickCount      | Int       | Links clicked                    |

### WhatsAppBroadcastRecipient

Per-recipient delivery tracking.

| Field       | Type      | Purpose                          |
|-------------|-----------|----------------------------------|
| broadcastId | String    | FK to WhatsAppBroadcast          |
| customerId  | String    | FK to Customer                   |
| phoneNumber | String    | Delivery phone number            |
| status      | String    | pending / sent / delivered / read / failed |
| sentAt      | DateTime? | When message was sent            |
| deliveredAt | DateTime? | When message was delivered       |
| readAt      | DateTime? | When message was read            |

### Contact

WhatsApp contact record.

| Field       | Type    | Purpose                          |
|-------------|---------|----------------------------------|
| storeId     | String  | FK to Store                      |
| channel     | Channel | WHATSAPP (default)               |
| externalId  | String  | External identifier              |
| displayName | String? | Contact display name             |
| phoneE164   | String? | Phone in E.164 format            |

**Unique constraint:** `[storeId, channel, externalId]`

### Conversation

Messaging thread between store and contact.

| Field          | Type               | Purpose                       |
|----------------|--------------------|-------------------------------|
| storeId        | String             | FK to Store                   |
| contactId      | String             | FK to Contact                 |
| status         | ConversationStatus | OPEN / CLOSED / etc.          |
| assignedTo     | String?            | Assigned staff member         |
| unreadCount    | Int                | Unread message count          |
| lastMessageAt  | DateTime           | Last message timestamp        |
| lastInboundAt  | DateTime?          | Last customer message         |
| lastOutboundAt | DateTime?          | Last store response           |
| priority       | PriorityLevel      | normal / high / urgent        |
| tags           | Json               | Conversation tags             |

**Key relations:** messages, aiActionRuns, supportTickets, handoffEvents, internalNotes

### Message

Individual message within a conversation.

| Field             | Type          | Purpose                        |
|-------------------|---------------|--------------------------------|
| storeId           | String        | FK to Store                    |
| conversationId    | String        | FK to Conversation             |
| direction         | Direction     | INBOUND / OUTBOUND             |
| type              | MessageType   | TEXT / IMAGE / AUDIO / etc.    |
| providerMessageId | String?       | External message ID            |
| textBody          | String?       | Message text content           |
| mediaId           | String?       | FK to media asset              |
| status            | MessageStatus | QUEUED / SENT / DELIVERED / READ / FAILED |

---

## Content Models

### BlogPost

| Field         | Type       | Purpose                    |
|---------------|------------|----------------------------|
| storeId       | String     | FK to Store                |
| title         | String     | Post title                 |
| slug          | String     | URL slug (unique per store)|
| excerpt       | Text?      | Post summary               |
| content       | Text?      | Full post content          |
| featuredImage | String?    | Hero image URL             |
| publishedAt   | DateTime?  | Publication date           |
| status        | PostStatus | DRAFT / PUBLISHED          |
| tags          | String[]   | Post tags                  |
| metaTitle     | String?    | SEO title                  |
| metaDesc      | String?    | SEO description            |

**Key relations:** products (BlogPostProduct[] for "Shop the Look" feature)

### Collection

See Commerce Models section above.

---

## Analytics Models

### AnalyticsDailySales

| Field               | Type          | Purpose                    |
|---------------------|---------------|----------------------------|
| storeId             | String        | FK to Store                |
| date                | Date          | Aggregation date           |
| ordersCount         | Int           | Total orders               |
| grossSales          | Decimal(12,2) | Gross sales amount         |
| discounts           | Decimal(12,2) | Total discounts            |
| shipping            | Decimal(12,2) | Total shipping revenue     |
| netSales            | Decimal(12,2) | Net sales after discounts  |
| refunds             | Decimal(12,2) | Total refunds              |
| paidOrdersCount     | Int           | Orders paid                |
| codOrdersCount      | Int           | Cash-on-delivery orders    |
| transferOrdersCount | Int           | Bank transfer orders       |

### AnalyticsDailyDelivery

Tracks shipping performance metrics per day.

### AnalyticsDailyPayments

Tracks payment success/failure rates per day.

### AnalyticsDailySupport

Tracks support metrics (inbound/outbound messages, ticket resolution, response time).

---

## Audit & Security Models

### AuditLog

| Field         | Type            | Purpose                        |
|---------------|-----------------|--------------------------------|
| actorUserId   | String?         | Who performed the action       |
| app           | AuditApp        | ops / merchant / storefront / payments |
| action        | String          | Action identifier              |
| targetType    | AuditTargetType | store / order / user / payout / system |
| targetId      | String          | What was acted upon            |
| severity      | AuditSeverity   | INFO / WARN / HIGH / CRITICAL  |
| ip            | String?         | Actor IP address               |
| requestId     | String          | Correlation ID                 |
| metadata      | Json            | Additional context             |

### ApiKey

| Field       | Type         | Purpose                        |
|-------------|--------------|--------------------------------|
| storeId     | String       | FK to Store                    |
| name        | String       | Key display name               |
| keyHash     | String       | Hashed API key (unique)        |
| scopes      | String[]     | Permitted scopes               |
| status      | ApiKeyStatus | ACTIVE / REVOKED               |
| expiresAt   | DateTime?    | Key expiration                 |
| ipAllowlist | String[]     | Allowed IP addresses           |
| lastIp      | String?      | Last used IP                   |

---

## Other Notable Models

### AutomationRule

Per-store automation with trigger/action configuration.

| Field       | Type              | Purpose                           |
|-------------|-------------------|-----------------------------------|
| storeId     | String            | FK to Store                       |
| key         | String            | Unique rule identifier per store  |
| triggerType | AutomationTrigger | ORDER_CREATED / etc.              |
| actionType  | AutomationAction  | SEND_EMAIL / etc.                 |
| enabled     | Boolean           | Whether rule is active            |
| config      | Json              | Rule configuration                |

### Campaign / CampaignSend

Marketing campaign management with per-recipient tracking.

### DiscountRule

Flexible discount rules with conditions and limits.

### InventoryItem / InventoryMovement / InventoryAdjustment

Inventory tracking with location support and movement history.

### KycRecord

Merchant identity verification records.

### LedgerEntry

Double-entry bookkeeping for financial transactions.

### Dispute / DisputeEvidence

Payment dispute management with evidence tracking.

### SupportTicket

Customer support ticket system linked to conversations.

### StoreDeployment / TemplateProject

Store website deployment and template management.

---

## Enum Reference (Key Enums)

```
SubscriptionPlan:    STARTER | PRO | PRO_PLUS
OrderStatus:         DRAFT | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED | RETURNED
PaymentStatus:       PENDING | PAID | FAILED | REFUNDED | PARTIALLY_REFUNDED
FulfillmentStatus:   UNFULFILLED | PARTIAL | FULFILLED
ProductStatus:       DRAFT | ACTIVE | ARCHIVED
MembershipStatus:    ACTIVE | SUSPENDED | REMOVED
AppRole:             OWNER | ADMIN | STAFF
OnboardingStatus:    NOT_STARTED | IN_PROGRESS | COMPLETED
KycStatus:           NOT_STARTED | PENDING | APPROVED | REJECTED
MerchantType:        INDIVIDUAL | RETAILER | WHOLESALER | CHINA_SUPPLIER | SERVICE_PROVIDER
AiSubscriptionStatus: TRIAL_ACTIVE | ACTIVE | GRACE | SUSPENDED | CLOSED
SubscriptionStatus:  TRIALING | ACTIVE | PAST_DUE | CANCELED | PAUSED
Direction:           INBOUND | OUTBOUND
Channel:             WHATSAPP | EMAIL | SMS | WEB
ConversationStatus:  OPEN | CLOSED | SNOOZED
AuditSeverity:       INFO | WARN | HIGH | CRITICAL
```

---

## Indexes & Performance

The schema makes heavy use of composite indexes for common query patterns:

- `[storeId, createdAt]` -- Standard time-range queries per store
- `[storeId, status]` -- Filtered listings by status
- `[storeId, status, createdAt]` -- Status-filtered time queries
- `[storeId, date]` -- Analytics aggregation tables
- `[storeId, email]` / `[storeId, phone]` -- Customer lookups

All analytics tables use `@@unique([storeId, date])` to enforce one row per store per day with upsert semantics.
