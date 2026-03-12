/**
 * Referral Program API Routes
 * POST /api/merchant/referrals/program - Create/update referral program
 * GET /api/merchant/referrals/program - Get current program
 */

import { NextRequest, NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getReferralService } from '@/services/referral';
import { z } from 'zod';
import { logger } from "@/lib/logger";

const programSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  rewardType: z.enum(['percentage', 'fixed', 'credit']),
  rewardValue: z.number().min(0).max(100),
  referrerReward: z.number().min(0),
  referredReward: z.number().min(0),
  minimumOrder: z.number().min(0).optional(),
  maxRewardsPerUser: z.number().min(0).optional(),
  expirationDays: z.number().min(1).max(365).optional(),
  terms: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

export const POST = withVayvaAPI(PERMISSIONS.SETTINGS_EDIT, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const body = await req.json();

    const validated = programSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error?.format() },
        { status: 400 }
      );
    }

    const service = getReferralService();
    const program = await service.createOrUpdateProgram(storeId, validated.data);

    return NextResponse.json({ success: true, program });
  } catch (error: unknown) {
    logger.error('[REFERRAL_PROGRAM_POST] Failed to create/update program', { storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

export const GET = withVayvaAPI(PERMISSIONS.SETTINGS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const service = getReferralService();
    const program = await service.getProgram(storeId);

    if (!program) {
      return NextResponse.json(
        { error: 'No referral program found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ program });
  } catch (error: unknown) {
    logger.error('[REFERRAL_PROGRAM_GET] Failed to fetch program', { storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
