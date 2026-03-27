import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

// GET /api/events/attendees?eventId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Fetch event attendees via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/events/attendees?eventId=${encodeURIComponent(eventId)}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch attendees');
    }

    return NextResponse.json({ attendees: result.data });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/events/attendees',
        operation: 'GET_ATTENDEES',
      }
    );
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch attendees', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/events/attendees
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
      customerId,
      email,
      firstName,
      lastName,
      company,
      jobTitle,
      dietaryRequirements,
      accessibilityNeeds,
      notes,
    } = body;

    if (!eventId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend API to add attendee
    const result = await apiJson.post(
      `${process.env.BACKEND_API_URL}/api/events/attendees`,
      {
        eventId,
        customerId,
        email,
        firstName,
        lastName,
        company,
        jobTitle,
        dietaryRequirements,
        accessibilityNeeds,
        notes,
      },
      {
        headers: {
          'x-store-id': sessionStoreId,
        },
      }
    );

    return NextResponse.json({ attendee: result.data }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to add attendee', message: errorMessage },
      { status: 500 }
    );
  }
}
