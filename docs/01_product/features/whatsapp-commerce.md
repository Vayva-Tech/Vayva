# WhatsApp Commerce

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Status:** Active

---

## Overview

WhatsApp Commerce is Vayva's flagship feature that enables merchants to sell directly through WhatsApp. It combines AI-powered automation with seamless order management to create a conversational commerce experience.

## Key Components

### 1. AI Order Capture (SalesAgent)

**Purpose:** Automatically convert WhatsApp conversations into structured orders

**How It Works:**
1. Customer sends message to merchant's WhatsApp
2. AI analyzes intent (inquiry, order, support)
3. For orders: extracts product, quantity, delivery info
4. Creates draft order in merchant dashboard
5. Merchant reviews and confirms

**Example Conversation:**
```
Customer: "Hi, I want to order 2 red shirts and 1 blue dress"
         ↓
AI: "I'll help you with that! Let me confirm:
     - 2x Red Shirt (Size?)
     - 1x Blue Dress (Size?)
     
     What's your delivery address?"
         ↓
Customer: "Size M for both. Deliver to 123 Lagos Street"
         ↓
AI: "Perfect! Your order:
     - 2x Red Shirt (M) - ₦10,000
     - 1x Blue Dress (M) - ₦15,000
     - Delivery: ₦1,500
     Total: ₦26,500
     
     Reply CONFIRM to place order"
```

### 2. WhatsApp Catalog Sync

**Purpose:** Automatically sync product catalog to WhatsApp Business

**Features:**
- Automatic product listing updates
- Price synchronization
- Stock availability
- Product images
- Category organization

**Sync Frequency:**
- Real-time for critical changes (price, stock)
- Hourly for full catalog refresh

### 3. Automated Responses

**Purpose:** 24/7 instant replies to common inquiries

**Response Types:**

| Trigger | Response |
|---------|----------|
| "Hello" / "Hi" | Welcome message + menu options |
| "What do you sell?" | Product catalog link |
| "Track my order" | Order status lookup |
| "Prices" | Price list for common items |
| "Hours" | Business hours + location |

**Configuration:**
- Merchants can customize responses
- AI learns from merchant replies
- Fallback to human for complex queries

### 4. Order Notifications

**Purpose:** Keep customers informed about order status

**Automated Messages:**

| Event | Message |
|-------|---------|
| Order Confirmed | "Your order #12345 is confirmed! Total: ₦26,500" |
| Payment Received | "Payment received! Preparing your order..." |
| Order Shipped | "Your order is on the way! Track: [link]" |
| Out for Delivery | "Your order is out for delivery today!" |
| Delivered | "Your order has been delivered. Enjoy!" |

### 5. Customer Support

**Purpose:** Handle customer inquiries and issues

**Features:**
- Automatic ticket creation
- Sentiment analysis
- Priority routing
- Escalation to human agents

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WHATSAPP COMMERCE FLOW                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Customer WhatsApp Message                                  │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────┐                               │
│  │   Evolution API         │  (WhatsApp Gateway)           │
│  │   (VPS Docker)          │                               │
│  └──────────┬──────────────┘                               │
│             │                                               │
│             ▼                                               │
│  ┌─────────────────────────┐                               │
│  │   Core API              │  (Webhook Handler)            │
│  │   /api/webhooks/evolution                              │
│  └──────────┬──────────────┘                               │
│             │                                               │
│             ▼                                               │
│  ┌─────────────────────────┐                               │
│  │   Intent Classification │  (Groq AI)                    │
│  │   - Order Intent        │                               │
│  │   - Support Intent      │                               │
│  │   - Inquiry Intent      │                               │
│  └──────────┬──────────────┘                               │
│             │                                               │
│     ┌───────┴───────┐                                       │
│     ▼               ▼                                       │
│  ┌─────────┐   ┌──────────┐                                │
│  │ Order   │   │ Support  │                                │
│  │ Extraction│  │ Ticket   │                                │
│  └────┬────┘   └────┬─────┘                                │
│       │             │                                       │
│       ▼             ▼                                       │
│  ┌─────────────────────────┐                               │
│  │   Merchant Dashboard    │                               │
│  │   (Draft Orders)        │                               │
│  └─────────────────────────┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Merchant Configuration

### Setup Steps

1. **Connect WhatsApp Business**
   - Go to Settings → WhatsApp
   - Scan QR code with WhatsApp Business app
   - Verify phone number

2. **Configure AI Responses**
   - Enable/disable automated responses
   - Customize welcome message
   - Set business hours

3. **Test Integration**
   - Send test message
   - Verify order creation
   - Check notification delivery

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-Reply | Respond to messages automatically | Enabled |
| AI Order Capture | Extract orders from conversations | Enabled |
| Catalog Sync | Sync products to WhatsApp | Enabled |
| Business Hours | When auto-reply is active | 9 AM - 6 PM |
| Response Delay | Seconds before AI responds | 5 seconds |

## AI Training

### Continuous Learning

The AI improves over time by:
- Learning from merchant corrections
- Analyzing successful order conversions
- Incorporing merchant response patterns

### Customization

Merchants can:
- Add custom product aliases
- Define common customer questions
- Set preferred response style
- Create custom quick replies

## Analytics

### Key Metrics

| Metric | Description |
|--------|-------------|
| **Conversations** | Total WhatsApp conversations |
| **AI Conversion Rate** | % of conversations resulting in orders |
| **Response Time** | Average AI response time |
| **Human Handoff Rate** | % escalated to human agents |
| **Customer Satisfaction** | Rating from WhatsApp interactions |

### Reports

- Daily conversation summary
- Order conversion funnel
- Popular product inquiries
- Peak activity hours

## Pricing

| Feature | Free | Starter | Growth | Enterprise |
|---------|------|---------|--------|------------|
| WhatsApp Business | ✓ | ✓ | ✓ | ✓ |
| Auto-Replies | 50/mo | Unlimited | Unlimited | Unlimited |
| AI Order Capture | - | ✓ | ✓ | ✓ |
| Catalog Sync | Manual | Hourly | Real-time | Real-time |
| Custom Responses | - | ✓ | ✓ | ✓ |
| Advanced Analytics | - | - | ✓ | ✓ |

## Best Practices

### For Merchants

1. **Keep Catalog Updated**
   - Accurate prices
   - Current stock levels
   - Clear product descriptions

2. **Monitor AI Performance**
   - Review draft orders regularly
   - Correct AI mistakes
   - Provide feedback

3. **Set Clear Expectations**
   - Define business hours
   - Communicate response times
   - Provide alternative contact methods

4. **Use Quick Replies**
   - Create templates for common questions
   - Set up FAQ responses
   - Use buttons when possible

### For Customers

1. **Be Specific**
   - Include product names
   - Specify sizes/colors
   - Provide complete address

2. **Use Keywords**
   - "Order" to start purchase
   - "Track" for order status
   - "Help" for support

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| AI not responding | Check WhatsApp Business connection |
| Wrong order extraction | Train AI with correct examples |
| Messages not sending | Verify Evolution API status |
| Catalog not syncing | Check product visibility settings |

### Support

- **Docs:** help.vayva.ng/whatsapp
- **Email:** support@vayva.ng
- **WhatsApp:** +234...

## Roadmap

### Q2 2026
- [ ] Voice message support
- [ ] Image-based ordering
- [ ] Multi-language responses

### Q3 2026
- [ ] WhatsApp Payments integration
- [ ] Group chat commerce
- [ ] Advanced AI personalization

### Q4 2026
- [ ] Voice AI assistant
- [ ] Predictive ordering
- [ ] Cross-platform sync

## Related Documentation

- [Evolution API Integration](../../08_reference/integrations/evolution-whatsapp.md)
- [AI Features](ai-features.md)
- [Order Management](order-management.md)
- [Merchant Admin](../../07_applications/merchant-admin/)

---

**Questions?** Contact support@vayva.ng or check the [Help Center](https://help.vayva.ng).
