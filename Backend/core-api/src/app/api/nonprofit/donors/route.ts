import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const DonorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "lapsed"]).optional(),
  donorType: z.enum(["individual", "organization", "foundation"]).optional(),
  minLifetimeValue: z.coerce.number().optional(),
  maxLifetimeValue: z.coerce.number().optional(),
  search: z.string().optional(),
});

const DonorCreateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  donorType: z.enum(["individual", "organization", "foundation"]).default("individual"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("US"),
  notes: z.string().optional(),
  communicationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    mail: z.boolean().default(true),
    phone: z.boolean().default(false),
  }).default({}),
  anonymous: z.boolean().default(false),
  tributeName: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.DONORS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = DonorQuerySchema.safeParse(
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

      const { page, limit, status, donorType, minLifetimeValue, maxLifetimeValue, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (donorType) where.donorType = donorType;
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { organization: { contains: search, mode: "insensitive" } },
        ];
      }

      const [donors, _total] = await Promise.all([
        prisma.nonprofitDonor.findMany({
          where,
          include: {
            _count: {
              select: {
                donations: { where: { status: "completed" } },
                recurringDonations: { where: { status: "active" } },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitDonor.count({ where }),
      ]);

      // Calculate lifetime value for each donor if filtering by value
      let donorsWithValues = donors;
      if (minLifetimeValue !== undefined || maxLifetimeValue !== undefined) {
        donorsWithValues = await Promise.all(
          donors.map(async (donor) => {
            const lifetimeValue = await prisma.nonprofitDonation.aggregate({
              where: { 
                donorId: donor.id,
                status: "completed"
              },
              _sum: { amount: true },
            });
            
            const value = lifetimeValue._sum.amount || 0;
            const passesFilter = (
              (minLifetimeValue === undefined || value >= minLifetimeValue) &&
              (maxLifetimeValue === undefined || value <= maxLifetimeValue)
            );
            
            return passesFilter ? { ...donor, lifetimeValue: value } : null;
          })
        ).then(results => results.filter(Boolean) as any[]);
      }

      return NextResponse.json(
        {
          data: donorsWithValues,
          meta: {
            total: donorsWithValues.length,
            page,
            limit,
            totalPages: Math.ceil(donorsWithValues.length / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONORS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch donors" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.DONORS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = DonorCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid donor data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Require at least name or organization
      if (!body.firstName && !body.lastName && !body.organization) {
        return NextResponse.json(
          { error: "Must provide either name or organization" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Check for duplicate email
      if (body.email) {
        const existingDonor = await prisma.nonprofitDonor.findFirst({
          where: { email: body.email, storeId },
        });
        
        if (existingDonor) {
          return NextResponse.json(
            { error: "Donor with this email already exists" },
            { status: 409, headers: standardHeaders(requestId) }
          );
        }
      }

      const donor = await prisma.nonprofitDonor.create({
        data: {
          storeId,
          firstName: body.firstName || "",
          lastName: body.lastName || "",
          email: body.email,
          phone: body.phone,
          organization: body.organization,
          donorType: body.donorType,
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          country: body.country,
          notes: body.notes,
          communicationPreferences: JSON.stringify(body.communicationPreferences),
          anonymous: body.anonymous,
          tributeName: body.tributeName,
          status: "active",
        },
      });

      return NextResponse.json(donor, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONORS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create donor" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);