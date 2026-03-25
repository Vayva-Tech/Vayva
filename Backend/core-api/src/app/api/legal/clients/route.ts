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
  attorneyId: z.string().optional(),
  minCases: z.coerce.number().optional(),
  maxCases: z.coerce.number().optional(),
  search: z.string().optional(),
});

const ClientCreateSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  attorneyId: z.string().optional(),
  website: z.string().url().optional(),
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
  PERMISSIONS.LEGAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = ClientQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        attorneyId: searchParams.get("attorneyId"),
        minCases: searchParams.get("minCases"),
        maxCases: searchParams.get("maxCases"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.attorneyId && { attorneyId: parseResult.attorneyId }),
        ...(parseResult.search && {
          OR: [
            { companyName: { contains: parseResult.search, mode: "insensitive" } },
            { contactName: { contains: parseResult.search, mode: "insensitive" } },
            { contactEmail: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [clients, _total] = await Promise.all([
        prisma.legalClient.findMany({
          where: whereClause,
          include: {
            attorney: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                cases: {
                  where: { status: { not: "dismissed" } },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { companyName: "asc" },
        }),
        prisma.legalClient.count({ where: whereClause }),
      ]);

      // Filter by case count if specified
      let filteredClients = clients;
      if (parseResult.minCases !== undefined || parseResult.maxCases !== undefined) {
        filteredClients = clients.filter(client => {
          const caseCount = client._count.cases;
          const meetsMin = parseResult.minCases === undefined || caseCount >= parseResult.minCases;
          const meetsMax = parseResult.maxCases === undefined || caseCount <= parseResult.maxCases;
          return meetsMin && meetsMax;
        });
      }

      // Calculate client metrics
      const clientsWithMetrics = await Promise.all(
        filteredClients.map(async (client) => {
          const cases = await prisma.legalCase.findMany({
            where: { 
              clientId: client.id,
              status: { not: "dismissed" },
            },
            select: { 
              id: true,
              status: true,
              budget: true,
              filingDate: true,
            },
          });

          const totalCases = cases.length;
          const closedCases = cases.filter(c => c.status === "closed" || c.status === "settled").length;
          const totalBudget = cases.reduce((sum, c) => sum + (c.budget || 0), 0);
          
          const averageCaseDuration = cases
            .filter(c => c.filingDate && (c.status === "closed" || c.status === "settled"))
            .map(c => (new Date().getTime() - new Date(c.filingDate!).getTime()) / (1000 * 60 * 60 * 24))
            .reduce((sum, days) => sum + days, 0) / cases.length || 0;

          return {
            ...client,
            metrics: {
              totalCases,
              closedCases,
              settlementRate: totalCases > 0 ? (closedCases / totalCases) * 100 : 0,
              totalBudget,
              averageCaseValue: totalCases > 0 ? totalBudget / totalCases : 0,
              averageCaseDuration: Math.round(averageCaseDuration),
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
            total: filteredClients.length,
            totalPages: Math.ceil(filteredClients.length / parseResult.limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_CLIENTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch clients" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.LEGAL_MANAGE,
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

      // Verify attorney exists (if provided)
      if (parseResult.data.attorneyId) {
        const attorney = await prisma.user.findFirst({
          where: { id: parseResult.data.attorneyId },
        });

        if (!attorney) {
          return NextResponse.json(
            { error: "Attorney not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      const createdClient = await prisma.legalClient.create({
        data: {
          ...parseResult.data,
          storeId,
          address: JSON.stringify(parseResult.data.address),
          billingAddress: parseResult.data.billingAddress 
            ? JSON.stringify(parseResult.data.billingAddress)
            : JSON.stringify(parseResult.data.address),
          status: "prospect",
        },
        include: {
          attorney: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info("[LEGAL_CLIENT_CREATE]", {
        clientId: createdClient.id,
        companyName: createdClient.companyName,
        attorneyId: parseResult.data.attorneyId,
      });

      return NextResponse.json(
        { data: createdClient },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[LEGAL_CLIENT_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create client" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);