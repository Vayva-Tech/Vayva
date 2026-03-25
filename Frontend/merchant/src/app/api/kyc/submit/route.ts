import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { checkRateLimitCustom } from "@/lib/rate-limit";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const userId = auth.user.id;

    const body: unknown = await request.json().catch(() => ({}));
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    await checkRateLimitCustom(userId, "kyc_submit", 5, 3600);

    const nin = typeof record.nin === "string" ? record.nin : undefined;
    const cacNumber =
      typeof record.cacNumber === "string" ? record.cacNumber : undefined;
    const consent = record.consent === true;
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (!nin || !consent) {
      return NextResponse.json({ error: "NIN and consent are required" }, { status: 400 });
    }

    const trimmedNin = nin.trim();
    if (!/^\d{11}$/.test(trimmedNin)) {
      return NextResponse.json({ error: "NIN must be exactly 11 digits" }, { status: 400 });
    }

    if (cacNumber) {
      const trimmedCac = cacNumber.trim();
      if (!/^(RC|BN)?\d{5,8}$/i.test(trimmedCac)) {
        return NextResponse.json(
          { error: "Invalid CAC registration number format" },
          { status: 400 }
        );
      }
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${backendBase()}/api/kyc/submit`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({
        nin: trimmedNin,
        cacNumber: cacNumber?.trim() || undefined,
        consent,
        ipAddress: ip,
        actorUserId: userId,
      }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "KYC submission failed" },
        { status: 400 }
      );
    }

    try {
      await fetch(`${backendBase()}/api/events/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "kyc.submitted",
          merchantId: storeId,
          entityType: "kyc",
        }),
      });
    } catch {
      /* Ignore notification failures */
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/kyc/submit", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
