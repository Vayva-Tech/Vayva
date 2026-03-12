import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CashSessionSchema = z.object({
  deviceId: z.string().min(1),
  openingFloat: z.number().min(0),
  notes: z.string().optional(),
});

// GET /api/pos/cash/sessions - List cash sessions
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const deviceId = searchParams.get("deviceId");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      const where: any = { storeId };

      if (status) where.status = status;
      if (deviceId) where.deviceId = deviceId;

      const [sessions, total] = await Promise.all([
        prisma.cashSession.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { openedAt: "desc" },
          include: {
            _count: {
              select: { movements: true },
            },
            device: {
              select: {
                deviceName: true,
              },
            },
          },
        }),
        prisma.cashSession.count({ where }),
      ]);

      const sessionsWithDetails = sessions.map(session => ({
        id: session.id,
        deviceId: session.deviceId,
        deviceName: session.device?.deviceName || "Unknown Device",
        cashierId: session.cashierId,
        status: session.status,
        openingFloat: session.openingFloat,
        closingFloat: session.closingFloat,
        expectedFloat: session.expectedFloat,
        variance: session.variance,
        totalCashSales: session.totalCashSales,
        totalCashRefunds: session.totalCashRefunds,
        totalPaidIn: session.totalPaidIn,
        totalPaidOut: session.totalPaidOut,
        movementCount: session._count.movements,
        openedAt: session.openedAt.toISOString(),
        closedAt: session.closedAt?.toISOString() || null,
        reconciledAt: session.reconciledAt?.toISOString() || null,
        notes: session.notes,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      }));

      return NextResponse.json(
        {
          sessions: sessionsWithDetails,
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
      logger.error("[POS_CASH_SESSIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load cash sessions" },
        { status: 500 },
      );
    }
  },
);

// POST /api/pos/cash/sessions - Open new cash session
export const POST = withVayvaAPI(
  PERMISSIONS.FINANCE_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body = await req.json();
      const result = CashSessionSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { deviceId, openingFloat, notes } = result.data;

      // Verify device exists and belongs to store
      const device = await prisma.posDevice.findUnique({
        where: { id: deviceId },
        select: { storeId: true },
      });

      if (!device || device.storeId !== storeId) {
        return NextResponse.json(
          { error: "POS device not found or access denied" },
          { status: 404 },
        );
      }

      // Check if there's already an open session for this device
      const existingOpenSession = await prisma.cashSession.findFirst({
        where: {
          deviceId,
          status: "open",
        },
      });

      if (existingOpenSession) {
        return NextResponse.json(
          { error: "There is already an open cash session for this device" },
          { status: 409 },
        );
      }

      const session = await prisma.cashSession.create({
        data: {
          storeId,
          deviceId,
          cashierId: user?.id,
          openingFloat,
          expectedFloat: openingFloat,
          notes,
        },
      });

      // Create opening movement record
      await prisma.cashMovement.create({
        data: {
          sessionId: session.id,
          storeId,
          type: "opening",
          amount: openingFloat,
          note: "Opening float",
          createdBy: user?.id,
        },
      });

      return NextResponse.json(
        {
          session: {
            id: session.id,
            deviceId: session.deviceId,
            status: session.status,
            openingFloat: session.openingFloat,
            expectedFloat: session.expectedFloat,
            openedAt: session.openedAt.toISOString(),
            notes: session.notes,
          },
        },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[POS_CASH_SESSIONS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to open cash session" },
        { status: 500 },
      );
    }
  },
);