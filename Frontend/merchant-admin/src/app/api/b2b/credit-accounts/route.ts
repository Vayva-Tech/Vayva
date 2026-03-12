import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { b2bService } from '@/services/b2b.service';
import { CreateCreditAccountInput } from '@/types/phase4-industry';
import { logger } from '@/lib/logger';

// GET /api/b2b/credit-accounts - List credit accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive') === 'true' ? true : 
                     searchParams.get('isActive') === 'false' ? false : undefined;

    const storeId = session?.user?.storeId;
    const accounts = await b2bService.getCreditAccounts(storeId, isActive);
    return NextResponse.json({ accounts });
  } catch (error) {
    logger.error('[B2B_CREDIT_ACCOUNTS_GET] Failed to fetch credit accounts', { error });
    return NextResponse.json(
      { error: 'Failed to fetch credit accounts' },
      { status: 500 }
    );
  }
}

// POST /api/b2b/credit-accounts - Create credit account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateCreditAccountInput = await request.json();
    
    // Ensure storeId matches session
    if (data.storeId !== session.user.storeId) {
      return NextResponse.json(
        { error: 'Store ID mismatch' },
        { status: 403 }
      );
    }

    const account = await b2bService.createCreditAccount(data);
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    logger.error('[B2B_CREDIT_ACCOUNTS_POST] Failed to create credit account', { error });
    return NextResponse.json(
      { error: 'Failed to create credit account' },
      { status: 500 }
    );
  }
}
