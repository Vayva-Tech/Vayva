import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === null) return undefined;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") return value;

  if (Array.isArray(value)) {
    const coerced = value
      .map((v) => toInputJsonValue(v))
      .filter((v): v is Prisma.InputJsonValue => v !== undefined);
    return coerced as Prisma.InputJsonValue;
  }

  if (isRecord(value)) {
    const obj: Record<string, Prisma.InputJsonValue> = {};
    for (const [k, v] of Object.entries(value)) {
      const coerced = toInputJsonValue(v);
      if (coerced !== undefined) obj[k] = coerced;
    }
    return obj as Prisma.InputJsonObject;
  }

  return undefined;
}

const updateTicketSchema = z
  .object({
    status: z.enum(["OPEN", "RESOLVED", "PENDING", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((val) => Object.keys(val).length > 0, {
    message: "No updates provided",
  });

export const PATCH = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const parsed = updateTicketSchema.safeParse(parsedBody);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      const { status, priority, metadata } = parsed.data;

      const updateData: Prisma.SupportTicketUpdateInput = {};

      if (typeof status === "string") {
        const normalized = status.toLowerCase();
        const allowed = ["open", "resolved", "pending", "closed"];
        if (!allowed.includes(normalized)) {
          return NextResponse.json(
            { error: "Invalid status" },
            { status: 400 },
          );
        }
        updateData.status = normalized as "open" | "in_progress" | "waiting" | "resolved" | "closed";
      }

      if (typeof priority === "string") {
        const normalized = priority.toLowerCase();
        const allowed = ["low", "medium", "high", "urgent"];
        if (!allowed.includes(normalized)) {
          return NextResponse.json(
            { error: "Invalid priority" },
            { status: 400 },
          );
        }
        updateData.priority = normalized as "low" | "medium" | "high" | "urgent";
      }

      if (metadata !== undefined) {
        if (
          metadata === null ||
          typeof metadata !== "object" ||
          Array.isArray(metadata)
        ) {
          return NextResponse.json(
            { error: "Invalid metadata" },
            { status: 400 },
          );
        }
        const coerced = toInputJsonValue(metadata);
        if (coerced === undefined) {
          return NextResponse.json(
            { error: "Invalid metadata" },
            { status: 400 },
          );
        }
        updateData.metadata = coerced;
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: "No updates provided" },
          { status: 400 },
        );
      }

      const existing = await prisma.supportTicket.findFirst({
        where: {
          id,
          storeId,
        },
      });

      if (!existing) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }

      if (updateData.metadata) {
        const current = isRecord(existing.metadata) ? existing.metadata : {};
        const next = isRecord(updateData.metadata) ? updateData.metadata : {};
        const merged = toInputJsonValue({ ...current, ...next });
        updateData.metadata = merged ?? {};
      }

      const updated = await prisma.supportTicket.update({
        where: { id, storeId },
        data: {
          ...updateData,
          lastMessageAt: new Date(),
        },
      });

      return NextResponse.json(updated);
    } catch (error: unknown) {
      logger.error("[SUPPORT_TICKET_PATCH]", error, { storeId, ticketId: id });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
