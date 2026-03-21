import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
        const { name, discount, startTime, endTime, targetType, targetId } = body;
        if (!name || !discount || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const flashSale = await prisma.flashSale.create({
            data: {
                storeId,
                name,
                discount: Number(discount),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                targetType: targetType || "ALL",
                targetId: targetId || null,
                isActive: true,
            },
        });
        return NextResponse.json({ success: true, data: flashSale });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/marketing/flash-sales", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const sales = await prisma.flashSale.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return NextResponse.json({ success: true, data: sales }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/marketing/flash-sales", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
