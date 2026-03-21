// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

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

     // Fetch content calendar via backend API
     const queryParams = new URLSearchParams({ storeId });
     if (type) queryParams.append('type', type);
     if (status) queryParams.append('status', status);

     const result = await apiJson<{
       success: boolean;
       data?: any[];
       error?: string;
     }>(`${process.env.BACKEND_API_URL}/api/content/calendar?${queryParams.toString()}`);

     if (!result.success) {
       throw new Error(result.error || 'Failed to fetch calendar');
     }

     return NextResponse.json({ items: result.data || [] });
   } catch (error: unknown) {
     handleApiError(
       error,
       {
         endpoint: '/api/content/calendar',
         operation: 'FETCH_CONTENT_CALENDAR',
       }
     );
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

    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/content/calendar`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-store-id': storeId },
        body: JSON.stringify({ storeId, title, type, platform, description, scheduledDate, assigneeId, notes }),
      }
    );

    return NextResponse.json({ item: result.data }, { status: 201 });
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
    const { status, contentId, storeId } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/content/calendar?id=${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-store-id': storeId || '' },
        body: JSON.stringify({ status, contentId }),
      }
    );

    return NextResponse.json({ item: result.data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to update calendar item', message: errorMessage },
      { status: 500 }
    );
  }
}
