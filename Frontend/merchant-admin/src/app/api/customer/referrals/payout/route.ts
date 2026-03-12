/**
 * Customer Referral Payout API Routes
 * POST /api/customer/referrals/payout - Request a payout
 * GET /api/customer/referrals/payouts - Get customer payout history
 */

import { NextRequest, NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { getReferralService } from '@/services/referral';
import { z } from 'zod';
import { logger } from "@/lib/logger";

const payoutSchema = z.object({
  paymentMethod: z.enum(['wallet', 'bank_transfer']),
});

export const POST = withVayvaAPI(null, async (req: NextRequest, { user }: { user: { id: string; storeId: string } }) => {
  try {
    const body = await req.json();

    const validated = payoutSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error?.format() },
        { status: 400 }
      );
    }

    const service = getReferralService();
    const payout = await service.requestPayout(user.id, user.storeId, validated.data);

    return NextResponse.json({ success: true, payout });
  } catch (error: unknown) {
    logger.error('[CUSTOMER_REFERRAL_PAYOUT_POST] Failed to process payout', { storeId: user.storeId, error });
    if (error instanceof Error && error.message === 'No rewards available for payout') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

export const GET = withVayvaAPI(null, async (req: NextRequest, { user }: { user: { id: string } }) => {
  try {
    const service = getReferralService();
    const payouts = await service.getPayouts(user.id);

    return NextResponse.json({ payouts });
  } catch (error: unknown) {
    logger.error('[CUSTOMER_REFERRAL_PAYOUTS_GET] Failed to fetch payouts', { userId: user.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
