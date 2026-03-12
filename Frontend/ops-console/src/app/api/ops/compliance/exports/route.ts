import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface ComplianceAnalytics {
  overview: {
    totalMerchants: number;
    kycVerified: number;
    kycPending: number;
    kycFailed: number;
    dataExportRequests: number;
    pendingExports: number;
  };
  kycMetrics: {
    completionRate: number;
    avgVerificationTime: number;
    byIndustry: { industry: string; verified: number; total: number }[];
  };
  dataRetention: {
    merchantsWithOldData: number;
    dataReadyForDeletion: number;
    storageUsed: string;
  };
  exportRequests: {
    id: string;
    storeId: string;
    storeName: string;
    scopes: unknown;
    status: string;
    requestedAt: string;
    completedAt: string | null;
  }[];
  regulatoryReports: {
    report: string;
    lastGenerated: string;
    status: string;
    nextDue: string;
  }[];
}

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all merchants with KYC status
    const merchants = await prisma.store.findMany({
      include: {
        kycRecord: true,
      },
    });

    const totalMerchants = merchants.length;
    const kycVerified = merchants.filter((m) => m.kycRecord?.status === "VERIFIED").length;
    const kycPending = merchants.filter((m) => m.kycRecord?.status === "PENDING" || m.kycRecord?.status === "NOT_STARTED").length;
    const kycFailed = merchants.filter((m) => m.kycRecord?.status === "REJECTED").length;

    // Calculate KYC completion rate
    const completionRate = totalMerchants > 0 ? (kycVerified / totalMerchants) * 100 : 0;

    // Calculate average verification time
    const verifiedKycs = merchants
      .filter((m) => m.kycRecord?.status === "VERIFIED" && m.kycRecord?.reviewedAt && m.kycRecord?.submittedAt)
      .map((m) => ({
        submittedAt: m.kycRecord!.submittedAt,
        reviewedAt: m.kycRecord!.reviewedAt!,
      }));

    const avgVerificationTime =
      verifiedKycs.length > 0
        ? verifiedKycs.reduce((acc, k) => {
            const hours =
              (new Date(k.reviewedAt).getTime() - new Date(k.submittedAt).getTime()) /
              (1000 * 60 * 60);
            return acc + hours;
          }, 0) / verifiedKycs.length
        : 0;

    // KYC by industry (using category field as industry)
    const industryMap = new Map<string, { verified: number; total: number }>();
    merchants.forEach((m) => {
      const industry = m.category || "Other";
      const existing = industryMap.get(industry) || { verified: 0, total: 0 };
      existing.total++;
      if (m.kycRecord?.status === "VERIFIED") existing.verified++;
      industryMap.set(industry, existing);
    });

    const byIndustry = Array.from(industryMap.entries())
      .map(([industry, data]) => ({
        industry,
        verified: data.verified,
        total: data.total,
      }))
      .sort((a, b) => b.total - a.total);

    // Get data export requests
    const exportRequests = await prisma.dataExportRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        store: {
          select: { id: true, name: true },
        },
      },
    });

    const dataExportRequests = exportRequests.length;
    const pendingExports = exportRequests.filter((e) => e.status === "PENDING").length;

    const formattedExports = exportRequests.map((req) => ({
      id: req.id,
      storeId: req.storeId,
      storeName: req.store?.name || "Unknown",
      scopes: req.scopes,
      status: req.status,
      requestedAt: req.createdAt.toISOString(),
      completedAt: req.completedAt?.toISOString() || null,
    }));

    // Data retention metrics
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const merchantsWithOldData = await prisma.store.count({
      where: {
        createdAt: { lt: oneYearAgo },
        isActive: false,
      },
    });

    // Simulated storage metrics
    const storageUsed = "2.4 TB";
    const dataReadyForDeletion = Math.floor(merchantsWithOldData * 0.3);

    // Regulatory reports status
    const regulatoryReports = [
      {
        report: "KYC Compliance Summary",
        lastGenerated: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "UP_TO_DATE",
        nextDue: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        report: "Data Processing Activities",
        lastGenerated: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "UP_TO_DATE",
        nextDue: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        report: "Transaction Monitoring Report",
        lastGenerated: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "DUE_SOON",
        nextDue: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        report: "Quarterly Privacy Audit",
        lastGenerated: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "OVERDUE",
        nextDue: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const analytics: ComplianceAnalytics = {
      overview: {
        totalMerchants,
        kycVerified,
        kycPending,
        kycFailed,
        dataExportRequests,
        pendingExports,
      },
      kycMetrics: {
        completionRate: Math.round(completionRate * 10) / 10,
        avgVerificationTime: Math.round(avgVerificationTime),
        byIndustry,
      },
      dataRetention: {
        merchantsWithOldData,
        dataReadyForDeletion,
        storageUsed,
      },
      exportRequests: formattedExports,
      regulatoryReports,
    };

    return NextResponse.json({ data: analytics });
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

    logger.error("[COMPLIANCE_EXPORTS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
