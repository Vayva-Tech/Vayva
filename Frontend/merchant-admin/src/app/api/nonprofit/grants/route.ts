import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { nonprofitService } from '@/services/nonprofit.service';

// GET /api/nonprofit/grants?storeId=xxx&status=xxx
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

    const grants = await nonprofitService.getGrants(storeId, status as any);
    return NextResponse.json({ grants });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch grants', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/grants
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      name,
      funder,
      amount,
      currency,
      startDate,
      endDate,
      requirements,
      restrictions,
      reportingSchedule,
    } = body;

    if (!storeId || !name || !funder || !amount || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const grant = await nonprofitService.createGrant({
      storeId,
      name,
      funder,
      amount,
      currency,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      requirements,
      restrictions,
      reportingSchedule,
    });

    return NextResponse.json({ grant }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create grant', message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/nonprofit/grants?id=xxx - approve grant
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

    const grant = await nonprofitService.approveGrant(id);
    return NextResponse.json({ grant });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to approve grant', message: errorMessage },
      { status: 500 }
    );
  }
}
