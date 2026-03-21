/**
 * API Routes for Ad Platform Campaigns
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AdPlatform } from "@/types/ad-platforms";
import { logger } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// Campaign creation validation schema
const campaignCreateSchema = z.object({
  platform: z.enum(["facebook", "instagram", "google", "tiktok", "twitter"]),
  name: z.string().min(1).max(200),
  objective: z.enum(["awareness", "consideration", "conversions"]),
  budget: z.object({
    amount: z.number().positive(),
    currency: z.string().default("NGN"),
    type: z.enum(["daily", "lifetime"]).default("daily"),
  }),
  schedule: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
  }),
  targeting: z.object({
    locations: z.array(z.string()).optional(),
    ageRange: z.object({
      min: z.number().min(13).max(65),
      max: z.number().min(13).max(65),
    }).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = campaignCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid campaign data", details: validationResult.error.format() },
        { status: 400 },
      );
    }

    const { platform, ...campaignData } = validationResult.data;

    // Get merchant's connected account ID from session
    const accountId = req.headers.get("x-ad-account-id");

    if (!accountId) {
      return NextResponse.json(
        { error: "No ad account connected" },
        { status: 401 },
      );
    }

    // Forward to Backend API using apiJson
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/campaigns`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-ad-account-id": accountId,
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create campaign" },
        { status: 400 },
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/campaigns",
        operation: "CREATE_CAMPAIGN",
      }
    );
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") as AdPlatform | null;
    const accountId = req.headers.get("x-ad-account-id");

    if (!accountId) {
      return NextResponse.json(
        { error: "No ad account connected" },
        { status: 401 },
      );
    }

    if (platform) {
      // Forward to Backend API using apiJson
      const result = await apiJson<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`${process.env.BACKEND_API_URL}/api/campaigns?platform=${encodeURIComponent(platform || "")}`, {
        headers: { "x-ad-account-id": accountId },
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to fetch campaigns" },
          { status: 400 },
        );
      }

      return NextResponse.json(result.data);
    }

    // Get all campaigns from all connected platforms
    // This would iterate through merchant's connected accounts
    return NextResponse.json([]);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/campaigns",
        operation: "FETCH_CAMPAIGNS",
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 },
    );
  }
}
