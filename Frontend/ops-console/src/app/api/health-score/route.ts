/**
 * Health Score API Routes
 * Proxies requests to backend Fastify API
 * 
 * GET /api/health-score - Get health score dashboard data
 * POST /api/health-score/recalculate - Trigger recalculation for a store
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { OpsAuthService } from '@/lib/ops-auth';
import { opsApiAuthErrorResponse } from '@/lib/ops-api-auth';

// GET /api/health-score - Get health score segments and stats
export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    const { searchParams } = new URL(req.url);
    const segment = searchParams.get('segment') as 'healthy' | 'atRisk' | 'critical' | null;
    const storeId = searchParams.get('storeId');

    try {
      if (storeId) {
        OpsAuthService.requireRole(user, 'OPS_SUPPORT');
      } else {
        OpsAuthService.requireRole(user, 'OPERATOR');
      }
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    // Proxy to backend
    const params: Record<string, string> = {};
    if (segment) params.segment = segment;
    if (storeId) params.storeId = storeId;

    const response = await apiClient.get('/api/v1/health-score', params);
    return NextResponse.json(response);
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error('Health score API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/health-score/recalculate - Trigger recalculation
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, 'OPERATOR');
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const body = await req.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      );
    }

    // Proxy to backend
    const response = await apiClient.post('/api/v1/health-score/recalculate', { storeId });
    return NextResponse.json(response);
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error('Health score recalculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
