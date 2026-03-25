import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@vayva/db";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

const UpdateSchema = z.object({
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "REJECTED", "INACTIVE"]).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  minimumPayout: z.number().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { id } = await params;

    const body: unknown = await request.json().catch(() => ({}));
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const updated = await prisma.affiliate.updateMany({
      where: { id, storeId },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(typeof parsed.data.commissionRate === "number"
          ? { commissionRate: parsed.data.commissionRate }
          : {}),
        ...(typeof parsed.data.minimumPayout === "number"
          ? { minimumPayout: parsed.data.minimumPayout }
          : {}),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/affiliates/:id",
      operation: "UPDATE_AFFILIATE",
    });
    return NextResponse.json({ error: "Failed to update affiliate" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { id } = await params;

    // "Remove" = deactivate (keeps history).
    const updated = await prisma.affiliate.updateMany({
      where: { id, storeId },
      data: { status: "INACTIVE" },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/affiliates/:id",
      operation: "REMOVE_AFFILIATE",
    });
    return NextResponse.json({ error: "Failed to remove affiliate" }, { status: 500 });
  }
}

