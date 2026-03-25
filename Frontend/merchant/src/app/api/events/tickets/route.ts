import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { eventsService } from '@/services/events.service';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

// GET /api/events/tickets?eventId=xxx - get ticket tiers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Fetch ticket tiers via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/events/tickets?eventId=${encodeURIComponent(eventId)}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch ticket tiers');
    }

    return NextResponse.json({ tiers: result.data });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/events/tickets',
        operation: 'GET_TICKET_TIERS',
      }
    );
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket tiers', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/events/tickets - create ticket tier
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      eventId,
      name,
      description,
      price,
      quantity,
      salesStart,
      salesEnd,
      maxPerOrder,
      benefits,
    } = body;

    if (!eventId || !name || price === undefined || !quantity || !salesStart || !salesEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tier = await eventsService.createTicketTier(sessionStoreId, {
      eventId,
      name,
      description,
      price,
      quantity,
      salesStart: new Date(salesStart),
      salesEnd: new Date(salesEnd),
      maxPerOrder,
      benefits,
    });

    return NextResponse.json({ tier }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create ticket tier', message: errorMessage },
      { status: 500 }
    );
  }
}
