import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
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

    const where: Record<string, unknown> = { storeId };
    if (status) (where as any).status = status;

    const applications = await prisma.creditApplication?.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: applications.length,
      pending: applications.filter((a: { status: string }) => (a as any).status === "pending").length,
      approved: applications.filter((a: { status: string }) => (a as any).status === "approved").length,
      rejected: applications.filter((a: { status: string }) => (a as any).status === "rejected").length,
      totalRequested: applications.reduce((sum: number, a: { requestedLimit: unknown }) => sum + Number(a.requestedLimit), 0),
      totalApproved: applications
        .filter((a: { status: string }) => (a as any).status === "approved")
        .reduce((sum: number, a: { approvedLimit: unknown }) => sum + (Number(a.approvedLimit) || 0), 0),
    };

    return NextResponse.json({ applications, stats });
  } catch (error: unknown) {
    logger.error("[CREDIT_APPLICATIONS_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/b2b/credit/applications
 * Submit credit application
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = applicationSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Check for existing active application
    const existing = await prisma.creditApplication?.findFirst({
      where: {
        customerId: validated.customerId,
        storeId,
        status: { in: ["pending", "approved"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Active credit application or line already exists" },
        { status: 409 }
      );
    }

    const application = await prisma.creditApplication?.create({
      data: {
        storeId,
        customerId: validated.customerId,
        businessName: validated.businessName,
        businessType: validated.businessType,
        yearsInBusiness: validated.yearsInBusiness,
        annualRevenue: validated.annualRevenue,
        tradeReferences: validated.tradeReferences as unknown as Prisma.InputJsonValue,
        bankReferences: validated.bankReferences as unknown as Prisma.InputJsonValue,
        requestedLimit: validated.requestedAmount,
        status: "pending",
        documents: validated.documents as unknown as Prisma.InputJsonValue,
      },
    });

    logger.info("[CREDIT_APPLICATION_POST] Created", {
      applicationId: application.id,
      storeId,
      customerId: validated.customerId,
      requestedAmount: validated.requestedAmount,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[CREDIT_APPLICATION_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/b2b/credit/applications?id=xxx
 * Review and approve/reject application
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const application = await prisma.creditApplication?.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if ((application as any).status !== "pending") {
      return NextResponse.json(
        { error: "Application already reviewed" },
        { status: 409 }
      );
    }

    // Update application
    const updated = await prisma.creditApplication?.update({
      where: { id },
      data: {
        status: validated.decision,
        approvedLimit: validated.approvedAmount,
        reviewedBy: validated.reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Credit line creation disabled - CreditLine model does not exist in schema
    // Future: CreditLine model to be added to Prisma schema for credit tracking
    if (validated.decision === "approved") {
      logger.info("[CREDIT_APPLICATION_REVIEW] Approved but credit line not created - model unavailable", {
        applicationId: id,
        approvedAmount: validated.approvedAmount,
      });
    }

    logger.info("[CREDIT_APPLICATION_REVIEW] Reviewed", {
      applicationId: id,
      decision: validated.decision,
      approvedAmount: validated.approvedAmount,
      reviewedBy: validated.reviewedBy,
    });

    return NextResponse.json({ application: updated });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[CREDIT_APPLICATION_REVIEW] Failed", { error });
    return NextResponse.json(
      { error: "Failed to review application" },
      { status: 500 }
    );
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
