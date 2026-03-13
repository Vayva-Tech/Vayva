# VAYVA DASHBOARD MIGRATION PLAN
## Transitioning from Legacy to Industry-Specific Dashboards

**Document Version:** 1.0  
**Created:** March 10, 2026  
**Status:** Ready for Implementation  

---

## EXECUTIVE SUMMARY

This document outlines the complete migration strategy from the current generic dashboard system to the new **Industry-Native Dashboard** architecture that provides personalized experiences for all 22 industries while maintaining backward compatibility and leveraging existing Pro features.

### Current State Analysis

**Existing Infrastructure:**
- ✅ Legacy dashboard with generic KPIs (`DashboardLegacyContent.tsx`)
- ✅ Dashboard V2 with modern UI (`DashboardV2Content.tsx`)
- ✅ Pro Dashboard V2 for advanced tier (`ProDashboardV2.tsx`)
- ✅ Industry configuration system (`industry-dashboard-definitions.ts`)
- ✅ Onboarding flow with step tracking (`DynamicOnboarding.tsx`, `ai-onboarding-flow.tsx`)
- ✅ Vayva UI component library (Cards, Buttons, ThemeProvider)
- ✅ API aggregation layer (`/api/dashboard/aggregate`)

**What Needs to Change:**
- ❌ No visual design category implementation(Glass, Dark, Bold, Natural)
- ❌ Missing 22 industry-specific dashboard implementations
- ❌ No connection between onboarding industry selection and dashboard rendering
- ❌ Generic KPIs instead of industry-native metrics
- ❌ No WebSocket real-time updates for time-sensitive industries

---

## PHASE 1: FOUNDATION PREPARATION (Week 1-2)

### Step 1.1: Audit Existing Dashboard Components

**Action Items:**
1. Inventory all current dashboard components
2. Identify reusable logic vs. industry-specific needs
3. Map existing API endpoints to new dashboard requirements

**Files to Review:**
```
Frontend/merchant-admin/src/components/dashboard-v2/
├── DashboardV2Content.tsx         # Base template - KEEP & EXTEND
├── DashboardLegacyContent.tsx     # Legacy fallback - DEPRECATE (Phase 4)
├── ProDashboardV2.tsx             # Pro tier- ENHANCE with industry specs
├── IndustryNativeSections.tsx     # Foundation - EXPAND to 22 industries
└── KPIBlocks.tsx                  # Reusable - ADAPT per industry

Frontend/merchant-admin/src/app/(dashboard)/dashboard/
└── page.tsx                       # Main router - UPDATE logic
```

**Decision Matrix:**
| Component | Action | Reason |
|-----------|--------|--------|
| `DashboardV2Content` | Keep & Extend | Solid foundation, supports industry variants |
| `ProDashboardV2` | Enhance | Add industry-native sections to Pro tier |
| `IndustryNativeSections` | Expand | Currently supports 8 industries, need 22 |
| `DashboardLegacyContent` | Deprecate | Replace with V2 architecture |
| `KPIBlocks`, `TodosAlerts` | Reuse | Universal components, industry-agnostic |

### Step 1.2: Create Industry Design Category System

**File to Create:** `Frontend/merchant-admin/src/config/dashboard-design-categories.ts`

```typescript
export type DesignCategory = 'signature' | 'glass' | 'bold' | 'dark' | 'natural';

export const INDUSTRY_DESIGN_CATEGORIES: Record<string, DesignCategory> = {
  // Signature Clean (10)
  retail: 'signature',
  fashion: 'signature', // Override with 'glass' for Premium Fashion
  electronics: 'signature',
  beauty: 'signature',
  grocery: 'signature',
  education: 'signature',
  services: 'signature',
  wholesale: 'signature',
  marketplace: 'signature',
  blog_media: 'signature',
  professional_services: 'signature',
  
  // Premium Glass (5)
  fashion_premium: 'glass',
  beauty_premium: 'glass',
  real_estate: 'glass',
  creative_portfolio: 'glass',
  salon_spa: 'glass',
  
  // Modern Dark (5)
  automotive: 'dark',
  saas_tech: 'dark',
  kitchen_kds: 'dark',
  nightlife: 'dark', // Can also be 'bold'
  digital_products: 'dark',
  
  // Bold Energy (2)
  restaurant_foh: 'bold',
  events: 'bold',
  
  // Natural Warmth (5)
  travel_hospitality: 'natural',
  nonprofit: 'natural',
  wellness_fitness: 'natural',
  food_market: 'natural',
  bar_lounge: 'natural',
};

export const getDesignCategoryForIndustry = (
  industrySlug: string,
  merchantPlan?: string
): DesignCategory => {
  const base = INDUSTRY_DESIGN_CATEGORIES[industrySlug] || 'signature';
  
  // Upgrade fashion/beauty to glass for Pro merchants
  if (merchantPlan === 'PRO' || merchantPlan === 'ADVANCED') {
   if (industrySlug === 'fashion') return 'glass';
   if (industrySlug === 'beauty') return 'glass';
  }
  
  return base;
};
```

### Step 1.3: Update Vayva Theme Provider

**File to Modify:** `Frontend/merchant-admin/src/components/vayva-ui/VayvaThemeProvider.tsx`

**Current State:** Already has theme context with 5 categories and 6 presets

**Required Changes:**
```typescript
// Add industry-aware theme initialization
export function VayvaThemeProvider({ 
  children, 
  industrySlug,
  initialCategory 
}: VayvaThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeContextType>(() => {
    // Load from localStorage or initialize based on industry
   const saved = localStorage.getItem('vayva-theme');
    
   if (saved) {
     return JSON.parse(saved);
    }
    
    // Initialize based on industry design category
   const designCategory = getDesignCategoryForIndustry(industrySlug);
    
   return {
     category: designCategory,
     preset: getDefaultPresetForCategory(designCategory),
      industry: industrySlug,
    };
  });
  
  // ... rest of existing logic
}
```

---

## PHASE 2: ONBOARDING INTEGRATION (Week 3)

### Step 2.1: Connect Onboarding to Dashboard Selection

**Current Flow:**
```
User Signs Up → DynamicOnboarding → Complete Steps → Dashboard
                          ↓
                  Industry Selection(in Settings)
```

**New Flow:**
```
User Signs Up → Industry Selection(Onboarding Step 1) → Personalized Dashboard
                          ↓
              Design Category Applied Automatically
```

**File to Modify:** `Frontend/merchant-admin/src/components/onboarding/DynamicOnboarding.tsx`

**Add Industry Selection Step:**
```typescript
const INDUSTRY_SELECTION_STEP: OnboardingStep = {
  id: "industry",
  title: "Choose Your Industry",
  description: "We'll customize your dashboard for your specific business needs",
  action: "Select Industry",
  path: "/onboarding/industry-select",
  completed: false,
  required: true,
  estimatedTime: "1 min",
};

// Insert as first step
const UPDATED_STEPS = [
  INDUSTRY_SELECTION_STEP,
  ...DEFAULT_STEPS.map(step => ({
    ...step,
   path: step.path, // Keep existing paths
    // Add industry-specific descriptions
    description: enhanceDescriptionWithIndustry(step.description, selectedIndustry)
  }))
];
```

### Step 2.2: Create Industry Selection Component

**File to Create:** `Frontend/merchant-admin/src/components/onboarding/IndustrySelectionModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Search } from "@vayva/ui";
import { INDUSTRY_CONFIG } from "@/config/industry";
import type { IndustrySlug } from "@/lib/templates/types";

interface IndustrySelectionModalProps {
  onComplete: (industrySlug: IndustrySlug) => void;
  onCancel?: () => void;
}

export function IndustrySelectionModal({ 
  onComplete, 
  onCancel 
}: IndustrySelectionModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug | null>(null);
  const router= useRouter();

  const filteredIndustries = Object.entries(INDUSTRY_CONFIG)
    .filter(([_, config]) => 
     config.displayName.toLowerCase().includes(search.toLowerCase()) ||
     config.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort(([_, a], [__, b]) => {
      // Prioritize common industries
     const priority = ['retail', 'fashion', 'restaurant', 'services'];
     const aPriority = priority.indexOf(a.slug as IndustrySlug);
     const bPriority= priority.indexOf(b.slug as IndustrySlug);
      
     if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
     if (aPriority !== -1) return -1;
     if (bPriority !== -1) return 1;
      
     return a.displayName.localeCompare(b.displayName);
    });

  const handleSelect = async () => {
   if (!selectedIndustry) return;
    
   try {
      // Save industry selection to backend
      await fetch("/api/onboarding/industry", {
       method: "POST",
       body: JSON.stringify({ industrySlug: selectedIndustry }),
      });
      
      onComplete(selectedIndustry);
      
      // Show success message
     toast.success("Industry selected! Customizing your dashboard...");
      
    } catch (error) {
     toast.error("Failed to save industry selection");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-2">
            What type of business do you run?
          </h2>
          <p className="text-muted-foreground">
            This will customize your dashboard, product catalog, and order management
          </p>
          
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Search industries..."
           className="mt-4"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto max-h-[60vh]">
          {filteredIndustries.map(([slug, config]) => (
            <button
              key={slug}
              onClick={() => setSelectedIndustry(slug as IndustrySlug)}
             className={`text-left p-4 rounded-xl border transition-all ${
               selectedIndustry === slug
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {/* Use Phosphor icon based on industry category */}
                  <Icon name={getIndustryIcon(config.category)} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">{config.displayName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {config.shortDescription}
                  </p>
                </div>
              </div>
              
              {config.features?.slice(0, 3).map((feature) => (
                <div key={feature} className="flex items-center gap-2 mt-2">
                  <Check className="w-3 h-3 text-status-success" />
                  <span className="text-xs text-text-secondary">{feature}</span>
                </div>
              ))}
            </button>
          ))}
        </div>
        
        <div className="p-6 border-t flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Skip for Now
          </Button>
          <Button
            onClick={handleSelect}
           disabled={!selectedIndustry}
          >
            Continue with {selectedIndustry ? INDUSTRY_CONFIG[selectedIndustry]?.displayName: "Industry"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

### Step 2.3: Update Onboarding Completion Logic

**File to Modify:** `Frontend/merchant-admin/src/app/onboarding/page.tsx`

```typescript
export default function OnboardingPage() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug | null>(null);
  const router= useRouter();

  const handleIndustryComplete = (industrySlug: IndustrySlug) => {
   setSelectedIndustry(industrySlug);
   markStepComplete("industry");
  };

  const handleAllStepsComplete = async () => {
    // All onboarding steps completed
    // Redirect to personalized dashboard
   router.push("/dashboard");
  };

  return (
    <OnboardingLayout>
      {selectedIndustry && (
        <IndustrySelectionModal
          onComplete={handleIndustryComplete}
        />
      )}
      
      <DynamicOnboarding
        onComplete={handleAllStepsComplete}
       selectedIndustry={selectedIndustry}
      />
    </OnboardingLayout>
  );
}
```

---

## PHASE 3: DASHBOARD RENDERING LOGIC (Week 4-5)

### Step 3.1: Update Main Dashboard Page Router

**File to Modify:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/page.tsx`

**Current Logic (Lines 102-107):**
```typescript
const isIndustryNative = hasIndustryNativeDashboard(industrySlugForFetch);
const { data: industryOverviewData, isLoading: industryOverviewLoading } =
  useSWR<DashboardIndustryOverviewData>(
    isIndustryNative ? "/api/dashboard/industry-overview" : null,
   fetcher<DashboardIndustryOverviewData>,
  );
```

**Enhanced Logic:**
```typescript
// Import design category system
import { getDesignCategoryForIndustry } from "@/config/dashboard-design-categories";
import { VayvaThemeProvider } from "@/components/vayva-ui/VayvaThemeProvider";

// Inside DashboardPage component
const designCategory = useMemo(() => {
  return getDesignCategoryForIndustry(
    industrySlugForFetch,
   mePayload?.merchant?.plan
  );
}, [industrySlugForFetch, mePayload?.merchant?.plan]);

// Wrap dashboard content with theme provider
return (
  <VayvaThemeProvider 
    initialCategory={designCategory}
    industrySlug={industrySlugForFetch}
  >
    {renderDashboardContent()}
  </VayvaThemeProvider>
);

function renderDashboardContent() {
  // Check if industry has native dashboard implementation
  const nativeDefinition = getIndustryDashboardDefinition(industrySlugForFetch);
  
  // Determine which dashboard component to render
  if (dashboardPlanTier === "advanced") {
    // Pro users get enhanced ProDashboardV2 with industry sections
   return (
      <ProDashboardV2
        industryDefinition={nativeDefinition}
        designCategory={designCategory}
      />
    );
  }
  
  if (nativeDefinition && isDashboardV2Enabled) {
    // Industry-native dashboard with design category styling
   return (
      <IndustryNativeDashboard
        definition={nativeDefinition}
        designCategory={designCategory}
        overviewData={overviewData}
        // ... pass all required props
      />
    );
  }
  
  if (isDashboardV2Enabled) {
    // Standard DashboardV2 with industry cosmetics
   return <DashboardV2Content {...v2Props} />;
  }
  
  // Fallback to legacy (temporary, remove in Phase 4)
  return <DashboardLegacyContent {...legacyProps} />;
}
```

### Step 3.2: Create IndustryNativeDashboard Component

**File to Create:** `Frontend/merchant-admin/src/components/dashboard-v2/IndustryNativeDashboard.tsx`

```typescript
"use client";

import { useMemo } from "react";
import { cn } from "@vayva/ui";
import type { IndustryDashboardDefinition } from "@/config/industry-dashboard-definitions";
import type { DesignCategory } from "@/config/dashboard-design-categories";
import {
  PrimaryObjectHealth,
  LiveOperations,
  AlertsList,
  SuggestedActionsList,
} from "./IndustryNativeSections";
import { KPIBlocks } from "./KPIBlocks";
import { TodosAlerts } from "./TodosAlerts";
import { QuickActions } from "./QuickActions";

interface IndustryNativeDashboardProps {
  definition: IndustryDashboardDefinition;
  designCategory: DesignCategory;
  overviewData: any;
  alertsData: any;
  actionsData: any;
  metricsData: any;
  isLoading?: boolean;
}

export function IndustryNativeDashboard({
  definition,
  designCategory,
  overviewData,
  alertsData,
  actionsData,
  metricsData,
  isLoading,
}: IndustryNativeDashboardProps) {
  // Apply design category CSS class
  const containerClass = cn(
    "space-y-6 transition-colors duration-300",
    {
      "bg-gradient-to-br from-gray-50 to-white": designCategory === "signature",
      "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50": designCategory === "glass",
      "bg-gray-900 text-gray-100": designCategory === "dark",
      "bg-gradient-to-br from-red-50 to-orange-50": designCategory === "bold",
      "bg-gradient-to-br from-yellow-50 to-amber-50": designCategory === "natural",
    }
  );

  // Extract data for each section based on definition
  const primaryObjectHealthData = useMemo(() => {
   if (!definition.sections.includes("primary_object_health")) return null;
    
   return {
      label: definition.primaryObjectLabel,
     topSelling: overviewData?.topSellingItems || [],
     lowStock: overviewData?.lowStockItems || [],
      deadStock: overviewData?.deadStockItems || [],
    };
  }, [definition, overviewData]);

  const liveOpsData = useMemo(() => {
   if (!definition.sections.includes("live_operations")) return null;
    
   return definition.liveOps.map((field) => ({
      key: field.key,
      label: field.label,
      value: overviewData?.[field.key] ?? 0,
     icon: field.icon || "Activity",
      emptyText: field.emptyText,
    }));
  }, [definition, overviewData]);

  const alertsList = useMemo(() => {
   return alertsData?.alerts?.filter((alert: any) => {
     const threshold = definition.alertThresholds.find(
        (t) => t.key === alert.key
      );
     return threshold && evaluateThreshold(alert.value, threshold);
    }) || [];
  }, [definition, alertsData]);

  const suggestedActions = useMemo(() => {
   return actionsData?.actions?.filter((action: any) => {
     const rule = definition.suggestedActionRules.find(
        (r) => r.id === action.ruleId
      );
     return rule && evaluateCondition(action.conditionValue, rule.conditionKey);
    }) || [];
  }, [definition, actionsData]);

  return (
    <div 
     className={containerClass}
      data-design-category={designCategory}
    >
      {/* Header with industry branding */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{definition.title}</h1>
        <p className="text-text-secondary">{definition.subtitle}</p>
      </div>

      {/* KPI Blocks - Top Metrics */}
      <KPIBlocks
       metrics={metricsData?.metrics || []}
        designCategory={designCategory}
      />

      {/* Industry-Native Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Object Health */}
        {primaryObjectHealthData && (
          <PrimaryObjectHealth
            label={primaryObjectHealthData.label}
           topSelling={primaryObjectHealthData.topSelling}
           lowStock={primaryObjectHealthData.lowStock}
            deadStock={primaryObjectHealthData.deadStock}
            isLoading={isLoading}
          />
        )}

        {/* Live Operations */}
        {liveOpsData && (
          <LiveOperations
           title="Live Operations"
            items={liveOpsData}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottlenecks & Alerts */}
        <AlertsList
          alerts={alertsList}
          isLoading={isLoading}
        />

        {/* Suggested Actions */}
        <SuggestedActionsList
         actions={suggestedActions}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Section: Todos & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Recent Activity/ Pipeline */}
        </div>
        <div>
          {/* Tasks & Reminders */}
          <TodosAlerts tasks={[]} alerts={[]} />
        </div>
      </div>
    </div>
  );
}
```

### Step 3.3: Implement Design Category Styling

**File to Modify:** `Frontend/merchant-admin/src/styles/vayva-design-system.css`

**Add Design Category Specific Styles:**
```css
/* ============================================
   DESIGN CATEGORY THEME OVERRIDES
   Applied via [data-design-category] attribute
   ============================================ */

/* Premium Glass Category */
[data-design-category="glass"] {
  --card-bg: rgba(255, 255, 255, 0.85);
  --card-border: rgba(255, 255, 255, 0.4);
  --backdrop-blur: 20px;
  --shadow-card: 0 8px 32px rgba(236, 72, 153, 0.1);
  --gradient-accent: linear-gradient(135deg, #E0BFB8 0%, #F7E7CE 100%);
}

[data-design-category="glass"] .vayva-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: var(--shadow-card);
}

/* Modern Dark Category */
[data-design-category="dark"] {
  --card-bg: rgba(30, 30, 30, 0.95);
  --card-border: rgba(99, 102, 241, 0.2);
  --text-primary: #E5E7EB;
  --text-secondary: #9CA3AF;
  --neon-glow: 0 0 10px rgba(99, 102, 241, 0.5);
}

[data-design-category="dark"] .vayva-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: var(--neon-glow);
}

/* Bold Energy Category */
[data-design-category="bold"] {
  --card-bg: #FFFFFF;
  --card-border: 2px solid #000000;
  --shadow-solid: 4px 4px 0px #000000;
  --shadow-hover: 6px 6px 0px #000000;
}

[data-design-category="bold"] .vayva-card {
  border: 2px solid #000000;
  box-shadow: var(--shadow-solid);
  transition: box-shadow 200ms ease;
}

[data-design-category="bold"] .vayva-card:hover {
  box-shadow: var(--shadow-hover);
}

/* Natural Warmth Category */
[data-design-category="natural"] {
  --card-bg: #FFFFFF;
  --card-border: 1px solid #E7E5B4;
  --bg-gradient: linear-gradient(180deg, #FEFCE8 0%, #FEF3C7 100%);
  --accent-color: #D97706;
}

[data-design-category="natural"] .vayva-card {
  border-radius: 16px;
  border: 1px solid #E7E5B4;
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.08);
}
```

---

## PHASE 4: API INTEGRATION (Week 6-7)

### Step 4.1: Create Industry-Specific API Endpoints

Follow the API integration strategy from `API_INTEGRATION_STRATEGY_COMPLETE.md`:

**Tier 1: Universal Endpoints** (Already exist- no changes needed)
```
GET /api/analytics/sales
GET /api/inventory/items
GET /api/orders
```

**Tier 2: Configurable Endpoints** (Add industry query params)
```typescript
// Backend/core-api/src/controllers/products.controller.ts
GET /api/products?industry=fashion&category=dresses&size=M
GET /api/products?industry=restaurant&category=menu-items
```

**Tier 3: Industry-Specific Endpoints** (Create new routes)
```typescript
// Backend/core-api/src/routes/industries/index.ts
import { Router } from 'express';
const router= Router();

router.use('/:industry', (req, res, next) => {
  req.industry = req.params.industry;
  next();
});

// Fashion endpoints
router.use('/fashion', fashionRoutes);
// Restaurant endpoints
router.use('/restaurant', restaurantRoutes);
// ... 20 more industries

export default router;
```

### Step 4.2: Implement Real-Time WebSocket Updates

**Backend Setup:** `Backend/core-api/src/websocket/server.ts`

```typescript
import WebSocket, { WebSocketServer } from 'ws';

export class DashboardWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ server, path: '/ws/dashboard' });
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: WebSocket, req: any) {
    // Authenticate and subscribe to industry channel
   const industry = this.extractIndustryFromToken(req);
   const channelKey = `industry:${industry}`;
    
   if (!this.clients.has(channelKey)) {
      this.clients.set(channelKey, new Set());
    }
    
    this.clients.get(channelKey)!.add(ws);
    
    ws.on('close', () => {
      this.clients.get(channelKey)?.delete(ws);
    });
  }

  public broadcastToIndustry(industry: string, data: any) {
   const channelKey = `industry:${industry}`;
   const clients = this.clients.get(channelKey);
    
   if (clients && clients.size > 0) {
     const message= JSON.stringify(data);
     clients.forEach(client => {
       if (client.readyState === WebSocket.OPEN) {
         client.send(message);
        }
      });
    }
  }
}
```

**Frontend Hook:** `Frontend/merchant-admin/src/hooks/useIndustryWebSocket.ts`

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export function useIndustryWebSocket(
  industrySlug: string,
  onMessage: (data: any) => void
) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
   if (!token) return;

   const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/dashboard?token=${token}&industry=${industrySlug}`;
   const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
     console.log(`Connected to ${industrySlug} dashboard channel`);
      
      // Subscribe to specific channels
      ws.send(JSON.stringify({
       action: "subscribe",
       channels: ["orders-live", "inventory-alerts", "kpi-updates"]
      }));
    };

    ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (error) => {
     console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
     console.log("Disconnected from dashboard channel");
      
      // Attempt reconnection after 3 seconds
     setTimeout(() => {
        // Reconnect logic
      }, 3000);
    };

    wsRef.current= ws;

   return () => {
     if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, industrySlug, onMessage]);

  return {
   sendMessage: (data: any) => {
     if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    }
  };
}
```

---

## PHASE 5: TESTING & VALIDATION (Week 8)

### Step 5.1: Create Testing Checklist

**Functional Testing:**
- [ ] Industry selection during onboarding saves correctly
- [ ] Dashboard renders with correct design category
- [ ] All 22 industry dashboards display appropriate KPIs
- [ ] WebSocket updates work for time-sensitive industries (KDS, Events)
- [ ] Theme switching works within each design category
- [ ] Pro tier features available for advanced plan merchants
- [ ] Legacy dashboard fallback works for unsupported industries

**Visual Testing:**
- [ ] Glassmorphism effect applies correctly (Premium Glass category)
- [ ] Dark mode contrast ratios meet WCAG 2.1 AA (Modern Dark category)
- [ ] Bold borders and shadows render properly (Bold Energy category)
- [ ] Warm color palette displays consistently (Natural Warmth category)
- [ ] Clean minimalist design maintains brand consistency (Signature Clean)

**Performance Testing:**
- [ ] Dashboard loads in under 2 seconds
- [ ] WebSocket messages don't cause excessive re-renders
- [ ] API aggregation reduces payload size by 40%+
- [ ] Redis caching reduces database queries by 60%+

### Step 5.2: Rollout Strategy

**Week 1-2: Alpha Testing**
- Internal team testing with all 22 industries
- Fix critical bugs and performance issues
- Validate design category implementations

**Week 3-4: Beta Testing**
- Invite 50 merchants from each industry vertical (1,100 total)
- Collect feedback via in-app surveys
- Monitor analytics for usage patterns

**Week 5-6: Gradual Rollout**
- Enable for 10% of new signups
- Monitor error rates and performance metrics
- Prepare rollback plan if issues detected

**Week 7-8: Full Launch**
- Enable for all new merchants
- Email existing merchants about upgrade option
- Create migration guide for existing merchants

---

## PHASE 6: DEPRECATION OF LEGACY DASHBOARD (Week 9-10)

### Step 6.1: Migration Path for Existing Merchants

**Email Campaign:**
```
Subject: Your dashboard is getting an upgrade! 🎉

Hi [Merchant Name],

Great news! Your [Industry] dashboard is being upgraded with:
✨ A fresh new design tailored to your industry
📊 Smarter metrics that matter to your business
⚡ Real-time updates for time-sensitive operations

The upgrade will happen automatically on [Date].

Want to preview it now? [Preview Button]

Questions? Reply to this email or visit our help center.

The Vayva Team
```

**In-App Banner:**
```typescript
// Show 2 weeks before migration
{showMigrationBanner && (
  <Banner variant="info">
    <div className="flex items-center justify-between">
      <div>
        <strong>Your dashboard is getting upgraded!</strong>
        <p className="text-sm">
          On {migrationDate}, you'll see a new {industryName}-specific design.
        </p>
      </div>
      <Button onClick={previewUpgrade}>
        Preview Upgrade
      </Button>
    </div>
  </Banner>
)}
```

### Step 6.2: Remove Legacy Code

**After 95%+ migration rate:**

1. **Deprecate DashboardLegacyContent:**
```typescript
// Add deprecation warning
console.warn(
  "DashboardLegacyContent is deprecated and will be removed in v3.0. " +
  "Please migrate to DashboardV2Content or IndustryNativeDashboard."
);
```

2. **Update Dashboard Page Router:**
```typescript
// Remove legacy fallback
if (isDashboardV2Enabled) {
  return <DashboardV2Content {...props} />;
}

// No else clause - force V2
throw new Error("Dashboard V2 is required. Please update your account settings.");
```

3. **Delete Legacy Files:**
```bash
# After confirming no usage in analytics
rm Frontend/merchant-admin/src/components/dashboard-v2/DashboardLegacyContent.tsx
rm Frontend/merchant-admin/src/components/dashboard/overview/DashboardCharts.tsx
```

---

## SUCCESS METRICS

### Adoption Metrics
- **Target:** 80% of merchants using industry-native dashboards within 3 months
- **Measurement:** Analytics tracking `dashboard_variant` and `design_category` fields

### Performance Metrics
- **Target:**Dashboard load time < 2 seconds (down from current 3.5s average)
- **Measurement:** Web Vitals tracking LCP (Largest Contentful Paint)

### Satisfaction Metrics
- **Target:** 4.5/5 average rating from post-migration surveys
- **Measurement:**In-app NPS surveys sent 7 days after migration

### Business Metrics
- **Target:** 15% increase in daily active users (DAU)
- **Target:** 20% increase in feature discovery (merchants using 3+ dashboard features)
- **Measurement:** Mixpanel event tracking

---

## RISK MITIGATION

### Risk 1: Merchant Confusion During Transition
**Mitigation:**
- Clear communication 2 weeks in advance
- Interactive tour on first login to new dashboard
- Easy "Switch Back" button for first 7 days (then remove)

### Risk 2: Performance Degradation
**Mitigation:**
- Load testing with 10x expected traffic before launch
- Redis caching layer for expensive queries
- Gradual rollout to catch issues early

### Risk 3: Industry Misclassification
**Mitigation:**
- Allow merchants to change industry in Settings
- Provide "Other" option with generic dashboard
- Manual review for edge cases (multi-industry businesses)

### Risk 4: Browser Compatibility Issues
**Mitigation:**
- Test on top 10 browsers by market share
- Polyfills for older browsers (backdrop-filter support)
- Graceful degradation for unsupported features

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Week 1-2)
- [ ] Create `dashboard-design-categories.ts` configuration
- [ ] Update `VayvaThemeProvider` with industry awareness
- [ ] Audit existing components and mark for reuse/deletion
- [ ] Setup project board with all tasks

### Phase 2: Onboarding (Week 3)
- [ ] Create `IndustrySelectionModal` component
- [ ] Update `DynamicOnboarding` with industry step
- [ ] Modify onboarding completion flow
- [ ] Add backend endpoint `/api/onboarding/industry`

### Phase 3: Dashboard Rendering (Week 4-5)
- [ ] Create `IndustryNativeDashboard` component
- [ ] Implement design category CSS overrides
- [ ] Update main dashboard page router logic
- [ ] Create 22 industry-specific section configurations

### Phase 4: API Integration (Week 6-7)
- [ ] Implement Tier 3 industry-specific endpoints
- [ ] Setup WebSocket server for real-time updates
- [ ] Create frontend WebSocket hooks
- [ ] Add Redis caching for expensive queries

### Phase 5: Testing (Week 8)
- [ ] Functional testing checklist complete
- [ ] Visual testing across all design categories
- [ ] Performance optimization pass
- [ ] Beta tester feedback incorporated

### Phase 6: Launch (Week 9-10)
- [ ] Email campaign sent to existing merchants
- [ ] In-app banners activated
- [ ] Gradual rollout to 10% → 50% → 100%
- [ ] Legacy dashboard deprecation started

---

## CONCLUSION

This migration plan provides a structured approach to transitioning from generic dashboards to industry-native experiences while maintaining backward compatibility and minimizing disruption to existing merchants.

**Key Success Factors:**
1. **Clear Communication:** Keep merchants informed throughout the process
2. **Gradual Rollout:** Catch issues early with percentage-based launches
3. **Performance First:**Ensure new dashboards are faster than legacy
4. **Flexibility:** Allow merchants to switch industries if misclassified
5. **Data-Driven Decisions:** Use analytics to guide prioritization

**Next Steps:**
1. Review and approve this plan
2. Create detailed technical specifications for each phase
3. Assign team members to work streams
4. Begin Phase 1 implementation

---

*Document prepared by: Vayva Development Team*  
*Last updated: March 10, 2026*
