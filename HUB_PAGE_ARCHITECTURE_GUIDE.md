# 🏗️ Industry Hub Page Architecture & Sidebar Navigation Guide

**Version:** 1.0  
**Date:** March 28, 2026  
**Status:** Production Ready Pattern

---

## 📋 OVERVIEW

Every industry in Vayva now has a **Hub Page** structure with:
- ✅ Breadcrumb navigation showing full hierarchy
- ✅ Left sidebar with industry-specific subpages
- ✅ Plan-based feature gating (STARTER → PRO → PRO+)
- ✅ Team section at bottom of sidebar
- ✅ Modular content area

---

## 🎯 ARCHITECTURE PATTERN

### File Structure

```
Frontend/merchant/src/app/(dashboard)/dashboard/
├── [industry]/              ← Industry Hub Page (MAIN DASHBOARD)
│   ├── page.tsx             ← Main hub component
│   ├── orders/              ← Subpage 1
│   │   └── page.tsx
│   ├── inventory/           ← Subpage 2
│   │   └── page.tsx
│   ├── customers/           ← Subpage 3
│   │   └── page.tsx
│   ├── kds/                 ← Subpage 4 (industry-specific)
│   │   └── page.tsx
│   ├── tables/              ← Subpage 5 (industry-specific)
│   │   └── page.tsx
│   ├── finance/             ← Subpage 6 (PRO tier)
│   │   └── page.tsx
│   ├── marketing/           ← Subpage 7 (PRO tier)
│   │   └── page.tsx
│   ├── analytics/           ← Subpage 8 (PRO tier)
│   │   └── page.tsx
│   ├── staff/               ← Subpage 9
│   │   └── page.tsx
│   └── settings/            ← Subpage 10
│       └── page.tsx
```

---

## 🗺️ SIDEBAR NAVIGATION STRUCTURE

### Visual Layout

```
┌─────────────────────────────────────┐
│  ☰ VAYVA              [User Menu]  │  ← Top Navigation Bar
├─────────┬───────────────────────────┤
│         │                           │
│ DASHBOARDS          Breadcrumbs:    │
│ ├─ Restaurant       Dashboard >     │
│ ├─ Beauty           Restaurant      │
│ ├─ Healthcare                       │
│ └─ ...                              │
│                                     │
│ RESTAURANT OPS      ┌──────────────│
│ ├─ Dashboard  🏠    │ Main Content │
│ ├─ Orders     🛒    │ Area         │
│ ├─ Inventory 📦     │               │
│ ├─ Customers 👥     │ • Metrics    │
│ ├─ KDS       👨‍🍳    │ • Charts     │
│ ├─ Tables    🪑     │ • Tasks      │
│ ├─ Reservations 📅  │ • Alerts     │
│ ├─ Staff     👥     │               │
│ ├─ Finance   💰     │               │
│ ├─ Marketing 📢     │               │
│ ├─ Analytics 📊     │               │
│ └─ Settings  ⚙️     │               │
│                     │               │
│ TEAM                │               │
│ ├─ Staff Management │               │
│ └─ Settings         │               │
│                     │               │
└─────────┴───────────┘               │
```

---

## 📐 SIDEBAR COMPONENT BREAKDOWN

### Section 1: Global Dashboards Navigation

```tsx
DASHBOARDS
├─ Restaurant
├─ Beauty
├─ Healthcare
└─ ... (all industries user has access to)
```

**Purpose:** Quick switch between different industry dashboards (for multi-business owners)

---

### Section 2: Industry-Specific Navigation

```tsx
RESTAURANT OPS
├─ Dashboard      🏠  (Main hub page)
├─ Orders         🛒  (Order management)
├─ Inventory      📦  (Stock tracking)
├─ Customers      👥  (CRM)
├─ KDS           👨‍🍳  (Kitchen Display - PRO+)
├─ Tables         🪑  (Table management - PRO)
├─ Reservations   📅  (Booking system)
├─ Staff          👥  (Team management)
├─ Finance        💰  (Financial reports - PRO)
├─ Marketing      📢  (Campaigns - PRO)
├─ Analytics      📊  (Business insights - PRO)
└─ Settings       ⚙️  (Configuration)
```

**Structure:**
- **Core Pages** (always visible): Dashboard, Orders, Inventory, Customers
- **Industry Modules** (visible by industry type): KDS, Tables, Reservations
- **Business Features** (gated by plan): Finance, Marketing, Analytics
- **Settings** (always visible): Configuration and preferences

---

### Section 3: Team Section

```tsx
TEAM
├─ Staff Management
└─ Settings
```

**Purpose:** Quick access to team-related features, placed at bottom for easy access

---

## 🎨 VISUAL DESIGN SPECIFICATIONS

### Sidebar Styling

```tsx
// Container
width: 256px (w-64)
background: white (bg-white)
border-right: gray-200 (border-r border-gray-200)
position: fixed left-0 top-16
min-height: 100vh
padding: 1rem (p-4)
overflow-y: auto

// Section Headers
font-size: 0.75rem (text-xs)
font-weight: 600 (font-semibold)
color: gray-500 (text-gray-500)
text-transform: uppercase
letter-spacing: 0.05em (tracking-wider)
padding: 0.5rem 0.75rem (px-3 py-2)

// Navigation Items (Normal)
display: flex
align-items: center
gap: 0.75rem (gap-3)
padding: 0.5rem 0.75rem (px-3 py-2)
font-size: 0.875rem (text-sm)
font-weight: 500 (font-medium)
color: gray-700 (text-gray-700)
border-radius: 0.5rem (rounded-lg)
hover: bg-gray-50 (hover:bg-gray-50)
hover-color: gray-900 (hover:text-gray-900)
transition: colors (transition-colors)

// Navigation Items (Active/Current Page)
background: gray-100 (bg-gray-100)
color: gray-900 (text-gray-900)

// Icons
size: 18px
color: gray-400 (text-gray-400)
hover-color: gray-500 (group-hover:text-gray-500)

// Locked Items (Hidden by Plan)
color: gray-400 (text-gray-400)
cursor: not-allowed (cursor-not-allowed)
lock-icon: visible (shows 🔒)

// PRO+ Badge
crown-icon: purple-600 (text-purple-600)
size: 14px
```

---

## 🔒 PLAN TIER GATING EXAMPLES

### STARTER Plan Sidebar

```tsx
RESTAURANT STARTER
├─ Dashboard      ✅
├─ Orders         ✅
├─ Inventory      ✅
├─ Customers      ✅
├─ KDS           🔒 (locked - PRO+ only)
├─ Tables        🔒 (locked - PRO only)
├─ Reservations   ✅
├─ Staff          ✅
├─ Finance       🔒 (locked - PRO only)
├─ Marketing     🔒 (locked - PRO only)
├─ Analytics     🔒 (locked - PRO only)
└─ Settings       ✅
```

### PRO Plan Sidebar

```tsx
RESTAURANT PRO
├─ Dashboard      ✅
├─ Orders         ✅
├─ Inventory      ✅
├─ Customers      ✅
├─ KDS           🔒 (locked - PRO+ only)
├─ Tables         ✅ (unlocked at PRO)
├─ Reservations   ✅
├─ Staff          ✅
├─ Finance        ✅ (unlocked at PRO)
├─ Marketing      ✅ (unlocked at PRO)
├─ Analytics      ✅ (unlocked at PRO)
└─ Settings       ✅
```

### PRO+ Plan Sidebar

```tsx
RESTAURANT PRO+
├─ Dashboard      ✅
├─ Orders         ✅
├─ Inventory      ✅
├─ Customers      ✅
├─ KDS            ✅ (unlocked at PRO+)
├─ Tables         ✅
├─ Reservations   ✅
├─ Staff          ✅
├─ Finance        ✅
├─ Marketing      ✅
├─ Analytics      ✅
└─ Settings       ✅
```

---

## 🎯 INDUSTRY-SPECIFIC CONFIGURATIONS

### Example 1: Restaurant Industry

```typescript
const restaurantConfig = {
  industry: 'restaurant',
  displayName: 'Restaurant Operations',
  sidebarItems: [
    // Core (All industries)
    { label: 'Dashboard', href: '/dashboard/restaurant', icon: <Home /> },
    { label: 'Orders', href: '/dashboard/restaurant/orders', icon: <ShoppingCart /> },
    { label: 'Inventory', href: '/dashboard/restaurant/inventory', icon: <Package /> },
    { label: 'Customers', href: '/dashboard/restaurant/customers', icon: <Users /> },
    
    // Industry-Specific
    { label: 'KDS (Kitchen)', href: '/dashboard/restaurant/kds', icon: <ChefHat />, planTier: 'PRO_PLUS' },
    { label: 'Table Management', href: '/dashboard/restaurant/tables', icon: <LayoutGrid />, planTier: 'PRO' },
    { label: 'Reservations', href: '/dashboard/restaurant/reservations', icon: <Calendar /> },
    { label: 'Staff', href: '/dashboard/restaurant/staff', icon: <Users /> },
    
    // Business Features
    { label: 'Finance', href: '/dashboard/restaurant/finance', icon: <DollarSign />, planTier: 'PRO' },
    { label: 'Marketing', href: '/dashboard/restaurant/marketing', icon: <Megaphone />, planTier: 'PRO' },
    { label: 'Analytics', href: '/dashboard/restaurant/analytics', icon: <BarChart3 />, planTier: 'PRO' },
    { label: 'Settings', href: '/dashboard/restaurant/settings', icon: <Settings /> },
  ],
};
```

### Example 2: Beauty Industry

```typescript
const beautyConfig = {
  industry: 'beauty-wellness',
  displayName: 'Beauty & Wellness',
  sidebarItems: [
    // Core
    { label: 'Dashboard', href: '/dashboard/beauty-wellness', icon: <Home /> },
    { label: 'Bookings', href: '/dashboard/beauty-wellness/bookings', icon: <Calendar /> },
    { label: 'Clients', href: '/dashboard/beauty-wellness/clients', icon: <Users /> },
    { label: 'Services', href: '/dashboard/beauty-wellness/services', icon: <Scissors /> },
    
    // Industry-Specific
    { label: 'Appointments', href: '/dashboard/beauty-wellness/appointments', icon: <Clock /> },
    { label: 'Staff Commissions', href: '/dashboard/beauty-wellness/commissions', icon: <DollarSign />, planTier: 'PRO_PLUS' },
    { label: 'Gallery', href: '/dashboard/beauty-wellness/gallery', icon: <Camera /> },
    { label: 'Products', href: '/dashboard/beauty-wellness/products', icon: <ShoppingBag /> },
    
    // Business Features
    { label: 'Finance', href: '/dashboard/beauty-wellness/finance', icon: <DollarSign />, planTier: 'PRO' },
    { label: 'Marketing', href: '/dashboard/beauty-wellness/marketing', icon: <Megaphone />, planTier: 'PRO' },
    { label: 'Analytics', href: '/dashboard/beauty-wellness/analytics', icon: <BarChart3 />, planTier: 'PRO' },
    { label: 'Settings', href: '/dashboard/beauty-wellness/settings', icon: <Settings /> },
  ],
};
```

### Example 3: Healthcare Industry

```typescript
const healthcareConfig = {
  industry: 'healthcare',
  displayName: 'Healthcare Practice',
  sidebarItems: [
    // Core
    { label: 'Dashboard', href: '/dashboard/healthcare', icon: <Home /> },
    { label: 'Patients', href: '/dashboard/healthcare/patients', icon: <Users /> },
    { label: 'Appointments', href: '/dashboard/healthcare/appointments', icon: <Calendar /> },
    { label: 'Services', href: '/dashboard/healthcare/services', icon: <Stethoscope /> },
    
    // Industry-Specific (PRO+ features)
    { label: 'EMR / EHR', href: '/dashboard/healthcare/emr', icon: <FileText />, planTier: 'PRO_PLUS' },
    { label: 'Insurance Claims', href: '/dashboard/healthcare/insurance', icon: <FileCheck />, planTier: 'PRO_PLUS' },
    { label: 'Prescriptions', href: '/dashboard/healthcare/prescriptions', icon: <Pill /> },
    { label: 'Lab Results', href: '/dashboard/healthcare/labs', icon: <Microscope /> },
    
    // Business Features
    { label: 'Finance', href: '/dashboard/healthcare/finance', icon: <DollarSign />, planTier: 'PRO' },
    { label: 'Marketing', href: '/dashboard/healthcare/marketing', icon: <Megaphone />, planTier: 'PRO' },
    { label: 'Analytics', href: '/dashboard/healthcare/analytics', icon: <BarChart3 />, planTier: 'PRO' },
    { label: 'Settings', href: '/dashboard/healthcare/settings', icon: <Settings /> },
  ],
};
```

---

## 🎨 BREADCRUMB IMPLEMENTATION

### Component Usage

```tsx
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

<Breadcrumbs
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Restaurant', href: '/dashboard/restaurant' },
    { label: 'Orders', href: '/dashboard/restaurant/orders' },
  ]}
/>
```

### Visual Output

```
Dashboard > Restaurant > Orders
```

### Styling

```tsx
// Container
padding-x: 1.5rem (px-6)
padding-y: 1rem (py-4)
background: white (bg-white)
border-bottom: gray-200 (border-b border-gray-200)

// Breadcrumb Item
font-size: 0.875rem (text-sm)
color: gray-600 (text-gray-600)
hover-color: gray-900 (hover:text-gray-900)

// Separator
content: ">"
margin-x: 0.5rem (mx-2)
color: gray-400 (text-gray-400)

// Current Page (Last Item)
font-weight: 500 (font-medium)
color: gray-900 (text-gray-900)
```

---

## 📝 IMPLEMENTATION CHECKLIST

### For Each Industry (32 Total)

#### Phase 1: Create Hub Page
- [ ] Copy `IndustryHubTemplate.tsx` pattern
- [ ] Customize industry configuration object
- [ ] Define sidebar navigation items (8-12 items)
- [ ] Set plan tier requirements for each item
- [ ] Add industry-specific metrics
- [ ] Test breadcrumb navigation
- [ ] Verify sidebar rendering correctly

#### Phase 2: Create Sub-Pages
- [ ] Create `/orders/page.tsx` (or industry equivalent)
- [ ] Create `/inventory/page.tsx`
- [ ] Create `/customers/page.tsx`
- [ ] Create industry-specific pages (KDS, Appointments, etc.)
- [ ] Create `/finance/page.tsx` (PRO tier)
- [ ] Create `/marketing/page.tsx` (PRO tier)
- [ ] Create `/analytics/page.tsx` (PRO tier)
- [ ] Create `/staff/page.tsx`
- [ ] Create `/settings/page.tsx`

#### Phase 3: Integration
- [ ] Link sidebar items to actual pages
- [ ] Ensure breadcrumbs update per page
- [ ] Test plan tier gating (upgrade prompts)
- [ ] Verify mobile responsiveness
- [ ] Add ErrorBoundaries to all pages
- [ ] Implement loading skeletons

#### Phase 4: Design Audit
- [ ] Verify color contrast (WCAG AA)
- [ ] Check focus states (all interactive elements)
- [ ] Test keyboard navigation
- [ ] Validate spacing consistency
- [ ] Review typography hierarchy
- [ ] Confirm icon consistency (Lucide only)

---

## 🎯 QUICK REFERENCE: Icon Mapping

### Universal Icons (All Industries)
```typescript
Home          // Dashboard
ShoppingCart  // Orders
Package       // Inventory/Catalog
Users         // Customers/People
DollarSign    // Finance/Money
Megaphone     // Marketing
BarChart3     // Analytics
Settings      // Configuration
```

### Industry-Specific Icons

```typescript
// Food & Beverage
ChefHat       // Kitchen/Cooking
Utensils      // Restaurant general
Wine          // Bar/Beverages
Coffee        // Cafe

// Beauty & Wellness
Scissors      // Hair salon
Sparkles      // Beauty treatments
Heart         // Wellness
Flower        // Spa services

// Healthcare
Stethoscope   // Medical general
HeartPulse    // Cardiology
Pill          // Pharmacy/Prescriptions
Microscope    // Lab tests
FileText      // Medical records

// Education
GraduationCap // School/Education
BookOpen      // Courses
Award         // Certificates
Clipboard     // Assessments

// Automotive
Car           // Vehicles general
Wrench        // Repairs
Gauge         // Diagnostics
OilCan        // Maintenance

// Retail
ShoppingBag   // Shopping
CreditCard    // POS/Payments
Tag           // Products
Store         // Physical location

// Fitness
Dumbbell      // Gym/Fitness
Heart         // Cardio
Timer         // Workout timing
Trophy        // Achievements
```

---

## 🚀 DEPLOYMENT STRATEGY

### Batch 1: Priority Industries (Week 1)
1. Restaurant (most complex)
2. Beauty & Wellness
3. Healthcare
4. Retail
5. Automotive

### Batch 2: Secondary Industries (Week 2)
6. Education
7. Fitness
8. Professional Services
9. Grocery
10. E-commerce

### Batch 3: Remaining Industries (Week 3)
11-32. All other industries

---

## 📊 SUCCESS METRICS

### Functional Requirements
- ✅ Every industry has hub page with sidebar
- ✅ Breadcrumbs show full hierarchy
- ✅ Plan tier gating works correctly
- ✅ Team section visible at bottom
- ✅ All sub-pages accessible via sidebar

### Design Requirements
- ✅ Sidebar width: 256px consistent
- ✅ Typography follows scale (xs, sm, base, lg)
- ✅ Colors match design system
- ✅ Icons are 18px, consistent stroke
- ✅ Hover states on all interactive items
- ✅ Focus-visible rings on keyboard nav
- ✅ Mobile responsive (collapses on small screens)

### Accessibility Requirements
- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigable
- ✅ Screen reader friendly (ARIA labels)
- ✅ Color contrast ≥ 4.5:1
- ✅ Focus indicators visible

---

## 🎁 BONUS: Pre-Built Configurations

See these ready-to-use configurations:
- `IndustryHubTemplate.tsx` - Master template
- `RestaurantDashboard.tsx` - Example implementation
- `BeautyDashboard.tsx` - Alternative example
- `HealthcareDashboard.tsx` - Complex example

---

**END OF GUIDE**
