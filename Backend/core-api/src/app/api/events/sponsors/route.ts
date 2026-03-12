import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

/**
 * GET /api/events/sponsors
 * List sponsors by event
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

      // Get all sponsors for this event
      const sponsors = await prisma.product.findMany({
        where: {
          storeId,
          type: "sponsorship",
          metadata: {
            path: ["eventId"],
            equals: eventId,
          },
        },
        orderBy: { price: "desc" },
        include: {
          lineItems: {
            select: {
              productName: true,
              metadata: true,
            },
            take: 1,
          },
        },
      });

      // Categorize by tier
      const platinum = sponsors.filter((s) => s.metadata?.tier === "platinum");
      const gold = sponsors.filter((s) => s.metadata?.tier === "gold");
      const bronze = sponsors.filter((s) => s.metadata?.tier === "bronze");

      // Calculate total sponsorship value
      const totalValue = sponsors.reduce((sum, s) => sum + (s.price || 0), 0);

      // Format sponsors
      const formatSponsor = (sponsor: any) => ({
        id: sponsor.id,
        name: sponsor.name,
        tier: sponsor.metadata?.tier || "standard",
        boothNumber: sponsor.metadata?.boothNumber,
        benefits: sponsor.metadata?.benefits || [],
        contactEmail: sponsor.metadata?.contactEmail,
        contactPhone: sponsor.metadata?.contactPhone,
        logoUrl: sponsor.images?.[0]?.url,
        deliverables: sponsor.metadata?.deliverables || [],
        description: sponsor.description,
        price: sponsor.price,
      });

      return NextResponse.json({
        success: true,
        data: {
          totalSponsors: sponsors.length,
          totalValue,
          byTier: {
            platinum: platinum.map(formatSponsor),
            gold: gold.map(formatSponsor),
            bronze: bronze.map(formatSponsor),
          },
          allSponsors: sponsors.map(formatSponsor),
        },
      });
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch sponsors" },
        { status: 500 }
      );
    }
  }
);
