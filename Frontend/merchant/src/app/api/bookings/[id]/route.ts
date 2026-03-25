import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/bookings/[id] - Get single booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Booking id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/bookings/${id}`,
      {
        headers: auth.headers,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/bookings/[id]",
      operation: "GET_BOOKING",
    });
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

// PATCH /api/bookings/[id] - Update booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Booking id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/bookings/${id}`,
      {
        method: "PATCH",
        headers: auth.headers,
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/bookings/[id]",
      operation: "UPDATE_BOOKING",
    });
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Booking id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/bookings/${id}`,
      {
        method: "DELETE",
        headers: auth.headers,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/bookings/[id]",
      operation: "DELETE_BOOKING",
    });
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}
