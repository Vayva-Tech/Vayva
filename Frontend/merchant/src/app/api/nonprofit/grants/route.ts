import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { nonprofitService } from "@/services/nonprofit.service";
import { z } from "zod";

const GrantQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  funder: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  deadlineFrom: z.string().datetime().optional(),
  deadlineTo: z.string().datetime().optional(),
});

// GET /api/nonprofit/grants?page=1&limit=20&status=xxx&funder=xxx&minAmount=xxx&maxAmount=xxx
export async function GET(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const { searchParams } = new URL(req.url);
    const parseResult = GrantQuerySchema.safeParse(
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

    const { page, limit, status, funder, minAmount, maxAmount, deadlineFrom, deadlineTo } = parseResult.data;
    const skip = (page - 1) * limit;

    // Build filters for service call
    const filters: Record<string, unknown> = { storeId };
    if (status) filters.status = status;
    if (funder) filters.funder = funder;
    if (minAmount !== undefined) filters.minAmount = minAmount;
    if (maxAmount !== undefined) filters.maxAmount = maxAmount;
    if (deadlineFrom) filters.deadlineFrom = deadlineFrom;
    if (deadlineTo) filters.deadlineTo = deadlineTo;

    // Fetch grants with pagination
    const [grants, total] = await Promise.all([
      nonprofitService.getGrantsWithPagination(filters, skip, limit),
      nonprofitService.countGrants(filters),
    ]);

    // Calculate derived metrics
    const grantsWithMetrics = grants.map((grant: any) => ({
      ...grant,
      applicationCount: grant.applications?.length || 0,
      awardedApplications: grant.applications?.filter((a: any) => a.status === "awarded")?.length || 0,
      totalAwarded: grant.applications?.reduce((sum: number, app: any) => sum + (Number(app.awardedAmount) || 0), 0) || 0,
      successRate: grant.applications?.length > 0
        ? Math.round((grant.applications.filter((a: any) => a.status === "awarded").length / grant.applications.length) * 10000) / 100
        : 0,
      daysUntilDeadline: grant.deadline
        ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    return NextResponse.json({
      data: grantsWithMetrics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/grants",
      operation: "FETCH_GRANTS",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch grants", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/grants - Create new grant opportunity
export async function POST(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const {
      title,
      funder,
      description,
      requestedAmount,
      duration,
      deadline,
      website,
      contactName,
      contactEmail,
      contactPhone,
      eligibilityRequirements,
      requiredDocuments,
      evaluationCriteria,
      notes,
    } = body as Record<string, unknown>;

    // Validate required fields
    if (
      typeof title !== "string" ||
      title.length === 0 ||
      typeof funder !== "string" ||
      funder.length === 0 ||
      typeof requestedAmount !== "number" ||
      requestedAmount <= 0 ||
      typeof duration !== "number" ||
      duration <= 0 ||
      typeof deadline !== "string" ||
      deadline.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const grant = await nonprofitService.createNonprofitGrant({
      storeId,
      title,
      funder,
      description,
      requestedAmount,
      duration,
      deadline: new Date(deadline),
      website: typeof website === "string" ? website : undefined,
      contactName: typeof contactName === "string" ? contactName : undefined,
      contactEmail: typeof contactEmail === "string" ? contactEmail : undefined,
      contactPhone: typeof contactPhone === "string" ? contactPhone : undefined,
      eligibilityRequirements: Array.isArray(eligibilityRequirements) ? eligibilityRequirements : [],
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : [],
      evaluationCriteria: Array.isArray(evaluationCriteria) ? evaluationCriteria : [],
      notes: typeof notes === "string" ? notes : undefined,
    });

    return NextResponse.json({ grant }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/grants",
      operation: "CREATE_GRANT",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create grant", message: errorMessage },
      { status: 500 }
    );
  }
}
