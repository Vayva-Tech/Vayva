import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/nonprofit/volunteers/shifts?storeId=xxx&volunteerId=xxx
export async function GET(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const { searchParams } = new URL(req.url);
    const volunteerId = searchParams.get("volunteerId");
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams({ storeId });
    if (volunteerId) queryParams.append("volunteerId", volunteerId);
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${buildBackendUrl("/api/nonprofit/volunteers/shifts")}?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch shifts");
    }

    return NextResponse.json({ shifts: result.data || [] });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/volunteers/shifts",
      operation: "FETCH_SHIFTS",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch shifts", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/volunteers/shifts
export async function POST(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      volunteersNeeded,
      status,
    } = b;

    if (
      typeof title !== "string" ||
      !startDate ||
      !startTime ||
      !endTime ||
      volunteersNeeded === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean; data?: unknown; error?: string }>(
      buildBackendUrl("/api/nonprofit/volunteers/shifts"),
      {
        method: "POST",
        headers: {
          ...auth.headers,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({
          storeId,
          title,
          description,
          startDate,
          endDate: endDate || startDate,
          startTime,
          endTime,
          location,
          volunteersNeeded,
          status: status || "scheduled",
        }),
      }
    );

    return NextResponse.json({ shift: result.data }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/volunteers/shifts",
      operation: "CREATE_SHIFT",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create shift", message: errorMessage },
      { status: 500 }
    );
  }
}
