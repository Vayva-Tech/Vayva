import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/ai/templates
 * Get AI conversation templates
 */
export const GET = withVayvaAPI(
  PERMISSIONS.AI_VIEW,
  async (req: NextRequest, { storeId }) => {
    try {
      const templates = await prisma.aITemplate.findMany({
        where: { storeId },
        orderBy: { usageCount: 'desc' }
      });

      // Transform for frontend
      const transformed = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        category: template.category || 'general',
        usageCount: template.usageCount || 0,
        isActive: template.isActive,
        lastModified: template.updatedAt.toISOString()
      }));

      return NextResponse.json(transformed);
    } catch (error) {
      console.error('[AI_TEMPLATES] Error:', error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/ai/templates
 * Create new AI template
 */
export const POST = withVayvaAPI(
  PERMISSIONS.AI_MANAGE,
  async (req: NextRequest, { storeId }) => {
    try {
      const body = await req.json();
      
      const { name, description, category, content } = body;

      if (!name || !content) {
        return NextResponse.json(
          { error: "Name and content are required" },
          { status: 400 }
        );
      }

      const template = await prisma.aITemplate.create({
        data: {
          storeId,
          name,
          description: description || '',
          category: category || 'general',
          content,
          isActive: true
        }
      });

      return NextResponse.json({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        usageCount: 0,
        isActive: true,
        lastModified: template.updatedAt.toISOString()
      });
    } catch (error) {
      console.error('[AI_CREATE_TEMPLATE] Error:', error);
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      );
    }
  }
);