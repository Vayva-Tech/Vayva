// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

 // GET /api/electronics/warranties?customerId=xxx or ?orderId=xxx
 export async function GET(req: Request) {
   try {
     const session = await getServerSession(authOptions);
     if (!session?.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const { searchParams } = new URL(req.url);
     const customerId = searchParams.get('customerId');
     const orderId = searchParams.get('orderId');

     if (!customerId && !orderId) {
       return NextResponse.json(
         { error: 'Missing customerId or orderId' },
         { status: 400 }
       );
     }

    // Fetch warranties via backend API
    const queryParams = new URLSearchParams();
    if (customerId) queryParams.append('customerId', customerId);
    if (orderId) queryParams.append('orderId', orderId);

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/electronics/warranties?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch warranties');
    }

    return NextResponse.json({ warranties: result.data || [] });
   } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/electronics/warranties',
        operation: 'FETCH_WARRANTIES',
      }
    );
     return NextResponse.json(
       { error: 'Failed to fetch warranties', message: error instanceof Error ? error.message : String(error) },
       { status: 500 }
     );
   }
}

// POST /api/electronics/warranties
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      orderId,
      productId,
      customerId,
      serialNumber,
      warrantyType,
      startDate,
      endDate,
      durationMonths,
    } = body;

    if (!storeId || !orderId || !productId || !customerId || !warrantyType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const warranty = await electronicsService.createWarranty({
      storeId,
      orderId,
      productId,
      customerId,
      serialNumber,
      warrantyType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationMonths,
    });

    return NextResponse.json({ warranty }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to create warranty', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/electronics/warranties?id=xxx - update status
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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const warranty = await electronicsService.updateWarrantyStatus(id, status);
    return NextResponse.json({ warranty });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to update warranty', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
