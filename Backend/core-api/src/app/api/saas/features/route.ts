import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

interface FeatureFlagData {
  id: string;
  name: string;
  version: string;
  rolloutPercentage: number;
  status: 'stable' | 'monitoring' | 'testing' | 'deprecated';
  enabledTenants: number;
  totalTenants: number;
}

interface FeatureFlagsResponse {
  features: FeatureFlagData[];
  total: number;
  activeReleases: number;
  upcomingReleases: Array<{
    name: string;
    version: string;
    scheduledDate: string;
  }>;
}

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      // Get all tenants to calculate rollout percentages
      const tenants = await prisma.tenant.findMany({
        where: { storeId, status: 'active' },
      });
      const totalTenants = tenants.length;

      // Mock feature flags data (in production, this would come from a feature flag table)
      const features: FeatureFlagData[] = [
        {
          id: '1',
          name: 'AI Dashboard',
          version: 'v2.4',
          rolloutPercentage: 100,
          status: 'stable',
          enabledTenants: totalTenants,
          totalTenants,
        },
        {
          id: '2',
          name: 'Dark Mode',
          version: 'v2.5',
          rolloutPercentage: 45,
          status: 'monitoring',
          enabledTenants: Math.round(totalTenants * 0.45),
          totalTenants,
        },
        {
          id: '3',
          name: 'Beta Analytics',
          version: 'v3.0',
          rolloutPercentage: 5,
          status: 'testing',
          enabledTenants: Math.round(totalTenants * 0.05),
          totalTenants,
        },
      ];

      const response: FeatureFlagsResponse = {
        features,
        total: features.length,
        activeReleases: features.filter(f => f.status === 'stable').length,
        upcomingReleases: [
          {
            name: 'Mobile App v2.6',
            version: 'v2.6',
            scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          },
          {
            name: 'API v3',
            version: 'v3.0',
            scheduledDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
          },
        ],
      };

      return NextResponse.json({ data: response }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[SAAS_FEATURES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch feature flags" },
        { status: 500 }
      );
    }
  }
);
