import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

/**
 * GET /api/events/marketing/performance
 * Returns marketing campaign performance for events
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const eventId = searchParams.get("eventId");

      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Event ID is required" },
          { status: 400 }
        );
      }

      // Get email campaigns
      const emailCampaigns = await prisma.campaign.findMany({
        where: {
          storeId,
          type: "email",
          metadata: {
            path: ["eventId"],
            equals: eventId,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Calculate email metrics
      const emailMetrics = {
        sent: emailCampaigns.reduce((sum, c) => sum + (c.metadata?.sent || 0), 0),
        openRate: emailCampaigns.reduce((sum, c) => sum + (c.metadata?.openRate || 0), 0) / (emailCampaigns.length || 1),
        clickRate: emailCampaigns.reduce((sum, c) => sum + (c.metadata?.clickRate || 0), 0) / (emailCampaigns.length || 1),
        conversionRate: emailCampaigns.reduce((sum, c) => sum + (c.metadata?.conversionRate || 0), 0) / (emailCampaigns.length || 1),
        revenue: emailCampaigns.reduce((sum, c) => sum + (c.metadata?.revenue || 0), 0),
      };

      // Get social media campaigns
      const socialCampaigns = await prisma.campaign.findMany({
        where: {
          storeId,
          type: "social_media",
          metadata: {
            path: ["eventId"],
            equals: eventId,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Calculate social metrics
      const socialMetrics = {
        impressions: socialCampaigns.reduce((sum, c) => sum + (c.metadata?.impressions || 0), 0),
        clicks: socialCampaigns.reduce((sum, c) => sum + (c.metadata?.clicks || 0), 0),
        clickRate: socialCampaigns.reduce((sum, c) => sum + (c.metadata?.clickRate || 0), 0) / (socialCampaigns.length || 1),
        conversionRate: socialCampaigns.reduce((sum, c) => sum + (c.metadata?.conversionRate || 0), 0) / (socialCampaigns.length || 1),
        adSpend: socialCampaigns.reduce((sum, c) => sum + (c.metadata?.adSpend || 0), 0),
        revenue: socialCampaigns.reduce((sum, c) => sum + (c.metadata?.revenue || 0), 0),
      };

      // Get partner promotions
      const partnerPromos = await prisma.campaign.findMany({
        where: {
          storeId,
          type: "partner_promotion",
          metadata: {
            path: ["eventId"],
            equals: eventId,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Calculate partner metrics
      const partnerMetrics = {
        referrals: partnerPromos.reduce((sum, c) => sum + (c.metadata?.referrals || 0), 0),
        ticketsSold: partnerPromos.reduce((sum, c) => sum + (c.metadata?.ticketsSold || 0), 0),
        revenue: partnerPromos.reduce((sum, c) => sum + (c.metadata?.revenue || 0), 0),
      };

      // Calculate total ROI
      const totalAdSpend = socialMetrics.adSpend;
      const totalRevenue = emailMetrics.revenue + socialMetrics.revenue + partnerMetrics.revenue;
      const roi = totalAdSpend > 0 ? ((totalRevenue - totalAdSpend) / totalAdSpend) * 100 : 0;

      return NextResponse.json({
        success: true,
        data: {
          email: {
            campaigns: emailCampaigns.map((c) => ({
              id: c.id,
              name: c.name,
              sent: c.metadata?.sent || 0,
              openRate: c.metadata?.openRate || 0,
              clickRate: c.metadata?.clickRate || 0,
              conversionRate: c.metadata?.conversionRate || 0,
              revenue: c.metadata?.revenue || 0,
              status: c.status,
              sentAt: c.scheduledAt || c.createdAt,
            })),
            summary: emailMetrics,
          },
          socialMedia: {
            campaigns: socialCampaigns.map((c) => ({
              id: c.id,
              name: c.name,
              platform: c.metadata?.platform || "mixed",
              impressions: c.metadata?.impressions || 0,
              clicks: c.metadata?.clicks || 0,
              clickRate: c.metadata?.clickRate || 0,
              conversionRate: c.metadata?.conversionRate || 0,
              adSpend: c.metadata?.adSpend || 0,
              revenue: c.metadata?.revenue || 0,
              status: c.status,
            })),
            summary: socialMetrics,
          },
          partnerPromotions: {
            campaigns: partnerPromos.map((c) => ({
              id: c.id,
              name: c.name,
              partnerName: c.metadata?.partnerName,
              referrals: c.metadata?.referrals || 0,
              ticketsSold: c.metadata?.ticketsSold || 0,
              revenue: c.metadata?.revenue || 0,
              commission: c.metadata?.commission || 0,
              status: c.status,
            })),
            summary: partnerMetrics,
          },
          roiSummary: {
            totalAdSpend,
            totalRevenue,
            roi: parseFloat(roi.toFixed(1)),
            profitable: roi > 0,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching marketing performance:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch marketing performance" },
        { status: 500 }
      );
    }
  }
);
