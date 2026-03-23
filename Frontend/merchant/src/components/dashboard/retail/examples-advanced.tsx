/**
 * Advanced Retail Dashboard - Complete Example
 * 
 * This file demonstrates how to integrate all advanced features:
 * - Real-time WebSocket updates
 * - Advanced filtering
 * - Export functionality
 * - Dashboard customization
 * - Mobile optimization
 */

'use client';

import React, { useState } from 'react';
import { 
  RetailDashboardLayout,
  useRetailRealtime,
  AdvancedFilters,
  ExportData,
  DashboardCustomizer,
  MobileDashboard,
  MobileKPICard,
} from '@/components/dashboard/retail';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface AdvancedRetailDashboardProps {
  storeId: string;
  isMobile?: boolean;
}

export function AdvancedRetailDashboardExample({ 
  storeId, 
  isMobile = false 
}: AdvancedRetailDashboardProps) {
  // Real-time data subscription
  const realtime = useRetailRealtime({
    storeId,
    enabled: true,
    onOrderUpdate: (order) => {
      // Show toast notification
    },
    onInventoryUpdate: (inventory) => {
      // Trigger alert if low stock
    },
    onTransferUpdate: (transfer) => {
    },
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    dateRange: { from: undefined, to: undefined },
    categories: [],
    statuses: [],
    channels: [],
  });

  // Widget configuration
  const availableWidgets = [
    { id: 'revenue', title: 'Revenue', size: 'medium' as const, component: RevenueWidget },
    { id: 'orders', title: 'Orders', size: 'medium' as const, component: OrdersWidget },
    { id: 'customers', title: 'Customers', size: 'medium' as const, component: CustomersWidget },
    { id: 'inventory', title: 'Inventory', size: 'large' as const, component: InventoryWidget },
    { id: 'transfers', title: 'Transfers', size: 'large' as const, component: TransfersWidget },
    { id: 'loyalty', title: 'Loyalty', size: 'medium' as const, component: LoyaltyWidget },
  ];

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to data fetching
  };

  // Handle export
  const handleExport = (options: any) => {
    // Track analytics
  };

  // Handle schedule report
  const handleScheduleReport = (report: any) => {
    // Call API to schedule report
  };

  // Handle layout save
  const handleSaveLayout = (layout: any[]) => {
    // Send to backend for persistence
  };

  // Render loading state
  if (!realtime.isConnected && realtime.isConnecting) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Connecting to real-time updates...</p>
        </div>
      </div>
    );
  }

  // Mobile version
  if (isMobile) {
    return (
      <MobileDashboard>
        {/* Overview Tab */}
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <MobileKPICard
              title="Revenue"
              value="$12.5K"
              change={0.15}
              trend="up"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <MobileKPICard
              title="Orders"
              value="247"
              change={0.22}
              trend="up"
              icon={<ShoppingCart className="w-5 h-5" />}
            />
          </div>

          {/* Recent Activity List */}
          <Card>
            <CardContent className="p-0">
              {/* Mobile list items would go here */}
            </CardContent>
          </Card>
        </div>

        {/* Inventory Tab */}
        <div className="p-4">
          <h1 className="text-2xl font-bold">Inventory</h1>
          {/* Mobile inventory content */}
        </div>

        {/* Orders Tab */}
        <div className="p-4">
          <h1 className="text-2xl font-bold">Orders</h1>
          {/* Mobile orders content */}
        </div>

        {/* Customers Tab */}
        <div className="p-4">
          <h1 className="text-2xl font-bold">Customers</h1>
          {/* Mobile customers content */}
        </div>

        {/* Settings Tab */}
        <div className="p-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          {/* Mobile settings content */}
        </div>
      </MobileDashboard>
    );
  }

  // Desktop version with all advanced features
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retail Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Real-time insights • {realtime.isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ExportData
            data={[]}
            columns={[]}
            filename={`retail-report-${storeId}`}
            onExport={handleExport}
            onScheduleReport={handleScheduleReport}
          />
        </div>
      </div>

      {/* Connection Status */}
      {realtime.isConnected && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
          <span>Live updates active</span>
        </div>
      )}

      {/* Advanced Filters */}
      <AdvancedFilters
        categories={[
          { value: 'products', label: 'Products' },
          { value: 'services', label: 'Services' },
        ]}
        statuses={[
          { value: 'completed', label: 'Completed' },
          { value: 'pending', label: 'Pending' },
        ]}
        channels={[
          { value: 'online', label: 'Online Store', count: 125 },
          { value: 'pos', label: 'POS', count: 89 },
          { value: 'mobile', label: 'Mobile App', count: 56 },
        ]}
        onFilterChange={handleFilterChange}
      />

      {/* Customizable Dashboard */}
      <DashboardCustomizer
        availableWidgets={availableWidgets}
        onSave={handleSaveLayout}
      />

      {/* Alternative: Standard Layout with Real-time Updates */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <RetailDashboardLayout storeId={storeId} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics content with filters */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Analytics</h3>
              {/* Add charts and detailed views here */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          {/* Reports with export */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Reports</h3>
              <ExportData
                data={[]}
                columns={[]}
                filename="custom-report"
                onExport={handleExport}
                onScheduleReport={handleScheduleReport}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Placeholder widget components
function RevenueWidget() {
  return <div className="p-4">Revenue Widget</div>;
}

function OrdersWidget() {
  return <div className="p-4">Orders Widget</div>;
}

function CustomersWidget() {
  return <div className="p-4">Customers Widget</div>;
}

function InventoryWidget() {
  return <div className="p-4">Inventory Widget</div>;
}

function TransfersWidget() {
  return <div className="p-4">Transfers Widget</div>;
}

function LoyaltyWidget() {
  return <div className="p-4">Loyalty Widget</div>;
}

// ============================================================================
// USAGE IN NEXT.JS PAGE
// ============================================================================

/*
// app/retail/[storeId]/dashboard/page.tsx
'use client';

import { AdvancedRetailDashboardExample } from '@/components/dashboard/retail/examples-advanced';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function RetailDashboardPage({ params }: { params: { storeId: string } }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <main className="min-h-screen bg-white">
      <AdvancedRetailDashboardExample 
        storeId={params.storeId}
        isMobile={isMobile}
      />
    </main>
  );
}
*/

// ============================================================================
// WEBSOCKET SERVER SETUP (Backend)
// ============================================================================

/*
// Backend/core-api/src/websockets/retail-dashboard.ts
import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from '@vayva/db';

const wss = new WebSocketServer({ port: 3001 });

const clients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const data = JSON.parse(message.toString());
    
    switch (data.type) {
      case 'subscribe':
        // Add client to channel
        if (!clients.has(data.channel)) {
          clients.set(data.channel, new Set());
        }
        clients.get(data.channel)!.add(ws);
        break;
        
      case 'unsubscribe':
        // Remove client from channel
        clients.get(data.channel)?.delete(ws);
        break;
    }
  });
});

// Broadcast updates to subscribed clients
export function broadcastToChannel(channel: string, data: any) {
  const channelClients = clients.get(channel);
  if (!channelClients) return;
  
  const message = JSON.stringify({ channel, data });
  channelClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Example: Order created
prisma.$use(async (middlewareParams, next) => {
  const result = await next(middlewareParams);
  
  if (middlewareParams.model === 'Order' && middlewareParams.action === 'create') {
    const order = result;
    broadcastToChannel(`store:${order.storeId}:orders`, order);
  }
  
  return result;
});
*/

// ============================================================================
// TAILWIND CONFIG FOR MOBILE SAFE AREAS
// ============================================================================

/*
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.safe-area-inset': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-area-pb': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      });
    },
  ],
};
*/
