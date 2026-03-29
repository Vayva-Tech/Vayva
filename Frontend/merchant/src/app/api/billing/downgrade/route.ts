import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { TIER_LIMITS, type PlanTier } from "@/lib/access-control/tier-limits";

interface UsageData {
  products: number;
  orders: number;
  customers: number;
  teamMembers: number;
  staffSeats: number;
}

interface DowngradeValidationResult {
  canDowngrade: boolean;
  violations: Array<{
    feature: string;
    current: number;
    limit: number;
    message: string;
  }>;
  warnings: Array<{
    feature: string;
    message: string;
  }>;
}

// GET /api/billing/downgrade - Get downgrade options and validate eligibility
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch current subscription and usage
    const subscriptionResult = await apiJson<{
      success: boolean;
      data?: {
        currentPlan: string;
        usage: {
          products: number;
          orders: number;
          customers: number;
          staffSeats: number;
        };
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/billing/subscription`, {
      headers: auth.headers,
    });

    if (!subscriptionResult.success || !subscriptionResult.data) {
      return NextResponse.json(
        { error: subscriptionResult.error || "Failed to fetch subscription" },
        { status: 400 }
      );
    }

    const { currentPlan, usage } = subscriptionResult.data;
    
    // Convert current plan to tier
    const currentTier = currentPlan.toUpperCase().replace(/\+/g, "_PLUS") as PlanTier;
    
    // Get available downgrade options
    const availablePlans = ["STARTER", "PRO"];
    const downgrades = availablePlans
      .filter(plan => {
        const planOrder = { STARTER: 0, PRO: 1, PRO_PLUS: 2 };
        return planOrder[plan as PlanTier] < planOrder[currentTier];
      })
      .map(plan => ({
        plan,
        limits: TIER_LIMITS[plan as PlanTier],
      }));

    return NextResponse.json({
      success: true,
      data: {
        currentPlan,
        currentUsage: usage,
        downgradeOptions: downgrades,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/billing/downgrade",
      operation: "GET_DOWNGRADE_OPTIONS",
    });
    return NextResponse.json(
      { error: "Failed to fetch downgrade options" },
      { status: 500 },
    );
  }
}

// POST /api/billing/downgrade - Initiate downgrade with validation
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetPlan, effectiveDate } = body;

    if (!targetPlan || !["STARTER", "PRO"].includes(targetPlan)) {
      return NextResponse.json(
        { error: "Invalid target plan" },
        { status: 400 }
      );
    }

    // Step 1: Fetch current usage
    const subscriptionResult = await apiJson<{
      success: boolean;
      data?: {
        currentPlan: string;
        usage: UsageData;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/billing/subscription`, {
      headers: auth.headers,
    });

    if (!subscriptionResult.success || !subscriptionResult.data) {
      return NextResponse.json(
        { error: subscriptionResult.error || "Failed to fetch subscription" },
        { status: 400 }
      );
    }

    const { currentPlan, usage } = subscriptionResult.data;
    const targetTier = targetPlan.toUpperCase() as PlanTier;
    const limits = TIER_LIMITS[targetTier];

    // Step 2: Validate usage against new tier limits
    const validation: DowngradeValidationResult = {
      canDowngrade: true,
      violations: [],
      warnings: [],
    };

    // Check products limit
    if (limits.products.maxItems && typeof limits.products.maxItems === "number") {
      if (usage.products > limits.products.maxItems) {
        validation.violations.push({
          feature: "Products",
          current: usage.products,
          limit: limits.products.maxItems,
          message: `You have ${usage.products} products but ${targetPlan} allows only ${limits.products.maxItems}. Please remove ${usage.products - limits.products.maxItems} products.`,
        });
        validation.canDowngrade = false;
      } else if (usage.products > limits.products.maxItems * 0.8) {
        validation.warnings.push({
          feature: "Products",
          message: `You're using ${Math.round((usage.products / limits.products.maxItems!) * 100)}% of your product allowance on ${targetPlan}`,
        });
      }
    }

    // Check orders limit
    if (limits.orders.maxItems && typeof limits.orders.maxItems === "number") {
      if (usage.orders > limits.orders.maxItems) {
        validation.violations.push({
          feature: "Monthly Orders",
          current: usage.orders,
          limit: limits.orders.maxItems,
          message: `You've processed ${usage.orders} orders this month but ${targetPlan} allows only ${limits.orders.maxItems}. Wait until next billing cycle or upgrade temporarily.`,
        });
        validation.canDowngrade = false;
      }
    }

    // Check customers limit
    if (limits.customers.maxItems && typeof limits.customers.maxItems === "number") {
      if (usage.customers > limits.customers.maxItems) {
        validation.violations.push({
          feature: "Customers",
          current: usage.customers,
          limit: limits.customers.maxItems,
          message: `You have ${usage.customers} customers but ${targetPlan} allows only ${limits.customers.maxItems}. Export customer data before downgrading.`,
        });
        validation.canDowngrade = false;
      }
    }

    // Check team members
    if (limits.teamMembers.maxItems && typeof limits.teamMembers.maxItems === "number") {
      if (usage.teamMembers > limits.teamMembers.maxItems) {
        validation.violations.push({
          feature: "Team Members",
          current: usage.teamMembers,
          limit: limits.teamMembers.maxItems,
          message: `You have ${usage.teamMembers} team members but ${targetPlan} allows only ${limits.teamMembers.maxItems}. Remove team members before downgrading.`,
        });
        validation.canDowngrade = false;
      }
    }

    // Check staff seats
    if (limits.staffSeats.maxItems && typeof limits.staffSeats.maxItems === "number") {
      if (usage.staffSeats > limits.staffSeats.maxItems) {
        validation.violations.push({
          feature: "Staff Seats",
          current: usage.staffSeats,
          limit: limits.staffSeats.maxItems,
          message: `You have ${usage.staffSeats} staff seats but ${targetPlan} allows only ${limits.staffSeats.maxItems}. Remove staff members before downgrading.`,
        });
        validation.canDowngrade = false;
      }
    }

    // If there are violations, return them
    if (!validation.canDowngrade) {
      return NextResponse.json({
        success: false,
        error: "Cannot downgrade due to usage limits exceeded",
        validation,
        requiresAction: true,
      }, { status: 400 });
    }

    // Step 3: Check for feature loss warnings
    const currentTier = currentPlan.toUpperCase().replace(/\+/g, "_PLUS") as PlanTier;
    const currentLimits = TIER_LIMITS[currentTier];

    // Check API access loss
    if (currentLimits.apiAccess.enabled && !limits.apiAccess.enabled) {
      validation.warnings.push({
        feature: "API Access",
        message: "You will lose API access. Any integrations using the API will stop working.",
      });
    }

    // Check analytics depth loss
    if (currentLimits.analyticsDepth.maxItems !== limits.analyticsDepth.maxItems) {
      validation.warnings.push({
        feature: "Analytics History",
        message: `Your analytics history will be limited to ${limits.analyticsDepth.maxItems} days instead of ${currentLimits.analyticsDepth.maxItems} days.`,
      });
    }

    // Check custom reports loss
    if (currentLimits.customReports.enabled && !limits.customReports.enabled) {
      validation.warnings.push({
        feature: "Custom Reports",
        message: "You will lose access to custom reports. Saved reports will be archived.",
      });
    }

    // Check advanced analytics loss
    if (currentLimits.advancedAnalytics.enabled && !limits.advancedAnalytics.enabled) {
      validation.warnings.push({
        feature: "Advanced Analytics",
        message: "Advanced analytics features (cohort analysis, retention tracking) will be disabled.",
      });
    }

    // Step 4: Calculate proration (if applicable)
    // This would ideally call the backend to calculate based on billing cycle
    const prorationCredit = 0; // Placeholder - backend will calculate

    // Step 5: Initiate downgrade in backend
    const downgradeResult = await apiJson<{
      success: boolean;
      data?: {
        effectiveDate: string;
        prorationCredit?: number;
        nextBillingDate: string;
        newAmount: number;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/billing/downgrade`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({
        targetPlan,
        effectiveDate: effectiveDate || "next_billing_cycle",
      }),
    });

    if (!downgradeResult.success) {
      return NextResponse.json(
        { error: downgradeResult.error || "Failed to process downgrade" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...downgradeResult.data,
        validation,
        prorationCredit,
      },
      message: `Downgrade to ${targetPlan} scheduled successfully`,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/billing/downgrade",
      operation: "POST_DOWNGRADE",
    });
    return NextResponse.json(
      { error: "Failed to process downgrade" },
      { status: 500 },
    );
  }
}
