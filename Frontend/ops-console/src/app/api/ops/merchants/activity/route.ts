/**
 * Merchant Activity Stream API
 * 
 * Provides real-time activity data from audit logs, orders, and support tickets.
 */

import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface ActivityEvent {
  id: string;
  type: "order" | "login" | "payment" | "kyc" | "settings" | "suspicious";
  merchantId: string;
  merchantName: string;
  description: string;
  metadata: {
    ip?: string;
    userAgent?: string;
    orderValue?: number;
  };
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Get recent orders as activity events
    const recentOrders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get recent audit logs
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      where: {
        targetStoreId: { not: null },
      },
    });

    // Get store names for audit logs
    const storeIds = [...new Set(recentAuditLogs.map(log => log.targetStoreId).filter((id): id is string => id !== null))];
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true },
    });
    const storeMap = new Map(stores.map(s => [s.id, s.name]));

    // Get recent support tickets
    const recentTickets = await prisma.supportTicket.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Combine and transform into activity events
    const events: ActivityEvent[] = [];

    // Add order events
    for (const order of recentOrders) {
      if (order.store) {
        events.push({
          id: `order_${order.id}`,
          type: "order",
          merchantId: order.store.id,
          merchantName: order.store.name,
          description: `New order placed - ₦${Number(order.total).toLocaleString()}`,
          metadata: {
            orderValue: Number(order.total),
          },
          timestamp: order.createdAt.toISOString(),
          severity: "info",
        });
      }
    }

    // Add audit log events
    for (const log of recentAuditLogs) {
      if (log.targetStoreId) {
        const actionMap: Record<string, { type: ActivityEvent["type"]; description: string; severity: ActivityEvent["severity"] }> = {
          "MERCHANT_LOGIN": { type: "login", description: "Merchant logged in", severity: "info" },
          "SETTINGS_UPDATED": { type: "settings", description: "Store settings updated", severity: "info" },
          "KYC_SUBMITTED": { type: "kyc", description: "KYC documentation submitted", severity: "info" },
          "KYC_VERIFIED": { type: "kyc", description: "KYC verification completed", severity: "info" },
          "PAYMENT_RECEIVED": { type: "payment", description: "Payment received", severity: "info" },
          "PAYOUT_PROCESSED": { type: "payment", description: "Payout processed", severity: "info" },
          "SUSPICIOUS_ACTIVITY": { type: "suspicious", description: "Suspicious activity detected", severity: "warning" },
          "FAILED_LOGIN": { type: "suspicious", description: "Multiple failed login attempts", severity: "warning" },
        };

        const mapped = actionMap[log.action] || { 
          type: "settings" as const, 
          description: log.action.replace(/_/g, " ").toLowerCase(), 
          severity: "info" as const 
        };

        events.push({
          id: `audit_${log.id}`,
          type: mapped.type,
          merchantId: log.targetStoreId,
          merchantName: storeMap.get(log.targetStoreId) || "Unknown Store",
          description: mapped.description,
          metadata: {},
          timestamp: log.createdAt.toISOString(),
          severity: mapped.severity,
        });
      }
    }

    // Add support ticket events
    for (const ticket of recentTickets) {
      if (ticket.store) {
        events.push({
          id: `ticket_${ticket.id}`,
          type: ticket.priority === "high" ? "suspicious" : "settings",
          merchantId: ticket.store.id,
          merchantName: ticket.store.name,
          description: `Support ticket: ${ticket.subject}`,
          metadata: {},
          timestamp: ticket.createdAt.toISOString(),
          severity: ticket.priority === "high" ? "warning" : "info",
        });
      }
    }

    // Sort by timestamp descending and limit
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedEvents = events.slice(0, limit);

    return NextResponse.json({ data: limitedEvents });
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    )
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 403 },
      );

    logger.error("[MERCHANT_ACTIVITY_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
