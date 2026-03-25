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
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
  minLifetimeValue: z.coerce.number().optional(),
  maxLifetimeValue: z.coerce.number().optional(),
  search: z.string().optional(),
});

const ClientCreateSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  website: z.string().url().optional(),
  industry: z.string().optional(),
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
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CREATIVE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = ClientQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        tier: searchParams.get("tier"),
        minLifetimeValue: searchParams.get("minLifetimeValue"),
        maxLifetimeValue: searchParams.get("maxLifetimeValue"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.tier && { tier: parseResult.tier }),
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
        prisma.creativeClient.findMany({
          where: whereClause,
          include: {
            _count: {
              select: {
                projects: {
                  where: { status: { not: "cancelled" } },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { companyName: "asc" },
        }),
        prisma.creativeClient.count({ where: whereClause }),
      ]);

      // Calculate client metrics
      const clientsWithMetrics = await Promise.all(
        clients.map(async (client) => {
          const projects = await prisma.creativeProject.findMany({
            where: { 
              clientId: client.id,
              status: { not: "cancelled" },
            },
            select: { 
              id: true,
              budget: true,
              status: true,
            },
          });

          const totalProjects = projects.length;
          const completedProjects = projects.filter(p => p.status === "completed").length;
          const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
          
          const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

          return {
            ...client,
            metrics: {
              totalProjects,
              completedProjects,
              completionRate,
              totalBudget,
              averageProjectValue: totalProjects > 0 ? totalBudget / totalProjects : 0,
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
      logger.error("[CREATIVE_CLIENTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch clients" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.CREATIVE_MANAGE,
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

      const createdClient = await prisma.creativeClient.create({
        data: {
          ...parseResult.data,
          storeId,
          address: JSON.stringify(parseResult.data.address),
          billingAddress: parseResult.data.billingAddress 
            ? JSON.stringify(parseResult.data.billingAddress)
            : JSON.stringify(parseResult.data.address),
          status: "prospect",
          lifetimeValue: 0,
        },
      });

      logger.info("[CREATIVE_CLIENT_CREATE]", {
        clientId: createdClient.id,
        companyName: createdClient.companyName,
        tier: createdClient.tier,
      });

      return NextResponse.json(
        { data: createdClient },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CREATIVE_CLIENT_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create client" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);