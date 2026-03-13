# COMPLETE PLATFORM IMPLEMENTATION PLAN
## Phased Execution Strategy for Full Platform Readiness

**Generated:** March 11, 2026  
**Status:** Ready for Execution  
**Total Estimated Effort:** 170-230 hours (4-6 weeks)  
**Critical Requirement:** ZERO ERRORS - Each phase must compile and pass typecheck before proceeding

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Phase 1: Critical Infrastructure (Week 1)](#phase-1-critical-infrastructure-week-1)
3. [Phase 2: Component Standardization (Week 2)](#phase-2-component-standardization-week-2)
4. [Phase 3: AI Integration (Week 3)](#phase-3-ai-integration-week-3)
5. [Phase 4: Dashboard Engine (Week 4)](#phase-4-dashboard-engine-week-4)
6. [Phase 5: Notification System (Week 5)](#phase-5-notification-system-week-5)
7. [Phase 6: Architecture Cleanup (Week 6)](#phase-6-architecture-cleanup-week-6)
8. [Quality Assurance Protocol](#quality-assurance-protocol)
9. [Risk Management](#risk-management)

---

## 📊 EXECUTIVE SUMMARY

### Current State
✅ **Completed Assets:**
- @vayva/settings package (3,000+ lines, production-ready)
- AI analytics services (benchmarking, predictive analytics)
- Industry unification (25 industries, 100% feature complete)
- Analytics engine with advanced capabilities

⚠️ **Critical Gaps:**
- Settings not integrated into applications
- No database persistence layer for settings
- Duplicated components across industries (60-70% redundancy)
- AI settings don't control actual AI behavior
- Dashboard settings don't affect layout/rendering
- No notification delivery system

### Implementation Strategy
**Parallel Development Approach:** This plan is designed for simultaneous execution. Each task includes:
- ✅ Pre-flight checklist
- 🎯 Step-by-step implementation
- 🧪 Verification protocol
- ⚠️ Error prevention measures
- ✅ Definition of Done

---

## 🚨 PHASE 1: CRITICAL INFRASTRUCTURE (Week 1)
**Duration:** 5-7 days  
**Priority:** CRITICAL  
**Dependencies:** None  
**Team:** Backend + Frontend developers

---

### TASK 1.1: Database Schema & Migration

#### Objective
Create persistent storage for unified settings with full Prisma integration.

#### Pre-Flight Checklist
- [ ] Git branch created: `feature/settings-database-schema`
- [ ] Database backup completed
- [ ] Development database accessible
- [ ] Prisma client installed (`pnpm list prisma`)

#### Implementation Steps

##### Step 1: Add Settings Model to Prisma Schema

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/packages/db/prisma/schema.prisma`

```prisma
// ADD THIS MODEL at the end of schema.prisma

model Settings {
  id            String   @id @default("default")
  
  // Core Settings Sections (stored as JSON for flexibility)
  business      Json     @default("{}")
  industry      Json     @default("{}")
  dashboard     Json     @default("{}")
  ai            Json     @default("{}")
  notifications Json     @default("{}")
  user          Json     @default("{}")
  
  // Metadata
  active        Boolean  @default(true)
  version       Int      @default(1)
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Indexes for performance
  @@index([active])
  @@index([updatedAt])
}
```

**CRITICAL VERIFICATION:**
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/packages/db
# Verify schema syntax
npx prisma validate
# Should output: "Validated Prisma schema successfully"
```

##### Step 2: Create Database Migration

```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm prisma migrate dev --name add_settings_table --schema=packages/db/prisma/schema.prisma
```

**EXPECTED OUTPUT:**
```
Environment variables loaded from .env
Prisma schema loaded from packages/db/prisma/schema.prisma
Datasource "db": PostgreSQL database "vayva" at "localhost:5432"

Applying migration `20260311_add_settings_table`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260311_add_settings_table/
    └─ migration.sql

Your database is now in sync with your schema.
```

**IF ERRORS OCCUR:**
```bash
# Rollback if needed
pnpm prisma migrate resolve --rolled-back "20260311_add_settings_table"

# Fix schema and retry
```

##### Step 3: Generate Updated Prisma Client

```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm prisma generate --schema=packages/db/prisma/schema.prisma
```

**VERIFICATION:**
```bash
# Check Prisma client was generated
ls -la packages/db/dist/
# Should show: index.js, index.d.ts
```

##### Step 4: Create Settings Repository Service

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/packages/db/src/repositories/settings.repository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { 
  BusinessSettings,
  IndustrySettings,
  DashboardSettings,
  AISettings,
  NotificationSettings,
  UserPreferences,
} from '@vayva/settings';

export interface SettingsData {
  business: BusinessSettings;
  industry: IndustrySettings;
  dashboard: DashboardSettings;
  ai: AISettings;
  notifications: NotificationSettings;
  user: UserPreferences;
  active: boolean;
  version: number;
}

export class SettingsRepository {
  constructor(private prisma: PrismaClient) {}

  async getSettings(): Promise<SettingsData | null> {
    const settings = await this.prisma.settings.findFirst({
      where: { active: true },
    });

    if (!settings) return null;

    return {
      business: settings.business as BusinessSettings,
      industry: settings.industry as IndustrySettings,
      dashboard: settings.dashboard as DashboardSettings,
      ai: settings.ai as AISettings,
      notifications: settings.notifications as NotificationSettings,
      user: settings.user as UserPreferences,
      active: settings.active,
      version: settings.version,
    };
  }

  async upsertSettings(data: Partial<SettingsData>): Promise<SettingsData> {
    const existing = await this.getSettings();

    if (existing) {
      const updated = await this.prisma.settings.update({
        where: { id: existing ? 'default' : 'default' },
        data: {
          business: data.business || existing.business,
          industry: data.industry || existing.industry,
          dashboard: data.dashboard || existing.dashboard,
          ai: data.ai || existing.ai,
          notifications: data.notifications || existing.notifications,
          user: data.user || existing.user,
          version: { increment: 1 },
        },
      });

      return {
        business: updated.business as BusinessSettings,
        industry: updated.industry as IndustrySettings,
        dashboard: updated.dashboard as DashboardSettings,
        ai: updated.ai as AISettings,
        notifications: updated.notifications as NotificationSettings,
        user: updated.user as UserPreferences,
        active: updated.active,
        version: updated.version,
      };
    } else {
      const created = await this.prisma.settings.create({
        data: {
          id: 'default',
          business: (data.business || {}) as any,
          industry: (data.industry || {}) as any,
          dashboard: (data.dashboard || {}) as any,
          ai: (data.ai || {}) as any,
          notifications: (data.notifications || {}) as any,
          user: (data.user || {}) as any,
          active: true,
          version: 1,
        },
      });

      return {
        business: created.business as BusinessSettings,
        industry: created.industry as IndustrySettings,
        dashboard: created.dashboard as DashboardSettings,
        ai: created.ai as AISettings,
        notifications: created.notifications as NotificationSettings,
        user: created.user as UserPreferences,
        active: created.active,
        version: created.version,
      };
    }
  }

  async resetToDefaults(): Promise<void> {
    await this.prisma.settings.deleteMany({
      where: { active: true },
    });
  }
}
```

**TYPECHECK VERIFICATION:**
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/packages/db
pnpm typecheck
# Must output: "Found 0 errors"
```

#### Testing Protocol

```bash
# Test repository creation
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm test -- packages/db/src/repositories/settings.repository.test.ts

# Expected: All tests pass
```

#### Definition of Done
- ✅ Prisma schema validated
- ✅ Migration created and applied successfully
- ✅ Prisma client generated without errors
- ✅ Settings repository implemented
- ✅ Typecheck passes with 0 errors
- ✅ Tests passing
- ✅ Code reviewed

---

### TASK 1.2: Integrate Settings into Main App

#### Objective
Wire up @vayva/settings package to merchant-admin application with full functionality.

#### Pre-Flight Checklist
- [ ] Task 1.1 complete (database ready)
- [ ] @vayva/settings package built (`pnpm build --filter=@vayva/settings`)
- [ ] Merchant admin app accessible

#### Implementation Steps

##### Step 1: Update Package Dependencies

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/package.json`

```json
{
  "dependencies": {
    "@vayva/settings": "workspace:*"
  }
}
```

Run:
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm install
```

**VERIFICATION:**
```bash
pnpm list @vayva/settings
# Should show: @vayva/settings@1.0.0
```

##### Step 2: Create Settings Provider

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/providers/settings.provider.tsx`

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  initializeSettingsManager,
  SettingsManager,
  getSettingsManager,
} from '@vayva/settings';
import { prisma } from '@vayva/db';

const SettingsContext = createContext<SettingsManager | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<SettingsManager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initSettings() {
      try {
        const settingsManager = new SettingsManager();
        
        // Initialize with Prisma client
        await settingsManager.initialize(prisma);
        
        // Set as global instance
        initializeSettingsManager(settingsManager);
        
        setManager(settingsManager);
      } catch (error) {
        console.error('[SETTINGS] Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    }

    initSettings();
  }, []);

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <SettingsContext.Provider value={manager}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
}
```

**TYPECHECK:**
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin
pnpm typecheck
# Must pass with 0 errors
```

##### Step 3: Wrap App with Settings Provider

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app/providers.tsx`

```typescript
import { SettingsProvider } from './providers/settings.provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      {children}
    </SettingsProvider>
  );
}
```

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app/layout.tsx`

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

##### Step 4: Add Settings Button to Navigation

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/components/Header.tsx` (or equivalent)

```typescript
'use client';

import { useState } from 'react';
import { SettingsPanel } from '@vayva/settings';

export function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* ... existing header content ... */}
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
```

##### Step 5: Verify Settings Affect Dashboard

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app/dashboard/page.tsx`

```typescript
'use client';

import { useDashboardSettings } from '@vayva/settings';

export default function DashboardPage() {
  const { dashboard, widgets, refreshInterval } = useDashboardSettings();

  console.log('[DASHBOARD] Current settings:', dashboard);
  console.log('[DASHBOARD] Widgets:', widgets);
  console.log('[DASHBOARD] Refresh interval:', refreshInterval);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Refresh Interval: {refreshInterval}s</p>
      <p>Widget Count: {widgets.length}</p>
      {/* ... rest of dashboard ... */}
    </div>
  );
}
```

#### Testing Protocol

```bash
# Build merchant admin app
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm build --filter=merchant-admin

# Run typecheck
pnpm typecheck --filter=merchant-admin

# Start dev server and manually test
pnpm dev --filter=merchant-admin

# Navigate to http://localhost:3000
# Click settings button
# Change a setting and verify it saves
```

#### Definition of Done
- ✅ Settings provider wraps app
- ✅ Settings button visible in header
- ✅ Settings panel opens when clicked
- ✅ Changes persist to database
- ✅ Dashboard reflects setting changes
- ✅ No console errors
- ✅ Typecheck passes

---

### TASK 1.3: Consolidate Industry Settings Pages

#### Objective
Eliminate redundant settings pages and establish clear separation between global and industry-specific settings.

#### Pre-Flight Checklist
- [ ] Inventory all existing settings pages
- [ ] Identify which are industry-specific workflows vs common settings
- [ ] Backup current settings directory structure

#### Implementation Steps

##### Step 1: Audit Existing Settings Pages

```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app
find settings -type f -name "*.tsx" | sort
```

**CATEGORIZATION GUIDE:**

**MOVE TO UNIFIED SETTINGS PANEL (delete these):**
- General business info pages
- Profile settings
- Notification preferences
- Theme/appearance settings
- User preferences

**KEEP AS INDUSTRY-SPECIFIC (retain these):**
- Restaurant: Menu builder, KDS config, table management
- Healthcare: Patient intake forms, insurance billing, clinical protocols
- Legal: Matter management, court filing integration
- Retail: Purchase order workflows, channel sync config
- Fashion: Tech pack generator, size curve optimizer

##### Step 2: Create New Structure

```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app

# Create industry settings directory
mkdir -p settings/industry/{restaurant,healthcare,legal,retail,fashion}
```

##### Step 3: Redirect Main Settings to Panel

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app/settings/page.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to first tab of unified settings panel
    // The SettingsPanel component will handle display
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-gray-600">Opening unified settings...</p>
      </div>
    </div>
  );
}
```

**ACTUAL IMPLEMENTATION:** Just open SettingsPanel from the header button (done in Task 1.2).

##### Step 4: Remove Redundant Pages

```bash
# EXAMPLE: Remove generic notification settings (now in unified panel)
cd /Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app

# BACKUP FIRST
cp -r settings/notifications settings/notifications.backup

# Then remove
rm -rf settings/notifications
```

**CRITICAL:** Only delete pages that are truly redundant. Keep industry-specific workflows.

##### Step 5: Document What Remains

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/app/settings/industry/README.md`

```markdown
# Industry-Specific Settings

These settings pages are unique to each industry and cannot be unified.

## Structure

Each industry folder contains:
- Workflow-specific configurations
- Industry compliance settings
- Specialized feature toggles

## Industries

- `/restaurant` - Menu, KDS, reservations
- `/healthcare` - Patient intake, insurance, clinical
- `/legal` - Matter management, court filings
- etc.
```

#### Testing Protocol

```bash
# Verify no broken links
cd /Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin
pnpm build

# Manually test remaining industry-specific pages
# Ensure they still function correctly
```

#### Definition of Done
- ✅ Redundant pages removed
- ✅ Industry-specific pages preserved
- ✅ Clear documentation created
- ✅ No 404 errors
- ✅ Settings accessible via unified panel

---

## 🔨 PHASE 2: COMPONENT STANDARDIZATION (Week 2)
**Duration:** 5-7 days  
**Priority:** HIGH  
**Dependencies:** Phase 1 complete  
**Team:** Frontend developers

---

### TASK 2.1: Build Reusable Component Library

#### Objective
Create 10 most-needed reusable components in `industry-core` to eliminate duplication.

#### Pre-Flight Checklist
- [ ] Phase 1 complete
- [ ] Audit of duplicated components done
- [ ] Component API designs documented

#### Components to Build (In Order)

##### Component 1: MetricCard

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/packages/industry-core/src/components/MetricCard.tsx`

```typescript
'use client';

import React from 'react';

export interface MetricCardProps {
  id: string;
  label: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percentage';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  comparisonPeriod?: string;
  alertThreshold?: number;
  invertTrend?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  format = 'number',
  trend,
  comparisonPeriod = 'vs previous period',
  alertThreshold,
  invertTrend = false,
  className = '',
}: MetricCardProps) {
  const formattedValue = formatValue(value, format);
  const isAlert = alertThreshold !== undefined && 
                  typeof value === 'number' && 
                  value < alertThreshold;

  const trendDirection = trend?.direction || 'neutral';
  const effectiveTrend = invertTrend 
    ? trendDirection === 'up' ? 'down' : trendDirection === 'down' ? 'up' : 'neutral'
    : trendDirection;

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className} ${isAlert ? 'border-2 border-red-500' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        {trend && (
          <span className={`flex items-center text-sm font-medium ${
            effectiveTrend === 'up' ? 'text-green-600' :
            effectiveTrend === 'down' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {effectiveTrend === 'up' && '↑'}
            {effectiveTrend === 'down' && '↓'}
            {effectiveTrend === 'neutral' && '→'}
            <span className="ml-1">{Math.abs(trend.value)}%</span>
          </span>
        )}
      </div>
      
      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-900">{formattedValue}</span>
      </div>
      
      {trend && (
        <div className="mt-2 text-xs text-gray-500">
          {comparisonPeriod}
        </div>
      )}
    </div>
  );
}

function formatValue(value: number | string, format: string): string {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    case 'percentage':
      return `${value.toFixed(2)}%`;
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}
```

**TYPECHECK:**
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/packages/industry-core
pnpm typecheck
# Must pass
```

##### Component 2: TrendChart

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/packages/industry-core/src/components/TrendChart.tsx`

```typescript
'use client';

import React, { useMemo } from 'react';

export interface TrendChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  chartType?: 'line' | 'bar' | 'area';
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  className?: string;
}

export function TrendChart({
  data,
  chartType = 'line',
  color = '#3B82F6',
  height = 200,
  showGrid = true,
  showLabels = true,
  className = '',
}: TrendChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
            ))}
          </>
        )}

        {chartType === 'line' && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        )}

        {chartType === 'area' && (
          <polygon
            points={`0,100 ${points} 100,100`}
            fill={color}
            fillOpacity="0.1"
          />
        )}

        {chartType === 'bar' && data.map((d, i) => {
          const barWidth = 80 / data.length;
          const barHeight = ((d.value - minValue) / (maxValue - minValue)) * 80;
          const x = (i / data.length) * 100 + 10;
          const y = 100 - barHeight;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              opacity="0.8"
            />
          );
        })}
      </svg>

      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      )}
    </div>
  );
}
```

**Continue with remaining 8 components:**
3. StatusBadge
4. PercentileGauge
5. ComparisonTable
6. SmartSearchInput
7. DateRangePicker
8. MultiSelectDropdown
9. SortableTable
10. BulkActionToolbar

Each follows same pattern:
- TypeScript interface
- Component implementation
- Typecheck verification
- Export from index.ts

#### Testing Protocol

```bash
# Build industry-core package
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm build --filter=industry-core

# Verify all components exportable
node -e "const core = require('./packages/industry-core'); console.log(Object.keys(core));"
```

#### Definition of Done
- ✅ All 10 components implemented
- ✅ TypeScript interfaces defined
- ✅ Typecheck passes with 0 errors
- ✅ Components exported from package
- ✅ Responsive design
- ✅ Accessibility compliant (ARIA labels)

---

### TASK 2.2: Extract Shared Utilities

#### Objective
Centralize duplicated utility functions in @vayva/shared.

#### Implementation Steps

##### Step 1: Create Utility Modules

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/packages/shared/src/utils/date-formatting.ts`

```typescript
/**
 * Format a date string or Date object to a locale-aware string
 */
export function formatDate(
  date: string | Date,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, 'minute');
  } else {
    return rtf.format(diffSecs, 'second');
  }
}

/**
 * Get start of period (day, week, month, year)
 */
export function startOfPeriod(date: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
  const result = new Date(date);
  
  switch (period) {
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const day = result.getDay();
      const diff = result.getDate() - day + (day === 0 ? -6 : 1);
      result.setDate(diff);
      result.setHours(0, 0, 0, 0);
      break;
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  
  return result;
}

/**
 * Calculate business days between two dates (excludes weekends)
 */
export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Not Sunday or Saturday
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Convert date between timezones
 */
export function timezoneConverter(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  const dateStr = date.toLocaleString('en-US', { timeZone: fromTimezone });
  return new Date(dateStr + ' UTC');
}
```

**Continue with:**
- `number-formatting.ts`
- `data-transformers.ts`
- `validation-helpers.ts`
- `api-client.ts`

#### Definition of Done
- ✅ All 5 utility modules created
- ✅ Functions fully typed
- ✅ Unit tests written
- ✅ Typecheck passes
- ✅ Documentation comments added

---

## 🤖 PHASE 3: AI INTEGRATION (Week 3)
**Duration:** 5-7 days  
**Priority:** CRITICAL  
**Dependencies:** Phase 1 & 2 complete  

---

### TASK 3.1: Connect AI Settings to Actual AI Behavior

#### Objective
Make AI agent respect settings from @vayva/settings package.

#### Implementation Steps

##### Step 1: Update AI Agent to Read Settings

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/packages/ai-agent/src/agent.ts`

```typescript
import { getSettingsManager } from '@vayva/settings';

export class AIAgent {
  private settingsManager;

  constructor() {
    this.settingsManager = getSettingsManager();
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    const aiSettings = this.settingsManager.getAISettings();
    
    // Build system prompt based on personality settings
    const systemPrompt = this.buildSystemPrompt(aiSettings.personality);
    
    // Check action permissions
    const requestedAction = this.detectAction(prompt);
    if (requestedAction && !this.hasPermission(aiSettings.actionPermissions, requestedAction)) {
      throw new PermissionError(`AI cannot perform action: ${requestedAction}`);
    }
    
    // Generate response with configured parameters
    const response = await this.llm.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: aiSettings.advanced.temperature,
      maxTokens: aiSettings.advanced.maxTokens,
      topP: 0.9,
    });
    
    return response.content;
  }

  private buildSystemPrompt(personality: any): string {
    const toneMap = {
      professional: 'formal, precise, and business-oriented',
      friendly: 'warm, approachable, and conversational',
      casual: 'relaxed, informal, and personable',
      formal: 'highly structured, proper, and respectful',
      enthusiastic: 'energetic, positive, and excited',
    };

    return `You are an AI assistant with the following characteristics:
- Communication Tone: ${toneMap[personality.tone]}
- Response Length: ${personality.responseLength}
- Technical Level: ${personality.technicalLevel}
- Proactivity: ${personality.proactivity}
${personality.useIndustryJargon ? '- Use industry-specific terminology' : '- Avoid jargon, explain technical terms'}
${personality.explainTechnicalTerms ? '- Always explain technical concepts clearly' : ''}

Respond appropriately to user queries while maintaining this personality.`;
  }

  private hasPermission(permissions: any, action: string): boolean {
    if (permissions.autoExecute.includes(action)) {
      return true;
    }
    
    if (permissions.prohibited.includes(action)) {
      return false;
    }
    
    // Requires approval - would need approval workflow
    return false;
  }

  private detectAction(prompt: string): string | null {
    // Simple action detection logic
    if (prompt.includes('send email')) return 'send-email';
    if (prompt.includes('create report')) return 'create-report';
    if (prompt.includes('adjust price')) return 'adjust-price';
    if (prompt.includes('spend')) return 'spend-money';
    if (prompt.includes('refund')) return 'issue-refund';
    
    return null;
  }
}
```

**TYPECHECK:**
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva/packages/ai-agent
pnpm typecheck
```

#### Definition of Done
- ✅ AI reads settings on every request
- ✅ Personality affects response generation
- ✅ Permissions enforced
- ✅ Temperature/maxTokens applied
- ✅ Typecheck passes

---

## 📊 PHASE 4: DASHBOARD ENGINE (Week 4)
**Duration:** 5-7 days  
**Priority:** HIGH  

### TASK 4.1: Make Dashboard Settings Control Layout

#### Objective
Dashboard grid must read positions from settings and enforce widget visibility.

#### Implementation

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/apps/merchant-admin/src/components/DashboardGrid.tsx`

```typescript
'use client';

import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDashboardSettings } from '@vayva/settings';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DashboardGrid() {
  const { widgets, layoutLocked, refreshInterval } = useDashboardSettings();

  const layouts = {
    lg: widgets.map(w => ({
      i: w.id,
      x: w.position.x,
      y: w.position.y,
      w: w.position.w,
      h: w.position.h,
    })),
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      isDraggable={!layoutLocked}
      isResizable={!layoutLocked}
      margin={[16, 16]}
    >
      {widgets.filter(w => w.visible).map(widget => (
        <div key={widget.id} className="bg-white rounded-lg shadow p-4">
          <WidgetRenderer widget={widget} refreshInterval={refreshInterval} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
```

#### Definition of Done
- ✅ Grid reads positions from settings
- ✅ Widget visibility respected
- ✅ Layout lock prevents changes
- ✅ Refresh intervals enforced

---

## 🔔 PHASE 5: NOTIFICATION SYSTEM (Week 5)
**Duration:** 5-7 days  
**Priority:** HIGH  

### TASK 5.1: Implement Notification Engine

#### Objective
Build notification delivery system that respects settings.

#### Implementation

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/packages/notification-engine/src/services/notification-dispatcher.service.ts`

```typescript
import { getSettingsManager } from '@vayva/settings';

export class NotificationDispatcher {
  private settingsManager;

  constructor() {
    this.settingsManager = getSettingsManager();
  }

  async send(channel: string, message: any): Promise<void> {
    const notificationSettings = this.settingsManager.getNotificationSettings();
    
    // Check if channel is enabled
    if (!notificationSettings.channels[channel as keyof typeof notificationSettings.channels]?.enabled) {
      return;
    }

    // Check quiet hours
    if (notificationSettings.quietHours.enabled && this.isQuietHours(notificationSettings.quietHours)) {
      // Queue for later unless emergency
      if (!message.priority === 'emergency') {
        await this.queueForLater(message);
        return;
      }
    }

    // Dispatch to channel
    switch (channel) {
      case 'email':
        await this.sendEmail(message);
        break;
      case 'sms':
        await this.sendSMS(message);
        break;
      case 'push':
        await this.sendPush(message);
        break;
      // ... other channels
    }
  }

  private isQuietHours(quietHours: any): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseInt(quietHours.startTime.split(':')[0]) * 60 + parseInt(quietHours.startTime.split(':')[1]);
    const endTime = parseInt(quietHours.endTime.split(':')[0]) * 60 + parseInt(quietHours.endTime.split(':')[1]);

    if (startTime > endTime) {
      // Overnight quiet hours (e.g., 22:00 - 08:00)
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  }
}
```

#### Definition of Done
- ✅ Notifications respect channel

---

## ✅ QUALITY ASSURANCE PROTOCOL

### MANDATORY FOR EACH TASK

#### Pre-Implementation
1. Create git branch: `git checkout -b feature/<task-name>`
2. Review existing code for conflicts
3. Backup affected files

#### During Implementation
1. Write TypeScript with strict mode
2. Add JSDoc comments
3. Follow existing code patterns
4. No TODO comments - complete implementation

#### Post-Implementation Verification
```bash
# 1. Typecheck
pnpm typecheck
# MUST output: "Found 0 errors"

# 2. Build
pnpm build --filter=<package>
# MUST complete without errors

# 3. Lint
pnpm lint
# MUST have no critical errors

# 4. Test (if applicable)
pnpm test
# MUST pass all tests
```

#### Before Merging
1. Run comprehensive typecheck:
```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm typecheck
```

2. Build entire monorepo:
```bash
pnpm build
```

3. Test critical paths manually

---

## ⚠️ RISK MANAGEMENT

### Common Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database migration fails | Low | High | Backup DB first, test on staging |
| Typecheck errors | Medium | Medium | Fix immediately, don't proceed |
| Breaking changes | Medium | High | Semantic versioning, deprecation warnings |
| Performance degradation | Low | Medium | Load testing, monitoring |
| Settings not persisting | Low | High | Transaction-based writes, rollback on failure |

### Rollback Plan
If any phase causes critical issues:
```bash
# 1. Revert git commit
git revert HEAD

# 2. Rollback database migration
pnpm prisma migrate resolve --rolled-back "<migration_name>"

# 3. Restore from backup
```

---

## 📈 SUCCESS METRICS

### Phase Completion Criteria
- ✅ All tasks in phase complete
- ✅ Zero TypeScript errors
- ✅ Zero build errors
- ✅ All tests passing
- ✅ Manual testing completed
- ✅ Documentation updated

### Overall Success Indicators
- Merchants can configure dashboard via SettingsPanel
- AI behavior controlled by settings
- 60% reduction in duplicated components
- Settings persist across sessions
- No regression in existing functionality

---

## 🚀 GET STARTED

**Begin with Phase 1, Task 1.1 immediately.**

Follow each step precisely. Do not skip verification steps. If errors occur, fix them before proceeding.

**Good luck! Execute flawlessly.** 🎯
