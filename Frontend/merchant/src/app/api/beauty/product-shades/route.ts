/**
 * GET /api/beauty/product-shades
 * Proxy to backend beauty service
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
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
      `${process.env.BACKEND_API_URL}/api/v1/beauty/product-shades?productId=${productId}`,
      {
        method: 'GET',
        headers: auth.headers,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Beauty] Get product shades failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get product shades' 
      },
      { status: 500 }
    );
  }
}
