/**
 * Feedback API Routes
 * 
 * POST /api/feedback - Submit general feedback
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  category: z.enum(["general", "bug", "feature", "ux", "onboarding"]).default("general"),
  screenshotUrl: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Submit feedback
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow anonymous feedback but capture user if logged in
    const userId = session?.user?.id;

    const body = await req.json();
    const validated = feedbackSchema.parse(body);

    const auth = await buildBackendAuthHeaders(req);
    const forwardHeaders = auth
      ? { ...auth.headers }
      : { "Content-Type": "application/json" };

    // Call backend API to submit feedback
    const result = await apiJson<{ success: boolean; feedback?: { id: string } }>(
      `${process.env.BACKEND_API_URL}/api/feedback`,
      {
        method: "POST",
        headers: forwardHeaders,
        body: JSON.stringify({
          rating: validated.rating,
          comment: validated.comment || null,
          category: validated.category,
          screenshotUrl: validated.screenshotUrl || null,
          metadata: validated.metadata || {},
        }),
      }
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/feedback",
        operation: "SUBMIT_FEEDBACK",
        storeId: undefined,
      }
    );
    throw error;
  }
}
