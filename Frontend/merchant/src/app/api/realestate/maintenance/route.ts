import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/realestate/maintenance?storeId=xxx&status=xxx
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams({ storeId });
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(buildBackendUrl(`/api/realestate/maintenance?${queryParams.toString()}`), {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch maintenance requests");
    }

    return NextResponse.json({ requests: result.data || [] });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/realestate/maintenance",
      operation: "FETCH_MAINTENANCE_REQUESTS",
    });
    return NextResponse.json(
      {
        error: "Failed to fetch maintenance requests",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// POST /api/realestate/maintenance
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    const body = (await req.json()) as Record<string, unknown>;
    const propertyId = typeof body.propertyId === "string" ? body.propertyId : "";
    const tenantId = typeof body.tenantId === "string" ? body.tenantId : "";
    const category = typeof body.category === "string" ? body.category : "";
    const priority = typeof body.priority === "string" ? body.priority : "normal";
    const description = typeof body.description === "string" ? body.description : "";
    const images = Array.isArray(body.images) ? body.images : [];

    if (!propertyId || !tenantId || !category || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl("/api/realestate/maintenance"), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({
        storeId,
        propertyId,
        tenantId,
        category,
        priority: priority || "normal",
        description,
        images: images || [],
      }),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to create maintenance request");
    }

    return NextResponse.json({ request: result.data }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to create maintenance request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// PATCH /api/realestate/maintenance?id=xxx - assign or complete
export async function PATCH(req: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    const assignedTo = body.assignedTo;
    const cost = body.cost;
    const rating = body.rating;
    const feedback = body.feedback;

    if (!action || !["assign", "complete", "feedback"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use assign, complete, or feedback" },
        { status: 400 },
      );
    }

    if (action === "assign" && (typeof assignedTo !== "string" || !assignedTo)) {
      return NextResponse.json({ error: "Missing assignedTo" }, { status: 400 });
    }

    if (action === "feedback" && (rating === undefined || typeof feedback !== "string" || !feedback)) {
      return NextResponse.json({ error: "Missing rating or feedback" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl(`/api/realestate/maintenance/${id}/${action}`), {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify({ assignedTo, cost, rating, feedback }),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to update maintenance request");
    }

    return NextResponse.json({ request: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to update request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
