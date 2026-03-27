/**
 * Playbooks API Routes
 * Proxies requests to backend Fastify API
 * 
 * GET /api/playbooks - List all playbooks and their stats
 * POST /api/playbooks/execute - Execute a playbook manually
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { OpsAuthService } from '@/lib/ops-auth';
import { opsApiAuthErrorResponse } from '@/lib/ops-api-auth';

async function requirePlaybooksRead(): Promise<void> {
  const { user } = await OpsAuthService.requireSession();
  OpsAuthService.requireRole(user, 'OPS_SUPPORT');
}

async function requirePlaybooksMutate(): Promise<void> {
  const { user } = await OpsAuthService.requireSession();
  OpsAuthService.requireRole(user, 'OPERATOR');
}

// GET /api/playbooks - Get playbooks and execution stats
export async function GET(req: NextRequest) {
  try {
    try {
      await requirePlaybooksRead();
    } catch (authErr) {
      const res = opsApiAuthErrorResponse(authErr);
      if (res) return res;
      throw authErr;
    }

    const { searchParams } = new URL(req.url);
    const playbookId = searchParams.get('playbookId');
    const storeId = searchParams.get('storeId');

    // Proxy to backend
    const params: Record<string, string> = {};
    if (playbookId) params.playbookId = playbookId;
    if (storeId) params.storeId = storeId;

    const response = await apiClient.get('/api/v1/playbooks', params);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Playbooks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/playbooks/execute - Manually execute a playbook
export async function POST(req: NextRequest) {
  try {
    try {
      await requirePlaybooksMutate();
    } catch (authErr) {
      const res = opsApiAuthErrorResponse(authErr);
      if (res) return res;
      throw authErr;
    }

    const body = await req.json();
    const { playbookId, storeId, triggerData } = body;

    if (!playbookId || !storeId) {
      return NextResponse.json(
        { error: 'playbookId and storeId are required' },
        { status: 400 }
      );
    }

    // Proxy to backend
    const response = await apiClient.post('/api/v1/playbooks/execute', {
      playbookId,
      storeId,
      triggerData,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Playbook execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
