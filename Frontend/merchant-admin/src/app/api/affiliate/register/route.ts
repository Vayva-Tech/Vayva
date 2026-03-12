import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { affiliateService } from "@vayva/affiliate";
import { prisma } from "@vayva/db";
import { z } from "zod";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

// Validation schema for affiliate registration
const registerSchema = z.object({
  storeId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  bankCode: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  customCode: z.string().optional(),
  commissionRate: z.number().optional(),
});

/**
 * POST /api/affiliate/register
 * Register a new affiliate with bank account details
 */
export const POST = withVayvaAPI(PERMISSIONS.BILLING_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Verify bank details if provided
    if (data.bankCode && data.accountNumber) {
      if (!data.accountName || data.accountName.length < 2) {
        return NextResponse.json(
          { success: false, error: "Account name is required when bank details are provided" },
          { status: 400 }
        );
      }
    }

    const affiliate = await affiliateService.registerAffiliate(storeId, {
      email: data.email,
      name: data.name,
      phone: data.phone,
      bankCode: data.bankCode,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      customCode: data.customCode,
      commissionRate: data.commissionRate,
    });

    return NextResponse.json({ success: true, affiliate });
  } catch (error) {
    logger.error("[Affiliate Register] Error:", ErrorCategory.API, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to register affiliate";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
});

// Validation schema for bank details update
const updateBankSchema = z.object({
  affiliateId: z.string().uuid(),
  bankCode: z.string(),
  bankName: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
});

/**
 * PUT /api/affiliate/register
 * Update affiliate bank details
 */
export const PUT = withVayvaAPI(PERMISSIONS.BILLING_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const body = await req.json();
    const data = updateBankSchema.parse(body);

    // Verify affiliate belongs to this store
    const affiliate = await prisma.affiliate.findFirst({
      where: { id: data.affiliateId, storeId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }

    const updatedAffiliate = await affiliateService.updateBankDetails(data.affiliateId, {
      bankCode: data.bankCode,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
    });

    return NextResponse.json({ success: true, affiliate: updatedAffiliate });
  } catch (error) {
    logger.error("[Affiliate Update Bank] Error:", ErrorCategory.API, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    
    const message = error instanceof Error ? error.message : "Failed to update bank details";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
});
