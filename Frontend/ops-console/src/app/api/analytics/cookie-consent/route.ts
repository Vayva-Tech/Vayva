/**
 * COOKIE CONSENT ANALYTICS API
 * 
 * Track cookie consent events for compliance analytics
 * GDPR Article 7(1) - Demonstrating valid consent
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { OpsAuthService } from '@/lib/ops-auth';
import { opsApiAuthErrorResponse } from '@/lib/ops-api-auth';

// ============================================================================
// POST /api/analytics/cookie-consent
// Track consent event
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitorId,
      sessionId,
      choice,
      categories,
      userAgent,
      ip,
      referer,
    } = body;

    // Validate required fields
    if (!visitorId || !choice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward to backend for storage
    const response = await apiClient.post<any>('/api/v1/analytics/cookie-consent', {
      visitorId,
      sessionId,
      choice,
      categories,
      userAgent,
      ip,
      referer,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data?.eventId || 'pending',
      timestamp: response.data?.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cookie consent tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track consent event' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/analytics/cookie-consent
// Get consent analytics (Ops Console only)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, 'OPERATOR');
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const groupBy = searchParams.get('groupBy') || 'day';

    // Forward to backend for analytics
    const params: Record<string, string> = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get<any>('/api/v1/analytics/cookie-consent', params);

    return NextResponse.json(response.data);
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
