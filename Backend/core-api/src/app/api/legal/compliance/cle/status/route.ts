import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/with-vayva-api";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/legal/compliance/cle/status
 * Get CLE credit status for attorneys
 */
export const GET = withVayvaAPI(
  PERMISSIONS.LEGAL_DASHBOARD_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      const searchParams = request.nextUrl.searchParams;
      const attorneyId = searchParams.get("attorneyId");

      // Fetch CLE credits
      const whereClause: any = { storeId };
      if (attorneyId) {
        whereClause.attorneyId = attorneyId;
      }

      const credits = await prisma.cleCredit.findMany({
        where: whereClause,
        orderBy: { completionDate: "desc" },
      });

      // Calculate totals
      const totalCredits = credits.reduce((sum, credit) => sum + credit.creditHours, 0);
      const ethicsCredits = credits.reduce(
        (sum, credit) => sum + (credit.ethicsCredits || 0),
        0
      );

      // Group by reporting period
      const byPeriod = credits.reduce((acc, credit) => {
        const period = credit.reportingPeriod || "Unknown";
        if (!acc[period]) {
          acc[period] = { total: 0, ethics: 0, courses: [] };
        }
        acc[period].total += credit.creditHours;
        acc[period].ethics += credit.ethicsCredits || 0;
        acc[period].courses.push(credit);
        return acc;
      }, {} as any);

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalCredits,
            ethicsCredits,
            totalCourses: credits.length,
          },
          byPeriod,
          credits,
        },
      });
    } catch (error) {
      console.error("Error fetching CLE status:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch CLE status" },
        { status: 500 }
      );
    }
  }
);
