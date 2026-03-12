import { NextRequest, NextResponse } from 'next/server';
import { runScheduledReports } from '@/jobs/scheduled-reports';

/**
 * POST /api/reports/schedule/run
 * Trigger scheduled report job (called by Vercel Cron)
 */
export async function POST(req: NextRequest) {
  // Verify authorization (Vercel cron secret or admin token)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await runScheduledReports();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Sent ${result.count} reports`,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error running scheduled reports:', error);
    return NextResponse.json(
      { error: 'Failed to run scheduled reports' },
      { status: 500 }
    );
  }
}
