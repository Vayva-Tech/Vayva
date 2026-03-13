import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CashMovementSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(["sale", "refund", "paid_in", "paid_out", "opening", "closing"]),
  amount: z.number(),
  note: z.string().optional(),
  reference: z.string().optional(),
});

// GET /api/pos/cash/movements - List cash movements
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const sessionId = searchParams.get("sessionId");
      const type = searchParams.get("type");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");

      const where: any = { storeId };

      if (sessionId) where.sessionId = sessionId;
      if (type) where.type = type;

      const [movements, total] = await Promise.all([
        prisma.cashMovement.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            session: {
              select: {
                status: true,
                openedAt: true,
              },
            },
          },
        }),
        prisma.cashMovement.count({ where }),
      ]);

      const movementList = movements.map(movement => ({
        id: movement.id,
        sessionId: movement.sessionId,
        sessionStatus: movement.session?.status || "unknown",
        type: movement.type,
        amount: movement.amount,
        note: movement.note,
        reference: movement.reference,
        createdBy: movement.createdBy,
        createdAt: movement.createdAt.toISOString(),
      }));

      return NextResponse.json(
        {
          movements: movementList,
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
      logger.error("[POS_CASH_MOVEMENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load cash movements" },
        { status: 500 },
      );
    }
  },
);

// POST /api/pos/cash/movements - Add cash movement
export const POST = withVayvaAPI(
  PERMISSIONS.FINANCE_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body = await req.json();
      const result = CashMovementSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { sessionId, type, amount, note, reference } = result.data;

      // Verify session exists and belongs to store
      const session = await prisma.cashSession.findUnique({
        where: { id: sessionId },
        select: { 
          storeId: true, 
          status: true,
          totalCashSales: true,
          totalCashRefunds: true,
          totalPaidIn: true,
          totalPaidOut: true,
          expectedFloat: true,
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Cash session not found" },
          { status: 404 },
        );
      }

      if (session.storeId !== storeId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 },
        );
      }

      if (session.status !== "open") {
        return NextResponse.json(
          { error: "Cash session is not open" },
          { status: 400 },
        );
      }

      // Create movement
      const movement = await prisma.cashMovement.create({
        data: {
          sessionId,
          storeId,
          type,
          amount,
          note,
          reference,
          createdBy: user?.id,
        },
      });

      // Update session totals
      const updateData: any = {};
      
      switch (type) {
        case "sale":
          updateData.totalCashSales = { increment: amount };
          updateData.expectedFloat = { increment: amount };
          break;
        case "refund":
          updateData.totalCashRefunds = { increment: amount };
          updateData.expectedFloat = { decrement: amount };
          break;
        case "paid_in":
          updateData.totalPaidIn = { increment: amount };
          updateData.expectedFloat = { increment: amount };
          break;
        case "paid_out":
          updateData.totalPaidOut = { increment: amount };
          updateData.expectedFloat = { decrement: amount };
          break;
      }

      await prisma.cashSession.update({
        where: { id: sessionId },
        data: updateData,
      });

      return NextResponse.json(
        { movement },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[POS_CASH_MOVEMENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to add cash movement" },
        { status: 500 },
      );
    }
  },
);