# Merchant Admin Feature Guide

> Detailed walkthrough of every feature available in the Merchant Admin Dashboard.

---

## 1. Product Management

### Creating a Product

1. Navigate to **Products** from the sidebar
2. Click **Add Product**
3. Fill in the required fields:
   - **Title** -- The product name displayed on the storefront and in WhatsApp conversations
   - **Description** -- Rich text description with formatting support
   - **Price** -- Base price in Naira (NGN)
   - **Compare-at price** -- Optional strikethrough price for showing discounts
   - **Category** -- Assign to a product category for organization
   - **Images** -- Upload up to 10 images per product; first image is the primary display image

### Product Variants

Products can have multiple variants based on attributes such as size, color, or material:

- **Variant options** -- Define option names (e.g., "Size") and values (e.g., "S", "M", "L", "XL")
- **Per-variant pricing** -- Override the base price for specific variants
- **Per-variant inventory** -- Track stock independently for each variant
- **SKU assignment** -- Assign unique SKUs to each variant for internal tracking

### Inventory Tracking

- **Stock levels** -- Set initial quantity and low-stock threshold per product/variant
- **Automatic decrements** -- Stock reduces automatically when orders are confirmed
- **Restock alerts** -- Receive notifications when stock falls below the configured threshold
- **Inventory breakdown** -- View stock distribution across variants (e.g., how many "Size M, Blue" remain)
- **Bulk inventory updates** -- Upload a CSV to update stock levels across many products at once

### Collections

- **Manual collections** -- Curate products by hand-picking them into named groups
- **Automated collections** -- Define rules (e.g., "all products with tag 'new-arrival'") to auto-populate
- **Collection health** -- Dashboard showing collection performance, empty collections, and staleness indicators
- **Storefront display** -- Collections appear as browsable categories on the customer storefront

### Product Import/Export

- **CSV import** -- Upload products in bulk using a standardized CSV template
- **CSV export** -- Download the full product catalog for offline editing or backup
- **Image handling** -- Images can be referenced by URL during import

---

## 2. Order Management

### Order Lifecycle

Orders progress through the following statuses:

```
PENDING --> CONFIRMED --> PROCESSING --> SHIPPED --> DELIVERED
                                    \--> CANCELLED
                                    \--> REFUNDED
```

1. **Pending** -- New order received, awaiting merchant confirmation
2. **Confirmed** -- Merchant has acknowledged and accepted the order
3. **Processing** -- Order is being prepared (packed, cooked, assembled)
4. **Shipped** -- Order has been dispatched with tracking information
5. **Delivered** -- Order successfully received by the customer
6. **Cancelled** -- Order cancelled before fulfillment (by merchant or customer)
7. **Refunded** -- Payment returned to customer (full or partial)

### Order Actions

- **Confirm order** -- Accept a pending order and begin processing
- **Add tracking** -- Enter a tracking number and carrier for shipped orders
- **Mark as delivered** -- Manually confirm delivery if tracking is unavailable
- **Cancel order** -- Cancel with an optional reason; triggers refund if payment was received
- **Issue refund** -- Process full or partial refund through Paystack; amount returns to customer's original payment method

### Order Notifications

- **Merchant notifications** -- New order alerts via dashboard, email, and WhatsApp
- **Customer notifications** -- Automatic status updates sent via WhatsApp when order status changes

### Fulfillment Options

- **Pickup** -- Customer collects from a configured pickup point
- **Delivery** -- Order dispatched via integrated logistics (Kwik, GIG Logistics)
- **Multiple pickup points** -- Merchants can define several locations with addresses and default selections

---

## 3. Customer Management

### Customer Directory

Every customer who places an order or registers an account is stored in the customer directory with:

- **Contact info** -- Name, email, phone number
- **Addresses** -- Multiple saved addresses for delivery
- **Order history** -- Complete list of past orders with totals
- **Lifetime value** -- Total amount spent across all orders
- **Notes** -- Internal merchant notes attached to the customer profile
- **Tags** -- Custom labels for segmentation (e.g., "VIP", "wholesale-buyer")

### Customer Segmentation

Segment customers based on behavioral and transactional data:

- **High-value customers** -- Customers above a configurable lifetime spend threshold
- **At-risk customers** -- Customers who have not ordered within a defined period
- **New customers** -- First-time buyers within the last 30 days
- **Repeat customers** -- Customers with 2+ orders
- **Custom segments** -- Build segments using tag and purchase-based filters

### Customer Insights

The insights dashboard provides aggregate analytics:

- **Customer growth** -- New customers over time
- **Retention rate** -- Percentage of customers making repeat purchases
- **Average order value** -- Mean spend per transaction
- **Geographic distribution** -- Where customers are located

### Import/Export

- **Import customers** -- Upload a CSV of customer records for migration from other platforms
- **Export customers** -- Download the full customer list for external analysis or CRM integration

---

## 4. AI Agent Configuration

### Agent Personality

Configure how the AI sales agent communicates with customers on WhatsApp:

- **Agent name** -- The display name used in conversations (e.g., "Aisha from FashionHub")
- **Tone preset** -- Choose from predefined communication styles:
  - `friendly` -- Warm, conversational, emoji-friendly
  - `professional` -- Formal, business-appropriate
  - `casual` -- Relaxed, slang-inclusive
  - `luxury` -- Refined, premium-feeling
- **Brevity mode** -- Control response length:
  - `concise` -- Short, direct answers
  - `balanced` -- Moderate detail
  - `detailed` -- Comprehensive responses
- **Persuasion level** -- Scale from 1-5 controlling how actively the agent promotes products and encourages purchases

### Knowledge Base

The AI agent uses Retrieval-Augmented Generation (RAG) to provide accurate, store-specific answers:

- **Upload documents** -- Add FAQs, product guides, return policies, and shipping information
- **Auto-indexed products** -- All products are automatically available to the agent
- **Context retrieval** -- When a customer asks a question, the system retrieves the 3 most relevant knowledge chunks to inform the response
- **Store metadata** -- Business hours, return policy, phone number, and description are always available to the agent

### Conversation Management

- **Active conversations** -- View all ongoing AI-customer chats
- **Conversation history** -- Searchable archive of past conversations
- **Sentiment indicators** -- Each conversation tagged with positive/neutral/negative sentiment
- **Manual takeover** -- Jump into any conversation to respond as a human

### Escalation Configuration

Define when the AI should automatically hand off to a human:

- **Payment disputes** -- Customer mentions payment problems, refunds, or fraud
- **Fraud risk** -- Suspicious order patterns or known fraud indicators
- **Billing errors** -- Pricing discrepancies or coupon issues
- **Negative sentiment** -- Customer frustration exceeds a configurable threshold
- **Custom triggers** -- Define keyword-based escalation rules

When escalation fires, the system:
1. Creates a support ticket with priority based on trigger type
2. Records an audit event (HandoffEvent) with the AI's conversation summary
3. Sends the customer a handoff message (e.g., "Let me connect you with our team...")
4. Notifies the merchant via dashboard and WhatsApp

---

## 5. WhatsApp Integration Setup

### Connecting WhatsApp

Vayva integrates with WhatsApp Business via the Evolution API:

1. Navigate to **Account > Integrations > WhatsApp**
2. Enter your WhatsApp Business phone number
3. Scan the QR code displayed to authenticate the session
4. Verify the connection status shows "Connected"

### WhatsApp Agent Settings

- **Auto-reply** -- Enable/disable automatic AI responses to incoming messages
- **Business hours** -- Set hours during which the AI agent is active; outside hours, customers receive a configurable away message
- **Image understanding** -- Toggle whether the AI can process and respond to product images sent by customers
- **Welcome message** -- Configure the first message new customers receive

### Message Flow

```
Customer sends WhatsApp message
  --> Evolution API receives message
  --> Worker processes inbound message (whatsapp-inbound queue)
  --> AI Agent generates response (SalesAgent.handleMessage)
  --> Worker sends outbound message (whatsapp-outbound queue)
  --> Customer receives response
```

---

## 6. Analytics Dashboards

### Revenue Analytics

- **Daily revenue** -- Bar chart of revenue per day with comparison to prior period
- **Revenue by product** -- Breakdown showing which products generate the most revenue
- **Revenue by channel** -- Compare WhatsApp-originated vs. storefront orders

### Cohort Analysis

- **Monthly cohorts** -- Group customers by their first-purchase month
- **Retention matrix** -- Show what percentage of each cohort returns in subsequent months
- **Cohort revenue** -- Track how much each cohort contributes over time

### A/B Testing

- **Active experiments** -- View running A/B tests (pricing, descriptions, agent behavior)
- **Results dashboard** -- Statistical significance, conversion rates, and winner declarations
- **Test creation** -- Define variants and traffic splits for new experiments

### ROAS Tracking

- **Campaign performance** -- Track return on ad spend for marketing campaigns
- **Attribution** -- Map orders back to their originating campaign or channel

---

## 7. Billing Management

### Subscription Tiers

| Feature | STARTER (N25,000/mo) | PRO (N35,000/mo) | PRO_PLUS (N50,000/mo) |
|---------|---------------------|-------------------|----------------------|
| Products | Up to 100 | Up to 1,000 | Unlimited |
| AI messages | 500/month | 2,000/month | 10,000/month |
| Team members | 2 | 5 | Unlimited |
| Analytics | Basic | Advanced | Advanced + Predictive |
| Custom domain | No | Yes | Yes |
| Priority support | No | No | Yes |

### Credit System

AI usage is measured in credits:

- **Rate** -- 0.24 credits per 1,000 tokens (input + output combined)
- **Balance tracking** -- Real-time credit balance displayed in the dashboard header
- **Usage history** -- Detailed breakdown of credit consumption by day and conversation
- **Low credit alerts** -- Notification when credits fall below 10% of monthly allocation
- **Top-up** -- Purchase additional credits as add-ons without changing the subscription tier

### Payment Management

- **Payment method** -- Managed through Paystack (card, bank transfer, USSD)
- **Auto-renewal** -- Subscriptions renew automatically at the start of each billing cycle
- **Invoice history** -- Download PDF invoices for each billing period
- **Plan changes** -- Upgrade or downgrade with prorated billing

---

## 8. Team Management

### Inviting Team Members

1. Navigate to **Settings > Team**
2. Click **Invite Member**
3. Enter the team member's email address
4. Select a role: **Admin** or **Staff**
5. The invitee receives an email with a signup/login link

### Managing Roles

- **Change role** -- Upgrade staff to admin or downgrade admin to staff
- **Remove member** -- Revoke access immediately; their sessions are invalidated
- **Activity log** -- View actions taken by each team member for accountability

### Role Permissions Matrix

| Action | Owner | Admin | Staff |
|--------|-------|-------|-------|
| View dashboard | Yes | Yes | Yes |
| Manage products | Yes | Yes | Yes |
| Process orders | Yes | Yes | Yes |
| View customers | Yes | Yes | Yes |
| Edit customer notes | Yes | Yes | No |
| Configure AI agent | Yes | Yes | No |
| View analytics | Yes | Yes | No |
| Manage team | Yes | Yes | No |
| Change store settings | Yes | Yes | No |
| Manage billing | Yes | No | No |
| Delete store | Yes | No | No |

---

## 9. Industry-Specific Features

### Fashion Vertical

- **Size guide management** -- Create and assign size charts to products
- **Collections** -- Seasonal and curated product groupings
- **Trend analytics** -- Track trending styles and categories
- **Visual merchandising** -- Configure product display layouts
- **Wholesale settings** -- Manage wholesale pricing and minimum order quantities
- **Lookbooks** -- Create visual product showcases

### Restaurant Vertical

- **Menu management** -- Organize items by meal categories
- **Dietary filters** -- Tag items as vegetarian, halal, gluten-free, etc.
- **Prep time** -- Set estimated preparation time per item
- **Table/delivery toggle** -- Switch between dine-in and delivery modes

### Events Vertical

- **Ticket types** -- General admission, VIP, early bird
- **Capacity management** -- Set and track venue capacity limits
- **Calendar sync** -- Sync events with external calendars

### Other Verticals

Each of the 20+ supported verticals adds its own settings panel under **Settings > [Industry]** with features tailored to that business type. The dashboard home page also adapts its widgets to show industry-relevant metrics.

---

## 10. Notification Settings

### Notification Channels

- **Dashboard** -- In-app notification bell with unread count
- **Email** -- Configurable email alerts for orders, low stock, and escalations
- **WhatsApp** -- Receive merchant notifications on your personal WhatsApp number

### Notification Rules

- **Create custom rules** -- Define conditions (e.g., "order value > N50,000") that trigger specific alerts
- **Priority levels** -- Set notification priority for different event types
- **Quiet hours** -- Suppress non-urgent notifications during off-hours (e.g., 11 PM to 7 AM)

### Default Notifications

| Event | Dashboard | Email | WhatsApp |
|-------|-----------|-------|----------|
| New order | Yes | Yes | Yes |
| Low stock | Yes | Yes | No |
| AI escalation | Yes | Yes | Yes |
| Payment received | Yes | Yes | No |
| New customer signup | Yes | No | No |
| Credit balance low | Yes | Yes | No |
