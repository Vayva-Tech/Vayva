// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/creative/dashboard/analytics
// Returns comprehensive dashboard analytics for Creative Agency
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    // Fetch analytics from backend API instead of direct Prisma queries
    const result = await apiJson<{
      success: boolean;
      data?: {
        activeProjectsCount: number;
        utilizationRate: number;
        revenueMTD: number;
        projectsByStage: Record<string, number>;
        teamWorkload: Array<{ id: string; name: string; role: string; allocationCount: number; utilization: string }>;
        weeklyHoursBilled: number;
        projectMargins: Array<{ projectId: string; projectName: string; budget: number; stage: string; timeEntriesCount: number }>;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/creative/dashboard/analytics`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch analytics');
    }

    return NextResponse.json({
      analytics: result.data,
    });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/creative/dashboard/analytics",
        operation: "FETCH_ANALYTICS",
      }
    );
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch creative dashboard analytics', message: errorMessage },
      { status: 500 }
    );
  }
}
