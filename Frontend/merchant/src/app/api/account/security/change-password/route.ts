import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({})) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Current and new password required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean }>(`${process.env.BACKEND_API_URL}/api/account/security/change-password`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/account/security/change-password",
      operation: "CHANGE_PASSWORD",
    });
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
