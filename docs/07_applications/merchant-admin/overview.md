# Merchant Admin Dashboard

> **Application:** `apps/merchant`
> **URL:** `https://app.vayva.ng`
> **Framework:** Next.js 16, React 19, TypeScript

## Purpose

The Merchant Admin Dashboard is the primary interface for merchants on the Vayva platform. It provides a complete suite of tools for managing an online store, configuring AI sales agents, tracking orders, understanding customers, and monitoring business performance. Every merchant interacts with this application daily to run their commerce operations.

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | The merchant who created the store. Full access to all features including billing, team management, and account deletion. | All permissions |
| **Admin** | Trusted team member with near-complete access. Can manage products, orders, customers, and settings. Cannot delete the store or manage billing. | All except billing/deletion |
| **Staff** | Operational team member with limited access. Can process orders, update inventory, and view customer information. Cannot change store settings or access analytics. | Orders, products, inventory |

## Navigation Structure

The dashboard is organized into the following primary sections:

### Top-Level Navigation

```
/account              Account & store settings
/account/integrations Integration management (WhatsApp, Paystack, etc.)
/settings             Store-wide configuration
/settings/fashion     Industry-specific settings (varies by vertical)
/settings/notifications  Notification preferences
/api/analytics        Analytics data endpoints
/api/notifications    Notification engine
/api/merchant         Merchant profile APIs
```

### Core Sections

1. **Dashboard Home** -- Overview cards showing today's orders, revenue, AI conversations, and alerts
2. **Products** -- Full product catalog with CRUD, variants, images, and inventory
3. **Orders** -- Order list with lifecycle management (pending, confirmed, processing, shipped, delivered)
4. **Customers** -- Customer directory with purchase history, notes, and segmentation
5. **AI Hub** -- AI agent configuration, conversation logs, and performance metrics
6. **Analytics** -- Revenue dashboards, cohort analysis, A/B tests, ROAS tracking
7. **Settings** -- Store profile, domains, SEO, notifications, team management
8. **Billing** -- Subscription tier, credits balance, usage history, plan upgrades

## Key Pages and Their Functions

### Dashboard Home

The landing page after login. Displays:

- **Revenue snapshot** -- Today, this week, this month comparisons
- **Order count** -- Pending orders requiring action
- **AI conversations** -- Active WhatsApp conversations handled by the AI agent
- **Credit balance** -- Remaining AI credits with usage trend
- **Recent activity feed** -- Latest orders, customer sign-ups, and agent actions

### Products

- **Product list** -- Searchable, filterable table of all products with quick-edit capabilities
- **Product editor** -- Full-featured form for title, description, pricing, images, variants (size/color), SEO metadata, and inventory quantities
- **Collections** -- Group products into collections for storefront display
- **Bulk operations** -- Import/export products via CSV, bulk price updates

### Orders

- **Order list** -- Filterable by status, date range, customer, and payment method
- **Order detail** -- Full order breakdown with line items, customer info, payment status, fulfillment timeline
- **Fulfillment actions** -- Mark as shipped, generate tracking, trigger delivery via logistics partners
- **Refunds and returns** -- Process partial or full refunds through Paystack

### Customers

- **Customer list** -- All customers with lifetime value, order count, and last purchase date
- **Customer profile** -- Contact details, addresses, order history, notes, and tags
- **Segmentation** -- Group customers by behavior (high-value, at-risk, new) for targeted campaigns
- **Import/Export** -- Bulk customer data operations

### AI Hub

- **Agent configuration** -- Set agent name, tone preset, brevity mode, and persuasion level
- **WhatsApp settings** -- Connect WhatsApp Business number via Evolution API
- **Knowledge base** -- Upload FAQs, product guides, and store policies for RAG-powered responses
- **Conversation logs** -- Review AI-customer conversations with sentiment indicators
- **Escalation rules** -- Define triggers for automatic handoff to human support

### Analytics

- **Revenue analytics** -- Daily/weekly/monthly revenue with trend charts
- **Cohort analysis** -- Customer retention cohorts over time
- **A/B tests** -- Experiment results for pricing, descriptions, and agent behavior
- **ROAS** -- Return on ad spend tracking for campaigns

### Settings

- **Store profile** -- Business name, logo, description, category, operating hours
- **Domains** -- Custom domain configuration and verification
- **Notifications** -- Quiet hours, notification rules, and channel preferences
- **Team management** -- Invite members, assign roles, remove access
- **Industry settings** -- Vertical-specific configuration (e.g., fashion: size guides, collections, trends, visual merchandising, wholesale)

### Billing

- **Current plan** -- Active tier display (STARTER, PRO, or PRO_PLUS)
- **Usage dashboard** -- AI credits consumed, messages sent, storage used
- **Plan comparison** -- Feature matrix across tiers with upgrade flow
- **Payment history** -- Invoice list with Paystack payment receipts
- **Credit top-up** -- Purchase additional AI credits as add-ons

### Account Integrations

- **WhatsApp** -- Connect and manage WhatsApp Business number
- **Paystack** -- Payment gateway configuration and API keys
- **Logistics** -- Delivery partner integrations (Kwik, GIG Logistics)
- **Webhooks** -- Configure outbound webhooks for order and payment events

## Industry Verticals

The merchant dashboard adapts its interface based on the store's industry category. Each vertical adds specialized settings and dashboard widgets:

- **Restaurant/Food** -- Menu management, dietary filters, prep time estimates
- **Fashion** -- Size guides, lookbooks, trend analytics, visual merchandising, wholesale pricing
- **Events** -- Ticket types, capacity management, calendar integration
- **Healthcare** -- Appointment booking, patient records, compliance settings
- **Travel** -- Itinerary builder, stays management, booking calendar
- **And 15+ more verticals** -- Each with tailored features

## Technical Notes

- Authentication uses JWT tokens with refresh token rotation
- API routes under `/api/` serve as BFF (Backend for Frontend) endpoints
- Real-time updates via WebSocket connections for order notifications
- Responsive design supporting desktop and tablet form factors
- Settings persistence through the core-api backend
