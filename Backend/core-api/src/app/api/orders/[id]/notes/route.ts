import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user, params }) => {
    const { id: orderId } = await params;
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body: Record<string, unknown> = isRecord(parsedBody)
        ? parsedBody
        : {};
      const note = getString(body.note);

      if (!note || typeof note !== "string") {
        return NextResponse.json(
          { error: "Note cannot be empty" },
          { status: 400 },
        );
      }

      const order = await prisma.order.findFirst({
        where: { id: orderId, storeId },
        select: { internalNote: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const timestamp = new Date().toISOString();
      const entry = `[${timestamp}] (${user.email}): ${note.trim()}`;
      const updatedNote = order.internalNote
        ? `${order.internalNote}\n${entry}`
        : entry;

      await prisma.order.updateMany({
        where: { id: orderId, storeId },
        data: { internalNote: updatedNote },
      });

      return NextResponse.json({
        success: true,
        data: {
          orderId,
          message: "Note added successfully",
          createdAt: timestamp,
        },
      });
    } catch (error: unknown) {
      logger.error("[ORDER_NOTE_CREATE]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: "Failed to add note" },
        { status: 500 },
      );
    }
  },
);
