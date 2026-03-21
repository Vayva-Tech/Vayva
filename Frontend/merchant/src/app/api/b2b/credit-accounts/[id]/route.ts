import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

// GET /api/b2b/credit-accounts/[id] - Get single credit account
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

    // Fetch credit account via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/credit-accounts/${id}`, {
      headers: {
        'x-store-id': session.user.storeId,
      },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Credit account not found' }, { status: 404 });
    }

    return NextResponse.json({ account: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: `/api/b2b/credit-accounts/[id]`,
        operation: 'FETCH_CREDIT_ACCOUNT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch credit account' },
      { status: 500 }
    );
  }
}

// POST /api/b2b/credit-accounts/[id]/approve - Approve credit account
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

    // Approve credit account via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/credit-accounts/${id}/approve`, {
      method: 'POST',
      headers: {
        'x-store-id': session.user.storeId,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to approve credit account');
    }

    return NextResponse.json({ account: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: `/api/b2b/credit-accounts/[id]/approve`,
        operation: 'APPROVE_CREDIT_ACCOUNT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to approve credit account' },
      { status: 500 }
    );
  }
}
