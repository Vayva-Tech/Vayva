# Batch 5 Design Specification: Wholesale & Distribution Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA WHOLESALE - Signature Clean Design                                           │
│  [Dashboard] [Orders] [Inventory] [Customers] [Suppliers] [Warehouse] [Finance] [Settings]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 BUSINESS OVERVIEW                                   🔔 11 Notifications         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Orders Today: 84           │  Revenue MTD: $487K     │  Avg Order Value  │   │
│  │  ▲ 12% vs last week         │  ▲ 18% vs last month    │  $5,798          │   │
│  │                             │                            │  ▲ 6% vs last Q  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  📦 ORDER PIPELINE                                  📊 SALES BY CATEGORY            │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Order Status Breakdown          │  │  Category Performance                  │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Pending: 23 orders      │  │  │  │ Electronics   $145K   30% ██████░│  │ │
│  │  │ Processing: 18 orders   │  │  │  │ Hardware      $98K    20% ████░░░│  │ │
│  │  │ Shipped: 34 orders      │  │  │  │ Industrial    $87K    18% ███░░░░│  │ │
│  │  │ Ready for Pickup: 9     │  │  │  │ Supplies      $72K    15% ███░░░░│  │ │
│  │  └──────────────────────────┘  │  │  │ Other         $85K    17% ███░░░░│  │ │
│  │                                 │  │  └──────────────────────────────────┘  │ │
│  │  Backlog: 156 total orders    │  │  Top Brand: Samsung (+24%)              │ │
│  │  On-Time Ship Rate: 94.7%     │  │  Declining: Tools (-8%)                 │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🏭 INVENTORY HEALTH                                👥 CUSTOMER INSIGHTS            │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Stock Level Summary             │  │  Customer Metrics                      │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ In Stock: 3,847 SKUs    │  │  │  │ Total Accounts: 1,234            │  │ │
│  │  │ Low Stock: 89 SKUs      │  │  │  │ Active (90 days): 847            │  │ │
│  │  │ Out of Stock: 23 SKUs   │  │  │  │ New This Month: 34               │  │ │
│  │  │ Overstocked: 45 SKUs    │  │  │  │ At Risk (no order 60+ days): 67  │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Inventory Turnover: 32 days  │  │  Top 10 Customers: 67% of revenue       │ │
│  │  Fill Rate: 96.8%             │  │  Avg Order Frequency: 18 days           │ │
│  │  Carrying Cost: $87K/month    │  │  Customer Lifetime Value: $47K avg      │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🚚 PURCHASE ORDERS                                 📈 REORDER FORECAST             │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Open POs                        │  │  Smart Reorder Suggestions            │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Pending Approval: 8 POs │  │  │  │ Auto-Generate Orders: 47 SKUs    │  │ │
│  │  │ In Transit: 12 POs      │  │  │  │                                  │  │ │
│  │  │ Expected This Week: $234K│ │  │  │ Priority Restocks:                │  │ │
│  │  │                          │  │  │  │ • Widget A (QTY: 500, Due: Fri) │  │ │
│  │  │ Supplier Delays: 2 POs   │  │  │  │ • Gadget B (QTY: 300, Due: Mon) │  │ │
│  │  │ Quality Issues: 1 PO     │  │  │  │ • Part C (QTY: 1000, Due: Tue)  │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Avg Lead Time: 12 days       │  │  Estimated Investment: $147K            │ │
│  │  Supplier OTD: 91.3%          │  │  Projected ROI: 34% (60-day sell-through)│ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  💰 ACCOUNTS RECEIVABLE                             📊 WAREHOUSE PERFORMANCE         │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Outstanding Invoices            │  │  Warehouse Operations                  │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Current: $234K          │  │  │  │ Orders to Pick: 47 orders        │  │ │
│  │  │ 1-30 Days: $89K         │  │  │  │ Picking Progress: 67% complete   │  │ │
│  │  │ 31-60 Days: $34K        │  │  │  │                                  │  │ │
│  │  │ 60+ Days: $12K ⚠️       │  │  │  │ Packing Queue: 23 orders         │  │ │
│  │  └──────────────────────────┘  │  │  │ Shipped Today: 89 orders         │  │ │
│  │                                 │  │  │                                  │  │ │
│  │  DSO: 42 days                   │  │  │ Picks/Hour: 34 (target: 30) ✅   │  │ │
│  │  Collection Effectiveness: 87% │  │  │ Accuracy Rate: 99.2%             │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🎯 QUOTE PIPELINE                                  ⚠️ ACTION REQUIRED              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Active Quotes                   │  │  Tasks & Reminders                     │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Pending Quotes: 34      │  │  │  │ ☑ Review low stock report (done) │  │ │
│  │  │ Quote Value: $487K      │  │  │  │ ☐ Approve purchase orders (8)    │  │ │
│  │  │ Win Rate: 42%           │  │  │  │ ☐ Call customers re: past due (5)│  │ │
│  │  │                         │  │  │  │ ☐ Review quote requests (12)     │  │ │
│  │  │ Closing This Month: $127K│ │  │  │ ☐ Warehouse safety check (2pm)   │  │ │
│  │  └──────────────────────────┘  │  │  │ ☐ Supplier negotiation (3pm)     │  │ │
│  │                                 │  │  │ ☐ Inventory count audit (Fri)    │  │ │
│  │  Top Opportunity: $67K (Acme) │  │  │ ☐ Monthly business review (4pm)  │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Signature Clean

**Primary Color:** Corporate Blue `#3B82F6`
**Accent Colors:** Success Green `#10B981`, Warning Orange `#F59E0B`, Premium Purple `#8B5CF6`

**Visual Characteristics:**
- Professional, clean layouts with clear data hierarchy
- High-contrast tables for SKU and order information
- Progress bars for order status and inventory levels
- Bulk action interfaces for efficiency
- Multi-select capabilities throughout
- Export-friendly data views
- Barcode/QR code integration displays

**Component Styling:**
- Cards: White backgrounds with subtle blue accent borders
- Tables: Dense row layouts optimized for data density
- Metrics: Bold numerals with clear currency formatting
- Status Badges: Color-coded pills with icons
- Progress Bars: Thick bars showing completion percentage
- Action Buttons: Prominent CTAs for common workflows

## Component Hierarchy

```
WholesaleDashboard (root)
├── BusinessOverview
│   ├── OrdersToday (count, trend percentage, comparison)
│   ├── RevenueMTD (month-to-date revenue, vs target)
│   └── AverageOrderValue (current AOV, trend analysis)
├── OrderPipeline
│   ├── OrderStatusBreakdown (pending, processing, shipped, ready counts)
│   ├── StatusCard (status name, count, percentage, trend)
│   ├── BacklogTracker (total orders, age distribution)
│   ├── OnTimeShipRateMetric (percentage performance)
│   └── OrderAgingReport (orders by days open)
├── SalesByCategory
│   ├── CategoryPerformanceList (ranked by revenue)
│   ├── CategoryCard (name, revenue, percentage, trend chart)
│   ├── TopBrandHighlight (best performing brand/supplier)
│   ├── DecliningCategoryAlert (underperforming segment)
│   └── CategoryTrendChart (6-month revenue trend)
├── InventoryHealth
│   ├── StockLevelSummary (in stock, low, out, overstocked counts)
│   ├── StockStatusCard (status, count, percentage of total)
│   ├── InventoryTurnoverMetric (days to sell through)
│   ├── FillRateMetric (percentage of orders fully stocked)
│   ├── CarryingCostCalculator (monthly storage cost)
│   └── DeadStockIdentifier (items with no movement)
├── CustomerInsights
│   ├── CustomerMetrics (total accounts, active, new, at risk)
│   ├── CustomerSegmentPieChart (active vs inactive vs at risk)
│   ├── TopCustomersList (by revenue, ranked 1-10)
│   ├── CustomerLifetimeValueMetric (average LTV)
│   ├── OrderFrequencyAnalysis (average days between orders)
│   └── CustomerHealthScore (composite metric)
├── PurchaseOrders
│   ├── OpenPOsSummary (pending approval, in transit, expected)
│   ├── POStatusCard (status, count, value, supplier count)
│   ├── ExpectedDeliveryTimeline (calendar view of incoming)
│   ├── SupplierDelayTracker (late POs count and value)
│   ├── QualityIssuesLog (rejected shipments)
│   └── SupplierOTDMetric (on-time delivery percentage)
├── ReorderForecast
│   ├── SmartReorderSuggestions (AI-generated reorder list)
│   ├── ReorderItemCard (SKU, current stock, suggested qty, due date)
│   ├── PriorityRanking (urgent, soon, routine priorities)
│   ├── EstimatedInvestmentTotal (total cost of suggested orders)
│   ├── ProjectedROI Calculator (expected return on investment)
│   └── AutoOrderRules (threshold-based automation)
├── AccountsReceivable
│   ├── OutstandingInvoicesSummary (by aging bucket)
│   ├── AgingBucketCard (bucket name, amount, percentage, count)
│   ├── DSOMetric (days sales outstanding)
│   ├── CollectionEffectivenessRate (percentage collected)
│   ├── TopDelinquentCustomers (by overdue amount)
│   └── CollectionPriorityList (who to call first)
├── WarehousePerformance
│   ├── OrdersToPickQueue (pending picklist count)
│   ├── PickingProgressTracker (percentage complete, picks remaining)
│   ├── PackingQueueStatus (orders waiting to pack)
│   ├── ShippedTodayCount (orders successfully shipped)
│   ├── PicksPerHourMetric (productivity rate vs target)
│   ├── AccuracyRateMetric (pick/pack accuracy percentage)
│   └── WarehouseCapacityUtilization (space usage percentage)
├── QuotePipeline
│   ├── ActiveQuotesSummary (pending count, total value, win rate)
│   ├── QuoteStageCard (stage name, count, value, probability)
│   ├── QuoteWinRateTrend (historical win percentage)
│   ├── ExpectedClosingsThisMonth (quotes likely to convert)
│   ├── TopOpportunityCard (highest value quote in pipeline)
│   └── QuoteResponseTimeMetric (average time to quote)
└── ActionRequired
    ├── TaskList (prioritized daily tasks)
    ├── LowStockApprovals (POs needing approval)
    ├── PastDueCustomerCalls (collection call list)
    ├── QuoteRequestsPending (quotes to prepare)
    ├── WarehouseSafetyCheck (compliance reminder)
    ├── SupplierNegotiations (scheduled meetings)
    └── InventoryAuditSchedule (cycle count reminders)
```

## Theme Presets

### Theme 1: Corporate Blue (Default)
```css
.primary: #3B82F6;        /* Blue }
.secondary: #10B981;      /* Green */
.accent: #F59E0B;         /* Amber */
.background: #EFF6FF;     /* Blue Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;         /* Red */
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(59, 130, 246, 0.15);
```

### Theme 2: Industrial Gray
```css
.primary: #6B7280;        /* Gray }
.secondary: #374151;      /* Dark Gray */
.accent: #F59E0B;         /* Amber */
.background: #F9FAFB;     /* Light Gray */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(107, 114, 128, 0.15);
```

### Theme 3: Growth Green
```css
.primary: #10B981;        /* Emerald }
.secondary: #059669;      /* Darker Green */
.accent: #F59E0B;         /* Amber */
.background: #ECFDF5;     /* Green Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(16, 185, 129, 0.15);
```

### Theme 4: Premium Purple
```css
.primary: #8B5CF6;        /* Violet }
.secondary: #7C3AED;      /* Darker Violet */
.accent: #F59E0B;         /* Gold */
.background: #F5F3FF;     /* Purple Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(139, 92, 246, 0.15);
```

### Theme 5: Ocean Teal
```css
.primary: #14B8A6;        /* Cyan }
.secondary: #0D9488;      /* Darker Cyan */
.accent: #F59E0B;         /* Amber */
.background: #ECFEFF;     /* Cyan Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(20, 184, 166, 0.15);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Wholesale-Specific Settings

#### 1. Product Catalog Management
- **Product Setup**
  - SKU creation with barcode/UPC
  - Product categorization (category, subcategory, brand)
  - Unit of measure configuration (each, case, pallet)
  - Tiered pricing setup (quantity breaks)
  - Minimum order quantities (MOQ)
  - Lead time expectations
- **Pricing Rules**
  - Base wholesale price
  - Volume discount tiers (10+, 50+, 100+ units)
  - Customer-specific pricing overrides
  - Contract pricing agreements
  - Promotional/temporary pricing
  - Price match guarantee rules
- **Product Attributes**
  - Weight and dimensions (for shipping)
  - Hazardous material flags
  - Country of origin
  - Harmonized System (HS) codes
  - Compliance certifications

#### 2. Customer Management
- **Account Setup**
  - Business information (name, address, tax ID)
  - Payment terms (Net 30, Net 60, COD)
  - Credit limit assignment
  - Sales representative assignment
  - Shipping preferences
  - Tax exemption certificates
- **Customer Tiers**
  - Tier criteria (annual spend, frequency)
  - Tier benefits (pricing discounts, free shipping, priority)
  - Automatic tier upgrades/downgrades
  - Tier review periods
- **Sales Rep Assignment**
  - Territory assignments
  - Commission structures
  - Account ownership rules
  - Inside vs outside sales roles

#### 3. Inventory Management
- **Warehouse Configuration**
  - Multiple warehouse locations
  - Bin/shelf location tracking
  - Zone assignments (bulk, pick face, overflow)
  - Temperature-controlled areas
  - Hazmat storage zones
- **Stock Thresholds**
  - Minimum stock levels by SKU
  - Maximum capacity limits
  - Reorder points (with lead time calculation)
  - Safety stock quantities
  - Seasonal adjustments
- **Cycle Counting**
  - ABC classification (A items counted monthly, B quarterly, C annually)
  - Count schedule generation
  - Variance tolerance thresholds
  - Adjustment approval workflows

#### 4. Purchase Order Management
- **PO Creation**
  - Manual PO creation
  - Auto-generate from reorder points
  - PO templates for recurring orders
  - Bulk PO import from spreadsheets
- **Approval Workflows**
  - Approval limits by user role
  - Multi-level approval (>$10K needs CFO approval)
  - Delegation rules (out of office coverage)
  - Emergency bypass procedures
- **Supplier Communication**
  - PO email templates
  - EDI integration for large suppliers
  - Supplier portal for PO acknowledgment
  - Advanced shipping notice (ASN) requirements

#### 5. Order Management
- **Order Entry**
  - Web portal for customer self-service
  - CSV upload for bulk orders
  - EDI order ingestion
  - Phone/email order entry
  - Quote-to-order conversion
- **Order Routing**
  - Multi-warehouse fulfillment logic
  - Split shipment rules
  - Partial shipment allowances
  - Drop-ship vendor routing
- **Shipping Configuration**
  - Carrier integrations (FedEx, UPS, freight)
  - Shipping rule engine (free shipping over $X)
  - FOB point determination
  - Delivery appointment scheduling

#### 6. Quotation Management
- **Quote Creation**
  - Quick quote from product catalog
  - Configurable product quotes
  - Multi-line item quotes
  - Alternative product suggestions
- **Quote Templates**
  - Branded PDF generation
  - Terms and conditions inclusion
  - Validity period display
  - Acceptance signature capture
- **Quote Follow-up**
  - Automated follow-up sequences
  - Quote expiration reminders
  - Competitor win/loss tracking
  - Quote revision history

#### 7. Accounts Receivable
- **Invoice Generation**
  - Auto-invoice on shipment
  - Consolidated invoicing (multiple orders)
  - Recurring invoice schedules
  - Progress billing for large orders
- **Payment Processing**
  - Credit card on file
  - ACH/bank transfer setup
  - Lockbox integration
  - Payment portal for customers
- **Collections Management**
  - Aging report generation
  - Collection call scripts
  - Payment plan configurations
  - Credit hold automation

#### 8. Reporting & Analytics
- **Sales Reports**
  - Sales by customer, category, brand, rep
  - Year-over-year comparisons
  - Seasonality analysis
  - Customer buying patterns
- **Inventory Reports**
  - Inventory valuation
  - Turnover rates by SKU
  - Dead stock identification
  - Forecast accuracy tracking
- **Financial Reports**
  - Gross margin analysis
  - Customer profitability
  - Product profitability
  - Cash flow forecasting

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/products                      - List products
POST   /api/products                      - Create product
GET    /api/products/:id                  - Get product details
PUT    /api/products/:id                  - Update product
GET    /api/orders                        - List orders
POST   /api/orders                        - Create order
GET    /api/orders/:id                    - Get order details
PUT    /api/orders/:id                    - Update order
GET    /api/customers                     - List customers
POST   /api/customers                     - Create customer
GET    /api/inventory                     - List inventory
PUT    /api/inventory/:id                 - Update inventory
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Wholesale Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Product & Pricing APIs** |
| GET | `/api/products/tiered-pricing` | Get quantity break pricing | P0 |
| PUT | `/api/products/:id/tiered-pricing` | Update pricing tiers | P0 |
| GET | `/api/products/:id/customer-price` | Get customer-specific pricing | P0 |
| POST | `/api/products/bulk-import` | Bulk upload products from CSV | P0 |
| PUT | `/api/products/:id/moq` | Update minimum order quantity | P0 |
| GET | `/api/products/dead-stock` | Identify non-moving inventory | P1 |
| **Customer Management APIs** |
| GET | `/api/customers/tiers` | Get customer tier definitions | P0 |
| POST | `/api/customers/tiers` | Create customer tier | P0 |
| PUT | `/api/customers/:id/tier` | Update customer tier | P0 |
| GET | `/api/customers/:id/credit` | Get customer credit status | P0 |
| PUT | `/api/customers/:id/credit-limit` | Update credit limit | P0 |
| GET | `/api/customers/:id/sales-rep` | Get assigned sales rep | P0 |
| PUT | `/api/customers/:id/sales-rep` | Assign sales rep | P0 |
| GET | `/api/customers/at-risk` | Identify at-risk customers | P1 |
| GET | `/api/customers/:id/purchase-history` | Get customer buying patterns | P0 |
| **Inventory Management APIs** |
| GET | `/api/inventory/by-warehouse` | Get inventory by location | P0 |
| PUT | `/api/inventory/:id/bin-location` | Update bin/shelf location | P0 |
| GET | `/api/inventory/reorder-points` | Get SKUs at reorder point | P0 |
| PUT | `/api/inventory/:id/reorder-point` | Update reorder parameters | P0 |
| POST | `/api/inventory/cycle-count` | Generate cycle count list | P0 |
| POST | `/api/inventory/cycle-count/:id/submit` | Submit count results | P0 |
| GET | `/api/inventory/turnover-rates` | Calculate turnover by SKU | P0 |
| GET | `/api/inventory/forecast` | Get demand forecast | P1 |
| **Purchase Order APIs** |
| GET | `/api/purchase-orders` | List all POs | P0 |
| POST | `/api/purchase-orders` | Create new PO | P0 |
| GET | `/api/purchase-orders/:id` | Get PO details | P0 |
| PUT | `/api/purchase-orders/:id` | Update PO | P0 |
| POST | `/api/purchase-orders/:id/approve` | Approve PO | P0 |
| POST | `/api/purchase-orders/:id/receive` | Record receipt of goods | P0 |
| GET | `/api/purchase-orders/pending-approval` | Get POs awaiting approval | P0 |
| GET | `/api/purchase-orders/auto-generate` | Generate POs from reorder points | P0 |
| GET | `/api/purchase-orders/supplier-performance` | Get supplier OTD metrics | P0 |
| **Order Management APIs** |
| POST | `/api/orders/csv-import` | Import orders from CSV | P0 |
| POST | `/api/orders/:id/split` | Split order into multiple shipments | P1 |
| POST | `/api/orders/:id/route` | Route order to warehouse | P0 |
| GET | `/api/orders/backlog` | Get order backlog report | P0 |
| GET | `/api/orders/aging` | Get orders by age | P0 |
| PUT | `/api/orders/:id/partial-ship` | Configure partial shipment | P0 |
| POST | `/api/orders/:id/drop-ship` | Route to drop-ship vendor | P1 |
| **Quotation Management APIs** |
| GET | `/api/quotes` | List all quotes | P0 |
| POST | `/api/quotes` | Create new quote | P0 |
| GET | `/api/quotes/:id` | Get quote details | P0 |
| PUT | `/api/quotes/:id` | Update quote | P0 |
| DELETE | `/api/quotes/:id` | Cancel quote | P1 |
| POST | `/api/quotes/:id/convert` | Convert quote to order | P0 |
| POST | `/api/quotes/:id/send` | Email quote to customer | P0 |
| GET | `/api/quotes/pipeline` | Get quote pipeline summary | P0 |
| GET | `/api/quotes/win-rate` | Calculate quote win rate | P0 |
| **Shipping & Fulfillment APIs** |
| POST | `/api/shipping/rates` | Get shipping rate quotes | P0 |
| POST | `/api/shipping/label` | Generate shipping label | P0 |
| GET | `/api/shipping/carriers` | List configured carriers | P0 |
| POST | `/api/shipping/manifest` | Create end-of-day manifest | P0 |
| GET | `/api/fulfillment/pick-list` | Generate pick list | P0 |
| POST | `/api/fulfillment/:id/pick-confirm` | Confirm items picked | P0 |
| POST | `/api/fulfillment/:id/pack-confirm` | Confirm packed order | P0 |
| GET | `/api/fulfillment/productivity` | Get warehouse productivity stats | P0 |
| **Accounts Receivable APIs** |
| GET | `/api/ar/aging` | Get accounts receivable aging | P0 |
| GET | `/api/ar/outstanding` | Get outstanding invoices | P0 |
| POST | `/api/ar/invoice` | Generate invoice | P0 |
| POST | `/api/ar/:invoice/payment` | Record payment | P0 |
| GET | `/api/ar/dso` | Calculate days sales outstanding | P0 |
| GET | `/api/ar/collection-priority` | Get collection call priority list | P1 |
| POST | `/api/ar/:customer/credit-hold` | Place account on credit hold | P0 |
| DELETE | `/api/ar/:customer/credit-hold` | Release credit hold | P0 |
| **Reporting APIs** |
| GET | `/api/reports/sales-by-customer` | Generate sales by customer report | P0 |
| GET | `/api/reports/sales-by-category` | Generate sales by category report | P0 |
| GET | `/api/reports/sales-by-rep` | Generate sales by rep report | P0 |
| GET | `/api/reports/inventory-valuation` | Generate inventory valuation report | P0 |
| GET | `/api/reports/customer-profitability` | Analyze customer profitability | P1 |
| GET | `/api/reports/product-profitability` | Analyze product profitability | P0 |
| GET | `/api/reports/cash-flow-forecast` | Generate cash flow forecast | P1 |

**Total New APIs for Wholesale: 16 endpoints**

---

**Implementation Notes:**
- Integrate with barcode scanners for warehouse operations
- Support CSV import/export for bulk data operations
- Build multi-warehouse inventory allocation logic
- Implement tiered pricing engine with quantity breaks
- Create customer-specific pricing override system
- Support EDI integration for large retail customers
- Build automated PO generation from reorder points
- Implement credit checking and credit hold automation
- Create pick/pack/ship workflow optimization
- Support shipping carrier API integrations (FedEx, UPS)
- Build quote-to-order conversion workflow
- Implement accounts receivable aging and collections management
- Create cycle counting workflow with variance tracking
- Support sales rep commission tracking
