import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { nonprofitService } from "@/services/nonprofit.service";

// GET /api/nonprofit/grants?storeId=xxx&status=xxx
export async function GET(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams({ storeId });
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${buildBackendUrl("/api/nonprofit/grants")}?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch grants");
    }

    return NextResponse.json({ grants: result.data || [] });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/grants",
      operation: "FETCH_GRANTS",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch grants", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/grants
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
    const {
      name,
      funder,
      amount,
      currency,
      startDate,
      endDate,
      requirements,
      restrictions,
      reportingSchedule,
    } = body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      name.length === 0 ||
      typeof funder !== "string" ||
      funder.length === 0 ||
      typeof amount !== "number" ||
      typeof startDate !== "string" ||
      startDate.length === 0 ||
      typeof endDate !== "string" ||
      endDate.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const grant = await nonprofitService.createGrant({
      storeId,
      name,
      funder,
      amount,
      currency: typeof currency === "string" ? currency : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      requirements: typeof requirements === "string" ? requirements : undefined,
      restrictions: typeof restrictions === "string" ? restrictions : undefined,
      reportingSchedule:
        typeof reportingSchedule === "string" ? reportingSchedule : undefined,
    });

    return NextResponse.json({ grant }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/grants",
      operation: "CREATE_GRANT",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create grant", message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/nonprofit/grants?id=xxx - approve grant
export async function PATCH(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let grant;
    try {
      grant = await nonprofitService.approveGrant(id, storeId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "Grant not found") {
        return NextResponse.json({ error: "Grant not found" }, { status: 404 });
      }
      throw e;
    }
    return NextResponse.json({ grant });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/grants",
      operation: "APPROVE_GRANT",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to approve grant", message: errorMessage },
      { status: 500 }
    );
  }
}
