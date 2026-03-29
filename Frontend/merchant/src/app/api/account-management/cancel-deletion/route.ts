/**
 * POST /api/account-management/cancel-deletion
 * Proxy to backend account management service
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const auth = await buildBackendAuthHeaders(request);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/v1/account-management/cancel-deletion`, {
      method: 'POST',
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[AccountManagement] Cancel deletion failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to cancel deletion' 
      },
      { status: 500 }
    );
  }
}
