import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/with-vayva-api";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/legal/templates/[id]/generate
 * Generate document from template
 */
export const POST = withVayvaAPI(
  PERMISSIONS.LEGAL_DOCUMENTS_CREATE,
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();
      const { variables, caseId, name } = body;

      // Fetch template
      const template = await prisma.documentTemplate.findUnique({
        where: { id },
      });

      if (!template || !template.content) {
        return NextResponse.json(
          { success: false, error: "Template not found" },
          { status: 404 }
        );
      }

      // Replace variables in template
      let content = template.content;
      Object.keys(variables).forEach((key) => {
        content = content.replace(new RegExp(`\\{${key}\\}`, "g"), variables[key]);
      });

      // Create new document from template
      const document = await prisma.legalDocument.create({
        data: {
          name: name || `${template.name} - Generated`,
          documentType: template.category,
          content,
          caseId,
          templateId: id,
          status: "draft",
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          documentId: document.id,
          name: document.name,
          status: document.status,
        },
      });
    } catch (error) {
      console.error("Error generating document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to generate document" },
        { status: 500 }
      );
    }
  }
);
