// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
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
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();

    const validated = programSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error?.format() },
        { status: 400 }
      );
    }

    // Create/update program via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/referrals/program`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(validated.data),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to create referral program");
    }

    return NextResponse.json({ success: true, program: result.data });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/referrals/program", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
