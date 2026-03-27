import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
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
      saleStartDate,
      saleEndDate,
      minPerCustomer,
      maxPerCustomer,
    } = body;

    if (!eventId || !name || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend API to create ticket tier
    const result = await apiJson.post(
      `${process.env.BACKEND_API_URL}/api/events/tickets`,
      {
        eventId,
        name,
        description,
        price,
        quantity,
        saleStartDate,
        saleEndDate,
        minPerCustomer,
        maxPerCustomer,
      },
      {
        headers: {
          'x-store-id': sessionStoreId,
        },
      }
    );

    return NextResponse.json({ tier: result.data }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create ticket tier', message: errorMessage },
      { status: 500 }
    );
  }
}
