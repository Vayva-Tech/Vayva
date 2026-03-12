// ============================================================================
// Nonprofit Industry Dashboard Data API
// ============================================================================
// GET /api/v1/dashboard/nonprofit/data - Get nonprofit dashboard data
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{
    industry: string;
  }>;
}

/**
 * GET /api/v1/dashboard/:industry/data
 * Get dashboard data for a specific industry
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { industry } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const timeHorizon = searchParams.get("timeHorizon") || "month";

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Validate industry
    if (industry !== "nonprofit") {
      return NextResponse.json(
        { error: "Invalid industry for this endpoint" },
        { status: 400 }
      );
    }

    // Mock data for nonprofit dashboard
    const dashboardData = {
      success: true,
      data: {
        kpis: {
          revenue: 2400000,
          donors: 1847,
          campaigns: 12,
          donor_retention: 76,
          recurring_donations: 42,
          average_gift: 1298,
          major_donors: 87,
          grants_awarded: 890000
        },
        metrics: {
          metrics: {
            revenue: { value: 2400000 },
            donors: { value: 1847 },
            campaigns: { value: 12 },
            donor_retention: { value: 76 }
          }
        },
        overview: {
          statusCounts: {
            active_campaigns: 12,
            pending_grants: 8,
            upcoming_events: 3,
            new_donors: 312
          },
          meetings: [],
          tickets: []
        },
        todosAlerts: {
          todos: [
            {
              id: "1",
              title: "Process matching gifts",
              description: "12 pending matching gift requests",
              priority: "high",
              icon: "Gift"
            },
            {
              id: "2",
              title: "Review grant reports",
              description: "Due April 25th",
              priority: "medium",
              icon: "FileText"
            }
          ],
          alerts: [
            {
              id: "1",
              type: "warning",
              title: "Campaign needs attention",
              message: "Building Renovation campaign at 57% - consider additional outreach"
            }
          ]
        },
        activity: [
          {
            id: "1",
            type: "ORDER",
            date: new Date(),
            time: "2 hours ago",
            message: "New donation received",
            user: "Anonymous Donor"
          }
        ],
        primaryObjects: {
          type: "orders",
          items: [
            {
              id: "1",
              orderNumber: "DON-001",
              title: "Annual Fund 2026",
              status: "completed",
              paymentStatus: "paid",
              total: 5000,
              currency: "USD",
              createdAt: new Date(),
              customer: {
                name: "Johnson Family",
                email: "johnson@example.com",
                phone: "+1234567890"
              }
            }
          ]
        },
        inventoryAlerts: null,
        customerInsights: {
          totals: {
            totalCustomers: 1847,
            newCustomers: 312,
            activeCustomers: 1847,
            returningCustomers: 1408,
            repeatRate: 76
          },
          topCustomers: [
            {
              id: "1",
              name: "Johnson Family",
              email: "johnson@example.com",
              phone: "+1234567890",
              orders: 1,
              spend: 125000
            }
          ]
        },
        earnings: {
          totalSales: 2400000,
          platformFee: 48000,
          netEarnings: 2352000,
          pendingFunds: 0,
          availableFunds: 2352000,
          history: []
        },
        storeInfo: {
          industrySlug: "nonprofit",
          currency: "USD",
          hasBookings: false,
          hasInventory: false,
          plan: "pro",
          isLive: true,
          onboardingCompleted: true
        }
      },
      timestamp: new Date().toISOString(),
      cacheHit: false
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching nonprofit dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}