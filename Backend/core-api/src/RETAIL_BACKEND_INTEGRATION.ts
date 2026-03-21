/**
 * RETAIL BACKEND INTEGRATION GUIDE
 * 
 * This file contains complete setup instructions for the retail dashboard backend.
 */

// ============================================================================
// 1. DATABASE SCHEMA SETUP
// ============================================================================

/**
 * Run after adding new models to schema.prisma:
 * 
 * bash:
 * cd /Users/fredrick/Documents/Vayva-Tech/vayva/infra/db
 * pnpm prisma migrate dev --name add_retail_dashboard_models
 * pnpm prisma generate
 * 
 * New Models Added:
 * - DashboardLayout: Saved dashboard widget layouts
 * - ScheduledReport: Recurring report schedules
 */

// ============================================================================
// 2. ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Add to .env.local or .env.production:
 */

const _environmentVariables = {
  // WebSocket Configuration
  NEXT_PUBLIC_WS_URL: 'ws://localhost:3001', // Client-side WebSocket URL
  ENABLE_RETAIL_REALTIME: 'true', // Enable/disable realtime features
  
  // Optional: Custom WebSocket port
  WS_PORT: '3001',
};

// ============================================================================
// 3. SERVER INITIALIZATION
// ============================================================================

/**
 * Option A: Custom Server (Recommended for self-hosted)
 * Create: Backend/core-api/server.ts
 */

/*
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { setupRetailRealtime } from './src/lib/retail-setup';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize retail realtime features
  setupRetailRealtime(server);

  const PORT = process.env.WS_PORT || 3001;
  
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> WebSocket server running on ws://localhost:${PORT}/ws/retail-dashboard`);
  });
});
*/

/**
 * Option B: Next.js App Router (Vercel deployment)
 * Use Vercel Realtime features instead of custom WebSocket
 * See: https://vercel.com/docs/realtime
 */

// ============================================================================
// 4. API ENDPOINTS REFERENCE
// ============================================================================

/**
 * Export Endpoints:
 * 
 * GET  /api/retail/export - Get export configuration
 * POST /api/retail/export - Generate CSV/JSON export
 * POST /api/retail/export/pdf - Generate PDF report
 * 
 * Schedule Endpoints:
 * 
 * GET    /api/retail/reports/schedule - List scheduled reports
 * POST   /api/retail/reports/schedule - Create scheduled report
 * PUT    /api/retail/reports/schedule?id={id} - Update scheduled report
 * DELETE /api/retail/reports/schedule?id={id} - Cancel scheduled report
 */

// ============================================================================
// 5. USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Frontend WebSocket Connection
 */

/*
import { useRetailRealtime } from '@/components/dashboard/retail';

function Dashboard({ storeId }: { storeId: string }) {
  const realtime = useRetailRealtime({
    storeId,
    enabled: true,
    onOrderUpdate: (order) => {
      toast.success(`New order: ${order.orderNumber}`);
    },
    onInventoryUpdate: (inventory) => {
      if (inventory.isLowStock) {
        toast.warning(`Low stock: ${inventory.productName}`);
      }
    },
  });

  return (
    <div>
      {realtime.isConnected ? (
        <span className="text-green-600">● Connected</span>
      ) : (
        <span className="text-gray-400">● Connecting...</span>
      )}
    </div>
  );
}
*/

/**
 * Example 2: Export Data from Frontend
 */

/*
async function handleExport() {
  const response = await fetch('/api/retail/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'orders',
      format: 'csv',
      dateRange: {
        from: '2024-01-01',
        to: '2024-01-31',
      },
      filters: {
        status: 'completed',
        channel: 'online',
      },
      columns: ['orderNumber', 'customerName', 'totalAmount', 'createdAt'],
    }),
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders-export.csv';
    a.click();
  }
}
*/

/**
 * Example 3: Schedule a Report
 */

/*
async function scheduleWeeklyReport() {
  const response = await fetch('/api/retail/reports/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Weekly Sales Report',
      type: 'sales',
      format: 'pdf',
      frequency: 'weekly',
      email: 'manager@store.com',
      recipients: ['owner@store.com'],
      filters: {
        minAmount: 100,
      },
    }),
  });

  const result = await response.json();
  console.log('Report scheduled:', result.data.report);
}
*/

/**
 * Example 4: Save Dashboard Layout
 */

/*
async function saveLayout(widgets: any[]) {
  const response = await fetch('/api/retail/dashboard/layout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'My Custom Layout',
      widgets: widgets.map(w => ({
        id: w.id,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
      })),
      isDefault: true,
    }),
  });

  return await response.json();
}
*/

// ============================================================================
// 6. PRISMA MODEL TYPESCRIPT TYPES
// ============================================================================

/**
 * After running `pnpm prisma generate`, you can import types:
 */

/*
import { DashboardLayout, ScheduledReport } from '@prisma/client';

// Use in your code
const layout: DashboardLayout = {
  id: '...',
  storeId: '...',
  userId: '...',
  name: 'My Layout',
  industry: 'retail',
  widgets: [...],
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
*/

// ============================================================================
// 7. WEBSOCKET CHANNEL STRUCTURE
// ============================================================================

/**
 * Channel Naming Convention:
 * store:{storeId}:{type}
 * 
 * Examples:
 * - store:store-123:orders - Order updates for store 123
 * - store:store-123:inventory - Inventory updates for store 123
 * - store:store-123:transfers - Transfer updates for store 123
 * - store:store-123:loyalty - Loyalty program updates
 * - store:store-123:alerts - Alert notifications
 * - store:store-123:notifications - General notifications
 */

/**
 * Message Format:
 */

const _messageFormat = {
  // Client → Server
  subscribe: {
    type: 'subscribe',
    channel: 'store:store-123:orders',
  },
  
  unsubscribe: {
    type: 'unsubscribe',
    channel: 'store:store-123:orders',
  },
  
  auth: {
    type: 'auth',
    token: 'jwt-token-here',
    storeId: 'store-123',
    userId: 'user-456',
  },
  
  // Server → Client
  update: {
    type: 'update',
    channel: 'store:store-123:orders',
    data: { /* order data */ },
    timestamp: '2024-01-15T10:30:00Z',
  },
  
  subscribed: {
    type: 'subscribed',
    channel: 'store:store-123:orders',
    subscriberCount: 5,
  },
};

// ============================================================================
// 8. PRODUCTION DEPLOYMENT CHECKLIST
// ============================================================================

/**
 * Pre-deployment:
 * [ ] Run database migrations
 * [ ] Generate Prisma client
 * [ ] Set environment variables
 * [ ] Configure WebSocket port (if not using default 3001)
 * 
 * Deployment:
 * [ ] Deploy backend with custom server support
 * [ ] Ensure WebSocket port is accessible
 * [ ] Configure firewall rules for WebSocket traffic
 * [ ] Set up SSL/TLS for secure WebSocket (wss://)
 * 
 * Post-deployment:
 * [ ] Verify WebSocket connection
 * [ ] Test real-time order updates
 * [ ] Test inventory change notifications
 * [ ] Test export functionality
 * [ ] Test scheduled report creation
 * [ ] Monitor WebSocket connections
 */

// ============================================================================
// 9. TROUBLESHOOTING
// ============================================================================

/**
 * Common Issues:
 */

// Issue: WebSocket connection fails
// Solution: Check NEXT_PUBLIC_WS_URL, ensure port 3001 is open

// Issue: Prisma hooks not triggering
// Solution: Verify setupRetailRealtimeHooks() is called on startup

// Issue: Export returns empty data
// Solution: Check dateRange and filters, verify storeId ownership

// Issue: Scheduled reports not sending
// Solution: Set up a cron job or worker to process scheduled reports

// ============================================================================
// 10. PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Indexes added for query optimization:
 * 
 * DashboardLayout:
 * - [storeId, userId] - Fast lookup by store and user
 * - [storeId, isDefault] - Quick default layout retrieval
 * 
 * ScheduledReport:
 * - [storeId, enabled] - Filter enabled reports by store
 * - [storeId, nextRunAt] - Find upcoming reports to run
 * - [frequency, enabled] - Batch process by frequency
 * 
 * Additional optimization tips:
 * - Limit exports to 1000 rows max
 * - Use pagination for large datasets
 * - Cache frequently accessed report data
 * - Implement rate limiting on export endpoints
 */

export {};
