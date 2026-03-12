import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { checkFeatureAccess } from "@/lib/billing/access";
import { z } from "zod";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const profile = await prisma.merchantAiProfile.findUnique({
        where: { storeId },
      });
      return NextResponse.json(
        { success: true, data: profile },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[SELLER_AI_PROFILE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch AI profile" },
        { status: 500 },
      );
    }
  },
);

export const PUT = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const access = await checkFeatureAccess(storeId, "ai_profile_edit");
      if (!access.allowed) {
        return NextResponse.json(
          {
            error: "forbidden",
            reason: access.reason,
            message: access.message,
          },
          { status: 403 },
        );
      }

      // Input Validation (Zod)
      const profileSchema = z.object({
        agentName: z.string().max(50).optional(),
        tonePreset: z
          .enum(["Friendly", "Professional", "Luxury", "Playful", "Minimal"])
          .optional(),
        greetingTemplate: z.string().max(500).optional(),
        signoffTemplate: z.string().max(200).optional(),
        persuasionLevel: z.number().min(0).max(3).optional(),
        brevityMode: z.enum(["Short", "Medium"]).optional(),
        oneQuestionRule: z.boolean().optional(),
      });

      const validationResult = profileSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid input",
            details: validationResult.error.flatten(),
          },
          { status: 400 },
        );
      }

      const data = validationResult.data;
      const profile = await prisma.merchantAiProfile.upsert({
        where: { storeId },
        update: {
          ...data,
          updatedAt: new Date(),
        },
        create: {
          ...data,
          storeId,
        },
      });
      return NextResponse.json({ success: true, data: profile });
    } catch (error) {
      logger.error("[SELLER_AI_PROFILE_PUT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update AI profile" },
        { status: 500 },
      );
    }
  },
);
