import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const DocumentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  matterId: z.string().optional(),
  status: z.enum(["drafting", "in_review", "awaiting_signature", "executed", "filed", "archived"]).optional(),
  type: z.string().optional(),
  assignedToId: z.string().optional(),
});

const DocumentCreateSchema = z.object({
  matterId: z.string(),
  title: z.string().min(1),
  type: z.string(),
  content: z.string().optional(),
  templateId: z.string().optional(),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROFESSIONAL_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = DocumentQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        matterId: searchParams.get("matterId"),
        status: searchParams.get("status"),
        type: searchParams.get("type"),
        assignedToId: searchParams.get("assignedToId"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.matterId && { matterId: parseResult.matterId }),
        ...(parseResult.status && { status: parseResult.status }),
        ...(parseResult.type && { type: parseResult.type }),
        ...(parseResult.assignedToId && { assignedToId: parseResult.assignedToId }),
      };

      const [documents, total] = await Promise.all([
        prisma.professionalDocument.findMany({
          where: whereClause,
          include: {
            matter: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    id: true,
                    companyName: true,
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
          orderBy: { createdAt: "desc" },
        }),
        prisma.professionalDocument.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: documents,
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
      logger.error("[PROFESSIONAL_DOCUMENTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch documents" },
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
      const parseResult = DocumentCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid document data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify matter exists
      const matter = await prisma.professionalMatter.findFirst({
        where: { id: parseResult.data.matterId, storeId },
        include: {
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
      });

      if (!matter) {
        return NextResponse.json(
          { error: "Matter not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify assignee exists (if provided)
      if (parseResult.data.assignedToId) {
        const assignee = await prisma.user.findFirst({
          where: { id: parseResult.data.assignedToId },
        });

        if (!assignee) {
          return NextResponse.json(
            { error: "Assignee not found" },
            { status: 400, headers: standardHeaders(requestId) }
          );
        }
      }

      let documentContent = parseResult.data.content || "";
      
      // If template is provided, generate content from template
      if (parseResult.data.templateId) {
        const template = await prisma.professionalDocumentTemplate.findFirst({
          where: { id: parseResult.data.templateId, storeId },
        });

        if (template) {
          // Simple template replacement - in real implementation would be more sophisticated
          documentContent = template.content
            .replace(/\{\{client_name\}\}/g, matter.case.client.companyName)
            .replace(/\{\{matter_name\}\}/g, matter.name)
            .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
        }
      }

      const createdDocument = await prisma.professionalDocument.create({
        data: {
          ...parseResult.data,
          storeId,
          content: documentContent,
          status: "drafting",
          version: "1.0",
          dueDate: parseResult.data.dueDate ? new Date(parseResult.data.dueDate) : undefined,
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

      logger.info("[PROFESSIONAL_DOCUMENT_CREATE]", {
        documentId: createdDocument.id,
        matterId: parseResult.data.matterId,
        title: parseResult.data.title,
        type: parseResult.data.type,
      });

      return NextResponse.json(
        { data: createdDocument },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[PROFESSIONAL_DOCUMENT_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create document" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Analytics endpoint for document metrics
export async function GET_DOCUMENT_ANALYTICS(req: NextRequest, { storeId, correlationId }: APIContext) {
  const requestId = correlationId;
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";
    
    const now = new Date();
    let startDate: Date;
    
    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Get document pipeline metrics
    const [drafting, inReview, awaitingSignature, executed] = await Promise.all([
      prisma.professionalDocument.count({
        where: { storeId, status: "drafting", createdAt: { gte: startDate } },
      }),
      prisma.professionalDocument.count({
        where: { storeId, status: "in_review", createdAt: { gte: startDate } },
      }),
      prisma.professionalDocument.count({
        where: { storeId, status: "awaiting_signature", createdAt: { gte: startDate } },
      }),
      prisma.professionalDocument.count({
        where: { storeId, status: "executed", createdAt: { gte: startDate } },
      }),
    ]);

    const analytics = {
      drafting,
      inReview,
      awaitingSignature,
      executed,
      totalPending: drafting + inReview + awaitingSignature,
      templateUsage: await getTemplateUsage(storeId),
      pendingSignatures: await getPendingSignatures(storeId),
    };

    return NextResponse.json(
      { data: analytics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_DOCUMENT_ANALYTICS]", { error, storeId });
    return NextResponse.json(
      { error: "Failed to fetch document analytics" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

async function getTemplateUsage(storeId: string) {
  const templates = await prisma.professionalDocumentTemplate.findMany({
    where: { storeId },
    include: {
      _count: {
        select: {
          generatedDocuments: true,
        },
      },
    },
  });

  return templates.map(template => ({
    templateId: template.id,
    name: template.name,
    usageCount: template._count.generatedDocuments,
  }));
}

async function getPendingSignatures(storeId: string) {
  // This would integrate with an e-signature service in real implementation
  const pendingDocs = await prisma.professionalDocument.count({
    where: { 
      storeId, 
      status: "awaiting_signature",
      dueDate: { gte: new Date() },
    },
  });

  return pendingDocs;
}