/**
 * GET /api/account-management/status
 * Proxy to backend account management service
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID required' },
        { status: 400 }
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/account-management/status?storeId=${storeId}`,
      {
        method: 'GET',
        headers: auth.headers,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[AccountManagement] Get status failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get deletion status' 
      },
      { status: 500 }
    );
  }
}
