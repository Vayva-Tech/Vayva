import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const ALLOWED_TYPES = ["digital", "service", "course", "event", "subscription", "physical"];

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        if (!type || !ALLOWED_TYPES.includes(type)) {
            return NextResponse.json({ error: "Invalid or missing resource type" }, { status: 400 });
        }
        const resources = await prisma.product?.findMany({
            where: {
                storeId,
                productType: type
            },
            include: {
                productImages: {
                    orderBy: { position: 'asc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = resources.map((r: any) => ({
            id: r.id,
            name: r.title, // ResourceListPage expects 'name'
            title: r.title,
            price: Number(r.price),
            image: r.productImages?.[0]?.url || null,
            status: (r as any).status // DRAFT/ACTIVE
        }));
        return NextResponse.json(mapped, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/resources/list", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
