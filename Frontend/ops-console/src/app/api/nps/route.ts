/**
 * NPS API Routes
 * Proxies requests to backend Fastify API
 * 
 * GET /api/nps - Get NPS metrics and survey data
 * POST /api/nps/send - Send NPS survey to a store
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { OpsAuthService } from '@/lib/ops-auth';
import { opsApiAuthErrorResponse } from '@/lib/ops-api-auth';

// GET /api/nps - Get NPS metrics
export async function GET(req: NextRequest) {
  try {
    let user: { role?: string };
    try {
      const ctx = await OpsAuthService.requireSession();
      user = ctx.user;
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const period = searchParams.get('period') || '90d'; // 30d, 90d, 1y, all

    try {
      if (storeId) {
        OpsAuthService.requireRole(user, 'OPS_SUPPORT');
      } else {
        OpsAuthService.requireRole(user, 'OPERATOR');
      }
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

    // Proxy to backend
    const params: Record<string, string> = { period };
    if (storeId) params.storeId = storeId;

    const response = await apiClient.get('/api/v1/nps', params);
    return NextResponse.json(response);
  } catch (error) {
    console.error('NPS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/nps/send - Send NPS survey
export async function POST(req: NextRequest) {
  try {
    let user: { role?: string };
    try {
      const ctx = await OpsAuthService.requireSession();
      user = ctx.user;
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

    try {
      OpsAuthService.requireRole(user, 'OPERATOR');
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

    const body = await req.json();
    const { storeId, surveyType } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      );
    }

    // Proxy to backend
    const response = await apiClient.post('/api/v1/nps/send', { storeId, surveyType });
    return NextResponse.json(response);
  } catch (error) {
    console.error('NPS send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
