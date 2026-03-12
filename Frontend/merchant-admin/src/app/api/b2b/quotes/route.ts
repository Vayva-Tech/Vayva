import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { b2bService } from '@/services/b2b.service';
import { CreateQuoteInput, UpdateQuoteInput, QuoteStatus } from '@/types/phase4-industry';
import { logger } from '@/lib/logger';

// GET /api/b2b/quotes - List quotes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || undefined;
    const status = searchParams.get('status') as QuoteStatus | undefined;

    const quotes = await b2bService.getQuotes(session.user.storeId, {
      customerId,
      status,
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    logger.error('[B2B_QUOTES_GET] Failed to fetch quotes', { error });
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST /api/b2b/quotes - Create quote
export async function POST(request: NextRequest) {
  try {
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

    const quote = await b2bService.createQuote(data);
    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    logger.error('[B2B_QUOTES_POST] Failed to create quote', { error });
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
