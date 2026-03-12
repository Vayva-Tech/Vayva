import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { nonprofitService } from '@/services/nonprofit.service';

// GET /api/nonprofit/donations?storeId=xxx&campaignId=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const campaignId = searchParams.get('campaignId');
    const donorId = searchParams.get('donorId');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    const donations = await nonprofitService.getDonations(storeId, {
      ...(campaignId && { campaignId }),
      ...(donorId && { donorId }),
      ...(status && { status: status as any }),
    });

    return NextResponse.json({ donations });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch donations', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/donations
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      campaignId,
      storeId,
      donorId,
      donorEmail,
      donorName,
      amount,
      currency,
      isAnonymous,
      message,
      recurring,
      frequency,
      paymentMethod,
    } = body;

    if (!storeId || !donorEmail || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const donation = await nonprofitService.createDonation({
      campaignId,
      storeId,
      donorId,
      donorEmail,
      donorName,
      amount,
      currency,
      isAnonymous,
      message,
      recurring,
      frequency,
      paymentMethod,
    });

    return NextResponse.json({ donation }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create donation', message: errorMessage },
      { status: 500 }
    );
  }
}
