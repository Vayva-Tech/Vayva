import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const AIProfileSchema = z.object({
  agentName: z.string().min(1).max(50).optional(),
  tonePreset: z.enum(["friendly", "professional", "urgent", "luxurious"]).optional(),
  language: z.enum(["en", "fr", "es", "pidgin"]).optional(),
  greeting: z.string().max(200).optional(),
  autoReply: z.boolean().optional(),
  businessHoursOnly: z.boolean().optional(),
});

/**
 * GET /api/seller/ai/profile
 * Get AI agent profile settings
 */
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: { agentName?: string; tonePreset?: string; language?: string; greeting?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/seller/ai/profile`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch AI profile');
    }

    return NextResponse.json({
      success: result.success,
      data: result.data,
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/seller/ai/profile',
        operation: 'GET_AI_PROFILE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch AI profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/seller/ai/profile
 * Update AI agent profile
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AIProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/seller/ai/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated.data),
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to update AI profile');
    }

    return NextResponse.json({
      success: result.success,
      data: result.data,
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/seller/ai/profile',
        operation: 'UPDATE_AI_PROFILE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to update AI profile' },
      { status: 500 }
    );
  }
}
