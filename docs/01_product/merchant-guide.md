# Merchant User Guide

> Last updated: 2026-03-23
> Application: Merchant Dashboard at `merchant.vayva.ng`

---

## Getting Started

### Creating Your Account

1. Visit `merchant.vayva.ng/signup`
2. Enter your email address and create a password
3. Verify your email via OTP (a verification code is sent to your inbox)
4. You are now signed in and ready to begin onboarding

### Onboarding Wizard

After signup, the onboarding wizard guides you through setting up your store. Complete each step to go live:

| Step | What You Do |
|------|-------------|
| **Welcome** | Learn about the platform |
| **Business Details** | Enter your business name, description, and contact information |
| **Industry Selection** | Choose your industry (e.g., Retail, Restaurant, Fashion, Events) -- this customizes your dashboard and AI agent |
| **Brand Identity** | Upload your logo, set brand colors and fonts |
| **First Product** | Add your first product or service with images, pricing, and description |
| **Payment Setup** | Connect Paystack to receive payments in Naira |
| **Store Policies** | Set your return, shipping, and privacy policies |
| **Social Media** | Connect your Instagram, Facebook, or other social accounts |
| **KYC Verification** | Submit identity verification documents (required for withdrawals) |
| **Review** | Review all your settings before going live |
| **Publish** | Launch your store -- customers can now find and buy from you |

After onboarding, an interactive tutorial walks you through your dashboard for the first time.

---

## Dashboard Overview

Your main dashboard at `/dashboard` shows a summary of your business:

- **Revenue** -- today's and this month's earnings
- **Orders** -- new orders, pending fulfillment, completed
- **Customers** -- total customers, new this period
- **Visitors** -- storefront traffic
- **Conversion rate** -- visitors who become buyers
- **AI usage** -- credit consumption and remaining balance
- **Quick actions** -- shortcuts to common tasks

The number of dashboard widgets depends on your plan (STARTER: 6 widgets, PRO: 10, PRO_PLUS: unlimited).

---

## Managing Products

### Adding a Product

Navigate to **Products** in your sidebar, then click "Add Product."

For each product, you can configure:

| Field | Description |
|-------|-------------|
| Title | Product name as customers will see it |
| Description | Detailed product description (supports rich text) |
| Handle | URL-friendly slug (auto-generated from title) |
| Price | Selling price in Naira |
| Compare-at price | Original price for showing discounts |
| Cost | Your cost price (used for profit calculations) |
| Images | Product photos (uploaded to MinIO storage) |
| Status | Draft, Active, or Archived |
| Category | Product category for organization |
| Tags | Searchable tags |
| Variants | Size, color, or other variations with individual pricing and stock |
| SEO | Custom title and description for search engines |
| Inventory | Stock quantity, SKU, barcode |

**Limits by plan:** STARTER supports up to 100 products, PRO up to 300, PRO+ up to 500.

### Product Collections

Group products into collections for better storefront organization:

- Create named collections (e.g., "Best Sellers", "New Arrivals", "Sale Items")
- Add products manually or set automatic rules
- Collections appear on your storefront for customers to browse

### Inventory Tracking

The Inventory page (`/dashboard/inventory`) shows:

- Current stock levels for all products and variants
- Low-stock alerts when items fall below threshold
- Stock movement history (adjustments, sales, restocks)
- Location-based tracking (if you have multiple stock locations)

---

## Managing Orders

### Order Lifecycle

Orders flow through these statuses:

1. **Pending** -- order received, awaiting payment confirmation
2. **Confirmed** -- payment verified, ready for fulfillment
3. **Processing** -- being prepared or packed
4. **Shipped** -- handed to delivery or ready for pickup
5. **Delivered** -- customer has received the order
6. **Cancelled** -- order was cancelled (before fulfillment)
7. **Refunded** -- payment returned to customer

### Fulfilling Orders

1. Navigate to **Orders** in your sidebar
2. Click on a pending/confirmed order
3. Update the order status as you process it
4. Add tracking information if shipping
5. Mark as delivered when the customer receives it

Each status change is recorded in the order timeline for your records.

### Refunds

To process a refund:

1. Open the order you want to refund
2. Navigate to **Refunds** or use the refund action on the order
3. Specify the refund amount (full or partial)
4. The refund is processed through Paystack

---

## Managing Customers

The Customers page (`/dashboard/customers`) provides:

- **Customer directory** -- searchable list of all your customers
- **Customer profiles** -- contact info, order history, total spend, notes
- **Customer segments** -- group customers by behavior (e.g., VIP, new, dormant)
- **Customer notes** -- add private notes about individual customers
- **Address management** -- stored delivery addresses

Customer data is accumulated automatically from orders and WhatsApp conversations.

---

## Using AI Features

### AI Sales Agent

Your AI agent handles customer conversations on WhatsApp automatically. To configure it:

1. Navigate to **AI Agent** in your sidebar
2. Set your agent's **name** (e.g., "Ade" or your business name)
3. Choose a **tone** -- Friendly, Professional, Luxury, Playful, or Minimal
4. Set the **persuasion level** -- from 0 (just answer questions) to 3 (actively sell)
5. Write a custom **greeting** message
6. Define **escalation rules** -- when should the AI hand off to you?
7. Add **prohibited claims** -- things the AI should never say
8. Choose **brevity mode** -- Short (recommended for WhatsApp) or Medium

### WhatsApp Setup

To connect WhatsApp:

1. Navigate to **AI Agent** > WhatsApp settings
2. A QR code will be displayed
3. Open WhatsApp on your phone and scan the QR code
4. Your WhatsApp Business number is now connected

Configure WhatsApp-specific settings:

| Setting | What It Does |
|---------|-------------|
| Business hours | Set when you are available; auto-reply outside these hours |
| Catalog mode | Choose between "Strict Catalog Only" (only discuss your products) or "Catalog + FAQ" (products plus general questions) |
| Image understanding | Let the AI interpret images customers send |
| Daily message limits | Maximum AI messages per customer per day |
| Human handoff | Where conversations go when escalated (e.g., your personal WhatsApp) |

### AI Hub

The AI Hub (`/dashboard/ai-hub`) is your central AI command center:

- View AI credit balance and usage trends
- Access AI-powered content generation tools
- Monitor conversation quality
- Purchase additional credits

### AI Insights

The AI Insights page (`/dashboard/ai-insights`) provides AI-generated business intelligence:

- Sales trend analysis and predictions
- Customer behavior patterns
- Product performance recommendations
- Inventory optimization suggestions

### AI Autopilot (PRO and PRO_PLUS)

The Autopilot (`/dashboard/autopilot`) runs daily analysis of your business and proposes actions:

- **Inventory actions** -- restock suggestions, dead stock alerts, flash sale recommendations
- **Marketing actions** -- improve product descriptions, optimize SEO titles
- **Customer actions** -- re-engage dormant customers, reward VIP customers
- **Operations actions** -- optimize prep times, reduce no-shows

All proposed actions appear in your Autopilot dashboard. Review each one and approve or reject it. Nothing executes without your confirmation.

### Workflow Automation (PRO_PLUS Only)

The Workflow Builder (`/dashboard/workflow-automation`) lets you create custom automation flows:

**Example workflows:**
- When a new order is placed, send a WhatsApp confirmation to the customer
- When inventory drops below 10 units, send an email alert to the store owner
- When a customer has not ordered in 30 days, send a re-engagement WhatsApp message
- When an order is paid, automatically update inventory and notify the kitchen (restaurants)

Build workflows visually by connecting triggers, conditions, and actions.

---

## Analytics and Reporting

### Sales Analytics

The Analytics page (`/dashboard/analytics`) provides:

- Revenue over time (daily, weekly, monthly)
- Order volume trends
- Average order value
- Top-selling products
- Revenue by product category
- Customer acquisition trends

**Data retention:** STARTER retains 90 days, PRO retains 365 days, PRO_PLUS retains unlimited history.

### Financial Reports

The Finance section (`/dashboard/finance`) shows:

- Total revenue and profit margins
- Transaction history with payment status
- Wallet balance and withdrawal history
- Fee breakdown (Paystack fees, withdrawal fees)
- Financial charts and trends

### Scheduled Reports

Vayva automatically generates and emails periodic reports:

- Weekly sales summary
- Monthly performance review

These are generated by background jobs and sent to your registered email.

---

## Storefront Configuration

### Theme and Design

Customize your storefront appearance at `/dashboard/designer`:

- Select a store template
- Configure brand colors, fonts, and logo
- Preview your store before publishing changes

### Pages and Content

The Pages section (`/dashboard/pages`) lets you create custom pages:

- About Us
- Contact
- FAQ
- Custom landing pages

### Blog

Manage a blog (`/dashboard/blog`) to share content with your customers:

- Create and publish blog posts
- Add images and rich text
- SEO optimization for each post

### Custom Domain (PRO and PRO_PLUS)

By default, your store is accessible at `store.vayva.ng/your-store-slug`. PRO and PRO_PLUS merchants can connect a custom domain:

1. Navigate to **Domains** in your sidebar
2. Add your domain name
3. Configure DNS records as instructed
4. Vayva verifies the domain automatically via a background job

---

## Settings and Configuration

### Store Settings

At `/dashboard/settings`, configure:

- **General** -- store name, description, contact info
- **Branding** -- logo, colors, fonts
- **Currency** -- display currency (NGN default)
- **Policies** -- return, shipping, privacy, terms of service
- **Notifications** -- email notification preferences
- **Tax** -- tax configuration (if applicable)

### Team Management

At `/dashboard/settings` > Team (or the Team page):

- Invite staff members by email
- Assign roles: **OWNER** (full access), **ADMIN** (can manage most settings), **STAFF** (limited access)
- Remove or deactivate team members

**Staff limits by plan:** STARTER: 1 seat (owner only), PRO: 3 seats, PRO_PLUS: 5 seats.

### Billing

At `/dashboard/billing` or `/billing`:

- View your current plan and billing cycle
- Upgrade or downgrade your subscription
- View payment history and invoices
- Purchase AI credit top-ups
- Update payment method

### Integrations

At `/dashboard/integrations`:

- View available third-party integrations
- Connect social media accounts
- Configure webhook endpoints
- Manage API keys (PRO and PRO_PLUS)

---

## Payments and Withdrawals

### Receiving Payments

Payments from customers are processed via Paystack and deposited into your Vayva wallet. Supported payment methods:

- Debit/credit cards (Visa, Mastercard, Verve)
- Bank transfer
- USSD
- Mobile money

### Withdrawing Funds

To withdraw earnings from your wallet:

1. Navigate to **Payouts** or **Finance** > Withdrawals
2. Add a bank beneficiary (your Nigerian bank account details)
3. Set up a wallet PIN (required for security)
4. Enter the withdrawal amount
5. Confirm with your wallet PIN
6. A 3% withdrawal fee is deducted automatically
7. Funds are transferred to your bank account

**Requirements:**
- KYC verification must be approved
- Wallet must not be locked
- Payouts must be enabled on your store

---

## Getting Help

### In-App Support

- Access support tickets from `/dashboard/support`
- Create a new ticket describing your issue
- Track ticket status and responses

### Priority Support (PRO_PLUS)

PRO_PLUS merchants receive priority support with faster response times.

### Contact

- Email: hello@vayva.ng
- Website: vayva.ng/help and vayva.ng/contact
