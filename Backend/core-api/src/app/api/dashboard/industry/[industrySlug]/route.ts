// ============================================================================
// Unified Industry Dashboard API Endpoint
// ============================================================================
// GET /api/dashboard/industry/{slug} - Fetches dashboard data for any industry
// Automatically routes to correct industry-specific endpoint
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";

/**
 * GET /api/dashboard/industry/[industrySlug]
 * 
 * Routes to appropriate industry dashboard endpoint based on slug
 * Supports all 22+ industries with fallback behavior
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId, params }: APIContext) => {
    const requestId = correlationId;
    const industrySlug = params.industrySlug as string;

    try {
      // Route to industry-specific endpoint
      switch (industrySlug) {
        // Tier 1 Industries (Implemented)
        case 'retail':
        case 'fashion':
        case 'electronics':
        case 'grocery':
        case 'one_product':
          return forwardToIndustryEndpoint('retail', req, requestId);

        case 'food':
        case 'restaurant':
          return forwardToIndustryEndpoint('restaurant', req, requestId);

        case 'services':
        case 'real_estate':
          return forwardToIndustryEndpoint('services', req, requestId);

        // Tier 2 & 3 Industries (Will be implemented)
        case 'events':
          return forwardToIndustryEndpoint('events', req, requestId);

        case 'automotive':
          return forwardToIndustryEndpoint('automotive', req, requestId);

        case 'travel_hospitality':
          return forwardToIndustryEndpoint('travel', req, requestId);

        case 'education':
          return forwardToIndustryEndpoint('education', req, requestId);

        case 'nonprofit':
          return forwardToIndustryEndpoint('nonprofit', req, requestId);

        case 'saas':
          return forwardToIndustryEndpoint('saas', req, requestId);

        case 'healthcare':
          return forwardToIndustryEndpoint('healthcare', req, requestId);

        // Default: Use universal dashboard
        default:
          return getUniversalDashboard(storeId, industrySlug, requestId);
      }
    } catch (error) {
      console.error(`Dashboard router error for ${industrySlug}:`, error);
      return NextResponse.json(
        { 
          error: "Failed to load dashboard",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

/**
 * Forward request to industry-specific endpoint
 */
async function forwardToIndustryEndpoint(
  industry: string,
  req: NextRequest,
  requestId: string
) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = new URLSearchParams();
    
    searchParams.forEach((value, key) => {
      queryParams.set(key, value);
    });

    // Construct industry endpoint URL
    const industryUrl = new URL(
      `/api/${industry}/dashboard?${queryParams.toString()}`,
      req.url
    );

    // Forward the request
    const response = await fetch(industryUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Industry endpoint returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: standardHeaders(requestId),
    });
  } catch (error) {
    console.error(`Error forwarding to ${industry} endpoint:`, error);
    throw error;
  }
}

/**
 * Get universal dashboard for industries without dedicated endpoints
 */
async function getUniversalDashboard(
  storeId: string,
  industrySlug: string,
  requestId: string
) {
  // For now, return a basic structure
  // In production, this would call the UniversalProDashboard API
  return NextResponse.json(
    {
      success: true,
      data: {
        config: {
          industry: industrySlug,
          title: `${industrySlug.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Dashboard`,
          primaryObjectLabel: "Business Object",
        },
        metrics: {
          revenue: 0,
          orders: 0,
          customers: 0,
          conversionRate: 0,
        },
        message: "Using universal dashboard - industry-specific dashboard coming soon",
      },
    },
    { status: 200, headers: standardHeaders(requestId) },
  );
}
