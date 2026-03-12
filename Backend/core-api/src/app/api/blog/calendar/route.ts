import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogMediaApiService } from '@vayva/industry-blog-media';
import { authenticateRequest } from '@/middleware/auth';

const blogService = new BlogMediaApiService(prisma);

// GET /api/blog/calendar - Get content calendar
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as any || undefined;
    const status = searchParams.get('status') as any || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const items = await blogService.getContentCalendar(auth.storeId, {
      type,
      status,
      startDate,
      endDate,
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching content calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content calendar' },
      { status: 500 }
    );
  }
}

// POST /api/blog/calendar/events - Create calendar event
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const item = await blogService.createCalendarItem({
      ...body,
      storeId: auth.storeId,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
