import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  industry: string;
  taxId: string;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Call backend API to fetch profile
    const result = await apiJson<ProfileData>(`${process.env.BACKEND_API_URL}/api/account/profile`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/account/profile",
      operation: "GET_PROFILE",
    });
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
