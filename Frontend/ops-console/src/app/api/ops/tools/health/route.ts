import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

type ExternalServiceStatus = {
  status: "healthy" | "unhealthy" | "unknown";
  latencyMs?: number;
  message?: string;
};

const EXTERNAL_TIMEOUT_MS = 3000;

async function checkExternalService(
  name: string,
  url: string,
  init?: RequestInit,
): Promise<ExternalServiceStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  const start = Date.now();

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        status: "unhealthy",
        latencyMs,
        message: `${name} responded ${response.status}`,
      };
    }

    return { status: "healthy", latencyMs };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "unhealthy", message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(_req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const start = Date.now();
    let dbStatus = "unknown";
    let dbLatency = 0;

    // Check Database
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "healthy";
      dbLatency = Date.now() - start;
    } catch (e) {
      logger.error("[TOOLS_HEALTH_DB_ERROR]", { error: e });
      dbStatus = "unhealthy";
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    const paystackCheck = paystackKey
      ? checkExternalService("Paystack", "https://api.paystack.co/transaction?perPage=1", {
          headers: {
            Authorization: `Bearer ${paystackKey}`,
            "Content-Type": "application/json",
          },
        })
      : Promise.resolve({
          status: "unknown",
          message: "PAYSTACK_SECRET_KEY not configured",
        } satisfies ExternalServiceStatus);

    const resendCheck = resendKey
      ? checkExternalService("Resend", "https://api.resend.com/domains?limit=1", {
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
        })
      : Promise.resolve({
          status: "unknown",
          message: "RESEND_API_KEY not configured",
        } satisfies ExternalServiceStatus);

    const [paystackStatus, resendStatus] = await Promise.all([
      paystackCheck,
      resendCheck,
    ]);

    const externalStatuses = [paystackStatus.status, resendStatus.status];
    const hasExternalFailure = externalStatuses.includes("unhealthy");
    const overallStatus = dbStatus === "healthy" && !hasExternalFailure
      ? "healthy"
      : "degraded";

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        external_apis: {
          paystack: paystackStatus,
          resend: resendStatus,
        },
      },
      uptime: process.uptime(),
    });
  } catch {
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
