import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const AssetQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(["image", "video", "document", "audio", "other"]).optional(),
  status: z.enum(["draft", "approved", "published", "archived"]).optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
});

const AssetCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["image", "video", "document", "audio", "other"]),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  version: z.string().default("1.0"),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = AssetQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        type: searchParams.get("type"),
        status: searchParams.get("status"),
        projectId: searchParams.get("projectId"),
        clientId: searchParams.get("clientId"),
        tags: searchParams.get("tags"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.type && { type: parseResult.type }),
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.projectId && { projectId: parseResult.projectId }),
        ...(parseResult.clientId && { clientId: parseResult.clientId }),
        ...(parseResult.tags && { 
          tags: { has: parseResult.tags } 
        }),
        ...(parseResult.search && {
          OR: [
            { name: { contains: parseResult.search, mode: "insensitive" } },
            { description: { contains: parseResult.search, mode: "insensitive" } },
            { fileName: { contains: parseResult.search, mode: "insensitive" } },
            { tags: { has: parseResult.search } },
          ],
        }),
      };

      const [assets, total] = await Promise.all([
        prisma.creativeAsset.findMany({
          where: whereClause,
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
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 3,
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.creativeAsset.count({ where: whereClause }),
      ]);

      // Calculate asset metrics
      const totalAssets = assets.length;
      const assetsByType = assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalFileSize = assets.reduce((sum, asset) => sum + asset.fileSize, 0);

      const assetsWithMetrics = {
        data: assets,
        summary: {
          totalAssets,
          assetsByType,
          totalFileSize,
          averageFileSize: totalAssets > 0 ? totalFileSize / totalAssets : 0,
        },
        meta: {
          page: parseResult.page,
          limit: parseResult.limit,
          total,
          totalPages: Math.ceil(total / parseResult.limit),
        },
      };

      return NextResponse.json(
        assetsWithMetrics,
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_ASSETS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch assets" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.CREATIVE_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = AssetCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid asset data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify project exists (if provided)
      if (parseResult.data.projectId) {
        const project = await prisma.creativeProject.findFirst({
          where: { id: parseResult.data.projectId, storeId },
        });

        if (!project) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      // Verify client exists (if provided)
      if (parseResult.data.clientId) {
        const client = await prisma.creativeClient.findFirst({
          where: { id: parseResult.data.clientId, storeId },
        });

        if (!client) {
          return NextResponse.json(
            { error: "Client not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      const createdAsset = await prisma.creativeAsset.create({
        data: {
          ...parseResult.data,
          storeId,
          status: "draft",
          tags: JSON.stringify(parseResult.data.tags),
        },
        include: {
          project: {
            select: {
              name: true,
            },
          },
          client: {
            select: {
              companyName: true,
            },
          },
        },
      });

      // Create initial version
      await prisma.creativeAssetVersion.create({
        data: {
          assetId: createdAsset.id,
          version: parseResult.data.version,
          fileName: parseResult.data.fileName,
          fileSize: parseResult.data.fileSize,
          url: parseResult.data.url,
          uploadedById: user.id,
        },
      });

      logger.info("[CREATIVE_ASSET_CREATE]", {
        assetId: createdAsset.id,
        name: createdAsset.name,
        type: createdAsset.type,
        projectId: parseResult.data.projectId,
      });

      return NextResponse.json(
        { data: createdAsset },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_ASSET_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create asset" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);