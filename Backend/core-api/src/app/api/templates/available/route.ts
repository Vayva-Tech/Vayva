import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logger } from "@vayva/shared";

// Template type definition
interface Template {
  id: string;
  status: string;
  industry: string;
  requiredPlan: string;
}

// TODO: Import from proper location or create shared package
// For now, using stub data - this should be replaced with actual template data
const ALL_TEMPLATES: Template[] = [
  { id: 'standard', status: 'active', industry: 'retail', requiredPlan: 'free' },
  { id: 'base', status: 'active', industry: 'retail', requiredPlan: 'free' },
];

// Industry restrictions by plan
const FREE_TIER_INDUSTRIES = ['retail', 'food', 'services', 'digital'];
const STARTER_TIER_INDUSTRIES = [
  'retail', 'food', 'services', 'digital',
  'fashion', 'electronics', 'beauty', 'grocery',
  'events', 'education', 'nonprofit'
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's plan and industry from session or query params
    const { searchParams } = new URL(request.url);
    const userPlan = (searchParams.get('plan') || 'free').toLowerCase() as 'free' | 'starter' | 'pro';
    const userIndustry = searchParams.get('industry') || 'retail';

    // Filter templates based on plan and industry
    const filteredTemplates = ALL_TEMPLATES.filter((template: Template) => {
      // All tiers see active templates only
      if (template.status !== 'active') return false;

      if (userPlan === 'free') {
        // Free users: only their industry + free tier
        return template.industry === userIndustry && 
               template.requiredPlan === 'free' &&
               FREE_TIER_INDUSTRIES.includes(template.industry);
      }
      
      if (userPlan === 'starter') {
        // Starter users: their industry + free/starter tiers
        return template.industry === userIndustry && 
               (template.requiredPlan === 'free' || template.requiredPlan === 'starter') &&
               STARTER_TIER_INDUSTRIES.includes(template.industry);
      }
      
      // Pro users see all templates
      return true;
    });

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      total: filteredTemplates.length,
      plan: userPlan,
      industry: userIndustry,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("[TEMPLATES_AVAILABLE_API_ERROR]", {
      error: errorMessage,
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
