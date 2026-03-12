import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { b2bService } from '@/services/b2b.service';
import { logger } from '@/lib/logger';

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

    const account = await b2bService.getCreditAccountByCustomer(id);
    
    if (!account || account.storeId !== session.user.storeId) {
      return NextResponse.json({ error: 'Credit account not found' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    logger.error('[B2B_CREDIT_ACCOUNT_GET] Failed to fetch credit account', { error });
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

    const account = await b2bService.approveCreditAccount(id, session.user.id);
    return NextResponse.json({ account });
  } catch (error) {
    logger.error('[B2B_CREDIT_ACCOUNT_APPROVE] Failed to approve credit account', { error });
    return NextResponse.json(
      { error: 'Failed to approve credit account' },
      { status: 500 }
    );
  }
}
