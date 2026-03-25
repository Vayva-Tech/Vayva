import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { getSessionUser } from '@/lib/session.server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { templateId } = await params;
    const { searchParams } = new URL(request.url);
    const industrySlug = searchParams.get('industry');

    // Fetch template
    const template = await prisma.designerTemplate.findUnique({
      where: { id: templateId },
      include: {
        widgets: true,
        layout: true,
      },
    });

    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found', compatible: false }),
        { status: 404 }
      );
    }

    const warnings: string[] = [];
    const missingFeatures: string[] = [];

    // Validate industry compatibility
    if (industrySlug && template.industrySlug !== industrySlug) {
      warnings.push(`This template is designed for ${template.industrySlug}, but your store is in ${industrySlug}`);
    }

    // Check widget requirements
    const requiredWidgets = template.widgets.map(w => w.type);
    
    // Example: Check if template requires features merchant doesn't have
    if (requiredWidgets.includes('BOOKING_SYSTEM')) {
      // Check if merchant has booking capability
      const hasBooking = user.merchantFeatures?.includes('booking') || false;
      if (!hasBooking) {
        missingFeatures.push('Booking system');
        warnings.push('This template includes a booking system that requires additional setup');
      }
    }

    if (requiredWidgets.includes('INVENTORY_TRACKER')) {
      const hasInventory = user.merchantFeatures?.includes('inventory') || false;
      if (!hasInventory) {
        missingFeatures.push('Inventory management');
        warnings.push('This template includes inventory tracking that requires additional setup');
      }
    }

    if (requiredWidgets.includes('ADVANCED_ANALYTICS')) {
      const plan = user.planTier || 'free';
      if (plan === 'free' || plan === 'starter') {
        missingFeatures.push('Advanced analytics');
        warnings.push('Advanced analytics require Pro plan or higher');
      }
    }

    // Check theme compatibility
    if (template.theme) {
      // Verify theme exists in system
      const themeExists = await prisma.theme.findUnique({
        where: { id: template.themeId! },
      });

      if (!themeExists) {
        warnings.push('Custom theme may not be available');
      }
    }

    // Layout complexity check
    const layoutComplexity = JSON.stringify(template.layout?.config || {}).length;
    if (layoutComplexity > 50000) {
      warnings.push('This is a complex template and may take longer to apply');
    }

    const compatible = missingFeatures.length === 0;

    return new Response(JSON.stringify({
      success: true,
      compatible,
      warnings,
      missingFeatures,
      templateInfo: {
        id: template.id,
        name: template.name,
        category: template.category,
        industry: template.industrySlug,
        widgetCount: template.widgets.length,
      },
    }));

  } catch (error) {
    console.error('[TEMPLATE] Validation failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to validate template', 
        compatible: false,
        warnings: ['Validation service unavailable'],
      }),
      { status: 500 }
    );
  }
}
