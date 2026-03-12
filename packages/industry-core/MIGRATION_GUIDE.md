# Frontend Application Migration Guide
## Moving from Legacy Components to Industry-Core

**Target:** All Vayva frontend applications  
**Estimated Time:** 2-3 days per application  
**Risk Level:** Medium (Breaking changes require careful migration)

---

## 🎯 Migration Objectives

### Goals
1. **Eliminate Duplication** - Remove 60-70% of duplicated component code
2. **Standardize UX** - Ensure consistent user experience across all applications
3. **Improve Maintainability** - Single source of truth for common components
4. **Enhance Performance** - Better optimized, tree-shakable components

### Success Criteria
- ✅ Zero TypeScript errors after migration
- ✅ All existing functionality preserved
- ✅ Visual consistency maintained
- ✅ Performance improvements achieved
- ✅ Reduced bundle sizes

---

## 📋 Migration Checklist

### Phase 1: Preparation (Day 1)

#### 1.1 Dependency Setup
```bash
# Add industry-core dependency
cd /path/to/your/frontend/app
pnpm add @vayva/industry-core@latest

# Verify installation
pnpm list @vayva/industry-core
```

#### 1.2 Audit Current Components
```bash
# Find all metric card implementations
find src -name "*Metric*" -o -name "*Stat*" -o -name "*KPI*" | grep -E "\.(tsx|jsx)$"

# Find all chart implementations
find src -name "*Chart*" -o -name "*Graph*" -o -name "*Trend*" | grep -E "\.(tsx|jsx)$"

# Find all status badge implementations
find src -name "*Badge*" -o -name "*Status*" | grep -E "\.(tsx|jsx)$"
```

#### 1.3 Create Migration Plan
Document all components that need replacement:
```markdown
## Component Migration Matrix

| Legacy Component | Location | Usage Count | Industry-Core Replacement | Migration Complexity |
|------------------|----------|-------------|---------------------------|---------------------|
| RevenueCard.tsx | dashboard/finance/ | 12 | MetricCard | Easy |
| UserStatCard.tsx | dashboard/users/ | 8 | MetricCard | Easy |
| TrendLineChart.tsx | components/charts/ | 15 | TrendChart | Medium |
| StatusIndicator.tsx | shared/ | 22 | StatusBadge | Easy |
```

---

## 🔄 Migration Patterns

### Pattern 1: Metric/Stat Cards

**Legacy Implementation:**
```tsx
// src/components/dashboard/RevenueCard.tsx
interface RevenueCardProps {
  amount: number;
  period: string;
  trend?: number;
}

export function RevenueCard({ amount, period, trend }: RevenueCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm text-gray-500">Revenue</h3>
      <div className="mt-2 text-3xl font-bold">${amount.toLocaleString()}</div>
      {trend && (
        <div className="mt-2 text-sm text-green-600">
          ↑ {trend}% from {period}
        </div>
      )}
    </div>
  );
}
```

**Industry-Core Migration:**
```tsx
// Replace imports
// import { RevenueCard } from '../components/dashboard/RevenueCard';
import { MetricCard } from '@vayva/industry-core';

// Update component usage
<MetricCard
  id="revenue"
  title="Revenue"
  value={amount}
  format="currency"
  currency="USD"
  trend={trend ? { 
    value: trend, 
    direction: trend > 0 ? 'up' : 'down' 
  } : undefined}
  comparisonPeriod={`from ${period}`}
/>
```

### Pattern 2: Chart Components

**Legacy Implementation:**
```tsx
// src/components/charts/SalesTrendChart.tsx
interface SalesTrendChartProps {
  data: Array<{ month: string; sales: number }>;
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  // Custom SVG implementation...
}
```

**Industry-Core Migration:**
```tsx
// Replace imports
// import { SalesTrendChart } from '../components/charts/SalesTrendChart';
import { TrendChart } from '@vayva/industry-core';

// Transform data format
const chartData = data.map(item => ({
  label: item.month,
  value: item.sales
}));

// Update component usage
<TrendChart
  data={chartData}
  chartType="area"
  color="#3B82F6"
  height={300}
  showGrid={true}
  gradient={true}
/>
```

### Pattern 3: Status Badges

**Legacy Implementation:**
```tsx
// src/components/shared/OrderStatusBadge.tsx
interface OrderStatusBadgeProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

**Industry-Core Migration:**
```tsx
// Replace imports
// import { OrderStatusBadge } from '../components/shared/OrderStatusBadge';
import { StatusBadge } from '@vayva/industry-core';

// Define custom variants
const orderStatusVariants = {
  PENDING: { variant: 'pending', label: 'Pending' },
  PROCESSING: { variant: 'info', label: 'Processing' },
  SHIPPED: { variant: 'info', label: 'Shipped' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'error', label: 'Cancelled' }
};

// Update component usage
<StatusBadge
  status={status.toUpperCase()}
  variants={orderStatusVariants}
  size="small"
/>
```

---

## 🛠️ Migration Tools

### Automated Codemods

Create a codemod script for bulk replacements:

```javascript
// scripts/migrate-components.js
const j = require('jscodeshift');

module.exports = function(fileInfo, api) {
  const root = j(fileInfo.source);
  
  // Replace import statements
  root.find(j.ImportDeclaration)
    .filter(path => path.node.source.value.includes('/components/dashboard/'))
    .forEach(path => {
      const componentName = path.node.specifiers[0].local.name;
      if (componentName.includes('Card') || componentName.includes('Stat')) {
        j(path).replaceWith(
          j.importDeclaration(
            [j.importSpecifier(j.identifier('MetricCard'))],
            j.literal('@vayva/industry-core')
          )
        );
      }
    });
  
  return root.toSource();
};
```

Run with:
```bash
npx jscodeshift -t scripts/migrate-components.js src/**/*.tsx
```

### Migration Script

```bash
#!/bin/bash
# migrate-to-industry-core.sh

echo "🚀 Starting Industry-Core Migration..."

# 1. Install dependency
echo "📦 Installing @vayva/industry-core..."
pnpm add @vayva/industry-core@latest

# 2. Create backup
echo "💾 Creating backup..."
git stash push -m "backup-before-industry-core-migration"

# 3. Run automated replacements
echo "🤖 Running automated migrations..."
npx jscodeshift -t scripts/migrate-components.js src/

# 4. Manual verification needed
echo "⚠️  Manual verification required:"
echo "   - Check all component usages"
echo "   - Verify data transformations"
echo "   - Test visual appearance"
echo "   - Validate accessibility"

echo "✅ Migration script completed!"
echo "Next steps:"
echo "1. Run pnpm typecheck"
echo "2. Run pnpm build"
echo "3. Test application locally"
echo "4. Review visual differences"
```

---

## 🧪 Testing Strategy

### 1. Type Checking
```bash
# Verify TypeScript compilation
pnpm typecheck

# Expected: No errors
```

### 2. Build Verification
```bash
# Verify successful build
pnpm build

# Expected: Successful compilation
```

### 3. Visual Regression Testing
```bash
# If using Storybook
pnpm storybook:test

# Or manual visual inspection
# Compare before/after screenshots
```

### 4. Functional Testing
```bash
# Run existing test suite
pnpm test

# Add new tests for migrated components
# Focus on edge cases and interactions
```

---

## ⚠️ Common Migration Issues

### Issue 1: Data Format Mismatches

**Problem:**
```tsx
// Legacy expects different data structure
<LegacyChart data={rawData} />

// Industry-Core expects transformed data
<TrendChart data={transformedData} />
```

**Solution:**
```tsx
// Create data transformation utility
const transformData = (rawData) => 
  rawData.map(item => ({
    label: item.date_label,
    value: item.numeric_value
  }));

<TrendChart data={transformData(rawData)} />
```

### Issue 2: Styling Conflicts

**Problem:**
```tsx
// Legacy component has custom styling that conflicts
<MetricCard className="my-custom-style" />
```

**Solution:**
```tsx
// Use designCategory prop instead
<MetricCard 
  designCategory="bold"
  className="my-additional-styles"
/>
```

### Issue 3: Event Handler Differences

**Problem:**
```tsx
// Legacy uses different event names
<LegacyComponent onChange={handleChange} />

// Industry-Core uses different naming
<MetricCard onClick={handleClick} />
```

**Solution:**
```tsx
// Update event handlers to match new API
const handleClick = () => {
  // Handle the click event
};

<MetricCard onClick={handleClick} />
```

---

## 📊 Migration Tracking

### Progress Dashboard

Create a migration tracking sheet:

```markdown
# Migration Progress Tracker

| Component | Status | Owner | ETA | Notes |
|-----------|--------|-------|-----|-------|
| Metric Cards | ✅ Done | John | Mar 12 | 15 components migrated |
| Charts | 🔄 In Progress | Sarah | Mar 13 | Need data transformation |
| Status Badges | ⏳ Pending | Mike | Mar 14 | Waiting on design review |
| Tables | ⏳ Pending | Lisa | Mar 15 | Complex layout requirements |

## Key Metrics
- Components Migrated: 15/45 (33%)
- Files Modified: 23
- Lines Removed: 450
- Bundle Size Reduction: 12%
```

---

## 🚀 Post-Migration Optimization

### 1. Tree Shaking Verification
```bash
# Check bundle analysis
pnpm build --analyze

# Verify unused exports are eliminated
```

### 2. Performance Monitoring
```tsx
// Add performance tracking
import { MetricCard } from '@vayva/industry-core';

console.time('MetricCard Render');
<MetricCard {...props} />
console.timeEnd('MetricCard Render');
```

### 3. Accessibility Audit
```bash
# Run accessibility checker
npx axe http://localhost:3000/dashboard

# Verify WCAG compliance
```

---

## 🆘 Support Resources

### Documentation
- [Industry-Core Component Docs](./COMPONENTS_DOCUMENTATION.md)
- [API Reference](./API_REFERENCE.md)
- [Migration Examples](./MIGRATION_EXAMPLES.md)

### Contact
- **Engineering Lead:** engineering@vayva.com
- **Frontend Team:** #frontend-migration slack channel
- **Component Library:** components@vayva.com

---

*This guide is maintained by the Vayva Engineering Team. Last updated March 11, 2026.*