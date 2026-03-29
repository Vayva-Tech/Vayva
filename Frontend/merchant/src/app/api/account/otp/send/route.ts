import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface OTPSendBody {
  field?: string;
  newValue?: string;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({})) as OTPSendBody;
    const { field, newValue } = body;

    if (!field || !newValue) {
      return NextResponse.json({ error: "field and newValue are required" }, { status: 400 });
    }

    if (!["email", "phone", "businessPhone"].includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    // Call backend API to send OTP
    const result = await apiJson<{
      success: boolean;
      message?: string;
    }>(`${process.env.BACKEND_API_URL}/api/account/otp/send`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ field, newValue }),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/account/otp/send",
      operation: "SEND_OTP",
    });
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
