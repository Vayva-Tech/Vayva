import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";

/**
 * POST /api/notifications/engine
 * Send notification through the notification engine
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const body = await request.json();
        
        // Import notification engine dynamically to avoid build issues
        const { initializeNotificationEngine } = await import('@vayva/notification-engine');
        
        const engine = await initializeNotificationEngine();
        
        // Transform request body to notification engine format
        const notificationPayload = {
          subject: body.subject || 'Notification',
          body: body.body || '',
          recipient: {
            storeId: session.merchantId,
            userId: session.userId,
            ...(body.recipient || {})
          },
          category: body.category || 'general',
          priority: body.priority || 'normal',
          channels: body.channels || ['in-app'],
          source: body.source || 'merchant',
          data: body.data || {}
        };

        const results = await engine.send(notificationPayload);
        
        return {
          status: 200,
          body: {
            success: true,
            results,
            message: 'Notification sent successfully'
          }
        };
      } catch (error) {
        console.error('[NOTIFICATION_ENGINE_API_ERROR]', error);
        return {
          status: 500,
          body: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to send notification' 
          }
        };
      }
    },
    { requireAuth: true }
  );
}