import { NextResponse } from "next/server";
import { prisma, RiskStatus, Prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

type RiskProfileWithStore = Prisma.RiskProfileGetPayload<{
  include: {
    store: { select: { id: true; name: true; slug: true } };
  };
}>;

export async function GET(req: Request) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const riskLevel = searchParams.get("level");

    const profiles = await prisma.riskProfile?.findMany({
      where: riskLevel
        ? { category: riskLevel }
        : { category: { in: ["HIGH", "CRITICAL"] } },
      include: {
        store: { 
          select: { 
            id: true, 
            name: true, 
            slug: true 
          } 
        }
      },
      orderBy: { overallScore: "desc" },
      take: 50,
    });

    const items = (profiles || []).map((p) => ({
      merchantId: p.store?.id,
      storeName: p.store?.name,
      riskScore: p.overallScore,
      riskLevel: p.category,
      lastEvaluated: p.lastAssessmentAt,
      reason:
        ((p.factors as Record<string, unknown> | null)?.reason as string) ||
        "Automated Signal",
      actionRequired: Number(p.overallScore) > 80 ? "IMMEDIATE_REVIEW" : "MONITOR",
    }));

    return NextResponse.json({ count: items.length, items });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[AML_AUDIT_ERROR]", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
