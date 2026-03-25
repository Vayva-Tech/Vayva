import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";
import type { Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import bcrypt from "bcryptjs";

const stylistSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["STYLIST", "SENIOR_STYLIST", "JUNIOR_STYLIST", "NAIL_TECH"]),
  specialty: z.string().optional(),
  commissionRate: z.number().optional(),
  maxAppointmentsPerDay: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * GET /api/beauty/stylists
 * Returns list of stylists with filtering options
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Prisma.MembershipWhereInput = {
      storeId,
      status: "ACTIVE",
    };

    if (role) {
      where.roleName = role;
    }

    const memberships = await prisma.membership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const stylistsWithMetrics = memberships.map((m) => {
      const stylist = m.user;
      return {
        ...stylist,
        role: m.roleName,
        role_enum: m.role_enum,
        isAvailable: true,
        nextAppointment: null,
        totalBookings: 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: stylistsWithMetrics,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/stylists",
      operation: "GET_STYLISTS",
    });
    return NextResponse.json({ error: "Failed to fetch stylists" }, { status: 500 });
  }
}

/**
 * POST /api/beauty/stylists
 * Create a new stylist
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const validatedData = stylistSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      const existingMembership = await prisma.membership.findUnique({
        where: {
          userId_storeId: { userId: existingUser.id, storeId },
        },
      });
      if (existingMembership) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(
      `invite-${validatedData.email}-${Date.now()}`,
      10
    );

    const stylist = await prisma.$transaction(async (tx) => {
      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            email: validatedData.email,
            password: passwordHash,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
          },
        }));

      return tx.membership.create({
        data: {
          userId: user.id,
          storeId,
          roleName: validatedData.role,
          status: "ACTIVE",
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    });

    logger.info("[BEAUTY_STYLISTS_POST] Stylist created", {
      stylistId: stylist.user.id,
      storeId,
    });

    return NextResponse.json({
      success: true,
      data: stylist,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/stylists",
      operation: "CREATE_STYLIST",
    });
    return NextResponse.json({ error: "Failed to create stylist" }, { status: 500 });
  }
}
