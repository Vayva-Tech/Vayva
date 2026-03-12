import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { eventsService } from '@/services/events.service';

// POST /api/events/purchases - purchase tickets
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (!tierId || !eventId || !customerId || !orderId || !quantity || unitPrice === undefined || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const purchase = await eventsService.purchaseTickets({
      tierId,
      eventId,
      customerId,
      orderId,
      quantity,
      unitPrice,
      totalPrice,
      seatNumber,
    });

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to purchase tickets', message: errorMessage },
      { status: 500 }
    );
  }
}
