import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

// POST /api/b2b/requisitions/[id]/approve - Approve requisition
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

    const { action } = await request.json();
    
    // Process requisition action via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/requisitions/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': session.user.storeId,
      },
      body: JSON.stringify({ action }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process requisition action' },
        { status: 400 }
      );
    }

    return NextResponse.json({ requisition: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: `/api/b2b/requisitions/[id]/approve`,
        operation: 'PROCESS_REQUISITION_ACTION',
      }
    );
    return NextResponse.json(
      { error: 'Failed to process requisition action' },
      { status: 500 }
    );
  }
}
