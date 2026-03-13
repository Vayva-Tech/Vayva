# Batch 1 Design Document: FASHION Industry Dashboard
## Premium Glass Design Category with Rose-Gold Accents

**Document Version:** 1.0  
**Industry:** Fashion & Apparel  
**Design Category:** Premium Glass  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Glass Effect)                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Orders  Products  Collections  Analytics  Marketing  ▼   │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  WELCOME HEADER                    [+ New Collection] [📊 Export Report]      │  │
│  │  "Spring Collection Performance"                                              │  │
│  │  Last updated: 2 minutes ago                                                  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   REVENUE   │ │    GMV      │ │   ORDERS    │ │  CUSTOMERS  │ │ CONVERSION  │   │
│  │   $48.2K    │ │   $52.1K    │ │    324      │ │    1,204    │ │    3.2%     │   │
│  │   ↑ 12.4%   │ │   ↑ 8.7%    │ │   ↑ 15.2%   │ │   ↑ 22.1%   │ │   ↑ 0.4%    │   │
│  │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │         SIZE CURVE ANALYSIS             │ │       COLLECTION HEALTH          │   │
│  │  ┌─────────────────────────────────┐    │ │                                  │   │
│  │  │                                 │    │ │  ┌────────────────────────────┐  │   │
│  │  │    [Donut Chart]                │    │ │  │ 🌸 Spring Essentials       │  │   │
│  │  │    XS  S   M   L   XL   XXL     │    │ │  │    $24,500 GMV | 156 units │  │   │
│  │  │    8%  22% 35% 24%  9%   2%     │    │ │  │    ████████████░░░░ 78%    │  │   │
│  │  │                                 │    │ │  └────────────────────────────┘  │   │
│  │  │  Top Size: M (35%)              │    │ │  ┌────────────────────────────┐  │   │
│  │  │  Restock Alert: XL running low  │    │ │  │ 🌙 Evening Wear            │  │   │
│  │  │                                 │    │ │  │    $18,200 GMV | 89 units  │  │   │
│  │  │  [View Size Guide]              │    │ │  │    ██████████░░░░░░ 62%    │  │   │
│  │  └─────────────────────────────────┘    │ │  └────────────────────────────┘  │   │
│  │                                         │ │  ┌────────────────────────────┐  │   │
│  │  Size Performance by Category:          │ │  │ ⚡ Activewear              │  │   │
│  │  [Tabs: Tops | Bottoms | Dresses]       │ │  │    $12,800 GMV | 203 units │  │   │
│  │  [Bar Chart showing size distribution]  │ │  │    ████████░░░░░░░░ 45%    │  │   │
│  │                                         │ │  └────────────────────────────┘  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │      VISUAL MERCHANDISING               │ │      TREND FORECASTING           │   │
│  │                                         │ │                                  │   │
│  │  [Lookbook Preview Gallery]             │ │  ┌────────────────────────────┐  │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │ │  │ 📈 Emerging Trends         │  │   │
│  │  │ 👗  │ │ 👚  │ │ 👖  │ │ 🧥  │       │ │  │                            │  │   │
│  │  │Spring│ │Summer│ │Resort│ │Fall │      │ │  │ 1. Pastel Colors    ↑ 45%  │  │   │
│  │  │'26 │ │'26 │ │'26 │ │'26 │      │ │  │ 2. Wide Leg Pants   ↑ 38%  │  │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘       │ │  │ 3. Oversized Blazers ↑ 32% │  │   │
│  │                                         │ │  │ 4. Sustainable Fab  ↑ 28%  │  │   │
│  │  Active Lookbook: Spring Bloom          │ │  │                            │  │   │
│  │  Status: Published | Views: 2.4K        │ │  │ [View Full Report]         │  │   │
│  │  Conversion: 4.2%                       │ │  └────────────────────────────┘  │   │
│  │                                         │ │                                  │   │
│  │  [+ Create Lookbook] [📷 Manage Assets] │ │  Seasonal Forecast:              │   │
│  │                                         │ │  [Line Chart: 6-month trend]     │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │      INVENTORY BY VARIANT               │ │      RECENT ACTIVITY             │   │
│  │                                         │ │                                  │   │
│  │  [Heatmap Grid: Size x Color]           │ │  🛒 New order #4829 - $245.00    │   │
│  │                                         │ │     5 minutes ago                │   │
│  │     XS   S    M    L    XL   XXL        │ │                                  │   │
│  │  🔴 12   45   78   52   23    5         │ │  📦 Restock alert: Floral Dress  │   │
│  │  🔵 8    32   65   48   19    3         │ │     Size M - Only 3 left         │   │
│  │  ⚫ 15   38   72   41   28    4         │ │                                  │   │
│  │  ⚪ 22   51   89   67   34    6         │ │  ⭐ Review received: 5 stars     │   │
│  │                                         │ │     "Amazing quality!"           │   │
│  │  🟡 Low Stock  🟢 Healthy  🔴 Critical  │ │                                  │   │
│  │                                         │ │  🎨 Lookbook "Summer Breeze"     │   │
│  │  [View Full Inventory]                  │ │     published by Sarah           │   │
│  │                                         │ │                                  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Recommendation: Increase XL inventory for "Evening Collection"       │  │  │
│  │  │    Based on 45% size return rate and current demand velocity            │  │  │
│  │  │    Predicted impact: +$12K revenue if restocked within 3 days           │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Premium Glass Design System

**Primary Palette:**
```
Background Primary:   #0F0F0F (Deep black with subtle warmth)
Background Secondary: #1A1A1A (Elevated surfaces)
Background Tertiary:  rgba(255, 255, 255, 0.05) (Glass panels)

Accent Primary:       #E8B4B8 (Rose gold - main brand)
Accent Secondary:     #D4A5A5 (Soft rose)
Accent Tertiary:      #F5E6E8 (Blush highlight)

Text Primary:         #FFFFFF (Pure white)
Text Secondary:       rgba(255, 255, 255, 0.7)
Text Tertiary:        rgba(255, 255, 255, 0.5)

Success:              #10B981 (Emerald)
Warning:              #F59E0B (Amber)
Error:                #EF4444 (Rose red)
Info:                 #60A5FA (Soft blue)
```

**Glassmorphism Effects:**
```css
/* Glass Panel Base */
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

/* Glass Card Hover */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(232, 180, 184, 0.3);
  box-shadow: 0 8px 32px rgba(232, 180, 184, 0.1);
}

/* Gradient Accents */
.accent-gradient {
  background: linear-gradient(135deg, #E8B4B8 0%, #D4A5A5 50%, #F5E6E8 100%);
}

/* Metric Card Glow */
.metric-glow {
  box-shadow: 0 0 40px rgba(232, 180, 184, 0.15);
}
```

---

## 3. Component Hierarchy

```
FashionDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewCollectionButton
│   │   └── ExportReportButton
│   └── LastUpdated
├── KPIRow (5 metrics)
│   └── FashionMetricCard × 5
│       ├── SparklineChart
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── SizeCurveAnalysis
│   │   │   ├── DonutChart (size distribution)
│   │   │   ├── SizeBreakdownList
│   │   │   └── CategoryTabs
│   │   ├── VisualMerchandising
│   │   │   ├── LookbookGallery
│   │   │   ├── LookbookDetails
│   │   │   └── AssetActions
│   │   └── InventoryVariantHeatmap
│   │       ├── SizeColorGrid
│   │       ├── StockIndicator
│   │       └── Legend
│   └── RightColumn
│       ├── CollectionHealth
│       │   └── CollectionCard × 3
│       ├── TrendForecasting
│       │   ├── TrendList
│       │   └── SeasonalChart
│       └── RecentActivity
│           └── ActivityItem × 4
└── AIInsightsPanel (Pro Tier)
    └── RecommendationCard
```

---

## 4. 5 Theme Presets

### Theme 1: Rose Gold (Default)
```
Primary:    #E8B4B8
Secondary:  #D4A5A5
Background: #0F0F0F
Surface:    rgba(255, 255, 255, 0.03)
Accent:     linear-gradient(135deg, #E8B4B8, #F5E6E8)
```

### Theme 2: Champagne Luxe
```
Primary:    #D4AF37
Secondary:  #C5B358
Background: #1A1A1A
Surface:    rgba(212, 175, 55, 0.05)
Accent:     linear-gradient(135deg, #D4AF37, #F4E4BC)
```

### Theme 3: Midnight Sapphire
```
Primary:    #4A90E2
Secondary:  #5BA0F2
Background: #0A0A1A
Surface:    rgba(74, 144, 226, 0.05)
Accent:     linear-gradient(135deg, #4A90E2, #7BB3F0)
```

### Theme 4: Emerald Couture
```
Primary:    #10B981
Secondary:  #34D399
Background: #0A1F15
Surface:    rgba(16, 185, 129, 0.05)
Accent:     linear-gradient(135deg, #10B981, #6EE7B7)
```

### Theme 5: Velvet Noir
```
Primary:    #8B5CF6
Secondary:  #A78BFA
Background: #0F0A1A
Surface:    rgba(139, 92, 246, 0.05)
Accent:     linear-gradient(135deg, #8B5CF6, #C4B5FD)
```

---

## 5. Expanded Settings Page Design

### Fashion-Specific Settings Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS                                                                    │
├──────────────────┬──────────────────────────────────────────────────────────┤
│                  │  STORE SETTINGS                                          │
│  General         │                                                          │
│  Branding        │  ┌────────────────────────────────────────────────────┐  │
│  Notifications   │  │ SIZING & FIT                                        │  │
│  Integrations    │  │                                                    │  │
│  Team            │  │ Size Guide Builder                                 │  │
│  Billing         │  │ ┌────────────────────────────────────────────────┐ │  │
│                  │  │ │ [Manage Size Charts]                           │ │  │
│  ──────────────  │  │ │                                                │ │  │
│                  │  │ │ Default Size Format:  [US ▼]                   │ │  │
│  FASHION SPECIFIC│  │ │ Include Measurements: [✓]                      │ │  │
│  ├─ Size Guide   │  │ │ Size Converter:       [✓]                      │ │  │
│  ├─ Collections  │  │ │                                                │ │  │
│  ├─ Visual Merch │  │ │ Fit Recommendations:  [Enable AI Sizing ▼]     │ │  │
│  ├─ Inventory    │  │ └────────────────────────────────────────────────┘ │  │
│  ├─ Wholesale    │  │                                                    │  │
│  └─ Trend Analytics│ └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ COLLECTION MANAGEMENT                               │  │
│                  │  │                                                    │  │
│                  │  │ Auto-publish Collections:  [Toggle: On]            │  │
│                  │  │ Default Collection View:   [Grid ▼]                │  │
│                  │  │ Lookbook Template:         [Standard ▼]            │  │
│                  │  │                                                    │  │
│                  │  │ Seasonal Collections:                              │  │
│                  │  │ [✓] Spring/Summer  [✓] Fall/Winter                │  │
│                  │  │ [✓] Resort         [✓] Holiday Capsule           │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ VISUAL MERCHANDISING                                │  │
│                  │  │                                                    │  │
│                  │  │ Lookbook Settings:                                 │  │
│                  │  │ • Aspect Ratio: [3:4 Portrait ▼]                   │  │
│                  │  │ • Image Quality: [High (WebP) ▼]                   │  │
│                  │  │ • Lazy Loading: [✓]                                │  │
│                  │  │                                                    │  │
│                  │  │ Model Diversity Options:                           │  │
│                  │  │ [✓] Show size range  [✓] Show skin tone range     │  │
│                  │  │                                                    │  │
│                  │  │ [Configure Lookbook Templates]                     │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ INVENTORY ALERTS                                    │  │
│                  │  │                                                    │  │
│                  │  │ Low Stock Threshold:  [10] units                   │  │
│                  │  │ Critical Stock:       [3] units                    │  │
│                  │  │                                                    │  │
│                  │  │ Alert Recipients:                                  │  │
│                  │  │ [buyer@brand.com] [inventory@brand.com] [+ Add]   │  │
│                  │  │                                                    │  │
│                  │  │ Size Curve Alerts:    [✓] Enable                   │  │
│                  │  │ Restock Suggestions:  [✓] Enable AI Recommendations│  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ WHOLESALE PRICING                                   │  │
│                  │  │                                                    │  │
│                  │  │ Enable Wholesale:     [Toggle: On]                 │  │
│                  │  │ Minimum Order:        [$500]                       │  │
│                  │  │                                                    │  │
│                  │  │ Pricing Tiers:                                     │  │
│                  │  │ • Tier 1 (5-24 units):     [40%] off retail       │  │
│                  │  │ • Tier 2 (25-99 units):    [50%] off retail       │  │
│                  │  │ • Tier 3 (100+ units):     [55%] off retail       │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Wholesale Customers]                       │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ TREND ANALYTICS                                     │  │
│                  │  │                                                    │  │
│                  │  │ Trend Data Sources:                                │  │
│                  │  │ [✓] Internal Sales  [✓] Social Listening          │  │
│                  │  │ [✓] Industry Reports [✓] Competitor Analysis      │  │
│                  │  │                                                    │  │
│                  │  │ Forecast Period:      [6 months ▼]                 │  │
│                  │  │ Alert on Trend Shift: [✓]  [15%] threshold        │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 6. Marketing & Social Integration

### Marketing Module Customization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MARKETING - Fashion Specific                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CAMPAIGNS                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ [+ New Campaign]                                                      │  │
│  │                                                                       │  │
│  │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          │  │
│  │ │ 🌸 Spring Launch│ │ 📸 Influencer   │ │ 🎁 Loyalty      │          │  │
│  │ │    Campaign     │ │    Collab       │ │    Rewards      │          │  │
│  │ │                 │ │                 │ │                 │          │  │
│  │ │ Active          │ │ Scheduled       │ │ Draft           │          │  │
│  │ │ $12.5K spent    │ │ Starts Mar 15   │ │                 │          │  │
│  │ │ 3.2% CTR        │ │ 5 influencers   │ │                 │          │  │
│  │ └─────────────────┘ └─────────────────┘ └─────────────────┘          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  LOOKBOOK MARKETING                                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ [📷 Upload Lookbook]  [🎨 Create from Template]  [🔗 Share]          │  │
│  │                                                                       │  │
│  │ Recent Lookbooks:                                                     │  │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │  │
│  │ │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │                  │  │
│  │ │Spring'26 │ │Resort    │ │Evening   │ │Active    │                  │  │
│  │ │Views:2.4K│ │Views:1.8K│ │Views:3.1K│ │Views:890 │                  │  │
│  │ │Conv:4.2% │ │Conv:3.8% │ │Conv:5.1% │ │Conv:2.9% │                  │  │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  SOCIAL COMMERCE                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Connected Platforms:                                                  │  │
│  │ [Instagram ✓] [TikTok ✓] [Pinterest ✓] [Facebook ✓]                  │  │
│  │                                                                       │  │
│  │ Shop the Look Performance:                                            │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ Instagram Shopping    │  1,240 clicks  │  $8,420 revenue      │  │  │
│  │ │ TikTok Shop          │    890 clicks  │  $4,230 revenue      │  │  │
│  │ │ Pinterest Buyable    │    456 clicks  │  $2,890 revenue      │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ [Schedule Shoppable Post]  [Sync Inventory]  [Analytics]             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  INFLUENCER MANAGEMENT                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Active Partners: 12                                                   │  │
│  │                                                                       │  │
│  │ ┌──────────────┬──────────────┬──────────────┬──────────────┐        │  │
│  │ │ @fashionista │ @stylequeen  │ @trendsetter │ @luxelover   │        │  │
│  │ │ 245K followers│ 189K followers│ 156K followers│ 134K followers│       │  │
│  │ │ 4.2% engagement│ 5.1% engagement│ 3.8% engagement│ 6.2% engagement│      │  │
│  │ │ $2,500/post  │ $1,800/post  │ $1,500/post  │ $2,200/post  │        │  │
│  │ │ [View Stats] │ [View Stats] │ [View Stats] │ [View Stats] │        │  │
│  │ └──────────────┴──────────────┴──────────────┴──────────────┘        │  │
│  │                                                                       │  │
│  │ [+ Add Influencer]  [Manage Contracts]  [Track ROI]                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Control Center Integration

### Storefront Customization for Fashion

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTROL CENTER - Fashion Storefront                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  THEME CUSTOMIZATION                                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Active Theme: Rose Gold Premium                                       │  │
│  │                                                                       │  │
│  │ Color Overrides:                                                      │  │
│  │ Primary:    [#E8B4B8]  [Reset]                                        │  │
│  │ Secondary:  [#D4A5A5]  [Reset]                                        │  │
│  │ Background: [#0F0F0F]  [Reset]                                        │  │
│  │                                                                       │  │
│  │ Typography:                                                           │  │
│  │ Heading Font: [Playfair Display ▼]    Body Font: [Inter ▼]           │  │
│  │                                                                       │  │
│  │ Glass Effect Intensity: [████████░░] 80%                             │  │
│  │ Border Radius:          [█████░░░░░] 50% (16px)                      │  │
│  │                                                                       │  │
│  │ [Preview Storefront]  [Save Changes]  [Export Theme]                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  HOMEPAGE BUILDER                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Section Order: (Drag to reorder)                                      │  │
│  │                                                                       │  │
│  │ ☰ Hero Banner         [⚙️ Configure] [👁️ Preview] [🗑️]              │  │
│  │ ☰ Featured Collection [⚙️ Configure] [👁️ Preview] [🗑️]              │  │
│  │ ☰ New Arrivals        [⚙️ Configure] [👁️ Preview] [🗑️]              │  │
│  │ ☰ Lookbook Preview    [⚙️ Configure] [👁️ Preview] [🗑️]              │  │
│  │ ☰ Trending Now        [⚙️ Configure] [👁️ Preview] [🗑️]              │  │
│  │ ☰ Instagram Feed      [⚙️ Configure] [👁️ Preview] [🗑️]              │  │
│  │ ☰ Newsletter          [⚙️ Configure] [👁️ Preview] [🗑️]              │  │
│  │                                                                       │  │
│  │ [+ Add Section]                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  COLLECTION DISPLAY                                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Grid Layout:        [3 columns ▼]                                     │  │
│  │ Image Aspect Ratio: [3:4 Portrait ▼]                                  │  │
│  │ Hover Effect:       [Quick View ▼]                                    │  │
│  │                                                                       │  │
│  │ Product Card Elements:                                                │  │
│  │ [✓] Product Image    [✓] Product Name    [✓] Price                   │  │
│  │ [✓] Size Swatches    [✓] Color Swatches  [✓] Quick Add               │  │
│  │ [✓] Sale Badge       [✓] New Badge       [✗] Wishlist                │  │
│  │                                                                       │  │
│  │ Size Display Format: [US / UK / EU ▼]                                 │  │
│  │ Show Size Guide:     [✓] On hover                                     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  CHECKOUT CUSTOMIZATION                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Size Confirmation:   [✓] Require size selection confirmation          │  │
│  │ Fit Guide Popup:     [✓] Show on size selection                       │  │
│  │ Size Converter:      [✓] Enable in cart                               │  │
│  │                                                                       │  │
│  │ Gift Options:        [✓] Enable gift wrapping                         │  │
│  │ Gift Message:        [✓] Allow custom message                         │  │
│  │ Gift Receipt:        [✓] Exclude prices                               │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Finance Module Customization

### Fashion-Specific Financial Metrics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FINANCE - Fashion Industry View                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  REVENUE BREAKDOWN                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ By Collection:                                        By Channel:     │  │
│  │ ┌─────────────────────────────────────────┐  ┌─────────────────────┐  │  │
│  │ │ [Pie Chart]                             │  │ [Bar Chart]         │  │  │
│  │ │ • Spring Essentials    47%  $24,500    │  │ Online Store  68%   │  │  │
│  │ │ • Evening Wear         35%  $18,200    │  │ Wholesale     22%   │  │  │
│  │ │ • Activewear           18%  $12,800    │  │ Pop-up        10%   │  │  │
│  │ └─────────────────────────────────────────┘  └─────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  SIZE-BASED ANALYTICS                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Revenue by Size:                                                      │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ XS    [$8,200]  ████████░░░░░░░░░░░░  12%                      │  │  │
│  │ │ S     [$14,500] ██████████████░░░░░░  22%                      │  │  │
│  │ │ M     [$22,100] ████████████████████  35%  ← Top               │  │  │
│  │ │ L     [$16,800] ███████████████░░░░░  26%                      │  │  │
│  │ │ XL    [$7,400]  ███████░░░░░░░░░░░░░  11%                      │  │  │
│  │ │ XXL   [$2,800]  ███░░░░░░░░░░░░░░░░░   4%                      │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ Return Rate by Size:                                                  │  │
│  │ XS: 8%  S: 12%  M: 15%  L: 18%  XL: 24%  XXL: 32%  ← Investigate XL   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  WHOLESALE FINANCE                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Outstanding Invoices:                                                 │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ Boutique A     │  $12,500  │  Net 30  │  Due in 12 days       │  │  │
│  │ │ Department B   │  $28,900  │  Net 60  │  Due in 45 days       │  │  │
│  │ │ Online Retailer│   $8,200  │  Net 15  │  ⚠️ Overdue 3 days    │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ Wholesale Revenue MTD: $49,600  |  Margin: 52%                        │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Account Page Extensions

### Fashion-Specific Profile Fields

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ACCOUNT SETTINGS - Fashion Brand Profile                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BRAND PROFILE                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Brand Name:        [Luxe Fashion Co.                    ]            │  │
│  │ Brand Tagline:     [Timeless Elegance for Modern Women  ]            │  │
│  │                                                       │  │
│  │ Brand Category:    [Women's Apparel ▼]                               │  │
│  │ Sub-Category:      [Contemporary / Evening / Activewear ▼]           │  │
│  │                                                       │  │
│  │ Target Demographic:                                                   │  │
│  │ Age Range: [25-34 ▼]  Style: [Sophisticated ▼]  Price: [Premium ▼]   │  │
│  │                                                       │  │
│  │ Size Range Offered:                                                   │  │
│  │ [✓] XS  [✓] S  [✓] M  [✓] L  [✓] XL  [✓] XXL  [✓] Petite  [✓] Plus   │  │
│  │                                                       │  │
│  │ Brand Values:                                                         │  │
│  │ [✓] Sustainable  [✓] Ethical Production  [✓] Size Inclusive          │  │
│  │ [✓] Made in USA  [✗] Vegan Materials                               │  │
│  │                                                       │  │
│  │ [Save Profile]                                                        │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  SIZING STANDARDS                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Primary Size Standard: [US ▼]                                         │  │
│  │ Display Conversion:    [✓] Show UK  [✓] Show EU  [✓] Show CM         │  │
│  │                                                                       │  │
│  │ Custom Size Guide:                                                    │  │
│  │ [Upload Size Chart PDF]  [Edit Digital Size Guide]                    │  │
│  │                                                                       │  │
│  │ Model Measurements Display:                                           │  │
│  │ [✓] Show on product pages  [✓] Include height  [✓] Include size worn │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  INTEGRATIONS                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Design Tools:                                                         │  │
│  │ [Connect Adobe Creative Cloud]  [Connect Figma]  [Connect Sketch]    │  │
│  │                                                                       │  │
│  │ Fashion-Specific Platforms:                                           │  │
│  │ [Connect WGSN]  [Connect Trendalytics]  [Connect Edited]             │  │
│  │                                                                       │  │
│  │ Wholesale Platforms:                                                  │  │
│  │ [Connect NuOrder]  [Connect Joor]  [Connect Faire]                   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. API Endpoints Mapping

### Required APIs for Fashion Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get size curve data | `/api/fashion/size-curves` | GET | P0 |
| Get collection health | `/api/fashion/collections/health` | GET | P0 |
| **Visual Merchandising** ||||
| List lookbooks | `/api/fashion/lookbooks` | GET | P1 |
| Create lookbook | `/api/fashion/lookbooks` | POST | P1 |
| Update lookbook | `/api/fashion/lookbooks/:id` | PUT | P1 |
| **Size Guide** ||||
| Get size guides | `/api/fashion/size-guides` | GET | P1 |
| Create size guide | `/api/fashion/size-guides` | POST | P1 |
| Get measurements | `/api/fashion/size-guides/:id/measurements` | GET | P1 |
| **Collections** ||||
| List collections | `/api/fashion/collections` | GET | P0 |
| Create collection | `/api/fashion/collections` | POST | P1 |
| Add products to collection | `/api/fashion/collections/:id/products` | POST | P1 |
| **Trends** ||||
| Get trends | `/api/fashion/trends` | GET | P2 |
| Get forecasting | `/api/fashion/trends/forecasting` | GET | P2 |
| **Inventory** ||||
| Get inventory breakdown | `/api/fashion/inventory/breakdown` | GET | P0 |
| Get low stock alerts | `/api/fashion/inventory/restock-alerts` | GET | P1 |
| **Wholesale** ||||
| Get pricing tiers | `/api/fashion/wholesale/pricing-tiers` | GET | P2 |
| Get bulk orders | `/api/fashion/wholesale/bulk-orders` | GET | P2 |
| **Fit Analytics** ||||
| Get returns by size | `/api/fashion/fit/returns-by-size` | GET | P2 |
| Get size recommendations | `/api/fashion/fit/recommendations` | GET | P2 |

---

## 11. TypeScript Interfaces

```typescript
// Fashion Dashboard Configuration
interface FashionDashboardConfig {
  industry: 'fashion';
  designCategory: 'premium-glass';
  theme: FashionTheme;
  kpis: FashionKPI[];
  sections: FashionSection[];
}

type FashionTheme = 'rose-gold' | 'champagne' | 'sapphire' | 'emerald' | 'velvet';

interface FashionKPI {
  id: string;
  name: 'revenue' | 'gmv' | 'orders' | 'customers' | 'conversion';
  value: number;
  change: number;
  sparklineData: number[];
}

interface FashionSection {
  id: string;
  type: 'size-curve' | 'collection-health' | 'visual-merch' | 'trends' | 'inventory';
  position: 'left' | 'right' | 'full';
  enabled: boolean;
}

// Size Curve Data
interface SizeCurveData {
  category: string;
  distribution: SizeDistribution[];
  topSize: string;
  restockAlerts: RestockAlert[];
}

interface SizeDistribution {
  size: string;
  percentage: number;
  units: number;
  revenue: number;
}

interface RestockAlert {
  size: string;
  currentStock: number;
  threshold: number;
  recommendedOrder: number;
}

// Collection Data
interface CollectionHealth {
  id: string;
  name: string;
  gmv: number;
  units: number;
  performance: number; // 0-100
  imageUrl: string;
}

// Lookbook
interface Lookbook {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  conversion: number;
  images: string[];
  createdAt: Date;
}

// Trend Data
interface TrendData {
  name: string;
  growth: number;
  category: string;
  confidence: number;
}

// Inventory Heatmap
interface InventoryVariant {
  size: string;
  color: string;
  quantity: number;
  status: 'healthy' | 'low' | 'critical';
}
```

---

## 12. Responsive Behavior

### Breakpoints

```
Desktop (≥1280px):
- Full 2-column layout
- All 5 KPIs visible
- Size curve chart expanded
- Lookbook gallery 4 items

Tablet (768px - 1279px):
- 2-column layout maintained
- KPIs: 3 visible, 2 in dropdown
- Size curve chart compact
- Lookbook gallery 2 items

Mobile (<768px):
- Single column layout
- KPIs: Carousel swipe
- Size curve: List view
- Lookbook: Single scroll
```

---

*Document generated as part of Batch 1 Design Documents - Fashion Industry*
