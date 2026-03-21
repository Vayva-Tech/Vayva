/**
 * Public Referral Signup Tracking API Route
 * POST /api/public/referrals/track-signup - Track referral signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getRequestId } from '@/lib/request-id';
import { standardHeaders } from '@vayva/shared';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

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

    // Track referral signup via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/public/referrals/track-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated.data),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to track referral signup');
    }

    return NextResponse.json(
      { success: true, ...result.data },
      { status: 200, headers: standardHeaders(requestId) }
    );
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/public/referrals/track-signup',
        operation: 'TRACK_REFERRAL_SIGNUP',
      }
    );
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}
