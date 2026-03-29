/**
 * GET /api/beauty/routines
 * Proxy to backend beauty service
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/beauty/routines`,
      {
        method: 'GET',
        headers: auth.headers,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Beauty] Get routines failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get routines' 
      },
      { status: 500 }
    );
  }
}
