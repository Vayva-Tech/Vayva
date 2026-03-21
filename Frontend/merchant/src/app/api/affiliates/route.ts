// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { z } from "zod";

const AffiliateCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100).default(10),
  minimumPayout: z.number().min(0).default(5000),
});

/**
 * POST /api/affiliates
 * Create new affiliate partner
 */
export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
    const validation = AffiliateCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, name, phone, commissionRate, minimumPayout } = validation.data;

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
      storeId 
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
      { status: 500 }
    );
  }
}
