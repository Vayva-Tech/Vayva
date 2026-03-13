# VAYVA DASHBOARD MIGRATION PLAN v2.0
## Accurate Architecture-Based Transition Strategy

**Document Version:** 2.0  
**Last Updated:** March 11, 2026  
**Based On:** Deep codebase audit of actual Vayva architecture  

---

## EXECUTIVE SUMMARY

After conducting a comprehensive deep dive audit of the Vayva codebase, this updated migration plan reflects the **actual architecture** rather than theoretical designs. The platform is significantly more mature than initially assessed.

### Current State Reality Check

**What Actually Exists (Not What Was Assumed):**

✅ **Industry Archetype System** - Already implemented with 4 base archetypes:
- `commerce` (retail, fashion, electronics, beauty, grocery, B2B, wholesale, one_product)
- `food` (food, restaurant, catering)
- `bookings` (services, salon, spa, real_estate, automotive, travel_hospitality, hotel, fitness, healthcare, legal)
- `content` (digital, events, blog_media, creative_portfolio, education, nonprofit, nightlife, jobs)

✅ **Industry-Native Dashboards** - 17 fully defined in `industry-dashboard-definitions.ts`:
- Retail, Food, Services, B2B, Events, Nightlife, Automotive, Travel/Hospitality
- Digital, Nonprofit, Education, Blog/Media, Creative Portfolio, Marketplace
- Fashion, Electronics, Beauty (extend Retail)

✅ **Dashboard Variant System** - KPI gating by plan tier already implemented:
- Basic (4 KPIs, no Finance/Marketing modules)
- Standard (6-8 KPIs, Finance module)
- Advanced (12+ KPIs, all modules)
- Pro (Unlimited + AI features)

✅ **Template System** - 72 industry-specific templates in `/templates/` directory

✅ **Vayva UI Component Library** - Complete with 5 design categories:
- `signature` (clean, professional)
- `glass` (premium, backdrop blur)
- `bold` (high contrast, thick borders)
- `dark` (modern dark mode)
- `natural` (warm, organic)

✅ **API Infrastructure** - 405+ route.ts files across 90+ endpoint categories

**What's Actually Missing (The Real Gap):**

❌ **Design Category Application** - Components exist but aren't dynamically applied based on industry
❌ **Visual Design Implementation** - Glassmorphism, dark mode themes not connected to industry selection
❌ **Onboarding → Dashboard Connection** - Industry selected during onboarding doesn't trigger design category
❌ **Real-Time WebSocket Updates** - Infrastructure exists but not integrated with industry dashboards
❌ **22 Industry Dashboard Implementations** - Only 17 defined, missing 5 (SaaS, Jobs, Legal, Fitness, Healthcare)

---

## ARCHITECTURE INVENTORY

### 1. Industry Configuration System

**File:** `Frontend/merchant-admin/src/config/industry-archetypes.ts` (1000+ lines)

**Current Structure:**
```typescript
// 4 Base Archetypes
INDUSTRY_ARCHETYPES = {
  commerce: { modules, labels, icons, routes, widgets, forms, aiTools },
  food: { modules, labels, icons, routes, widgets, forms, aiTools },
  bookings: { modules, labels, icons, routes, widgets, forms, aiTools },
  content: { modules, labels, icons, routes, widgets, forms, aiTools }
}

// Industry to Archetype Mapping (30+ industries)
INDUSTRY_SLUG_MAP = {
  retail: "commerce",
  fashion: "commerce",
  food: "food",
  restaurant: "food",
  services: "bookings",
  real_estate: "bookings",
  // ... etc
}

// Per-Industry Overrides (45+ industries configured)
INDUSTRY_OVERRIDES = {
  fashion: { displayName, description, moduleLabels, aiTools },
  restaurant: { modules, moduleLabels, moduleIcons, features },
  // ... etc
}
```

**Key Insight:** The industry system is already sophisticated. We need to ADD design category mapping to this existing structure rather than replace it.

### 2. Dashboard Variant System

**File:** `Frontend/merchant-admin/src/config/dashboard-variants.ts`

**Current Structure:**
```typescript
// KPI Naming Standards (enforced across all variants)
// - Revenue, Orders, Bookings, Customers, AOV, etc.

// Plan Tiers with Capabilities
tierCapabilities = {
  basic: { maxKpiSlots: 4, hasFinanceModule: false, ... },
  standard: { maxKpiSlots: 6, hasFinanceModule: true, ... },
  advanced: { maxKpiSlots: 12, hasFinanceModule: true, ... },
  pro: { maxKpiSlots: Infinity, hasFinanceModule: true, ... }
}

// Variant Specs with KPI slots, pipeline, alerts
DASHBOARD_VARIANTS = [
  { key: "basic_global", tier: "basic", kpis: [...], appliesTo: ALL_INDUSTRIES },
  { key: "standard_retail", tier: "standard", kpis: [...], appliesTo: ["retail", "fashion"] },
  // ... etc
]
```

**Key Insight:** KPI gating and tier capabilities are already implemented. We need to connect design categories to this system.

### 3. Industry-Native Dashboard Definitions

**File:** `Backend/core-api/src/config/industry-dashboard-definitions.ts` (1500+ lines)

**Current Structure:**
```typescript
// 17 Industry Dashboards Defined
IndustryDashboardDefinition = {
  industry: IndustrySlug,
  title: string,
  subtitle: string,
  primaryObjectLabel: string,
  defaultTimeHorizon: "now" | "today" | "week" | "month",
  sections: ["primary_object_health", "live_operations", "decision_kpis", "bottlenecks_alerts", "suggested_actions"],
  
  primaryObjectHealth: [{
    key: string,
    label: string,
    format: "number" | "currency" | "percent" | "list",
    icon?: string
  }],
  
  liveOps: [{
    key: string,
    label: string,
    format: "number" | "currency" | "duration" | "list",
    icon?: string,
    emptyText?: string
  }],
  
  alertThresholds: [{
    key: string,
    label: string,
    operator: "gt" | "lt" | "eq" | "gte" | "lte",
    value: number,
    severity: "critical" | "warning" | "info",
    message: string
  }],
  
  suggestedActionRules: [{
    id: string,
    title: string,
    reason: string,
    conditionKey: string,
    severity: "critical" | "warning" | "info",
    href: string,
    icon: string
  }],
  
  failureModes: string[]
}
```

**Key Insight:** The business logic for industry-native dashboards is already defined. We need to implement the VISUAL presentation layer (design categories) on top of this foundation.

### 4. Current Dashboard Components

**Location:** `Frontend/merchant-admin/src/components/dashboard-v2/`

**Existing Components:**
```
dashboard-v2/
├── DashboardV2Content.tsx         # Main dashboard container (KEEP)
├── ProDashboardV2.tsx             # Pro tier enhancements (KEEP)
├── DashboardLegacyContent.tsx     # Legacy fallback (DEPRECATE)
├── IndustryNativeSections.tsx     # Industry sections (EXPAND)
│   ├── PrimaryObjectHealth        # Product/Service health display
│   ├── LiveOperations             # Real-time ops metrics
│   ├── AlertsList                 # Bottleneck alerts
│   └── SuggestedActionsList       # AI-powered suggestions
├── KPIBlocks.tsx                  # KPI cards (REUSE)
├── TodosAlerts.tsx                # Tasks & notifications (REUSE)
├── QuickActions.tsx               # Quick action buttons (REUSE)
└── index.ts                       # Exports
```

**Key Insight:** The component architecture is solid. We need to:
1. Keep `DashboardV2Content` as the container
2. Enhance `IndustryNativeSections` with design category styling
3. Deprecate `DashboardLegacyContent` in Phase 3
4. Add missing industry definitions (5 industries)

### 5. API Infrastructure

**Location:** `Backend/core-api/src/app/api/`

**Existing Endpoints (90+ categories):**
```
api/
├── auth/                          # Authentication (OAuth, SAML, SCIM)
├── dashboard/
│   ├── aggregate/route.ts         # Dashboard data aggregation
│   └── industry-overview/route.ts # Industry-specific overview
├── products/                      # Product CRUD
├── orders/                        # Order management
├── inventory/                     # Inventory tracking
├── bookings/                      # Appointment booking
├── events/                        # Event management
├── finance/                       # Financial operations
├── marketing/                     # Marketing campaigns
├── customers/                     # Customer management
├── analytics/                     # Analytics & reporting
├── ai/                            # AI features
├── webhooks/                      # Webhook management
├── integrations/                  # Third-party integrations
└── [industry-specific]/           # Industry APIs
    ├── fashion/
    ├── food/
    ├── realestate/
    └── ...
```

**Key Insight:** API infrastructure is mature. We need to add:
1. Real-time WebSocket endpoints for live updates
2. Industry-specific data aggregation endpoints
3. Design category configuration endpoints

### 6. Template System

**Location:** `/templates/` (72 templates)

**Template Categories:**
- Commerce: fashion, electronics, beauty, grocery, furniture, toys
- Food: food, restaurant
- Services: salon, spa, services
- Real Estate: realestate
- Automotive: autodealer, automotive
- Education: edulearn, codecamp, courseacademy
- Events: events, eventhorizon
- Healthcare: healthcare
- Nonprofit: hoperise
- Digital: crypto, digital
- And 40+ more...

**Key Insight:** Templates are comprehensive. We need to ensure dashboard design categories match template aesthetics.

---

## THE REAL MIGRATION STRATEGY

### Phase 1: Design Category Integration (Week 1-2)

**Objective:** Connect existing industry system to design categories

#### Step 1.1: Extend Industry Configuration

**File:** `Frontend/merchant-admin/src/config/industry-archetypes.ts`

**Add Design Category Mapping:**
```typescript
// Add to existing INDUSTRY_ARCHETYPES
export const INDUSTRY_DESIGN_CATEGORIES: Record<string, DesignCategory> = {
  // Commerce archetype - mostly signature
  retail: "signature",
  fashion: "glass",           // Premium feel
  electronics: "signature",
  beauty: "glass",            // Premium feel
  grocery: "natural",         // Fresh, organic
  b2b: "signature",
  wholesale: "signature",
  one_product: "signature",
  saas: "dark",               // Tech-forward
  marketplace: "signature",
  
  // Food archetype
  food: "bold",               // High energy
  restaurant: "bold",         // FOH - Bold
  catering: "natural",        // Warm, inviting
  
  // Bookings archetype
  services: "signature",
  salon: "glass",             // Beauty aesthetic
  spa: "glass",               // Luxury feel
  real_estate: "glass",       // Premium properties
  automotive: "dark",         // Sleek, modern
  travel_hospitality: "natural", // Warm, welcoming
  hotel: "natural",
  fitness: "natural",         // Health-focused
  healthcare: "signature",    // Clean, trustworthy
  legal: "signature",         // Professional
  
  // Content archetype
  digital: "dark",            // Tech products
  events: "bold",             // High energy
  blog_media: "signature",
  creative_portfolio: "glass", // Artistic
  education: "signature",
  nonprofit: "natural",       // Warm, community
  nightlife: "bold",          // Vibrant
  jobs: "signature",
};

// Add to IndustryConfig type
export interface IndustryConfig {
  // ... existing fields
  designCategory: DesignCategory;
  themePresets: string[];  // Available theme presets
}
```

#### Step 1.2: Update VayvaThemeProvider

**File:** `Frontend/merchant-admin/src/components/vayva-ui/VayvaThemeProvider.tsx`

**Current State:** Already has 5 design categories and 6 presets per category

**Required Changes:**
```typescript
interface VayvaThemeProviderProps {
  children: React.ReactNode;
  industrySlug?: string;        // NEW: Auto-set theme based on industry
  initialCategory?: DesignCategory;
  initialPreset?: string;
}

export function VayvaThemeProvider({
  children,
  industrySlug,
  initialCategory,
  initialPreset,
}: VayvaThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeContextType>(() => {
    // Priority: 1. Saved preference, 2. Industry default, 3. Prop
    const saved = localStorage.getItem('vayva-theme');
    if (saved) return JSON.parse(saved);
    
    if (industrySlug) {
      const designCategory = INDUSTRY_DESIGN_CATEGORIES[industrySlug] || "signature";
      return {
        category: designCategory,
        preset: getDefaultPresetForCategory(designCategory),
        industry: industrySlug,
      };
    }
    
    return {
      category: initialCategory || "signature",
      preset: initialPreset || "clean-blue",
    };
  });
  
  // ... rest of existing logic
}
```

#### Step 1.3: Apply Design Category Styles

**File:** `Frontend/merchant-admin/src/styles/vayva-design-system.css`

**Current State:** CSS variables defined but not dynamically applied

**Required Changes:**
```css
/* Add data-attribute selectors for dynamic theming */
[data-design-category="glass"] {
  --card-bg: rgba(255, 255, 255, 0.85);
  --card-border: rgba(255, 255, 255, 0.4);
  --backdrop-blur: 20px;
  --shadow-card: 0 8px 32px rgba(236, 72, 153, 0.1);
}

[data-design-category="glass"] .dashboard-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

[data-design-category="dark"] {
  --bg-primary: #0D0D0D;
  --bg-card: rgba(30, 30, 30, 0.95);
  --text-primary: #E5E7EB;
  --accent-primary: #6366F1;
}

[data-design-category="bold"] {
  --border-width: 2px;
  --border-color: #000000;
  --shadow-solid: 4px 4px 0px #000000;
}

[data-design-category="bold"] .dashboard-card {
  border: 2px solid #000000;
  box-shadow: 4px 4px 0px #000000;
}

[data-design-category="natural"] {
  --bg-gradient: linear-gradient(180deg, #FEFCE8 0%, #FEF3C7 100%);
  --accent-color: #D97706;
  --border-radius: 16px;
}
```

### Phase 2: Onboarding Integration (Week 3)

**Objective:** Connect industry selection to dashboard theming

#### Step 2.1: Modify Onboarding Flow

**File:** `Frontend/merchant-admin/src/components/onboarding/DynamicOnboarding.tsx`

**Current State:** Industry selection happens in Settings, not during onboarding

**Required Changes:**
```typescript
// Add industry selection as first step
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "industry_selection",
    title: "Choose Your Industry",
    description: "We'll customize your dashboard for your business",
    action: "Select Industry",
    path: "/onboarding/industry",
    completed: false,
    required: true,
    estimatedTime: "1 min",
  },
  {
    id: "store_profile",
    title: "Set Up Your Store",
    description: "Add your business details",
    // ... existing
  },
  // ... rest of steps
];

// Update completion handler
const handleStepComplete = async (stepId: string, data: any) => {
  if (stepId === "industry_selection") {
    // Save industry and apply design category
    await saveIndustrySelection(data.industrySlug);
    
    // Apply theme immediately
    const designCategory = INDUSTRY_DESIGN_CATEGORIES[data.industrySlug];
    applyDesignCategory(designCategory);
  }
  
  // ... existing logic
};
```

#### Step 2.2: Create Industry Selection Screen

**File:** `Frontend/merchant-admin/src/app/onboarding/industry/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Search, Icon } from "@vayva/ui";
import { INDUSTRY_ARCHETYPES, INDUSTRY_OVERRIDES } from "@/config/industry-archetypes";
import { INDUSTRY_DESIGN_CATEGORIES } from "@/config/industry-design-categories";

export default function IndustrySelectionPage() {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const router = useRouter();

  const industries = Object.entries(INDUSTRY_OVERRIDES)
    .filter(([_, config]) => 
      config.displayName?.toLowerCase().includes(search.toLowerCase())
    )
    .sort(([_, a], [__, b]) => {
      // Prioritize common industries
      const priority = ["retail", "fashion", "restaurant", "services"];
      const aIdx = priority.indexOf(a.slug as string);
      const bIdx = priority.indexOf(b.slug as string);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return (a.displayName || "").localeCompare(b.displayName || "");
    });

  const handleContinue = async () => {
    if (!selectedIndustry) return;
    
    // Save to backend
    await fetch("/api/onboarding/industry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industrySlug: selectedIndustry }),
    });
    
    // Apply design category
    const designCategory = INDUSTRY_DESIGN_CATEGORIES[selectedIndustry];
    document.documentElement.setAttribute("data-design-category", designCategory);
    
    // Continue to next step
    router.push("/onboarding/store-profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">What type of business do you run?</h1>
        <p className="text-muted-foreground mb-8">
          We'll customize your dashboard, features, and design to match your industry
        </p>
        
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search industries..."
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map(([slug, config]) => {
            const designCategory = INDUSTRY_DESIGN_CATEGORIES[slug];
            return (
              <button
                key={slug}
                onClick={() => setSelectedIndustry(slug)}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedIndustry === slug
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={getDesignCategoryPreviewStyle(designCategory)}
                  >
                    <Icon name={config.moduleIcons?.catalog || "Package"} size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{config.displayName}</h3>
                    <span className="text-xs text-muted-foreground capitalize">
                      {designCategory} Design
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedIndustry}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Phase 3: Dashboard Rendering Updates (Week 4-5)

**Objective:** Update dashboard to apply design categories dynamically

#### Step 3.1: Update Main Dashboard Page

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/page.tsx`

**Current State:** Already has industry detection and variant selection

**Required Changes:**
```typescript
// Add design category resolution
const designCategory = useMemo(() => {
  const baseCategory = INDUSTRY_DESIGN_CATEGORIES[industrySlugForFetch] || "signature";
  
  // Pro/Advanced users can override
  if (dashboardPlanTier === "advanced" || dashboardPlanTier === "pro") {
    // Check for user preference
    const savedTheme = localStorage.getItem(`theme-${industrySlugForFetch}`);
    if (savedTheme) return savedTheme as DesignCategory;
  }
  
  return baseCategory;
}, [industrySlugForFetch, dashboardPlanTier]);

// Wrap content with theme provider
return (
  <VayvaThemeProvider
    industrySlug={industrySlugForFetch}
    initialCategory={designCategory}
  >
    <div data-design-category={designCategory}>
      {renderDashboard()}
    </div>
  </VayvaThemeProvider>
);
```

#### Step 3.2: Enhance IndustryNativeDashboard

**File:** `Frontend/merchant-admin/src/components/dashboard-v2/IndustryNativeDashboard.tsx`

**Add Design Category Props:**
```typescript
interface IndustryNativeDashboardProps {
  definition: IndustryDashboardDefinition;
  designCategory: DesignCategory;
  overviewData: DashboardOverviewData;
  alertsData: DashboardAlertsData;
  actionsData: DashboardActionsData;
  metricsData: DashboardMetricsData;
  isLoading?: boolean;
}

export function IndustryNativeDashboard({
  definition,
  designCategory,
  // ... other props
}: IndustryNativeDashboardProps) {
  // Apply design category styles
  const containerStyles = getDesignCategoryStyles(designCategory);
  
  return (
    <div 
      className={cn("space-y-6", containerStyles.className)}
      style={containerStyles.style}
    >
      {/* Header with industry branding */}
      <DashboardHeader
        title={definition.title}
        subtitle={definition.subtitle}
        designCategory={designCategory}
      />
      
      {/* KPI Blocks with design category styling */}
      <KPIBlocks
        metrics={metricsData?.metrics || []}
        designCategory={designCategory}
        maxSlots={tierCapabilities.maxKpiSlots}
      />
      
      {/* Industry-Native Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrimaryObjectHealth
          label={definition.primaryObjectLabel}
          items={overviewData?.primaryObjectHealth || []}
          designCategory={designCategory}
        />
        
        <LiveOperations
          title="Live Operations"
          items={overviewData?.liveOps || []}
          designCategory={designCategory}
        />
      </div>
      
      {/* Alerts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsList
          alerts={alertsData?.alerts || []}
          thresholds={definition.alertThresholds}
          designCategory={designCategory}
        />
        
        <SuggestedActionsList
          actions={actionsData?.actions || []}
          rules={definition.suggestedActionRules}
          designCategory={designCategory}
        />
      </div>
    </div>
  );
}
```

### Phase 4: Missing Industry Implementations (Week 6)

**Objective:** Add the 5 missing industry dashboard definitions

**File:** `Backend/core-api/src/config/industry-dashboard-definitions.ts`

**Add Missing Industries:**
```typescript
// 1. SaaS/Tech Dashboard
const SAAS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "saas",
  title: "SaaS Metrics",
  subtitle: "Track MRR, churn, and product adoption",
  primaryObjectLabel: "Subscription",
  defaultTimeHorizon: "month",
  sections: ["primary_object_health", "live_operations", "decision_kpis", "bottlenecks_alerts", "suggested_actions"],
  
  primaryObjectHealth: [
    { key: "mrr", label: "Monthly Recurring Revenue", format: "currency", icon: "TrendingUp" },
    { key: "activeSubscriptions", label: "Active Subscriptions", format: "number", icon: "Users" },
    { key: "churnRate", label: "Churn Rate", format: "percent", icon: "TrendingDown" },
  ],
  
  liveOps: [
    { key: "newTrialsToday", label: "New Trials", format: "number", icon: "UserPlus" },
    { key: "conversionsToday", label: "Conversions", format: "number", icon: "CheckCircle" },
    { key: "supportTickets", label: "Open Tickets", format: "number", icon: "MessageCircle" },
  ],
  
  alertThresholds: [
    { key: "churnRate", label: "High Churn", operator: "gte", value: 5, severity: "warning", message: "Churn rate at {value}% — investigate causes" },
    { key: "mrrGrowth", label: "Negative MRR Growth", operator: "lt", value: 0, severity: "critical", message: "MRR declining — urgent action needed" },
  ],
  
  suggestedActionRules: [
    { id: "reduce_churn", title: "Analyze churn reasons", reason: "Churn rate above target", conditionKey: "hasHighChurn", severity: "warning", href: "/dashboard/analytics/churn", icon: "PieChart" },
    { id: "upsell", title: "Identify upsell opportunities", reason: "Grow expansion revenue", conditionKey: "hasActiveUsers", severity: "info", href: "/dashboard/customers", icon: "ArrowUpCircle" },
  ],
  
  failureModes: ["High churn", "Stagnant growth", "Poor onboarding"],
};

// 2. Jobs/Careers Dashboard
const JOBS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "jobs",
  title: "Hiring Pipeline",
  subtitle: "Track open roles and candidate flow",
  primaryObjectLabel: "Job Posting",
  defaultTimeHorizon: "week",
  sections: ["primary_object_health", "live_operations", "decision_kpis", "bottlenecks_alerts", "suggested_actions"],
  
  primaryObjectHealth: [
    { key: "openRoles", label: "Open Positions", format: "number", icon: "Briefcase" },
    { key: "activeCandidates", label: "Active Candidates", format: "number", icon: "Users" },
    { key: "daysToFill", label: "Avg Days to Fill", format: "number", icon: "Clock" },
  ],
  
  liveOps: [
    { key: "applicationsToday", label: "New Applications", format: "number", icon: "FileText" },
    { key: "interviewsScheduled", label: "Interviews Today", format: "number", icon: "Calendar" },
    { key: "offersPending", label: "Offers Pending", format: "number", icon: "Mail" },
  ],
  
  alertThresholds: [
    { key: "daysToFill", label: "Slow Hiring", operator: "gte", value: 30, severity: "warning", message: "Avg {value} days to fill — consider expanding sourcing" },
    { key: "openRoles", label: "Critical Openings", operator: "gte", value: 10, severity: "info", message: "{count} open roles — team may be stretched" },
  ],
  
  suggestedActionRules: [
    { id: "review_candidates", title: "Review pending applications", reason: "Candidates waiting for review", conditionKey: "hasPendingApplications", severity: "warning", href: "/dashboard/candidates", icon: "Eye" },
    { id: "post_job", title: "Post to more job boards", reason: "Increase applicant pool", conditionKey: "hasLowApplications", severity: "info", href: "/dashboard/jobs/promote", icon: "Share" },
  ],
  
  failureModes: ["Slow time-to-hire", "Candidate drop-off", "Poor quality hires"],
};

// 3. Legal Services Dashboard
const LEGAL_DASHBOARD: IndustryDashboardDefinition = {
  industry: "legal",
  title: "Practice Management",
  subtitle: "Track cases, billable hours, and client matters",
  primaryObjectLabel: "Case/Matter",
  defaultTimeHorizon: "week",
  sections: ["primary_object_health", "live_operations", "decision_kpis", "bottlenecks_alerts", "suggested_actions"],
  
  primaryObjectHealth: [
    { key: "activeCases", label: "Active Cases", format: "number", icon: "Folder" },
    { key: "billableHours", label: "Billable Hours (MTD)", format: "number", icon: "Clock" },
    { key: "outstandingInvoices", label: "Outstanding", format: "currency", icon: "Receipt" },
  ],
  
  liveOps: [
    { key: "consultationsToday", label: "Consultations", format: "number", icon: "Phone" },
    { key: "deadlinesThisWeek", label: "Deadlines This Week", format: "number", icon: "AlertCircle" },
    { key: "documentsToReview", label: "Docs to Review", format: "number", icon: "FileCheck" },
  ],
  
  alertThresholds: [
    { key: "deadlinesThisWeek", label: "Upcoming Deadlines", operator: "gte", value: 5, severity: "warning", message: "{count} deadlines this week — review calendar" },
    { key: "outstandingInvoices", label: "Aged Receivables", operator: "gte", value: 30, severity: "warning", message: "{count} invoices 30+ days overdue" },
  ],
  
  suggestedActionRules: [
    { id: "send_invoices", title: "Send pending invoices", reason: "Unbilled time accumulating", conditionKey: "hasUnbilledTime", severity: "warning", href: "/dashboard/billing", icon: "Send" },
    { id: "prep_deadlines", title: "Prepare for upcoming deadlines", reason: "Critical dates approaching", conditionKey: "hasUpcomingDeadlines", severity: "critical", href: "/dashboard/calendar", icon: "Calendar" },
  ],
  
  failureModes: ["Missed deadlines", "Unbilled time", "Client conflicts"],
};

// 4. Fitness/Wellness Dashboard
const FITNESS_DASHBOARD: IndustryDashboardDefinition = {
  industry: "fitness",
  title: "Fitness Studio",
  subtitle: "Maximize class bookings and member retention",
  primaryObjectLabel: "Class/Membership",
  defaultTimeHorizon: "today",
  sections: ["primary_object_health", "live_operations", "decision_kpis", "bottlenecks_alerts", "suggested_actions"],
  
  primaryObjectHealth: [
    { key: "activeMembers", label: "Active Members", format: "number", icon: "Users" },
    { key: "classUtilization", label: "Class Utilization", format: "percent", icon: "Activity" },
    { key: "membershipRenewals", label: "Renewals This Month", format: "number", icon: "Repeat" },
  ],
  
  liveOps: [
    { key: "checkInsToday", label: "Check-ins Today", format: "number", icon: "LogIn" },
    { key: "classesToday", label: "Classes Today", format: "number", icon: "Dumbbell" },
    { key: "personalTraining", label: "PT Sessions", format: "number", icon: "User" },
  ],
  
  alertThresholds: [
    { key: "classUtilization", label: "Low Class Utilization", operator: "lte", value: 50, severity: "warning", message: "Classes at {value}% capacity — promote to fill" },
    { key: "cancellationsToday", label: "High Cancellations", operator: "gte", value: 5, severity: "info", message: "{count} cancellations today" },
  ],
  
  suggestedActionRules: [
    { id: "promote_classes", title: "Promote underbooked classes", reason: "Fill empty spots", conditionKey: "hasLowUtilization", severity: "info", href: "/dashboard/marketing", icon: "Megaphone" },
    { id: "retention", title: "Reach out to at-risk members", reason: "Prevent churn", conditionKey: "hasAtRiskMembers", severity: "warning", href: "/dashboard/members", icon: "Heart" },
  ],
  
  failureModes: ["Low class attendance", "Member churn", "Underutilized space"],
};

// 5. Healthcare Dashboard (if not already defined)
const HEALTHCARE_DASHBOARD: IndustryDashboardDefinition = {
  industry: "healthcare",
  title: "Practice Dashboard",
  subtitle: "Manage appointments, patients, and practice operations",
  primaryObjectLabel: "Patient/Appointment",
  defaultTimeHorizon: "today",
  sections: ["primary_object_health", "live_operations", "decision_kpis", "bottlenecks_alerts", "suggested_actions"],
  
  primaryObjectHealth: [
    { key: "scheduledAppointments", label: "Scheduled Today", format: "number", icon: "Calendar" },
    { key: "checkedIn", label: "Checked In", format: "number", icon: "CheckCircle" },
    { key: "onTimeRate", label: "On-Time Rate", format: "percent", icon: "Clock" },
  ],
  
  liveOps: [
    { key: "waitingRoom", label: "In Waiting Room", format: "number", icon: "Users" },
    { key: "avgWaitTime", label: "Avg Wait Time", format: "duration", icon: "Timer" },
    { key: "noShows", label: "No-Shows Today", format: "number", icon: "XCircle" },
  ],
  
  alertThresholds: [
    { key: "avgWaitTime", label: "Long Wait Times", operator: "gte", value: 20, severity: "warning", message: "Avg wait {value} min — consider adding staff" },
    { key: "noShows", label: "High No-Show Rate", operator: "gte", value: 3, severity: "info", message: "{count} no-shows — send reminders" },
  ],
  
  suggestedActionRules: [
    { id: "send_reminders", title: "Send appointment reminders", reason: "Reduce no-shows", conditionKey: "hasUpcomingAppointments", severity: "info", href: "/dashboard/reminders", icon: "Bell" },
    { id: "review_lab", title: "Review pending lab results", reason: "Results awaiting review", conditionKey: "hasPendingLabs", severity: "warning", href: "/dashboard/labs", icon: "FileText" },
  ],
  
  failureModes: ["Long wait times", "No-shows", "Schedule gaps"],
};

// Add to DEFINITIONS export
export const DEFINITIONS: Record<string, IndustryDashboardDefinition> = {
  // ... existing definitions
  saas: SAAS_DASHBOARD,
  jobs: JOBS_DASHBOARD,
  legal: LEGAL_DASHBOARD,
  fitness: FITNESS_DASHBOARD,
  healthcare: HEALTHCARE_DASHBOARD,
};
```

### Phase 5: Real-Time WebSocket Integration (Week 7)

**Objective:** Add live updates for time-sensitive industries

#### Step 5.1: Backend WebSocket Server

**File:** `Backend/core-api/src/websocket/dashboard-ws.ts`

```typescript
import { WebSocketServer, WebSocket } from "ws";
import { verify } from "jsonwebtoken";

interface DashboardClient extends WebSocket {
  merchantId?: string;
  industrySlug?: string;
  subscribedChannels: Set<string>;
}

export class DashboardWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<DashboardClient>> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ server, path: "/ws/dashboard" });
    
    this.wss.on("connection", (ws: DashboardClient, req) => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: DashboardClient, req: any) {
    const token = this.extractToken(req);
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as any;
      ws.merchantId = decoded.merchantId;
      ws.industrySlug = decoded.industrySlug;
      ws.subscribedChannels = new Set();
      
      // Subscribe to merchant-specific channel
      this.subscribeToChannel(ws, `merchant:${ws.merchantId}`);
      
      // Subscribe to industry channel for shared updates
      if (ws.industrySlug) {
        this.subscribeToChannel(ws, `industry:${ws.industrySlug}`);
      }
      
      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      });
      
      ws.on("close", () => {
        this.removeClient(ws);
      });
      
    } catch (error) {
      ws.close(4002, "Invalid token");
    }
  }

  public broadcastToIndustry(industry: string, event: string, data: any) {
    const channelKey = `industry:${industry}`;
    const clients = this.clients.get(channelKey);
    
    if (clients) {
      const message = JSON.stringify({ event, data, timestamp: Date.now() });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  public broadcastToMerchant(merchantId: string, event: string, data: any) {
    const channelKey = `merchant:${merchantId}`;
    const clients = this.clients.get(channelKey);
    
    if (clients) {
      const message = JSON.stringify({ event, data, timestamp: Date.now() });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }
}

// Export singleton
export const dashboardWS = new DashboardWebSocketServer();
```

#### Step 5.2: Frontend WebSocket Hook

**File:** `Frontend/merchant-admin/src/hooks/useDashboardWebSocket.ts`

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: number;
}

export function useDashboardWebSocket(
  industrySlug: string,
  onMessage: (message: WebSocketMessage) => void
) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!token) return;
    
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/dashboard?token=${token}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log(`Connected to dashboard WebSocket`);
    };
    
    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      onMessage(message);
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    ws.onclose = () => {
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
    
    wsRef.current = ws;
  }, [token, onMessage]);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    sendMessage: (data: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    }
  };
}
```

### Phase 6: Testing & Rollout (Week 8-10)

**Testing Checklist:**
- [ ] All 22 industries render with correct design category
- [ ] Onboarding industry selection applies theme immediately
- [ ] KPI gating works across all plan tiers
- [ ] WebSocket updates work for Food/Restaurant (KDS), Events, Automotive
- [ ] Theme switching persists in localStorage
- [ ] Pro users can override design category
- [ ] Legacy dashboard fallback works
- [ ] Mobile responsive design categories

**Rollout Strategy:**
1. **Week 8:** Internal testing with all 22 industries
2. **Week 9:** Beta with 50 merchants (2-3 per industry)
3. **Week 10:** Gradual rollout 10% → 50% → 100%

---

## SUMMARY OF CHANGES

### What We're Actually Doing (Not Rebuilding):

✅ **Extending existing industry archetype system** with design categories  
✅ **Connecting onboarding** to apply themes automatically  
✅ **Enhancing current dashboard components** with design category props  
✅ **Adding 5 missing industry definitions** to existing 17  
✅ **Implementing WebSocket** for real-time updates  

### What We're NOT Doing:

❌ NOT rebuilding the entire dashboard system (it's already good)  
❌ NOT creating 22 new dashboard components (enhancing existing)  
❌ NOT replacing the template system (it's comprehensive)  
❌ NOT changing the API architecture (it's mature)  

### Files to Modify (Not Create From Scratch):

1. `Frontend/merchant-admin/src/config/industry-archetypes.ts` - Add design category mapping
2. `Frontend/merchant-admin/src/config/dashboard-design-categories.ts` - NEW (small config file)
3. `Frontend/merchant-admin/src/components/vayva-ui/VayvaThemeProvider.tsx` - Add industry awareness
4. `Frontend/merchant-admin/src/app/(dashboard)/dashboard/page.tsx` - Add design category resolution
5. `Frontend/merchant-admin/src/components/dashboard-v2/IndustryNativeDashboard.tsx` - Add design category props
6. `Backend/core-api/src/config/industry-dashboard-definitions.ts` - Add 5 missing industries
7. `Backend/core-api/src/websocket/dashboard-ws.ts` - NEW (WebSocket server)
8. `Frontend/merchant-admin/src/hooks/useDashboardWebSocket.ts` - NEW (WebSocket hook)

---

## NEXT STEPS

1. **Review this plan** and approve approach
2. **Create feature branch** for migration work
3. **Begin Phase 1** (Design Category Integration)
4. **Set up staging environment** for testing
5. **Schedule beta tester recruitment**

---

*Document Version: 2.0*  
*Based on comprehensive codebase audit*  
*Ready for implementation*
