# Component Inventory for Consolidation
## Duplicated Components Across Vayva Codebase

**Generated:** March 11, 2026  
**Purpose:** Identify components to consolidate into @vayva/industry-core

---

## 📋 Component Categories

### 1. Metric/Stat Cards (HIGH PRIORITY - 15+ duplicates)
Various implementations of metric/statistic display components

**Found in:**
- `Frontend/merchant-admin/src/components/dashboard/` - Multiple industry folders
- `Frontend/merchant-admin/src/app/(dashboard)/dashboard/analytics/page.tsx` - MetricCard component
- `Frontend/merchant-admin/src/app/(dashboard)/dashboard/reports/page.tsx` - MetricCard component
- `Frontend/merchant-admin/src/components/beauty/BeautyMetricCard.tsx`
- `Frontend/merchant-admin/src/components/real-estate/KPIRow.tsx`
- `Frontend/merchant-admin/src/components/dashboard/saas/SaaSMetricCard.tsx`
- `Frontend/merchant-admin/src/components/dashboard/universal/UniversalMetricCard.tsx`
- `Backend/core-api/src/components/dashboard-v2/DashboardLegacyContent.tsx` - StatWidget references
- `Frontend/ops-console/src/components/ops/OpsStatCard.tsx`

**Common Features Needed:**
- Title display
- Value formatting (numbers, currency, percentages)
- Trend indicators (up/down arrows, colors)
- Loading states
- Icons/badges
- Sparkline mini-charts
- Responsive sizing

**Proposed Industry-Core Component:**
```typescript
interface MetricCardProps {
  id: string;
  title: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percentage' | 'compact';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ComponentType<{className?: string}>;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  designCategory?: 'light' | 'dark' | 'bold';
}
```

---

### 2. Chart/Trend Components (HIGH PRIORITY - 8+ duplicates)
Various chart and trend visualization components

**Found in:**
- `packages/industry-core/src/components/TrendChart.tsx` - Existing but basic
- `Frontend/merchant-admin/src/components/trend-chart.tsx` - More advanced version
- `Backend/core-api/src/components/trend-chart.tsx` - Server-side version
- `Frontend/merchant-admin/src/components/beauty/BeautyMetricCard.tsx` - SparklineChart
- Various industry-specific chart implementations

**Common Features Needed:**
- Line charts
- Area charts with gradients
- Bar charts
- Sparkline mini-charts
- Customizable colors
- Responsive sizing
- Data point tooltips
- Axis labeling options

**Proposed Industry-Core Enhancement:**
```typescript
interface EnhancedTrendChartProps {
  data: Array<{
    label: string;
    value: number;
    timestamp?: Date;
  }>;
  chartType: 'line' | 'area' | 'bar' | 'sparkline';
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  gradient?: boolean;
  className?: string;
}
```

---

### 3. Status/Indicator Components (MEDIUM PRIORITY - 10+ duplicates)
Status badge and indicator components

**Found in:**
- `packages/industry-core/src/components/StatusBadge.tsx` - Basic version
- `Frontend/merchant-admin/src/components/shared/StatusBadge.tsx` - More configurable
- Various industry-specific status implementations
- Custom badge components in different industry folders

**Common Features Needed:**
- Status variants (success, warning, error, info, pending)
- Custom status mappings
- Icon support
- Size variations
- Click handlers
- Tooltip support

**Proposed Industry-Core Enhancement:**
```typescript
interface EnhancedStatusBadgeProps {
  status: string;
  variants?: Record<string, {
    variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default';
    label: string;
    icon?: React.ComponentType;
  }>;
  size?: 'small' | 'medium' | 'large';
  clickable?: boolean;
  onClick?: () => void;
  tooltip?: string;
  className?: string;
}
```

---

### 4. Dashboard Layout Components (HIGH PRIORITY - 12+ duplicates)
Grid and layout components for dashboards

**Found in:**
- `packages/industry-core/src/components/dashboard-grid.tsx` - Basic version
- `Frontend/merchant-admin/src/components/dashboard-v2/` - Multiple layout implementations
- `Frontend/merchant-admin/src/components/dashboard/` - Industry-specific grids
- `Backend/core-api/src/components/dashboard-v2/` - Server-side layouts
- Various widget container implementations

**Common Features Needed:**
- Responsive grid layouts
- Drag-and-drop reordering
- Widget resizing
- Loading states
- Error boundaries
- Custom widget rendering
- Persistence of layout preferences

**Proposed Industry-Core Enhancement:**
```typescript
interface DashboardLayoutProps {
  widgets: Array<{
    id: string;
    component: React.ComponentType;
    props: Record<string, unknown>;
    position: { x: number; y: number; w: number; h: number };
    visible: boolean;
  }>;
  onLayoutChange?: (layout: Array<{id: string; x: number; y: number; w: number; h: number}>) => void;
  editable?: boolean;
  loading?: boolean;
  className?: string;
}
```

---

### 5. Table/Data Display Components (MEDIUM PRIORITY - 8+ duplicates)
Data table and comparison components

**Found in:**
- `packages/industry-core/src/components/ComparisonTable.tsx` - Basic version
- `packages/industry-core/src/components/SortableTable.tsx` - With sorting
- Various industry-specific table implementations
- Custom data display components

**Common Features Needed:**
- Column sorting
- Filtering capabilities
- Pagination
- Row selection
- Export functionality
- Responsive design
- Loading states
- Empty state handling

**Proposed Industry-Core Enhancement:**
```typescript
interface EnhancedDataTableProps {
  data: Array<Record<string, unknown>>;
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  }>;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: Array<Record<string, unknown>>) => void;
  className?: string;
}
```

---

### 6. Form/Input Components (LOW PRIORITY - 5+ duplicates)
Reusable form and input components

**Found in:**
- `packages/industry-core/src/components/SmartSearchInput.tsx`
- `packages/industry-core/src/components/DateRangePicker.tsx`
- `packages/industry-core/src/components/MultiSelectDropdown.tsx`
- Various custom input implementations

**Common Features Needed:**
- Consistent styling
- Validation support
- Accessibility compliance
- Keyboard navigation
- Mobile responsiveness

---

## 📊 Duplication Statistics

| Component Type | Instances Found | Priority | Estimated Reduction |
|----------------|-----------------|----------|-------------------|
| Metric Cards | 15+ | HIGH | 80% |
| Charts/Trends | 8+ | HIGH | 75% |
| Status Badges | 10+ | MEDIUM | 70% |
| Dashboard Layouts | 12+ | HIGH | 85% |
| Data Tables | 8+ | MEDIUM | 65% |
| Form Inputs | 5+ | LOW | 60% |

**Total Estimated Code Reduction:** 60-70%

---

## 🎯 Consolidation Strategy

### Phase 1: High-Priority Components (Days 1-3)
1. **Metric Cards** - Start with most duplicated component type
2. **Dashboard Layouts** - Core infrastructure component
3. **Charts/Trends** - Visualization foundation

### Phase 2: Medium-Priority Components (Days 4-5)
1. **Status Badges** - Standardize indicators
2. **Data Tables** - Improve data display consistency

### Phase 3: Integration & Testing (Days 6-7)
1. Update all consuming applications
2. Comprehensive testing
3. Documentation and handoff

---

## ⚠️ Migration Considerations

### Breaking Changes to Address
- Different prop naming conventions
- Varying default behaviors
- Inconsistent styling approaches
- Different event handling patterns

### Backward Compatibility Strategy
- Create adapter components for legacy APIs
- Provide migration utilities
- Maintain deprecated component aliases temporarily
- Clear upgrade path documentation

### Testing Requirements
- Visual regression testing for each component
- Functional testing across all industry packages
- Performance benchmarking
- Accessibility compliance verification

---

*This inventory will guide the systematic consolidation of duplicated components into the industry-core package, significantly reducing code duplication and improving maintainability.*