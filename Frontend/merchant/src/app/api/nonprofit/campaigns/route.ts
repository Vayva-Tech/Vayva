import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';
import type { CampaignStatus } from '@/types/phase4-industry';

// GET /api/nonprofit/campaigns?storeId=xxx&status=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = session.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const featured = searchParams.get('featured') === 'true' ? true : undefined;

    // Fetch campaigns via API instead of direct service call
    const queryParams = new URLSearchParams({ storeId });
    if (status) queryParams.append('status', status);
    if (featured !== undefined) queryParams.append('featured', String(featured));

    const result = await apiJson<{
      success: boolean;
      data?: Array<any>;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/nonprofit/campaigns?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch campaigns');
    }

    return NextResponse.json({ campaigns: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/nonprofit/campaigns",
        operation: "FETCH_CAMPAIGNS",
      }
    );
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

    const storeId = session.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      goal,
      currency,
      startDate,
      endDate,
      bannerImage,
      impactMetrics,
    } = body;

    if (!title || !goal || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create campaign via API instead of direct service call
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/nonprofit/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
      body: JSON.stringify({
        storeId,
        title,
        description,
        goal,
        currency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        bannerImage,
        impactMetrics,
      }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create campaign');
    }

    return NextResponse.json({ campaign: result.data }, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/nonprofit/campaigns",
        operation: "CREATE_CAMPAIGN",
      }
    );
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
