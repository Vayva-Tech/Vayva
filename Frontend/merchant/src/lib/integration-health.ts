import { logger } from "@vayva/shared";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

/**
 * P11.2: Log integration events for health monitoring
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logIntegrationEvent(storeId: string, integrationKey: any, eventType: any, status: string) {
  // Feature flag check
  const isEnabled = process.env.OPS_INTEGRATION_HEALTH_ENABLED === "true";
  if (!isEnabled)
    return;

  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/integration-health/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ integrationKey, eventType, status }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Failed to log integration event' } }));
      logger.error('[Integration Health] Failed to log event', error);
    }
  } catch (error) {
    // Silent fail but log
    logger.error('[Integration Health] Failed to log event:', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Get integration health status for ops dashboard
 */
export async function getIntegrationHealth(storeId: string) {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/integration-health/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch integration health');
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    logger.error('[Integration Health] Error fetching health status', error);
    return {
      whatsapp: { status: 'UNKNOWN' as const, lastSuccess: null, lastEvent: null },
      paystack: { status: 'UNKNOWN' as const, lastSuccess: null, lastEvent: null },
      delivery: { status: 'UNKNOWN' as const, lastSuccess: null, lastEvent: null },
    };
  }
}

/**
 * Get integration event history
 */
export async function getIntegrationHistory(storeId: string, integrationKey?: string, limit = 50) {
  try {
    const token = await getAuthToken();
    const params = new URLSearchParams({ limit: String(limit) });
    if (integrationKey) params.append('integrationKey', integrationKey);

    const res = await fetch(
      `${BACKEND_URL}/api/v1/integration-health/history?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch integration history');
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    logger.error('[Integration Health] Error fetching history', error);
    return [];
  }
}

/**
 * Get integration statistics
 */
export async function getIntegrationStats(storeId: string, days = 7) {
  try {
    const token = await getAuthToken();
    const res = await fetch(
      `${BACKEND_URL}/api/v1/integration-health/stats?days=${days}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch integration stats');
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    logger.error('[Integration Health] Error fetching stats', error);
    return {
      totalEvents: 0,
      successCount: 0,
      failCount: 0,
      successRate: 0,
      byIntegration: [],
    };
  }
}

/**
 * Check if a specific integration is healthy
 */
export async function isIntegrationHealthy(
  storeId: string,
  integrationKey: string,
  thresholdHours = 24
) {
  try {
    const token = await getAuthToken();
    const res = await fetch(
      `${BACKEND_URL}/api/v1/integration-health/check/${integrationKey}?thresholdHours=${thresholdHours}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to check integration health');
    }

    const data = await res.json();
    return data.data.healthy;
  } catch (error) {
    logger.error('[Integration Health] Error checking health', error);
    return false;
  }
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch {
    return null;
  }
}
