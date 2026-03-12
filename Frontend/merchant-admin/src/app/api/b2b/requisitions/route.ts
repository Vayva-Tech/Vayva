import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { b2bService } from '@/services/b2b.service';
import { CreateRequisitionInput, RequisitionStatus, RequisitionUrgency } from '@/types/phase4-industry';
import { logger } from '@/lib/logger';

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

    const requisitions = await b2bService.getRequisitions(session.user.storeId, {
      customerId,
      status,
      urgency,
    });

    return NextResponse.json({ requisitions });
  } catch (error) {
    logger.error('[B2B_REQUISITIONS_GET] Failed to fetch requisitions', { error });
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

    const requisition = await b2bService.createRequisition(data);
    return NextResponse.json({ requisition }, { status: 201 });
  } catch (error) {
    logger.error('[B2B_REQUISITIONS_POST] Failed to create requisition', { error });
    return NextResponse.json(
      { error: 'Failed to create requisition' },
      { status: 500 }
    );
  }
}
