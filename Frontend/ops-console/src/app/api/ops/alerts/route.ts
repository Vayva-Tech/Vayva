import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET() {
  await OpsAuthService.requireSession();

  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Generate alerts based on real data conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const alerts: any[] = [];

    // Check for failed payments in last 24h
    const failedPayments = await prisma.order.count({
      where: {
        paymentStatus: "FAILED",
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (failedPayments > 10) {
      alerts.push({
        id: "alert-failed-payments",
        type: "critical",
        category: "payment",
        title: "High Payment Failure Rate",
        message: `${failedPayments} payment failures in the last 24 hours. Check Paystack integration.`,
        timestamp: now.toISOString(),
        acknowledged: false,
      });
    } else if (failedPayments > 5) {
      alerts.push({
        id: "alert-failed-payments",
        type: "WARNING",
        category: "payment",
        title: "Elevated Payment Failures",
        message: `${failedPayments} payment failures in the last 24 hours.`,
        timestamp: now.toISOString(),
        acknowledged: false,
      });
    }

    // Check for pending KYC reviews
    const pendingKYC = await prisma.store.count({
      where: {
        wallet: {
          kycStatus: "PENDING",
        },
      },
    });

    if (pendingKYC > 20) {
      alerts.push({
        id: "alert-pending-kyc",
        type: "WARNING",
        category: "merchant",
        title: "KYC Queue Backlog",
        message: `${pendingKYC} merchants awaiting KYC review.`,
        timestamp: now.toISOString(),
        acknowledged: false,
      });
    }

    // Check for pending marketplace listings
    const pendingListings = await prisma.marketplaceListing.count({
      where: { status: "PENDING_REVIEW" },
    });

    if (pendingListings > 50) {
      alerts.push({
        id: "alert-pending-listings",
        type: "WARNING",
        category: "order",
        title: "Marketplace Moderation Backlog",
        message: `${pendingListings} listings pending review.`,
        timestamp: now.toISOString(),
        acknowledged: false,
      });
    }

    // Check for expiring trials
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringTrials = await prisma.merchantAiSubscription.count({
      where: {
        status: "TRIAL_ACTIVE",
        trialExpiresAt: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    if (expiringTrials > 10) {
      alerts.push({
        id: "alert-expiring-trials",
        type: "INFO",
        category: "merchant",
        title: "Trials Expiring Soon",
        message: `${expiringTrials} merchant trials expiring in the next 7 days.`,
        timestamp: now.toISOString(),
        acknowledged: false,
      });
    }

    // Calculate stats
    const stats = {
      critical: alerts.filter((a) => a.type === "critical").length,
      warning: alerts.filter((a) => a.type === "warning").length,
      info: alerts.filter((a) => a.type === "info").length,
      resolved24h: 0, // Would need an alerts table to track this
    };

    // Get real system status from health check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let systemStatus: any[] = [];
    try {
      const healthRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ops/tools/health`, {
        headers: { "Authorization": "internal" }, // Internal call
      });
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        systemStatus = [
          {
            service: "API Gateway",
            status: healthData.status === "healthy" ? "operational" : "degraded",
            latency: healthData.checks?.database?.responseTime || 0,
            lastCheck: now.toISOString(),
          },
          {
            service: "Database",
            status: healthData.checks?.database?.status === "healthy" ? "operational" : "degraded",
            latency: healthData.checks?.database?.responseTime || 0,
            lastCheck: now.toISOString(),
          },
        ];
      }
    } catch {
      // Fallback to minimal status if health check fails
      systemStatus = [
        { service: "API Gateway", status: "unknown", latency: 0, lastCheck: now.toISOString() },
        { service: "Database", status: "unknown", latency: 0, lastCheck: now.toISOString() },
      ];
    }

    return NextResponse.json({
      alerts,
      systemStatus,
      stats,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[ALERTS_FETCH_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 },
    );
  }
}
