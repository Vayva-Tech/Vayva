// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
        const body = await request.json();
        // Validate ownership
        const existing = await prisma.flashSale.findFirst({
            where: { id, storeId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Flash sale not found" }, { status: 404 });
        }
        const updated = await prisma.flashSale.updateMany({
            where: { id, storeId },
            data: {
                name: body.name !== undefined ? body.name : undefined,
                discount: body.discount !== undefined ? Number(body.discount) : undefined,
                startTime: body.startTime ? new Date(body.startTime) : undefined,
                endTime: body.endTime ? new Date(body.endTime) : undefined,
                isActive: body.isActive !== undefined ? body.isActive : undefined,
                targetType: body.targetType !== undefined ? body.targetType : undefined,
                targetId: body.targetId !== undefined ? body.targetId : undefined,
            },
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
        // Validate ownership
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
