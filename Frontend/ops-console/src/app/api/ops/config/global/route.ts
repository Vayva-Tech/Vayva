import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAuth, OpsAuthContext } from "@/lib/withOpsAuth";
import { logger } from "@vayva/shared";

interface GlobalConfig {
  aiEnabled: boolean;
  evolutionApiEnabled: boolean;
  maintenanceMode: boolean;
  updatedAt: Date;
  updatedBy: string;
}

// In-memory store - for production with multiple instances, migrate to Redis or add SystemConfig model
let globalConfig: GlobalConfig = {
  aiEnabled: true,
  evolutionApiEnabled: true,
  maintenanceMode: false,
  updatedAt: new Date(),
  updatedBy: "system",
};

/**
 * GET /api/ops/config/global
 * Get current global system configuration
 */
export const GET = withOpsAuth(
  async (req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
    try {
      // Get additional stats from database
      const failedLogins = await prisma.opsAuditEvent?.count({
        where: {
          eventType: "OPS_LOGIN_FAILED",
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }) ?? 0;

      const activeSessions = await prisma.opsSession?.count({
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
      }) ?? 0;

      const adminActions = await prisma.opsAuditEvent?.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }) ?? 0;

      return NextResponse.json({
        config: globalConfig,
        stats: {
          failedLogins,
          activeSessions,
          adminActions,
        },
      });
    } catch (error) {
      logger.error("[GLOBAL_CONFIG_GET]", { error });
      return NextResponse.json(
        { error: "Failed to fetch global configuration" },
        { status: 500 }
      );
    }
  },
  { requiredPermission: { category: "users", action: "view" } }
);

/**
 * POST /api/ops/config/global
 * Update global system configuration
 */
export const POST = withOpsAuth(
  async (req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
    try {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      const { aiEnabled, evolutionApiEnabled, maintenanceMode } = body;

      // Validate inputs
      if (typeof aiEnabled !== "boolean" || 
          typeof evolutionApiEnabled !== "boolean" || 
          typeof maintenanceMode !== "boolean") {
        return NextResponse.json(
          { error: "Invalid configuration values" },
          { status: 400 }
        );
      }

      // Update config
      globalConfig = {
        aiEnabled,
        evolutionApiEnabled,
        maintenanceMode,
        updatedAt: new Date(),
        updatedBy: user.id,
      };

      // Log the configuration change
      await prisma.opsAuditEvent?.create({
        data: {
          eventType: "OPS_CONFIG_CHANGED",
          opsUserId: user.id,
          metadata: {
            aiEnabled,
            evolutionApiEnabled,
            maintenanceMode,
          },
        },
      });

      logger.info("[GLOBAL_CONFIG_UPDATED]", {
        userId: user.id,
        config: globalConfig,
      });

      return NextResponse.json({
        success: true,
        config: globalConfig,
      });
    } catch (error) {
      logger.error("[GLOBAL_CONFIG_POST]", { error });
      return NextResponse.json(
        { error: "Failed to update global configuration" },
        { status: 500 }
      );
    }
  },
  { requiredPermission: { category: "users", action: "update" } }
);
