import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";

/**
 * GET /api/notifications/quiet-hours
 * Get quiet hours configuration for the merchant
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        // Import notification engine dynamically
        const { initializeNotificationEngine } = await import('@vayva/notification-engine');
        
        const engine = await initializeNotificationEngine();
        const config = engine.getQuietHoursConfig(session.merchantId);
        const isActive = await engine.isQuietHoursActive(session.merchantId);
        const nextPeriod = engine.getNextQuietHoursPeriod(session.merchantId);
        
        return {
          status: 200,
          body: {
            success: true,
            config,
            isActive,
            nextPeriod
          }
        };
      } catch (error) {
        console.error('[QUIET_HOURS_GET_ERROR]', error);
        return {
          status: 500,
          body: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch quiet hours config' 
          }
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/notifications/quiet-hours
 * Update quiet hours configuration
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const body = await request.json();
        
        // Import settings manager to update quiet hours
        const { getSettingsManager } = await import('@vayva/settings');
        const settingsManager = getSettingsManager();
        
        // Update notification settings with quiet hours
        await settingsManager.updateNotificationSettings({
          quietHours: {
            enabled: body.enabled ?? true,
            startTime: body.startTime || '22:00',
            endTime: body.endTime || '08:00',
            timezone: body.timezone || 'UTC'
          }
        });
        
        return {
          status: 200,
          body: {
            success: true,
            message: 'Quiet hours configuration updated'
          }
        };
      } catch (error) {
        console.error('[QUIET_HOURS_UPDATE_ERROR]', error);
        return {
          status: 500,
          body: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update quiet hours' 
          }
        };
      }
    },
    { requireAuth: true }
  );
}