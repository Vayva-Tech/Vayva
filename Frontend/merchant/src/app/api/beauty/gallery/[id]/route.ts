import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

type PortfolioFindUnique = (args: unknown) => Promise<unknown | null>;

function getPortfolioFindUnique(): PortfolioFindUnique | null {
  const raw = prisma as unknown as { portfolio?: { findUnique: PortfolioFindUnique } };
  return raw.portfolio?.findUnique ?? null;
}

// Note: Vayva does not use Cloudinary. Beauty gallery reads from DB only.

/**
 * GET /api/beauty/gallery/[id]
 * Get specific photo details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const findUnique = getPortfolioFindUnique();
    if (!findUnique) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const photo = await findUnique({
      where: {
        id,
        merchantId: storeId,
        type: "GALLERY",
      },
      include: {
        stylist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/gallery/[id]",
      operation: "GET_GALLERY_PHOTO",
    });
    return NextResponse.json({ error: "Failed to fetch gallery photo" }, { status: 500 });
  }
}
