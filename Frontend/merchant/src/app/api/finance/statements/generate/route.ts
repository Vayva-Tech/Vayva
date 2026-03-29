import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    
    // Proxy to backend
    const backendUrl = `${process.env.BACKEND_API_URL}/api/v1/platform/finance/statements/generate?month=${encodeURIComponent(month || "")}&year=${encodeURIComponent(year || "")}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        ...auth.headers,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Backend returned ${response.status}`);
    }
    
    const csv = await response.text();
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": response.headers.get("Content-Disposition") || "attachment; filename=statement.csv",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/finance/statements/generate',
      operation: 'GENERATE_STATEMENT',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
