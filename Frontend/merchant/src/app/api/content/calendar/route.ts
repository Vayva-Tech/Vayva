import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// GET /api/content/calendar?storeId=xxx&filters...
export async function GET(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams({ storeId });
    if (type) queryParams.append("type", type);
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${backendBase()}/api/content/calendar?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch calendar");
    }

    const items = Array.isArray(result.data) ? result.data : [];
    return NextResponse.json({ items });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/content/calendar",
      operation: "FETCH_CONTENT_CALENDAR",
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch calendar", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/content/calendar
export async function POST(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const title = body.title;
    const type = body.type;
    const platform = body.platform;
    const description = body.description;
    const scheduledDate = body.scheduledDate;
    const assigneeId = body.assigneeId;
    const notes = body.notes;

    if (typeof title !== "string" || typeof type !== "string" || typeof scheduledDate !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean; data?: unknown; error?: string }>(
      `${backendBase()}/api/content/calendar`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify({
          storeId,
          title,
          type,
          platform,
          description,
          scheduledDate,
          assigneeId,
          notes,
        }),
      }
    );

    return NextResponse.json({ item: result.data }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create calendar item", message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/content/calendar?id=xxx - update status
export async function PATCH(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const status = body.status;
    const contentId = body.contentId;

    if (typeof status !== "string") {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean; data?: unknown; error?: string }>(
      `${backendBase()}/api/content/calendar?id=${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { ...auth.headers },
        body: JSON.stringify({ status, contentId }),
      }
    );

    return NextResponse.json({ item: result.data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update calendar item", message: errorMessage },
      { status: 500 }
    );
  }
}
