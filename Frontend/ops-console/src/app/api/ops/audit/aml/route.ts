import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function GET(req: Request) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const riskLevel = searchParams.get("level");

    const response = await apiClient.get('/api/v1/admin/audit/aml', {
      level: riskLevel,
    });

    return NextResponse.json(response);
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
