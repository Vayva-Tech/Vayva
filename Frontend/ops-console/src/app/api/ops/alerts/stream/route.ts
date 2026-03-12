import { NextRequest } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma, $Enums } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/alerts/stream
 * Server-Sent Events endpoint for real-time critical alerts
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate ops user
    const { user } = await OpsAuthService.requireSession();
    
    // Only allow ops roles
    const allowedRoles = ["OPS_OWNER", "SUPERVISOR", "OPERATOR", "OPS_SUPPORT", "OPS_ADMIN"];
    if (!allowedRoles.includes(user.role)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    
    // Create readable stream
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`)
        );

        // Keep track of last check time
        let lastCheckTime = new Date();
        
        // Interval for checking new alerts
        const checkInterval = setInterval(async () => {
          try {
            // Check for new critical alerts since last check
            const newAlerts = await prisma.auditLog?.findMany({
              where: {
                app: "ops",
                severity: { in: ["CRITICAL", "ERROR"] as $Enums.AuditSeverity[] },
                createdAt: { gt: lastCheckTime },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            });

            // Check for system health issues
            const healthIssues = await checkSystemHealth();

            // Send alerts to client
            for (const alert of newAlerts) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "alert",
                    alert: {
                      id: alert.id,
                      type: alert.severity === "CRITICAL" ? "critical" : "warning",
                      title: alert.action,
                      message: JSON.stringify(alert.metadata),
                      timestamp: alert.createdAt?.toISOString(),
                      source: alert.actorEmail || "system",
                    },
                  })}\n\n`
                )
              );
            }

            // Send health issues
            for (const issue of healthIssues) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "alert",
                    alert: {
                      id: `health-${Date.now()}-${issue.type}`,
                      type: issue.severity,
                      title: issue.title,
                      message: issue.message,
                      timestamp: new Date().toISOString(),
                      source: "system-health",
                    },
                  })}\n\n`
                )
              );
            }

            // Send keepalive ping
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "ping" })}\n\n`)
            );

            lastCheckTime = new Date();
          } catch (error: unknown) {
            logger.error("[SSE Alerts] Error checking for alerts:", { error: error instanceof Error ? error.message : String(error) });
          }
        }, 15000); // Check every 15 seconds

        // Cleanup on client disconnect
        req.signal?.addEventListener("abort", () => {
          clearInterval(checkInterval);
          controller.close();
          logger.info("[SSE Alerts] Client disconnected", { userId: user.id });
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    logger.error("[SSE Alerts] Setup error:", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

interface HealthIssue {
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
}

async function checkSystemHealth(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    issues.push({
      type: "database",
      severity: "critical",
      title: "Database Connection Failed",
      message: "Unable to connect to database. Check database status immediately.",
    });
  }

  // Check for failed webhooks - simplified check without timestamp filter
  const recentFailedWebhooks = await prisma.webhookEvent?.count({
    where: {
      status: "FAILED",
    },
    take: 100,
  });

  if (recentFailedWebhooks > 5) {
    issues.push({
      type: "webhooks",
      severity: "warning",
      title: "Multiple Webhook Failures",
      message: `${recentFailedWebhooks} webhooks failed in the last 5 minutes.`,
    });
  }

  // Check for high error rate
  const recentErrors = await prisma.auditLog?.count({
    where: {
      severity: "ERROR" as $Enums.AuditSeverity,
      createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
    },
  });

  if (recentErrors > 10) {
    issues.push({
      type: "errors",
      severity: "warning",
      title: "High Error Rate",
      message: `${recentErrors} errors logged in the last 5 minutes.`,
    });
  }

  return issues;
}
