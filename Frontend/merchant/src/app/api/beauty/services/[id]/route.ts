import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

/**
 * GET /api/beauty/services/[id]
 * Get specific service details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data: {
        id: string;
        name: string;
        description: string;
        category: string;
        duration: number;
        price: number;
        status: string;
        imageUrl: string;
        metadata?: Record<string, unknown>;
        recentBookings: Array<{
          id: string;
          customerId: string;
          startTime: string;
          status: string;
        }>;
      };
      error?: string;
    }>(`${backendBase()}/api/beauty-services/${id}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch service");
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/beauty/services/[id]",
      operation: "GET_SERVICE",
    });
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

/**
 * PUT /api/beauty/services/[id]
 * Update an existing service
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();

    const result = await apiJson<{
      success: boolean;
      data?: Record<string, unknown>;
      error?: string;
    }>(`${backendBase()}/api/beauty-services/${id}`, {
      method: "PUT",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to update service");
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/beauty/services/[id]",
      operation: "UPDATE_SERVICE",
    });
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

/**
 * DELETE /api/beauty/services/[id]
 * Delete a service
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${backendBase()}/api/beauty-services/${id}`, {
      method: "DELETE",
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to delete service");
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/beauty/services/[id]",
      operation: "DELETE_SERVICE",
    });
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
