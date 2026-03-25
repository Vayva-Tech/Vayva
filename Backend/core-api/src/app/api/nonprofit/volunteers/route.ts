import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const VolunteerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  skill: z.string().optional(),
  minHours: z.coerce.number().optional(),
  maxHours: z.coerce.number().optional(),
  search: z.string().optional(),
});

const VolunteerCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  availability: z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
  }).default({}),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  backgroundCheckCompleted: z.boolean().default(false),
  orientationCompleted: z.boolean().default(false),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.VOLUNTEERS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = VolunteerQuerySchema.safeParse(
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

      const { page, limit, status, skill, minHours, maxHours, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (skill) {
        where.skills = {
          contains: `"${skill}"`,
        };
      }
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const [volunteers, _total] = await Promise.all([
        prisma.nonprofitVolunteer.findMany({
          where,
          include: {
            hours: {
              select: {
                id: true,
                hours: true,
                activity: true,
                date: true,
              },
              orderBy: { date: "desc" },
              take: 10,
            },
            _count: {
              select: {
                hours: true,
                assignedProjects: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitVolunteer.count({ where }),
      ]);

      // Filter by hours if specified
      let filteredVolunteers = volunteers;
      if (minHours !== undefined || maxHours !== undefined) {
        filteredVolunteers = await Promise.all(
          volunteers.map(async (volunteer) => {
            const totalHours = await prisma.nonprofitVolunteerHour.aggregate({
              where: { volunteerId: volunteer.id },
              _sum: { hours: true },
            });
            
            const hours = totalHours._sum.hours || 0;
            const passesFilter = (
              (minHours === undefined || hours >= minHours) &&
              (maxHours === undefined || hours <= maxHours)
            );
            
            return passesFilter ? { ...volunteer, totalHours: hours } : null;
          })
        ).then(results => results.filter(Boolean) as any[]);
      }

      // Parse JSON fields and calculate metrics
      const volunteersWithMetrics = filteredVolunteers.map(volunteer => ({
        ...volunteer,
        skills: JSON.parse(volunteer.skills || "[]"),
        interests: JSON.parse(volunteer.interests || "[]"),
        availability: JSON.parse(volunteer.availability || "{}"),
        emergencyContact: JSON.parse(volunteer.emergencyContact || "{}"),
        totalHours: volunteer.totalHours || volunteer.hours.reduce((sum, h) => sum + h.hours, 0),
        recentHours: volunteer.hours.slice(0, 5).reduce((sum, h) => sum + h.hours, 0),
      }));

      return NextResponse.json(
        {
          data: volunteersWithMetrics,
          meta: {
            total: filteredVolunteers.length,
            page,
            limit,
            totalPages: Math.ceil(filteredVolunteers.length / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_VOLUNTEERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch volunteers" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.VOLUNTEERS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = VolunteerCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid volunteer data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check for duplicate email
      const existingVolunteer = await prisma.nonprofitVolunteer.findFirst({
        where: { email: body.email, storeId },
      });

      if (existingVolunteer) {
        return NextResponse.json(
          { error: "Volunteer with this email already exists" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      const volunteer = await prisma.nonprofitVolunteer.create({
        data: {
          storeId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          skills: JSON.stringify(body.skills),
          interests: JSON.stringify(body.interests),
          availability: JSON.stringify(body.availability),
          emergencyContact: JSON.stringify(body.emergencyContact),
          backgroundCheckCompleted: body.backgroundCheckCompleted,
          orientationCompleted: body.orientationCompleted,
          notes: body.notes,
          status: "pending",
        },
      });

      return NextResponse.json(volunteer, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_VOLUNTEERS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create volunteer" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);