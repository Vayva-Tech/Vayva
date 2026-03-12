import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogMediaApiService } from '@vayva/industry-blog-media';
import { authenticateRequest } from '@/middleware/auth';

const blogService = new BlogMediaApiService(prisma);

// GET /api/blog/dashboard - Get aggregated dashboard data
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') as any) || 'month';

    const [metrics, calendarOverview, topContent] = await Promise.all([
      blogService.getDashboardMetrics(auth.storeId, range),
      blogService.getCalendarOverview(auth.storeId),
      blogService.getTopPerformingContent(auth.storeId, 10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        calendarOverview,
        topContent,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
