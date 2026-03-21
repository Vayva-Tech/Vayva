import { NextResponse } from "next/server";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const recurringDonationSchema = z.object({
  donorId: z.string(),
  amount: z.number().positive(),
  frequency: z.enum(["weekly", "monthly", "quarterly", "annually"]),
  startDate: z.string().datetime(),
  campaignId: z.string().optional(),
  paymentMethod: z.enum(["card", "bank", "wallet"]).default("card"),
});

const statusUpdateSchema = z.object({
  status: z.enum(["active", "paused", "cancelled"]),
});

/**
 * GET /api/nonprofit/recurring?storeId=xxx&status=xxx
 * List recurring donations
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const donorId = searchParams.get("donorId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Fetch recurring donations via backend API
    const queryParams = new URLSearchParams({ storeId });
    if (status) queryParams.append('status', status);
    if (donorId) queryParams.append('donorId', donorId);

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/nonprofit/recurring?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch recurring donations');
    }

    const recurring = result.data || [];
    
    // Return with local stats calculation
    return NextResponse.json({ 
      recurring,
      stats: {
        totalRecurring: recurring.length,
        activeCount: recurring.filter((r: any) => r.status === "active").length,
        monthlyValue: recurring
          .filter((r: any) => r.status === "active")
          .reduce((sum: number, r: any) => {
            const amount = Number(r.amount || 0);
            if (r.frequency === "weekly") return sum + (amount * 52 / 12);
            if (r.frequency === "quarterly") return sum + (amount / 3);
            if (r.frequency === "annually") return sum + (amount / 12);
            return sum + amount; // monthly
          }, 0),
      }
    });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/nonprofit/recurring',
        operation: 'FETCH_RECURRING_DONATIONS',
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch recurring donations" },
      { status: 500 }
    );
  }
 }
