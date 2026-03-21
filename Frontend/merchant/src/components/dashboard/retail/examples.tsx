/**
 * Retail Dashboard Components - Usage Examples
 * 
 * This file demonstrates how to use the retail dashboard components
 * in your Next.js pages and applications.
 */

import React from 'react';

// ============================================================================
// Example 1: Basic Usage - Complete Retail Dashboard
// ============================================================================

export function BasicRetailDashboardExample() {
  return (
    <div className="container mx-auto p-6">
      {/* Import and use the complete layout */}
      {/* @ts-ignore - Component will be available after build */}
      {/* <RetailDashboardLayout storeId="store-123" /> */}
    </div>
  );
}

// ============================================================================
// Example 2: Individual Widget Usage
// ============================================================================

export function IndividualWidgetsExample() {
  // Sample data for widgets
  const kpiData = {
    revenue: 45280,
    orders: 1247,
    customers: 892,
    inventoryValue: 125000,
    conversionRate: 0.034,
  };

  const channelData = [
    { name: 'Online Store', value: 25000, percentage: 42.5, color: '#3B82F6' },
    { name: 'POS', value: 18000, percentage: 30.6, color: '#10B981' },
    { name: 'Mobile App', value: 10000, percentage: 17.0, color: '#F59E0B' },
    { name: 'Marketplace', value: 5800, percentage: 9.9, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* @ts-ignore - Component will be available after build */}
        {/* <RetailKpiCard
          title="Revenue"
          value={kpiData.revenue}
          change={0.153}
          trend="up"
          format="currency"
        />
        <RetailKpiCard
          title="Orders"
          value={kpiData.orders}
          change={0.221}
          trend="up"
          format="number"
        />
        <RetailKpiCard
          title="Customers"
          value={kpiData.customers}
          change={0.184}
          trend="up"
          format="number"
        />
        <RetailKpiCard
          title="Inventory Value"
          value={kpiData.inventoryValue}
          change={0.082}
          trend="up"
          format="currency"
        />
        <RetailKpiCard
          title="Conversion Rate"
          value={kpiData.conversionRate}
          change={0.006}
          trend="up"
          format="percent"
        /> */}
      </div>

      {/* Sales by Channel Chart */}
      {/* @ts-ignore */}
      {/* <SalesByChannelChart channels={channelData} /> */}
    </div>
  );
}

// ============================================================================
// Example 3: Page Integration with API Data Fetching
// ============================================================================

export async function RetailDashboardPageExample() {
  // In a real Next.js page, you would fetch data like this:
  /*
  async function RetailDashboardPage({ params }: { params: { storeId: string } }) {
    const response = await fetch(`/api/retail/dashboard?storeId=${params.storeId}`, {
      cache: 'no-store'
    });
    const { data } = await response.json();

    return (
      <div className="container mx-auto p-6">
        <RetailDashboardLayout 
          storeId={params.storeId}
          initialData={data}
        />
      </div>
    );
  }
  */

  return <div>See code comments for implementation</div>;
}

// ============================================================================
// Example 4: Custom Widget Composition
// ============================================================================

export function CustomRetailDashboardComposition() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Performance</h1>
          <p className="text-gray-500 mt-1">
            Track performance across all locations
          </p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Charts */}
        <div className="space-y-6">
          {/* @ts-ignore */}
          {/* <SalesByChannelChart channels={[]} />
          <CustomerInsightsChart 
            newCustomers={150}
            returningCustomers={450}
            churnRate={0.05}
          /> */}
        </div>

        {/* Right Column - Lists */}
        <div className="space-y-6">
          {/* @ts-ignore */}
          {/* <StorePerformanceList stores={[]} />
          <InventoryAlertsList alerts={[]} /> */}
        </div>
      </div>

      {/* Bottom Section - Orders and Transfers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* @ts-ignore */}
        {/* <RecentOrdersTable orders={[]} />
        <TransferKanban transfers={[]} /> */}
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Data Transformation from API
// ============================================================================

export function DataTransformationExample() {
  // Example API response structure
  const apiResponse = {
    metrics: {
      revenue: 45280,
      orders: 1247,
      customers: 892,
      inventoryValue: 125000,
      conversionRate: 0.034,
    },
    channels: [
      { id: 'ch1', name: 'Online Store', revenue: 25000, percent: 42.5 },
      { id: 'ch2', name: 'POS', revenue: 18000, percent: 30.6 },
    ],
    stores: [
      { id: 'st1', name: 'Downtown', revenue: 35000, growth: 0.15, performancePercent: 92 },
      { id: 'st2', name: 'Mall Location', revenue: 28000, growth: -0.08, performancePercent: 78 },
    ],
    products: {
      top: [
        { 
          id: 'p1', 
          name: 'Product A', 
          unitsSold: 450, 
          revenue: 12500, 
          growth: 0.25,
          stockStatus: 'in_stock' as const
        },
      ],
    },
    orders: {
      recent: [
        {
          id: 'o1',
          orderNumber: 'ORD-2024-001',
          customerName: 'John Doe',
          channel: 'Online',
          amount: 250,
          status: 'completed' as const,
          createdAt: new Date().toISOString(),
        },
      ],
    },
    customers: {
      new: 150,
      returning: 450,
      churnRate: 0.05,
    },
    transfers: [],
    inventory: {
      alerts: [
        {
          productId: 'prod1',
          productName: 'Widget X',
          sku: 'WX-001',
          currentStock: 3,
          reorderPoint: 10,
          status: 'critical' as const,
        },
      ],
    },
  };

  // Transform channel data for chart component
  const transformedChannels = apiResponse.channels.map((channel, index) => ({
    name: channel.name,
    value: channel.revenue,
    percentage: channel.percent,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index],
  }));

  // Transform store data for list component
  const transformedStores = apiResponse.stores.map(store => ({
    id: store.id,
    name: store.name,
    revenue: store.revenue,
    growth: store.growth,
    performancePercent: store.performancePercent,
  }));

  return (
    <div className="space-y-6">
      {/* Use transformed data with components */}
      {/* @ts-ignore */}
      {/* <SalesByChannelChart channels={transformedChannels} />
      <StorePerformanceList stores={transformedStores} /> */}
    </div>
  );
}

// ============================================================================
// Example 6: Responsive Layout Patterns
// ============================================================================

export function ResponsiveLayoutPatterns() {
  return (
    <div className="space-y-6">
      {/* Pattern 1: Auto-fit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Widgets will auto-fit based on screen size */}
      </div>

      {/* Pattern 2: Stacked on Mobile, Side-by-Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* @ts-ignore */}
          {/* <SalesByChannelChart channels={[]} /> */}
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* @ts-ignore */}
          {/* <StorePerformanceList stores={[]} /> */}
        </div>
      </div>

      {/* Pattern 3: Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2">
          {/* @ts-ignore */}
          {/* <SalesByChannelChart channels={[]} /> */}
        </div>
        
        {/* Sidebar - 1 column */}
        <div>
          {/* @ts-ignore */}
          {/* <StorePerformanceList stores={[]} /> */}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Loading States and Error Handling
// ============================================================================

export function LoadingAndErrorHandlingExample() {
  const isLoading = true;
  const hasError = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading retail dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-500">
          <p>Failed to load dashboard data</p>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Render dashboard components here */}
    </div>
  );
}

// ============================================================================
// Best Practices
// ============================================================================

/*
1. DATA FETCHING:
   - Use server-side rendering (SSR) for initial data load
   - Implement SWR or React Query for client-side caching
   - Add proper error boundaries

2. PERFORMANCE:
   - Lazy load heavy chart components
   - Use React.memo for static widgets
   - Implement virtualization for long lists

3. RESPONSIVENESS:
   - Test on mobile, tablet, and desktop
   - Use responsive Tailwind classes (sm:, md:, lg:, xl:)
   - Consider touch interactions for mobile

4. ACCESSIBILITY:
   - Add proper ARIA labels
   - Ensure keyboard navigation works
   - Provide alternative text for charts

5. TYPE SAFETY:
   - Always define TypeScript interfaces for props
   - Use union types for status/state props
   - Leverage TypeScript's strict mode

6. STYLING:
   - Use Tailwind CSS utility classes
   - Follow design system tokens
   - Maintain consistent spacing and colors

7. STATE MANAGEMENT:
   - Keep widget state local when possible
   - Use context for shared state
   - Consider Zustand/Jotai for complex state

*/
