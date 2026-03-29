import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface LeadPatchBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  status?: string;
  tags?: string[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Lead id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      lead?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        notes: string;
        status: string;
        tags: string[];
      };
    }>(`${process.env.BACKEND_API_URL}/api/leads/${id}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/leads/[id]",
      operation: "GET_LEAD",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Lead id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw: unknown = await request.json().catch(() => ({}));
    const body = (typeof raw === "object" && raw !== null ? raw : {}) as LeadPatchBody;
    const { firstName, lastName, email, phone, notes, status, tags } = body;

    const result = await apiJson<{
      success: boolean;
      lead?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        notes: string;
        status: string;
        tags: string[];
      };
    }>(`${process.env.BACKEND_API_URL}/api/leads/${id}`, {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        notes,
        status,
        tags,
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/leads/[id]",
      operation: "PATCH_LEAD",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
