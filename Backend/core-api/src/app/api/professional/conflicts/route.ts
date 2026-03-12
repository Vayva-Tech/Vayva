import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ConflictCheckSchema = z.object({
  matterId: z.string(),
  partiesToCheck: z.array(z.string()),
  checkType: z.enum(["initial", "ongoing", "specific_party"]),
});

const EthicalWallSchema = z.object({
  matterId: z.string(),
  restrictedUserIds: z.array(z.string()),
  reason: z.string().min(1),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type") || "pending";
      
      let conflicts;
      
      if (type === "pending") {
        conflicts = await prisma.professionalConflictCheck.findMany({
          where: { 
            storeId,
            status: "pending",
          },
          include: {
            matter: {
              select: {
                id: true,
                name: true,
                case: {
                  select: {
                    client: {
                      select: {
                        companyName: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      } else if (type === "potential") {
        conflicts = await prisma.professionalConflictCheck.findMany({
          where: { 
            storeId,
            status: "potential_conflict",
          },
          include: {
            matter: {
              select: {
                id: true,
                name: true,
                case: {
                  select: {
                    client: {
                      select: {
                        companyName: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        // Get conflicts queue summary
        const [pending, potential, cleared] = await Promise.all([
          prisma.professionalConflictCheck.count({
            where: { storeId, status: "pending" },
          }),
          prisma.professionalConflictCheck.count({
            where: { storeId, status: "potential_conflict" },
          }),
          prisma.professionalConflictCheck.count({
            where: { storeId, status: "cleared" },
          }),
        ]);

        const queueSummary = {
          pending,
          potentialConflicts: potential,
          cleared,
          clearedThisWeek: await getClearedThisWeek(storeId),
        };

        return NextResponse.json(
          { data: queueSummary },
          { headers: standardHeaders(requestId) }
        );
      }

      return NextResponse.json(
        { data: conflicts },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CONFLICTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch conflicts" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const action = json.action || "check";
      
      if (action === "check") {
        const parseResult = ConflictCheckSchema.parse(json);
        
        // Verify matter exists
        const matter = await prisma.professionalMatter.findFirst({
          where: { id: parseResult.matterId, storeId },
          include: {
            case: {
              select: {
                client: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        });

        if (!matter) {
          return NextResponse.json(
            { error: "Matter not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        // Run conflicts check against existing matters and clients
        const conflictsFound = await runConflictsCheck(
          storeId,
          parseResult.matterId,
          parseResult.partiesToCheck
        );

        const conflictChecks = await Promise.all(
          conflictsFound.map(async (conflict) => {
            return prisma.professionalConflictCheck.create({
              data: {
                storeId,
                matterId: parseResult.matterId,
                checkedAgainst: conflict.party,
                status: conflict.isConflict ? "potential_conflict" : "cleared",
                findings: conflict.findings,
                checkedBy: user.id,
              },
              include: {
                matter: {
                  select: {
                    name: true,
                    case: {
                      select: {
                        client: {
                          select: {
                            companyName: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            });
          })
        );

        logger.info("[PROFESSIONAL_CONFLICTS_CHECK]", {
          matterId: parseResult.matterId,
          partiesChecked: parseResult.partiesToCheck.length,
          conflictsFound: conflictsFound.filter(c => c.isConflict).length,
        });

        return NextResponse.json(
          { data: conflictChecks },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "clear") {
        const { checkId, resolutionNotes } = json;
        
        if (!checkId) {
          return NextResponse.json(
            { error: "Check ID required" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const updatedCheck = await prisma.professionalConflictCheck.update({
          where: { id: checkId },
          data: {
            status: "cleared",
            resolvedAt: new Date(),
            resolutionNotes,
          },
        });

        logger.info("[PROFESSIONAL_CONFLICT_CLEAR]", {
          checkId,
          resolvedBy: user.id,
        });

        return NextResponse.json(
          { data: updatedCheck },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "create_wall") {
        const parseResult = EthicalWallSchema.parse(json);
        
        // Verify matter exists
        const matter = await prisma.professionalMatter.findFirst({
          where: { id: parseResult.matterId, storeId },
        });

        if (!matter) {
          return NextResponse.json(
            { error: "Matter not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        // Create ethical wall records for each restricted user
        await Promise.all(
          parseResult.restrictedUserIds.map(userId =>
            prisma.professionalEthicalWall.create({
              data: {
                storeId,
                matterId: parseResult.matterId,
                userId,
                reason: parseResult.reason,
                createdById: user.id,
              },
            })
          )
        );

        logger.info("[PROFESSIONAL_ETHICAL_WALL_CREATE]", {
          matterId: parseResult.matterId,
          restrictedUsers: parseResult.restrictedUserIds.length,
          reason: parseResult.reason,
        });

        return NextResponse.json(
          { message: "Ethical wall created successfully" },
          { headers: standardHeaders(requestId) }
        );
      }
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CONFLICTS_ACTION]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to process conflicts action" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Analytics endpoint for conflicts metrics
export async function GET_CONFLICTS_ANALYTICS(req: NextRequest, { storeId, correlationId }: APIContext) {
  const requestId = correlationId;
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [pending, potential, cleared, clearedThisWeek] = await Promise.all([
      prisma.professionalConflictCheck.count({
        where: { storeId, status: "pending" },
      }),
      prisma.professionalConflictCheck.count({
        where: { storeId, status: "potential_conflict" },
      }),
      prisma.professionalConflictCheck.count({
        where: { storeId, status: "cleared" },
      }),
      prisma.professionalConflictCheck.count({
        where: { 
          storeId, 
          status: "cleared",
          resolvedAt: { gte: weekAgo },
        },
      }),
    ]);

    const analytics = {
      pendingConflicts: pending,
      potentialConflicts: potential,
      clearedConflicts: cleared,
      clearedThisWeek,
      conflictsRate: pending + potential > 0 ? 
        Math.round((potential / (pending + potential)) * 100) : 0,
    };

    return NextResponse.json(
      { data: analytics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_CONFLICTS_ANALYTICS]", { error, storeId });
    return NextResponse.json(
      { error: "Failed to fetch conflicts analytics" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

async function runConflictsCheck(
  storeId: string,
  matterId: string,
  partiesToCheck: string[]
): Promise<Array<{ party: string; isConflict: boolean; findings: string }>> {
  // This is a simplified conflicts check implementation
  // In reality, this would be much more sophisticated
  
  const existingMatters = await prisma.professionalMatter.findMany({
    where: { storeId, NOT: { id: matterId } },
    include: {
      case: {
        select: {
          client: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });

  const existingClients = await prisma.professionalClient.findMany({
    where: { storeId },
  });

  const conflicts = [];

  for (const party of partiesToCheck) {
    let isConflict = false;
    let findings = "";

    // Check against existing clients
    const conflictingClient = existingClients.find(client =>
      client.companyName.toLowerCase().includes(party.toLowerCase()) ||
      party.toLowerCase().includes(client.companyName.toLowerCase())
    );

    if (conflictingClient) {
      isConflict = true;
      findings = `Potential conflict with existing client: ${conflictingClient.companyName}`;
    }

    // Check against existing matters
    const conflictingMatter = existingMatters.find(matter =>
      matter.case.client.companyName.toLowerCase().includes(party.toLowerCase()) ||
      party.toLowerCase().includes(matter.case.client.companyName.toLowerCase())
    );

    if (conflictingMatter && !isConflict) {
      isConflict = true;
      findings = `Potential conflict with existing matter: ${conflictingMatter.name} (${conflictingMatter.case.client.companyName})`;
    }

    conflicts.push({
      party,
      isConflict,
      findings: findings || "No conflicts found",
    });
  }

  return conflicts;
}

async function getClearedThisWeek(storeId: string): Promise<number> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return prisma.professionalConflictCheck.count({
    where: {
      storeId,
      status: "cleared",
      resolvedAt: { gte: weekAgo },
    },
  });
}