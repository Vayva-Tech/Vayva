import { logger, ErrorCategory } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

const vendorSchema = z.object({
  userId: z.string(),
  businessName: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  commissionRate: z.number().min(0).max(100).default(10),
  paymentSchedule: z.enum(["daily", "weekly", "biweekly", "monthly"]).default("weekly"),
  documents: z
    .object({
      id: z.string().url().optional(),
      businessReg: z.string().url().optional(),
      tax: z.string().url().optional(),
    })
    .optional(),
  settings: z
    .object({
      autoAcceptOrders: z.boolean().default(false),
      vacationMode: z.boolean().default(false),
    })
    .optional(),
});

const vendorUpdateSchema = vendorSchema.partial().omit({ userId: true, slug: true });

const statusUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  onboardingStatus: z.enum(["pending", "in_review", "approved", "rejected"]).optional(),
});

function vendorUpdateToPrisma(
  v: z.infer<typeof vendorUpdateSchema>
): Prisma.VendorUpdateInput {
  const data: Prisma.VendorUpdateInput = {};
  if (v.businessName !== undefined) data.businessName = v.businessName;
  if (v.description !== undefined) data.description = v.description;
  if (v.logoUrl !== undefined) data.logoUrl = v.logoUrl;
  if (v.bannerUrl !== undefined) data.bannerUrl = v.bannerUrl;
  if (v.commissionRate !== undefined) data.commissionRate = v.commissionRate;
  if (v.paymentSchedule !== undefined) data.paymentSchedule = v.paymentSchedule;
  if (v.documents !== undefined) {
    data.documents = v.documents as Prisma.InputJsonValue;
  }
  if (v.settings !== undefined) {
    data.settings = v.settings as Prisma.InputJsonValue;
  }
  return data;
}

/**
 * GET /api/marketplace/vendors — store from session only
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const isVerified = searchParams.get("isVerified");
    const onboardingStatus = searchParams.get("onboardingStatus");

    const queryParams = new URLSearchParams({ storeId });
    if (isActive !== null) queryParams.append("isActive", String(isActive === "true"));
    if (isVerified !== null) queryParams.append("isVerified", String(isVerified === "true"));
    if (onboardingStatus) queryParams.append("onboardingStatus", onboardingStatus);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${backendBase()}/api/marketplace/vendors?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch vendors");
    }

    const vendors = Array.isArray(result.data) ? result.data : [];

    return NextResponse.json({
      vendors,
      stats: { total: vendors.length },
    });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/marketplace/vendors",
      operation: "FETCH_VENDORS",
    });
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

/**
 * POST /api/marketplace/vendors
 * Create a new vendor
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const validated = vendorSchema.parse(body);

    const existing = await prisma.vendor.findFirst({
      where: { slug: validated.slug },
    });

    if (existing) {
      return NextResponse.json({ error: "Vendor slug already exists" }, { status: 409 });
    }

    const existingUser = await prisma.vendor.findFirst({
      where: { storeId, userId: validated.userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User is already a vendor in this store" },
        { status: 409 }
      );
    }

    const vendor = await prisma.vendor.create({
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
        isActive: false,
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
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    logger.error("[VENDORS_POST] Failed", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}

/**
 * PATCH /api/marketplace/vendors?id=xxx
 * Update vendor details
 */
export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vendor ID required" }, { status: 400 });
    }

    const owned = await prisma.vendor.findFirst({
      where: { id, storeId },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const validated = vendorUpdateSchema.parse(body);

    const vendor = await prisma.vendor.update({
      where: { id },
      data: vendorUpdateToPrisma(validated),
    });

    logger.info("[VENDORS_PATCH] Updated", { vendorId: id });

    return NextResponse.json({ vendor });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    logger.error("[VENDORS_PATCH] Failed", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

/**
 * PUT /api/marketplace/vendors/status?id=xxx
 * Update vendor status (admin action)
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vendor ID required" }, { status: 400 });
    }

    const owned = await prisma.vendor.findFirst({
      where: { id, storeId },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const validated = statusUpdateSchema.parse(body);

    const updateData: Prisma.VendorUpdateInput = {};

    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    if (validated.isVerified !== undefined) updateData.isVerified = validated.isVerified;
    if (validated.onboardingStatus !== undefined) {
      updateData.onboardingStatus = validated.onboardingStatus;
      if (validated.onboardingStatus === "approved") {
        updateData.isActive = true;
      }
    }

    const vendor = await prisma.vendor.update({
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
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    logger.error("[VENDORS_STATUS] Failed", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to update vendor status" }, { status: 500 });
  }
}
