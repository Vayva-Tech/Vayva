# 🧪 FRONTEND ENGINEER - COMPONENT LIBRARY & INTEGRATION
**CRISIS MODE - FINAL SPRINT** | **DEADLINE: 24 HOURS** | **P0: BLOCKING REVENUE**

---

## 📋 YOUR MISSION

You are responsible for **COMPONENT RELIABILITY**, **SETTINGS INTEGRATION**, and **TEMPLATE GALLERY WIRING**. The UI/UX designer makes it beautiful, you make it WORK.

**YOUR JOB:** Every button must work, every form must save, every template must be launchable.

---

## 🔍 CURRENT STATE AUDIT

### SETTINGS SYSTEM STATUS:
```
✅ Settings hooks (useSettings, useDashboardSettings, useAISettings) - COMPLETE
✅ Settings panel UI component - COMPLETE  
⚠️ Settings integration in merchant-admin - PARTIAL (button added, needs testing)
❌ Settings persistence to database - NOT TESTED
```

### TEMPLATE GALLERY STATUS:
```
✅ Template gallery components exist
⚠️ Template selection flow - UNKNOWN
❌ Template application to store - NOT WIRED
```

### COMPONENT ISSUES:
```typescript
// BROKEN COMPONENTS TO FIX:
- Frontend/merchant-admin/src/components/dashboard-v2/ProDashboardV2.tsx
  Status: Import errors, missing dependencies
  
- Frontend/merchant-admin/src/components/dashboard/plan-tier-gating.tsx
  Status: Complex logic, needs simplification
  
- Frontend/merchant-admin/src/hooks/useRealTimeDashboard.ts
  Status: WebSocket connection unstable
```

---

## 🎯 YOUR 5 CRITICAL TASKS

### TASK 1: SETTINGS INTEGRATION TESTING ⏰ (3 HOURS)

**VERIFY SETTINGS BUTTON WORKS:**

#### Step 1: Check Button Integration

**FILE:** `Frontend/merchant-admin/src/components/admin-shell.tsx`

Verify this code exists (I added it earlier):
```typescript
// Line ~790 - Should have settings button
<Button
  variant="ghost"
  size="icon"
  onClick={() => setIsSettingsOpen(true)}
  className="text-text-tertiary hover:text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary"
  aria-label="Open settings"
  title="Settings"
>
  <Icon name="Settings" size={20} />
</Button>

<SettingsPanel
  isOpen={isSettingsOpen}
  onClose={() => setIsSettingsOpen(false)}
/>
```

#### Step 2: Test Settings Panel Opens

**MANUAL TEST:**
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin

# Start dev server
pnpm dev

# Open browser to localhost:3000
# Login with test account
# Look for gear icon ⚙️ in top-right header
# Click it → Settings panel should slide in from right
```

**EXPECTED BEHAVIOR:**
- ✅ Gear icon visible next to notification bell
- ✅ Click opens settings panel (slide-in animation)
- ✅ All tabs work: Business, Dashboard, AI, Notifications
- ✅ Form inputs are editable
- ✅ Save button shows success toast

#### Step 3: Test Settings Persistence

**TEST EACH SETTING:**

```typescript
// 1. Business Settings
- Change business name → Save → Refresh page → Should persist
- Change industry → Save → Verify industry changes in URL/database
- Change timezone → Save → Check timestamp display updates

// 2. Dashboard Settings  
- Change layout (grid/list/kanban) → Save → Dashboard layout changes
- Change theme (light/dark) → Save → Theme updates immediately
- Change refresh interval → Save → Data refreshes at new interval

// 3. AI Settings
- Toggle AI assistant on/off → Save → AI panel shows/hides
- Change action permissions → Save → AI behavior updates
- Adjust confidence threshold → Save → AI responses respect threshold

// 4. Notification Settings
- Toggle email notifications → Save → Email preferences update
- Toggle SMS notifications → Save → SMS preferences update
- Toggle push notifications → Save → Push preferences update
```

#### Step 4: Debug Database Persistence

**IF SETTINGS DON'T SAVE:**

Check Prisma client is generated:
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/packages/prisma
pnpm prisma generate
```

Check database migration ran:
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/packages/prisma
pnpm prisma migrate status
```

If Settings table doesn't exist:
```bash
pnpm prisma migrate dev --name add_settings_table
```

Test database connection:
```typescript
// In packages/settings/src/store/settings-manager.ts
async importSettings(data: string): Promise<void> {
  try {
    const parsed = JSON.parse(data);
    console.log('[SETTINGS] Importing:', parsed);
    
    // Check if Prisma client exists
    if (!this.prisma) {
      console.error('[SETTINGS] Prisma client not initialized');
      throw new Error('Database not connected');
    }
    
    // Try to save
    const result = await this.prisma.settings.upsert({
      where: { id: 'default' },
      create: {
        business: parsed.business || {},
        dashboard: parsed.dashboard || {},
        ai: parsed.ai || {},
        notifications: parsed.notifications || {},
      },
      update: {
        business: parsed.business || {},
        dashboard: parsed.dashboard || {},
        ai: parsed.ai || {},
        notifications: parsed.notifications || {},
      },
    });
    
    console.log('[SETTINGS] Saved successfully:', result);
  } catch (error) {
    console.error('[SETTINGS] Import failed:', error);
    throw error;
  }
}
```

#### DELIVERABLES:
- [ ] Settings button visible in header
- [ ] Settings panel opens/closes smoothly
- [ ] All 6 setting sections editable
- [ ] Save persists to database
- [ ] Reload page → settings restored

---

### TASK 2: TEMPLATE GALLERY WIRING ⏰ (6 HOURS)

**CURRENT PROBLEM:** Merchants can browse templates but can't apply them.

#### Step 1: Find Template Gallery Component

**SEARCH FOR:**
```bash
find /Users/fredrick/Documents/Vayva-Tech/vayva -name "*template*" -type f | grep -E "\.(tsx|ts)$" | head -20
```

Likely locations:
```
Frontend/merchant-admin/src/app/(dashboard)/dashboard/designer/page.tsx
Frontend/merchant-admin/src/components/template-gallery/
packages/templates/src/
```

#### Step 2: Create Template Application Flow

**CREATE FILE:** `Frontend/merchant-admin/src/lib/templates/apply-template.ts`

```typescript
/**
 * Apply a template to merchant's store
 */
export async function applyTemplate(
  templateId: string,
  options: {
    preserveContent?: boolean;
    preview?: boolean;
  } = {}
) {
  try {
    const response = await fetch('/api/templates/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        preserveContent: options.preserveContent ?? false,
        preview: options.preview ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply template');
    }

    const data = await response.json();
    
    return {
      success: true,
      data: {
        appliedAt: data.appliedAt,
        previewUrl: data.previewUrl,
        changes: data.changes,
      },
    };
  } catch (error) {
    console.error('[TEMPLATE] Apply failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Preview template without applying
 */
export async function previewTemplate(templateId: string) {
  const windowFeatures = 'width=1200,height=800,scrollbars=yes';
  const previewUrl = `/api/templates/preview/${templateId}`;
  
  window.open(previewUrl, '_blank', windowFeatures);
}

/**
 * Rollback to previous template
 */
export async function rollbackTemplate() {
  try {
    const response = await fetch('/api/templates/rollback', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to rollback template');
    }

    const data = await response.json();
    
    // Reload to show previous template
    window.location.reload();
    
    return { success: true };
  } catch (error) {
    console.error('[TEMPLATE] Rollback failed:', error);
    return { success: false, error: 'Failed to rollback' };
  }
}
```

#### Step 3: Wire Template Selection UI

**IN TEMPLATE GALLERY PAGE:**

Add "Apply Template" button that calls the function above:

```typescript
// In template gallery page
import { applyTemplate, previewTemplate } from '@/lib/templates/apply-template';
import { toast } from 'sonner';

function TemplateCard({ template }: { template: Template }) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!confirm('Apply this template? This will change your store layout.')) {
      return;
    }

    setIsApplying(true);
    
    const result = await applyTemplate(template.id, {
      preserveContent: true,
    });

    setIsApplying(false);

    if (result.success) {
      toast.success('Template applied successfully!');
      // Optionally redirect to preview
      window.open(result.data.previewUrl, '_blank');
    } else {
      toast.error(result.error || 'Failed to apply template');
    }
  };

  return (
    <Card>
      <img src={template.thumbnail} alt={template.name} />
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => previewTemplate(template.id)}
        >
          Preview
        </Button>
        
        <Button
          onClick={handleApply}
          disabled={isApplying}
        >
          {isApplying ? 'Applying...' : 'Apply Template'}
        </Button>
      </div>
    </Card>
  );
}
```

#### Step 4: Create Backend API Route

**CREATE FILE:** `Backend/core-api/src/app/api/templates/apply/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { getSessionUser } from '@/lib/session.server';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { templateId, preserveContent = false, preview = false } = body;

    // Fetch template definition
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        layout: true,
        widgets: true,
        theme: true,
      },
    });

    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404 }
      );
    }

    if (preview) {
      // Just return template config without applying
      return new Response(JSON.stringify({
        success: true,
        data: {
          template,
          previewUrl: `/preview/template/${templateId}`,
        },
      }));
    }

    // APPLY TEMPLATE TO MERCHANT'S STORE
    
    // 1. Backup current configuration
    const currentStore = await prisma.store.findUnique({
      where: { id: user.storeId },
    });

    await prisma.storeBackup.create({
      data: {
        storeId: user.storeId,
        backupType: 'PRE_TEMPLATE_APPLY',
        configuration: {
          layout: currentStore?.layout,
          theme: currentStore?.theme,
          widgets: currentStore?.widgets,
        },
      },
    });

    // 2. Apply new template
    await prisma.store.update({
      where: { id: user.storeId },
      data: {
        layout: template.layout.config,
        theme: template.theme.config,
        widgets: template.widgets.map(w => ({
          id: w.id,
          type: w.type,
          position: w.position,
          config: w.config,
        })),
        
        // Mark as needing review
        publishedAt: null,
      },
    });

    // 3. Log template application
    await prisma.auditLog.create({
      data: {
        merchantId: user.merchantId,
        userId: user.id,
        action: 'TEMPLATE_APPLIED',
        details: {
          templateId,
          templateName: template.name,
          preserveContent,
        },
      },
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        appliedAt: new Date().toISOString(),
        previewUrl: `/dashboard/designer?preview=true`,
        changes: {
          layoutChanged: true,
          themeChanged: template.theme.name !== currentStore?.theme,
          widgetsAdded: template.widgets.length,
        },
      },
    }));

  } catch (error) {
    console.error('[TEMPLATE] Apply failed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to apply template' }),
      { status: 500 }
    );
  }
}
```

#### DELIVERABLES:
- [ ] Template gallery displays available templates
- [ ] Preview button opens template preview
- [ ] Apply Template button works
- [ ] Success/error toasts show
- [ ] Template actually changes store layout
- [ ] Rollback works if merchant wants to undo

---

### TASK 3: DASHBOARD DATA INTEGRATION ⏰ (4 HOURS)

**PROBLEM:** Dashboards show mock/placeholder data instead of real data.

#### Step 1: Connect UniversalProDashboard to Real API

**FILE:** `Frontend/merchant-admin/src/components/dashboard/UniversalProDashboard.tsx`

Find the mock data and replace with real API calls:

```typescript
// CURRENT (PROBABLY MOCK):
const mockMetrics = {
  revenue: { value: 12450, change: 12, trend: 'up' },
  orders: { value: 45, change: 8, trend: 'up' },
  // ... fake data
};

// REPLACE WITH REAL API:
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function UniversalProDashboard(props) {
  const { industry, variant } = props;
  
  // Fetch real data
  const { data: aggregateData, isLoading } = useSWR(
    `/api/dashboard/aggregate?range=month&industry=${industry}`,
    fetcher,
    { refreshInterval: 30000 } // 30 seconds
  );

  const metrics = aggregateData?.data?.metricsData;
  const orders = aggregateData?.data?.recentPrimaryData;
  const alerts = aggregateData?.data?.inventoryAlertsData;

  // Use real data in render
  return (
    <div>
      <MetricCard 
        title="Revenue" 
        value={metrics?.revenue || 0}
        trend={metrics?.revenueTrend || 'up'}
      />
      {/* ... rest of dashboard */}
    </div>
  );
}
```

#### Step 2: Add Industry-Specific Data Fetching

For each industry, fetch specialized metrics:

```typescript
// Example: Restaurant industry
if (industry === 'restaurant') {
  const { data: restaurantData } = useSWR(
    `/api/restaurant/${businessId}/occupancy`,
    fetcher
  );
  
  // Show occupancy rate in dashboard
  <OccupancyRate 
    rate={restaurantData?.currentOccupancy || 0}
    capacity={restaurantData?.totalTables || 0}
  />
}

// Example: Education industry  
if (industry === 'education') {
  const { data: educationData } = useSWR(
    `/api/education/${businessId}/courses/active`,
    fetcher
  );
  
  // Show active courses
  <ActiveCourses courses={educationData?.courses || []} />
}
```

#### Step 3: Handle Loading States Properly

```typescript
// DON'T DO THIS:
if (isLoading) return <div>Loading...</div>;

// DO THIS INSTEAD:
if (isLoading) {
  return (
    <div className="space-y-6">
      {/* Skeleton loaders */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
```

#### DELIVERABLES:
- [ ] UniversalProDashboard fetches from `/api/dashboard/aggregate`
- [ ] Industry-specific dashboards fetch their specialized APIs
- [ ] Loading states use skeletons, not text
- [ ] Error states show retry button
- [ ] Data refreshes every 30 seconds

---

### TASK 4: FIX BROKEN COMPONENTS ⏰ (4 HOURS)

#### Issue 1: ProDashboardV2 TypeScript Errors

**FILE:** `Frontend/merchant-admin/src/components/dashboard-v2/ProDashboardV2.tsx`

Fix import errors:

```typescript
// FIX BROKEN IMPORTS:
import { Button, Icon, Card } from "@vayva/ui";  // ✅ Correct
import cn from "clsx";  // ✅ Make sure clsx is installed
import { formatCurrency } from "@vayva/shared";  // ✅ Correct path

// If imports still fail, check package.json has these dependencies:
// "@vayva/ui": "workspace:*",
// "@vayva/shared": "workspace:*",
// "clsx": "^2.0.0",
```

#### Issue 2: Plan Tier Gating Logic

**FILE:** `Frontend/merchant-admin/src/components/dashboard/plan-tier-gating.tsx`

Simplify complex logic:

```typescript
// BEFORE (COMPLEX):
const getAvailableWidgets = (planTier, industry, enabledExtensions) => {
  // 100 lines of nested if statements...
};

// AFTER (SIMPLE):
const WIDGET_ACCESS = {
  free: ['basic_metrics', 'setup_checklist'],
  starter: ['basic_metrics', 'setup_checklist', 'recent_orders'],
  pro: ['all_except_advanced_analytics'],
  enterprise: ['all'],
};

export function PlanTierGating({ planTier, children }) {
  const allowedWidgets = WIDGET_ACCESS[planTier] || [];
  
  return React.Children.map(children, (child) => {
    if (!allowedWidgets.includes(child.props.widgetId) && 
        !allowedWidgets.includes('all')) {
      return <UpgradePrompt requiredPlan={planTier} />;
    }
    return child;
  });
}
```

#### Issue 3: WebSocket Connection Stability

**FILE:** `Frontend/merchant-admin/src/hooks/useRealTimeDashboard.ts`

Fix WebSocket reconnection:

```typescript
// ADD RECONNECTION LOGIC:
export function useRealTimeDashboard(options) {
  const [wsConnected, setWsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);

      ws.onopen = () => {
        setWsConnected(true);
        reconnectAttempts.current = 0;
        console.log('[WS] Connected');
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.log('[WS] Disconnected');
        
        // Attempt reconnection
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeout = setTimeout(connect, delay);
        } else {
          console.error('[WS] Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        ws?.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, []);

  // ... rest of hook
}
```

#### DELIVERABLES:
- [ ] ProDashboardV2 compiles without errors
- [ ] Plan tier gating works (Free users see upgrade prompts)
- [ ] WebSocket reconnects automatically on disconnect
- [ ] No console errors in browser

---

### TASK 5: MOBILE NAVIGATION FIXES ⏰ (3 HOURS)

#### Issue 1: Mobile Menu Overflows

**FIX:** Add proper scrolling

```typescript
// In admin-shell.tsx mobile menu
<div className="fixed inset-0 z-50 lg:hidden">
  <div className="fixed inset-0 bg-black/50" onClick={closeMenu} />
  
  <div className="fixed inset-y-0 left-0 w-64 bg-surface shadow-elevated overflow-hidden">
    {/* ADD SCROLL CONTAINER */}
    <div className="h-full overflow-y-auto">
      {/* Navigation items */}
    </div>
  </div>
</div>
```

#### Issue 2: Bottom Tab Bar on Mobile

**ADD MOBILE BOTTOM NAV:**

```typescript
// Create: Frontend/merchant-admin/src/components/mobile/BottomNav.tsx
export function BottomNav() {
  const pathname = usePathname();
  
  const tabs = [
    { href: '/dashboard', icon: 'LayoutDashboard', label: 'Home' },
    { href: '/dashboard/orders', icon: 'ShoppingBag', label: 'Orders' },
    { href: '/dashboard/products', icon: 'Package', label: 'Products' },
    { href: '/dashboard/customers', icon: 'Users', label: 'Customers' },
    { href: '/dashboard/more', icon: 'MoreHorizontal', label: 'More' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border lg:hidden safe-area-pb">
      <div className="grid grid-cols-5 h-full">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-1 px-2 ${
              pathname === tab.href 
                ? 'text-primary' 
                : 'text-text-secondary'
            }`}
          >
            <Icon name={tab.icon} size={24} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

#### DELIVERABLES:
- [ ] Mobile menu scrolls properly (no cutoff items)
- [ ] Bottom nav appears only on mobile (< 1024px)
- [ ] All touch targets ≥ 44px
- [ ] Safe area insets for iOS notch

---

## ✅ DELIVERABLES CHECKLIST

**MUST COMPLETE IN 24 HOURS:**

### Phase 1: Settings Integration (Hours 0-3)
- [ ] Settings button works in header
- [ ] Panel opens/closes smoothly
- [ ] All forms save to database
- [ ] Reload persists settings
- [ ] Zero console errors

### Phase 2: Template Gallery (Hours 3-9)
- [ ] Template apply function created
- [ ] Backend API route works
- [ ] Preview functionality works
- [ ] Rollback works
- [ ] Test with 3 different templates

### Phase 3: Data Integration (Hours 9-13)
- [ ] UniversalProDashboard uses real API
- [ ] Industry dashboards fetch specialized data
- [ ] Loading states use skeletons
- [ ] Error handling with retry
- [ ] Auto-refresh every 30s

### Phase 4: Component Fixes (Hours 13-17)
- [ ] ProDashboardV2 compiles
- [ ] Plan tier gating simplified
- [ ] WebSocket reconnects reliably
- [ ] No TypeScript errors

### Phase 5: Mobile Polish (Hours 17-20)
- [ ] Mobile menu scrolls
- [ ] Bottom nav implemented
- [ ] Touch targets ≥ 44px
- [ ] Test on actual iPhone/Android

---

## 🧪 TESTING REQUIREMENTS

**BEFORE SUBMITTING, TEST:**

1. **Settings Flow**
   ```
   1. Open settings
   2. Change business name → Save
   3. Hard refresh (Cmd+Shift+R)
   4. Open settings again
   5. Verify name still shows
   ```

2. **Template Application**
   ```
   1. Go to template gallery
   2. Click "Preview" on any template
   3. Verify preview opens in new window
   4. Click "Apply Template"
   5. Confirm dialog
   6. Verify success toast
   7. Visit store → verify layout changed
   ```

3. **Dashboard Data**
   ```
   1. Open Network tab in DevTools
   2. Refresh dashboard
   3. Verify /api/dashboard/aggregate called
   4. Check response time < 500ms
   5. Verify data populates metric cards
   6. Wait 30s → verify auto-refresh
   ```

4. **Mobile Navigation**
   ```
   1. Open DevTools mobile emulator
   2. Test iPhone 14/15
   3. Test iPad
   4. Verify bottom nav appears
   5. Tap all nav items → they work
   6. Open mobile menu → scrolls smoothly
   ```

---

## 📞 COMMUNICATION

**UPDATE EVERY 4 HOURS:**
1. Post Loom video in Slack #frontend-channel
2. Show working features
3. List any blockers

**WHEN STUCK:**
- Tag @TechLead or @UIUXDesigner
- Don't spend >30 mins on one problem
- Ask in #frontend-help

---

## 🎯 SUCCESS CRITERIA

**YOU WIN WHEN:**

✅ Settings button works and saves to database

✅ Templates can be previewed and applied

✅ All dashboards show real data (not mock)

✅ Zero TypeScript errors across entire codebase

✅ Mobile navigation smooth on real devices

✅ Boss can demo without anything breaking

---

**REMEMBER:** You're the last line of defense before the boss demos this to merchants. IF IT BREAKS, IT'S ON YOU. Make it bulletproof. 💪

**GOOD LUCK, ENGINEER! INTEGRATE EVERYTHING. MAKE IT ALL WORK.**
