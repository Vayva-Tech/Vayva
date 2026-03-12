import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccessIndustryDashboards } from '@/lib/access-control/tier-limits';
import type { PlanTier } from '@/lib/access-control/tier-limits';

/**
 * Middleware to protect industry dashboard routes based on user tier
 * 
 * This middleware checks if a user has access to industry dashboard routes
 * based on their subscription tier. Free users are blocked from accessing
 * industry-specific dashboards.
 */

// Industry dashboard route patterns
const INDUSTRY_DASHBOARD_ROUTES = [
  /^\/dashboard\/(retail|fashion|electronics|grocery|one_product|food|restaurant|services|real_estate|events|automotive|wholesale|nightlife|nonprofit|petcare|realestate|blog|creative|education|healthcare|legal|saas|marketplace|travel_hospitality|fitness|jobs|hotel|salon|spa|catering)(\/.*)?$/
];

/**
 * Check if a pathname matches industry dashboard routes
 */
function isIndustryDashboardRoute(pathname: string): boolean {
  return INDUSTRY_DASHBOARD_ROUTES.some(pattern => pattern.test(pathname));
}

/**
 * Get user tier from request (this would typically come from session/auth)
 * In a real implementation, this would extract the tier from the user session
 */
async function getUserTier(request: NextRequest): Promise<PlanTier> {
  // This is a placeholder - in reality, you'd get this from your auth system
  // For now, we'll assume FREE tier to demonstrate the blocking
  const tierHeader = request.headers.get('x-user-tier');
  return (tierHeader?.toUpperCase() as PlanTier) || 'FREE';
}

/**
 * Industry dashboard access middleware
 */
export async function industryDashboardMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only apply to industry dashboard routes
  if (!isIndustryDashboardRoute(pathname)) {
    return NextResponse.next();
  }

  // Get user's current tier
  const userTier = await getUserTier(request);
  
  // Check if user can access industry dashboards
  const hasAccess = canAccessIndustryDashboards(userTier);
  
  if (!hasAccess) {
    // Redirect to main dashboard with upgrade prompt
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.set('upgrade_required', 'true');
    url.searchParams.set('blocked_route', pathname);
    
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Helper function to create industry dashboard route protection
 */
export function requireIndustryDashboardAccess() {
  return async (request: NextRequest) => {
    return industryDashboardMiddleware(request);
  };
}

/**
 * Route configuration for middleware
 */
export const industryDashboardConfig = {
  matcher: [
    '/dashboard/:industry*',
  ],
};