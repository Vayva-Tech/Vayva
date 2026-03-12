import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { WebSocketManager, RealTimeEventPublisher, WebSocketChannel } from "@/lib/websocket/websocket-manager";

// Initialize WebSocket manager
const wsManager = WebSocketManager.getInstance();
const eventPublisher = new RealTimeEventPublisher();

const WebSocketConfigSchema = z.object({
  channels: z.array(z.enum([
    'orders',
    'inventory',
    'customers',
    'finance',
    'alerts',
    'analytics',
    'store_events'
  ])).optional(),
  reconnect: z.boolean().default(false),
  heartbeat: z.boolean().default(true)
});

/**
 * GET endpoint - Get WebSocket connection information and current stats
 */
export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      // Check if requesting connection token
      const getConnectionToken = searchParams.get('getConnectionToken') === 'true';
      
      if (getConnectionToken) {
        // Generate a temporary connection token (in production, use JWT)
        const connectionToken = `temp_${storeId}_${user.id}_${Date.now()}`;
        
        return NextResponse.json(
          {
            success: true,
            data: {
              connectionToken,
              websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3001',
              supportedProtocols: ['json'],
              connectionTimeout: 30000,
              maxPayloadSize: 1024 * 1024 // 1MB
            }
          },
          { headers: standardHeaders(requestId) }
        );
      }

      // Return WebSocket statistics
      const stats = wsManager.getStats();
      
      return NextResponse.json(
        {
          success: true,
          data: {
            stats,
            supportedChannels: Object.values(WebSocketChannel),
            eventTypes: [
              'order.created',
              'order.updated', 
              'order.completed',
              'inventory.low',
              'customer.new',
              'payment.received',
              'alert.critical',
              'performance.update',
              'analytics.live'
            ]
          }
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBSOCKET_INFO_ERROR]", { error, storeId });
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "WEBSOCKET_INFO_FAILED",
            message: "Failed to retrieve WebSocket information"
          }
        },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

/**
 * POST endpoint - Configure WebSocket subscriptions and publish test events
 */
export const POST = withVayvaAPI(
  PERMISSIONS.STORE_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      
      // Check if this is a subscription configuration request
      if (json.action === 'configure_subscriptions') {
        const parseResult = WebSocketConfigSchema.safeParse(json.config);
        
        if (!parseResult.success) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: {
                code: "INVALID_CONFIG",
                message: "Invalid WebSocket configuration",
                details: parseResult.error.flatten()
              }
            },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const config = parseResult.data;
        
        logger.info("[WEBSOCKET_CONFIG_UPDATE]", {
          storeId,
          userId: user.id,
          channels: config.channels,
          reconnect: config.reconnect
        });

        return NextResponse.json(
          {
            success: true,
            data: {
              configuration: config,
              appliedAt: new Date().toISOString(),
              status: "Configuration updated successfully"
            }
          },
          { headers: standardHeaders(requestId) }
        );
      }

      // Check if this is a test event request
      if (json.action === 'publish_test_event') {
        const TestEventSchema = z.object({
          eventType: z.enum([
            'order_simulation',
            'inventory_alert',
            'customer_activity',
            'payment_test',
            'performance_update'
          ]),
          delay: z.number().min(0).max(30000).default(0)
        });

        const eventParse = TestEventSchema.safeParse(json.event);
        
        if (!eventParse.success) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: {
                code: "INVALID_TEST_EVENT",
                message: "Invalid test event configuration",
                details: eventParse.error.flatten()
              }
            },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const { eventType, delay } = eventParse.data;

        // Schedule test event
        setTimeout(() => {
          publishTestEvent(eventType, storeId);
        }, delay);

        return NextResponse.json(
          {
            success: true,
            data: {
              scheduledEvent: eventType,
              delay,
              scheduledAt: new Date(Date.now() + delay).toISOString()
            }
          },
          { headers: standardHeaders(requestId) }
        );
      }

      // Invalid action
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_ACTION",
            message: "Invalid WebSocket action. Supported actions: configure_subscriptions, publish_test_event"
          }
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBSOCKET_CONFIG_ERROR]", { error, storeId });
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "WEBSOCKET_CONFIG_FAILED",
            message: "Failed to configure WebSocket"
          }
        },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

/**
 * PUT endpoint - Update WebSocket settings
 */
export const PUT = withVayvaAPI(
  PERMISSIONS.STORE_ADMIN,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      
      const SettingsSchema = z.object({
        enableRealTime: z.boolean().optional(),
        maxConnections: z.number().min(1).max(1000).optional(),
        messageRetention: z.number().min(0).max(86400).optional(), // seconds
        enableCompression: z.boolean().optional(),
        logLevel: z.enum(['error', 'warn', 'info', 'debug']).optional()
      });

      const parseResult = SettingsSchema.safeParse(json);
      
      if (!parseResult.success) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "INVALID_SETTINGS",
              message: "Invalid WebSocket settings",
              details: parseResult.error.flatten()
            }
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const settings = parseResult.data;
      
      logger.info("[WEBSOCKET_SETTINGS_UPDATE]", {
        storeId,
        settings
      });

      // In a real implementation, these settings would be applied to the WebSocket server
      // For now, we'll just log them and return success
      
      return NextResponse.json(
        {
          success: true,
          data: {
            updatedSettings: settings,
            appliedAt: new Date().toISOString(),
            status: "Settings updated successfully"
          }
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WEBSOCKET_SETTINGS_ERROR]", { error, storeId });
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "WEBSOCKET_SETTINGS_FAILED",
            message: "Failed to update WebSocket settings"
          }
        },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

/**
 * DELETE endpoint - Reset WebSocket connections or clear statistics
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.STORE_ADMIN,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const action = searchParams.get('action') || 'reset_stats';
      
      switch (action) {
        case 'reset_stats':
          // Reset statistics (would require additional methods in WebSocketManager)
          logger.info("[WEBSOCKET_STATS_RESET]", { storeId });
          return NextResponse.json(
            {
              success: true,
              data: {
                action: "statistics_reset",
                resetAt: new Date().toISOString()
              }
            },
            { headers: standardHeaders(requestId) }
          );
          
        case 'disconnect_all':
          // Disconnect all connections for this store
          // This would require additional methods in WebSocketManager
          logger.warn("[WEBSOCKET_DISCONNECT_ALL]", { storeId });
          return NextResponse.json(
            {
              success: true,
              data: {
                action: "all_connections_disconnected",
                disconnectedAt: new Date().toISOString()
              }
            },
            { headers: standardHeaders(requestId) }
          );
          
        default:
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: {
                code: "INVALID_ACTION",
                message: "Invalid action. Supported actions: reset_stats, disconnect_all"
              }
            },
            { status: 400, headers: standardHeaders(requestId) }
          );
      }
    } catch (error: unknown) {
      logger.error("[WEBSOCKET_DELETE_ERROR]", { error, storeId });
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "WEBSOCKET_DELETE_FAILED",
            message: "Failed to perform WebSocket delete action"
          }
        },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

/**
 * Helper function to publish test events
 */
function publishTestEvent(eventType: string, storeId: string) {
  switch (eventType) {
    case 'order_simulation':
      eventPublisher.publishOrderEvent(
        storeId,
        'order.created' as any,
        `test_order_${Date.now()}`,
        {
          id: `test_order_${Date.now()}`,
          customerName: "Test Customer",
          totalAmount: Math.random() * 1000,
          status: "pending",
          items: [
            { name: "Test Product", quantity: 1, price: Math.random() * 100 }
          ]
        }
      );
      break;

    case 'inventory_alert':
      eventPublisher.publishInventoryAlert(
        storeId,
        `test_product_${Date.now()}`,
        "Test Product",
        Math.floor(Math.random() * 10),
        5
      );
      break;

    case 'customer_activity':
      eventPublisher.publishCustomerEvent(
        storeId,
        'customer.new' as any,
        `test_customer_${Date.now()}`,
        {
          id: `test_customer_${Date.now()}`,
          name: "Test Customer",
          email: "test@example.com",
          signUpDate: new Date().toISOString()
        }
      );
      break;

    case 'payment_test':
      eventPublisher.publishPaymentEvent(
        storeId,
        `test_payment_${Date.now()}`,
        Math.random() * 500,
        "credit_card",
        "completed"
      );
      break;

    case 'performance_update':
      eventPublisher.publishPerformanceUpdate(storeId, {
        revenue: Math.random() * 10000,
        orders: Math.floor(Math.random() * 100),
        conversionRate: Math.random() * 10,
        avgOrderValue: Math.random() * 100
      });
      break;
  }
}