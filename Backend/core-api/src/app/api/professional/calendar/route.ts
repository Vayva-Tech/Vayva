import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CalendarEventSchema = z.object({
  matterId: z.string(),
  title: z.string().min(1),
  type: z.enum(["court_filing", "hearing", "discovery", "statute_of_limitations", "contractual", "internal"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  description: z.string().optional(),
  reminderEnabled: z.boolean().default(true),
  reminderMinutes: z.number().int().default(1440),
  assignedToIds: z.array(z.string()).default([]),
});

const DeadlineCalculationSchema = z.object({
  triggerDate: z.string().datetime(),
  daysBefore: z.number().int().min(1),
  isBusinessDays: z.boolean().default(true),
  courtRulesApply: z.boolean().default(false),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const action = searchParams.get("action") || "events";
      
      if (action === "court_dates") {
        const dateStr = searchParams.get("date");
        const date = dateStr ? new Date(dateStr) : new Date();
        
        const courtDates = await prisma.professionalCalendarEvent.findMany({
          where: {
            storeId,
            type: "hearing",
            startDate: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lte: new Date(date.setHours(23, 59, 59, 999)),
            },
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
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { startDate: "asc" },
        });

        return NextResponse.json(
          { data: courtDates },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "deadlines") {
        const matterId = searchParams.get("matterId");
        const daysAhead = parseInt(searchParams.get("daysAhead") || "7");
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
        
        const whereClause: any = {
          storeId,
          startDate: {
            gte: new Date(),
            lte: cutoffDate,
          },
        };
        
        if (matterId) {
          whereClause.matterId = matterId;
        }

        const deadlines = await prisma.professionalCalendarEvent.findMany({
          where: whereClause,
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
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { startDate: "asc" },
        });

        return NextResponse.json(
          { data: deadlines },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "overdue") {
        const overdueEvents = await prisma.professionalCalendarEvent.findMany({
          where: {
            storeId,
            startDate: { lt: new Date() },
            completedAt: null,
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
          orderBy: { startDate: "asc" },
        });

        return NextResponse.json(
          { data: overdueEvents },
          { headers: standardHeaders(requestId) }
        );
      } else {
        // Default: get all calendar events with filters
        const parseResult = z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(20),
          matterId: z.string().optional(),
          type: z.enum(["court_filing", "hearing", "discovery", "statute_of_limitations", "contractual", "internal"]).optional(),
          assignedToId: z.string().optional(),
          dateFrom: z.string().datetime().optional(),
          dateTo: z.string().datetime().optional(),
        }).parse({
          page: searchParams.get("page"),
          limit: searchParams.get("limit"),
          matterId: searchParams.get("matterId"),
          type: searchParams.get("type"),
          assignedToId: searchParams.get("assignedToId"),
          dateFrom: searchParams.get("dateFrom"),
          dateTo: searchParams.get("dateTo"),
        });

        const skip = (parseResult.page - 1) * parseResult.limit;

        const whereClause = {
          storeId,
          ...(parseResult.matterId && { matterId: parseResult.matterId }),
          ...(parseResult.type && { type: parseResult.type }),
          ...(parseResult.assignedToId && { assignedToId: parseResult.assignedToId }),
          ...(parseResult.dateFrom && { 
            startDate: { gte: new Date(parseResult.dateFrom) } 
          }),
          ...(parseResult.dateTo && { 
            startDate: { lte: new Date(parseResult.dateTo) } 
          }),
        };

        const [events, total] = await Promise.all([
          prisma.professionalCalendarEvent.findMany({
            where: whereClause,
            include: {
              matter: {
                select: {
                  id: true,
                  name: true,
                  case: {
                    select: {
                      client: {
                        select: {
                          id: true,
                          companyName: true,
                        },
                      },
                    },
                  },
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            skip,
            take: parseResult.limit,
            orderBy: { startDate: "asc" },
          }),
          prisma.professionalCalendarEvent.count({ where: whereClause }),
        ]);

        return NextResponse.json(
          {
            data: events,
            meta: {
              page: parseResult.page,
              limit: parseResult.limit,
              total,
              totalPages: Math.ceil(total / parseResult.limit),
            },
          },
          { headers: standardHeaders(requestId) }
        );
      }
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CALENDAR_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch calendar events" },
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
      const action = json.action || "create_event";
      
      if (action === "create_event") {
        const parseResult = CalendarEventSchema.parse(json);
        
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

        // Verify assignees exist
        const assignees = await prisma.user.findMany({
          where: { id: { in: parseResult.assignedToIds } },
        });

        if (assignees.length !== parseResult.assignedToIds.length) {
          return NextResponse.json(
            { error: "One or more assignees not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const createdEvent = await prisma.professionalCalendarEvent.create({
          data: {
            ...parseResult,
            storeId,
            startDate: new Date(parseResult.startDate),
            endDate: parseResult.endDate ? new Date(parseResult.endDate) : undefined,
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
            assignedTo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        logger.info("[PROFESSIONAL_CALENDAR_EVENT_CREATE]", {
          eventId: createdEvent.id,
          matterId: parseResult.matterId,
          type: parseResult.type,
          startDate: parseResult.startDate,
        });

        return NextResponse.json(
          { data: createdEvent },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "calculate_deadline") {
        const parseResult = DeadlineCalculationSchema.parse(json);
        
        const deadline = calculateDeadline(
          new Date(parseResult.triggerDate),
          parseResult.daysBefore,
          parseResult.isBusinessDays,
          parseResult.courtRulesApply
        );

        return NextResponse.json(
          { data: { deadline: deadline.toISOString() } },
          { headers: standardHeaders(requestId) }
        );
      } else if (action === "complete") {
        const { eventId } = json;
        
        if (!eventId) {
          return NextResponse.json(
            { error: "Event ID required" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }

        const updatedEvent = await prisma.professionalCalendarEvent.update({
          where: { id: eventId },
          data: {
            completedAt: new Date(),
          },
        });

        logger.info("[PROFESSIONAL_CALENDAR_EVENT_COMPLETE]", {
          eventId,
          completedBy: user.id,
        });

        return NextResponse.json(
          { data: updatedEvent },
          { headers: standardHeaders(requestId) }
        );
      }
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CALENDAR_ACTION]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to process calendar action" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Analytics endpoint for calendar metrics
export async function GET_CALENDAR_ANALYTICS(req: NextRequest, { storeId, correlationId }: APIContext) {
  const requestId = correlationId;
  try {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [todayCourtDates, upcomingDeadlines, overdueFilings, statuteLimitations] = await Promise.all([
      prisma.professionalCalendarEvent.count({
        where: {
          storeId,
          type: "hearing",
          startDate: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.professionalCalendarEvent.count({
        where: {
          storeId,
          startDate: {
            gte: new Date(),
            lte: weekAhead,
          },
          completedAt: null,
        },
      }),
      prisma.professionalCalendarEvent.count({
        where: {
          storeId,
          startDate: { lt: new Date() },
          completedAt: null,
        },
      }),
      prisma.professionalCalendarEvent.count({
        where: {
          storeId,
          type: "statute_of_limitations",
          startDate: {
            gte: new Date(),
            lte: monthAhead,
          },
        },
      }),
    ]);

    const analytics = {
      todaysCourtDates: todayCourtDates,
      upcomingDeadlines: upcomingDeadlines,
      overdueFilings: overdueFilings,
      approachingStatuteLimitations: statuteLimitations,
      eventsByType: await getEventsByType(storeId),
    };

    return NextResponse.json(
      { data: analytics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_CALENDAR_ANALYTICS]", { error, storeId });
    return NextResponse.json(
      { error: "Failed to fetch calendar analytics" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

function calculateDeadline(
  triggerDate: Date,
  daysBefore: number,
  isBusinessDays: boolean,
  courtRulesApply: boolean
): Date {
  // Simplified deadline calculation
  // In reality, this would account for weekends, holidays, and court-specific rules
  
  const deadline = new Date(triggerDate);
  
  if (isBusinessDays) {
    // Count backwards business days
    let businessDays = 0;
    while (businessDays < daysBefore) {
      deadline.setDate(deadline.getDate() - 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      const dayOfWeek = deadline.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
    }
  } else {
    // Simple day subtraction
    deadline.setDate(deadline.getDate() - daysBefore);
  }

  // If court rules apply, adjust for filing requirements
  if (courtRulesApply) {
    // Ensure deadline falls on a business day for filing
    while ([0, 6].includes(deadline.getDay())) {
      deadline.setDate(deadline.getDate() - 1);
    }
  }

  return deadline;
}

async function getEventsByType(storeId: string) {
  const eventCounts = await prisma.professionalCalendarEvent.groupBy({
    by: ['type'],
    where: { storeId },
    _count: { type: true },
  });

  return Object.fromEntries(
    eventCounts.map(item => [item.type, item._count.type])
  );
}