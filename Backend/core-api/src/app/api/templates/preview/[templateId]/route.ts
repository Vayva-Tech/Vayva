import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;

    // Fetch template for preview
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        layout: true,
        widgets: true,
        theme: true,
      },
    });

    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404 }
      );
    }

    // Return template configuration for preview
    return new Response(JSON.stringify({
      success: true,
      data: {
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          layout: template.layout.config,
          theme: template.theme.config,
          widgets: template.widgets.map(w => ({
            id: w.id,
            type: w.type,
            position: w.position,
            config: w.config,
          })),
        },
        previewUrl: `/preview/template/${templateId}`,
      },
    }));

  } catch (error) {
    console.error('[TEMPLATE] Preview failed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate preview' }),
      { status: 500 }
    );
  }
}