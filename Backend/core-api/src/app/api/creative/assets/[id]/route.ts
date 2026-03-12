import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const asset = await prisma.creativeAsset.findFirst({
      where: { id, storeId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        versions: {
          select: {
            id: true,
            version: true,
            fileName: true,
            fileSize: true,
            url: true,
            createdAt: true,
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    const assetWithDetails = {
      ...asset,
      latestVersion: asset.versions[0],
      versionHistory: asset.versions,
      totalVersions: asset.versions.length,
    };

    return NextResponse.json(
      { data: assetWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[CREATIVE_ASSET_GET]", { error, assetId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}