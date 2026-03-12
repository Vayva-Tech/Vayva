/**
 * Customer Referral Code API Route
 * POST /api/customer/referrals/code - Generate or get referral code
 * GET /api/customer/referrals/dashboard - Get customer referral dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { getReferralService } from '@/services/referral';
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(null, async (req: NextRequest, { user }: { user: { id: string; storeId: string } }) => {
  try {
    const service = getReferralService();
    
    // Get the program for this store
    const program = await service.getProgram(user.storeId);
    if (!program || !program.isActive) {
      return NextResponse.json(
        { error: 'Referral program not available' },
        { status: 404 }
      );
    }

    // Get store slug for generating link
    const { prisma } = await import('@vayva/db');
    const store = await prisma.store?.findUnique({
      where: { id: user.storeId },
      select: { slug: true }
    });
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const code = await service.generateReferralCode(program.id, user.id, store.slug);

    return NextResponse.json({ success: true, code });
  } catch (error: unknown) {
    logger.error('[CUSTOMER_REFERRAL_CODE_POST] Failed to generate referral code', { storeId: user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

export const GET = withVayvaAPI(null, async (req: NextRequest, { user }: { user: { id: string; storeId: string } }) => {
  try {
    const service = getReferralService();
    
    const program = await service.getProgram(user.storeId);
    if (!program) {
      return NextResponse.json(
        { error: 'Referral program not found' },
        { status: 404 }
      );
    }

    const dashboard = await service.getCustomerReferralDashboard(program.id, user.id);

    return NextResponse.json({ dashboard });
  } catch (error: unknown) {
    logger.error('[CUSTOMER_REFERRAL_DASHBOARD_GET] Failed to fetch dashboard', { storeId: user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
