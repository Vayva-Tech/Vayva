import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { b2bService } from '@/services/b2b.service';
import { UpdateQuoteInput, QuoteStatus } from '@/types/phase4-industry';
import { logger } from '@/lib/logger';

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

    const quote = await b2bService.getQuoteById(id);
    
    if (!quote || quote.storeId !== session.user.storeId) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    logger.error('[B2B_QUOTES_GET] Failed to fetch quote', error);
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
    const quote = await b2bService.updateQuote(id, data);
    
    return NextResponse.json({ quote });
  } catch (error) {
    logger.error('[B2B_QUOTES_PATCH] Failed to update quote', error);
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

    const quote = await b2bService.acceptQuote(id, orderId);
    return NextResponse.json({ quote });
  } catch (error) {
    logger.error('[B2B_QUOTES_ACCEPT] Failed to accept quote', error);
    return NextResponse.json(
      { error: 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
