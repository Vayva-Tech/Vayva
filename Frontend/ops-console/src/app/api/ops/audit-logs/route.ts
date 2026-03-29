import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const eventType = searchParams.get("eventType") || "";
    const userId = searchParams.get("userId") || "";
    const targetType = searchParams.get("targetType") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const search = searchParams.get("search") || "";

    const response = await apiClient.get('/api/v1/admin/audit-logs', {
      page,
      limit,
      eventType,
      userId,
      targetType,
      startDate,
      endDate,
      search,
    });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const body = await req.json();
    const { filters, format } = body;

    const response = await apiClient.post('/api/v1/admin/audit-logs/export', { filters, format });
    
    if (format === 'csv') {
      return new NextResponse(response.data, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export audit logs" },
      { status: 500 }
    );
  }
}
