/**
 * Public Referral Tracking API Routes
 * POST /api/public/referrals/track-click - Track referral link click
 * POST /api/public/referrals/track-signup - Track referral signup
 * GET /api/public/referrals/code/:code - Get referral code info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReferralService } from '@/services/referral';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getRequestId } from '@/lib/request-id';
import { standardHeaders } from '@vayva/shared';
import { logger } from '@/lib/logger';

const trackClickSchema = z.object({
  code: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const requestId = await getRequestId();
  
  try {
    // Rate limit: 10 clicks per minute per IP
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimit = await checkRateLimit(`ref_click_${ip}`, 'api_public');
    if (rateLimit && !rateLimit.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429, headers: standardHeaders(requestId) }
      );
    }

    const body = await request.json();
    const validated = trackClickSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const service = getReferralService();
    await service.trackReferralClick(validated.data.code);

    return NextResponse.json(
      { success: true },
      { status: 200, headers: standardHeaders(requestId) }
    );
  } catch (error) {
    logger.error('[PUBLIC_REFERRAL_TRACK_CLICK] Failed to track referral click', { error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}
