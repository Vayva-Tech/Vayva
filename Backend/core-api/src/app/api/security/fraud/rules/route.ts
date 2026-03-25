/**
 * Fraud Rules Management
 * GET  /api/security/fraud/rules  - List all rules for a store
 * POST /api/security/fraud/rules  - Create a new fraud rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { fraudDetectionService, type FraudRule } from '@vayva/security';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/security/fraud/rules
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = request.headers.get('x-store-id');
    if (!storeId) {
      return NextResponse.json({ error: 'x-store-id header required' }, { status: 400 });
    }

    const rules = fraudDetectionService.getStoreRules(storeId);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('[Fraud] List rules failed:', error);
    return NextResponse.json({ error: 'Failed to get fraud rules' }, { status: 500 });
  }
}

/**
 * POST /api/security/fraud/rules
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = request.headers.get('x-store-id');
    if (!storeId) {
      return NextResponse.json({ error: 'x-store-id header required' }, { status: 400 });
    }

    const body = await request.json() as {
      name: string;
      description: string;
      type: 'velocity' | 'amount' | 'geolocation' | 'device' | 'behavioral' | 'ml' | 'custom';
      condition: {
        field: string;
        operator: string;
        value: unknown;
      };
      score: number;
      action: 'score' | 'block' | 'review' | 'challenge';
      priority?: number;
    };

    const rule = await fraudDetectionService.createRule(storeId, {
      ...body,
      condition: {
        ...body.condition,
        operator: body.condition.operator as FraudRule['condition']['operator'],
      },
    });
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error('[Fraud] Create rule failed:', error);
    return NextResponse.json({ error: 'Failed to create fraud rule' }, { status: 500 });
  }
}
