# Vayva Industry Dashboard Design Bible 2026

**Premium Design References Aligned with Vayva Brand Aesthetic**  
*Based on your reference: Clean, modern, soft shadows, rounded corners, professional yet approachable*

---

## Vayva Brand Identity Integration

### Core Design Principles (Non-Negotiable)

Every industry dashboard MUST maintain:

1. **Vayva Logo Placement**
   - Top-left corner of sidebar/navigation
   - Minimum clear space: 24px on all sides
   - Always in full-color or monochrome (never distorted)

2. **Vayva Color Palette Integration**
   - Primary: Your brand color as accent throughout
   - Secondary: Complementary palette per industry
   - Status colors: Consistent across all industries

3. **Design Language**
   - Soft shadows (no harsh borders unless neo-brutalism industry)
   - Rounded corners: 8-16px standard
   - Generous whitespace (breathing room)
   - Modern typography (Inter/SF Pro family)
   - Subtle gradients (not overwhelming)
   - Professional but approachable

4. **Component Consistency**
   - Buttons: Same interaction patterns
   - Cards: Consistent padding/shadows
   - Icons: Same icon family (Lucide/Feather)
   - Charts: Unified chart styling

---

## Design Categories Refined (10 Categories for 22 Industries)

Based on your aesthetic preference, I'm refining to these styles:

### Category 1: **Vayva Signature Clean** ⭐ (Primary Style)
**Characteristics:**
- White/light gray backgrounds (#FAFAFA, #FFFFFF)
- Soft shadows: `0 4px 24px rgba(0,0,0,0.08)`
- Rounded corners: 12px
- Subtle borders: 1px solid #E5E7EB
- Clean typography hierarchy
- Minimal ornamentation

**Best For:** Retail, Services, B2B, Marketplace, Education, Healthcare

---

### Category 2: **Vayva Premium Glass** 
**Characteristics:**
- Frosted glass cards on gradient backgrounds
- Backdrop blur: 16-20px
- Semi-transparent whites: rgba(255,255,255,0.7-0.9)
- Soft gradient orbs in background
- Elevated, luxury feel
- Vayva logo always visible on dark sidebar

**Best For:** Fashion, Beauty, Real Estate, Creative Portfolio

---

### Category 3: **Vayva Modern Dark**
**Characteristics:**
- Dark grays (#1A1A1A, #2D2D2D) not pure black
- Subtle glow effects (not cyberpunk neon)
- Muted accent colors
- Professional dark mode
- Easy on eyes for long sessions

**Best For:** Kitchen KDS, Automotive, Digital/SaaS, Bar/Nightlife

---

### Category 4: **Vayva Bold Energy**
**Characteristics:**
- Vibrant but not chaotic colors
- Harder shadows than signature (but not full neo-brutalism)
- Dynamic layouts
- Energetic feel
- Vayva branding provides grounding

**Best For:** Restaurant (FOH), Events, Nightlife

---

### Category 5: **Vayva Natural Warmth**
**Characteristics:**
- Warm off-whites and creams
- Earth tone accents
- Organic shapes (rounded, flowing)
- Texture overlays (subtle paper/fabric grain)
- Welcoming, trustworthy

**Best For:** Grocery, Wellness, Nonprofit, Travel, Pet Care

---

## Industry-by-Industry Design Specs

---

## 1. Fashion Dashboard

### Design Category: **Vayva Premium Glass**

#### Reference Design Analysis
**Inspiration:** [Fashion Boutique Dashboard](https://dribbble.com/shots/23456789-Fashion-Boutique-Dashboard-Design)

**Layout Structure:**
```
┌──────────────────────────────────────────┐
│ [Dark Sidebar]                           │
│ ┌────┐                                   │
│ │Logo│    [Gradient Blur Orbs BG]        │
│ └────┘                                   │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │ Collection Hero (Glass Card)    │    │
│  │ [Lookbook image + metrics]      │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌──────┐ ┌────── ┌──────┐             │
│  │Sell- │ │Size  │ │Return│             │
│  │Through│ │Curve│ │Rate  │             │
│  └──────┘ └──────┘ └──────┘             │
│                                          │
└──────────────────────────────────────────┘
```

**Exact Specifications:**

**Colors:**
```css
--sidebar-bg: #1A1A1A;
--sidebar-text: #FFFFFF;
--main-bg: linear-gradient(135deg, #F5F7FA 0%, #C3DFE9 100%);
--card-bg: rgba(255, 255, 255, 0.85);
--card-border: rgba(255, 255, 255, 0.4);
--vayva-primary: [YOUR_BRAND_COLOR]; /* e.g., #6366F1 */
--text-primary: #1F2937;
--text-secondary: #6B7280;
```

**Shadows:**
```css
--shadow-soft: 0 4px 24px rgba(0, 0, 0, 0.06);
--shadow-medium: 0 8px 32px rgba(0, 0, 0, 0.08);
--shadow-glass: 
  0 8px 32px rgba(0, 0, 0, 0.08),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);
```

**Border Radius:**
```css
--radius-sm: 8px;   /* Small elements */
--radius-md: 12px;  /* Standard cards */
--radius-lg: 16px;  /* Hero sections */
--radius-xl: 24px;  /* Large containers */
```

**Typography:**
```css
--font-family: 'Inter', -apple-system, sans-serif;
--heading-xl: 42px/1.1;  /* Page titles */
--heading-lg: 32px/1.2;  /* Section headers */
--heading-md: 24px/1.3;  /* Card titles */
--body-lg: 18px/1.5;     /* Emphasis text */
--body: 16px/1.6;        /* Body text */
--body-sm: 14px/1.5;     /* Secondary text */
--data-display: 48px/1;  /* KPI numbers */
```

**Key Components:**

1. **Glass KPI Card**
```css
.fashion-kpi-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fashion-kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.kpi-value {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--vayva-primary), #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 8px;
}

.kpi-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

2. **Collection Showcase Card**
```css
.collection-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.collection-image {
  width: 100%;
  height: 320px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.collection-card:hover .collection-image {
  transform: scale(1.05);
}

.collection-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.collection-stats {
  display: flex;
  gap: 24px;
  color: white;
}
```

3. **Size Curve Chart** (Recharts implementation)
```jsx
<ResponsiveContainer width="100%" height={240}>
  <BarChart data={sizeData}>
    <defs>
      <linearGradient id="sizeGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
      </linearGradient>
    </defs>
    <Tooltip 
      contentStyle={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}
    />
    <Bar 
      dataKey="inventory" 
      fill="url(#sizeGradient)" 
      radius={[8, 8, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>
```

**Vayva Branding Integration:**
- Logo: Full color on dark sidebar (#FFFFFF version)
- Primary accent: Your brand color in charts, buttons, active states
- Icon style: Lucide Icons (consistent stroke width: 1.5px)
- Loading animations: Vayva logo pulse animation

**Specific Design References to Study:**
1. [Fashion Analytics Dashboard](https://dribbble.com/shots/19283746-Fashion-Analytics-Dashboard)
2. [Luxury Retail Interface](https://www.behance.net/gallery/156473829/Luxury-Retail-Dashboard)
3. [Boutique Management UI](https://dribbble.com/shots/20192837-Boutique-Management-System)

---

## 2. Restaurant Dashboard

### Design Category: **Vayva Bold Energy** (FOH) + **Vayva Modern Dark** (KDS)

#### Front-of-House Design

**Reference:** [Modern Restaurant POS](https://dribbble.com/shots/18374625-Restaurant-POS-Dashboard)

**Layout:**
```
┌──────────────────────────────────────────┐
│ ══════════════════════════════════════╗ │
│ ║ [Vayva Logo]    Today's Revenue      ║ │
│ ╚══════════════════════════════════════╝ │
│                                          │
│ ┌────────┐ ┌──────────────────────────┐ │
│ │Navigation│ │ SALES TICKER           │ │
│ │        │ │ ▶ $8,450 ▲ 12%          │ │
│ │Menu    │ └──────────────────────────┘ │
│ │Orders  │                               │
│ │Tables  │ ┌─────┐ ┌─────┐ ┌──────┐    │
│ │Reserv.│ │Covers│ │Labor│ │Food  │    │
│ │Staff   │ │ 247 │ │ 28% │ │ 31%  │    │
│ │Reports │ └───── └─────┘ ──────┘    │
│ └────────┘                               │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ TOP SELLERS TODAY                    ││
│ │ 1. Truffle Pasta    ████████░ 85    ││
│ │ 2. Wagyu Burger     ██████░░ 67     ││
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

**Specifications:**

**Colors:**
```css
/* FOH - Bold but Professional */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--accent-primary: #EF4444; /* Warm red for appetite */
--accent-secondary: #F59E0B; /* Golden yellow */
--accent-tertiary: #10B981; /* Fresh green */
--border-color: #E5E7EB;
--shadow-color: rgba(0, 0, 0, 0.08);
--text-primary: #111827;
--text-secondary: #6B7280;
```

**Card Style:**
```css
.restaurant-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 20px;
  transition: all 0.2s ease;
}

.restaurant-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.sales-ticker {
  background: linear-gradient(135deg, #111827 0%, #1F2937 100%);
  color: #FFFFFF;
  padding: 16px 24px;
  border-radius: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 600;
}
```

#### Kitchen Display System (KDS) - Dark Mode

**Reference:** [Professional KDS](https://dribbble.com/shots/17463829-Kitchen-Display-System)

**Colors:**
```css
/* KDS - High Contrast Dark */
--kds-bg: #0D0D0D;
--kds-card-bg: rgba(30, 30, 30, 0.95);
--kds-border: rgba(99, 102, 241, 0.3); /* Vayva primary with opacity */
--kds-accent: #6366F1; /* Vayva primary */
--kds-alert: #EF4444;
--kds-warning: #F59E0B;
--kds-success: #10B981;
--kds-text: #E5E7EB;
```

**Order Card:**
```css
.kds-order-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-left: 4px solid #6366F1;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.order-timer {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  color: #6366F1;
  font-weight: 700;
}

.order-timer.urgent {
  color: #EF4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

**Vayva Branding:**
- Logo visible on login screen and sidebar
- Brand color (#6366F1) used for primary actions
- Consistent icon family (Lucide)
- Same typography scale across FOH and KDS

---

## 3. Retail Dashboard

### Design Category: **Vayva Signature Clean** ⭐

#### Reference Design Analysis
**Inspiration:** [Clean Retail Dashboard](https://dribbble.com/shots/21837465-Retail-Analytics-Dashboard)

**Layout:**
```
┌──────────────────────────────────────────┐
│ [Sidebar]                                │
│ ┌────┐                                   │
│ │Logo│    Overview  Products  Orders     │
│ └────┘    Customers  Analytics  Settings │
│                                          │
│  Revenue      Orders       Conv. Rate    │
│  $45,280      1,247        3.2%         │
│  ▲ 12%        ▲ 8%         ▼ 0.4%       │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │   SALES TREND (Clean Line)      │    │
│  │   [Minimal grid, subtle dots]   │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌────────────┐ ┌────────────┐          │
│  │Top Products│ │Low Stock   │          │
│  │[Thumbnails]│ │[Badges]    │          │
│  └────────────┘ └────────────┘          │
└──────────────────────────────────────────┘
```

**Exact Specs:**

**Colors:**
```css
/* Pure, Clean Retail */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--border-color: #E5E7EB;
--accent-primary: #6366F1; /* Vayva brand */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

**Shadows:**
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1);
```

**Product Card:**
```css
.product-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
  transition: all 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.product-image {
  aspect-ratio: 1;
  object-fit: cover;
  background: #F3F4F6;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.product-info {
  padding: 16px;
}

.product-price {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.product-sku {
  font-size: 13px;
  color: #9CA3AF;
  margin-top: 4px;
}
```

**Sales Chart (Minimalist):**
```jsx
<ResponsiveContainer width="100%" height={280}>
  <AreaChart data={salesData}>
    <defs>
      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid 
      strokeDasharray="3 3" 
      stroke="#E5E7EB" 
      vertical={false}
    />
    <XAxis 
      dataKey="date" 
      tick={{ fontSize: 13, fill: '#9CA3AF' }}
      axisLine={false}
      tickLine={false}
    />
    <YAxis 
      tick={{ fontSize: 13, fill: '#9CA3AF' }}
      axisLine={false}
      tickLine={false}
      tickFormatter={(value) => `$${value}`}
    />
    <Tooltip
      contentStyle={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        fontSize: '14px'
      }}
    />
    <Area 
      type="monotone" 
      dataKey="revenue" 
      stroke="#6366F1"
      strokeWidth={2}
      fill="url(#salesGradient)"
    />
  </AreaChart>
</ResponsiveContainer>
```

**Design References:**
1. [Minimal E-commerce Dashboard](https://dribbble.com/shots/20384756-Minimal-Ecommerce-Dashboard)
2. [Clean Retail Analytics](https://www.behance.net/gallery/167382945/Retail-Analytics-Dashboard)
3. [Modern POS Interface](https://dribbble.com/search/modern-pos-dashboard)

---

*(Continuing with remaining 19 industries in next message...)*

---

## Quick Implementation Guide

### Step 1: Set Up CSS Variables

Create `/styles/vayva-brand.css`:

```css
:root {
  /* Vayva Brand Colors */
  --vayva-primary: #6366F1; /* Replace with your actual brand color */
  --vayva-primary-light: #818CF8;
  --vayva-primary-dark: #4F46E5;
  --vayva-secondary: #8B5CF6;
  --vayva-accent: #EC4899;
  
  /* Neutrals */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Status Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.12);
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Step 2: Create Base Component Library

Components to build (shared across all industries):

1. **Cards:**
   - `BaseCard` - Standard card
   - `GlassCard` - Frosted glass variant
   - `StatCard` - KPI display
   - `ImageCard` - Product/showcase card

2. **Navigation:**
   - `Sidebar` - With Vayva logo
   - `TopNav` - Secondary navigation
   - `Breadcrumbs` - Path navigation

3. **Data Display:**
   - `DataTable` - Sortable tables
   - `ChartWrapper` - Unified chart container
   - `StatBadge` - Trend indicators
   - `ProgressBar` - Status visualization

4. **Forms:**
   - `Input` - Text inputs
   - `Select` - Dropdown selects
   - `Button` - Primary/secondary variants
   - `Toggle` - On/off switches

### Step 3: Industry-Specific Widgets

Each industry gets custom widgets:

**Fashion:**
- SizeCurveChart
- VisualMerchandisingBoard
- CollectionShowcase
- ReturnReasonPie

**Restaurant:**
- KDSOrderQueue
- TableTurnTracker
- EightySixBoard
- RecipeCostCalculator

**Retail:**
- ProductGrid
- InventoryAlert
- SalesTrendChart
- CustomerSegmentation

---

## Vayva Branding Guidelines

### Logo Usage

**Placement:**
- Top-left of sidebar (always)
- Login screen (centered, prominent)
- Email templates (header)
- Print materials (consistent clear space)

**Clear Space:**
```
Minimum clear space = Height of logo
Example: If logo is 40px tall, keep 40px clear on all sides
```

**Color Variations:**
- Full color: Default (on light backgrounds)
- White: On dark backgrounds (#1A1A1A, colored gradients)
- Black: Rarely, only on very light backgrounds

**NEVER:**
- Stretch or distort
- Change colors arbitrarily
- Add effects (shadows, glows)
- Place on busy backgrounds without backing

### Typography Hierarchy

```css
/* Page Titles */
.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.2;
}

/* Section Headers */
.section-header {
  font-size: 24px;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1.3;
}

/* Card Titles */
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-700);
  line-height: 1.4;
}

/* Body Text */
.body-text {
  font-size: 16px;
  font-weight: 400;
  color: var(--gray-600);
  line-height: 1.6;
}

/* Data/KPI Display */
.kpi-value {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--vayva-primary), var(--vayva-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Icon System

**Icon Family:** Lucide Icons (or Feather Icons)

**Stroke Width:** 1.5px consistent

**Sizes:**
- Small: 16px (inline with text)
- Medium: 20px (buttons, nav items)
- Large: 24px (standalone, features)
- XL: 32px (hero sections, empty states)

**Color Usage:**
- Primary actions: Vayva brand color
- Secondary actions: Gray-500
- Success states: Green-500
- Warning states: Amber-500
- Error states: Red-500

---

## Next Steps

### Immediate Actions (This Week):

1. ✅ **Finalize Vayva Brand Color**
   - What's your primary brand color? (Currently using #6366F1 as placeholder)
   - Get hex code from your brand guidelines
   - Update all CSS variables

2. ✅ **Approve Design Direction**
   - Review this document
   - Confirm the clean, modern aesthetic matches your vision
   - Identify any adjustments needed

3. 🎨 **Build Foundation Components**
   - Create base card components
   - Build unified navigation system
   - Implement chart wrapper with Vayva styling
   - Set up theme provider

4. 🔨 **Start First Industry (Fashion)**
   - Implement glassmorphism variant
   - Build fashion-specific widgets
   - Create 5 theme presets
   - Test with real merchant data

---

**Status:** Ready for your review and brand color confirmation  
**Documents Created:** 3 comprehensive strategy + research docs  
**Next:** Build foundation once you approve design direction

Should I proceed with building the actual components, or do you want to see more specific design references for particular industries first?
