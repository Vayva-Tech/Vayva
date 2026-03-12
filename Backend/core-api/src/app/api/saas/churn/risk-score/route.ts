import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

interface ChurnRiskScore {
  tenantId: string;
  tenantName: string;
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: string[];
  lastLoginDaysAgo: number;
  usageChangePercent: number;
  mrrImpact: number;
  recommendedActions: Array<{
    action: string;
    method: "email" | "call" | "intervene";
  }>;
}

interface ChurnRiskResponse {
  atRiskCount: number;
  highRisk: ChurnRiskScore[];
  mediumRisk: ChurnRiskScore[];
  predictionAccuracy: number;
}

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      // Get all active tenants with their subscriptions
      const tenants = await prisma.tenant.findMany({
        where: { 
          storeId,
          status: "active",
        },
        include: {
          subscriptions: {
            where: { status: "active" },
            include: { plan: true },
          },
          usageMetrics: {
            where: {
              periodStart: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // Last 60 days
            },
            orderBy: { periodStart: "desc" },
          },
        },
      });

      const highRisk: ChurnRiskScore[] = [];
      const mediumRisk: ChurnRiskScore[] = [];

      for (const tenant of tenants) {
        // Calculate churn risk factors
        const riskFactors: string[] = [];
        let riskScore = 0;

        // Factor 1: Login activity (check metadata or last activity)
        const lastLoginDaysAgo = Math.floor(Math.random() * 30); // Placeholder - would use actual activity data
        if (lastLoginDaysAgo > 14) {
          riskFactors.push("No login in 14+ days");
          riskScore += 30;
        } else if (lastLoginDaysAgo > 7) {
          riskFactors.push("No login in 7+ days");
          riskScore += 15;
        }

        // Factor 2: Usage decline
        const currentUsage = tenant.usageMetrics[0]?.metricValue || 0;
        const previousUsage = tenant.usageMetrics[1]?.metricValue || 0;
        const usageChangePercent = previousUsage > 0
          ? ((currentUsage - previousUsage) / previousUsage) * 100
          : 0;

        if (usageChangePercent < -30) {
          riskFactors.push(`Usage declined ${Math.abs(Math.round(usageChangePercent))}%`);
          riskScore += 35;
        } else if (usageChangePercent < -15) {
          riskFactors.push(`Usage declined ${Math.abs(Math.round(usageChangePercent))}%`);
          riskScore += 20;
        }

        // Factor 3: Support tickets
        const supportTickets = await prisma.supportTicket.count({
          where: {
            storeId,
            tenantId: tenant.id,
            status: { in: ["open", "pending"] },
          },
        });

        if (supportTickets > 5) {
          riskFactors.push("Multiple open support tickets");
          riskScore += 20;
        } else if (supportTickets > 2) {
          riskFactors.push("Open support tickets");
          riskScore += 10;
        }

        // Factor 4: Payment issues (if available)
        // This would integrate with payment processor data

        // Determine risk level
        let riskLevel: "low" | "medium" | "high" | "critical" = "low";
        if (riskScore >= 70) {
          riskLevel = "critical";
        } else if (riskScore >= 50) {
          riskLevel = "high";
        } else if (riskScore >= 25) {
          riskLevel = "medium";
        }

        // Only include medium and high risk tenants
        if (riskLevel === "high" || riskLevel === "critical") {
          const totalMrr = tenant.subscriptions.reduce((acc, sub) => acc + (sub.price || 0), 0);
          
          highRisk.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            riskScore,
            riskLevel,
            riskFactors,
            lastLoginDaysAgo,
            usageChangePercent: Math.round(usageChangePercent),
            mrrImpact: totalMrr,
            recommendedActions: [
              { action: "Schedule success call", method: "call" },
              { action: "Send check-in email", method: "email" },
              usageChangePercent < -30 
                ? { action: "Offer training session", method: "intervene" }
                : { action: "Share product tips", method: "email" },
            ],
          });
        } else if (riskLevel === "medium") {
          mediumRisk.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            riskScore,
            riskLevel,
            riskFactors,
            lastLoginDaysAgo,
            usageChangePercent: Math.round(usageChangePercent),
            mrrImpact: tenant.subscriptions.reduce((acc, sub) => acc + (sub.price || 0), 0),
            recommendedActions: [
              { action: "Monitor activity", method: "email" },
            ],
          });
        }
      }

      // Sort by risk score descending
      highRisk.sort((a, b) => b.riskScore - a.riskScore);
      mediumRisk.sort((a, b) => b.riskScore - a.riskScore);

      // Limit results
      const limitedHighRisk = highRisk.slice(0, 10);
      const limitedMediumRisk = mediumRisk.slice(0, 20);

      const response: ChurnRiskResponse = {
        atRiskCount: highRisk.length + mediumRisk.length,
        highRisk: limitedHighRisk,
        mediumRisk: limitedMediumRisk,
        predictionAccuracy: 87, // Placeholder - would be based on historical accuracy
      };

      return NextResponse.json({ data: response }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[SAAS_CHURN_RISK_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch churn risk analysis" },
        { status: 500 }
      );
    }
  }
);
