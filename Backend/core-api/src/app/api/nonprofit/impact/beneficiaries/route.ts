import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const BeneficiaryCreateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  organizationName: z.string().optional(),
  beneficiaryType: z.enum(["individual", "family", "community", "organization"]),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  demographics: z.object({
    age: z.number().int().positive().optional(),
    gender: z.string().optional(),
    ethnicity: z.string().optional(),
    incomeLevel: z.string().optional(),
    educationLevel: z.string().optional(),
    disabilityStatus: z.boolean().default(false),
    veteranStatus: z.boolean().default(false),
  }).optional(),
  enrollmentDate: z.string().datetime(),
  programId: z.string().optional(),
  serviceStartDate: z.string().datetime().optional(),
  serviceEndDate: z.string().datetime().optional(),
  status: z.enum(["enrolled", "active", "completed", "withdrawn", "ineligible"]).default("enrolled"),
  servicesReceived: z.array(z.string()).default([]),
  outcomesAchieved: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.BENEFICIARIES_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');
      const programId = searchParams.get('programId');
      const beneficiaryType = searchParams.get('beneficiaryType');
      const search = searchParams.get('search');
      
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      if (status) where.status = status;
      if (programId) where.programId = programId;
      if (beneficiaryType) where.beneficiaryType = beneficiaryType;
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { organizationName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const [beneficiaries, total] = await Promise.all([
        prisma.nonprofitBeneficiary.findMany({
          where,
          include: {
            program: {
              select: {
                name: true,
                description: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitBeneficiary.count({ where }),
      ]);

      // Process beneficiaries with derived metrics
      const beneficiariesWithMetrics = beneficiaries.map(beneficiary => {
        const demographics = JSON.parse(beneficiary.demographics || "{}");
        const servicesReceived = JSON.parse(beneficiary.servicesReceived || "[]");
        const outcomesAchieved = JSON.parse(beneficiary.outcomesAchieved || "[]");
        
        const serviceDuration = beneficiary.serviceStartDate && beneficiary.serviceEndDate
          ? Math.ceil((beneficiary.serviceEndDate.getTime() - beneficiary.serviceStartDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          ...beneficiary,
          demographics,
          servicesReceived,
          outcomesAchieved,
          fullName: beneficiary.firstName && beneficiary.lastName 
            ? `${beneficiary.firstName} ${beneficiary.lastName}`
            : beneficiary.organizationName || "Unnamed Beneficiary",
          daysEnrolled: Math.ceil((Date.now() - beneficiary.enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)),
          serviceDuration,
          isActive: beneficiary.status === "active" || beneficiary.status === "enrolled",
        };
      });

      // Generate demographic summaries
      const demographicSummary = this.generateDemographicSummary(beneficiariesWithMetrics);

      return NextResponse.json(
        {
          data: beneficiariesWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            demographics: demographicSummary,
            statusBreakdown: beneficiaries.reduce((acc: Record<string, number>, b) => {
              acc[b.status] = (acc[b.status] || 0) + 1;
              return acc;
            }, {}),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_BENEFICIARIES_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch beneficiaries" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.BENEFICIARIES_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = BeneficiaryCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid beneficiary data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify program exists if provided
      if (body.programId) {
        const program = await prisma.nonprofitProgram.findFirst({
          where: { id: body.programId, storeId },
        });
        
        if (!program) {
          return NextResponse.json(
            { error: "Program not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      // Require either individual name or organization name
      if (body.beneficiaryType === "individual" && (!body.firstName || !body.lastName)) {
        return NextResponse.json(
          { error: "Individual beneficiaries must have first and last name" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      if (body.beneficiaryType === "organization" && !body.organizationName) {
        return NextResponse.json(
          { error: "Organization beneficiaries must have organization name" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const beneficiary = await prisma.nonprofitBeneficiary.create({
        data: {
          storeId,
          firstName: body.firstName,
          lastName: body.lastName,
          organizationName: body.organizationName,
          beneficiaryType: body.beneficiaryType,
          email: body.email,
          phone: body.phone,
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          demographics: JSON.stringify(body.demographics),
          enrollmentDate: new Date(body.enrollmentDate),
          programId: body.programId,
          serviceStartDate: body.serviceStartDate ? new Date(body.serviceStartDate) : null,
          serviceEndDate: body.serviceEndDate ? new Date(body.serviceEndDate) : null,
          status: body.status,
          servicesReceived: JSON.stringify(body.servicesReceived),
          outcomesAchieved: JSON.stringify(body.outcomesAchieved),
          notes: body.notes,
        },
        include: {
          program: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json(beneficiary, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_BENEFICIARIES_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create beneficiary" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Generate demographic summary statistics
function generateDemographicSummary(beneficiaries: any[]): any {
  const summary: any = {
    total: beneficiaries.length,
    byGender: {} as Record<string, number>,
    byAgeGroup: {} as Record<string, number>,
    byEthnicity: {} as Record<string, number>,
    byIncomeLevel: {} as Record<string, number>,
    disabilities: 0,
    veterans: 0,
  };

  beneficiaries.forEach(beneficiary => {
    const demo = beneficiary.demographics;
    
    // Gender breakdown
    if (demo.gender) {
      summary.byGender[demo.gender] = (summary.byGender[demo.gender] || 0) + 1;
    }
    
    // Age group breakdown
    if (demo.age) {
      let ageGroup: string;
      if (demo.age < 18) ageGroup = "0-17";
      else if (demo.age < 35) ageGroup = "18-34";
      else if (demo.age < 55) ageGroup = "35-54";
      else if (demo.age < 65) ageGroup = "55-64";
      else ageGroup = "65+";
      summary.byAgeGroup[ageGroup] = (summary.byAgeGroup[ageGroup] || 0) + 1;
    }
    
    // Ethnicity breakdown
    if (demo.ethnicity) {
      summary.byEthnicity[demo.ethnicity] = (summary.byEthnicity[demo.ethnicity] || 0) + 1;
    }
    
    // Income level breakdown
    if (demo.incomeLevel) {
      summary.byIncomeLevel[demo.incomeLevel] = (summary.byIncomeLevel[demo.incomeLevel] || 0) + 1;
    }
    
    // Special populations
    if (demo.disabilityStatus) summary.disabilities++;
    if (demo.veteranStatus) summary.veterans++;
  });

  return summary;
}