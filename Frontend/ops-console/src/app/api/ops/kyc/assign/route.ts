import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/kyc/assign
 * Assign KYC records to reviewers via backend Fastify API
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    
    // Check permissions
    if (!["OPS_OWNER", "SUPERVISOR", "OPERATOR", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions - OPERATOR required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { kycIds, reviewerId } = body;

    if (!kycIds || !Array.isArray(kycIds) || kycIds.length === 0) {
      return NextResponse.json(
        { error: "kycIds array is required" },
        { status: 400 }
      );
    }

    if (!reviewerId) {
      return NextResponse.json(
        { error: "reviewerId is required" },
        { status: 400 }
      );
    }

    // Proxy to backend Fastify API
    const response = await apiClient.post('/api/v1/compliance/kyc/ops/assign', {
      kycIds,
      reviewerId
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[KYC_ASSIGN_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ops/kyc/reviewers
 * Get list of eligible KYC reviewers via backend Fastify API
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    
    // Check permissions
    if (!["OPS_OWNER", "SUPERVISOR", "OPERATOR", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions - OPERATOR required" },
        { status: 403 }
      );
    }

    // Proxy to backend Fastify API
    const response = await apiClient.get('/api/v1/compliance/kyc/ops/reviewers');
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error("[KYC_REVIEWERS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
