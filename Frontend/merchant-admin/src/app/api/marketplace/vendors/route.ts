import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const vendorSchema = z.object({
  userId: z.string(),
  businessName: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  commissionRate: z.number().min(0).max(100).default(10),
  paymentSchedule: z.enum(["daily", "weekly", "biweekly", "monthly"]).default("weekly"),
  documents: z.object({
    id: z.string().url().optional(),
    businessReg: z.string().url().optional(),
    tax: z.string().url().optional(),
  }).optional(),
  settings: z.object({
    autoAcceptOrders: z.boolean().default(false),
    vacationMode: z.boolean().default(false),
  }).optional(),
});

const vendorUpdateSchema = vendorSchema.partial().omit({ userId: true, slug: true });

const statusUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  onboardingStatus: z.enum(["pending", "in_review", "approved", "rejected"]).optional(),
});

/**
 * GET /api/marketplace/vendors?storeId=xxx&status=xxx
 * List vendors for a store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const isActive = searchParams.get("isActive");
    const isVerified = searchParams.get("isVerified");
    const onboardingStatus = searchParams.get("onboardingStatus");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    
    if (isActive !== null) where.isActive = isActive === "true";
    if (isVerified !== null) where.isVerified = isVerified === "true";
    if (onboardingStatus) where.onboardingStatus = onboardingStatus;

    const vendors = await prisma.vendor?.findMany({
      where,
      orderBy: { joinedAt: "desc" },
    });

    // Calculate stats
    const stats = {
      total: vendors.length,
      active: vendors.filter((v: { isActive: boolean }) => v.isActive).length,
      verified: vendors.filter((v: { isVerified: boolean }) => v.isVerified).length,
      pendingApproval: vendors.filter((v: { onboardingStatus: string }) => v.onboardingStatus === "pending").length,
      inReview: vendors.filter((v: { onboardingStatus: string }) => v.onboardingStatus === "in_review").length,
      totalSales: vendors.reduce((sum: number, v: any) => sum + Number(v.totalSales || 0), 0),
      totalOrders: vendors.reduce((sum: number, v: any) => sum + Number(v.totalOrders || 0), 0),
    };

    return NextResponse.json({ vendors, stats });
  } catch (error: unknown) {
    logger.error("[VENDORS_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/vendors
 * Create a new vendor
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = vendorSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Check if slug is unique within store
    const existing = await prisma.vendor?.findFirst({
      where: { slug: validated.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vendor slug already exists" },
        { status: 409 }
      );
    }

    // Check if user is already a vendor in this store
    const existingUser = await prisma.vendor?.findFirst({
      where: { storeId, userId: validated.userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User is already a vendor in this store" },
        { status: 409 }
      );
    }

    const vendor = await prisma.vendor?.create({
      data: {
        storeId,
        userId: validated.userId,
        businessName: validated.businessName,
        slug: validated.slug,
        description: validated.description,
        logoUrl: validated.logoUrl,
        bannerUrl: validated.bannerUrl,
        commissionRate: validated.commissionRate,
        paymentSchedule: validated.paymentSchedule,
        documents: validated.documents || {},
        settings: validated.settings || { autoAcceptOrders: false, vacationMode: false },
        isActive: false, // Requires approval
        isVerified: false,
        onboardingStatus: "pending",
      },
    });

    logger.info("[VENDORS_POST] Created", {
      vendorId: vendor.id,
      storeId,
      userId: validated.userId,
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[VENDORS_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketplace/vendors?id=xxx
 * Update vendor details
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Vendor ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = vendorUpdateSchema.parse(body);

    const vendor = await prisma.vendor?.update({
      where: { id },
      data: {
        ...validated,
      } as any,
    });

    logger.info("[VENDORS_PATCH] Updated", { vendorId: id });

    return NextResponse.json({ vendor });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[VENDORS_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/vendors/status?id=xxx
 * Update vendor status (admin action)
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Vendor ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = statusUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    if (validated.isVerified !== undefined) updateData.isVerified = validated.isVerified;
    if (validated.onboardingStatus !== undefined) {
      updateData.onboardingStatus = validated.onboardingStatus;
      // Auto-activate if approved
      if (validated.onboardingStatus === "approved") {
        updateData.isActive = true;
      }
    }

    const vendor = await prisma.vendor?.update({
      where: { id },
      data: updateData,
    });

    logger.info("[VENDORS_STATUS] Updated", {
      vendorId: id,
      ...validated,
    });

    return NextResponse.json({ vendor });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[VENDORS_STATUS] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update vendor status" },
      { status: 500 }
    );
  }
}
