# Data Model

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Vayva uses PostgreSQL as the primary database with Prisma as the ORM. This document describes the core data models and their relationships.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐    │
│  │  User    │──────│ Merchant │──────│  Store   │──────│ Product  │    │
│  └──────────┘      └──────────┘      └──────────┘      └──────────┘    │
│       │                 │                 │                 │          │
│       │                 │                 │                 │          │
│       ▼                 ▼                 ▼                 ▼          │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐    │
│  │  Order   │      │  Staff   │      │ Template │      │ Category │    │
│  └──────────┘      └──────────┘      └──────────┘      └──────────┘    │
│       │                                                            │    │
│       │                                                            │    │
│       ▼                                                            │    │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐                  │    │
│  │Payment   │      │ Delivery │      │ Customer │                  │    │
│  └──────────┘      └──────────┘      └──────────┘                  │    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Models

### User

The User model represents platform users who can be customers, merchant staff, or both.

**Fields:**
- `id` - Unique identifier (UUID)
- `email` - Unique email address
- `phone` - Phone number (optional)
- `name` - Full name
- `password` - Hashed password
- `emailVerified` - Email verification timestamp
- `createdAt` - Account creation time
- `updatedAt` - Last update time

**Relations:**
- `merchants` - MerchantStaff[] (merchants user belongs to)
- `orders` - Order[] (orders placed by user)
- `sessions` - Session[] (active sessions)

---

### Merchant

The Merchant model represents a business using Vayva.

**Fields:**
- `id` - Unique identifier (UUID)
- `name` - Business name
- `slug` - Unique URL slug
- `email` - Business email
- `phone` - Business phone
- `status` - ONBOARDING | ACTIVE | SUSPENDED | BANNED
- `plan` - FREE | STARTER | PRO
- `industry` - Industry category
- `createdAt` - Registration time
- `updatedAt` - Last update time

**Relations:**
- `stores` - Store[] (merchant's storefronts)
- `staff` - MerchantStaff[] (team members)
- `products` - Product[] (product catalog)
- `orders` - Order[] (all orders)
- `customers` - Customer[] (customer list)
- `settings` - MerchantSettings (configuration)

---

### Store

The Store model represents an individual storefront. Merchants can have multiple stores.

**Fields:**
- `id` - Unique identifier (UUID)
- `merchantId` - Parent merchant
- `name` - Store name
- `slug` - Unique URL slug
- `templateId` - Selected template
- `theme` - Theme configuration (JSON)
- `settings` - Store settings (JSON)
- `isActive` - Published status
- `createdAt` - Creation time

**Relations:**
- `merchant` - Merchant (parent)
- `products` - Product[] (store products)
- `orders` - Order[] (store orders)

---

### Product

The Product model represents sellable items.

**Fields:**
- `id` - Unique identifier (UUID)
- `merchantId` - Owning merchant
- `storeId` - Associated store (optional)
- `name` - Product name
- `description` - Product description
- `price` - Selling price (Decimal)
- `comparePrice` - Original/compare price (optional)
- `sku` - Stock keeping unit
- `barcode` - Barcode/EAN
- `inventory` - Current stock quantity
- `trackInventory` - Whether to track stock
- `status` - DRAFT | ACTIVE | ARCHIVED
- `images` - Array of image URLs
- `attributes` - Custom attributes (JSON)
- `createdAt` - Creation time
- `updatedAt` - Last update time

**Relations:**
- `merchant` - Merchant (owner)
- `store` - Store (if store-specific)
- `variants` - ProductVariant[] (size, color options)
- `categories` - Category[] (product categories)
- `orderItems` - OrderItem[] (order line items)

---

### Order

The Order model represents customer purchases.

**Fields:**
- `id` - Unique identifier (UUID)
- `refCode` - Human-readable reference (e.g., ORD-12345)
- `merchantId` - Merchant who received order
- `storeId` - Store where order was placed
- `customerId` - Associated customer
- `userId` - User who placed order (if registered)

**Financial:**
- `subtotal` - Items total (Decimal)
- `tax` - Tax amount (Decimal)
- `shipping` - Delivery fee (Decimal)
- `discount` - Discount applied (Decimal)
- `total` - Final total (Decimal)
- `currency` - Currency code (default: NGN)

**Status:**
- `status` - PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED
- `paymentStatus` - PENDING | PAID | FAILED | REFUNDED
- `fulfillmentStatus` - UNFULFILLED | PARTIAL | FULFILLED

**Source:**
- `source` - WEB | WHATSAPP | INSTAGRAM | IN_STORE
- `sourceData` - Source-specific data (JSON)

**Timestamps:**
- `createdAt` - Order creation
- `updatedAt` - Last update

**Relations:**
- `merchant` - Merchant (recipient)
- `store` - Store (if applicable)
- `customer` - Customer (if identified)
- `user` - User (if registered)
- `items` - OrderItem[] (line items)
- `payment` - Payment (associated payment)
- `delivery` - Delivery (associated delivery)

---

### Customer

The Customer model represents a merchant's customers.

**Fields:**
- `id` - Unique identifier (UUID)
- `merchantId` - Associated merchant
- `name` - Customer name
- `email` - Email address (optional)
- `phone` - Phone number
- `whatsappId` - WhatsApp identifier
- `address` - Delivery address (JSON)
- `metadata` - Custom data (JSON)
- `createdAt` - First interaction
- `updatedAt` - Last update

**Relations:**
- `merchant` - Merchant (owner)
- `orders` - Order[] (order history)

---

### Payment

The Payment model represents payment transactions.

**Fields:**
- `id` - Unique identifier (UUID)
- `orderId` - Associated order
- `provider` - PAYSTACK | TRANSFER | CASH
- `providerRef` - Provider reference (e.g., Paystack transaction ID)
- `amount` - Payment amount (Decimal)
- `currency` - Currency code
- `status` - PENDING | SUCCESS | FAILED | REFUNDED
- `method` - Payment method (card, transfer, etc.)
- `metadata` - Provider data (JSON)
- `paidAt` - Payment timestamp
- `createdAt` - Record creation

**Relations:**
- `order` - Order (associated order)

---

### Delivery

The Delivery model represents order fulfillment.

**Fields:**
- `id` - Unique identifier (UUID)
- `orderId` - Associated order
- `provider` - KWIK | SELF | OTHER
- `trackingNumber` - Provider tracking ID
- `status` - PENDING | PICKED_UP | IN_TRANSIT | DELIVERED | FAILED
- `cost` - Delivery cost (Decimal)
- `address` - Delivery address (JSON)
- `estimatedDate` - Expected delivery date
- `deliveredAt` - Actual delivery timestamp
- `proofOfDelivery` - Photo/Signature (JSON)
- `metadata` - Provider data (JSON)
- `createdAt` - Record creation
- `updatedAt` - Last update

**Relations:**
- `order` - Order (associated order)

---

### Category

The Category model organizes products.

**Fields:**
- `id` - Unique identifier (UUID)
- `merchantId` - Owning merchant
- `name` - Category name
- `slug` - URL-friendly name
- `description` - Category description
- `parentId` - Parent category (for nesting)
- `image` - Category image URL
- `sortOrder` - Display order
- `isActive` - Visibility status
- `createdAt` - Creation time
- `updatedAt` - Last update

**Relations:**
- `merchant` - Merchant (owner)
- `parent` - Category (parent category)
- `children` - Category[] (subcategories)
- `products` - Product[] (products in category)

---

### Template

The Template model represents store designs.

**Fields:**
- `id` - Unique identifier (UUID)
- `key` - Template identifier (e.g., "modern-retail")
- `name` - Display name
- `description` - Template description
- `thumbnail` - Preview image URL
- `category` - RETAIL | FOOD | FASHION | etc.
- `plan` - FREE | STARTER | PRO (minimum plan required)
- `sections` - Available sections (JSON array)
- `config` - Template configuration (JSON)
- `isActive` - Available for use
- `createdAt` - Creation time

**Relations:**
- `stores` - Store[] (stores using this template)

---

## Multi-Tenancy

Vayva uses a **row-level security** approach for multi-tenancy:

1. Every table has a `merchantId` column
2. All queries filter by `merchantId`
3. No cross-merchant data access

Example:
```typescript
// Automatically scoped to merchant
const products = await prisma.product.findMany({
  where: { merchantId: currentMerchant.id }
});
```

## Indexes

Key database indexes for performance:

| Table | Index | Purpose |
|-------|-------|---------|
| Order | `merchantId + createdAt` | Order listing |
| Order | `refCode` | Order lookup |
| Product | `merchantId + status` | Active products |
| Customer | `merchantId + phone` | Customer lookup |
| Payment | `providerRef` | Payment reconciliation |

## Migrations

Database migrations are managed with Prisma Migrate:

```bash
# Create migration
npx prisma migrate dev --name add_feature

# Deploy to production
npx prisma migrate deploy

# Generate client
npx prisma generate
```

---

**Questions?** Contact engineering@vayva.ng
