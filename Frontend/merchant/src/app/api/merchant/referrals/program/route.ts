import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { z } from "zod";

const programSchema = z.object({
  rewardType: z.string().optional(),
  rewardValue: z.number().optional(),
  minOrderAmount: z.number().optional(),
  maxReferrals: z.number().optional(),
  expiryDays: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const body: unknown = await request.json();

    const validated = programSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.format() },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl("/api/merchant/referrals/program"), {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(validated.data),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to create referral program");
    }

    return NextResponse.json({ success: true, program: result.data });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/merchant/referrals/program",
      operation: "POST",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
