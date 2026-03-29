import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { nonprofitService } from "@/services/nonprofit.service";

// GET /api/nonprofit/volunteers?storeId=xxx&status=xxx
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
    }>(`${buildBackendUrl("/nonprofit/volunteers")}?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch volunteers");
    }

    return NextResponse.json({ volunteers: result.data || [] });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/nonprofit/volunteers",
      operation: "FETCH_VOLUNTEERS",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/volunteers
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
      email,
      firstName,
      lastName,
      phone,
      skills,
      availability,
      emergencyContact,
    } = body as Record<string, unknown>;

    if (
      typeof email !== "string" ||
      email.length === 0 ||
      typeof firstName !== "string" ||
      firstName.length === 0 ||
      typeof lastName !== "string" ||
      lastName.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const skillsList =
      Array.isArray(skills) && skills.every((s): s is string => typeof s === "string")
        ? skills
        : undefined;

    const volunteer = await nonprofitService.createVolunteer({
      storeId,
      email,
      firstName,
      lastName,
      phone: typeof phone === "string" ? phone : undefined,
      skills: skillsList,
      availability:
        availability && typeof availability === "object" && !Array.isArray(availability)
          ? (availability as Record<string, string | number | boolean | null>)
          : undefined,
      emergencyContact:
        typeof emergencyContact === "string" ? emergencyContact : undefined,
    });

    return NextResponse.json({ volunteer }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/nonprofit/volunteers",
      operation: "CREATE_VOLUNTEER",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create volunteer", message: errorMessage },
      { status: 500 }
    );
  }
}
