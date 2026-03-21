// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';

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
      headers: { 'x-store-id': storeId },
    });

    return NextResponse.json({
      success: true,
      count: result.data?.risks?.length ?? 0,
      data: result.data,
    });
  } catch (error) {
    console.error('AI Insights API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze projects' },
      { status: 500 }
    );
  }
}
