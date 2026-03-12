import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const DeviceSchema = z.object({
  provider: z.enum(["square", "shopify_pos", "lightspeed", "vend", "toast", "custom"]),
  deviceId: z.string().min(1),
  deviceName: z.string().min(1),
  locationId: z.string().optional(),
  settings: z.object({
    autoSyncInventory: z.boolean().optional(),
    autoSyncProducts: z.boolean().optional(),
    autoSyncOrders: z.boolean().optional(),
    syncInterval: z.number().optional(),
    taxMapping: z.record(z.string()).optional(),
    paymentTypeMapping: z.record(z.string()).optional(),
    categoryMapping: z.record(z.string()).optional(),
  }).optional(),
  apiCredentials: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
  }).optional(),
  webhookUrl: z.string().url().optional().nullable(),
});

// GET /api/pos/devices - List POS devices
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const provider = searchParams.get("provider");

      const where: any = { storeId };

      if (status) where.status = status;
      if (provider) where.provider = provider;

      const devices = await prisma.posDevice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { syncs: true },
          },
        },
      });

      const devicesWithStats = await Promise.all(
        devices.map(async (device) => {
          const lastSync = await prisma.posSync.findFirst({
            where: { deviceId: device.id },
            orderBy: { startedAt: "desc" },
          });

          return {
            id: device.id,
            provider: device.provider,
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            locationId: device.locationId,
            status: device.status,
            lastSyncAt: device.lastSyncAt?.toISOString() || null,
            lastSyncStatus: device.lastSyncStatus,
            settings: device.settings,
            webhookUrl: device.webhookUrl,
            syncCount: device._count.syncs,
            lastSyncResult: lastSync ? {
              status: lastSync.status,
              syncType: lastSync.syncType,
              startedAt: lastSync.startedAt.toISOString(),
              completedAt: lastSync.completedAt?.toISOString() || null,
            } : null,
            createdAt: device.createdAt.toISOString(),
            updatedAt: device.updatedAt.toISOString(),
          };
        }),
      );

      return NextResponse.json(
        { devices: devicesWithStats },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[POS_DEVICES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load POS devices" },
        { status: 500 },
      );
    }
  },
);

// POST /api/pos/devices - Create new POS device
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const result = DeviceSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { provider, deviceId, deviceName, locationId, settings, apiCredentials, webhookUrl } = result.data;

      // Check if device already exists
      const existingDevice = await prisma.posDevice.findFirst({
        where: {
          storeId,
          deviceId,
        },
      });

      if (existingDevice) {
        return NextResponse.json(
          { error: "Device with this ID already exists" },
          { status: 409 },
        );
      }

      // Validate location if provided
      if (locationId) {
        const location = await prisma.inventoryLocation.findUnique({
          where: { id: locationId },
          select: { storeId: true },
        });
        if (!location || location.storeId !== storeId) {
          return NextResponse.json(
            { error: "Location not found or access denied" },
            { status: 404 },
          );
        }
      }

      const device = await prisma.posDevice.create({
        data: {
          storeId,
          provider,
          deviceId,
          deviceName,
          locationId,
          settings: settings || {
            autoSyncInventory: true,
            autoSyncProducts: true,
            autoSyncOrders: true,
            syncInterval: 15,
            taxMapping: {},
            paymentTypeMapping: {},
            categoryMapping: {},
          },
          apiCredentials: apiCredentials || {},
          webhookUrl,
        },
      });

      return NextResponse.json(
        { device },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[POS_DEVICES_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create POS device" },
        { status: 500 },
      );
    }
  },
);