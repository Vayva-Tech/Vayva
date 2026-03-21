// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { checkRateLimitCustom } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
        const userId = user.id;

        await checkRateLimitCustom(userId, "kyc_submit", 5, 3600);

        const { nin, cacNumber, consent } = body;
        const ip = request.headers?.get("x-forwarded-for") || "unknown";

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
                return NextResponse.json({ error: "Invalid CAC registration number format" }, { status: 400 });
            }
        }

        // Submit KYC via backend API
        const result = await apiJson<{
          success: boolean;
          data?: any;
          error?: string;
        }>(`${process.env.BACKEND_API_URL}/api/kyc/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            nin: trimmedNin,
            cacNumber: cacNumber?.trim() || undefined,
            consent,
            ipAddress: ip,
            actorUserId: userId,
          }),
        });

        if (!result.success) {
          return NextResponse.json({ error: result.error || 'KYC submission failed' }, { status: 400 });
        }

        // Notify ops admins of new KYC submission
        try {
            await fetch(`${process.env.BACKEND_API_URL}/api/events/publish`, {
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
            // Ignore notification failures - don't fail the request
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
