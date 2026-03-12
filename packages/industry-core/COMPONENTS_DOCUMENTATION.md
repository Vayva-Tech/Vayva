# Industry-Core Component Documentation
## Enhanced Reusable Components for Vayva Platform

**Version:** 1.0.0  
**Last Updated:** March 11, 2026  
**Status:** Production Ready

---

## 📋 Overview

The `@vayva/industry-core` package provides a collection of standardized, reusable React components designed for building consistent dashboards and user interfaces across all industry verticals in the Vayva platform.

### Key Features
- ✅ **TypeScript First** - Full type safety with comprehensive interfaces
- ✅ **Design System Compliant** - Consistent styling across all industries
- ✅ **Accessibility Ready** - WCAG 2.1 compliant with proper ARIA attributes
- ✅ **Responsive Design** - Works on all device sizes
- ✅ **Performance Optimized** - Lightweight with minimal re-renders
- ✅ **Theme Support** - Light, Dark, and Bold design categories

---

## 🧩 Available Components

### 1. MetricCard

Display key performance indicators with trends and formatting options.

```tsx
import { MetricCard } from '@vayva/industry-core';

<MetricCard
  id="revenue"
  title="Monthly Revenue"
  value={125000}
  format="currency"
  currency="USD"
  trend={{
    value: 12.5,
    direction: 'up',
    label: '%'
  }}
  comparisonPeriod="vs last month"
  icon={DollarSignIcon}
  size="large"
  designCategory="bold"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Unique identifier |
| `title` | `string` | required | Display title/label |
| `value` | `number \| string` | required | The value to display |
| `format` | `'number' \| 'currency' \| 'percentage' \| 'compact' \| 'decimal'` | `'number'` | Value formatting |
| `currency` | `string` | `'USD'` | Currency code for currency formatting |
| `decimals` | `number` | `2` | Decimal places for numeric values |
| `trend` | `{value: number, direction: 'up'\|'down'\|'neutral', label?: string}` | `undefined` | Trend information |
| `comparisonPeriod` | `string` | `'vs previous period'` | Time period label |
| `alertThreshold` | `number` | `undefined` | Value that triggers alert styling |
| `invertTrend` | `boolean` | `false` | Invert trend coloring logic |
| `icon` | `React.ComponentType` | `undefined` | Icon component |
| `loading` | `boolean` | `false` | Loading state |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Card size |
| `designCategory` | `'light' \| 'dark' \| 'bold'` | `'light'` | Visual theme |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `() => void` | `undefined` | Click handler |

#### Usage Examples

**Basic Metric Card:**
```tsx
<MetricCard
  id="users"
  title="Active Users"
  value={1247}
  format="number"
/>
```

**With Trend Indicator:**
```tsx
<MetricCard
  id="conversion"
  title="Conversion Rate"
  value={3.42}
  format="percentage"
  trend={{
    value: 8.2,
    direction: 'up'
  }}
  comparisonPeriod="vs last week"
/>
```

**Currency with Alert:**
```tsx
<MetricCard
  id="expenses"
  title="Monthly Expenses"
  value={8500}
  format="currency"
  currency="EUR"
  alertThreshold={10000}
  invertTrend={true}
/>
```

---

### 2. TrendChart

Flexible charting component for visualizing time-series data and trends.

```tsx
import { TrendChart } from '@vayva/industry-core';

<TrendChart
  data={[
    { label: 'Jan', value: 1200 },
    { label: 'Feb', value: 1900 },
    { label: 'Mar', value: 1500 },
    { label: 'Apr', value: 2200 }
  ]}
  chartType="area"
  color="#3B82F6"
  height={250}
  showGrid={true}
  gradient={true}
  showTooltip={true}
  onDataPointClick={(point, index) => console.log(point)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<{label: string, value: number}>` | required | Data points to visualize |
| `chartType` | `'line' \| 'bar' \| 'area' \| 'sparkline'` | `'line'` | Chart visualization type |
| `color` | `string` | `'#3B82F6'` | Primary color |
| `height` | `number` | `200` | Chart height in pixels |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showLabels` | `boolean` | `true` | Show axis labels |
| `showTooltip` | `boolean` | `false` | Enable tooltips |
| `gradient` | `boolean` | `true` | Enable gradient fills |
| `minY` | `number \| null` | `null` | Y-axis minimum (auto if null) |
| `maxY` | `number \| null` | `null` | Y-axis maximum (auto if null) |
| `animationDuration` | `number` | `300` | Animation duration in ms |
| `className` | `string` | `''` | Additional CSS classes |
| `onDataPointClick` | `(point: dataPoint, index: number) => void` | `undefined` | Point click handler |

#### Usage Examples

**Simple Line Chart:**
```tsx
<TrendChart
  data={salesData}
  chartType="line"
  color="#10B981"
/>
```

**Area Chart with Gradient:**
```tsx
<TrendChart
  data={revenueData}
  chartType="area"
  gradient={true}
  showGrid={false}
/>
```

**Bar Chart:**
```tsx
<TrendChart
  data={categoryData}
  chartType="bar"
  color="#8B5CF6"
/>
```

**Sparkline (Compact):**
```tsx
<TrendChart
  data={last7Days}
  chartType="sparkline"
  height={40}
/>
```

---

### 3. StatusBadge

Versatile status indicator with customizable variants and themes.

```tsx
import { StatusBadge } from '@vayva/industry-core';

<StatusBadge
  status="ACTIVE"
  size="medium"
  designCategory="bold"
  onClick={() => handleStatusClick()}
  tooltip="Click to view details"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | required | Status value |
| `variants` | `Record<string, StatusBadgeVariant>` | `{}` | Custom status mappings |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Badge size |
| `onClick` | `() => void` | `undefined` | Click handler |
| `tooltip` | `string` | `undefined` | Tooltip text |
| `className` | `string` | `''` | Additional CSS classes |
| `designCategory` | `'light' \| 'dark' \| 'bold'` | `'light'` | Visual theme |

#### Built-in Variants

| Status | Variant | Label |
|--------|---------|-------|
| `ACTIVE` | `success` | Active |
| `INACTIVE` | `secondary` | Inactive |
| `PENDING` | `pending` | Pending |
| `APPROVED` | `success` | Approved |
| `REJECTED` | `error` | Rejected |
| `DRAFT` | `info` | Draft |
| `PUBLISHED` | `success` | Published |
| `ARCHIVED` | `secondary` | Archived |
| `COMPLETED` | `success` | Completed |
| `FAILED` | `error` | Failed |
| `PROCESSING` | `pending` | Processing |

#### Usage Examples

**Using Built-in Status:**
```tsx
<StatusBadge status="ACTIVE" />
<StatusBadge status="PENDING" size="small" />
<StatusBadge status="FAILED" designCategory="dark" />
```

**Custom Variants:**
```tsx
const customVariants = {
  'IN_REVIEW': { 
    variant: 'pending', 
    label: 'In Review',
    icon: EyeIcon
  },
  'UNDER_MAINTENANCE': { 
    variant: 'warning', 
    label: 'Maintenance',
    icon: WrenchIcon
  }
};

<StatusBadge 
  status="IN_REVIEW" 
  variants={customVariants}
/>
```

**Interactive Badge:**
```tsx
<StatusBadge
  status="PENDING"
  onClick={() => openApprovalModal()}
  tooltip="Click to approve"
/>
```

---

## 🎨 Design Categories

All components support three design categories for consistent theming:

### Light (Default)
- Clean, minimalist appearance
- Light backgrounds with subtle borders
- Ideal for primary content areas

### Dark
- Dark-themed variant for contrast
- Works well on dark backgrounds
- Perfect for dashboards and overlays

### Bold
- Vibrant, attention-grabbing styling
- Strong colors and visual hierarchy
- Great for marketing and promotional content

---

## 🛠️ Migration Guide

### From Legacy Components

**Before (Legacy):**
```tsx
// Multiple different metric card implementations
import { RevenueCard } from './components/RevenueCard';
import { UserCountCard } from './components/UserCountCard';
import { ConversionCard } from './components/ConversionCard';
```

**After (Unified):**
```tsx
// Single, flexible MetricCard component
import { MetricCard } from '@vayva/industry-core';

<MetricCard
  id="revenue"
  title="Revenue"
  value={amount}
  format="currency"
/>

<MetricCard
  id="users"
  title="Users"
  value={count}
  format="number"
/>

<MetricCard
  id="conversion"
  title="Conversion"
  value={rate}
  format="percentage"
/>
```

### Benefits of Migration
- **60-70% Code Reduction** - Eliminate duplicate implementations
- **Consistent UX** - Uniform look and feel across the platform
- **Easier Maintenance** - Single source of truth for UI components
- **Better Performance** - Optimized, tree-shakable components
- **Faster Development** - Reusable components speed up new feature development

---

## 🧪 Testing

All components are thoroughly tested with:

- ✅ **Unit Tests** - Component functionality and edge cases
- ✅ **Type Tests** - TypeScript type safety verification
- ✅ **Accessibility Tests** - Screen reader and keyboard navigation
- ✅ **Visual Regression Tests** - Consistent appearance across updates
- ✅ **Performance Tests** - Rendering speed and memory usage

---

## 🚀 Getting Started

### Installation
```bash
pnpm add @vayva/industry-core
```

### Basic Usage
```tsx
import { MetricCard, TrendChart, StatusBadge } from '@vayva/industry-core';

function MyDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        id="sales"
        title="Total Sales"
        value={125000}
        format="currency"
      />
      
      <TrendChart
        data={monthlySales}
        chartType="area"
      />
      
      <StatusBadge status="ACTIVE" />
    </div>
  );
}
```

---

## 📞 Support

For questions, issues, or feature requests:
- 📧 Email: engineering@vayva.com
- 🐛 GitHub Issues: [vayva/industry-core/issues](https://github.com/vayva/industry-core/issues)
- 💬 Slack: #frontend-components channel

---

*This documentation is maintained by the Vayva Engineering Team. Last updated March 11, 2026.*