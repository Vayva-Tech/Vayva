// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

 // GET /api/food/reservations?storeId=xxx&date=xxx
 export async function GET(req: Request) {
   try {
     const session = await getServerSession(authOptions);
     if (!session?.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const { searchParams } = new URL(req.url);
     const storeId = searchParams.get('storeId');
     const date = searchParams.get('date');
     const status = searchParams.get('status');

     if (!storeId || !date) {
       return NextResponse.json(
         { error: 'Missing storeId or date' },
         { status: 400 }
       );
     }

     // Fetch reservations via backend API
     const queryParams = new URLSearchParams({ storeId, date });
     if (status) queryParams.append('status', status);

     const result = await apiJson<{
       success: boolean;
       data?: any[];
       error?: string;
     }>(`${process.env.BACKEND_API_URL}/api/food/reservations?${queryParams.toString()}`);

     if (!result.success) {
       throw new Error(result.error || 'Failed to fetch reservations');
     }

     return NextResponse.json({ reservations: result.data || [] });
   } catch (error: unknown) {
     handleApiError(
       error,
       {
         endpoint: '/api/food/reservations',
         operation: 'FETCH_RESERVATIONS',
       }
     );
     const errorMessage = error instanceof Error ? error.message : String(error);
     return NextResponse.json(
       { error: 'Failed to fetch reservations', message: errorMessage },
       { status: 500 }
     );
   }
}

// POST /api/food/reservations
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      customerId,
      customerName,
      customerPhone,
      partySize,
      date,
      time,
      tableId,
      specialRequests,
      dietaryRestrictions,
      depositAmount,
    } = body;

    if (!storeId || !customerId || !customerName || !customerPhone || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reservation = await foodService.createReservation({
      storeId,
      customerId,
      customerName,
      customerPhone,
      partySize: Number(partySize),
      date: new Date(date),
      time,
      tableId,
      specialRequests,
      dietaryRestrictions: dietaryRestrictions || [],
      depositAmount,
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create reservation', message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/food/reservations?id=xxx - check-in or cancel
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
    const { action } = body; // 'checkin' or 'cancel'

    let reservation;
    if (action === 'checkin') {
      reservation = await foodService.checkInReservation(id);
    } else if (action === 'cancel') {
      reservation = await foodService.cancelReservation(id);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use checkin or cancel' },
        { status: 400 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to update reservation', message: errorMessage },
      { status: 500 }
    );
  }
}
