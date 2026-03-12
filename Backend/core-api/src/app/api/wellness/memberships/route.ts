import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const MembershipQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "paused", "cancelled", "expired"]).optional(),
  membershipType: z.enum(["monthly", "annual", "class_pack", "drop_in"]).optional(),
  clientId: z.string().optional(),
  instructorId: z.string().optional(),
  search: z.string().optional(),
});

const MembershipCreateSchema = z.object({
  clientId: z.string(),
  membershipType: z.enum(["monthly", "annual", "class_pack", "drop_in"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  price: z.number().positive(),
  sessionsIncluded: z.number().int().positive().optional(),
  sessionsUsed: z.number().int().nonnegative().default(0),
  autoRenew: z.boolean().default(false),
  paymentMethod: z.enum(["credit_card", "debit_card", "ach", "cash", "check"]).optional(),
  notes: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  restrictions: z.array(z.string()).default([]),
});

export const GET = withVayvaAPI(
  PERMISSIONS.MEMBERSHIPS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = MembershipQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, membershipType, clientId, instructorId, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (membershipType) where.membershipType = membershipType;
      if (clientId) where.clientId = clientId;
      if (instructorId) where.instructorId = instructorId;
      if (search) {
        where.OR = [
          { client: { firstName: { contains: search, mode: "insensitive" } } },
          { client: { lastName: { contains: search, mode: "insensitive" } } },
          { client: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [memberships, total] = await Promise.all([
        prisma.wellnessMembership.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.wellnessMembership.count({ where }),
      ]);

      // Calculate derived metrics
      const membershipsWithMetrics = memberships.map(membership => {
        const daysRemaining = membership.endDate 
          ? Math.ceil((membership.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;
          
        const sessionsRemaining = membership.sessionsIncluded 
          ? membership.sessionsIncluded - membership.sessionsUsed
          : null;

        return {
          ...membership,
          paymentMethod: membership.paymentMethod as string,
          benefits: JSON.parse(membership.benefits || "[]"),
          restrictions: JSON.parse(membership.restrictions || "[]"),
          clientName: `${membership.client.firstName} ${membership.client.lastName}`,
          instructorName: membership.instructor 
            ? `${membership.instructor.firstName} ${membership.instructor.lastName}`
            : null,
          daysRemaining,
          sessionsRemaining,
          utilizationRate: membership.sessionsIncluded 
            ? Math.round((membership.sessionsUsed / membership.sessionsIncluded) * 10000) / 100
            : 0,
          isActive: membership.status === "active",
        };
      });

      return NextResponse.json(
        {
          data: membershipsWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_MEMBERSHIPS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch memberships" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.MEMBERSHIPS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = MembershipCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid membership data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify client exists
      const client = await prisma.user.findFirst({
        where: { id: body.clientId, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify instructor exists if provided
      if (body.instructorId) {
        const instructor = await prisma.wellnessInstructor.findFirst({
          where: { id: body.instructorId, storeId },
        });
        
        if (!instructor) {
          return NextResponse.json(
            { error: "Instructor not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      const membership = await prisma.wellnessMembership.create({
        data: {
          storeId,
          clientId: body.clientId,
          instructorId: body.instructorId,
          membershipType: body.membershipType,
          startDate: new Date(body.startDate),
          endDate: body.endDate ? new Date(body.endDate) : null,
          price: body.price,
          sessionsIncluded: body.sessionsIncluded,
          sessionsUsed: body.sessionsUsed,
          autoRenew: body.autoRenew,
          paymentMethod: body.paymentMethod,
          notes: body.notes,
          benefits: JSON.stringify(body.benefits),
          restrictions: JSON.stringify(body.restrictions),
          status: "active",
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
      });

      return NextResponse.json(membership, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_MEMBERSHIPS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create membership" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);