# Merchant Admin Documentation

**Application:** Merchant Admin Dashboard  
**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Framework:** Next.js 15 + React + TypeScript  
**URL:** `https://merchant.vayva.ng`

---

## Overview

The Merchant Admin Dashboard is the primary interface for Vayva merchants to manage their business operations. It provides comprehensive tools for order management, product catalog, customer relationships, analytics, and business settings.

## Architecture

```
Frontend/merchant-admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Main dashboard layout
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── orders/         # Order management
│   │   │   ├── products/       # Product catalog
│   │   │   ├── customers/      # Customer management
│   │   │   ├── analytics/      # Business analytics
│   │   │   ├── finance/        # Financial management
│   │   │   ├── marketing/      # Marketing tools
│   │   │   └── settings/       # Store settings
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout with auth
│   │   ├── error.tsx           # Error boundary
│   │   └── global-error.tsx    # Global error handler
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── orders/             # Order management UI
│   │   ├── products/           # Product management UI
│   │   ├── customers/          # Customer UI components
│   │   ├── analytics/          # Charts and reports
│   │   ├── rescue/             # Rescue overlay
│   │   └── ui/                 # Shared UI
│   ├── lib/                    # Utilities and services
│   │   ├── permissions.ts      # RBAC permissions
│   │   ├── dashboard-variants.ts # Dashboard configurations
│   │   └── rescue/             # Rescue service
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
└── package.json
```

## Key Features

### 1. Dashboard Variants

The merchant admin supports **industry-specific dashboard configurations** with tailored KPIs, layouts, and features.

**Configuration Location:** `src/config/dashboard-variants.ts`

**Supported Industries:**

| Industry | Dashboard Key | Key Features |
|----------|---------------|--------------|
| Retail | `retail_standard_inventory_first` | Inventory alerts, sales pipeline |
| Fashion | `fashion_editorial_visual` | Visual-first layout, collections |
| Food | `food_pro_mint_ai` | Order pipeline, delivery tracking |
| Services | `services_advanced_capacity` | Booking management, utilization |
| Events | `events_pro_mint_ai` | Ticket sales, attendance tracking |
| Real Estate | `realestate_listings_focus` | Property pipeline, inquiries |
| B2B | `b2b_advanced_finance` | Quote management, credit accounts |
| Nonprofit | `nonprofit_impact_first` | Donations, donor management |
| Education | `education_course_dashboard` | Enrollment, course progress |

**Dashboard Tiers:**

| Tier | Description | Max KPI Slots |
|------|-------------|---------------|
| Standard | Basic dashboard | 4 |
| Advanced | Enhanced features | 6 |
| Pro | Full feature set | 6 |

### 2. Order Management

**Location:** `/orders` route

**Features:**
- **Unified Order Inbox** - All orders from WhatsApp, Instagram, web, in-person
- **Kanban Board** - Visual pipeline (New → Preparing → Shipped → Delivered)
- **AI Order Capture** - Automatic conversion of WhatsApp conversations
- **Order Search** - Find by customer, product, or order number
- **Bulk Actions** - Update status, print labels, send notifications
- **Status Timeline** - Complete order history
- **Refund Processing** - Handle returns and refunds

**Order Statuses:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   ↓          ↓            ↓           ↓          ↓
CANCELLED  ON_HOLD    AWAITING    IN_TRANSIT  COMPLETED
```

### 3. Product Catalog

**Location:** `/products` route

**Features:**
- **Product List** - Grid/list view with filters
- **AI Product Creation** - Generate products from descriptions
- **WhatsApp Catalog Sync** - Sync with WhatsApp Business
- **Inventory Management** - Stock levels, low stock alerts
- **Variants** - Size, color, style options
- **Categories** - Organize by category
- **Bulk Operations** - Import/export, mass updates
- **SEO Settings** - Meta titles, descriptions

**Product Types:**
- Physical products
- Digital downloads
- Services/Bookings
- Subscriptions

### 4. Customer Management

**Location:** `/customers` route

**Features:**
- **Customer Profiles** - Unified view of all interactions
- **WhatsApp Chat History** - Conversation timeline
- **Purchase History** - Order history and patterns
- **Customer Segments** - Group by behavior/value
- **Notes & Tags** - Internal annotations
- **Export** - CSV export for marketing

### 5. Analytics & Reporting

**Location:** `/analytics` route

**KPIs by Plan:**

| KPI | Standard | Advanced | Pro |
|-----|----------|----------|-----|
| Revenue | ✓ | ✓ | ✓ |
| Orders | ✓ | ✓ | ✓ |
| Customers | ✓ | ✓ | ✓ |
| Payment Success Rate | ✓ | ✓ | ✓ |
| Conversion Rate | - | ✓ | ✓ |
| AI Conversions | - | - | ✓ |
| AI Conversations | - | - | ✓ |
| Utilization Rate | - | ✓* | ✓* |
| Refund Rate | - | ✓ | ✓ |

*Services/Events industries only

**Reports:**
- Sales overview
- Product performance
- Customer acquisition
- Payment analytics
- Delivery performance

### 6. Financial Management

**Location:** `/finance` route (Advanced/Pro plans)

**Features:**
- **Transaction History** - All payments and payouts
- **Invoice Overview** - Paid, pending, failed invoices
- **Payout Schedule** - Upcoming and completed payouts
- **Financial Reports** - Revenue, expenses, profit
- **Wallet Balance** - Platform wallet

### 7. Marketing Tools

**Location:** `/marketing` route (Advanced/Pro plans)

**Features:**
- **Campaign Management** - Create and track campaigns
- **Discount Codes** - Generate promo codes
- **Abandoned Cart** - Recovery emails/messages
- **Customer Segments** - Targeted marketing
- **Analytics** - Campaign performance

### 8. Settings & Configuration

**Location:** `/settings` route

**Sections:**
- **Store Profile** - Name, description, branding
- **Business Info** - Legal details, KYC
- **Payments** - Paystack configuration
- **Delivery** - Kwik integration, zones
- **Notifications** - Email, WhatsApp settings
- **Team** - Staff management, permissions
- **Integrations** - Third-party connections

## Permission System (RBAC)

**Location:** `src/lib/permissions.ts`

**Roles:**

| Role | Description |
|------|-------------|
| Owner | Full access, can delete store |
| Admin | Full access except deletion |
| Manager | Orders, products, customers |
| Staff | Orders, view-only products |
| Finance | Financial data only |
| Support | Customer view, order updates |

**Permissions Matrix:**

```typescript
// Finance permissions
"finance:view"              - View financial data
"finance:edit_payouts"      - Modify payout settings
"finance:export"            - Export financial reports
"finance:accounting"        - Access accounting features

// Product permissions
"products:view"             - View products
"products:create"           - Create new products
"products:edit"             - Edit existing products
"products:delete"           - Delete products
"products:bulk_actions"     - Bulk operations
"products:import_export"    - Import/export catalog

// Order permissions
"orders:view"               - View orders
"orders:manage"             - Update order status
"orders:refund"             - Process refunds
"orders:export"             - Export order data

// Customer permissions
"customers:view"            - View customer data
"customers:manage"          - Edit customer info
"customers:export"          - Export customer list

// Marketing permissions
"marketing:view"            - View marketing data
"marketing:manage_campaigns" - Create/edit campaigns
"marketing:analytics"       - Access marketing analytics

// B2B permissions
"b2b:view"                  - View B2B features
"b2b:manage_quotes"         - Manage quotes
"b2b:manage_credit"         - Manage credit accounts
"b2b:manage_requisitions"   - Handle requisitions
"b2b:approve_quotes"        - Approve B2B quotes

// Event permissions
"events:view"               - View events
"events:manage"             - Manage events
"events:ticketing"          - Manage ticketing

// Nonprofit permissions
"nonprofit:view"            - View nonprofit features
"nonprofit:manage_campaigns" - Manage fundraising
```

## Dashboard Configuration

**Example Dashboard Config:**

```typescript
{
  key: "retail_pro_mint_ai",
  tier: "pro",
  appliesTo: ["retail"],
  theme: "mint",
  supportsDarkMode: true,
  kpis: [
    { key: "revenue", label: "Revenue", format: "currency" },
    { key: "orders", label: "Orders", format: "number" },
    { key: "customers", label: "Customers", format: "number" },
    { key: "conversionRate", label: "Conversion Rate", format: "percent" },
    { key: "aiConversions", label: "AI Conversions", format: "number" },
    { key: "aiConversations", label: "AI Chats", format: "number" },
  ],
  pipeline: {
    donutStyle: "thick",
    legend: "stacked_right",
    segments: [
      { key: "completed", label: "Completed", color: "#10B981", statuses: ["DELIVERED", "COMPLETED"] },
      { key: "pending", label: "Pending", color: "#3B82F6", statuses: ["PAID", "CONFIRMED", "PROCESSING"] },
      { key: "cancelled", label: "Cancelled", color: "#EF4444", statuses: ["CANCELLED", "REFUNDED"] },
    ],
  },
  capabilities: {
    hasFinanceModule: true,
    hasMarketingModule: true,
    hasInvoiceOverview: true,
    hasAdvancedFilters: true,
    hasCustomerInsights: "full",
    hasInventoryAlerts: true,
    maxKpiSlots: 6,
  },
}
```

## Error Handling

**Rescue System Integration:**

The merchant admin integrates with [Vayva Rescue](../../05_operations/automation/vayva-rescue.md) for automated incident response:

```typescript
// error.tsx
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

export default function Error({ error, reset }) {
  return <RescueOverlay error={error} reset={reset} />;
}
```

## API Integration

**Core API:**
- Base URL: `https://api.vayva.ng`
- Authentication: JWT via Better Auth
- All business logic handled by Core API

**Key Endpoints:**
```
GET    /api/merchant/me              - Current merchant data
GET    /api/merchant/orders          - Order list
POST   /api/merchant/orders/:id      - Update order
GET    /api/merchant/products        - Product list
POST   /api/merchant/products        - Create product
GET    /api/merchant/customers       - Customer list
GET    /api/merchant/analytics       - Analytics data
GET    /api/merchant/finance         - Financial data
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_APP_URL=https://merchant.vayva.ng
NEXT_PUBLIC_API_URL=https://api.vayva.ng
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_...

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Features
NEXT_PUBLIC_AI_FEATURES_ENABLED=true

# Rescue System
GROQ_API_KEY_RESCUE=
```

## Deployment

**Platform:** Vercel

**Domains:**
- Production: `merchant.vayva.ng`
- Staging: `staging-merchant.vayva.ng`

## Monitoring

- Vercel Analytics
- Sentry error tracking
- Rescue system incident tracking
- Custom analytics events

## Related Documentation

- [Dashboard Variants](../../01_product/features/dashboard-variants.md)
- [Permission System](../../06_security_compliance/access-control.md)
- [Vayva Rescue](../../05_operations/automation/vayva-rescue.md)
- [Core API Documentation](../core-api/)

---

**Questions?** Contact the frontend team or check the [Development Guide](../../03_development/).
