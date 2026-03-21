import { NextResponse } from "next/server";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import type { Prisma } from "@vayva/db";

const applicationSchema = z.object({
  customerId: z.string(),
  requestedAmount: z.number().positive(),
  businessName: z.string().min(1),
  businessType: z.enum(["sole_proprietor", "partnership", "limited_company", "enterprise"]),
  yearsInBusiness: z.number().int().min(0).max(100),
  annualRevenue: z.number().positive(),
  numberOfEmployees: z.number().int().positive(),
  tradeReferences: z.array(z.object({
    company: z.string(),
    contact: z.string(),
    phone: z.string(),
  })).default([]),
  bankReferences: z.array(z.object({
    bank: z.string(),
    accountType: z.string(),
    contact: z.string(),
  })).default([]),
  existingCreditLines: z.number().int().min(0).default(0),
  desiredTerms: z.enum(["net30", "net45", "net60"]).default("net30"),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
  })).default([]),
});

const reviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  approvedAmount: z.number().positive().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  approvedTerms: z.enum(["net30", "net45", "net60"]).optional(),
  reason: z.string().optional(),
  reviewedBy: z.string(),
});

/**
 * GET /api/b2b/credit/applications?storeId=xxx&status=xxx
 * List credit applications
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Fetch credit applications via API
    const queryParams = new URLSearchParams({ storeId });
    if (status) queryParams.append('status', status);

    const result = await apiJson<{
      success: boolean;
      data?: {
        applications: any[];
        stats: {
          total: number;
          pending: number;
          approved: number;
          rejected: number;
          totalRequested: number;
          totalApproved: number;
        };
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/b2b/credit/applications?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch credit applications');
    }

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/b2b/credit/applications",
        operation: "GET_CREDIT_APPLICATIONS",
        storeId: undefined,
      }
    );
    throw error;
  }
}

/**
 * GET /api/b2b/credit/lines?storeId=xxx
 * List active credit lines - DISABLED: CreditLine model does not exist
 * NOTE: This is a placeholder - Next.js doesn't support GET_LINES export
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _getCreditLines(request: Request): Promise<Response> {
  return NextResponse.json(
    { error: "Credit lines feature not yet implemented", lines: [], stats: { total: 0, active: 0, suspended: 0, closed: 0, totalLimit: 0, totalAvailable: 0, totalUsed: 0 } },
    { status: 501 }
  );
}
