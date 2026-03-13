import { NextRequest , NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/with-vayva-api";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/legal/documents/[id]/download
 * Download a legal document
 */
export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_DOCUMENTS_VIEW,
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      
      const document = await prisma.legalDocument.findUnique({
        where: { id },
        include: {
          case: {
            select: {
              title: true,
              caseNumber: true,
            },
          },
        },
      });

      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Return document metadata and download URL
      // In production, this would integrate with S3/secure storage
      return NextResponse.json({
        success: true,
        data: {
          id: document.id,
          name: document.name,
          type: document.documentType,
          size: document.fileSize,
          url: document.storageUrl,
          downloadUrl: `/api/legal/documents/${id}/download-url`,
          caseInfo: document.case,
        },
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch document" },
        { status: 500 }
      );
    }
  }
);
