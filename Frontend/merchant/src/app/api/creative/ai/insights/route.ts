import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface ProjectRiskFactor {
  category: 'budget' | 'timeline' | 'resource' | 'client';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: number;
}

interface ProjectRisk {
  id: string;
  projectName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: ProjectRiskFactor[];
  predictedIssues: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * GET /api/creative/ai/insights
 * Analyze projects and predict risks using AI/ML algorithms
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Call backend API instead of direct Prisma queries
    const result = await apiJson<{
      success: boolean;
      data?: {
        risks: ProjectRisk[];
        summary: {
          totalProjects: number;
          highRisk: number;
          mediumRisk: number;
          lowRisk: number;
          averageRiskScore: number;
        };
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/creative/ai/insights?storeId=${storeId}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/creative/ai/insights",
        operation: "GET_AI_INSIGHTS",
      }
    );
    throw error;
  }
}