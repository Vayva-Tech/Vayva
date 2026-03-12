import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { storeId, user, params }) => {
    try {
      const { id: customerId } = await params;
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const content = getString(body.content);

      if (!content || typeof content !== "string") {
        return NextResponse.json(
          { error: "content is required" },
          { status: 400 },
        );
      }

      const customer = await prisma.customer.findFirst({
        where: { id: customerId, storeId },
        select: { id: true },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 },
        );
      }

      const note = await prisma.customerNote.create({
        data: {
          storeId,
          customerId,
          content: content.trim(),
          authorUserId: user.id,
        },
      });

      return NextResponse.json({ success: true, data: note }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[CUSTOMER_NOTE_CREATE]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
