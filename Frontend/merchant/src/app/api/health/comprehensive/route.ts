import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { getRedis } from "@vayva/redis";
import { logger, urls } from "@vayva/shared";
import { FEATURES } from "@/lib/env-validation";

interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  responseTime?: number;
  error?: string;
}

interface IntegrationHealth {
  status: "healthy" | "degraded" | "down";
  message?: string;
}

async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    return {
      status: "healthy",
      responseTime,
    };
  } catch (error) {
    logger.error("[HEALTH] Database check failed", { error });
    return {
      status: "down",
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkRedis(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const redis = getRedis();
    await redis.ping();
    const responseTime = Date.now() - start;
    return {
      status: "healthy",
      responseTime,
    };
  } catch (error) {
    logger.error("[HEALTH] Redis check failed", { error });
    return {
      status: "down",
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkBackendAPI(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    if (!process.env.BACKEND_API_URL) {
      return {
        status: "down",
        responseTime: 0,
        error: "BACKEND_API_URL not configured",
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${process.env.BACKEND_API_URL}/api/health`, {
      method: "GET",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        status: "degraded",
        responseTime,
        error: `Backend returned ${response.status}`,
      };
    }

    return {
      status: "healthy",
      responseTime,
    };
  } catch (error) {
    logger.error("[HEALTH] Backend API check failed", { error });
    return {
      status: "down",
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkResendEmail(): Promise<IntegrationHealth> {
  if (!FEATURES.EMAIL_ENABLED) {
    return {
      status: "degraded",
      message: "Email service disabled",
    };
  }

  if (!process.env.RESEND_API_KEY) {
    return {
      status: "down",
      message: "RESEND_API_KEY not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured",
  };
}

async function checkPaystack(): Promise<IntegrationHealth> {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return {
      status: "down",
      message: "PAYSTACK_SECRET_KEY not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured",
  };
}

async function checkWhatsApp(): Promise<IntegrationHealth> {
  if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return {
      status: "degraded",
      message: "WhatsApp not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured",
  };
}

async function checkKwikDelivery(): Promise<IntegrationHealth> {
  if (!process.env.KWIK_API_KEY || !process.env.KWIK_SECRET_KEY) {
    return {
      status: "degraded",
      message: "Kwik delivery not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured",
  };
}

export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    const [database, redis, backendAPI, resend, paystack, whatsapp, kwik] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkBackendAPI(),
      checkResendEmail(),
      checkPaystack(),
      checkWhatsApp(),
      checkKwikDelivery(),
    ]);

    // Determine overall status
    const criticalServices = [database, redis, backendAPI];
    const hasCriticalDown = criticalServices.some(s => s.status === "down");
    const hasDegraded = [...criticalServices, resend, paystack, whatsapp, kwik].some(s => s.status === "degraded" || s.status === "down");

    const overallStatus: "healthy" | "degraded" | "down" = hasCriticalDown ? "down" : hasDegraded ? "degraded" : "healthy";

    const healthData = {
      status: overallStatus,
      timestamp,
      buildSha: process.env.NEXT_PUBLIC_BUILD_STAMP || "dev",
      environment: process.env.NODE_ENV,
      services: {
        database,
        redis,
        backendAPI,
      },
      integrations: {
        resend,
        paystack,
        whatsapp,
        kwikDelivery: kwik,
      },
      summary: {
        healthy: Object.values({ database, redis, backendAPI, resend, paystack, whatsapp, kwikDelivery: kwik }).filter(
          s => s.status === "healthy"
        ).length,
        degraded: Object.values({ database, redis, backendAPI, resend, paystack, whatsapp, kwikDelivery: kwik }).filter(
          s => s.status === "degraded"
        ).length,
        down: Object.values({ database, redis, backendAPI, resend, paystack, whatsapp, kwikDelivery: kwik }).filter(
          s => s.status === "down"
        ).length,
      },
    };

    return NextResponse.json(healthData, {
      status: overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 503 : 500,
      headers: {
        "Cache-Control": "no-store",
        "X-Health-Status": overallStatus,
        "X-Response-Time": `${Date.now() - new Date(timestamp).getTime()}ms`,
      },
    });
  } catch (error) {
    logger.error("[HEALTH] Comprehensive health check failed", { error });
    return NextResponse.json(
      {
        status: "down",
        timestamp,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
