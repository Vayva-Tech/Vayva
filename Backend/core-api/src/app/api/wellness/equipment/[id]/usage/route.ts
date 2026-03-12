import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify equipment exists
    const equipment = await prisma.wellnessEquipment.findFirst({
      where: { id, storeId },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get usage statistics
    const usageStats = await prisma.wellnessSession.findMany({
      where: {
        storeId,
        startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
      include: {
        _count: { select: { attendance: true } },
      },
    });

    // Mock usage data (would integrate with actual usage tracking)
    const mockUsage = [
      { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), usageCount: 12, hoursUsed: 8 },
      { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), usageCount: 15, hoursUsed: 10 },
      { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), usageCount: 18, hoursUsed: 12 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), usageCount: 14, hoursUsed: 9 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), usageCount: 16, hoursUsed: 11 },
      { date: new Date(), usageCount: 8, hoursUsed: 5 },
    ];

    // Calculate usage metrics
    const totalUses = mockUsage.reduce((sum, day) => sum + day.usageCount, 0);
    const totalHours = mockUsage.reduce((sum, day) => sum + day.hoursUsed, 0);
    const averageDailyUses = Math.round(totalUses / mockUsage.length * 100) / 100;
    const averageHoursPerUse = totalUses > 0 ? Math.round(totalHours / totalUses * 100) / 100 : 0;

    return NextResponse.json(
      {
        data: {
          equipmentId: id,
          equipmentName: equipment.name,
          usageStatistics: {
            period: "last_30_days",
            totalUses,
            totalHours,
            averageDailyUses,
            averageHoursPerUse,
            peakUsageDay: mockUsage.reduce((max, day) => day.usageCount > max.usageCount ? day : max, mockUsage[0]),
          },
          dailyUsage: mockUsage.map(day => ({
            date: day.date.toISOString().split('T')[0],
            usageCount: day.usageCount,
            hoursUsed: day.hoursUsed,
          })),
          recommendations: this.generateUsageRecommendations(totalUses, equipment.condition, equipment.status),
        },
      },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WELLNESS_EQUIPMENT_USAGE_GET]", { error, equipmentId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch equipment usage" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

// Generate usage-based recommendations
function generateUsageRecommendations(totalUses: number, condition: string, status: string): string[] {
  const recommendations: string[] = [];
  
  if (totalUses < 10) {
    recommendations.push("Low usage detected - consider promoting this equipment or relocating to higher traffic area");
  } else if (totalUses > 50) {
    recommendations.push("High usage - may require more frequent maintenance or consider upgrading");
  }
  
  if (condition === "poor") {
    recommendations.push("Equipment in poor condition with moderate usage - prioritize maintenance or replacement");
  }
  
  if (status === "maintenance") {
    recommendations.push("Currently in maintenance - monitor usage drop during this period");
  }
  
  recommendations.push("Track usage patterns to optimize scheduling and maintenance");
  recommendations.push("Compare usage across similar equipment to identify preferences");
  
  return recommendations;
}