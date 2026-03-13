# Batch 5 Design Specification: Grocery & Supermarket Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA GROCERY - Signature Clean Design                                             │
│  [Dashboard] [Sales] [Inventory] [Orders] [Customers] [Suppliers] [Finance] [Settings]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 TODAY'S PERFORMANCE                                 🔔 14 Notifications         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Sales Today: $24,567      │  Transactions: 847       │  Avg Basket Size  │   │
│  │  ▲ 12% vs last week         │  ▲ Online: 234          │  $28.99           │   │
│  │                             │  ▲ In-Store: 613        │  ▲ 5% vs last month│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  💰 SALES BY DEPARTMENT                               📦 INVENTORY ALERTS           │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Department Performance          │  │  Stock Alerts                          │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Produce     $4,234  18%  │  │  │  │ ⚠️ Milk (Whole) - 12 left       │  │ │
│  │  │ Meat        $3,847  16%  │  │  │  │ ⚠️ Eggs (Large) - 8 cartons     │  │ │
│  │  │ Dairy       $2,934  12%  │  │  │  │ ⚠️ Bread (Wheat) - 15 loaves    │  │ │
│  │  │ Grocery     $6,123  25%  │  │  │  │ ✅ Rice - 147 bags              │  │ │
│  │  │ Beverage    $2,456  10%  │  │  │  ✅ Pasta - 89 units               │  │ │
│  │  │ Other       $4,973  19%  │  │  │  ✅ Canned Goods - 234 units       │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Top Category: Organic (+24%)   │  │  Orders to Place: 8                   │ │
│  │  Declining: Frozen (-8%)        │  │  Estimated Value: $12,450             │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🛒 ONLINE ORDERS                                   👥 CUSTOMER INSIGHTS            │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Order Queue                     │  │  Customer Metrics                      │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Pending: 23 orders       │  │  │  │ Total Customers: 12,847         │  │ │
│  │  │ Preparing: 12 orders     │  │  │  │ Loyalty Members: 8,234 (64%)    │  │ │
│  │  │ Ready for Pickup: 8      │  │  │  │ New This Week: 234              │  │ │
│  │  │ Out for Delivery: 15     │  │  │  │ Returning Rate: 78%             │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Next Pickup Window: 2-4 PM   │  │  Average Spend by Segment:              │ │
│  │  Orders Ready: 95% on time    │  │  • Loyalty: $34.50                      │ │
│  │  Driver Assigned: 4/15        │  │  • Non-member: $18.75                   │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🏷️ PROMOTION PERFORMANCE                            📊 PRICE OPTIMIZATION          │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Active Promotions               │  │  Dynamic Pricing Opportunities        │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ BOGO: Buy 1 Get 1 Free   │  │  │  │ Competitor Price Changes:        │  │ │
│  │  │ Items: 34 products       │  │  │  │ • Store A: 12 items lower        │  │ │
│  │  │ Lift: +67% sales volume  │  │  │  │ • Store B: 8 items lower         │  │ │
│  │  │                          │  │  │  │ • Store C: 5 items lower         │  │ │
│  │  │ Weekly Special: 15 items │  │  │  │                                  │  │ │
│  │  │ Performance: +42%        │  │  │  │ Suggested Price Adjustments:     │  │ │
│  │  │                          │  │  │  │ Match competition: 25 items      │  │ │
│  │  │ Digital Coupons: 234 uses│  │  │  │ Increase margin: 18 items        │  │ │
│  │  │ Redemption: 18.4%        │  │  │  │ Clearance needed: 12 items       │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  ⏰ EXPIRATION TRACKING                               🚚 SUPPLIER DELIVERIES         │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Products Expiring Soon          │  │  Incoming Shipments                    │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Within 3 Days: 47 items  │  │  │  │ Today's Deliveries: 5 trucks    │  │ │
│  │  │ Within 7 Days: 124 items │  │  │  │                                  │  │ │
│  │  │                          │  │  │  │ Expected 10:00 AM: Sysco        │  │ │
│  │  │ Action Required:         │  │  │  │ Expected 11:30 AM: US Foods     │  │ │
│  │  │ • Markdown 34 items      │  │  │  │ Expected 1:00 PM: Local Produce │  │ │
│  │  │ • Donate 8 items         │  │  │  │ Expected 2:30 PM: Coca-Cola     │  │ │
│  │  │ • Discard 2 items        │  │  │  │ Expected 4:00 PM: Pepsi         │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Waste Reduction Savings: $847 │  │  Dock Door Assignments:                │ │
│  │  (vs discard at full loss)     │  │  Doors 1-5 assigned for today           │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📦 STOCK LEVELS                                    ⚠️ ACTION REQUIRED              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Inventory Health                │  │  Tasks & Reminders                     │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ In Stock: 2,847 items    │  │  │  │ ☑ Morning price check (done)    │  │ │
│  │  │ Low Stock: 89 items      │  │  │  │ ☐ Review waste report (due 11am)│  │ │
│  │  │ Out of Stock: 12 items   │  │  │  │ ☐ Approve purchase orders (8)   │  │ │
│  │  │ Overstocked: 34 items    │  │  │  │ ☐ Call suppliers re: delays (3) │  │ │
│  │  └──────────────────────────┘  │  │  │ ☐ Update weekly ads (by noon)   │  │ │
│  │                                 │  │  │ ☐ Staff meeting (2:00 PM)       │  │ │
│  │  Inventory Turnover: 18 days  │  │  │ ☐ Competitor shop (Thursday)    │  │ │
│  │  Shrinkage Rate: 1.2%         │  │  │ ☐ Safety inspection (Friday)    │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Signature Clean

**Primary Color:** Fresh Green `#10B981`
**Accent Colors:** Value Orange `#F59E0B`, Trust Blue `#3B82F6`, Premium Purple `#8B5CF6`

**Visual Characteristics:**
- Clean, organized layouts with clear visual hierarchy
- High-contrast pricing displays
- Product imagery integration
- Real-time inventory indicators
- Promotion badges and tags
- Department color coding
- Mobile-optimized for floor use

**Component Styling:**
- Cards: White backgrounds with subtle department-color borders
- Metrics: Bold numerals with clear currency formatting
- Charts: Bar charts for department performance, trend lines for sales
- Progress Bars: Stock level indicators with color-coded thresholds
- Tables: Product lists with inline actions
- Badges: Status indicators (low stock, expiring, on sale)

## Component Hierarchy

```
GroceryDashboard (root)
├── TodaysPerformance
│   ├── SalesToday (amount, YoY comparison, trend)
│   ├── TransactionCount (total, online vs in-store split)
│   └── AverageBasketSize (current amount, trend percentage)
├── SalesByDepartment
│   ├── DepartmentPerformanceList (ranked by revenue)
│   ├── DepartmentCard (name, revenue, percentage of total, trend)
│   ├── TopCategoryHighlight (best performing subcategory)
│   ├── DecliningCategoryAlert (underperforming segment)
│   └── DepartmenttrendChart (hourly/daily breakdown)
├── InventoryAlerts
│   ├── StockAlertList (critical, low, adequate statuses)
│   ├── AlertItem (product name, current stock, threshold, action)
│   ├── StockLevelIndicator (visual bar with color coding)
│   ├── QuickOrderButton (one-click reorder)
│   └── OrdersToPlaceSummary (count and estimated value)
├── OnlineOrders
│   ├── OrderQueueStatus (pending, preparing, ready, delivery counts)
│   ├── OrderStatusBadge (color-coded status indicator)
│   ├── PickupWindowScheduler (time slot management)
│   ├── OnTimeReadyMetric (percentage performance)
│   ├── DriverAssignmentTracker (assigned vs unassigned)
│   └── OrderDetailsModal (full order view with items)
├── CustomerInsights
│   ├── CustomerMetrics (total, loyalty members, new, returning rate)
│   ├── CustomerSegmentBreakdown (loyalty vs non-member pie chart)
│   ├── AverageSpendBySegment (comparison bars)
│   ├── CustomerGrowthChart (6-month trend)
│   └── TopCustomersList (by lifetime value)
├── PromotionPerformance
│   ├── ActivePromotionsList (current deals)
│   ├── PromotionCard (type, items count, lift percentage, redemption)
│   ├── DigitalCouponTracker (uses, redemption rate)
│   ├── PromotionROICalculator (revenue generated vs discount given)
│   └── PromotionCalendar (upcoming promotions timeline)
├── PriceOptimization
│   ├── CompetitorPriceChanges (items priced lower elsewhere)
│   ├── PriceAdjustmentSuggestions (match, increase, clearance)
│   ├── MarginAnalysisChart (current vs target margins)
│   ├── ElasticityIndicators (price sensitivity by category)
│   └── PriceMatchHistory (competitive adjustments made)
├── ExpirationTracking
│   ├── ExpiringSoonList (products within 3/7 days)
│   ├── ExpirationAlertItem (product, quantity, expiry date, action)
│   ├── ActionRecommendation (markdown, donate, discard)
│   ├── WasteReductionSavings (recovered value vs full loss)
│   └── DisposalLog (record of discarded items)
├── SupplierDeliveries
│   ├── IncomingShipmentsList (scheduled deliveries)
│   ├── ShipmentCard (supplier, expected time, PO number, dock door)
│   ├── DockDoorAssignment (door allocation display)
│   ├── DeliveryOnTimeTracker (supplier performance metric)
│   └── ReceivingChecklist (inspection requirements)
├── StockLevels
│   ├── InventoryHealthSummary (in stock, low, out, overstocked counts)
│   ├── InventoryTurnoverMetric (days to sell through)
│   ├── ShrinkageRateMetric (loss percentage)
│   ├── StockValueTotal (current inventory value)
│   └── ReorderPointCalculator (suggested order quantities)
└── ActionRequired
    ├── TaskList (prioritized daily tasks)
    ├── PriceCheckReminder (morning competitor check)
    ├── WasteReportReview (daily shrinkage analysis)
    ├── PurchaseOrderApprovals (pending PO queue)
    ├── SupplierFollowUps (delay, quality issues)
    └── WeeklyAdUpdate (promotional flyer changes)
```

## Theme Presets

### Theme 1: Fresh Market (Default)
```css
.primary: #10B981;        /* Emerald Green */
.secondary: #3B82F6;      /* Trust Blue */
.accent: #F59E0B;         /* Value Orange */
.background: #F0FDF4;     /* Green Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;         /* Red */
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(16, 185, 129, 0.15);
```

### Theme 2: Value Mart
```css
.primary: #F59E0B;        /* Orange }
.secondary: #EF4444;      /* Red */
.accent: #10B981;         /* Green */
.background: #FFFBEB;     /* Amber Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 251, 235, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(245, 158, 11, 0.15);
```

### Theme 3: Organic Natural
```css
.primary: #059669;        /* Forest Green }
.secondary: #8B7355;      /* Earth Brown */
.accent: #F4D35E;         /* Wheat */
.background: #F5F9F5;     /* Sage Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(245, 249, 245, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(5, 150, 105, 0.15);
```

### Theme 4: Premium Gourmet
```css
.primary: #8B5CF6;        /* Violet }
.secondary: #EC4899;      /* Pink */
.accent: #F59E0B;         /* Gold */
.background: #F5F3FF;     /* Purple Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(245, 243, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(139, 92, 246, 0.15);
```

### Theme 5: Ocean Fresh (Seafood Focus)
```css
.primary: #0891B2;        /* Cyan }
.secondary: #3B82F6;      /* Blue */
.accent: #F59E0B;         /* Orange */
.background: #ECFEFF;     /* Cyan Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(236, 254, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(8, 145, 178, 0.15);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Grocery-Specific Settings

#### 1. Department Configuration
- **Department Setup**
  - Produce department configuration
  - Meat & seafood settings
  - Dairy & refrigerated foods
  - Grocery (dry goods, canned, pasta)
  - Beverage (alcoholic & non-alcoholic)
  - Frozen foods
  - Bakery & deli
  - Health & beauty
  - General merchandise
- **Department Metrics**
  - Revenue targets by department
  - Margin goals by category
  - Inventory turnover benchmarks
  - Shrinkage tolerance levels
- **Visual Merchandising**
  - Planogram assignments
  - Endcap promotion schedules
  - Seasonal display rotations

#### 2. Inventory Management
- **Stock Thresholds**
  - Minimum stock levels per SKU
  - Maximum stock capacity
  - Reorder point calculations
  - Safety stock quantities
- **Product Catalog**
  - SKU creation and management
  - Barcode/UPC configuration
  - Product categorization
  - Unit of measure (each, lb, oz, kg)
  - Case pack quantities
- **Perishable Tracking**
  - Expiration date monitoring
  - FIFO (first-in-first-out) enforcement
  - Markdown rules by days-to-expiry
  - Donation partnership settings
  - Disposal logging requirements

#### 3. Pricing & Promotions
- **Pricing Rules**
  - Regular price management
  - Sale price scheduling
  - BOGO (buy one get one) configuration
  - Multi-buy discounts (3 for $5)
  - Member-only pricing
  - Senior discount settings
- **Promotion Types**
  - Weekly ad features
  - Digital coupons
  - Loyalty rewards multipliers
  - Flash sales
  - Clearance events
  - Manager specials
- **Competitive Pricing**
  - Competitor product matching
  - Price match guarantee rules
  - Automatic repricing triggers
  - Margin floor protection

#### 4. Online Ordering & Delivery
- **Fulfillment Settings**
  - Pickup time slot configuration
  - Delivery radius mapping
  - Delivery fee structure
  - Minimum order requirements
  - Substitution preferences
- **Staff Assignment**
  - Personal shopper roles
  - Driver assignments
  - Picking route optimization
  - Quality selection guidelines
- **Customer Communication**
  - Order confirmation templates
  - Ready for pickup notifications
  - Out-of-stock substitution alerts
  - Delivery tracking links

#### 5. Loyalty Program
- **Membership Tiers**
  - Basic membership (free)
  - Premium membership ($49/year)
  - Benefits by tier
  - Points earning rates
- **Rewards Structure**
  - Points per dollar spent
  - Bonus categories (2x on produce, etc.)
  - Redemption options ($5 off $50)
  - Birthday rewards
  - Anniversary bonuses
- **Personalized Offers**
  - Purchase history-based coupons
  - Abandoned cart incentives
  - Win-back campaigns
  - Referral rewards

#### 6. Supplier Management
- **Supplier Profiles**
  - Contact information
  - Payment terms (Net 30, Net 60)
  - Lead time expectations
  - Minimum order quantities
  - Quality standards
- **Purchase Orders**
  - Auto-generation rules
  - Approval workflows
  - Receiving verification
  - Invoice matching
  - Return authorization process
- **Performance Tracking**
  - On-time delivery rate
  - Fill rate accuracy
  - Quality rejection rate
  - Pricing competitiveness

#### 7. Waste & Shrinkage
- **Shrinkage Categories**
  - Spoilage (perishables)
  - Damage (broken packages)
  - Theft (shoplifting, employee)
  - Administrative errors
- **Prevention Measures**
  - Temperature monitoring alerts
  - Security camera integration
  - RFID tagging for high-value items
  - Regular cycle counts
- **Markdown Optimization**
  - Automatic markdown schedules
  - Flash sale triggers
  - Donation threshold settings
  - Compost program participation

#### 8. Labor Management
- **Scheduling**
  - Department staffing requirements
  - Peak hour coverage rules
  - Break time compliance
  - Overtime approval workflows
- **Task Assignment**
  - Opening/closing checklists
  - Restocking schedules
  - Cleaning rotations
  - Price change assignments
- **Productivity Metrics**
  - Sales per labor hour
  - Items picked per hour (online)
  - Checkout speed (items per minute)
  - Customer service ratio

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/products                      - List products
POST   /api/products                      - Create product
GET    /api/products/:id                  - Get product details
PUT    /api/products/:id                  - Update product
GET    /api/inventory                     - List inventory
PUT    /api/inventory/:id                 - Update inventory
GET    /api/orders                        - List orders
POST   /api/orders                        - Create order
GET    /api/customers                     - List customers
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Grocery Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Department Management APIs** |
| GET | `/api/departments` | List all departments | P0 |
| POST | `/api/departments` | Create department | P0 |
| GET | `/api/departments/:id/performance` | Get department performance metrics | P0 |
| PUT | `/api/departments/:id/targets` | Update department targets | P1 |
| GET | `/api/departments/sales-trend` | Get sales trend by department | P0 |
| **Inventory Management APIs** |
| GET | `/api/inventory/low-stock` | Get low stock alerts | P0 |
| GET | `/api/inventory/expiring-soon` | Get products expiring soon | P0 |
| GET | `/api/inventory/out-of-stock` | Get out of stock list | P0 |
| PUT | `/api/inventory/:id/markdown` | Apply markdown to product | P0 |
| POST | `/api/inventory/purchase-orders` | Create purchase order | P0 |
| GET | `/api/inventory/purchase-orders` | List purchase orders | P0 |
| PUT | `/api/inventory/:id/count` | Update physical count | P0 |
| GET | `/api/inventory/turnover-rate` | Calculate inventory turnover | P0 |
| GET | `/api/inventory/shrinkage-report` | Get shrinkage analysis | P0 |
| **Online Order APIs** |
| GET | `/api/orders/online/pending` | Get pending online orders | P0 |
| PUT | `/api/orders/:id/status` | Update order status | P0 |
| POST | `/api/orders/:id/assign-shopper` | Assign personal shopper | P0 |
| POST | `/api/orders/:id/substitutions` | Handle item substitutions | P0 |
| GET | `/api/orders/pickup-schedule` | Get pickup time slots | P0 |
| POST | `/api/orders/pickup-schedule` | Reserve pickup slot | P0 |
| GET | `/api/orders/delivery-routes` | Optimize delivery routes | P1 |
| POST | `/api/orders/:id/assign-driver` | Assign driver to delivery | P0 |
| GET | `/api/orders/fulfillment-stats` | Get fulfillment performance | P0 |
| **Pricing & Promotion APIs** |
| GET | `/api/promotions/active` | List active promotions | P0 |
| POST | `/api/promotions` | Create promotion | P0 |
| PUT | `/api/promotions/:id` | Update promotion | P0 |
| DELETE | `/api/promotions/:id` | End promotion early | P1 |
| GET | `/api/promotions/performance` | Get promotion ROI analysis | P0 |
| GET | `/api/pricing/competitor-comparison` | Compare prices to competitors | P0 |
| POST | `/api/pricing/suggestions` | Get AI pricing recommendations | P1 |
| PUT | `/api/pricing/bulk-update` | Bulk price updates | P0 |
| GET | `/api/pricing/margin-analysis` | Analyze profit margins | P0 |
| **Loyalty Program APIs** |
| GET | `/api/loyalty/members` | List loyalty members | P0 |
| POST | `/api/loyalty/members` | Enroll new member | P0 |
| GET | `/api/loyalty/:id/points` | Get member points balance | P0 |
| POST | `/api/loyalty/:id/earn` | Record points earned | P0 |
| POST | `/api/loyalty/:id/redeem` | Redeem points for reward | P0 |
| GET | `/api/loyalty/tiers` | Get membership tiers | P0 |
| POST | `/api/loyalty/offers` | Create personalized offer | P1 |
| GET | `/api/loyalty/offers` | List member offers | P0 |
| **Supplier Management APIs** |
| GET | `/api/suppliers` | List all suppliers | P0 |
| POST | `/api/suppliers` | Add new supplier | P0 |
| GET | `/api/suppliers/:id/performance` | Get supplier performance metrics | P0 |
| GET | `/api/suppliers/deliveries` | Get upcoming deliveries | P0 |
| POST | `/api/suppliers/:id/quality-issue` | Report quality problem | P1 |
| GET | `/api/suppliers/invoices` | List supplier invoices | P0 |
| PUT | `/api/suppliers/invoices/:id/pay` | Process invoice payment | P0 |
| **Waste Tracking APIs** |
| POST | `/api/waste/log` | Record waste incident | P0 |
| GET | `/api/waste/report` | Get waste analytics | P0 |
| POST | `/api/waste/donation` | Log donation instead of waste | P1 |
| GET | `/api/waste/by-category` | Get waste breakdown by reason | P0 |
| GET | `/api/waste/by-department` | Get waste by department | P0 |
| **Labor Management APIs** |
| GET | `/api/labor/schedule` | Get staff schedule | P0 |
| POST | `/api/labor/schedule` | Create work schedule | P0 |
| GET | `/api/labor/productivity` | Get labor productivity metrics | P0 |
| GET | `/api/labor/sales-per-hour` | Calculate sales per labor hour | P0 |
| POST | `/api/labor/tasks` | Assign task to employee | P0 |
| GET | `/api/labor/tasks` | Get task completion status | P0 |
| **Customer Analytics APIs** |
| GET | `/api/customers/segments` | Get customer segmentation | P0 |
| GET | `/api/customers/:id/purchase-history` | Get customer purchase history | P0 |
| GET | `/api/customers/retention-rate` | Calculate retention rate | P0 |
| GET | `/api/customers/basket-analysis` | Analyze basket composition | P0 |
| GET | `/api/customers/heat-map` | Get store traffic heat map | P1 |

**Total New APIs for Grocery: 18 endpoints**

---

**Implementation Notes:**
- Integrate with barcode scanners for quick product lookup
- Support digital scale integration for weighted items
- Build real-time inventory synchronization across channels
- Implement expiration date tracking with automated alerts
- Create dynamic pricing engine based on competitor monitoring
- Support online ordering with substitution handling
- Build delivery route optimization algorithm
- Implement loyalty program with personalized offers
- Create waste tracking and donation logging system
- Support labor scheduling with compliance rules
