import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";

function formatModuleName(key: string): string {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function getModuleDescription(key: string): string {
  return `Manage your ${formatModuleName(key).toLowerCase()}`;
}
function getModuleIcon(key: string): string {
  return key;
}
function getModuleCategory(key: string): string {
  return "general";
}
function getDefaultRoutesForModule(key: string): string[] {
  return [`/dashboard/${key}`];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    
    // Fetch merchant tools via backend API
    const response = await apiJson(`${process.env.BACKEND_API_URL}/api/merchant/tools?storeId=${storeId}`, {
      method: 'GET',
      headers: auth.headers,
    });

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, { endpoint: "/merchant/tools", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
