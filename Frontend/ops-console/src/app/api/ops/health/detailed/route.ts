import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

interface ServiceCheck {
  name: string;
  status: "UP" | "DOWN" | "DEGRADED" | "NOT_CONFIGURED";
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

interface HealthReport {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  timestamp: string;
  uptime: string;
  services: {
    core: ServiceCheck[];
    external: ServiceCheck[];
    integrations: ServiceCheck[];
  };
  summary: {
    total: number;
    up: number;
    down: number;
    degraded: number;
    notConfigured: number;
  };
}

async function checkService(
  name: string,
  checkFn: () => Promise<{ ok: boolean; message?: string }>,
): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const result = await checkFn();
    const responseTime = Date.now() - start;
    return {
      name,
      status: result.ok ? "UP" : "DOWN",
      responseTime,
      message: result.message,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name,
      status: "DOWN",
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : "Unknown error",
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkEvolutionAPI(gatewayUrl: string): Promise<ServiceCheck> {
  return checkService("WhatsApp Gateway", async () => {
    const res = await fetch(gatewayUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    const data = await res.json().catch(() => null);
    return { ok: true, message: data?.version ? `v${data.version}` : "Connected" };
  });
}

async function checkEvolutionManager(gatewayUrl: string): Promise<ServiceCheck> {
  return checkService("Evolution Manager", async () => {
    const res = await fetch(`${gatewayUrl}/manager`, {
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
    return { ok: res.ok || res.status === 304, message: res.ok ? "Accessible" : `HTTP ${res.status}` };
  });
}

async function checkRedis(): Promise<ServiceCheck> {
  const redisUrl = process.env.REDIS_URL || process.env.CACHE_REDIS_URI;
  if (!redisUrl) {
    return {
      name: "Redis Cache",
      status: "NOT_CONFIGURED",
      message: "REDIS_URL not set",
      lastChecked: new Date().toISOString(),
    };
  }

  return checkService("Redis Cache", async () => {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(redisUrl, { connectTimeout: 5000 });
    try {
      await client.ping();
      await client.quit();
      return { ok: true, message: "Connected" };
    } catch (error) {
      await client.quit();
      throw error;
    }
  });
}

async function checkEmailService(): Promise<ServiceCheck> {
  const emailProvider = process.env.EMAIL_PROVIDER || "resend";
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      name: "Email Service",
      status: "NOT_CONFIGURED",
      message: "RESEND_API_KEY not set",
      lastChecked: new Date().toISOString(),
    };
  }

  return checkService("Email Service", async () => {
    return { ok: true, message: `${emailProvider} configured` };
  });
}

async function checkPaystack(): Promise<ServiceCheck> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_KEY;

  if (!secretKey || !publicKey) {
    return {
      name: "Paystack Payments",
      status: "NOT_CONFIGURED",
      message: "Paystack keys not configured",
      lastChecked: new Date().toISOString(),
    };
  }

  return checkService("Paystack Payments", async () => {
    const res = await fetch("https://api.paystack.co/bank", {
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, message: `API returned ${res.status}` };
    return { ok: true, message: "API accessible" };
  });
}

async function checkFileStorage(): Promise<ServiceCheck> {
  const bucket = process.env.UPLOADS_BUCKET || process.env.MINIO_BUCKET;
  if (!bucket) {
    return {
      name: "File Storage",
      status: "NOT_CONFIGURED",
      message: "Storage bucket not configured",
      lastChecked: new Date().toISOString(),
    };
  }

  return checkService("File Storage", async () => {
    return { ok: true, message: `Bucket: ${bucket}` };
  });
}

async function checkGroqAI(): Promise<ServiceCheck> {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_MARKETING || process.env.GROQ_API_KEY_RESCUE;
  if (!apiKey) {
    return {
      name: "Groq AI",
      status: "NOT_CONFIGURED",
      message: "GROQ_API_KEY not set",
      lastChecked: new Date().toISOString(),
    };
  }

  return checkService("Groq AI", async () => {
    return { ok: true, message: "API key configured" };
  });
}

async function checkWebhookEndpoint(): Promise<ServiceCheck> {
  const fraudWebhookSecret = process.env.FRAUD_WEBHOOK_SECRET;
  if (!fraudWebhookSecret) {
    return {
      name: "Fraud Webhook",
      status: "NOT_CONFIGURED",
      message: "FRAUD_WEBHOOK_SECRET not set",
      lastChecked: new Date().toISOString(),
    };
  }

  return checkService("Fraud Webhook", async () => {
    return { ok: true, message: "Secret configured" };
  });
}

async function checkDatabase(): Promise<ServiceCheck> {
  return checkService("PostgreSQL Database", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: "Connected" };
  });
}

async function checkMerchantAdmin(): Promise<ServiceCheck> {
  const url = process.env.MERCHANT_ADMIN_URL || "http://localhost:3000";
  return checkService("Merchant Admin", async () => {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      method: "HEAD",
    });
    return { ok: res.ok || res.status === 404, message: res.ok ? "Online" : `Status ${res.status}` };
  });
}

export async function GET() {
  try {
    await OpsAuthService.requireSession();

    const gatewayUrl = process.env.EVOLUTION_API_URL || null;

    // Run all checks in parallel
    const [
      database,
      redis,
      email,
      paystack,
      storage,
      groq,
      webhook,
      merchantAdmin,
    ] = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkEmailService(),
      checkPaystack(),
      checkFileStorage(),
      checkGroqAI(),
      checkWebhookEndpoint(),
      checkMerchantAdmin(),
    ]);

    // WhatsApp checks (conditional)
    let evolutionAPI: ServiceCheck | undefined;
    let evolutionManager: ServiceCheck | undefined;

    if (gatewayUrl) {
      const [apiResult, managerResult] = await Promise.allSettled([
        checkEvolutionAPI(gatewayUrl),
        checkEvolutionManager(gatewayUrl),
      ]);
      evolutionAPI = apiResult.status === "fulfilled" ? apiResult.value : {
        name: "WhatsApp Gateway",
        status: "DOWN",
        message: apiResult.reason?.message || "Check failed",
        lastChecked: new Date().toISOString(),
      };
      evolutionManager = managerResult.status === "fulfilled" ? managerResult.value : {
        name: "Evolution Manager",
        status: "DOWN",
        message: managerResult.reason?.message || "Check failed",
        lastChecked: new Date().toISOString(),
      };
    }

    // Extract results
    const services = {
      core: [
        database.status === "fulfilled" ? database.value : { name: "PostgreSQL Database", status: "DOWN" as const, message: String(database.reason), lastChecked: new Date().toISOString() },
        redis.status === "fulfilled" ? redis.value : { name: "Redis Cache", status: "DOWN" as const, message: String(redis.reason), lastChecked: new Date().toISOString() },
        storage.status === "fulfilled" ? storage.value : { name: "File Storage", status: "DOWN" as const, message: String(storage.reason), lastChecked: new Date().toISOString() },
      ],
      external: [
        email.status === "fulfilled" ? email.value : { name: "Email Service", status: "DOWN" as const, message: String(email.reason), lastChecked: new Date().toISOString() },
        paystack.status === "fulfilled" ? paystack.value : { name: "Paystack Payments", status: "DOWN" as const, message: String(paystack.reason), lastChecked: new Date().toISOString() },
        groq.status === "fulfilled" ? groq.value : { name: "Groq AI", status: "DOWN" as const, message: String(groq.reason), lastChecked: new Date().toISOString() },
      ],
      integrations: [
        webhook.status === "fulfilled" ? webhook.value : { name: "Fraud Webhook", status: "DOWN" as const, message: String(webhook.reason), lastChecked: new Date().toISOString() },
        merchantAdmin.status === "fulfilled" ? merchantAdmin.value : { name: "Merchant Admin", status: "DOWN" as const, message: String(merchantAdmin.reason), lastChecked: new Date().toISOString() },
        ...(evolutionAPI ? [evolutionAPI] : []),
        ...(evolutionManager ? [evolutionManager] : []),
      ],
    };

    // Calculate summary
    const allServices = [...services.core, ...services.external, ...services.integrations];
    const summary = {
      total: allServices.length,
      up: allServices.filter((s: any) => s.status === "UP").length,
      down: allServices.filter((s: any) => s.status === "DOWN").length,
      degraded: allServices.filter((s: any) => s.status === "DEGRADED").length,
      notConfigured: allServices.filter((s: any) => s.status === "NOT_CONFIGURED").length,
    };

    // Determine overall status
    let status: HealthReport["status"] = "HEALTHY";
    if (summary.down > 0 && summary.down >= summary.up) {
      status = "UNHEALTHY";
    } else if (summary.down > 0 || summary.degraded > 0) {
      status = "DEGRADED";
    }

    const report: HealthReport = {
      status,
      timestamp: new Date().toISOString(),
      uptime: "N/A", // Would need to track this separately
      services,
      summary,
    };

    return NextResponse.json(report);

  } catch (error: unknown) {
    logger.error("[HEALTH_CHECK] Failed to generate health report", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        status: "UNHEALTHY",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
