import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

async function checkEvolutionHealth(gatewayUrl: string): Promise<{ api: string; manager: string; error?: string }> {
  let apiStatus = "DOWN";
  let managerStatus = "DOWN";
  let errorDetails = "";

  // Evolution API v2.x doesn't have /health endpoint - use root endpoint
  try {
    const res = await fetch(gatewayUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      apiStatus = "UP";
    } else {
      errorDetails += `Root returned ${res.status}. `;
    }
  } catch (err) {
    errorDetails += `Root error: ${err instanceof Error ? err.message : String(err)}. `;
  }

  // Check Manager UI
  try {
    const res = await fetch(`${gatewayUrl}/manager`, {
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
    if (res.ok || res.status === 304) {
      managerStatus = "UP";
    } else {
      errorDetails += `/manager returned ${res.status}. `;
    }
  } catch (err) {
    errorDetails += `/manager error: ${err instanceof Error ? err.message : String(err)}. `;
  }

  return { api: apiStatus, manager: managerStatus, error: errorDetails };
}

export async function GET() {
  try {
    await OpsAuthService.requireSession();

    // 1. Check Database
    await prisma.$queryRaw`SELECT 1`;

    // 2. Check Evolution API (WhatsApp Gateway)
    const gatewayUrl = process.env.EVOLUTION_API_URL ||
      process.env.WHATSAPP_GATEWAY_URL ||
      null;

    let gatewayStatus: string;
    let managerStatus: string;
    let debugInfo = "";

    if (!gatewayUrl) {
      gatewayStatus = "NOT_CONFIGURED";
      managerStatus = "NOT_CONFIGURED";
      debugInfo = "EVOLUTION_API_URL not set";
    } else {
      const health = await checkEvolutionHealth(gatewayUrl);
      gatewayStatus = health.api;
      managerStatus = health.manager;
      debugInfo = health.error || "";

      // Log issues in production
      if ((gatewayStatus === "DOWN" || managerStatus === "DOWN") && process.env.NODE_ENV === "production") {
        logger.warn("[HEALTH_CHECK] WhatsApp Gateway issue detected", {
          gatewayUrl,
          gatewayStatus,
          managerStatus,
          debugInfo,
        });
      }
    }

    // Determine overall status
    let overallStatus: string;
    if (gatewayStatus === "NOT_CONFIGURED") {
      overallStatus = "NOT_CONFIGURED";
    } else {
      // Consider UP if either API or Manager is accessible
      overallStatus = (gatewayStatus === "UP" || managerStatus === "UP") ? "UP" : "DOWN";
    }

    return NextResponse.json({
      status: "HEALTHY",
      timestamp: new Date().toISOString(),
      checks: {
        database: "UP",
        whatsapp_gateway: overallStatus,
        gateway_api: gatewayStatus,
        manager_ui: managerStatus,
      },
      debug: process.env.NODE_ENV === "development" ? debugInfo : undefined,
    });

  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
