// ============================================================================
// Nonprofit Donations API Routes
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { z } from "zod";

const recurringDonationSchema = z.object({
  donorId: z.string(),
  amount: z.number().positive(),
  frequency: z.enum(["monthly", "quarterly", "annually"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  paymentMethodId: z.string()
});

interface RouteParams {
  params: Promise<{
    id?: string;
  }>;
}

/**
 * GET /api/donations/recurring
 * Get recurring donations list
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data for recurring donations
    const recurringDonations = [
      {
        id: "rec-1",
        donorId: "donor-1",
        donorName: "Johnson Family",
        amount: 500,
        frequency: "monthly",
        startDate: "2026-01-01T00:00:00Z",
        nextPaymentDate: "2026-04-01T00:00:00Z",
        status: "active",
        totalGiven: 1500
      },
      {
        id: "rec-2",
        donorId: "donor-2",
        donorName: "Smith Foundation",
        amount: 2500,
        frequency: "quarterly",
        startDate: "2026-02-01T00:00:00Z",
        nextPaymentDate: "2026-05-01T00:00:00Z",
        status: "active",
        totalGiven: 7500
      }
    ];

    return NextResponse.json({
      success: true,
      data: recurringDonations,
      count: recurringDonations.length
    });
  } catch (error) {
    console.error("Error fetching recurring donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring donations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/donations/recurring
 * Create recurring donation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = recurringDonationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.format() },
        { status: 400 }
      );
    }

    // Mock successful creation
    const newRecurringDonation = {
      id: `rec-${Date.now()}`,
      ...result.data,
      status: "active",
      createdAt: new Date().toISOString(),
      totalGiven: 0
    };

    return NextResponse.json({
      success: true,
      data: newRecurringDonation
    });
  } catch (error) {
    console.error("Error creating recurring donation:", error);
    return NextResponse.json(
      { error: "Failed to create recurring donation" },
      { status: 500 }
    );
  }
}