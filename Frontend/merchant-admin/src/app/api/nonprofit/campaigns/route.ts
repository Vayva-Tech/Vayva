import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { nonprofitService } from '@/services/nonprofit.service';
import { logger } from '@/lib/logger';
import type { CampaignStatus } from '@/types/phase4-industry';

// GET /api/nonprofit/campaigns?storeId=xxx&status=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured') === 'true' ? true : undefined;

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    const campaigns = await nonprofitService.getCampaigns(storeId, {
      ...(status && { status: status as CampaignStatus }),
      ...(featured !== undefined && { featured }),
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    logger.error('[CAMPAIGNS_GET]', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/campaigns
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      title,
      description,
      goal,
      currency,
      startDate,
      endDate,
      bannerImage,
      impactMetrics,
    } = body;

    if (!storeId || !title || !goal || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const campaign = await nonprofitService.createCampaign({
      storeId,
      title,
      description,
      goal,
      currency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      bannerImage,
      impactMetrics,
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    logger.error('[CAMPAIGNS_POST]', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
