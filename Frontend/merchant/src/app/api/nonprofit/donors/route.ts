import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/nonprofit/donors?storeId=xxx&donorId=xxx
export async function GET(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const { searchParams } = new URL(req.url);
    const donorId = searchParams.get("donorId");
    const email = searchParams.get("email");

    const queryParams = new URLSearchParams({ storeId });
    if (donorId) queryParams.append("donorId", donorId);
    if (email) queryParams.append("email", email);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${buildBackendUrl("/nonprofit/donors")}?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch donors");
    }

    return NextResponse.json({ donors: result.data || [] });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/nonprofit/donors",
      operation: "FETCH_DONORS",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch donors", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/donors
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
    const { name, email, phone, donorType, preferredCause, communicationPreference } = b;

    if (typeof email !== "string" || email.length === 0) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean; data?: unknown; error?: string }>(
      buildBackendUrl("/nonprofit/donors"),
      {
        method: "POST",
        headers: {
          ...auth.headers,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({
          storeId,
          name,
          email,
          phone,
          donorType,
          preferredCause,
          communicationPreference,
        }),
      }
    );

    return NextResponse.json({ donor: result.data }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/nonprofit/donors",
      operation: "CREATE_DONOR",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create donor", message: errorMessage },
      { status: 500 }
    );
  }
}
