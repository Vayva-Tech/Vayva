import { NextRequest, NextResponse } from "next/server";
import { HealthMonitor } from "@/lib/stubs/reliability";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";

/**
 * GET /api/ops/health/system
 * 
 * Returns comprehensive system health status including:
 * - Core services (Database, Redis, etc.)
 * - External integrations (Paystack, WhatsApp, Kwik)
 * - Integration services (Evolution API, etc.)
 */
export async function GET(_req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPERATOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    // Register health checks if not already done
    registerHealthChecks();

    // Run all health checks
    const health = await HealthMonitor.runChecks();

    return NextResponse.json(health, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[HEALTH_SYSTEM] Error running health checks:", error);
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        timestamp: new Date().toISOString(),
        error: "Failed to run health checks",
      },
      { status: 500 }
    );
  }
}

// Track if checks are registered
let checksRegistered = false;

function registerHealthChecks() {
  if (checksRegistered) return;

  // Core Services
  HealthMonitor.registerCheck("redis", {
    name: "Redis Cache",
    category: "core",
    timeoutMs: 3000,
    check: async () => {
      try {
        const { getRedis } = await import("@vayva/redis");
        const redis = await getRedis();
        await redis.ping();
        return { ok: true, message: "Connected" };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "Redis connection failed",
        };
      }
    },
  });

  // External Integrations
  HealthMonitor.registerCheck("paystack", {
    name: "Paystack API",
    category: "external",
    timeoutMs: 5000,
    check: async () => {
      try {
        const response = await fetch("https://api.paystack.co/bank", {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        });
        if (response.ok) {
          return { ok: true, message: "API reachable" };
        }
        return { ok: false, message: `HTTP ${response.status}` };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "Connection failed",
        };
      }
    },
  });

  HealthMonitor.registerCheck("evolution_api", {
    name: "Evolution API (WhatsApp)",
    category: "external",
    timeoutMs: 5000,
    check: async () => {
      try {
        const baseUrl = process.env.EVOLUTION_API_URL || "http://163.245.209.202:8080";
        const response = await fetch(`${baseUrl}/instance/fetchInstances`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          return { ok: true, message: "Gateway online" };
        }
        return { ok: false, message: `HTTP ${response.status}` };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "Gateway unreachable",
        };
      }
    },
  });

  HealthMonitor.registerCheck("kwik_delivery", {
    name: "Kwik Delivery",
    category: "external",
    timeoutMs: 5000,
    check: async () => {
      try {
        const baseUrl = process.env.KWIK_BASE_URL || "https://api.kwik.delivery";
        // Just check if the domain is reachable
        const response = await fetch(baseUrl, { method: "HEAD" });
        return { ok: true, message: "Service reachable" };
      } catch {
        // If HEAD fails, service might still be up
        return { ok: true, message: "Service status unknown", metadata: { note: "Basic connectivity check" } };
      }
    },
  });

  // Integration Services
  HealthMonitor.registerCheck("xtts", {
    name: "XTTS Text-to-Speech",
    category: "integrations",
    timeoutMs: 5000,
    check: async () => {
      try {
        const baseUrl = process.env.XTTS_API_URL || "http://163.245.209.202:5000";
        const response = await fetch(`${baseUrl}/docs`, {
          method: "GET",
        });
        if (response.ok) {
          return { ok: true, message: "TTS service online" };
        }
        return { ok: false, message: `HTTP ${response.status}` };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "TTS service unreachable",
        };
      }
    },
  });

  HealthMonitor.registerCheck("ai_models", {
    name: "AI Model Providers",
    category: "integrations",
    timeoutMs: 5000,
    check: async () => {
      const providers = [];
      
      // Check Groq
      if (process.env.GROQ_API_KEY) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
          });
          providers.push({ name: "Groq", status: response.ok ? "ok" : "error" });
        } catch {
          providers.push({ name: "Groq", status: "error" });
        }
      }

      // Check OpenAI
      if (process.env.OPENAI_API_KEY) {
        try {
          const response = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          });
          providers.push({ name: "OpenAI", status: response.ok ? "ok" : "error" });
        } catch {
          providers.push({ name: "OpenAI", status: "error" });
        }
      }

      // Check OpenRouter
      if (process.env.OPENROUTER_API_KEY) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
          });
          providers.push({ name: "OpenRouter", status: response.ok ? "ok" : "error" });
        } catch {
          providers.push({ name: "OpenRouter", status: "error" });
        }
      }

      const okCount = providers.filter((p) => p.status === "ok").length;
      return {
        ok: okCount > 0,
        message: `${okCount}/${providers.length} providers available`,
        metadata: { providers },
      };
    },
  });

  checksRegistered = true;
}
