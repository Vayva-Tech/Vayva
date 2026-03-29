import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface OTPVerifyBody {
  field?: string;
  newValue?: string;
  otp?: string | number;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({})) as OTPVerifyBody;
    const { field, newValue, otp } = body;

    if (!field || !newValue || !otp) {
      return NextResponse.json({ error: "field, newValue, and otp are required" }, { status: 400 });
    }

    if (!["email", "phone", "businessPhone"].includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const otpStr = String(otp);
    if (typeof otp !== "string" && typeof otp !== "number" || otpStr.length !== 6 || !/^\d{6}$/.test(otpStr)) {
      return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
    }

    // Call backend API to verify OTP and update field
    const result = await apiJson<{ success: boolean }>(`${process.env.BACKEND_API_URL}/api/account/otp/verify`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ field, newValue, otp }),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/account/otp/verify",
      operation: "VERIFY_OTP",
    });
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
