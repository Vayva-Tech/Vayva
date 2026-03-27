import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";

// Get all feature flags
export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPERATOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    // Proxy to backend
    const response = await apiClient.get('/api/v1/admin/feature-flags');
    return NextResponse.json(response);
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[FEATURE_FLAGS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

// Create new feature flag
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "SUPERVISOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const body = await req.json();
    const { key, description, enabled, metadata } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    // Proxy to backend
    const response = await apiClient.post('/api/v1/admin/feature-flags', {
      name: key,
      description,
      enabled: enabled ?? false,
      metadata,
    });
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Feature flag key already exists" },
        { status: 409 }
      );
    }
    console.error("[FEATURE_FLAG_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
