import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

const createInstructorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    expiry: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
  })).optional(),
  yearsExperience: z.number().min(0).default(0),
  hourlyRate: z.number().optional(),
  profileImageUrl: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const isActive = searchParams.get("isActive") === "true" || undefined;
      const expertise = searchParams.get("expertise") || undefined;
      const search = searchParams.get("search") || "";
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const where = {
        storeId,
        ...(isActive !== undefined && { isActive }),
        ...(expertise && { expertise: { has: expertise } }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { bio: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [instructors, total] = await Promise.all([
        prisma.instructor.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.instructor.count({ where }),
      ]);

      return NextResponse.json({
        data: instructors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[INSTRUCTORS_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch instructors" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_CREATE,
  async (req: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await req.json();
      const validated = createInstructorSchema.parse(body);

      const instructor = await prisma.instructor.create({
        data: {
          storeId,
          userId: user.id,
          ...validated,
          hourlyRate: validated.hourlyRate ? new Decimal(validated.hourlyRate) : null,
        },
      });

      return NextResponse.json({ data: instructor }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[INSTRUCTORS_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to create instructor" },
        { status: 500 },
      );
    }
  },
);
