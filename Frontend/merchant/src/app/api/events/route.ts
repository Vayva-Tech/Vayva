// @ts-nocheck
import { logger } from "@vayva/shared";
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import type { EventStatus } from '@/types/phase4-industry';

// GET /api/events?storeId=xxx&filters...
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    // Call backend API to fetch events
    const result = await apiJson<{
      events: Array<{ id: string; title: string; description?: string; venue?: string; startDate: Date; endDate: Date; status: EventStatus }>;
    }>(
      `${process.env.BACKEND_API_URL}/api/events?storeId=${storeId}&status=${status || ''}&category=${category || ''}&upcoming=${upcoming}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/events",
        operation: "GET_EVENTS",
      }
    );
    throw error;
  }
}

// POST /api/events
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      title,
      description,
      venue,
      address,
      startDate,
      endDate,
      timezone,
      capacity,
      bannerImage,
      organizerId,
      category,
      isPublic,
      requiresApproval,
    } = body;

    if (!storeId || !title || !startDate || !endDate || !capacity || !organizerId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await eventsService.createEvent({
      storeId,
      title,
      description,
      venue,
      address,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timezone,
      capacity,
      bannerImage,
      organizerId,
      category,
      isPublic,
      requiresApproval,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    logger.error('[EVENTS_POST]', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PATCH /api/events?id=xxx - publish event
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const event = await eventsService.publishEvent(id);
    return NextResponse.json({ event });
  } catch (error) {
    logger.error('[EVENTS_PATCH]', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to publish event' },
      { status: 500 }
    );
  }
}
