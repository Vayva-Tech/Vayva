import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { nonprofitService } from '@/services/nonprofit.service';

// GET /api/nonprofit/volunteers?storeId=xxx&status=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    const volunteers = await nonprofitService.getVolunteers(
      storeId,
      status as any
    );

    return NextResponse.json({ volunteers });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteers', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/volunteers
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      email,
      firstName,
      lastName,
      phone,
      skills,
      availability,
      emergencyContact,
    } = body;

    if (!storeId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const volunteer = await nonprofitService.createVolunteer({
      storeId,
      email,
      firstName,
      lastName,
      phone,
      skills,
      availability,
      emergencyContact,
    });

    return NextResponse.json({ volunteer }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create volunteer', message: errorMessage },
      { status: 500 }
    );
  }
}
