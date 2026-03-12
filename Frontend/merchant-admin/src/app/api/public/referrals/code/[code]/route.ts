/**
 * Public Referral Code Lookup API Route
 * GET /api/public/referrals/code/:code - Get referral code info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReferralService } from '@/services/referral';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getRequestId } from '@/lib/request-id';
import { standardHeaders } from '@vayva/shared';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const requestId = await getRequestId();
  
  try {
    // Rate limit: 30 lookups per minute per IP
    const ip = request.headers?.get('x-forwarded-for') ?? 'unknown';
    const rateLimit = await checkRateLimit(`ref_lookup_${ip}`, 'api_public');
    if (rateLimit && !rateLimit.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429, headers: standardHeaders(requestId) }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const { prisma } = await import('@vayva/db');
    const referralCode = await prisma.referralCode?.findUnique({
      where: { code },
    });

    if (!referralCode || !referralCode.isActive) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Check if code has expired
    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Referral code has expired' },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Fetch program and customer separately
    const program = await prisma.referralProgram?.findUnique({
      where: { id: referralCode.programId },
    });
    if (!program || !program.isActive) {
      return NextResponse.json(
        { error: 'Referral program is not active' },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const customer = await prisma.customer?.findUnique({
      where: { id: referralCode.customerId },
      select: { firstName: true, lastName: true },
    });

    return NextResponse.json({
      code: {
        id: referralCode.id,
        code: referralCode.code,
        referrerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Someone',
        rewardType: program.rewardType,
        referrerReward: program.referrerReward,
        referredReward: program.referredReward,
        terms: program.terms,
      },
    }, { status: 200, headers: standardHeaders(requestId) });
  } catch (error) {
    logger.error('[PUBLIC_REFERRAL_CODE_GET] Failed to fetch referral code', { code, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}
