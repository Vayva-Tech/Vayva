import { NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

// POST /api/events/purchases - purchase tickets
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tierId,
      eventId,
      customerId,
      orderId,
      quantity,
      unitPrice,
      totalPrice,
      seatNumber,
    } = body;

    if (!tierId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid ticket quantity or tier' },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/events/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to purchase tickets');
    }

    return NextResponse.json({ purchase: result.data }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/events/purchases',
        operation: 'PURCHASE_TICKETS',
      }
    );
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to purchase tickets', message: errorMessage },
      { status: 500 }
    );
  }
}
