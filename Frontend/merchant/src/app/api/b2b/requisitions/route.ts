import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';
import type { CreateRequisitionInput, RequisitionStatus, RequisitionUrgency } from '@/types/phase4-industry';

// GET /api/b2b/requisitions - List requisitions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || undefined;
    const status = searchParams.get('status') as RequisitionStatus | undefined;
    const urgency = searchParams.get('urgency') as RequisitionUrgency | undefined;

    // Fetch requisitions via API
    const queryParams = new URLSearchParams({ storeId: session.user.storeId });
    if (customerId) queryParams.append('customerId', customerId);
    if (status) queryParams.append('status', status);
    if (urgency) queryParams.append('urgency', urgency);

    const result = await apiJson<{
      success: boolean;
      data?: Array<any>;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/requisitions?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch requisitions');
    }

    return NextResponse.json({ requisitions: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/b2b/requisitions",
        operation: "FETCH_REQUISITIONS",
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch requisitions' },
      { status: 500 }
    );
  }
}

// POST /api/b2b/requisitions - Create requisition
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateRequisitionInput = await request.json();
    
    // Ensure storeId matches session
    if (data.storeId !== session.user.storeId) {
      return NextResponse.json(
        { error: 'Store ID mismatch' },
        { status: 403 }
      );
    }

    // Create requisition via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/requisitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create requisition');
    }

    return NextResponse.json({ requisition: result.data }, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/b2b/requisitions",
        operation: "CREATE_REQUISITION",
      }
    );
    return NextResponse.json(
      { error: 'Failed to create requisition' },
      { status: 500 }
    );
  }
}
