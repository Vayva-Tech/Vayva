# Merchant Onboarding Guide

> A step-by-step guide for new merchants on the Vayva platform, covering the first 30 days from signup to first sale and beyond.

---

## 1. Onboarding Checklist

Use this checklist to track your progress. Complete all items to fully activate your Vayva store.

### Day 1 — Account Setup

- [ ] Create your Vayva account at [vayva.ng](https://vayva.ng)
- [ ] Select your industry vertical
- [ ] Choose a subscription plan (Starter, Pro, or Pro+)
- [ ] Complete your first payment via Paystack
- [ ] Verify your email address
- [ ] Set up your business profile (name, logo, description)
- [ ] Connect your bank account for payouts

### Days 2–3 — Store Configuration

- [ ] Customise your storefront template (colours, banner, logo)
- [ ] Set up your store categories
- [ ] Add your first 10 products (name, description, price, images)
- [ ] Configure shipping options and delivery zones
- [ ] Review your storefront at `yourstore.vayva.ng`

### Days 4–5 — WhatsApp & AI Setup

- [ ] Connect your WhatsApp number to Vayva
- [ ] Scan the QR code from your dashboard
- [ ] Configure your AI agent greeting message
- [ ] Set your AI agent's tone and personality
- [ ] Test the AI agent by sending a test message
- [ ] Set operating hours for human vs. AI responses

### Days 6–7 — Go Live

- [ ] Share your storefront link on social media
- [ ] Share your WhatsApp number with existing customers
- [ ] Process your first test order (you can cancel it after)
- [ ] Verify payment flow end-to-end
- [ ] Review your dashboard analytics

### Days 8–30 — Growth

- [ ] Add remaining product catalogue
- [ ] Set up your first marketing campaign
- [ ] Review AI agent conversation logs and refine responses
- [ ] Invite team members (Pro/Pro+ plans)
- [ ] Monitor credit usage and top up if needed
- [ ] Explore advanced features for your plan tier

---

## 2. Detailed Setup Steps

### 2.1 Account Registration

**Step 1: Visit vayva.ng**

Navigate to the Vayva website and click the "Get Started" button.

**Step 2: Business Information**

Fill in the registration form:

| Field | Description | Example |
|-------|-------------|---------|
| Business Name | Your official business name | "Amara Fashion House" |
| Email | Primary contact email | "hello@amarafashion.com" |
| Phone Number | Nigerian phone number | "+234 801 234 5678" |
| Industry | Select from 20+ verticals | "Fashion & Apparel" |
| Store URL | Your preferred subdomain | "amarafashion" → amarafashion.vayva.ng |

**Step 3: Choose a Plan**

| Plan | Price | Best For |
|------|-------|----------|
| **Starter** (₦25,000/mo) | Small businesses getting started with online sales | Sole proprietors, market vendors going digital |
| **Pro** (₦35,000/mo) | Growing businesses that need automation and scale | Established shops, multi-staff operations |
| **Pro+** (₦50,000/mo) | Large operations needing maximum power | Multi-location businesses, high-volume sellers |

Starter and Pro plans include a **7-day free trial**. Your card will be charged at the end of the trial period.

**Step 4: Payment**

Complete payment via Paystack. Supported methods: debit card (Verve, Mastercard, Visa), bank transfer, or USSD.

---

### 2.2 Business Profile Setup

After registration, configure your business profile in **Settings > Business Profile**:

1. **Business Logo**: Upload a square image (minimum 200x200px, PNG or JPEG). This appears on your storefront and in WhatsApp messages.

2. **Business Description**: Write 2–3 sentences about what your business offers. This is displayed on your storefront's "About" section and used by the AI agent when describing your business to customers.

3. **Contact Information**: Add your business address, phone number, and email. This builds customer trust and is required for order fulfilment.

4. **Operating Hours**: Set your business hours. The AI agent will adjust its behaviour outside these hours (e.g., informing customers you'll respond during business hours for complex queries).

---

### 2.3 Product Upload Guide

#### Adding a Single Product

Navigate to **Products > Add Product** and fill in:

| Field | Required | Tips |
|-------|----------|------|
| **Product Name** | Yes | Be descriptive. "Ankara Maxi Dress — Blue & Gold" is better than "Dress" |
| **Description** | Yes | Include material, dimensions, care instructions. The AI agent uses this to answer customer questions |
| **Price** | Yes | Enter in Naira (₦). No need for the currency symbol |
| **Compare-at Price** | No | Original price if the item is on sale. Shows a strikethrough price on the storefront |
| **Images** | Yes | Upload 1–5 images per product. First image is the primary. JPEG/PNG, max 5MB each |
| **Category** | Yes | Select or create a category (e.g., "Dresses", "Electronics", "Snacks") |
| **Inventory** | Yes | Enter available quantity. Set to 0 for out-of-stock items |
| **Variants** | No | Add size, colour, or material variants with individual pricing and stock levels |
| **Tags** | No | Add searchable tags like "wedding", "casual", "new arrival" |

#### Bulk Import via CSV

For merchants with large catalogues, use the CSV import feature:

1. Go to **Products > Import**
2. Download the CSV template
3. Fill in your product data following the template columns
4. Upload the completed CSV
5. Review the import preview and confirm

**CSV columns**: `name`, `description`, `price`, `compare_at_price`, `category`, `inventory`, `image_url`, `variant_size`, `variant_colour`, `tags`

---

### 2.4 AI Agent Configuration

#### Setting Up Your AI Agent

1. Navigate to **AI Agent > Settings** in your dashboard.

2. **Greeting Message**: This is the first message customers see when they contact you on WhatsApp. Keep it warm and informative.

   Example:
   ```
   Welcome to Amara Fashion House! I'm your AI shopping assistant.
   I can help you browse our collection, check prices, and place orders.
   What are you looking for today?
   ```

3. **Brand Voice**: Choose a tone that matches your brand:
   - **Professional**: Formal, respectful, suitable for B2B or luxury brands
   - **Friendly**: Warm, conversational, suitable for most retail businesses
   - **Casual**: Relaxed, uses local expressions, suitable for youth-focused brands

4. **Product Knowledge**: The AI agent automatically learns from your product catalogue. To enhance its responses:
   - Write detailed product descriptions
   - Add frequently asked questions in the AI Agent settings
   - Define any special policies (return policy, delivery timeline, minimum order)

5. **Escalation Rules**: Configure when the AI should hand off to a human:
   - Complaints or negative feedback
   - Requests for discounts or custom orders
   - Technical issues the AI cannot resolve

#### Testing Your AI Agent

Before going live, test your AI agent:

1. Send a WhatsApp message to your connected number from a different phone.
2. Ask about a product: "What dresses do you have?"
3. Ask about pricing: "How much is the Ankara dress?"
4. Try to place an order: "I want to buy the blue dress"
5. Ask an out-of-scope question to see how it handles unknown queries.

Review conversation logs in **AI Agent > Conversations** to see how the agent performed.

---

### 2.5 WhatsApp Connection

#### Prerequisites

- A smartphone with WhatsApp installed (regular or Business)
- A stable internet connection on the phone
- The phone must remain online for the connection to stay active

#### Connection Steps

1. Open your Vayva dashboard and go to **Settings > WhatsApp**.
2. Click **"Connect WhatsApp"**.
3. A QR code will appear. The code refreshes every 60 seconds.
4. On your phone:
   - Open WhatsApp
   - Go to **Settings > Linked Devices > Link a Device**
   - Point your camera at the QR code on your screen
5. Wait for the connection to be established (usually 5–10 seconds).
6. The dashboard will update to show "Connected" status.

#### Alternative: Pairing Code

If QR scanning is difficult:

1. Click **"Use Pairing Code"** instead of QR.
2. Enter your phone number (with country code, e.g., +234...).
3. A pairing code will be displayed.
4. On your phone, go to WhatsApp > **Linked Devices > Link a Device > Link with Phone Number**.
5. Enter the pairing code.

#### Keeping the Connection Active

- Keep your phone connected to the internet (Wi-Fi or mobile data)
- Do not log out of WhatsApp or uninstall the app
- Avoid linking too many devices (WhatsApp allows up to 4 linked devices)
- If the connection drops, you will see a notification in your dashboard

---

### 2.6 First Sale Milestone

#### Preparing for Your First Order

1. **Verify your payment setup**: Go to **Settings > Payments** and ensure your bank account is connected and verified.

2. **Test the checkout flow**:
   - Visit your storefront at `yourstore.vayva.ng`
   - Add a product to cart
   - Proceed to checkout
   - Complete a test payment (use Paystack test cards if in test mode)
   - Verify the order appears in your dashboard

3. **Test via WhatsApp**:
   - Send a message to your connected WhatsApp from another phone
   - Ask the AI agent to help you place an order
   - Complete the payment via the link the agent sends
   - Check that the order appears in your dashboard

#### After Your First Sale

- Review the order in **Orders** and mark it as "Processing"
- Prepare the item for delivery
- Update the order status to "Shipped" when dispatched
- The customer will receive automatic status update notifications

---

## 3. First 30 Days Timeline

| Week | Focus Area | Goals |
|------|-----------|-------|
| **Week 1** | Setup & Launch | Account configured, 10+ products added, WhatsApp connected, AI agent tested, storefront live |
| **Week 2** | First Sales | First 5 orders processed, payment flow verified, delivery workflow established |
| **Week 3** | Optimisation | AI agent refined based on conversation logs, full product catalogue uploaded, marketing campaign launched |
| **Week 4** | Growth | Consistent daily orders, team members invited (if applicable), analytics reviewed, credit usage monitored |

---

## 4. Success Metrics

Track these metrics in your dashboard to measure your store's performance:

| Metric | Target (First 30 Days) | Where to Find |
|--------|----------------------|---------------|
| **Products Listed** | 50+ products | Dashboard > Products |
| **Storefront Visits** | 100+ visits | Dashboard > Analytics |
| **WhatsApp Conversations** | 50+ conversations | Dashboard > AI Agent > Conversations |
| **Orders Placed** | 10+ orders | Dashboard > Orders |
| **Conversion Rate** | 5%+ (visitors to orders) | Dashboard > Analytics |
| **AI Resolution Rate** | 70%+ (conversations handled without human intervention) | Dashboard > AI Agent > Performance |
| **Credit Usage** | < 80% of monthly allocation | Dashboard > Settings > Billing |
| **Customer Satisfaction** | 4.0+ out of 5.0 | Dashboard > Reviews |

---

## 5. Getting Help

If you need assistance at any stage of onboarding:

- **In-App Help**: Click the "?" icon in your dashboard for contextual help
- **WhatsApp Support**: Message our support number (available in your dashboard footer)
- **Email**: support@vayva.ng
- **FAQ**: See [Merchant FAQ](./merchant-faq.md) for answers to common questions

Pro+ merchants have access to a **dedicated account manager** who will guide you through onboarding personally.

---

## 6. Common Onboarding Mistakes to Avoid

1. **Sparse product descriptions**: The AI agent relies on your product data. Thin descriptions lead to poor AI responses. Write at least 2–3 sentences per product.

2. **Not testing the AI agent**: Always test before going live. Send messages from a different phone and review the conversation quality.

3. **Ignoring credit balance**: Monitor your AI credit usage, especially in the first week when you're likely experimenting. Set up low-credit alerts in your dashboard.

4. **Sharing the storefront too early**: Wait until you have at least 10 products and have tested the checkout flow before sharing your link publicly.

5. **Not connecting a bank account**: Without a connected bank account, you cannot withdraw earnings. Set this up on day one.

6. **Disconnecting WhatsApp accidentally**: If you link your WhatsApp to another computer or service, you may disconnect from Vayva. Keep your Vayva connection as your primary linked device.
