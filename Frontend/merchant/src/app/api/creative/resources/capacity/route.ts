import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

type TeamMemberApi = Record<string, unknown> & {
  id?: unknown;
  name?: unknown;
  role?: unknown;
  skills?: unknown;
  allocations?: unknown;
};

type AllocationApi = Record<string, unknown> & {
  endDate?: unknown;
  startDate?: unknown;
  hoursPerWeek?: unknown;
  projectId?: unknown;
  project?: unknown;
};

function readAllocations(member: TeamMemberApi): AllocationApi[] {
  const raw = member.allocations;
  if (!Array.isArray(raw)) return [];
  return raw.filter((a): a is AllocationApi => isRecord(a));
}

function readProject(alloc: AllocationApi): Record<string, unknown> | null {
  const p = alloc.project;
  return isRecord(p) ? p : null;
}

// GET /api/creative/resources/capacity
// Get team capacity and allocation overview
export async function GET(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamMembersResult = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${backendBase()}/api/teammember`, {
      headers: auth.headers,
    });

    const rawList = teamMembersResult.data;
    const teamMembers: TeamMemberApi[] = Array.isArray(rawList)
      ? rawList.filter((m): m is TeamMemberApi => isRecord(m))
      : [];

    const capacityOverview = teamMembers.map((member) => {
      const allocations = readAllocations(member);
      const allocatedHours = allocations.reduce((sum, alloc) => {
        const start = alloc.startDate instanceof Date ? alloc.startDate : new Date(String(alloc.startDate));
        const end = alloc.endDate instanceof Date ? alloc.endDate : new Date(String(alloc.endDate));
        const daysAllocated = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        const hours = typeof alloc.hoursPerWeek === "number" ? alloc.hoursPerWeek : 0;
        return sum + hours * (daysAllocated / 7);
      }, 0);

      const availableHours = 40;
      const utilizationRate = (allocatedHours / availableHours) * 100;

      const skillsRaw = member.skills;
      const skillNames: string[] = [];
      if (Array.isArray(skillsRaw)) {
        for (const s of skillsRaw) {
          if (isRecord(s) && typeof s.skill === "string") skillNames.push(s.skill);
        }
      }

      return {
        id: String(member.id ?? ""),
        name: String(member.name ?? ""),
        role: typeof member.role === "string" ? member.role : "Team Member",
        skills: skillNames,
        allocatedHours: Math.round(allocatedHours),
        availableHours,
        utilizationRate: Math.round(utilizationRate),
        isOverallocated: utilizationRate > 100,
        projectCount: allocations.length,
        projects: allocations.map((a) => {
          const proj = readProject(a);
          return {
            projectId: a.projectId,
            projectName: typeof proj?.name === "string" ? proj.name : "Unknown",
            stage: typeof proj?.stage === "string" ? proj.stage : "unknown",
            hoursPerWeek: typeof a.hoursPerWeek === "number" ? a.hoursPerWeek : 0,
          };
        }),
      };
    });

    const overallocated = capacityOverview.filter((m) => m.isOverallocated);
    const available = capacityOverview.filter((m) => !m.isOverallocated && m.utilizationRate < 80);

    return NextResponse.json({
      capacity: {
        teamMembers: capacityOverview,
        summary: {
          total: teamMembers.length,
          overallocated: overallocated.length,
          available: available.length,
          avgUtilization:
            capacityOverview.length > 0
              ? Math.round(
                  capacityOverview.reduce((sum, m) => sum + m.utilizationRate, 0) /
                    capacityOverview.length
                )
              : 0,
        },
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch resource capacity", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/creative/resources/allocate
// Allocate a team member to a project
export async function POST(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { storeId: _ignoreStore, memberId, projectId, ...rest } = body;

    if (typeof memberId !== "string" || typeof projectId !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const allocation = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${backendBase()}/api/resourceallocation`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ ...rest, memberId, projectId, storeId }),
    });

    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create allocation", message: errorMessage },
      { status: 500 }
    );
  }
}
