import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';
import type { UpdateQuoteInput, QuoteStatus } from '@/types/phase4-industry';

// GET /api/b2b/quotes/[id] - Get single quote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch quote via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/quotes/${id}`, {
      headers: {
        'x-store-id': session.user.storeId,
      },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({ quote: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/b2b/quotes/[id]",
        operation: "FETCH_QUOTE",
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// PATCH /api/b2b/quotes/[id] - Update quote
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: UpdateQuoteInput = await request.json();
    
    // Update quote via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/quotes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': session.user.storeId,
      },
      body: JSON.stringify(data),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update quote');
    }

    return NextResponse.json({ quote: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/b2b/quotes/[id]",
        operation: "UPDATE_QUOTE",
      }
    );
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// POST /api/b2b/quotes/[id]/accept - Accept quote and convert to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Accept quote via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/quotes/${id}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': session.user.storeId,
      },
      body: JSON.stringify({ orderId }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to accept quote');
    }

    return NextResponse.json({ quote: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/b2b/quotes/[id]/accept",
        operation: "ACCEPT_QUOTE",
      }
    );
    return NextResponse.json(
      { error: 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
