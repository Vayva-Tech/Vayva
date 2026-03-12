import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";

// GET /api/events - List events with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'published',
      isPublic: true,
      startDate: {
        gte: new Date()
      }
    };

    if (category) {
      where.category = category;
    }

    if (location) {
      where.OR = [
        { venue: { contains: location, mode: 'insensitive' } },
        { address: { contains: location, mode: 'insensitive' } }
      ];
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.startDate = {
        gte: targetDate,
        lt: nextDay
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startDate: 'asc'
        },
        include: {
          ticketTiers: {
            where: {
              isActive: true,
              remaining: {
                gt: 0
              }
            },
            orderBy: {
              price: 'asc'
            }
          }
        }
      }),
      prisma.event.count({ where })
    ]);

    // Transform data for frontend
    const transformedEvents = events.map(event => ({
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
    }));

    return NextResponse.json({
      events: transformedEvents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event (requires authentication)
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
    const { 
      title, 
      description, 
      venue, 
      address, 
      startDate, 
      endDate, 
      category, 
      capacity,
      ticketTiers 
    } = body;

    // Validate required fields
    if (!title || !startDate || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        storeId: session.user.id, // Using user ID as store ID for simplicity
        title,
        description,
        venue,
        address,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        timezone: 'Africa/Lagos',
        status: 'published',
        capacity: capacity || 100,
        category,
        isPublic: true,
        organizerId: session.user.id,
        ticketTiers: ticketTiers ? {
          create: ticketTiers.map((tier: any) => ({
            name: tier.name,
            description: tier.description,
            price: tier.price,
            quantity: tier.quantity,
            remaining: tier.quantity,
            salesStart: tier.salesStart ? new Date(tier.salesStart) : new Date(),
            salesEnd: tier.salesEnd ? new Date(tier.salesEnd) : undefined,
            maxPerOrder: tier.maxPerOrder || 10,
            benefits: tier.benefits || [],
            isActive: true
          }))
        } : undefined
      },
      include: {
        ticketTiers: true
      }
    });

    return NextResponse.json({ 
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        venue: event.venue,
        address: event.address,
        startDate: event.startDate,
        endDate: event.endDate,
        category: event.category,
        capacity: event.capacity,
        ticketTiers: event.ticketTiers.map(tier => ({
          id: tier.id,
          name: tier.name,
          description: tier.description,
          price: parseFloat(tier.price.toString()),
          quantity: tier.quantity,
          remaining: tier.remaining
        }))
      }
    });

  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}