/**
 * GET /api/dashboard/industry-engine
 * Fetches real-time data from industry engines based on merchant's industry
 */

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { INDUSTRY_CONFIG } from "@/config/industry";
import type { IndustrySlug } from "@/lib/templates/types";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      // Get store industry
      const prisma = (await import("@/lib/db")).prisma;
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { industrySlug: true },
      });

      const industrySlug = (store?.industrySlug || "retail") as IndustrySlug;
      const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;

      // Dynamically import industry engine
      let engineData: any = {};
      
      try {
        // Map industry slug to package name
        const packageMap: Record<string, string> = {
          automotive: '@vayva/industry-automotive',
          grocery: '@vayva/industry-grocery',
          events: '@vayva/industry-events',
          wholesale: '@vayva/industry-wholesale',
          nightlife: '@vayva/industry-nightlife',
          nonprofit: '@vayva/industry-nonprofit',
          petcare: '@vayva/industry-petcare',
          realestate: '@vayva/industry-realestate',
          travel: '@vayva/industry-travel',
          saas: '@vayva/industry-saas',
          specialized: '@vayva/industry-specialized',
          services: '@vayva/industry-services',
          blogmedia: '@vayva/industry-blog-media',
        };

        const packageName = packageMap[industrySlug];
        
        if (packageName) {
          const industryModule = await import(packageName);
          
          // Initialize engine if available
          if (industryModule.EventsEngine && industrySlug === 'events') {
            const engine = new industryModule.EventsEngine({});
            await engine.initialize();
            
            // Get statistics from all features
            engineData = {
              hasNativeEngine: true,
              industry: industrySlug,
              features: Object.keys(engine.features || {}),
              // Add specific data based on industry
              ...(industrySlug === 'events' ? {
                timeline: await engine.features?.timeline?.getStats?.(),
                vendors: await engine.features?.vendors?.getStats?.(),
                seating: await engine.features?.seating?.getStats?.(),
                guests: await engine.features?.guests?.getStats?.(),
              } : {}),
            };
          } else {
            // For other industries, check for dashboard exports
            engineData = {
              hasNativeEngine: false,
              industry: industrySlug,
              hasDashboard: !!industryModule[`${industrySlug.charAt(0).toUpperCase()}${industrySlug.slice(1)}Dashboard`],
            };
          }
        }
      } catch (engineError) {
        logger.warn(`[INDUSTRY_ENGINE] Failed to load engine for ${industrySlug}`, { error: engineError });
        engineData = {
          error: 'Engine not available',
          industry: industrySlug,
        };
      }

      return NextResponse.json({
        success: true,
        data: {
          industry: industrySlug,
          displayName: config.displayName,
          engineData,
          features: config.features,
        },
      });
    } catch (error: unknown) {
      logger.error("[INDUSTRY_ENGINE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to load industry engine data" 
        },
        { status: 500 }
      );
    }
  }
);
