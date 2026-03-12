import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SyncSchema = z.object({
  deviceId: z.string().min(1),
  syncType: z.enum(["inventory", "products", "orders", "full"]),
});

// GET /api/pos/sync - List sync history
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const deviceId = searchParams.get("deviceId");
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      const where: any = { device: { storeId } };

      if (deviceId) where.deviceId = deviceId;
      if (status) where.status = status;

      const [syncs, total] = await Promise.all([
        prisma.posSync.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { startedAt: "desc" },
          include: {
            device: {
              select: {
                deviceName: true,
                provider: true,
              },
            },
          },
        }),
        prisma.posSync.count({ where }),
      ]);

      const syncHistory = syncs.map(sync => ({
        id: sync.id,
        deviceId: sync.deviceId,
        deviceName: sync.device?.deviceName || "Unknown Device",
        provider: sync.device?.provider || "unknown",
        syncType: sync.syncType,
        status: sync.status,
        startedAt: sync.startedAt.toISOString(),
        completedAt: sync.completedAt?.toISOString() || null,
        duration: sync.completedAt 
          ? sync.completedAt.getTime() - sync.startedAt.getTime()
          : null,
        stats: sync.stats,
        createdAt: sync.createdAt.toISOString(),
      }));

      return NextResponse.json(
        {
          syncs: syncHistory,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[POS_SYNC_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load sync history" },
        { status: 500 },
      );
    }
  },
);

// POST /api/pos/sync - Trigger a new sync
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const result = SyncSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { deviceId, syncType } = result.data;

      // Verify device exists and belongs to store
      const device = await prisma.posDevice.findUnique({
        where: { id: deviceId },
        select: { storeId: true, status: true, deviceName: true, provider: true },
      });

      if (!device) {
        return NextResponse.json(
          { error: "POS device not found" },
          { status: 404 },
        );
      }

      if (device.storeId !== storeId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 },
        );
      }

      if (device.status !== "active") {
        return NextResponse.json(
          { error: "Device is not active" },
          { status: 400 },
        );
      }

      // Create sync record
      const sync = await prisma.posSync.create({
        data: {
          deviceId,
          syncType,
          status: "processing",
          stats: {
            productsCreated: 0,
            productsUpdated: 0,
            inventoryUpdated: 0,
            ordersImported: 0,
            errors: [],
          },
        },
      });

      // In a real implementation, this would trigger the actual sync process
      // For now, we'll simulate a successful sync
      setTimeout(async () => {
        try {
          await prisma.posSync.update({
            where: { id: sync.id },
            data: {
              status: "success",
              completedAt: new Date(),
              stats: {
                productsCreated: Math.floor(Math.random() * 10),
                productsUpdated: Math.floor(Math.random() * 50),
                inventoryUpdated: Math.floor(Math.random() * 100),
                ordersImported: Math.floor(Math.random() * 20),
                errors: [],
              },
            },
          });

          await prisma.posDevice.update({
            where: { id: deviceId },
            data: {
              lastSyncAt: new Date(),
              lastSyncStatus: "success",
              status: "active",
            },
          });
        } catch (error) {
          logger.error("[POS_SYNC_BACKGROUND]", error);
        }
      }, 2000); // Simulate 2 second sync process

      return NextResponse.json(
        {
          sync: {
            id: sync.id,
            deviceId,
            deviceName: device.deviceName,
            provider: device.provider,
            syncType,
            status: "processing",
            startedAt: sync.startedAt.toISOString(),
          },
        },
        {
          status: 202, // Accepted - sync is processing
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[POS_SYNC_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to start sync process" },
        { status: 500 },
      );
    }
  },
);