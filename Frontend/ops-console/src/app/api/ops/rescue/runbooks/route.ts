import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    // Support role can run safe runbooks, but sticking to Owner/Admin/Operator for now
    // Assuming Operator+ can run runbooks.
    if (user.role === "OPS_SUPPORT") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { runbookId, params } = body;

    if (!runbookId) {
      return NextResponse.json(
        { error: "Runbook ID required" },
        { status: 400 },
      );
    }

    // Execute runbook via backend API
    const response = await apiClient.post('/api/v1/admin/rescue/runbooks/execute', {
      runbookId,
      params,
    });

    // Audit Log
    await OpsAuthService.logEvent(user.id, "OPS_RUNBOOK_EXECUTION", {
      runbookId,
      result: response.result,
      logs: response.logs,
    });

    return NextResponse.json(response);

  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Runbook execution failed",
      },
      { status: 500 },
    );
  }
}
