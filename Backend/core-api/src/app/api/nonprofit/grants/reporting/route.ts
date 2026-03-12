import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.GRANTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'year'; // month, quarter, year
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          break;
        case 'year':
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      // Get grant funding data
      const [fundingStats, applicationStats, funderAnalysis] = await Promise.all([
        // Funding received statistics
        prisma.nonprofitGrantApplication.groupBy({
          by: ['status'],
          where: {
            storeId,
            awardedAmount: { gt: 0 },
            updatedAt: { gte: startDate },
          },
          _sum: { awardedAmount: true },
          _count: { id: true },
        }),
        
        // Application statistics
        prisma.nonprofitGrantApplication.groupBy({
          by: ['status'],
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
          _count: { id: true },
        }),
        
        // Top funders analysis
        prisma.nonprofitGrant.groupBy({
          by: ['funder'],
          where: { storeId },
          _count: { id: true },
          _sum: { requestedAmount: true },
          orderBy: { _sum: { requestedAmount: "desc" } },
          take: 10,
        }),
      ]);

      // Calculate key metrics
      const totalRequested = fundingStats.reduce((sum, stat) => sum + (stat._sum.awardedAmount || 0), 0);
      const totalApplications = applicationStats.reduce((sum, stat) => sum + stat._count.id, 0);
      const successfulApplications = applicationStats.find(stat => stat.status === "awarded")?._count.id || 0;
      
      const successRate = totalApplications > 0 
        ? Math.round((successfulApplications / totalApplications) * 10000) / 100
        : 0;

      // Funding pipeline analysis
      const pipelineStats = await prisma.nonprofitGrantApplication.groupBy({
        by: ['status'],
        where: { storeId },
        _count: { id: true },
        _sum: { requestedAmount: true },
      });

      // Timeline data for the selected period
      const timelineData = await this.generateTimelineData(storeId, startDate, now);

      return NextResponse.json(
        {
          data: {
            period,
            overview: {
              totalFundingReceived: totalRequested,
              totalApplications: totalApplications,
              successfulApplications,
              successRate,
              averageAward: successfulApplications > 0 
                ? Math.round(totalRequested / successfulApplications * 100) / 100
                : 0,
            },
            fundingStats: {
              byStatus: fundingStats.map(stat => ({
                status: stat.status,
                count: stat._count.id,
                totalAmount: stat._sum.awardedAmount || 0,
              })),
            },
            applicationStats: {
              byStatus: applicationStats.map(stat => ({
                status: stat.status,
                count: stat._count.id,
              })),
            },
            topFunders: funderAnalysis.map(funder => ({
              name: funder.funder,
              applications: funder._count.id,
              totalRequested: funder._sum.requestedAmount || 0,
              averageRequest: funder._count.id > 0 
                ? Math.round((funder._sum.requestedAmount || 0) / funder._count.id * 100) / 100
                : 0,
            })),
            pipeline: {
              draft: pipelineStats.find(s => s.status === "draft")?._count.id || 0,
              submitted: pipelineStats.find(s => s.status === "submitted")?._count.id || 0,
              underReview: pipelineStats.find(s => s.status === "under_review")?._count.id || 0,
              awarded: pipelineStats.find(s => s.status === "awarded")?._count.id || 0,
              rejected: pipelineStats.find(s => s.status === "rejected")?._count.id || 0,
            },
            timeline: timelineData,
            recommendations: this.generateGrantRecommendations(successRate, totalApplications, funderAnalysis),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_GRANT_REPORTING_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch grant reporting data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Generate monthly timeline data
async function generateTimelineData(storeId: string, startDate: Date, endDate: Date): Promise<any[]> {
  const months: any[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    // In a real implementation, you'd query the database for this month's data
    months.push({
      month: monthStart.toISOString().slice(0, 7), // YYYY-MM
      applicationsSubmitted: Math.floor(Math.random() * 5) + 1,
      applicationsAwarded: Math.floor(Math.random() * 2),
      fundingReceived: Math.floor(Math.random() * 50000) + 10000,
      averageProcessingTime: Math.floor(Math.random() * 30) + 15, // days
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

// Generate personalized recommendations
function generateGrantRecommendations(successRate: number, totalApplications: number, topFunders: any[]): string[] {
  const recommendations: string[] = [];
  
  if (successRate < 30) {
    recommendations.push("Consider improving application quality - success rate below 30%");
    recommendations.push("Review rejected applications for common feedback themes");
  }
  
  if (totalApplications < 5) {
    recommendations.push("Increase grant application volume for better diversification");
    recommendations.push("Research additional funding opportunities");
  }
  
  if (topFunders.length > 0 && topFunders[0].applications > 10) {
    recommendations.push(`Strong relationship with ${topFunders[0].name} - consider deepening partnership`);
  }
  
  recommendations.push("Maintain regular communication with funded partners");
  recommendations.push("Track application deadlines in centralized calendar");
  
  return recommendations;
}