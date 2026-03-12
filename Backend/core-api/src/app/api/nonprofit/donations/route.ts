import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const DonationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "completed", "refunded", "failed"]).optional(),
  donorId: z.string().optional(),
  campaignId: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "paypal", "check", "cash"]).optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const DonationCreateSchema = z.object({
  donorId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "paypal", "check", "cash"]),
  campaignId: z.string().optional(),
  recurring: z.boolean().default(false),
  frequency: z.enum(["weekly", "monthly", "quarterly", "annually"]).optional(),
  notes: z.string().optional(),
  anonymous: z.boolean().default(false),
  taxDeductible: z.boolean().default(true),
  giftAid: z.boolean().default(false),
});

export const GET = withVayvaAPI(
  PERMISSIONS.DONATIONS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = DonationQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, donorId, campaignId, paymentMethod, minAmount, maxAmount, startDate, endDate } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (donorId) where.donorId = donorId;
      if (campaignId) where.campaignId = campaignId;
      if (paymentMethod) where.paymentMethod = paymentMethod;
      if (minAmount !== undefined || maxAmount !== undefined) {
        where.amount = {};
        if (minAmount !== undefined) where.amount.gte = minAmount;
        if (maxAmount !== undefined) where.amount.lte = maxAmount;
      }
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [donations, total] = await Promise.all([
        prisma.nonprofitDonation.findMany({
          where,
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                organization: true,
              },
            },
            campaign: {
              select: {
                id: true,
                name: true,
                goal: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonprofitDonation.count({ where }),
      ]);

      // Calculate summary statistics
      const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
      const averageAmount = donations.length > 0 ? totalAmount / donations.length : 0;
      const recurringCount = donations.filter(d => d.recurring).length;

      return NextResponse.json(
        {
          data: donations,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            summary: {
              totalAmount,
              averageAmount,
              recurringCount,
              currency: donations[0]?.currency || "USD",
            },
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONATIONS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch donations" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.DONATIONS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = DonationCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid donation data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify donor exists
      const donor = await prisma.nonprofitDonor.findFirst({
        where: { id: body.donorId, storeId },
      });

      if (!donor) {
        return NextResponse.json(
          { error: "Donor not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify campaign exists if provided
      if (body.campaignId) {
        const campaign = await prisma.nonprofitCampaign.findFirst({
          where: { id: body.campaignId, storeId },
        });
        
        if (!campaign) {
          return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      // Handle recurring donations
      let recurringDonationId = null;
      if (body.recurring && body.frequency) {
        const recurring = await prisma.nonprofitRecurringDonation.create({
          data: {
            storeId,
            donorId: body.donorId,
            amount: body.amount,
            currency: body.currency,
            frequency: body.frequency,
            paymentMethod: body.paymentMethod,
            status: "active",
            nextPaymentDate: new Date(Date.now() + this.getFrequencyMilliseconds(body.frequency)),
          },
        });
        recurringDonationId = recurring.id;
      }

      const donation = await prisma.nonprofitDonation.create({
        data: {
          storeId,
          donorId: body.donorId,
          amount: body.amount,
          currency: body.currency,
          paymentMethod: body.paymentMethod,
          campaignId: body.campaignId,
          recurring: body.recurring,
          recurringDonationId,
          notes: body.notes,
          anonymous: body.anonymous,
          taxDeductible: body.taxDeductible,
          giftAid: body.giftAid,
          status: "pending",
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              organization: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              goal: true,
            },
          },
        },
      });

      return NextResponse.json(donation, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_DONATIONS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create donation" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Helper method to calculate frequency in milliseconds
function getFrequencyMilliseconds(frequency: string): number {
  const msInDay = 24 * 60 * 60 * 1000;
  switch (frequency) {
    case "weekly": return 7 * msInDay;
    case "monthly": return 30 * msInDay;
    case "quarterly": return 90 * msInDay;
    case "annually": return 365 * msInDay;
    default: return 30 * msInDay;
  }
}