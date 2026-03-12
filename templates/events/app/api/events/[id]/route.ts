import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";

// GET /api/events/[id] - Get event details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        status: 'published',
        isPublic: true
      },
      include: {
        ticketTiers: {
          where: {
            isActive: true
          },
          orderBy: {
            price: 'asc'
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      venue: event.venue,
      address: event.address,
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: event.timezone,
      category: event.category,
      bannerImage: event.bannerImage,
      capacity: event.capacity,
      isPublic: event.isPublic,
      ticketTiers: event.ticketTiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        description: tier.description,
        price: parseFloat(tier.price.toString()),
        quantity: tier.quantity,
        remaining: tier.remaining,
        salesStart: tier.salesStart,
        salesEnd: tier.salesEnd,
        maxPerOrder: tier.maxPerOrder,
        benefits: tier.benefits
      }))
    };

    return NextResponse.json({ event: transformedEvent });

  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}