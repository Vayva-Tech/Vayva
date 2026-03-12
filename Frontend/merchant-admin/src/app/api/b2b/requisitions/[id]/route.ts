import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { b2bService } from '@/services/b2b.service';
import { logger } from '@/lib/logger';

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
    
    if (action === 'approve') {
      const requisition = await b2bService.approveRequisition(id, session.user.id);
      return NextResponse.json({ requisition });
    } else if (action === 'reject') {
      const { reason } = await request.json();
      const requisition = await b2bService.rejectRequisition(id, reason || '', session.user.id);
      return NextResponse.json({ requisition });
    } else if (action === 'order') {
      const requisition = await b2bService.markRequisitionOrdered(id);
      return NextResponse.json({ requisition });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use approve, reject, or order' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('[B2B_REQUISITION_ACTION] Failed to process requisition action', { error });
    return NextResponse.json(
      { error: 'Failed to process requisition action' },
      { status: 500 }
    );
  }
}
