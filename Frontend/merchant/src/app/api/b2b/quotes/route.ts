import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';
import type { CreateQuoteInput, UpdateQuoteInput, QuoteStatus } from '@/types/phase4-industry';

// GET /api/b2b/quotes - List quotes
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || undefined;
    const status = searchParams.get('status') as QuoteStatus | undefined;

    // Fetch quotes via API
    const queryParams = new URLSearchParams({ storeId: session.user.storeId });
    if (customerId) queryParams.append('customerId', customerId);
    if (status) queryParams.append('status', status);

    const result = await apiJson<{
      success: boolean;
      data?: Array<any>;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/quotes?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch quotes');
    }

    return NextResponse.json({ quotes: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/b2b/quotes",
        operation: "FETCH_QUOTES",
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST /api/b2b/quotes - Create quote
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateQuoteInput = await request.json();
    
    // Ensure storeId matches session
    if (data.storeId !== session.user.storeId) {
      return NextResponse.json(
        { error: 'Store ID mismatch' },
        { status: 403 }
      );
    }

    // Create quote via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create quote');
    }

    return NextResponse.json({ quote: result.data }, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/b2b/quotes",
        operation: "CREATE_QUOTE",
      }
    );
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
