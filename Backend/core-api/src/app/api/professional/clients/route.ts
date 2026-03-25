import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ClientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "prospect"]).optional(),
  industry: z.string().optional(),
  minAnnualRevenue: z.coerce.number().optional(),
  maxAnnualRevenue: z.coerce.number().optional(),
  search: z.string().optional(),
});

const ClientCreateSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  annualRevenue: z.number().nonnegative().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  paymentTerms: z.number().int().positive().default(30),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = ClientQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        industry: searchParams.get("industry"),
        minAnnualRevenue: searchParams.get("minAnnualRevenue"),
        maxAnnualRevenue: searchParams.get("maxAnnualRevenue"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.industry && { industry: parseResult.industry }),
        ...(parseResult.minAnnualRevenue !== undefined && { 
          annualRevenue: { gte: parseResult.minAnnualRevenue } 
        }),
        ...(parseResult.maxAnnualRevenue !== undefined && { 
          annualRevenue: { lte: parseResult.maxAnnualRevenue } 
        }),
        ...(parseResult.search && {
          OR: [
            { companyName: { contains: parseResult.search, mode: "insensitive" } },
            { contactName: { contains: parseResult.search, mode: "insensitive" } },
            { contactEmail: { contains: parseResult.search, mode: "insensitive" } },
            { industry: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [clients, total] = await Promise.all([
        prisma.professionalClient.findMany({
          where: whereClause,
          include: {
            _count: {
              select: {
                cases: {
                  where: { status: { not: "archived" } },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { companyName: "asc" },
        }),
        prisma.professionalClient.count({ where: whereClause }),
      ]);

      // Calculate client metrics
      const clientsWithMetrics = await Promise.all(
        clients.map(async (client) => {
          const cases = await prisma.professionalCase.findMany({
            where: { 
              clientId: client.id,
              status: { not: "archived" },
            },
            select: { 
              id: true,
              status: true,
              budget: true,
            },
          });

          const totalCases = cases.length;
          const closedCases = cases.filter(c => c.status === "closed").length;
          const totalBudget = cases.reduce((sum, c) => sum + (c.budget || 0), 0);
          
          const closureRate = totalCases > 0 ? (closedCases / totalCases) * 100 : 0;

          return {
            ...client,
            metrics: {
              totalCases,
              closedCases,
              closureRate,
              totalBudget,
              averageCaseValue: totalCases > 0 ? totalBudget / totalCases : 0,
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: clientsWithMetrics,
          meta: {
            page: parseResult.page,
            limit: parseResult.limit,
            total,
            totalPages: Math.ceil(total / parseResult.limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CLIENTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch clients" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_MANAGE,
  async (req: NextRequest, { storeId, _user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = ClientCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid client data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdClient = await prisma.professionalClient.create({
        data: {
          ...parseResult.data,
          storeId,
          address: JSON.stringify(parseResult.data.address),
          billingAddress: parseResult.data.billingAddress 
            ? JSON.stringify(parseResult.data.billingAddress)
            : JSON.stringify(parseResult.data.address),
          status: "prospect",
        },
      });

      logger.info("[PROFESSIONAL_CLIENT_CREATE]", {
        clientId: createdClient.id,
        companyName: createdClient.companyName,
        industry: createdClient.industry,
      });

      return NextResponse.json(
        { data: createdClient },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_CLIENT_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create client" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);