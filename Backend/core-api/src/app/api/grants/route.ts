// ============================================================================
// Nonprofit Grants API Routes
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { z } from "zod";

const grantSchema = z.object({
  funder: z.string().min(1),
  title: z.string().min(1),
  amount: z.number().positive(),
  deadline: z.string().datetime(),
  status: z.enum(["submitted", "in_progress", "planning", "awarded", "rejected"]),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional()
});

interface RouteParams {
  params: Promise<{
    id?: string;
  }>;
}

/**
 * GET /api/grants
 * Get all grants
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data for grants
    const grants = [
      {
        id: "grant-1",
        funder: "Gates Foundation",
        title: "Education Innovation Grant",
        amount: 150000,
        deadline: "2026-04-30T00:00:00Z",
        status: "submitted",
        description: "Support for educational technology initiatives",
        submittedDate: "2026-03-01T00:00:00Z"
      },
      {
        id: "grant-2",
        funder: "Ford Foundation",
        title: "Community Development Grant",
        amount: 75000,
        deadline: "2026-05-15T00:00:00Z",
        status: "in_progress",
        description: "Funding for community outreach programs",
        submittedDate: "2026-02-15T00:00:00Z"
      },
      {
        id: "grant-3",
        funder: "MacArthur Foundation",
        title: "Research Excellence Award",
        amount: 200000,
        deadline: "2026-06-01T00:00:00Z",
        status: "planning",
        description: "Support for groundbreaking research initiatives"
      }
    ];

    return NextResponse.json({
      success: true,
      data: grants,
      count: grants.length
    });
  } catch (error) {
    console.error("Error fetching grants:", error);
    return NextResponse.json(
      { error: "Failed to fetch grants" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grants
 * Create new grant application
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = grantSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.format() },
        { status: 400 }
      );
    }

    // Mock successful creation
    const newGrant = {
      id: `grant-${Date.now()}`,
      ...result.data,
      submittedDate: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newGrant
    });
  } catch (error) {
    console.error("Error creating grant:", error);
    return NextResponse.json(
      { error: "Failed to create grant" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/grants/pipeline
 * Get grant pipeline summary
 */
export async function GET_PIPELINE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pipelineSummary = {
      submitted: 24,
      inProgress: 8,
      planning: 12,
      awarded: 890000,
      pending: 340000,
      successRate: 65
    };

    return NextResponse.json({
      success: true,
      data: pipelineSummary
    });
  } catch (error) {
    console.error("Error fetching grant pipeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant pipeline" },
      { status: 500 }
    );
  }
}