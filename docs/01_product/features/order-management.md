# Order Management

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Status:** Active

---

## Overview

Vayva's Order Management system provides a unified interface for handling orders from all sales channels (web, WhatsApp, Instagram, in-person). It includes a visual pipeline, automated workflows, and comprehensive order tracking.

## Key Features

### 1. Unified Order Inbox

**Purpose:** View all orders in one place regardless of source

**Supported Channels:**
- Web storefront
- WhatsApp (via SalesAgent)
- Instagram DMs
- In-person sales
- Phone orders

**Order List View:**
```
┌─────────────────────────────────────────────────────────────┐
│  ORDER INBOX                                    [Filter ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Search orders...                                        │
│                                                             │
│  ┌────────┬──────────┬───────────┬──────────┬────────────┐ │
│  │ Status │ Order #  │ Customer  │ Channel  │ Total      │ │
│  ├────────┼──────────┼───────────┼──────────┼────────────┤ │
│  │ 🟡 New │ #12345   │ John D.   │ WhatsApp │ ₦26,500    │ │
│  │ 🔵 Pro │ #12344   │ Sarah K.  │ Web      │ ₦15,000    │ │
│  │ 🟢 Shi │ #12343   │ Mike O.   │ In-store │ ₦8,500     │ │
│  │ ⚪ Del │ #12342   │ Jane N.   │ WhatsApp │ ₦42,000    │ │
│  └────────┴──────────┴───────────┴──────────┴────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Kanban Order Board

**Purpose:** Visual pipeline for order tracking

**Columns:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│    NEW      │  CONFIRMED  │  PROCESSING │   SHIPPED   │  DELIVERED  │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ #12345      │ #12344      │ #12340      │ #12338      │ #12335      │
│ ₦26,500     │ ₦15,000     │ ₦32,000     │ ₦18,500     │ ₦12,000     │
│ WhatsApp    │ Web         │ Instagram   │ WhatsApp    │ Web         │
│             │             │             │             │             │
│ #12346      │ #12341      │             │ #12339      │ #12336      │
│ ₦8,500      │ ₦45,000     │             │ ₦22,000     │ ₦9,500      │
│ In-store    │ WhatsApp    │             │ Web         │ In-store    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

**Drag & Drop:**
- Move orders between columns
- Automatic status updates
- Trigger notifications

### 3. Order Status Lifecycle

```
                    ┌──────────┐
         ┌─────────►│ CANCELLED│
         │          └──────────┘
         │
┌────┐   │   ┌──────────┐    ┌───────────┐    ┌─────────┐    ┌──────────┐
│NEW │───┴──►│CONFIRMED │───►│PROCESSING │───►│ SHIPPED │───►│DELIVERED │
└────┘       └──────────┘    └───────────┘    └─────────┘    └──────────┘
                  │                │                │
                  ▼                ▼                ▼
            ┌──────────┐     ┌──────────┐     ┌──────────┐
            │ ON_HOLD  │     │AWAITING  │     │IN_TRANSIT│
            │          │     │PICKUP    │     │          │
            └──────────┘     └──────────┘     └──────────┘
```

**Status Definitions:**

| Status | Description | Action Required |
|--------|-------------|-----------------|
| **NEW** | Order just received | Review and confirm |
| **CONFIRMED** | Order validated | Prepare for processing |
| **ON_HOLD** | Awaiting something | Resolve hold reason |
| **PROCESSING** | Being prepared | Pack items |
| **AWAITING_PICKUP** | Ready for pickup | Coordinate with driver |
| **SHIPPED** | In transit | Track delivery |
| **IN_TRANSIT** | Moving to customer | Monitor progress |
| **DELIVERED** | Customer received | Confirm completion |
| **CANCELLED** | Order cancelled | Process refund |
| **REFUNDED** | Money returned | Archive order |

### 4. AI Order Capture

**Purpose:** Automatically create orders from WhatsApp conversations

**Process:**
1. Customer sends order via WhatsApp
2. AI extracts order details
3. Draft order created in inbox
4. Merchant reviews and confirms
5. Order moves to CONFIRMED

**See:** [WhatsApp Commerce](whatsapp-commerce.md)

### 5. Bulk Actions

**Available Actions:**
- Update status (multiple orders)
- Print labels
- Send notifications
- Export to CSV
- Assign to staff
- Add tags

**Example:**
```
Select 10 orders → Mark as SHIPPED → Print all labels
```

### 6. Order Details View

**Sections:**

```
┌─────────────────────────────────────────────────────────────┐
│ ORDER #12345                                    [Actions ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 ORDER INFO                                              │
│  Status: Processing                                         │
│  Date: Mar 7, 2026, 10:30 AM                                │
│  Channel: WhatsApp                                          │
│  Payment: Paid (Paystack)                                   │
│                                                             │
│  👤 CUSTOMER                                                │
│  Name: John Doe                                             │
│  Phone: +234 801 234 5678                                   │
│  Email: john@example.com                                    │
│  Address: 123 Lagos Street, Lagos                           │
│                                                             │
│  📦 ITEMS                                                   │
│  ┌──────────┬──────────┬────────┬────────┐                 │
│  │ Product  │ Variant  │ Qty    │ Price  │                 │
│  ├──────────┼──────────┼────────┼────────┤                 │
│  │ Red Shirt│ Size M   │ 2      │ ₦10,000│                 │
│  │ Blue D.  │ Size M   │ 1      │ ₦15,000│                 │
│  └──────────┴──────────┴────────┴────────┘                 │
│                                                             │
│  💰 TOTALS                                                  │
│  Subtotal: ₦25,000                                          │
│  Delivery: ₦1,500                                           │
│  Total: ₦26,500                                             │
│                                                             │
│  🚚 DELIVERY                                                │
│  Method: Kwik Delivery                                      │
│  Tracking: KW123456789                                      │
│  Status: Out for delivery                                   │
│                                                             │
│  📝 TIMELINE                                                │
│  10:30 AM - Order created                                   │
│  10:35 AM - Payment confirmed                               │
│  11:00 AM - Processing started                              │
│  2:00 PM - Shipped                                          │
│  4:30 PM - Out for delivery                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7. Order Search & Filter

**Search Options:**
- Order number
- Customer name/phone/email
- Product name
- Date range
- Status
- Channel
- Payment status

**Saved Filters:**
- Today's orders
- Pending payment
- Ready to ship
- High value (₦50k+)
- WhatsApp orders

### 8. Order Notifications

**Automatic Notifications:**

| Event | Channels |
|-------|----------|
| Order Confirmed | WhatsApp, Email |
| Payment Received | WhatsApp, Email |
| Order Shipped | WhatsApp, Email, SMS |
| Out for Delivery | WhatsApp, SMS |
| Delivered | WhatsApp, Email |
| Cancelled | WhatsApp, Email |

**Customizable:**
- Message templates
- Notification timing
- Channel preferences

### 9. Refund & Returns

**Refund Process:**
1. Customer requests refund
2. Merchant reviews reason
3. Approve/reject refund
4. Process via Paystack
5. Update inventory
6. Close order

**Refund Types:**
- Full refund
- Partial refund
- Store credit
- Exchange

### 10. Order Analytics

**Metrics:**

| Metric | Description |
|--------|-------------|
| **Order Volume** | Total orders per period |
| **Average Order Value** | Mean order amount |
| **Conversion Rate** | % of inquiries → orders |
| **Fulfillment Time** | Time from order to delivery |
| **Cancellation Rate** | % of cancelled orders |
| **Channel Mix** | Orders by source |

**Reports:**
- Daily order summary
- Channel performance
- Product performance
- Delivery performance

## User Interface

### Dashboard Widget

```
┌─────────────────────────────────────────┐
│  📦 ORDERS                    [View All]│
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   12    │ │   5     │ │   3     │   │
│  │  New    │ │Processing│ │ Shipped │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  Recent Orders:                         │
│  • #12345 - ₦26,500 - 10 mins ago      │
│  • #12344 - ₦15,000 - 1 hour ago       │
│  • #12343 - ₦8,500 - 2 hours ago       │
│                                         │
└─────────────────────────────────────────┘
```

### Mobile View

- Swipe between status columns
- Quick action buttons
- Voice notes for team
- Photo attachments

## API Endpoints

```
GET    /api/merchant/orders              # List orders
GET    /api/merchant/orders/:id          # Get order details
POST   /api/merchant/orders              # Create order
PATCH  /api/merchant/orders/:id          # Update order
POST   /api/merchant/orders/:id/refund   # Process refund
GET    /api/merchant/orders/stats        # Order statistics
```

## Pricing

| Feature | Free | Starter | Growth | Enterprise |
|---------|------|---------|--------|------------|
| Order Inbox | ✓ | ✓ | ✓ | ✓ |
| Kanban Board | Basic | Full | Full | Full |
| AI Order Capture | 50/mo | Unlimited | Unlimited | Unlimited |
| Bulk Actions | 10/order | Unlimited | Unlimited | Unlimited |
| Advanced Filters | - | ✓ | ✓ | ✓ |
| Custom Notifications | - | ✓ | ✓ | ✓ |
| Refund Management | ✓ | ✓ | ✓ | ✓ |
| Order Analytics | Basic | Advanced | Full | Custom |

## Best Practices

### For Merchants

1. **Process Orders Quickly**
   - Aim for < 2 hours from new to processing
   - Set up notifications
   - Use mobile app for on-the-go

2. **Keep Customers Informed**
   - Update status promptly
   - Proactive communication
   - Provide tracking info

3. **Organize with Tags**
   - Urgent orders
   - VIP customers
   - Special handling

4. **Monitor Metrics**
   - Track fulfillment time
   - Watch cancellation rate
   - Review channel performance

### For Staff

1. **Use Keyboard Shortcuts**
   - `N` - New order
   - `S` - Search
   - `F` - Filter
   - `P` - Print

2. **Collaborate with Notes**
   - Add internal notes
   - @mention team members
   - Attach photos

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Order not appearing | Check channel integration |
| Can't update status | Verify permissions |
| Missing notifications | Check notification settings |
| Sync delays | Refresh page, check connection |

## Related Documentation

- [WhatsApp Commerce](whatsapp-commerce.md)
- [Merchant Admin](../../07_applications/merchant-admin/)
- [Payment Processing](payment-processing.md)
- [Delivery Tracking](delivery-tracking.md)

---

**Questions?** Contact support@vayva.ng or check the [Help Center](https://help.vayva.ng).
