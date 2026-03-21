# Design Changes Specification — Total Merchant Admin Overhaul

> **Scope:** Every surface in the Vayva Merchant Admin — authentication, onboarding, dashboard shell, all 266+ pages, settings, billing, account, modals, empty states, error pages.
>
> **Reference:** `DESIGN_SYSTEM_RULES.md` is the source of truth for how things should look. This document tells you what to change and where.

---

## PHASE 0: FOUNDATION (Do These First)

These changes affect the entire product. Do them before touching individual pages.

### 0.1 Tailwind Config Changes

**File:** `tailwind.config.ts`

```diff
// Remove the VayvaThemeProvider design categories
// All pages should look the same regardless of industry

theme: {
  extend: {
    borderRadius: {
-     // remove any custom rounded-[28px] tokens
+     // standardize
    },
    colors: {
      // Keep primary green for brand
      primary: {
        DEFAULT: '#22C55E',
        hover: '#16A34A',
        foreground: '#FFFFFF',
      },
+     // Ensure gray scale is default (already is in Tailwind)
    },
  },
},
```

### 0.2 Global CSS Changes

**File:** `src/app/globals.css`

```diff
- .glass-panel {
-   @apply bg-white/40 backdrop-blur-md border border-white/20;
- }
+ .glass-panel {
+   @apply bg-white border border-gray-100;
+ }

  /* Add new utility classes */
+ .card-widget {
+   @apply bg-white rounded-2xl border border-gray-100 p-6;
+ }
+
+ .card-item {
+   @apply bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer;
+ }
+
+ .card-section {
+   @apply bg-white rounded-2xl border border-gray-100 p-6;
+ }
+
+ .tab-nav {
+   @apply flex items-center gap-6 border-b border-gray-200 mb-6;
+ }
+
+ .tab-nav-item {
+   @apply pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500
+          hover:text-gray-700 transition-colors cursor-pointer;
+ }
+
+ .tab-nav-item-active {
+   @apply border-green-500 text-green-600;
+ }
+
+ .widget-grid {
+   @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-6;
+ }
+
+ .kanban-grid {
+   @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
+ }
```

### 0.3 Core UI Component Changes

These files set the base look for every card, button, input, and badge across 266+ pages.

#### Card (`src/components/ui/card.tsx`)

```diff
- "rounded-[28px] border bg-background/70 backdrop-blur-xl border-border/60 shadow-card"
+ "rounded-2xl border border-gray-100 bg-white"
```

#### Button (`src/components/ui/button.tsx`)

```diff
  variants: {
    default:
-     "bg-primary text-primary-foreground hover:bg-primary/90",
+     "bg-green-500 hover:bg-green-600 text-white",
    destructive:
-     "bg-destructive text-destructive-foreground hover:bg-destructive/90",
+     "bg-red-500 hover:bg-red-600 text-white",
    outline:
-     "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
+     "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
    secondary:
-     "bg-secondary text-secondary-foreground hover:bg-secondary/80",
+     "bg-gray-100 hover:bg-gray-200 text-gray-900",
    ghost:
-     "hover:bg-accent hover:text-accent-foreground",
+     "hover:bg-gray-100 text-gray-500 hover:text-gray-700",
    link:
-     "text-primary underline-offset-4 hover:underline",
+     "text-green-600 underline-offset-4 hover:underline hover:text-green-700",
  },
  size: {
    default: "h-10 px-4 py-2",
-   sm: "h-9 rounded-md px-3",
+   sm: "h-9 rounded-xl px-3",
-   lg: "h-11 rounded-md px-8",
+   lg: "h-12 rounded-xl px-6",
-   icon: "h-10 w-10",
+   icon: "h-9 w-9 rounded-xl",
  }

- "rounded-md"
+ "rounded-xl"
```

#### Input (`src/components/ui/input.tsx`)

```diff
- "bg-background/50 backdrop-blur-sm"
+ "bg-gray-50"

- "rounded-md"
+ "rounded-xl"

+ "h-12"

+ "focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-500/10"
```

#### Badge (`src/components/ui/badge.tsx`)

Ensure badge variants map to the new status colors:
```
Success: bg-green-50 text-green-600
Warning: bg-orange-50 text-orange-600
Danger:  bg-red-50 text-red-600
Info:    bg-blue-50 text-blue-600
Neutral: bg-gray-100 text-gray-600
```

#### Dialog (`src/components/ui/dialog.tsx`)

```diff
  Content:
-   "max-w-lg"
+   "max-w-lg rounded-2xl bg-white shadow-xl p-6"

  Overlay:
-   "bg-shadow/80"
+   "bg-black/50"
```

### 0.4 Disable VayvaThemeProvider Design Categories

**File:** `src/components/vayva-ui/VayvaThemeProvider.tsx`

The design category system (`glass`, `bold`, `dark`, `natural`, `signature`) must be neutralized. All industries should render identically.

**Option A (Recommended):** Set ALL categories to output the same white/gray tokens:
```typescript
// Override: force all categories to the same clean style
const UNIFIED_STYLES = {
  '--card-bg': '#FFFFFF',
  '--gradient-primary': 'none',
  '--accent-glow': 'none',
};
```

**Option B:** Remove the provider entirely and strip design-category CSS classes from components.

---

## PHASE 1: AUTH PAGES — KEEP CURRENT DESIGN (Minor Tweaks Only)

The auth pages already use the correct `SplitAuthLayout` with green-themed `AuthLeftPanel` and clean `AuthRightPanel`. **Do NOT redesign these pages.**

### Files (NO layout/structural changes):
- `src/app/(auth)/layout.tsx` — Keep green radial gradient background
- `src/app/(auth)/signin/page.tsx` — Keep as-is
- `src/app/(auth)/signup/page.tsx` — Keep as-is (2-col name fields, slug generator, password strength)
- `src/app/(auth)/verify/page.tsx` — Keep as-is (Email/WhatsApp selector, OTP input)
- `src/app/(auth)/forgot-password/page.tsx` — Keep as-is (form + success states)
- `src/app/(auth)/reset-password/page.tsx` — Keep as-is (password requirements checklist)
- `src/components/auth/SplitAuthLayout.tsx` — Keep as-is
- `src/components/auth/AuthLeftPanel.tsx` — Keep as-is (emerald theme, mockups, variants)
- `src/components/auth/AuthRightPanel.tsx` — Keep as-is

### Minor tweaks only:

**1.1 Input focus consistency**
Across all auth form inputs, ensure focus rings match green theme:
```diff
- focus:ring-gray-900/10
+ focus:ring-green-500/10
```

**1.2 Error message styling consistency**
Ensure all error messages use:
```
bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm
```

**1.3 Success message styling consistency**
Ensure forgot-password success uses:
```
bg-green-50 border border-green-200 text-green-600 rounded-xl p-3 text-sm
```

**1.4 Leave everything else as-is:**
- SplitAuthLayout structure
- AuthLeftPanel emerald theme, dashboard mockups, floating cards
- AuthRightPanel spacing, footer, help link
- Password toggle (Eye/EyeSlash from @phosphor-icons)
- PasswordStrengthIndicator component
- OTPInput component
- Verify page method selector styling
- All existing form validation and error handling

---

## PHASE 2: ONBOARDING

### 2.1 Onboarding Layout

**File:** `src/app/onboarding/layout.tsx`

```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-2xl mx-auto px-4 py-12">
    {/* Header: Logo + Step counter + Skip */}
    <div className="flex items-center justify-between mb-8">
      <VayvaLogo />
      <span className="text-sm text-gray-400">Step {current} of {total}</span>
      <button className="text-sm text-gray-400 hover:text-gray-600">Skip</button>
    </div>

    {/* Progress bar */}
    <ProgressBar current={current} total={total} />

    {/* Step content */}
    {children}
  </div>
</div>
```

### 2.2 Progress Bar

```tsx
<div className="flex items-center gap-2 mb-8">
  {steps.map((_, i) => (
    <div key={i} className={cn(
      "h-1 flex-1 rounded-full transition-colors",
      i < current ? "bg-green-500" : i === current ? "bg-green-500" : "bg-gray-200"
    )} />
  ))}
</div>
```

### 2.3 Every Onboarding Step Component

**Files:** `src/components/onboarding/steps/*.tsx`
- `WelcomeStep.tsx`, `BusinessStep.tsx`, `IdentityStep.tsx`, `IndustryStep.tsx`,
  `SocialsStep.tsx`, `KycStep.tsx`, `PaymentStep.tsx`, `PoliciesStep.tsx`,
  `ReviewStep.tsx`, `PublishStep.tsx`, `ToolsStep.tsx`, `FirstItemStep.tsx`,
  `B2BSetupStep.tsx`, `EventsSetupStep.tsx`, `NonprofitSetupStep.tsx`

**Apply to ALL:**
```
Step card:     bg-white rounded-2xl border border-gray-100 p-8
Headline:      text-2xl font-bold text-gray-900 tracking-tight
Description:   text-sm text-gray-500 mt-2 mb-8
Inputs:        bg-gray-50 border border-gray-200 rounded-xl h-12 px-4 text-sm
Labels:        text-sm font-medium text-gray-700 mb-1.5
Continue btn:  bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 px-6 text-sm font-medium
Back btn:      bg-white border border-gray-200 text-gray-700 rounded-xl h-12 px-6
Footer:        flex justify-between mt-8
```

**Industry Selector (`IndustryStep.tsx` / `EnhancedIndustrySelector.tsx`):**
```
Grid:          grid grid-cols-2 md:grid-cols-3 gap-3
Card:          bg-white rounded-xl border border-gray-200 p-4
               hover:border-gray-400 cursor-pointer transition-colors
Selected:      border-green-500 ring-2 ring-green-500 ring-offset-2 bg-green-50
Icon:          w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2
Label:         text-sm font-medium text-gray-900
Description:   text-xs text-gray-500
```

**Social Connectors (`SocialsStep.tsx` / `FreeSocialConnector.tsx` / `UltraSimpleSocialConnector.tsx`):**
```
List item:     flex items-center gap-3 p-4 rounded-xl border border-gray-200
               hover:bg-gray-50 transition-colors
Icon:          w-10 h-10 rounded-xl (platform brand color bg)
Name:          text-sm font-medium text-gray-900
Status:        text-xs text-gray-500 OR text-xs text-green-600 "Connected"
Button:        text-sm font-medium text-gray-700, secondary style
```

### 2.4 OnboardingLayout Component

**File:** `src/components/onboarding/OnboardingLayout.tsx`

Remove any gradient backgrounds, animated blobs, or decorative elements. Replace with:
```
bg-gray-50, max-w-2xl mx-auto, clean white cards
```

### 2.5 DynamicOnboarding

**File:** `src/components/onboarding/DynamicOnboarding.tsx`

Ensure the step transitions use simple opacity fade (300ms ease-out), not spring animations.

---

## PHASE 3: DASHBOARD SHELL

### 3.1 AdminShell

**File:** `src/components/admin-shell.tsx` (~1,029 lines)

**Sidebar — Complete restructure to match Relatel pattern:**

The sidebar must become a **permanently expanded left panel** with branding at top and user info at bottom.

```diff
  Width:
- 80px collapsed / 220px expanded (toggle)
+ 220px always expanded on desktop (no collapsed state)
+ Mobile: hidden, slides in as overlay 280px

  Background:
- May have glass/gradient effects
+ bg-white border-r border-gray-100 (solid white)

  Top section — ADD branding block:
+ ┌──────────────────────┐
+ │ [Fiber Logo] 🟢      │  ← brand logo mark (w-8 h-8)
+ │ Merchant First Name  │  ← text-sm font-semibold text-gray-900
+ │ Store Name           │  ← text-xs text-gray-400
+ │            [« toggle]│  ← collapse chevron (optional on desktop)
+ └──────────────────────┘

  Navigation groups — Make collapsible with chevrons:
+ Section label: text-xs font-medium text-gray-400 uppercase tracking-wider
+                px-3 py-2 cursor-pointer, with ˄/˅ chevron on right
+ When expanded: children show below with counts
+ When collapsed: children hidden

  Nav items:
- Various custom styles / spring animations
+ text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-3 py-2.5

  Active nav item:
+ text-green-600 bg-green-50 font-medium

  Sub-items (e.g., Backlog, In progress under Tasks):
+ pl-8 (indented), each with status icon + label + count badge right-aligned
+ Count: text-xs text-gray-400 ml-auto

  Notification badge:
+ Red circle: w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full ml-auto

  Icons:
+ 20px, text-gray-400 default, text-green-600 active

  Bottom section — ADD footer block:
+ ┌──────────────────────┐
+ │ ─── divider ──────── │  ← border-t border-gray-100 my-3
+ │ ❓ Help Center    ↗  │  ← text-sm text-gray-500 + external link icon
+ │ ⚙  Settings         │  ← navigates to /settings
+ │ 👥 Invite teams      │  ← opens invite modal
+ │ ─── divider ──────── │
+ │ 👤 Full Name         │  ← text-sm font-medium text-gray-900
+ │    email@domain      │  ← text-xs text-gray-400
+ └──────────────────────┘

  Remove:
- sidebarVariants with spring animation (use CSS transition 200ms ease)
- Quick stats footer (Today's Revenue, Active Orders) — remove from sidebar
- Upgrade prompt section — remove or move to settings
- Pro badge indicators — remove (all features accessible)
```

**Header — Restructure to breadcrumb + search + actions:**

```diff
  Height:
- h-[60px] md:h-[72px]
+ h-14 (56px)

  Background:
- bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl
+ bg-white (no border-bottom, flush with content)

  Layout:
+ flex items-center justify-between px-6

  Left side:
+ [← Back arrow] + breadcrumb trail with folder icons
+ Back arrow: w-8 h-8 rounded-lg hover:bg-gray-100 (shows on sub-pages only)
+ Breadcrumb: text-sm text-gray-400, folder icon per segment, last segment text-gray-900

  Center:
+ Search bar: bg-gray-50 rounded-xl h-9 px-4, with ⌘K shortcut badge

  Right side:
+ [Manage] [Share] buttons (secondary style) + [Primary CTA] (green pill)
+ Primary CTA label changes per page: "Create task", "Add Product", etc.

  Remove:
- Logo from header (moved to sidebar top)
- Store URL display from header
- Preview/Publish buttons (move to settings or keep but restyle)
- backdrop-blur, rounded corners on header
- Notification bell (move to sidebar Tools section)
- User avatar (moved to sidebar bottom)
```

**Content area:**
```diff
  Padding:
- px-4 md:px-6 py-4 md:py-6
+ px-6 py-6

  Remove: custom scrollbar styling (keep browser default or minimal)
  Remove: page transition slide (keep opacity fade only)
```

**Mobile bottom nav:**
```diff
  Background:
- bg-background/80 backdrop-blur-xl border-t border-border
+ bg-white border-t border-gray-100

  Items:
+ text-gray-400 active:text-green-600
+ icons 20px, label text-[10px] font-medium
```

### 3.2 Sidebar Config

**File:** `src/config/sidebar.ts`

Update the group structure to match the new collapsible sections:

```
Group 1: "Overview" — Dashboard, Calendar
Group 2: "Commerce" (or industry name) — Orders, Products, etc. (with sub-items + counts)
Group 3: "Tools" — Notification (red badge), Inbox, Integration, Reporting
Group 4: "Metrics" — Active (alert badge), Past
```

### 3.3 Mobile Nav Config

**File:** `src/config/mobile-nav.ts`

No changes needed. Tab selection and industry mapping stay the same.

---

## PHASE 4: DASHBOARD PAGES (Template A — Metrics + Content)

Apply to: Dashboard, Orders, Products, Inventory, Customers, Finance, Marketing, Analytics, Bookings, Events, Listings, Services, and all industry verticals.

### 4.1 Page Header Pattern (Apply to ALL)

Every page that currently uses `DashboardPageShell`, `PageShell`, or a custom header:

```tsx
{/* Page Header */}
<div className="mb-6">
  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
  <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
</div>
<div className="flex items-center justify-between mb-6">
  <div>{/* title area above */}</div>
  <div className="flex items-center gap-3">
    {/* Secondary buttons */}
    <Button variant="outline" className="rounded-xl">
      <Settings size={16} className="mr-2 text-gray-400" />
      Manage
    </Button>
    {/* Primary CTA */}
    <Button className="rounded-full gap-2 bg-green-500 hover:bg-green-600 px-5">
      <Plus size={16} />
      {ctaLabel}
    </Button>
  </div>
</div>
```

### 4.2 Summary Widgets Pattern (Apply to ALL metrics pages)

Replace KPI rows, stat blocks, and scattered metric cards with 3 summary widgets:

```tsx
<div className="widget-grid">
  <SummaryWidget
    icon={<Package size={18} />}
    label="Total Products"
    value={totalProducts}
    trend={{ value: "12.5%", direction: "up", period: "30d" }}
    chart={<GradientBars data={weeklyData} />}
  />
  <SummaryWidget
    icon={<AlertTriangle size={18} />}
    label="Low Stock"
    value={lowStockCount}
    trend={{ value: "3.2%", direction: "down", period: "7d" }}
  />
  <SummaryWidget
    icon={<TrendingUp size={18} />}
    label="Revenue Trend"
    chart={<SparklineChart data={revenueHistory} />}
  />
</div>
```

### 4.3 Tab Navigation Pattern (Apply to ALL)

```tsx
<div className="tab-nav">
  <div className="flex items-center gap-6">
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={cn("tab-nav-item", activeTab === tab.id && "tab-nav-item-active")}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
  <div className="flex items-center gap-2 pb-3">
    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
      <Filter size={14} />
      Filter
    </button>
  </div>
</div>
```

### 4.4 Main Content Patterns

**Kanban view (orders, tasks, projects, campaigns):**
```tsx
<div className="kanban-grid">
  {columns.map(col => (
    <div key={col.id}>
      <div className="flex items-center gap-2 mb-4">
        <col.icon size={16} className={col.iconColor} />
        <span className="text-sm font-medium text-gray-900">{col.label}</span>
        <span className="text-sm text-gray-400">{col.count}</span>
        <button className="ml-auto p-1 hover:bg-gray-100 rounded-lg">
          <MoreHorizontal size={14} className="text-gray-400" />
        </button>
      </div>
      <div className="space-y-3">
        {col.items.map(item => <ItemCard key={item.id} item={item} />)}
      </div>
    </div>
  ))}
</div>
```

**Table view (transactions, customers, inventory):**
```tsx
<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="bg-gray-50">
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {column.label}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-gray-100 hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">{cell}</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Card grid (products, listings, services):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => (
    <div className="card-item">
      <img className="w-full h-40 object-cover rounded-lg mb-3" />
      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
      <p className="text-sm text-gray-500">{item.price}</p>
      <StatusBadge status={item.status} />
    </div>
  ))}
</div>
```

---

## PHASE 5: SPECIFIC PAGE CHANGES

### 5.1 Dashboard (`/dashboard`)

**Files:** `ProDashboardV2.tsx`, `DashboardV2Content.tsx`, `UniversalProDashboardV2.tsx`

| Section | Current | Change To |
|---|---|---|
| Layout | 3-column (3-6-3 grid-cols-12) | Single column, stacked sections |
| Header | text-xl title + "Add Product" button | text-2xl title + subtitle + avatar group + "Create task" pill |
| KPI row | 4 small KeyMetricCards | 3 SummaryWidget cards with mini-charts |
| Charts | Revenue bar chart in center column | Move to widget card 3 as sparkline |
| Orders | Donut chart + legend | Move to tab content OR widget card |
| AI section | 4 stat blocks + AI usage chart | Consolidate into 1 widget card |
| Tasks | Left column task list | Move to kanban board in main content |
| Right column | AI Usage, Inventory, Customers | Remove column — integrate into widgets or tabs |
| Tabs | None | Add: Overview \| Orders \| Tasks \| Reports |

Remove ALL of:
- `emerald-*` color references → use `green-*`
- `violet-*` for AI → keep as `violet-*` (it's a status color)
- `amber-*` → use `orange-*`
- `rose-*` → use `red-*`
- SVG donut chart → replace with recharts or move to tab
- Hardcoded sample data arrays → connect to API or show empty state

### 5.2 Orders (`/dashboard/orders`)

| Widget 1 | Widget 2 | Widget 3 |
|---|---|---|
| Order Status: Pending X, Processing Y, Shipped Z | Today's Revenue: ₦X + trend | Order Volume chart (7 days) |

Tabs: All | Pending | Processing | Shipped | Delivered | Cancelled
Content: Kanban board with order cards OR data table (togglable)

### 5.3 Products (`/dashboard/products`)

| Widget 1 | Widget 2 | Widget 3 |
|---|---|---|
| Total: X Published, Y Draft | Low Stock: N items | Sales trend (7 days) |

Tabs: All | Published | Draft | Archived
Content: Card grid (image + name + price + stock badge)

### 5.4 Inventory (`/dashboard/inventory`)

| Widget 1 | Widget 2 | Widget 3 |
|---|---|---|
| Stock Status: X In Stock, Y Low, Z Out | Restock Alerts | Inventory Value trend |

Tabs: All | In Stock | Low Stock | Out of Stock
Content: Data table (product, SKU, stock, status, location)

### 5.5 Finance (`/dashboard/finance`)

| Widget 1 | Widget 2 | Widget 3 |
|---|---|---|
| Revenue: ₦X + trend | Expenses: ₦Y + trend | Net Profit chart |

Tabs: Overview | Transactions | Payouts | Refunds | Reports
Content: Transaction table

### 5.6 Finance Sub-pages

**`/finance/payouts`** — Data table with payout history
**`/finance/refunds`** — Data table with refund requests (kanban: Pending | Approved | Rejected)
**`/finance/transactions`** — Data table
**`/finance/statements`** — Card grid of monthly statements
**`/finance/wallet`** — Balance card + transaction list
**`/finance/bnpl`** — Active plans table

All follow: white cards, gray-100 borders, rounded-2xl/xl, text-sm body, no glass.

### 5.7 Marketing (`/dashboard/marketing`)

| Widget 1 | Widget 2 | Widget 3 |
|---|---|---|
| Active Campaigns: X | Total Reach: Y | Conversion Rate: Z% |

Tabs: Campaigns | Discounts | Email | Social | Affiliates
Content: Campaign cards as kanban (Draft | Active | Paused | Completed)

### 5.8 Customers (`/dashboard/customers`)

| Widget 1 | Widget 2 | Widget 3 |
|---|---|---|
| Total: X | New This Month: Y + trend | Repeat Rate: Z% |

Tabs: All | Active | New | At Risk
Content: Data table (name, email, orders, total spent, last order, status)

### 5.9 Bookings (`/dashboard/bookings`)

| Widget 1 | Widget 2 | Widget 3 |
|---|---|---|
| Today: X bookings | This Week: Y | Revenue trend |

Tabs: All | Upcoming | In Progress | Completed | Cancelled
Content: Kanban or calendar view

### 5.10 All Industry Vertical Dashboards

**Files:** `grocery/page.tsx`, `wellness/page.tsx`, `nightlife/page.tsx`, `nonprofit/page.tsx`, `real-estate/page.tsx`, `professional/page.tsx`, `stays/page.tsx`

ALL follow Template A with industry-appropriate labels. Same visual treatment everywhere:
- Same white cards, same gray borders, same typography
- No industry-specific colors, gradients, or themes
- Only tab labels and metric labels change

### 5.11 Settings Pages

**Files:** All files under `/dashboard/settings/**`

ALL settings pages follow Template B (Settings/Form):

```
max-w-3xl mx-auto space-y-6

Section card: bg-white rounded-2xl border border-gray-100 p-6
Section title: text-base font-semibold text-gray-900
Description: text-sm text-gray-500 mt-1 mb-6
Inputs: bg-gray-50 border border-gray-200 rounded-xl h-12
Labels: text-sm font-medium text-gray-700 mb-1.5
Save button: bg-green-500 hover:bg-green-600 text-white rounded-xl
Cancel: bg-white border border-gray-200 text-gray-700 rounded-xl
```

**Settings pages to update:**
- `/settings/store` — Store name, URL, timezone, currency
- `/settings/profile` — Personal info, avatar
- `/settings/billing` — Plan, payment method, invoices
- `/settings/team` — Team members table + invite modal
- `/settings/payments` — Payment provider connections
- `/settings/shipping` — Shipping zones and rates
- `/settings/notifications` — Toggle settings
- `/settings/security` — Password, 2FA, sessions
- `/settings/seo` — Meta title, description
- `/settings/integrations` — Connected apps list
- All other 20+ settings pages

### 5.12 Account & Billing

**`/dashboard/account`:**
```
Profile section: Avatar (w-20 h-20 rounded-full) + name + email
Edit section: Form inputs in section card
Danger zone: border-red-200 section card with "Delete Account" button
```

**`/dashboard/billing`:**
```
Current plan card: border-gray-900 (highlighted)
Plan options: grid-cols-3 plan cards with feature lists
Price: text-3xl font-bold + "/mo" text-sm text-gray-500
Features: check icon text-green-500 + text-sm text-gray-600
Invoices: data table below
Payment method: bg-gray-50 rounded-xl p-4 with card icon
```

### 5.13 Detail Pages (Template C)

**`/dashboard/orders/[id]`**, **`/dashboard/products/[id]`**, **`/dashboard/customers/[id]`**, etc.

```
Layout: grid grid-cols-12 gap-6
Main: col-span-8
  → Detail card (bg-white rounded-2xl border border-gray-100 p-6)
  → Activity timeline
  → Notes section
Sidebar: col-span-4
  → Summary card
  → Customer info card
  → Tags
  → Quick actions

Back button: flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4
Status badge: inline in page header, next to title
```

---

## PHASE 6: SHARED COMPONENTS TO UPDATE

### 6.1 DashboardCard.tsx

```diff
- any bg-background/* or backdrop-blur
+ bg-white rounded-2xl border border-gray-100

  DashboardMetricCard:
- emerald/rose trend colors
+ green-600 / red-500

  Labels:
- text-xs text-slate-500
+ text-xs font-medium text-gray-500 uppercase tracking-wider
```

### 6.2 SoftCard.tsx

```diff
- "rounded-[28px] border border-white/50 bg-white/[0.45] backdrop-blur-2xl"
+ "rounded-2xl border border-gray-100 bg-white"
```

### 6.3 StatWidget.tsx

```diff
- glassmorphic styling, backdrop-blur
+ "bg-white rounded-2xl border border-gray-100 p-5"

- Framer Motion hover y:-4
+ hover:shadow-md transition-shadow
```

### 6.4 KPIBlocks.tsx

```diff
- grid-cols-4 with individual small cards
+ grid-cols-3 summary widget cards with charts inside
```

### 6.5 DashboardPageShell.tsx / PageShell.tsx

```diff
  Remove "hero" variant with glassmorphic background
  Standardize to:
+ <div className="px-6 py-6">
+   <div className="mb-6">
+     <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
+     <p className="text-sm text-gray-500 mt-1">{description}</p>
+   </div>
+   {children}
+ </div>
```

### 6.6 DashboardPageHeader.tsx

```diff
- Icon badge (14x14 green rounded)
- Fade-in animation from top
+ Simple: title + description + action buttons (no icon badge, no animation)
```

### 6.7 States.tsx (Empty, Error, Loading)

```diff
  EmptyState:
- various styles
+ flex flex-col items-center justify-center py-16 text-center
+ icon: w-12 h-12 text-gray-300 mb-4
+ title: text-base font-medium text-gray-900
+ description: text-sm text-gray-500 mt-1 max-w-sm
+ action: mt-4, Secondary button

  Skeleton:
- various bg colors
+ bg-gray-100 animate-pulse rounded-xl
```

### 6.8 Breadcrumbs.tsx

```diff
- Custom styling
+ text-sm text-gray-400, separators with ChevronRight 14px text-gray-300
+ Last segment: text-gray-900 font-medium
```

### 6.9 QuickActions.tsx

Move to a collapsed "Quick Actions" section or into a tab. Remove from main dashboard view.

### 6.10 TaskBoard.tsx

Convert from standalone card to kanban column within the dashboard.

### 6.11 DonutChart.tsx / IncomeExpenseChart.tsx / InvoiceOverview.tsx

- Remove if replaced by summary widgets
- OR move into tab content views
- Update chart colors to match the chart palette in the design system

### 6.12 AutopilotBanner.tsx / TrialBanner.tsx

```diff
- gradient backgrounds, glass effects
+ bg-white rounded-2xl border border-gray-100 p-6
+ OR bg-green-500 text-white rounded-2xl p-6 (for prominent banners)
```

### 6.13 MFA Setup Modal / Biometric Setup

```diff
- Any glass or custom styling
+ Standard modal: bg-white rounded-2xl shadow-xl p-6
+ Inputs: bg-gray-50 rounded-xl h-12
+ Buttons: standard button variants
```

---

## PHASE 7: GLOBAL SEARCH & REPLACE

Run these replacements across ALL files in `src/`:

| Find | Replace | Notes |
|---|---|---|
| `text-slate-900` | `text-gray-900` | All files |
| `text-slate-800` | `text-gray-800` | All files |
| `text-slate-700` | `text-gray-700` | All files |
| `text-slate-600` | `text-gray-600` | All files |
| `text-slate-500` | `text-gray-500` | All files |
| `text-slate-400` | `text-gray-400` | All files |
| `text-slate-300` | `text-gray-300` | All files |
| `bg-slate-900` | `bg-green-500` | Buttons/CTAs. Use `text-gray-900` for text headings only |
| `bg-slate-800` | `bg-green-600` | Hover states for primary buttons |
| `bg-slate-100` | `bg-gray-100` | All files |
| `bg-slate-50` | `bg-gray-50` | All files |
| `border-slate-100` | `border-gray-100` | All files |
| `border-slate-200` | `border-gray-200` | All files |
| `border-slate-50` | `border-gray-50` | All files |
| `hover:bg-slate-100` | `hover:bg-gray-100` | All files |
| `hover:bg-slate-50` | `hover:bg-gray-50` | All files |
| `hover:bg-slate-800` | `hover:bg-green-600` | Button hover states |
| `text-emerald-600` | `text-green-600` | All files |
| `text-emerald-500` | `text-green-500` | All files |
| `bg-emerald-50` | `bg-green-50` | All files |
| `bg-emerald-400` | `bg-green-400` | All files |
| `bg-emerald-500` | `bg-green-500` | All files |
| `text-rose-500` | `text-red-500` | All files |
| `text-rose-600` | `text-red-600` | All files |
| `bg-rose-50` | `bg-red-50` | All files |
| `bg-rose-100` | `bg-red-100` | All files |
| `text-amber-600` | `text-orange-600` | All files |
| `text-amber-700` | `text-orange-700` | All files |
| `bg-amber-50` | `bg-orange-50` | All files |
| `bg-amber-100` | `bg-orange-100` | All files |
| `rounded-[28px]` | `rounded-2xl` | Content cards only |
| `rounded-3xl` | `rounded-2xl` | Content cards only |
| `backdrop-blur-xl` | *(remove)* | Content cards only |
| `backdrop-blur-2xl` | *(remove)* | Content cards only |
| `backdrop-blur-sm` | *(remove)* | Content inputs |
| `bg-white/[0.45]` | `bg-white` | All files |
| `bg-background/70` | `bg-white` | Content cards |
| `bg-background/50` | `bg-gray-50` | Inputs |
| `shadow-card` | *(remove)* | Cards at rest |
| `shadow-glass` | *(remove)* | All files |
| `font-semibold text-slate-900` | `text-sm font-semibold text-gray-900` | Section headers |

---

## PHASE 8: IMPLEMENTATION ORDER

1. **Foundation** (Phase 0) — Card, Button, Input, Badge, Dialog, global CSS
2. **Shell** (Phase 3) — Sidebar, header, mobile nav
3. **Global search & replace** (Phase 7) — slate→gray, emerald→green, etc.
4. **Dashboard** (Phase 4 + 5.1) — Main pro dashboard rewrite
5. **Auth** (Phase 1) — Sign in, sign up, forgot password
6. **Onboarding** (Phase 2) — All steps
7. **High-traffic pages** (Phase 5) — Orders, Products, Finance, Marketing, Customers
8. **Settings & Account** (Phase 5.11-5.12) — All settings pages
9. **Detail pages** (Phase 5.13) — Order detail, product detail, etc.
10. **Remaining 200+ pages** — Apply templates A/B/C systematically
11. **Cleanup** — Remove unused components, dead design categories

---

## CHECKLIST

- [ ] `tailwind.config.ts` updated
- [ ] `globals.css` updated with new utilities
- [ ] `card.tsx` — remove glass, use solid white
- [ ] `button.tsx` — new variants, rounded-xl
- [ ] `input.tsx` — bg-gray-50, rounded-xl, h-12
- [ ] `badge.tsx` — new status colors
- [ ] `dialog.tsx` — rounded-2xl, shadow-xl
- [ ] `VayvaThemeProvider.tsx` — neutralize design categories
- [ ] `admin-shell.tsx` — solid sidebar/header, no glass
- [ ] Auth layout — bg-gray-50, no decorations
- [ ] Sign in page — clean card layout
- [ ] Sign up page — clean card layout
- [ ] All 15 onboarding steps — white cards, standard inputs
- [ ] `ProDashboardV2.tsx` — full restructure
- [ ] Global slate→gray replacement
- [ ] Global emerald→green replacement
- [ ] Global rose→red replacement
- [ ] Global amber→orange replacement
- [ ] Global backdrop-blur removal (content)
- [ ] Global rounded-[28px] → rounded-2xl
- [ ] Orders page — Template A
- [ ] Products page — Template A
- [ ] Finance page — Template A
- [ ] Marketing page — Template A
- [ ] Customers page — Template A
- [ ] All settings pages — Template B
- [ ] Account page — Template B
- [ ] Billing page — Template B
- [ ] All detail pages — Template C
- [ ] All industry dashboards — Template A
- [ ] Empty states updated
- [ ] Loading skeletons updated
- [ ] Mobile responsive verified
- [ ] Accessibility audit passed
