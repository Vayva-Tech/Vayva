import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const matter = await prisma.professionalMatter.findFirst({
      where: { id, storeId },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get matter's documents
    const documents = await prisma.professionalDocument.findMany({
      where: { matterId: id },
      select: {
        id: true,
        name: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { data: documents },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROFESSIONAL_MATTER_DOCUMENTS_GET]", { error, matterId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch matter documents" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}