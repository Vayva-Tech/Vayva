import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

const calculateSchema = z.object({
  vehiclePrice: z.number().positive(),
  downPayment: z.number().min(0),
  tradeInValue: z.number().min(0).default(0),
  termMonths: z.number().int().min(12).max(84),
  interestRate: z.number().min(0).max(30),
  creditScore: z.number().int().min(300).max(850).optional(),
  includeTaxes: z.boolean().default(true),
  taxRate: z.number().min(0).max(20).default(7.5),
  registrationFee: z.number().min(0).default(500),
});

const createApplicationSchema = z.object({
  vehicleId: z.string().uuid(),
  customerId: z.string().uuid(),
  downPayment: z.number().positive(),
  loanAmount: z.number().positive(),
  termMonths: z.number().int().min(12).max(84),
  employmentStatus: z.enum(["employed", "self_employed", "unemployed", "retired"]),
  annualIncome: z.number().positive().optional(),
  creditScore: z.number().int().min(300).max(850).optional(),
  documents: z.object({
    paystub: z.string().url().optional(),
    id: z.string().url().optional(),
    bankStatement: z.string().url().optional(),
  }).optional(),
});

interface FinancingCalculation {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  loanAmount: number;
  taxesAndFees: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  apr: number;
  termMonths: number;
  creditTier: string;
  approvalProbability: number;
}

/**
 * Calculate financing terms based on credit score
 */
function calculateCreditTier(creditScore?: number): { tier: string; apr: number; approvalProbability: number } {
  if (!creditScore) return { tier: "unknown", apr: 8.99, approvalProbability: 50 };
  if (creditScore >= 750) return { tier: "excellent", apr: 3.99, approvalProbability: 95 };
  if (creditScore >= 700) return { tier: "good", apr: 5.49, approvalProbability: 85 };
  if (creditScore >= 650) return { tier: "fair", apr: 7.99, approvalProbability: 70 };
  if (creditScore >= 600) return { tier: "poor", apr: 12.99, approvalProbability: 45 };
  return { tier: "subprime", apr: 18.99, approvalProbability: 25 };
}

/**
 * POST /api/vehicles/financing/calculate
 * Calculate financing terms and monthly payments
 */
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const body = await req.json();
    const validated = calculateSchema.parse(body);

    const creditTier = calculateCreditTier(validated.creditScore);
    const apr = validated.interestRate || creditTier.apr;

    // Calculate taxes and fees
    const taxAmount = validated.includeTaxes
      ? validated.vehiclePrice * (validated.taxRate / 100)
      : 0;
    const taxesAndFees = taxAmount + validated.registrationFee;

    // Calculate loan amount
    const loanAmount = validated.vehiclePrice - validated.downPayment - validated.tradeInValue + taxesAndFees;

    if (loanAmount <= 0) {
      return NextResponse.json({
        error: "Down payment and trade-in exceed vehicle price",
      }, { status: 400 });
    }

    // Calculate monthly payment using standard amortization formula
    const monthlyRate = apr / 100 / 12;
    const numberOfPayments = validated.termMonths;

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numberOfPayments;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - loanAmount;
    const totalCost = validated.vehiclePrice + taxesAndFees + totalInterest;

    const calculation: FinancingCalculation = {
      vehiclePrice: validated.vehiclePrice,
      downPayment: validated.downPayment,
      tradeInValue: validated.tradeInValue,
      loanAmount,
      taxesAndFees,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      apr,
      termMonths: validated.termMonths,
      creditTier: creditTier.tier,
      approvalProbability: creditTier.approvalProbability,
    };

    // Generate financing options
    const options = [24, 36, 48, 60, 72, 84].map((term) => {
      let monthly: number;
      if (monthlyRate === 0) {
        monthly = loanAmount / term;
      } else {
        monthly =
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
          (Math.pow(1 + monthlyRate, term) - 1);
      }
      const total = monthly * term;
      return {
        termMonths: term,
        monthlyPayment: Math.round(monthly * 100) / 100,
        totalInterest: Math.round((total - loanAmount) * 100) / 100,
        totalCost: Math.round(total * 100) / 100,
      };
    });

    logger.info("[FINANCING_CALCULATE] Calculation completed", { storeId, apr, loanAmount });

    return NextResponse.json({
      calculation,
      options,
      creditInfo: {
        score: validated.creditScore,
        tier: creditTier.tier,
        approvalProbability: creditTier.approvalProbability,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[FINANCING_CALCULATE] Calculation failed", { error, storeId });
    return NextResponse.json(
      { error: "Failed to calculate financing" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/vehicles/financing/apply
 * Submit a financing application
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = createApplicationSchema.parse(body);

    // Check for existing application
    const existing = await prisma.financingApplication?.findFirst({
      where: {
        vehicleId: validated.vehicleId,
        customerId: validated.customerId,
        status: { notIn: ["denied"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Active application already exists for this vehicle" },
        { status: 409 }
      );
    }

    // Calculate approval probability and suggested terms
    const creditTier = calculateCreditTier(validated.creditScore);

    const application = await prisma.financingApplication?.create({
      data: {
        storeId: "", // Will be set by middleware
        vehicleId: validated.vehicleId,
        customerId: validated.customerId,
        downPayment: validated.downPayment,
        loanAmount: validated.loanAmount,
        termMonths: validated.termMonths,
        interestRate: creditTier.apr,
        monthlyPayment: 0, // Calculated after approval
        creditScore: validated.creditScore,
        employmentStatus: validated.employmentStatus,
        annualIncome: validated.annualIncome,
        status: creditTier.approvalProbability >= 70 ? "approved" : "pending",
        approvedBy: creditTier.approvalProbability >= 70 ? "SYSTEM_AUTO" : null,
        approvedAt: creditTier.approvalProbability >= 70 ? new Date() : null,
        documents: validated.documents || {},
      },
    });

    logger.info("[FINANCING_APPLY] Application submitted", {
      applicationId: application.id,
      status: (application as any).status,
    });

    return NextResponse.json({
      application,
      nextSteps: (application as any).status === "approved"
        ? "Visit dealership to complete paperwork"
        : "Application under review - expect response within 24 hours",
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[FINANCING_APPLY] Application failed", { error });
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vehicles/financing/applications
 * List financing applications
 */
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };
    if (status) (where as any).status = status;
    if (customerId) where.customerId = customerId;

    const [applications, total] = await Promise.all([
      prisma.financingApplication?.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.financingApplication?.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + applications.length < total,
      },
    });
  } catch (error: unknown) {
    logger.error("[FINANCING_GET] Failed to fetch applications", { error, storeId });
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
});
