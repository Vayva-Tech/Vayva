/**
 * Public Referral Signup Tracking API Route
 * POST /api/public/referrals/track-signup - Track referral signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReferralService } from '@/services/referral';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getRequestId } from '@/lib/request-id';
import { standardHeaders } from '@vayva/shared';
import { logger } from '@/lib/logger';

const trackSignupSchema = z.object({
  code: z.string().min(1),
  newCustomerId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const requestId = await getRequestId();
  
  try {
    // Rate limit: 5 signups per minute per IP
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimit = await checkRateLimit(`ref_signup_${ip}`, 'api_public');
    if (rateLimit && !rateLimit.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429, headers: standardHeaders(requestId) }
      );
    }

    const body = await request.json();
    const validated = trackSignupSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const service = getReferralService();
    const conversion = await service.trackReferralSignup(
      validated.data.code,
      validated.data.newCustomerId
    );

    if (!conversion) {
      return NextResponse.json(
        { error: 'Invalid referral code or referral program requirements not met' },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { success: true, conversion },
      { status: 200, headers: standardHeaders(requestId) }
    );
  } catch (error) {
    logger.error('[PUBLIC_REFERRAL_TRACK_SIGNUP] Failed to track referral signup', { error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}
