import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

/** Legacy beauty gallery delegate (may be absent in some generated clients). */
type PortfolioDelegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  count: (args: unknown) => Promise<number>;
};

function getPortfolioDelegate(): PortfolioDelegate | null {
  const raw = prisma as unknown as { portfolio?: PortfolioDelegate };
  return raw.portfolio ?? null;
}

// Note: Vayva does not use Cloudinary. Beauty gallery reads from DB only.

/**
 * GET /api/beauty/gallery
 * Get all gallery photos with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = getPortfolioDelegate();
    if (!portfolio) {
      return NextResponse.json({
        success: true,
        data: {
          photos: [],
          pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
        },
      });
    }

    const category = searchParams.get("category");
    const status = searchParams.get("status") || "approved";
    const stylistId = searchParams.get("stylistId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const where: {
      merchantId: string;
      type: string;
      category?: string;
      status?: string;
      metadata?: { path: string[]; equals: string };
    } = {
      merchantId: storeId,
      type: "GALLERY",
    };

    if (category) {
      where.category = category;
    }

    if (stylistId) {
      where.metadata = {
        path: ["stylistId"],
        equals: stylistId,
      };
    }

    if (status) {
      where.status = status;
    }

    const [photos, total] = await Promise.all([
      portfolio.findMany({
        where,
        include: {
          stylist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      portfolio.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        photos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/gallery",
      operation: "GET_GALLERY",
    });
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
