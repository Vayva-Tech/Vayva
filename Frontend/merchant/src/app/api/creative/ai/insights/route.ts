import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";

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
    const auth = await buildBackendAuthHeaders(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

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
    }>(`${process.env.BACKEND_API_URL}/api/creative/ai/insights?storeId=${encodeURIComponent(storeId)}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/creative/ai/insights",
        operation: "GET_AI_INSIGHTS",
      }
    );
    throw error;
  }
}