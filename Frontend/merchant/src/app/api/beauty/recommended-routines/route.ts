/**
 * GET /api/beauty/recommended-routines
 * Proxy to backend beauty service
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID required' },
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
      `${process.env.BACKEND_API_URL}/api/v1/beauty/recommended-routines?customerId=${customerId}`,
      {
        method: 'GET',
        headers: auth.headers,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Beauty] Get recommended routines failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get recommended routines' 
      },
      { status: 500 }
    );
  }
}
