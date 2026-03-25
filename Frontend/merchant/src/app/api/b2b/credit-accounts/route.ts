import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

// GET /api/b2b/credit-accounts - List credit accounts
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
    const isActive = searchParams.get('isActive') === 'true' ? true : 
                     searchParams.get('isActive') === 'false' ? false : undefined;

    // Fetch credit accounts via API
    const queryParams = new URLSearchParams({ storeId: session.user.storeId });
    if (isActive !== undefined) queryParams.append('isActive', String(isActive));

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/credit-accounts?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch credit accounts');
    }

    return NextResponse.json({ accounts: result.data || [] });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/b2b/credit-accounts',
        operation: 'FETCH_CREDIT_ACCOUNTS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch credit accounts' },
      { status: 500 }
    );
  }
}

// POST /api/b2b/credit-accounts - Create credit account
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

    const data = await request.json();
    
    // Ensure storeId matches session
    if (data.storeId !== session.user.storeId) {
      return NextResponse.json(
        { error: 'Store ID mismatch' },
        { status: 403 }
      );
    }

    // Create credit account via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/credit-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': session.user.storeId,
      },
      body: JSON.stringify(data),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create credit account' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/b2b/credit-accounts',
        operation: 'CREATE_CREDIT_ACCOUNT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to create credit account' },
      { status: 500 }
    );
  }
}
