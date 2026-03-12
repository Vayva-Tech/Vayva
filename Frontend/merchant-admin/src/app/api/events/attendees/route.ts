import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { eventsService } from '@/services/events.service';

// GET /api/events/attendees?eventId=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const attendees = await eventsService.getAttendees(eventId);
    return NextResponse.json({ attendees });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch attendees', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/events/attendees
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      eventId,
      customerId,
      email,
      firstName,
      lastName,
      company,
      jobTitle,
      dietaryRequirements,
      accessibilityNeeds,
      notes,
    } = body;

    if (!eventId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const attendee = await eventsService.addAttendee({
      eventId,
      customerId,
      email,
      firstName,
      lastName,
      company,
      jobTitle,
      dietaryRequirements,
      accessibilityNeeds,
      notes,
    });

    return NextResponse.json({ attendee }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to add attendee', message: errorMessage },
      { status: 500 }
    );
  }
}
