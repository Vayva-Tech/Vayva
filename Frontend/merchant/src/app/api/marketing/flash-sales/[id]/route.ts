import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { prisma } from "@vayva/db";
import { handleApiError } from "@/lib/api-error-handler";
import type { Prisma } from "@vayva/db";

function parseFlashSaleUpdate(body: Record<string, unknown>): Prisma.FlashSaleUpdateManyMutationInput {
  const data: Prisma.FlashSaleUpdateManyMutationInput = {};
  if (typeof body.name === "string") data.name = body.name;
  if (body.discount !== undefined) {
    const n = Number(body.discount);
    if (Number.isFinite(n)) data.discount = n;
  }
  if (typeof body.startTime === "string") {
    data.startTime = new Date(body.startTime);
  }
  if (typeof body.endTime === "string") {
    data.endTime = new Date(body.endTime);
  }
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.targetType === "string") data.targetType = body.targetType;
  if (body.targetId === null) {
    data.targetId = null;
  } else if (typeof body.targetId === "string") {
    data.targetId = body.targetId;
  }
  return data;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !id.trim()) {
      return NextResponse.json({ error: "Flash sale id is required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const raw: unknown = await request.json();
    const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

    const existing = await prisma.flashSale.findFirst({
      where: { id, storeId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Flash sale not found" }, { status: 404 });
    }

    const data = parseFlashSaleUpdate(body);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    const updated = await prisma.flashSale.updateMany({
      where: { id, storeId },
      data,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Flash sale not found" }, { status: 404 });
    }

    const refreshed = await prisma.flashSale.findFirst({ where: { id, storeId } });
    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/marketing/flash-sales/:id", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !id.trim()) {
      return NextResponse.json({ error: "Flash sale id is required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(_request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const deleted = await prisma.flashSale.deleteMany({
      where: { id, storeId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Flash sale not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/marketing/flash-sales/:id", operation: "DELETE" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
