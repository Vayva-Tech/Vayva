import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { nonprofitService } from "@/services/nonprofit.service";
import { z } from "zod";

const ApplicationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  grantId: z.string().optional(),
});

const ApplicationCreateSchema = z.object({
  grantId: z.string(),
  projectName: z.string().min(1),
  projectDescription: z.string().min(1),
  requestedAmount: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  teamMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    qualifications: z.string().optional(),
  })).default([]),
  budgetBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number().nonnegative(),
    description: z.string().optional(),
  })).default([]),
  expectedOutcomes: z.array(z.string()).default([]),
  sustainabilityPlan: z.string().optional(),
  supportingDocuments: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// GET /api/nonprofit/grants/applications?page=1&limit=20&status=xxx&grantId=xxx
export async function GET(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const { searchParams } = new URL(req.url);
    const parseResult = ApplicationQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { page, limit, status, grantId } = parseResult.data;
    const skip = (page - 1) * limit;

    // Build filters
    const filters: Record<string, unknown> = { storeId };
    if (status) filters.status = status;
    if (grantId) filters.grantId = grantId;

    const [applications, total] = await Promise.all([
      nonprofitService.getGrantApplicationsWithPagination(filters, skip, limit),
      nonprofitService.countGrantApplications(filters),
    ]);

    // Calculate metrics
    const applicationsWithMetrics = applications.map((app: any) => ({
      ...app,
      teamMembers: typeof app.teamMembers === "string" ? JSON.parse(app.teamMembers) : app.teamMembers,
      budgetBreakdown: typeof app.budgetBreakdown === "string" ? JSON.parse(app.budgetBreakdown) : app.budgetBreakdown,
      expectedOutcomes: typeof app.expectedOutcomes === "string" ? JSON.parse(app.expectedOutcomes) : app.expectedOutcomes,
      supportingDocuments: typeof app.supportingDocuments === "string" ? JSON.parse(app.supportingDocuments) : app.supportingDocuments,
      totalBudget: (typeof app.budgetBreakdown === "string" ? JSON.parse(app.budgetBreakdown) : app.budgetBreakdown || [])
        .reduce((sum: number, item: any) => sum + item.amount, 0),
      daysSinceSubmission: app.submittedAt
        ? Math.floor((Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    return NextResponse.json({
      data: applicationsWithMetrics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/grants/applications",
      operation: "FETCH_APPLICATIONS",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch grant applications", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/grants/applications - Create new grant application
export async function POST(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const json = await req.json().catch(() => ({}));
    const parseResult = ApplicationCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid application data",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const body = parseResult.data;

    // Verify grant exists and deadline hasn't passed
    const grant = await nonprofitService.getNonprofitGrantById(body.grantId, storeId);
    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    if (new Date(grant.deadline) < new Date()) {
      return NextResponse.json(
        { error: "Grant deadline has passed" },
        { status: 400 }
      );
    }

    const application = await nonprofitService.createGrantApplication({
      storeId,
      grantId: body.grantId,
      projectName: body.projectName,
      projectDescription: body.projectDescription,
      requestedAmount: body.requestedAmount,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      teamMembers: body.teamMembers,
      budgetBreakdown: body.budgetBreakdown,
      expectedOutcomes: body.expectedOutcomes,
      sustainabilityPlan: body.sustainabilityPlan,
      supportingDocuments: body.supportingDocuments,
      notes: body.notes,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/grants/applications",
      operation: "CREATE_APPLICATION",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create grant application", message: errorMessage },
      { status: 500 }
    );
  }
}
