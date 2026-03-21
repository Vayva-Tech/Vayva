import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const serviceId = searchParams.get("serviceId");
      const date = searchParams.get("date");

      // Build query params for API call
      const queryParams = new URLSearchParams({
        storeId,
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (status) queryParams.append('status', status);
      if (serviceId) queryParams.append('serviceId', serviceId);
      if (date) queryParams.append('date', date);

      // Fetch appointments via backend API
      const result = await apiJson<{
        success: boolean;
        data?: any[];
        pagination?: { total?: number; hasMore?: boolean };
        error?: string;
      }>(`${process.env.BACKEND_API_URL}/api/healthcare/appointments?${queryParams.toString()}`, {
        headers: {
          'x-store-id': storeId,
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch appointments');
      }

      const appointments = result.data || [];
      const total = result.pagination?.total || appointments.length;

      return NextResponse.json({
        success: true,
        data: appointments,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + appointments.length < total,
        },
      });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/healthcare/appointments", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
