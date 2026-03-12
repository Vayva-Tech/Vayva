import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";
import { v4 as uuidv4 } from 'uuid';

// POST /api/tickets/purchase - Purchase tickets
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, ticketTierId, quantity, customerInfo } = body;

    // Validate required fields
    if (!eventId || !ticketTierId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid purchase request' },
        { status: 400 }
      );
    }

    // Fetch event and ticket tier
    const [event, ticketTier] = await Promise.all([
      prisma.event.findUnique({
        where: { id: eventId }
      }),
      prisma.ticketTier.findUnique({
        where: { id: ticketTierId }
      })
    ]);

    if (!event || !ticketTier) {
      return NextResponse.json(
        { error: 'Event or ticket tier not found' },
        { status: 404 }
      );
    }

    // Check if ticket tier belongs to event
    if (ticketTier.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invalid ticket tier for this event' },
        { status: 400 }
      );
    }

    // Check availability
    if (ticketTier.remaining < quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    // Check max per order
    if (quantity > ticketTier.maxPerOrder) {
      return NextResponse.json(
        { error: `Maximum ${ticketTier.maxPerOrder} tickets per order` },
        { status: 400 }
      );
    }

    // Check sales period
    const now = new Date();
    if (now < ticketTier.salesStart || (ticketTier.salesEnd && now > ticketTier.salesEnd)) {
      return NextResponse.json(
        { error: 'Tickets are not available for purchase at this time' },
        { status: 400 }
      );
    }

    // Calculate total price
    const unitPrice = parseFloat(ticketTier.price.toString());
    const totalPrice = unitPrice * quantity;

    // Create ticket purchase record
    const ticketPurchase = await prisma.ticketPurchase.create({
      data: {
        tierId: ticketTierId,
        eventId: eventId,
        customerId: session.user.id,
        orderId: `ORDER-${uuidv4().substring(0, 8).toUpperCase()}`,
        quantity,
        unitPrice,
        totalPrice,
        status: 'pending',
        ticketNumber: `TICKET-${uuidv4().substring(0, 8).toUpperCase()}`,
        qrCode: uuidv4(), // In production, generate proper QR code
        seatNumber: null // For seated events, assign seats
      }
    });

    // Update ticket tier remaining count
    await prisma.ticketTier.update({
      where: { id: ticketTierId },
      data: {
        remaining: {
          decrement: quantity
        }
      }
    });

    // Update event capacity tracking
    await prisma.event.update({
      where: { id: eventId },
      data: {
        capacity: {
          decrement: quantity
        }
      }
    });

    return NextResponse.json({
      success: true,
      purchase: {
        id: ticketPurchase.id,
        orderId: ticketPurchase.orderId,
        ticketNumber: ticketPurchase.ticketNumber,
        quantity: ticketPurchase.quantity,
        unitPrice: ticketPurchase.unitPrice,
        totalPrice: ticketPurchase.totalPrice,
        status: ticketPurchase.status,
        qrCode: ticketPurchase.qrCode,
        createdAt: ticketPurchase.createdAt
      }
    });

  } catch (error) {
    console.error('Failed to purchase tickets:', error);
    return NextResponse.json(
      { error: 'Failed to purchase tickets' },
      { status: 500 }
    );
  }
}

// GET /api/tickets/purchases - Get user's ticket purchases
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      customerId: session.user.id
    };

    if (status) {
      where.status = status;
    }

    const purchases = await prisma.ticketPurchase.findMany({
      where,
      include: {
        event: {
          select: {
            title: true,
            venue: true,
            startDate: true,
            endDate: true
          }
        },
        tier: {
          select: {
            name: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      orderId: purchase.orderId,
      ticketNumber: purchase.ticketNumber,
      quantity: purchase.quantity,
      unitPrice: parseFloat(purchase.unitPrice.toString()),
      totalPrice: parseFloat(purchase.totalPrice.toString()),
      status: purchase.status,
      qrCode: purchase.qrCode,
      checkedInAt: purchase.checkedInAt,
      event: {
        title: purchase.event.title,
        venue: purchase.event.venue,
        startDate: purchase.event.startDate,
        endDate: purchase.event.endDate
      },
      tier: {
        name: purchase.tier.name,
        price: parseFloat(purchase.tier.price.toString())
      },
      createdAt: purchase.createdAt
    }));

    return NextResponse.json({ purchases: transformedPurchases });

  } catch (error) {
    console.error('Failed to fetch ticket purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket purchases' },
      { status: 500 }
    );
  }
}