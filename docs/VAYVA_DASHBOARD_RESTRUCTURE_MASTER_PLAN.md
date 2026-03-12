# Vayva Dashboard Restructure - Master Plan

> **Status:** DRAFT - For Review  
> **Version:** 1.0.0  
> **Created:** 2026-03-11  
> **Purpose:** Complete restructure of all industry dashboards into engine-based architecture  

---

## Executive Summary

This plan restructures Vayva's 10 industry dashboards into a unified engine-based architecture while maintaining industry-specific customization. All dashboards will share:

1. **Consistent Sidebar Navigation** - Like the Pro dashboard
2. **Gradient Blur Background** - Theme-dependent colors set from settings
3. **Store Info Header Component** - Same component showing website info on main dashboard
4. **Clean Design Language** - No generic designs, all polished like Pro dashboard

---

## Current State Analysis

### Industry Dashboards Identified (10 Total)

| # | Industry | Current File | Design Category | Status |
|---|----------|--------------|-----------------|--------|
| 1 | **Retail** | `retail/retail-dashboard-layout.tsx` | signature | Partial |
| 2 | **Fashion** | Components in `fashion/` | glass | Partial |
| 3 | **Restaurant/Food** | `kitchen/` components | bold | Good |
| 4 | **Education** | `education/` components | dark | Good |
| 5 | **Events** | `events/EventsDashboard.tsx` | bold | Partial |
| 6 | **SaaS** | `saas/SaaSDashboard.tsx` | dark | Good |
| 7 | **Creative** | `creative/CreativeAgencyDashboard.tsx` | glass | Good |
| 8 | **Healthcare** | Components in `healthcare/` | signature | Minimal |
| 9 | **Real Estate** | Components in `realestate/` | glass | Minimal |
| 10 | **Beauty** | `beauty/BeautyDashboard` | glass | Minimal |

### Key Components to Preserve

**From Pro Dashboard (Screenshot):**
- Top navigation with Preview/Publish buttons
- Store name with "Live" badge
- "My Tasks" sidebar panel
- 4 KPI cards with trend indicators
- Revenue chart section
- Orders overview donut chart
- Clean white cards with subtle shadows
- Rounded corners (28px radius)

### Current Architecture Issues

1. **No unified dashboard engine** - Each industry has separate implementation
2. **Inconsistent sidebar** - Not all dashboards have the Pro sidebar
3. **No gradient blur background** - Missing from most dashboards
4. **Scattered configuration** - 5 config files for industry settings
5. **No theme settings UI** - Merchants can't customize theme colors

---

## Target Architecture

### Unified Dashboard Engine

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD ENGINE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    DashboardShell (Shared)                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────┐  │  │
│  │  │  Sidebar    │  │   Header    │  │  Gradient Background  │  │  │
│  │  │  (Pro-style)│  │ (Store Info)│  │  (Theme-dependent)    │  │  │
│  │  └─────────────┘  └─────────────┘  └───────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 Widget Engine (Extensible)                     │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │  │
│  │  │KPI Card│ │ Chart  │ │ Table  │ │  List  │ │ Custom │      │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 Industry Layer (10 Industries)                 │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │  │
│  │  │Retail│ │Fashion│ │Food │ │Events│ │ SaaS │ ...            │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5 Parallel Plans + 1 Integration Plan

### Plan Dependencies

```
Plan 1: Core Infrastructure Engine ──┐
Plan 2: Widget & Component Engine ───┼──► Plan 6: Integration & Testing
Plan 3: Theme & Design System ───────┤
Plan 4: Data & Real-time Engine ─────┤
Plan 5: Industry Migrations ─────────┘
```

**All 5 plans can run in parallel. Plan 6 starts after all 5 complete.**

---

# PLAN 1: Core Infrastructure Engine

## Overview
Create the foundational shell, layout, and configuration system that all dashboards will use.

## Deliverables

### 1.1 Dashboard Shell Component

**File:** `packages/dashboard-engine/src/shell/DashboardShell.tsx`

```typescript
interface DashboardShellProps {
  industry: IndustrySlug;
  merchant: MerchantData;
  theme: ThemeConfig;
  children: React.ReactNode;
}

/**
 * DashboardShell - Unified shell for ALL industry dashboards
 * 
 * Features:
 * - Pro-style sidebar navigation
 * - Gradient blur background (theme-dependent)
 * - Store info header component
 * - Responsive layout
 */
export function DashboardShell({ industry, merchant, theme, children }: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      {/* Gradient blur background layer */}
      <GradientBackground theme={theme} />
      
      {/* Main layout */}
      <div className="flex h-screen">
        {/* Sidebar - Pro style */}
        <DashboardSidebar industry={industry} merchant={merchant} />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {/* Store info header */}
          <StoreInfoHeader merchant={merchant} />
          
          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 1.2 Gradient Background System

**File:** `packages/dashboard-engine/src/theme/GradientBackground.tsx`

```typescript
interface GradientBackgroundProps {
  theme: ThemeConfig;
}

/**
 * GradientBackground - Theme-dependent gradient blur
 * 
 * Theme presets:
 * - signature: Blue/white gradient
 * - glass: Purple/pink glassmorphism
 * - bold: Orange/yellow energetic
 * - dark: Dark blue/purple night mode
 * - natural: Green/brown organic
 */
export function GradientBackground({ theme }: GradientBackgroundProps) {
  const gradients = {
    signature: 'from-blue-50 via-white to-slate-50',
    glass: 'from-purple-100/50 via-pink-50/30 to-blue-50/50',
    bold: 'from-orange-100 via-yellow-50 to-red-50',
    dark: 'from-slate-900 via-purple-950 to-slate-900',
    natural: 'from-green-50 via-amber-50 to-emerald-50',
  };
  
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        gradients[theme.category]
      )} />
      
      {/* Blur orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
    </div>
  );
}
```

### 1.3 Store Info Header Component

**File:** `packages/dashboard-engine/src/components/StoreInfoHeader.tsx`

```typescript
interface StoreInfoHeaderProps {
  merchant: MerchantData;
  showPreviewButton?: boolean;
}

/**
 * StoreInfoHeader - Displays store info like Pro dashboard
 * 
 * Shows:
 * - Store name with logo
 * - Store URL with "Live" badge
 * - Preview button
 * - Publish button
 * - User profile dropdown
 */
export function StoreInfoHeader({ merchant, showPreviewButton = true }: StoreInfoHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b">
      {/* Left: Store info */}
      <div className="flex items-center gap-4">
        <StoreLogo url={merchant.logoUrl} size={40} />
        <div>
          <h1 className="font-semibold text-lg">{merchant.storeName}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{merchant.storeUrl}</span>
            {merchant.isLive && (
              <Badge variant="success" size="sm">Live</Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {showPreviewButton && (
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        )}
        <Button size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Publish
        </Button>
        <UserDropdown user={merchant.user} />
      </div>
    </header>
  );
}
```

### 1.4 Pro-Style Sidebar Component

**File:** `packages/dashboard-engine/src/sidebar/DashboardSidebar.tsx`

```typescript
interface DashboardSidebarProps {
  industry: IndustrySlug;
  merchant: MerchantData;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * DashboardSidebar - Pro-style sidebar for all dashboards
 * 
 * Features:
 * - Collapsible with pin functionality
 * - Industry-specific navigation items
 * - "My Tasks" panel (like Pro dashboard)
 * - Quick actions section
 * - Search functionality
 */
export function DashboardSidebar({ 
  industry, 
  merchant, 
  collapsed = false,
  onCollapsedChange 
}: DashboardSidebarProps) {
  const navItems = useIndustryNavItems(industry);
  const tasks = useMerchantTasks(merchant.id);
  
  return (
    <aside className={cn(
      "flex flex-col bg-white/90 backdrop-blur-xl border-r transition-all duration-300",
      collapsed ? "w-16" : "w-72"
    )}>
      {/* Logo area */}
      <div className="p-4 border-b">
        <Logo collapsed={collapsed} />
      </div>
      
      {/* My Tasks Panel */}
      {!collapsed && (
        <div className="p-4 border-b">
          <MyTasksPanel tasks={tasks} />
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-auto">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </nav>
      
      {/* Collapse toggle */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>
    </aside>
  );
}
```

### 1.5 Unified Configuration System

**File:** `packages/dashboard-engine/src/config/ConfigResolver.ts`

```typescript
/**
 * ConfigResolver - Single source of truth for all industry configuration
 * 
 * Replaces:
 * - industry-archetypes.ts
 * - industry-dashboard-definitions.ts
 * - industry-dashboard-config.ts
 * - industry.ts
 * - dashboard-variants.ts
 */

interface ResolvedConfig {
  industry: IndustrySlug;
  archetype: 'commerce' | 'food' | 'bookings' | 'content';
  designCategory: DesignCategory;
  themePreset: ThemePreset;
  modules: ModuleConfig[];
  dashboard: DashboardConfig;
  sidebar: SidebarConfig;
  features: FeatureConfig;
}

export class ConfigResolver {
  private static instance: ConfigResolver;
  
  static getInstance(): ConfigResolver {
    if (!ConfigResolver.instance) {
      ConfigResolver.instance = new ConfigResolver();
    }
    return ConfigResolver.instance;
  }
  
  resolve(
    industry: IndustrySlug, 
    planTier: PlanTier,
    overrides?: Partial<ResolvedConfig>
  ): ResolvedConfig {
    const archetype = this.getArchetype(industry);
    const designCategory = this.getDesignCategory(industry);
    const themePreset = this.getThemePreset(designCategory);
    const modules = this.getModules(industry, planTier);
    const dashboard = this.getDashboardConfig(industry);
    const sidebar = this.getSidebarConfig(industry);
    const features = this.getFeatures(industry, planTier);
    
    return {
      industry,
      archetype,
      designCategory,
      themePreset,
      modules,
      dashboard,
      sidebar,
      features,
      ...overrides,
    };
  }
}
```

## Files to Create

```
packages/dashboard-engine/
├── src/
│   ├── index.ts
│   ├── shell/
│   │   ├── DashboardShell.tsx
│   │   └── index.ts
│   ├── sidebar/
│   │   ├── DashboardSidebar.tsx
│   │   ├── MyTasksPanel.tsx
│   │   ├── NavItem.tsx
│   │   └── index.ts
│   ├── components/
│   │   ├── StoreInfoHeader.tsx
│   │   ├── StoreLogo.tsx
│   │   ├── UserDropdown.tsx
│   │   └── index.ts
│   ├── theme/
│   │   ├── GradientBackground.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── index.ts
│   ├── config/
│   │   ├── ConfigResolver.ts
│   │   ├── industry-configs.ts
│   │   └── index.ts
│   └── types/
│       ├── index.ts
│       └── dashboard.types.ts
├── package.json
└── tsconfig.json
```

## Acceptance Criteria

- [ ] DashboardShell renders with sidebar and gradient background
- [ ] GradientBackground changes based on theme preset
- [ ] StoreInfoHeader matches Pro dashboard design
- [ ] Sidebar collapses/expands with animation
- [ ] MyTasksPanel shows tasks like Pro dashboard
- [ ] ConfigResolver returns correct config for each industry
- [ ] All TypeScript types are strict (no `any`)
- [ ] Zero lint errors
- [ ] Zero typecheck errors

---

# PLAN 2: Widget & Component Engine

## Overview
Create a unified widget system that all industry dashboards use for KPI cards, charts, tables, and custom components.

## Deliverables

### 2.1 Widget Registry System

**File:** `packages/widget-engine/src/registry/WidgetRegistry.ts`

```typescript
type WidgetType = 
  | 'kpi-card'
  | 'kpi-card-trend'
  | 'kpi-card-gauge'
  | 'chart-line'
  | 'chart-bar'
  | 'chart-pie'
  | 'chart-donut'
  | 'chart-area'
  | 'table'
  | 'list'
  | 'list-activity'
  | 'list-alerts'
  | 'list-tasks'
  | 'calendar'
  | 'map'
  | 'kanban'
  | 'timeline'
  | 'custom';

interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: DataSourceConfig;
  props: Record<string, unknown>;
  layout: { w: number; h: number; x: number; y: number };
  refreshInterval?: number;
}

class WidgetRegistry {
  private widgets = new Map<WidgetType, WidgetComponent>();
  
  register(type: WidgetType, component: WidgetComponent): void {
    this.widgets.set(type, component);
  }
  
  get(type: WidgetType): WidgetComponent | undefined {
    return this.widgets.get(type);
  }
  
  render(config: WidgetConfig): ReactNode {
    const Component = this.widgets.get(config.type);
    if (!Component) {
      return <FallbackWidget config={config} />;
    }
    return <Component {...config.props} config={config} />;
  }
}

export const widgetRegistry = new WidgetRegistry();
```

### 2.2 KPI Card Widget (Pro Style)

**File:** `packages/widget-engine/src/widgets/KPICard.tsx`

```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: IconName;
  format?: 'number' | 'currency' | 'percent' | 'duration';
  designCategory: DesignCategory;
}

/**
 * KPICard - Matches Pro dashboard KPI cards exactly
 * 
 * Features:
 * - White background with subtle shadow
 * - 28px rounded corners
 * - Trend indicator (up/down arrow)
 * - Icon support
 * - Design category aware styling
 */
export function KPICard({ 
  title, 
  value, 
  change, 
  icon, 
  format,
  designCategory 
}: KPICardProps) {
  const formattedValue = useFormattedValue(value, format);
  
  return (
    <div className={cn(
      "bg-white rounded-[28px] p-6 shadow-sm border border-gray-100",
      "transition-all duration-200 hover:shadow-md"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-semibold mt-2">
            {formattedValue}
          </p>
        </div>
        {icon && (
          <div className={cn(
            "p-2 rounded-lg",
            getIconBgClass(designCategory)
          )}>
            <Icon name={icon} size={20} />
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-1 mt-3">
          <TrendIndicator type={change.type} value={change.value} />
        </div>
      )}
    </div>
  );
}
```

### 2.3 Chart Widgets

**File:** `packages/widget-engine/src/widgets/ChartWidgets.tsx`

```typescript
/**
 * LineChartWidget - Revenue trends chart
 */
export function LineChartWidget({ data, config }: ChartWidgetProps) {
  return (
    <div className="bg-white rounded-[28px] p-6 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">{config.title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * DonutChartWidget - Orders overview chart
 */
export function DonutChartWidget({ data, config }: ChartWidgetProps) {
  return (
    <div className="bg-white rounded-[28px] p-6 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">{config.title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RechartsPieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
      <ChartLegend data={data} />
    </div>
  );
}
```

### 2.4 Industry-Specific Widget Extensions

**File:** `packages/widget-engine/src/widgets/industry/index.ts`

```typescript
/**
 * Industry-specific widgets that extend base widgets
 */

// Fashion widgets
export { SizeCurveWidget } from './fashion/SizeCurveWidget';
export { VisualMerchandisingWidget } from './fashion/VisualMerchandisingWidget';
export { LookbookPreviewWidget } from './fashion/LookbookPreviewWidget';

// Restaurant widgets
export { KDSWidget } from './restaurant/KDSWidget';
export { TableMapWidget } from './restaurant/TableMapWidget';
export { EightySixBoardWidget } from './restaurant/EightySixBoardWidget';

// Education widgets
export { CourseProgressWidget } from './education/CourseProgressWidget';
export { StudentEngagementWidget } from './education/StudentEngagementWidget';

// Events widgets
export { SeatMapWidget } from './events/SeatMapWidget';
export { TicketSalesWidget } from './events/TicketSalesWidget';

// Healthcare widgets
export { PatientQueueWidget } from './healthcare/PatientQueueWidget';
export { AppointmentSlotsWidget } from './healthcare/AppointmentSlotsWidget';

// Real Estate widgets
export { PipelineBoardWidget } from './realestate/PipelineBoardWidget';
export { ShowingCalendarWidget } from './realestate/ShowingCalendarWidget';
```

### 2.5 Widget Grid Layout System

**File:** `packages/widget-engine/src/layout/WidgetGrid.tsx`

```typescript
interface WidgetGridProps {
  widgets: WidgetConfig[];
  columns?: number;
  gap?: number;
  designCategory: DesignCategory;
}

/**
 * WidgetGrid - Responsive grid layout for widgets
 * 
 * Features:
 * - Drag-and-drop reordering (optional)
 * - Responsive breakpoints
 * - Persistent layout storage
 */
export function WidgetGrid({ widgets, columns = 4, gap = 24, designCategory }: WidgetGridProps) {
  return (
    <div 
      className="grid gap-6"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {widgets.map((widget) => (
        <WidgetWrapper key={widget.id} widget={widget}>
          {widgetRegistry.render(widget)}
        </WidgetWrapper>
      ))}
    </div>
  );
}
```

## Files to Create

```
packages/widget-engine/
├── src/
│   ├── index.ts
│   ├── registry/
│   │   ├── WidgetRegistry.ts
│   │   └── index.ts
│   ├── widgets/
│   │   ├── KPICard.tsx
│   │   ├── KPICardTrend.tsx
│   │   ├── KPICardGauge.tsx
│   │   ├── LineChartWidget.tsx
│   │   ├── BarChartWidget.tsx
│   │   ├── DonutChartWidget.tsx
│   │   ├── AreaChartWidget.tsx
│   │   ├── TableWidget.tsx
│   │   ├── ListWidget.tsx
│   │   ├── ActivityListWidget.tsx
│   │   ├── AlertsListWidget.tsx
│   │   ├── TasksListWidget.tsx
│   │   ├── CalendarWidget.tsx
│   │   ├── MapWidget.tsx
│   │   ├── KanbanWidget.tsx
│   │   ├── TimelineWidget.tsx
│   │   ├── industry/
│   │   │   ├── index.ts
│   │   │   ├── fashion/
│   │   │   ├── restaurant/
│   │   │   ├── education/
│   │   │   ├── events/
│   │   │   ├── healthcare/
│   │   │   └── realestate/
│   │   └── index.ts
│   ├── layout/
│   │   ├── WidgetGrid.tsx
│   │   ├── WidgetWrapper.tsx
│   │   └── index.ts
│   └── types/
│       ├── widget.types.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

## Acceptance Criteria

- [ ] WidgetRegistry registers and renders widgets correctly
- [ ] KPICard matches Pro dashboard design exactly
- [ ] All chart widgets render with correct data
- [ ] Industry-specific widgets extend base widgets
- [ ] WidgetGrid supports responsive layouts
- [ ] All widgets support design category theming
- [ ] Zero lint errors
- [ ] Zero typecheck errors

---

# PLAN 3: Theme & Design System Engine

## Overview
Create a comprehensive theme system with settings UI that allows merchants to customize gradient colors, design categories, and theme presets.

## Deliverables

### 3.1 Enhanced Theme Provider

**File:** `packages/theme-engine/src/ThemeProvider.tsx`

```typescript
interface ThemeConfig {
  category: DesignCategory;
  preset: ThemePreset;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    gradientStart?: string;
    gradientEnd?: string;
  };
}

interface ThemeContextValue {
  theme: ThemeConfig;
  setCategory: (category: DesignCategory) => void;
  setPreset: (preset: ThemePreset) => void;
  setCustomColors: (colors: Partial<ThemeConfig['customColors']>) => void;
  resetToDefaults: () => void;
  applyPreset: (preset: ThemePreset) => void;
}

/**
 * ThemeProvider - Enhanced theme management
 * 
 * Features:
 * - Design category selection (signature, glass, bold, dark, natural)
 * - Theme preset selection (12 presets)
 * - Custom color override
 * - Persistent storage
 * - CSS variable injection
 */
export function ThemeProvider({ 
  children, 
  defaultCategory, 
  defaultPreset 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>(() => 
    loadThemeFromStorage() || {
      category: defaultCategory || 'signature',
      preset: defaultPreset || 'default',
    }
  );
  
  // Apply theme to CSS variables
  useEffect(() => {
    applyThemeToDOM(theme);
    saveThemeToStorage(theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, ... }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 3.2 Theme Presets

**File:** `packages/theme-engine/src/presets/index.ts`

```typescript
export interface ThemePresetConfig {
  id: ThemePreset;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradientStart: string;
    gradientEnd: string;
  };
  preview: string; // URL to preview image
}

export const THEME_PRESETS: ThemePresetConfig[] = [
  {
    id: 'default',
    name: 'Clean Blue',
    description: 'Professional blue tones',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#1d4ed8',
      gradientStart: '#eff6ff',
      gradientEnd: '#f8fafc',
    },
    preview: '/themes/clean-blue.png',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Luxury rose gold aesthetic',
    colors: {
      primary: '#f472b6',
      secondary: '#fda4af',
      accent: '#db2777',
      gradientStart: '#fdf2f8',
      gradientEnd: '#fff1f2',
    },
    preview: '/themes/rose-gold.png',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calm ocean blues',
    colors: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      accent: '#0891b2',
      gradientStart: '#ecfeff',
      gradientEnd: '#f0fdfa',
    },
    preview: '/themes/ocean-breeze.png',
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    description: 'Natural green tones',
    colors: {
      primary: '#22c55e',
      secondary: '#4ade80',
      accent: '#16a34a',
      gradientStart: '#f0fdf4',
      gradientEnd: '#ecfdf5',
    },
    preview: '/themes/forest-mist.png',
  },
  {
    id: 'midnight-luxe',
    name: 'Midnight Luxe',
    description: 'Dark premium aesthetic',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#7c3aed',
      gradientStart: '#1e1b4b',
      gradientEnd: '#0f172a',
    },
    preview: '/themes/midnight-luxe.png',
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    description: 'Warm sunset colors',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#ea580c',
      gradientStart: '#fff7ed',
      gradientEnd: '#fef3c7',
    },
    preview: '/themes/sunset-vibes.png',
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    description: 'Artistic purple tones',
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#9333ea',
      gradientStart: '#faf5ff',
      gradientEnd: '#f3e8ff',
    },
    preview: '/themes/creative-purple.png',
  },
  {
    id: 'innovation-blue',
    name: 'Innovation Blue',
    description: 'Tech-forward blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#0284c7',
      gradientStart: '#f0f9ff',
      gradientEnd: '#e0f2fe',
    },
    preview: '/themes/innovation-blue.png',
  },
  {
    id: 'energy-orange',
    name: 'Energy Orange',
    description: 'High-energy orange',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#ea580c',
      gradientStart: '#fff7ed',
      gradientEnd: '#ffedd5',
    },
    preview: '/themes/energy-orange.png',
  },
];
```

### 3.3 Theme Settings UI

**File:** `packages/theme-engine/src/settings/ThemeSettingsPage.tsx`

```typescript
/**
 * ThemeSettingsPage - Settings page for theme customization
 * 
 * Located at: /dashboard/settings/theme
 * 
 * Features:
 * - Design category selector (5 categories)
 * - Theme preset selector (12 presets)
 * - Custom color pickers
 * - Live preview
 * - Reset to defaults
 */
export function ThemeSettingsPage() {
  const { theme, setCategory, setPreset, setCustomColors, resetToDefaults } = useTheme();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Theme Settings</h1>
        <p className="text-muted-foreground">
          Customize your dashboard appearance
        </p>
      </div>
      
      {/* Design Category Section */}
      <section>
        <h2 className="text-lg font-medium mb-4">Design Style</h2>
        <div className="grid grid-cols-5 gap-4">
          {DESIGN_CATEGORIES.map((cat) => (
            <DesignCategoryCard
              key={cat.id}
              category={cat}
              selected={theme.category === cat.id}
              onClick={() => setCategory(cat.id)}
            />
          ))}
        </div>
      </section>
      
      {/* Theme Preset Section */}
      <section>
        <h2 className="text-lg font-medium mb-4">Color Theme</h2>
        <div className="grid grid-cols-3 gap-4">
          {THEME_PRESETS.map((preset) => (
            <ThemePresetCard
              key={preset.id}
              preset={preset}
              selected={theme.preset === preset.id}
              onClick={() => setPreset(preset.id)}
            />
          ))}
        </div>
      </section>
      
      {/* Custom Colors Section */}
      <section>
        <h2 className="text-lg font-medium mb-4">Custom Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          <ColorPickerField
            label="Primary"
            value={theme.customColors?.primary}
            onChange={(color) => setCustomColors({ primary: color })}
          />
          <ColorPickerField
            label="Secondary"
            value={theme.customColors?.secondary}
            onChange={(color) => setCustomColors({ secondary: color })}
          />
          <ColorPickerField
            label="Accent"
            value={theme.customColors?.accent}
            onChange={(color) => setCustomColors({ accent: color })}
          />
          <ColorPickerField
            label="Gradient Start"
            value={theme.customColors?.gradientStart}
            onChange={(color) => setCustomColors({ gradientStart: color })}
          />
          <ColorPickerField
            label="Gradient End"
            value={theme.customColors?.gradientEnd}
            onChange={(color) => setCustomColors({ gradientEnd: color })}
          />
        </div>
      </section>
      
      {/* Live Preview */}
      <section>
        <h2 className="text-lg font-medium mb-4">Live Preview</h2>
        <ThemePreview mode={previewMode} />
      </section>
      
      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={saveTheme}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
```

### 3.4 Gradient Background Component

**File:** `packages/theme-engine/src/components/GradientBackground.tsx`

```typescript
interface GradientBackgroundProps {
  theme: ThemeConfig;
  animated?: boolean;
}

/**
 * GradientBackground - Theme-dependent gradient with blur orbs
 * 
 * Renders:
 * - Base gradient layer (from preset or custom colors)
 * - Animated blur orbs (2-3 floating circles)
 * - Subtle noise texture overlay
 */
export function GradientBackground({ theme, animated = true }: GradientBackgroundProps) {
  const colors = getThemeColors(theme);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
        }}
      />
      
      {/* Blur orbs */}
      <div 
        className={cn(
          "absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-30",
          animated && "animate-float-slow"
        )}
        style={{ backgroundColor: colors.primary }}
      />
      <div 
        className={cn(
          "absolute -bottom-1/2 -left-1/2 w-3/4 h-3/4 rounded-full blur-3xl opacity-20",
          animated && "animate-float-medium"
        )}
        style={{ backgroundColor: colors.secondary }}
      />
      <div 
        className={cn(
          "absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-10",
          animated && "animate-float-fast"
        )}
        style={{ backgroundColor: colors.accent }}
      />
      
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-noise" />
    </div>
  );
}
```

## Files to Create

```
packages/theme-engine/
├── src/
│   ├── index.ts
│   ├── ThemeProvider.tsx
│   ├── presets/
│   │   ├── index.ts
│   │   └── theme-presets.ts
│   ├── settings/
│   │   ├── ThemeSettingsPage.tsx
│   │   ├── DesignCategoryCard.tsx
│   │   ├── ThemePresetCard.tsx
│   │   ├── ColorPickerField.tsx
│   │   ├── ThemePreview.tsx
│   │   └── index.ts
│   ├── components/
│   │   ├── GradientBackground.tsx
│   │   ├── ThemeAwareContainer.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── index.ts
│   └── types/
│       ├── theme.types.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

## Acceptance Criteria

- [ ] ThemeProvider manages theme state correctly
- [ ] 12 theme presets are defined with correct colors
- [ ] ThemeSettingsPage renders all settings options
- [ ] GradientBackground renders with theme colors
- [ ] Custom colors override preset colors
- [ ] Theme persists to localStorage
- [ ] Theme applies to CSS variables
- [ ] Zero lint errors
- [ ] Zero typecheck errors

---

# PLAN 4: Data & Real-time Engine

## Overview
Create a unified data fetching and real-time update system that all industry dashboards use.

## Deliverables

### 4.1 Unified Data Fetching Hook

**File:** `packages/data-engine/src/hooks/useDashboardData.ts`

```typescript
interface DashboardDataConfig {
  industry: IndustrySlug;
  merchantId: string;
  refreshInterval?: number;
  realtimeEnabled?: boolean;
}

interface DashboardDataResult<T> {
  data: T | undefined;
  metrics: Record<string, MetricValue>;
  alerts: DashboardAlert[];
  actions: SuggestedAction[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * useDashboardData - Unified data fetching for all dashboards
 * 
 * Features:
 * - SWR-based caching
 * - Automatic refresh
 * - Real-time updates via WebSocket
 * - Industry-specific data transformation
 */
export function useDashboardData<T = DashboardData>(
  config: DashboardDataConfig
): DashboardDataResult<T> {
  const { industry, merchantId, refreshInterval = 30000, realtimeEnabled = true } = config;
  
  // Fetch initial data
  const { data, error, isLoading, mutate } = useSWR<DashboardDataResponse>(
    `/api/dashboard/${industry}?merchantId=${merchantId}`,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!realtimeEnabled) return;
    
    const subscription = subscribeToDashboard(merchantId, industry, (update) => {
      mutate((current) => mergeUpdate(current, update), false);
    });
    
    return () => subscription.unsubscribe();
  }, [merchantId, industry, realtimeEnabled, mutate]);
  
  return {
    data: data?.data as T,
    metrics: data?.metrics || {},
    alerts: data?.alerts || [],
    actions: data?.actions || [],
    isLoading,
    isError: !!error,
    error,
    refresh: () => mutate(),
    lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : null,
  };
}
```

### 4.2 Real-time WebSocket Manager

**File:** `packages/data-engine/src/realtime/WebSocketManager.ts`

```typescript
type SubscriptionCallback = (data: unknown) => void;

interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

/**
 * WebSocketManager - Unified WebSocket connection management
 * 
 * Features:
 * - Auto-reconnect
 * - Heartbeat/ping-pong
 * - Message queuing when disconnected
 * - Subscription management
 * - Connection status tracking
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Set<SubscriptionCallback>>();
  private messageQueue: unknown[] = [];
  private reconnectAttempts = 0;
  private status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  
  constructor(private config: WebSocketConfig) {}
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.status = 'connecting';
      this.ws = new WebSocket(this.config.url);
      
      this.ws.onopen = () => {
        this.status = 'connected';
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onclose = () => {
        this.status = 'disconnected';
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        this.status = 'error';
        reject(error);
      };
    });
  }
  
  subscribe(channel: string, callback: SubscriptionCallback): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
      this.send({ type: 'subscribe', channel });
    }
    
    this.subscriptions.get(channel)!.add(callback);
    
    return () => {
      this.subscriptions.get(channel)?.delete(callback);
      if (this.subscriptions.get(channel)?.size === 0) {
        this.subscriptions.delete(channel);
        this.send({ type: 'unsubscribe', channel });
      }
    };
  }
  
  private handleMessage(message: { channel: string; data: unknown }): void {
    const callbacks = this.subscriptions.get(message.channel);
    if (callbacks) {
      callbacks.forEach((cb) => cb(message.data));
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.config.reconnectAttempts || 5)) {
      return;
    }
    
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect().catch(console.error);
    }, this.config.reconnectInterval || 3000);
  }
  
  private send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
}
```

### 4.3 Industry Data Transformers

**File:** `packages/data-engine/src/transformers/index.ts`

```typescript
/**
 * Industry-specific data transformers
 * 
 * Each transformer converts raw API data to dashboard-ready format
 */

export interface DataTransformer<T> {
  transform(raw: unknown): T;
  getMetrics(data: T): Record<string, MetricValue>;
  getAlerts(data: T): DashboardAlert[];
  getActions(data: T): SuggestedAction[];
}

// Retail transformer
export class RetailDataTransformer implements DataTransformer<RetailDashboardData> {
  transform(raw: unknown): RetailDashboardData {
    return {
      orders: this.transformOrders(raw.orders),
      products: this.transformProducts(raw.products),
      customers: this.transformCustomers(raw.customers),
      inventory: this.transformInventory(raw.inventory),
    };
  }
  
  getMetrics(data: RetailDashboardData): Record<string, MetricValue> {
    return {
      revenue: { value: data.orders.totalRevenue, change: data.orders.revenueChange },
      orders: { value: data.orders.total, change: data.orders.change },
      customers: { value: data.customers.total, change: data.customers.change },
      conversion: { value: data.orders.conversionRate, change: data.orders.conversionChange },
    };
  }
  
  // ... other methods
}

// Fashion transformer
export class FashionDataTransformer implements DataTransformer<FashionDashboardData> {
  // Similar implementation with fashion-specific metrics
}

// Restaurant transformer
export class RestaurantDataTransformer implements DataTransformer<RestaurantDashboardData> {
  // Includes KDS data, table turns, etc.
}

// Education transformer
export class EducationDataTransformer implements DataTransformer<EducationDashboardData> {
  // Includes courses, students, enrollments
}

// Events transformer
export class EventsDataTransformer implements DataTransformer<EventsDashboardData> {
  // Includes ticket sales, attendees, seating
}

// SaaS transformer
export class SaaSDataTransformer implements DataTransformer<SaaSDashboardData> {
  // Includes MRR, ARR, churn, tenants
}

// Healthcare transformer
export class HealthcareDataTransformer implements DataTransformer<HealthcareDashboardData> {
  // Includes patients, appointments, queue
}

// Real Estate transformer
export class RealEstateDataTransformer implements DataTransformer<RealEstateDashboardData> {
  // Includes listings, showings, pipeline
}

// Beauty transformer
export class BeautyDataTransformer implements DataTransformer<BeautyDashboardData> {
  // Includes bookings, services, clients
}

// Creative transformer
export class CreativeDataTransformer implements DataTransformer<CreativeDashboardData> {
  // Includes projects, clients, resources
}

// Transformer registry
export const TRANSFORMERS: Record<IndustrySlug, DataTransformer<unknown>> = {
  retail: new RetailDataTransformer(),
  fashion: new FashionDataTransformer(),
  restaurant: new RestaurantDataTransformer(),
  education: new EducationDataTransformer(),
  events: new EventsDataTransformer(),
  saas: new SaaSDataTransformer(),
  healthcare: new HealthcareDataTransformer(),
  real_estate: new RealEstateDataTransformer(),
  beauty: new BeautyDataTransformer(),
  creative: new CreativeDataTransformer(),
};
```

### 4.4 API Route Standardization

**File:** `packages/data-engine/src/api/BaseDashboardController.ts`

```typescript
/**
 * BaseDashboardController - Standardized API controller for dashboards
 * 
 * All industry dashboard APIs should extend this class
 */
export abstract class BaseDashboardController<T> {
  protected abstract getTransformer(): DataTransformer<T>;
  
  async GET(request: NextRequest): Promise<NextResponse> {
    try {
      const { merchantId, range } = this.parseQuery(request);
      
      // Verify authentication
      const session = await this.verifySession(request);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Fetch raw data
      const rawData = await this.fetchData(merchantId, range);
      
      // Transform data
      const transformer = this.getTransformer();
      const data = transformer.transform(rawData);
      
      // Get metrics, alerts, actions
      const metrics = transformer.getMetrics(data);
      const alerts = transformer.getAlerts(data);
      const actions = transformer.getActions(data);
      
      return NextResponse.json({
        success: true,
        data,
        metrics,
        alerts,
        actions,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Dashboard API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  
  protected abstract fetchData(merchantId: string, range: string): Promise<unknown>;
  
  protected parseQuery(request: NextRequest): { merchantId: string; range: string } {
    const url = new URL(request.url);
    return {
      merchantId: url.searchParams.get('merchantId') || '',
      range: url.searchParams.get('range') || 'month',
    };
  }
  
  protected async verifySession(request: NextRequest): Promise<Session | null> {
    // Implementation depends on auth system
    return verifyAuth(request);
  }
}
```

## Files to Create

```
packages/data-engine/
├── src/
│   ├── index.ts
│   ├── hooks/
│   │   ├── useDashboardData.ts
│   │   ├── useMetrics.ts
│   │   ├── useAlerts.ts
│   │   ├── useActions.ts
│   │   └── index.ts
│   ├── realtime/
│   │   ├── WebSocketManager.ts
│   │   ├── SubscriptionManager.ts
│   │   └── index.ts
│   ├── transformers/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── RetailTransformer.ts
│   │   ├── FashionTransformer.ts
│   │   ├── RestaurantTransformer.ts
│   │   ├── EducationTransformer.ts
│   │   ├── EventsTransformer.ts
│   │   ├── SaaSTransformer.ts
│   │   ├── HealthcareTransformer.ts
│   │   ├── RealEstateTransformer.ts
│   │   ├── BeautyTransformer.ts
│   │   └── CreativeTransformer.ts
│   ├── api/
│   │   ├── BaseDashboardController.ts
│   │   └── index.ts
│   └── types/
│       ├── data.types.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

## Acceptance Criteria

- [ ] useDashboardData fetches and caches data correctly
- [ ] WebSocketManager connects and reconnects properly
- [ ] All 10 industry transformers are implemented
- [ ] BaseDashboardController provides standardized API
- [ ] Real-time updates work across all dashboards
- [ ] Zero lint errors
- [ ] Zero typecheck errors

---

# PLAN 5: Industry Dashboard Migrations

## Overview
Migrate all 10 industry dashboards to use the new engine architecture while preserving industry-specific features.

## Deliverables

### 5.1 Migration Strategy

For each industry dashboard:

1. **Create new dashboard file** using engine components
2. **Map existing widgets** to new widget system
3. **Implement industry-specific widgets** as extensions
4. **Update data fetching** to use data engine
5. **Test thoroughly** before replacing old dashboard

### 5.2 Industry Dashboard Templates

**File:** `packages/dashboard-engine/src/industries/createIndustryDashboard.tsx`

```typescript
interface IndustryDashboardConfig {
  industry: IndustrySlug;
  widgets: WidgetConfig[];
  sidebarItems: SidebarItem[];
  headerConfig: HeaderConfig;
  dataConfig: DataConfig;
}

/**
 * createIndustryDashboard - Factory function for industry dashboards
 */
export function createIndustryDashboard(config: IndustryDashboardConfig) {
  return function IndustryDashboard() {
    const { industry } = config;
    const { theme } = useTheme();
    const { data, metrics, alerts, actions, isLoading } = useDashboardData({
      industry,
      merchantId: useMerchantId(),
    });
    
    return (
      <DashboardShell industry={industry} theme={theme}>
        {/* KPI Row */}
        <WidgetGrid columns={4} gap={24} designCategory={theme.category}>
          {config.widgets
            .filter(w => w.type === 'kpi-card')
            .map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} data={data} />
            ))}
        </WidgetGrid>
        
        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Charts Section */}
          <div className="col-span-2 space-y-6">
            {config.widgets
              .filter(w => w.type.startsWith('chart-'))
              .map(widget => (
                <WidgetRenderer key={widget.id} widget={widget} data={data} />
              ))}
          </div>
          
          {/* Sidebar Section */}
          <div className="space-y-6">
            {config.widgets
              .filter(w => w.type === 'list' || w.type === 'donut')
              .map(widget => (
                <WidgetRenderer key={widget.id} widget={widget} data={data} />
              ))}
          </div>
        </div>
        
        {/* Industry-Specific Section */}
        <div className="mt-6">
          <IndustrySpecificSection industry={industry} data={data} />
        </div>
      </DashboardShell>
    );
  };
}
```

### 5.3 Individual Industry Migrations

#### 5.3.1 Retail Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/retail/page.tsx`

```typescript
const RETAIL_CONFIG: IndustryDashboardConfig = {
  industry: 'retail',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Revenue', dataSource: 'metrics.revenue' },
    { id: 'orders', type: 'kpi-card-trend', title: 'Orders', dataSource: 'metrics.orders' },
    { id: 'customers', type: 'kpi-card-trend', title: 'Customers', dataSource: 'metrics.customers' },
    { id: 'conversion', type: 'kpi-card-trend', title: 'Conversion', dataSource: 'metrics.conversion' },
    
    // Charts
    { id: 'revenue-chart', type: 'chart-line', title: 'Revenue Trend', dataSource: 'charts.revenue' },
    { id: 'orders-donut', type: 'chart-donut', title: 'Orders Overview', dataSource: 'charts.orders' },
    
    // Lists
    { id: 'top-products', type: 'table', title: 'Top Products', dataSource: 'tables.topProducts' },
    { id: 'recent-orders', type: 'list', title: 'Recent Orders', dataSource: 'lists.recentOrders' },
    { id: 'inventory-alerts', type: 'list-alerts', title: 'Inventory Alerts', dataSource: 'alerts.inventory' },
    
    // Retail-specific
    { id: 'loyalty-stats', type: 'kpi-card-gauge', title: 'Loyalty Program', dataSource: 'metrics.loyalty' },
  ],
  sidebarItems: RETAIL_SIDEBAR_ITEMS,
  headerConfig: { showPreview: true, showPublish: true },
  dataConfig: { refreshInterval: 30000, realtimeEnabled: true },
};

export default createIndustryDashboard(RETAIL_CONFIG);
```

#### 5.3.2 Fashion Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/fashion/page.tsx`

```typescript
const FASHION_CONFIG: IndustryDashboardConfig = {
  industry: 'fashion',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Revenue', dataSource: 'metrics.revenue' },
    { id: 'orders', type: 'kpi-card-trend', title: 'Orders', dataSource: 'metrics.orders' },
    { id: 'return-rate', type: 'kpi-card-trend', title: 'Return Rate', dataSource: 'metrics.returnRate', invertTrend: true },
    { id: 'sell-through', type: 'kpi-card-trend', title: 'Sell-Through', dataSource: 'metrics.sellThrough' },
    
    // Charts
    { id: 'revenue-chart', type: 'chart-area', title: 'Revenue & AI Conversions', dataSource: 'charts.revenue' },
    { id: 'orders-donut', type: 'chart-donut', title: 'Orders Overview', dataSource: 'charts.orders' },
    
    // Fashion-specific
    { id: 'size-curve', type: 'chart-bar', title: 'Size Curve Analysis', dataSource: 'charts.sizeCurve' },
    { id: 'collection-health', type: 'heatmap', title: 'Collection Health', dataSource: 'charts.collectionHealth' },
    { id: 'drop-calendar', type: 'calendar', title: 'Collection Drops', dataSource: 'calendar.drops' },
  ],
  sidebarItems: FASHION_SIDEBAR_ITEMS,
  headerConfig: { showPreview: true, showPublish: true },
  dataConfig: { refreshInterval: 30000, realtimeEnabled: true },
};

export default createIndustryDashboard(FASHION_CONFIG);
```

#### 5.3.3 Restaurant Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/restaurant/page.tsx`

```typescript
const RESTAURANT_CONFIG: IndustryDashboardConfig = {
  industry: 'restaurant',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Revenue', dataSource: 'metrics.revenue' },
    { id: 'orders', type: 'kpi-card-trend', title: 'Orders', dataSource: 'metrics.orders' },
    { id: 'avg-prep-time', type: 'kpi-card', title: 'Avg Prep Time', dataSource: 'metrics.avgPrepTime', format: 'duration' },
    { id: 'table-turns', type: 'kpi-card', title: 'Table Turns/Hour', dataSource: 'metrics.tableTurns' },
    
    // Restaurant-specific
    { id: 'kds', type: 'kds', title: 'Kitchen Display', dataSource: 'realtime.kds' },
    { id: 'table-map', type: 'table-map', title: 'Floor Plan', dataSource: 'realtime.tables' },
    { id: '86-list', type: 'list-alerts', title: '86 List', dataSource: 'alerts.eightySix' },
    { id: 'recipe-costs', type: 'table', title: 'Recipe Margins', dataSource: 'tables.recipeCosts' },
  ],
  sidebarItems: RESTAURANT_SIDEBAR_ITEMS,
  headerConfig: { showPreview: false, showPublish: false },
  dataConfig: { refreshInterval: 5000, realtimeEnabled: true }, // Faster refresh for restaurant
};

export default createIndustryDashboard(RESTAURANT_CONFIG);
```

#### 5.3.4 Education Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/education/page.tsx`

```typescript
const EDUCATION_CONFIG: IndustryDashboardConfig = {
  industry: 'education',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Revenue', dataSource: 'metrics.revenue' },
    { id: 'enrollments', type: 'kpi-card-trend', title: 'Enrollments', dataSource: 'metrics.enrollments' },
    { id: 'completion-rate', type: 'kpi-card-trend', title: 'Completion Rate', dataSource: 'metrics.completionRate' },
    { id: 'active-students', type: 'kpi-card', title: 'Active Students', dataSource: 'metrics.activeStudents' },
    
    // Education-specific
    { id: 'course-progress', type: 'list', title: 'Active Courses', dataSource: 'lists.activeCourses' },
    { id: 'student-engagement', type: 'chart-line', title: 'Student Engagement', dataSource: 'charts.engagement' },
    { id: 'grading-queue', type: 'list-tasks', title: 'Grading Queue', dataSource: 'tasks.grading' },
    { id: 'certificates', type: 'list', title: 'Recent Certificates', dataSource: 'lists.certificates' },
  ],
  sidebarItems: EDUCATION_SIDEBAR_ITEMS,
  headerConfig: { showPreview: true, showPublish: true },
  dataConfig: { refreshInterval: 60000, realtimeEnabled: true },
};

export default createIndustryDashboard(EDUCATION_CONFIG);
```

#### 5.3.5 Events Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/events/page.tsx`

```typescript
const EVENTS_CONFIG: IndustryDashboardConfig = {
  industry: 'events',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Ticket Revenue', dataSource: 'metrics.revenue' },
    { id: 'tickets', type: 'kpi-card-trend', title: 'Tickets Sold', dataSource: 'metrics.tickets' },
    { id: 'attendees', type: 'kpi-card', title: 'Attendees', dataSource: 'metrics.attendees' },
    { id: 'check-in-rate', type: 'kpi-card-gauge', title: 'Check-in Rate', dataSource: 'metrics.checkInRate' },
    
    // Events-specific
    { id: 'ticket-sales', type: 'chart-bar', title: 'Live Ticket Sales', dataSource: 'realtime.ticketSales' },
    { id: 'seat-map', type: 'seat-map', title: 'Seating', dataSource: 'seating.current' },
    { id: 'attendee-check-in', type: 'list', title: 'Recent Check-ins', dataSource: 'lists.checkIns' },
    { id: 'event-timeline', type: 'timeline', title: 'Event Timeline', dataSource: 'timeline.event' },
  ],
  sidebarItems: EVENTS_SIDEBAR_ITEMS,
  headerConfig: { showPreview: true, showPublish: true },
  dataConfig: { refreshInterval: 10000, realtimeEnabled: true },
};

export default createIndustryDashboard(EVENTS_CONFIG);
```

#### 5.3.6 SaaS Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/saas/page.tsx`

```typescript
const SAAS_CONFIG: IndustryDashboardConfig = {
  industry: 'saas',
  widgets: [
    // KPI Row
    { id: 'mrr', type: 'kpi-card-trend', title: 'MRR', dataSource: 'metrics.mrr' },
    { id: 'arr', type: 'kpi-card-trend', title: 'ARR', dataSource: 'metrics.arr' },
    { id: 'tenants', type: 'kpi-card', title: 'Active Tenants', dataSource: 'metrics.tenants' },
    { id: 'churn', type: 'kpi-card-trend', title: 'Churn Rate', dataSource: 'metrics.churn', invertTrend: true },
    
    // SaaS-specific
    { id: 'mrr-chart', type: 'chart-area', title: 'MRR Growth', dataSource: 'charts.mrr' },
    { id: 'tenant-health', type: 'table', title: 'Tenant Health', dataSource: 'tables.tenants' },
    { id: 'usage-analytics', type: 'chart-line', title: 'API Usage', dataSource: 'charts.usage' },
    { id: 'feature-flags', type: 'list', title: 'Feature Flags', dataSource: 'lists.features' },
  ],
  sidebarItems: SAAS_SIDEBAR_ITEMS,
  headerConfig: { showPreview: false, showPublish: false },
  dataConfig: { refreshInterval: 60000, realtimeEnabled: true },
};

export default createIndustryDashboard(SAAS_CONFIG);
```

#### 5.3.7 Healthcare Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/healthcare/page.tsx`

```typescript
const HEALTHCARE_CONFIG: IndustryDashboardConfig = {
  industry: 'healthcare',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Revenue', dataSource: 'metrics.revenue' },
    { id: 'appointments', type: 'kpi-card', title: "Today's Appointments", dataSource: 'metrics.appointments' },
    { id: 'patients-waiting', type: 'kpi-card', title: 'Patients Waiting', dataSource: 'realtime.waiting' },
    { id: 'avg-wait', type: 'kpi-card', title: 'Avg Wait Time', dataSource: 'metrics.avgWait', format: 'duration' },
    
    // Healthcare-specific
    { id: 'patient-queue', type: 'list', title: 'Patient Queue', dataSource: 'realtime.queue' },
    { id: 'appointment-slots', type: 'calendar', title: 'Availability', dataSource: 'calendar.slots' },
    { id: 'insurance-status', type: 'table', title: 'Pending Verifications', dataSource: 'tables.insurance' },
  ],
  sidebarItems: HEALTHCARE_SIDEBAR_ITEMS,
  headerConfig: { showPreview: false, showPublish: false },
  dataConfig: { refreshInterval: 10000, realtimeEnabled: true },
};

export default createIndustryDashboard(HEALTHCARE_CONFIG);
```

#### 5.3.8 Real Estate Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/realestate/page.tsx`

```typescript
const REALESTATE_CONFIG: IndustryDashboardConfig = {
  industry: 'real_estate',
  widgets: [
    // KPI Row
    { id: 'pipeline-value', type: 'kpi-card-trend', title: 'Pipeline Value', dataSource: 'metrics.pipelineValue' },
    { id: 'listings', type: 'kpi-card', title: 'Active Listings', dataSource: 'metrics.listings' },
    { id: 'showings', type: 'kpi-card', title: "Today's Showings", dataSource: 'metrics.showings' },
    { id: 'avg-dom', type: 'kpi-card', title: 'Avg Days on Market', dataSource: 'metrics.avgDom' },
    
    // Real Estate-specific
    { id: 'pipeline-board', type: 'kanban', title: 'Deal Pipeline', dataSource: 'boards.pipeline' },
    { id: 'showing-calendar', type: 'calendar', title: 'Showings', dataSource: 'calendar.showings' },
    { id: 'lead-scores', type: 'table', title: 'Hot Leads', dataSource: 'tables.leads' },
  ],
  sidebarItems: REALESTATE_SIDEBAR_ITEMS,
  headerConfig: { showPreview: false, showPublish: false },
  dataConfig: { refreshInterval: 60000, realtimeEnabled: true },
};

export default createIndustryDashboard(REALESTATE_CONFIG);
```

#### 5.3.9 Beauty Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/beauty/page.tsx`

```typescript
const BEAUTY_CONFIG: IndustryDashboardConfig = {
  industry: 'beauty',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Revenue', dataSource: 'metrics.revenue' },
    { id: 'bookings', type: 'kpi-card', title: "Today's Bookings", dataSource: 'metrics.bookings' },
    { id: 'clients', type: 'kpi-card-trend', title: 'Total Clients', dataSource: 'metrics.clients' },
    { id: 'membership', type: 'kpi-card', title: 'Active Members', dataSource: 'metrics.membership' },
    
    // Beauty-specific
    { id: 'booking-calendar', type: 'calendar', title: 'Appointments', dataSource: 'calendar.bookings' },
    { id: 'staff-performance', type: 'table', title: 'Staff Performance', dataSource: 'tables.staff' },
    { id: 'product-recommendations', type: 'list', title: 'Product Sales', dataSource: 'lists.products' },
  ],
  sidebarItems: BEAUTY_SIDEBAR_ITEMS,
  headerConfig: { showPreview: true, showPublish: true },
  dataConfig: { refreshInterval: 30000, realtimeEnabled: true },
};

export default createIndustryDashboard(BEAUTY_CONFIG);
```

#### 5.3.10 Creative Dashboard

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/creative/page.tsx`

```typescript
const CREATIVE_CONFIG: IndustryDashboardConfig = {
  industry: 'creative',
  widgets: [
    // KPI Row
    { id: 'revenue', type: 'kpi-card-trend', title: 'Revenue', dataSource: 'metrics.revenue' },
    { id: 'projects', type: 'kpi-card', title: 'Active Projects', dataSource: 'metrics.projects' },
    { id: 'clients', type: 'kpi-card', title: 'Clients', dataSource: 'metrics.clients' },
    { id: 'utilization', type: 'kpi-card-gauge', title: 'Resource Utilization', dataSource: 'metrics.utilization' },
    
    // Creative-specific
    { id: 'project-pipeline', type: 'kanban', title: 'Project Pipeline', dataSource: 'boards.projects' },
    { id: 'time-tracking', type: 'list', title: 'Time Entries', dataSource: 'lists.timeEntries' },
    { id: 'resource-allocation', type: 'chart-bar', title: 'Team Allocation', dataSource: 'charts.allocation' },
  ],
  sidebarItems: CREATIVE_SIDEBAR_ITEMS,
  headerConfig: { showPreview: true, showPublish: true },
  dataConfig: { refreshInterval: 60000, realtimeEnabled: true },
};

export default createIndustryDashboard(CREATIVE_CONFIG);
```

## Files to Create

```
Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/
├── retail/
│   └── page.tsx
├── fashion/
│   └── page.tsx
├── restaurant/
│   └── page.tsx
├── education/
│   └── page.tsx
├── events/
│   └── page.tsx
├── saas/
│   └── page.tsx
├── healthcare/
│   └── page.tsx
├── realestate/
│   └── page.tsx
├── beauty/
│   └── page.tsx
├── creative/
│   └── page.tsx
└── index.ts
```

## Acceptance Criteria

- [ ] All 10 industry dashboards migrated
- [ ] Each dashboard uses DashboardShell
- [ ] Each dashboard has gradient blur background
- [ ] Each dashboard has Pro-style sidebar
- [ ] Each dashboard has StoreInfoHeader
- [ ] Industry-specific widgets work correctly
- [ ] Data fetching works through data engine
- [ ] Real-time updates work
- [ ] Zero lint errors
- [ ] Zero typecheck errors

---

# PLAN 6: Integration & Testing

## Overview
Integrate all 5 parallel plans and perform comprehensive testing before deployment.

## Prerequisites
- Plan 1: Core Infrastructure Engine ✅
- Plan 2: Widget & Component Engine ✅
- Plan 3: Theme & Design System Engine ✅
- Plan 4: Data & Real-time Engine ✅
- Plan 5: Industry Migrations ✅

## Deliverables

### 6.1 Package Integration

**File:** `packages/dashboard-engine/package.json`

```json
{
  "name": "@vayva/dashboard-engine",
  "version": "1.0.0",
  "dependencies": {
    "@vayva/widget-engine": "workspace:*",
    "@vayva/theme-engine": "workspace:*",
    "@vayva/data-engine": "workspace:*",
    "@vayva/ui": "workspace:*",
    "@vayva/shared": "workspace:*"
  }
}
```

### 6.2 Main Dashboard Router

**File:** `Frontend/merchant-admin/src/app/(dashboard)/dashboard/page.tsx`

```typescript
/**
 * Main Dashboard Router
 * 
 * Routes to the correct industry dashboard based on merchant's industry
 */
export default function DashboardPage() {
  const { merchant } = useAuth();
  const industry = merchant?.industrySlug || 'retail';
  
  // Map industry to dashboard component
  const DashboardComponent = INDUSTRY_DASHBOARD_MAP[industry] || RetailDashboard;
  
  return <DashboardComponent />;
}

const INDUSTRY_DASHBOARD_MAP: Record<IndustrySlug, React.ComponentType> = {
  retail: RetailDashboard,
  fashion: FashionDashboard,
  restaurant: RestaurantDashboard,
  education: EducationDashboard,
  events: EventsDashboard,
  saas: SaaSDashboard,
  healthcare: HealthcareDashboard,
  real_estate: RealEstateDashboard,
  beauty: BeautyDashboard,
  creative: CreativeDashboard,
};
```

### 6.3 E2E Test Suite

**File:** `tests/e2e/dashboard.spec.ts`

```typescript
describe('Dashboard Engine', () => {
  describe('All Industry Dashboards', () => {
    const industries = [
      'retail', 'fashion', 'restaurant', 'education', 'events',
      'saas', 'healthcare', 'real_estate', 'beauty', 'creative'
    ];
    
    industries.forEach((industry) => {
      describe(`${industry} dashboard`, () => {
        beforeEach(async () => {
          await page.goto(`/dashboard?industry=${industry}`);
        });
        
        it('should render DashboardShell', async () => {
          await expect(page.locator('.dashboard-shell')).toBeVisible();
        });
        
        it('should render gradient background', async () => {
          await expect(page.locator('.gradient-background')).toBeVisible();
        });
        
        it('should render sidebar', async () => {
          await expect(page.locator('.dashboard-sidebar')).toBeVisible();
        });
        
        it('should render store info header', async () => {
          await expect(page.locator('.store-info-header')).toBeVisible();
        });
        
        it('should render KPI cards', async () => {
          await expect(page.locator('.kpi-card').first()).toBeVisible();
        });
        
        it('should have correct design category', async () => {
          const category = await page.getAttribute('[data-design-category]', 'data-design-category');
          expect(category).toBe(EXPECTED_CATEGORIES[industry]);
        });
      });
    });
  });
  
  describe('Theme System', () => {
    it('should allow theme changes from settings', async () => {
      await page.goto('/dashboard/settings/theme');
      
      // Change design category
      await page.click('[data-testid="design-category-glass"]');
      
      // Verify change applied
      await expect(page.locator('[data-design-category="glass"]')).toBeVisible();
    });
    
    it('should persist theme preference', async () => {
      await page.goto('/dashboard/settings/theme');
      await page.click('[data-testid="theme-preset-midnight-luxe"]');
      
      // Reload page
      await page.reload();
      
      // Verify theme persisted
      await expect(page.locator('[data-theme-preset="midnight-luxe"]')).toBeVisible();
    });
  });
  
  describe('Real-time Updates', () => {
    it('should receive WebSocket updates', async () => {
      // Setup WebSocket mock
      // Trigger update
      // Verify UI updated
    });
  });
});
```

### 6.4 Performance Benchmarks

**File:** `tests/performance/dashboard.bench.ts`

```typescript
describe('Dashboard Performance', () => {
  it('should render initial dashboard in < 1s', async () => {
    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForSelector('.dashboard-shell');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });
  
  it('should have no layout shifts', async () => {
    await page.goto('/dashboard');
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });
    
    expect(cls).toBeLessThan(0.1);
  });
  
  it('should handle real-time updates efficiently', async () => {
    // Setup WebSocket
    // Send 100 updates
    // Verify no memory leaks
    // Verify smooth rendering
  });
});
```

### 6.5 Migration Guide

**File:** `docs/DASHBOARD_MIGRATION_GUIDE.md`

```markdown
# Dashboard Migration Guide

## For Developers

### Adding a New Industry Dashboard

1. Create config in `packages/dashboard-engine/src/config/industry-configs.ts`
2. Create data transformer in `packages/data-engine/src/transformers/`
3. Create industry-specific widgets in `packages/widget-engine/src/widgets/industry/`
4. Create dashboard page in `Frontend/merchant-admin/src/app/(dashboard)/dashboard/industries/`
5. Register in `INDUSTRY_DASHBOARD_MAP`

### Adding a New Widget

1. Create widget component in `packages/widget-engine/src/widgets/`
2. Register in `WidgetRegistry`
3. Add type to `WidgetType`
4. Add industry-specific extensions if needed

### Customizing Theme

1. Add preset in `packages/theme-engine/src/presets/`
2. Add colors to `ThemePresetConfig`
3. Update `THEME_PRESETS` array

## For Merchants

### Changing Dashboard Theme

1. Go to Settings > Theme
2. Select Design Style (signature, glass, bold, dark, natural)
3. Select Color Theme (12 presets available)
4. Optionally customize individual colors
5. Click Save Changes

### Customizing Dashboard Layout

1. Click Edit Layout button
2. Drag widgets to rearrange
3. Resize widgets as needed
4. Click Save Layout
```

## Acceptance Criteria

- [ ] All packages integrate correctly
- [ ] Main dashboard router works for all industries
- [ ] E2E tests pass for all 10 industries
- [ ] Performance benchmarks meet targets
- [ ] Migration guide is complete
- [ ] Zero lint errors
- [ ] Zero typecheck errors
- [ ] All tests pass

---

## Summary

### Plan Execution Order

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL EXECUTION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Plan 1          Plan 2          Plan 3          Plan 4        │
│   Core Infra      Widgets         Theme           Data          │
│   ──────────      ──────────      ──────────      ──────────   │
│   Shell           Registry        Provider        Hooks         │
│   Sidebar         KPI Cards       Presets         Transformers  │
│   Header          Charts          Settings        WebSocket     │
│   Config          Grid            Gradients       API           │
│                                                                  │
│                      Plan 5                                      │
│                      Migrations                                  │
│                      ──────────                                  │
│                      10 Industries                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    SEQUENTIAL EXECUTION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      Plan 6                                      │
│                      Integration                                 │
│                      ──────────                                  │
│                      Package Integration                         │
│                      Router Setup                                │
│                      E2E Tests                                   │
│                      Performance Benchmarks                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### File Count Summary

| Plan | New Files | Modified Files |
|------|-----------|----------------|
| Plan 1 | 15 | 0 |
| Plan 2 | 25 | 0 |
| Plan 3 | 12 | 0 |
| Plan 4 | 20 | 0 |
| Plan 5 | 11 | 0 |
| Plan 6 | 5 | 2 |
| **Total** | **88** | **2** |

### Success Metrics

| Metric | Target |
|--------|--------|
| Typecheck Errors | 0 |
| Lint Errors | 0 |
| Test Coverage | 80%+ |
| Initial Load Time | < 1s |
| CLS Score | < 0.1 |
| WebSocket Latency | < 100ms |

---

*Document Version: 1.0.0*  
*Status: Ready for Execution*
