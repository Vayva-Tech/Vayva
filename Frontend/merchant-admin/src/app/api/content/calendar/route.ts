import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { blogMediaService } from '@/services/blog-media.service';

// GET /api/content/calendar?storeId=xxx&filters...
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    const items = await blogMediaService.getContentCalendar(storeId, {
      ...(type && { type: type as any }),
      ...(status && { status: status as any }),
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/content/calendar
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
      type,
      platform,
      description,
      scheduledDate,
      assigneeId,
      notes,
    } = body;

    if (!storeId || !title || !type || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const item = await blogMediaService.createContentCalendarItem({
      storeId,
      title,
      type,
      platform,
      description,
      scheduledDate: new Date(scheduledDate),
      assigneeId,
      notes,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create calendar item', message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/content/calendar?id=xxx - update status
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

    const body = await req.json();
    const { status, contentId } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const item = await blogMediaService.updateContentCalendarStatus(
      id,
      status,
      contentId
    );
    return NextResponse.json({ item });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to update calendar item', message: errorMessage },
      { status: 500 }
    );
  }
}
