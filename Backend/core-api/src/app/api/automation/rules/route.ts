import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/automation/rules - List automation rules
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (req, { storeId }) => {
    try {
      const rules = await prisma.automationRule.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });

      const formattedRules = rules.map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        triggerType: r.triggerType,
        actionType: r.actionType,
        mfaEnabled: false,
        config: r.config as Record<string, unknown>,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));

      return NextResponse.json(
        { rules: formattedRules },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[AUTOMATION_RULES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load automation rules" },
        { status: 500 },
      );
    }
  },
);

// POST /api/automation/rules - Create automation rule
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_EDIT,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const { key, name, triggerType, actionType, config } = body;

      if (!key || !name || !triggerType || !actionType) {
        return NextResponse.json(
          { error: "Key, name, triggerType, and actionType are required" },
          { status: 400 },
        );
      }

      // Validate triggerType
      const validTriggerTypes = [
        "ORDER_CREATED",
        "ABANDONED_CHECKOUT",
        "CUSTOMER_CREATED",
        "PRODUCT_VIEWED",
        "PRODUCT_LOW_STOCK",
        "PRODUCT_OUT_OF_STOCK",
        "PAYMENT_FAILED",
        "SUBSCRIPTION_CREATED",
        "SUBSCRIPTION_CANCELLED",
      ];

      if (!validTriggerTypes.includes(triggerType)) {
        return NextResponse.json(
          { error: "Invalid trigger type" },
          { status: 400 },
        );
      }

      // Validate actionType
      const validActionTypes = [
        "SEND_EMAIL",
        "SEND_WHATSAPP",
        "APPLY_DISCOUNT",
        "ADD_TO_SEGMENT",
        "UPDATE_ORDER_STATUS",
        "TRIGGER_WEBHOOK",
      ];

      if (!validActionTypes.includes(actionType)) {
        return NextResponse.json(
          { error: "Invalid action type" },
          { status: 400 },
        );
      }

      const rule = await prisma.automationRule.create({
        data: {
          storeId,
          key,
          name,
          triggerType,
          actionType,
          enabled: true,
          config: config || {},
        },
      });

      return NextResponse.json(
        { rule },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[AUTOMATION_RULES_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create automation rule" },
        { status: 500 },
      );
    }
  },
);
