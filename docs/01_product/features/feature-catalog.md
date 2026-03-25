# Feature Catalog

> Last updated: 2026-03-23
> Status: Active
> Source of truth for tier access: `Backend/core-api/src/config/pricing.ts`

---

## Overview

This document catalogs every major feature in the Vayva platform, organized by domain. For each feature, we list its description, which subscription tiers have access, and the key screens or interfaces where it appears.

### Tier Legend

| Symbol | Tier |
|--------|------|
| S | STARTER (NGN 25,000/mo) |
| P | PRO (NGN 35,000/mo) |
| P+ | PRO_PLUS (NGN 50,000/mo) |

---

## 1. Product Management

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Product CRUD | Create, read, update, and delete products with title, description, pricing, images, and variants | S, P, P+ | Merchant > Products > Add/Edit Product |
| Product Variants | Define variants (size, color, material) with individual pricing and inventory per variant | S, P, P+ | Merchant > Products > Edit Product > Variants |
| Product Categories | Organize products into categories and subcategories | S, P, P+ | Merchant > Products > Categories |
| Product Images | Upload multiple product images with drag-and-drop ordering (MinIO storage) | S, P, P+ | Merchant > Products > Edit Product > Images |
| Bulk Product Import | Import products via CSV upload | S, P, P+ | Merchant > Products > Import |
| Product Search and Filters | Search by name, filter by category, status, price range, stock level | S, P, P+ | Merchant > Products |
| Product Limits | STARTER: 100, PRO: 300, PRO_PLUS: 500 | S, P, P+ | Enforced server-side |
| Inventory Tracking | Track stock levels per product/variant with low-stock alerts | S, P, P+ | Merchant > Products > Inventory |
| Product Publishing | Publish/unpublish products to storefront | S, P, P+ | Merchant > Products > Edit Product |

---

## 2. Order Management

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Order Dashboard | View all orders with status filters (pending, confirmed, processing, shipped, delivered, cancelled) | S, P, P+ | Merchant > Orders |
| Order Details | View line items, customer info, payment status, delivery address, timeline | S, P, P+ | Merchant > Orders > Order Detail |
| Order Status Updates | Update order status through its lifecycle | S, P, P+ | Merchant > Orders > Order Detail |
| Order Creation | Manually create orders on behalf of customers | S, P, P+ | Merchant > Orders > New Order |
| Order Notifications | Automated WhatsApp/email notifications to customers on status changes | S, P, P+ | Automated |
| Order Search | Search orders by ID, customer name, phone number, status | S, P, P+ | Merchant > Orders |
| Order Limits | STARTER: 500/month, PRO: 10,000/month, PRO_PLUS: Unlimited | S, P, P+ | Enforced server-side |
| Approval Workflows | Require manager approval before order status changes | P, P+ | Merchant > Settings > Workflows |
| Order Export | Export orders to CSV for accounting and reporting | S, P, P+ | Merchant > Orders > Export |

---

## 3. Customer Management

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Customer List | View all customers with search and filtering | S, P, P+ | Merchant > Customers |
| Customer Profiles | Individual customer view with contact info, order history, notes, tags | S, P, P+ | Merchant > Customers > Customer Detail |
| Customer Segmentation | Tag and group customers for targeted campaigns | S, P, P+ | Merchant > Customers > Segments |
| Customer Notes | Add internal notes to customer profiles | S, P, P+ | Merchant > Customers > Customer Detail |
| Customer Limits | STARTER: 1,000 customers, PRO/PRO_PLUS: Unlimited | S, P, P+ | Enforced server-side |
| Customer Import | Bulk import customers via CSV | S, P, P+ | Merchant > Customers > Import |
| Conversation History | View full WhatsApp/chat conversation history per customer | S, P, P+ | Merchant > Inbox > Conversation |

---

## 4. AI Sales Agent

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| AI Assistant | AI-powered customer-facing chat agent for WhatsApp and web | S, P, P+ | Customer-facing (WhatsApp, storefront chat) |
| Agent Personality | Configure agent name, tone preset (Friendly, Professional, Luxury, Playful, Minimal) | S, P, P+ | Merchant > AI Settings > Profile |
| Persuasion Level | Set selling assertiveness (Level 0-3) | S, P, P+ | Merchant > AI Settings > Profile |
| Brevity Mode | Control response length (Short, Medium) | S, P, P+ | Merchant > AI Settings > Profile |
| Custom Greetings | Configure greeting and sign-off templates | S, P, P+ | Merchant > AI Settings > Profile |
| Escalation Rules | Define when the AI should hand off to a human (e.g., complaints, refund requests) | S, P, P+ | Merchant > AI Settings > Escalation |
| Prohibited Claims | Set content the AI must never say | S, P, P+ | Merchant > AI Settings > Profile |
| Product Recommendations | AI suggests relevant products based on conversation context | S, P, P+ | Customer-facing |
| Order Placement | AI guides customers through selecting products and placing orders | S, P, P+ | Customer-facing |
| FAQ Handling | AI answers common questions from the merchant's knowledge base | S, P, P+ | Customer-facing |
| Order Status Lookup | AI retrieves and communicates order status to customers | S, P, P+ | Customer-facing |
| Image Understanding | AI processes images sent by customers (product photos, receipts) | S, P, P+ | Customer-facing |
| Voice Note Processing | Transcribes and responds to voice notes via VoiceProcessor | S, P, P+ | Customer-facing |
| AI Autopilot | Autonomous operations: inventory optimization, marketing suggestions, customer re-engagement | P, P+ | Merchant > AI Settings > Autopilot |
| AI Credit Monitoring | View credit usage, remaining balance, and consumption history | S, P, P+ | Merchant > AI Settings > Usage |
| Credit Top-Up | Purchase additional AI credit packages | S, P, P+ | Merchant > AI Settings > Usage > Top Up |
| PII Protection | Automatic sanitization of customer PII before sending to AI providers | S, P, P+ | Automated (transparent) |

---

## 5. WhatsApp Integration

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| WhatsApp Connection | Connect a WhatsApp Business number via QR code (Evolution API) | S, P, P+ | Merchant > Settings > WhatsApp |
| Inbound Message Handling | Receive and process customer messages automatically | S, P, P+ | Automated |
| Outbound Messaging | Send messages to customers through the platform | S, P, P+ | Merchant > Inbox |
| Conversation Inbox | Unified inbox for all customer conversations | S, P, P+ | Merchant > Inbox |
| Human Takeover | Merchant staff can take over a conversation from the AI agent | S, P, P+ | Merchant > Inbox > Conversation |
| Message Limits | STARTER: 500/month, PRO: 5,000/month, PRO_PLUS: 10,000/month | S, P, P+ | Enforced server-side |
| Instagram Automation | Automated responses to Instagram DMs | S, P, P+ | Merchant > Settings > Instagram |

---

## 6. Campaigns and Marketing

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Campaign Builder | Create and schedule broadcast campaigns via WhatsApp | S, P, P+ | Merchant > Campaigns > New Campaign |
| Campaign Analytics | Track delivery, open, and response rates | S, P, P+ | Merchant > Campaigns > Campaign Detail |
| Customer Targeting | Send campaigns to specific customer segments | S, P, P+ | Merchant > Campaigns > New Campaign |
| Campaign Limits | STARTER: 1,000/month, PRO: 10,000/month, PRO_PLUS: 50,000/month | S, P, P+ | Enforced server-side |
| Scheduled Campaigns | Schedule campaigns for future delivery | S, P, P+ | Merchant > Campaigns > New Campaign |

---

## 7. Storefront Builder

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Online Storefront | Branded web store hosted on `store.vayva.ng` | S, P, P+ | Customer-facing (storefront URL) |
| Store Customization | Customize colors, logo, banner, and layout | S, P, P+ | Merchant > Settings > Storefront |
| Store Templates | Pre-built store templates (STARTER: 1, PRO: 2, PRO_PLUS: 5 included) | S, P, P+ | Merchant > Settings > Storefront > Templates |
| Custom Domain | Use a custom domain (e.g., shop.mybusiness.com) | P, P+ | Merchant > Settings > Storefront > Domain |
| Remove Branding | Remove "Powered by Vayva" from storefront | P, P+ | Merchant > Settings > Storefront |
| Product Pages | Auto-generated product detail pages with images, pricing, variants | S, P, P+ | Customer-facing |
| Cart and Checkout | Shopping cart with Paystack-powered checkout | S, P, P+ | Customer-facing |
| Store Policies | Configure return policy, shipping policy, terms of service | S, P, P+ | Merchant > Settings > Policies |

---

## 8. Analytics and Reporting

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Revenue Dashboard | Revenue trends, daily/weekly/monthly breakdown | S, P, P+ | Merchant > Analytics > Revenue |
| Order Analytics | Order volume, fulfillment rate, average order value | S, P, P+ | Merchant > Analytics > Orders |
| Product Analytics | Top-selling products, revenue per product, stock turnover | S, P, P+ | Merchant > Analytics > Products |
| Customer Analytics | New vs. returning customers, customer lifetime value | S, P, P+ | Merchant > Analytics > Customers |
| AI Usage Analytics | Credit consumption, conversation volume, resolution rate | S, P, P+ | Merchant > AI Settings > Usage |
| Financial Charts | Revenue, expenses, and profit visualizations | S, P, P+ | Merchant > Analytics > Financial |
| Advanced Analytics | Deep-dive reports with custom date ranges and export | S, P, P+ | Merchant > Analytics |
| Industry Dashboards | Vertical-specific analytics (e.g., table turnover for restaurants, appointment utilization for salons) | P, P+ | Merchant > Analytics > Industry |
| Merged Industry Dashboard | Combined view across multiple industry modules | P+ | Merchant > Analytics > Industry > Merged |
| Dashboard Widgets | Customizable dashboard with draggable widgets | S (6), P (10), P+ (Unlimited) | Merchant > Dashboard |
| Analytics Retention | STARTER: 90 days, PRO: 365 days, PRO_PLUS: Unlimited | S, P, P+ | All analytics screens |

---

## 9. Billing and Subscriptions

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Subscription Management | View current plan, upgrade/downgrade, billing cycle | S, P, P+ | Merchant > Settings > Billing |
| Payment History | View all subscription and top-up payment records | S, P, P+ | Merchant > Settings > Billing > History |
| Invoice Generation | Downloadable invoices for each payment | S, P, P+ | Merchant > Settings > Billing > Invoices |
| Paystack Integration | Subscription payments processed through Paystack | S, P, P+ | Merchant > Settings > Billing |
| Merchant Wallet | Revenue collected from customer orders, subject to 3% withdrawal fee | S, P, P+ | Merchant > Settings > Billing > Wallet |
| Multi-Currency Pricing | USD, EUR, GBP, KES, GHS, ZAR pricing for international merchants | S, P, P+ | Merchant > Settings > Billing |
| Trial Period | 7-day free trial on STARTER and PRO tiers | S, P | Onboarding flow |

---

## 10. Team Management

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Staff Accounts | Invite team members with email-based access | S (1), P (3), P+ (5) | Merchant > Settings > Team |
| Role-Based Permissions | Assign roles with different access levels | P, P+ | Merchant > Settings > Team > Roles |
| Activity Log | Track staff actions within the platform | P, P+ | Merchant > Settings > Team > Activity |
| Multi-Store Support | Manage multiple stores from a single account | P, P+ | Merchant > Store Switcher |

---

## 11. Workflow Builder

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Automation Rules | Define trigger-action rules (e.g., "When order placed, send WhatsApp confirmation") | S (3 rules), P (20 rules), P+ (Unlimited) | Merchant > Automations |
| Visual Workflow Builder | Drag-and-drop visual workflow designer for complex multi-step automations | P+ | Merchant > Automations > Workflow Builder |
| Workflow Templates | Pre-built workflow templates for common business processes | P+ | Merchant > Automations > Templates |
| Workflow Triggers | Event-based triggers: order created, payment received, customer signed up, AI escalation, scheduled time | S, P, P+ | Merchant > Automations > Edit Rule |
| Workflow Actions | Available actions: send WhatsApp message, send email, update order status, assign to staff, create task, call webhook | S, P, P+ | Merchant > Automations > Edit Rule |

---

## 12. Industry Vertical Modules

Each industry module adds specialized features on top of the core platform. Industry dashboards are available on PRO and PRO_PLUS tiers.

| Industry | Key Features | Package |
|----------|-------------|---------|
| Fashion | Size guides, collection management, lookbook pages, seasonal tagging | `packages/industry-fashion` |
| Restaurant | Menu builder, table management, kitchen display, order queue, tip management | `packages/industry-restaurant` |
| Food (Delivery) | Delivery zones, prep time estimates, dietary filters, combo meals | `packages/industry-food` |
| Grocery | Expiry tracking, unit pricing (per kg/litre), reorder suggestions, shopping lists | `packages/industry-grocery` |
| Retail | Barcode scanning, POS integration, supplier management, purchase orders | `packages/industry-retail` |
| Events | Event calendar, ticket management, vendor coordination, RSVP tracking | `packages/industry-events` |
| Wellness/Spa | Appointment scheduling, service menu, stylist assignment, client preferences | `packages/industry-wellness` |
| Healthcare | Appointment booking, patient intake forms, prescription tracking, HIPAA-aware | `packages/industry-healthcare` |
| Education | Course catalog, enrollment management, attendance tracking, certificate generation | `packages/industry-education` |
| Real Estate | Property listings, virtual tours, inquiry management, viewing scheduling | `packages/industry-realestate` |
| Automotive | Vehicle listings, service booking, parts catalog, trade-in valuation | `packages/industry-automotive` |
| Travel | Trip packages, itinerary builder, booking management, travel insurance | `packages/industry-travel` |
| Legal | Case management, consultation booking, document management, billing hours | `packages/industry-legal` |
| Creative | Portfolio showcase, project briefs, deliverable tracking, client proofing | `packages/industry-creative` |
| Nightlife | Event promotion, table reservations, guest lists, cover charge management | `packages/industry-nightlife` |
| Nonprofit | Donation management, volunteer coordination, campaign tracking, impact reports | `packages/industry-nonprofit` |
| Pet Care | Pet profiles, grooming appointments, vaccination tracking, boarding management | `packages/industry-petcare` |
| Professional Services | Service catalog, consultation booking, proposal management, time tracking | `packages/industry-professional` |
| SaaS | Subscription management, usage metering, license keys, feature flags | `packages/industry-saas` |
| Wholesale | Bulk pricing, minimum order quantities, B2B customer tiers, purchase orders | `packages/industry-wholesale` |
| Meal Kit | Recipe management, ingredient sourcing, subscription boxes, dietary customization | `packages/industry-meal-kit` |
| Blog/Media | Content publishing, subscriber management, paywall, newsletter | `packages/industry-blog-media` |

---

## 13. Platform Operations (Ops Console)

These features are available to the Vayva internal team through the ops console at `ops.vayva.ng`.

| Feature | Description | Key Screens |
|---------|-------------|-------------|
| Store Oversight | View and manage all merchant stores, usage, and status | Ops > Stores |
| Merchant Management | Activate, suspend, or modify merchant accounts | Ops > Merchants |
| Abuse Detection | Monitor for policy violations, fraud, and abuse | Ops > Abuse |
| Payout Management | Process and track merchant payouts | Ops > Payouts |
| Audit Logs | Complete audit trail of all administrative actions | Ops > Audit Logs |
| Platform Analytics | System-wide metrics: revenue, growth, AI usage, churn | Ops > Analytics |
| Support Tickets | Internal ticket management for merchant support | Ops > Support |

---

## 14. Integrations

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Paystack | Payment processing for subscriptions, orders, and top-ups | S, P, P+ | Automated |
| WhatsApp (Evolution API) | Customer messaging and AI agent communication | S, P, P+ | Merchant > Settings > WhatsApp |
| Instagram | Automated DM responses | S, P, P+ | Merchant > Settings > Instagram |
| MinIO (S3) | File and image storage | S, P, P+ | Automated (transparent) |
| Webhook API | Send real-time event notifications to external systems | P, P+ | Merchant > Settings > Webhooks |
| REST API | Full API access for custom integrations | P, P+ | Developer documentation |
| Email (Resend) | Transactional and marketing emails | S, P, P+ | Automated |

---

## 15. Security and Compliance

| Feature | Description | Tiers | Key Screens |
|---------|-------------|-------|-------------|
| Authentication | Email/password and social login via NextAuth/Better Auth | S, P, P+ | Login/Register |
| Session Management | Secure session handling with configurable expiry | S, P, P+ | Automated |
| Rate Limiting | API and authentication rate limiting | S, P, P+ | Automated |
| PII Sanitization | Customer data stripped before sending to AI providers | S, P, P+ | Automated |
| NDPR Compliance | Nigerian Data Protection Regulation compliance features | S, P, P+ | Merchant > Settings > Privacy |
| Audit Trail | Track all data modifications with timestamps and user attribution | S, P, P+ | Various screens |
