import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPS_SUPPORT");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const store = await prisma.store.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Build where clause
    const where: Record<string, unknown> = {
      storeId: id,
    };

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          price: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      store,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[MERCHANT_PRODUCTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
