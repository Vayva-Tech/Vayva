import { logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";
import { z } from "zod";

const AffiliateCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100).default(10),
  minimumPayout: z.number().min(0).default(5000),
});

/**
 * GET /api/affiliates
 * List affiliates for the current store (merchant view)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const affiliates = await prisma.affiliate.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      affiliates: affiliates.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.name,
        phone: a.phone ?? undefined,
        referralCode: a.referralCode,
        customReferralLink: a.customReferralLink ?? undefined,
        commissionRate: Number(a.commissionRate),
        totalEarnings: Number(a.totalEarnings),
        pendingEarnings: Number(a.pendingEarnings),
        paidEarnings: Number(a.paidEarnings),
        totalReferrals: a.totalReferrals,
        totalConversions: a.totalConversions,
        status: String(a.status),
        bankName: a.bankName ?? undefined,
        accountNumber: a.accountNumber ?? undefined,
        minimumPayout: Number(a.minimumPayout),
        kycStatus: String(a.kycStatus),
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/affiliates",
      operation: "LIST_AFFILIATES",
    });
    return NextResponse.json({ error: "Failed to load affiliates" }, { status: 500 });
  }
}

/**
 * POST /api/affiliates
 * Create new affiliate partner
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const validation = AffiliateCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { email, name, phone, commissionRate, minimumPayout } =
      validation.data;

    const referralCode = `AFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const affiliate = await prisma.affiliate.create({
      data: {
        storeId,
        email,
        name,
        phone: phone || null,
        referralCode,
        commissionRate,
        minimumPayout,
        status: "PENDING",
        kycStatus: "PENDING",
      },
    });

    logger.info("[AFFILIATE_CREATED]", {
      affiliateId: affiliate.id,
      email,
      storeId,
    });

    return NextResponse.json({
      success: true,
      affiliate,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/affiliates",
      operation: "CREATE_AFFILIATE",
    });
    return NextResponse.json(
      { error: "Failed to create affiliate" },
      { status: 500 },
    );
  }
}
