import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPS_SUPPORT");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const response = await apiClient.get('/api/v1/admin/support/tickets', {
      status,
      priority,
      q: search,
      page,
      limit,
    });

    return NextResponse.json(response);
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[SUPPORT_TICKETS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPS_SUPPORT");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const body = await req.json();
    const { ticketId, status, priority, assignedToId } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID required" },
        { status: 400 }
      );
    }

    const response = await apiClient.patch(`/api/v1/admin/support/tickets/${ticketId}`, {
      status,
      priority,
      assignedToId,
    });

    return NextResponse.json(response);
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[SUPPORT_TICKET_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
