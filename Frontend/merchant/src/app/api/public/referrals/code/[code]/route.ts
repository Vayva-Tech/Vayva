// @ts-nocheck
/**
 * Public Referral Code Lookup API Route
 * GET /api/public/referrals/code/:code - Get referral code info
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getRequestId } from '@/lib/request-id';
import { standardHeaders } from '@vayva/shared';

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

    // Fetch referral code via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/public/referrals/code/${code}`);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Referral code not found' },
        { status: result.data ? 200 : 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(result.data || null, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/public/referrals/code/:code", operation: "GET_REFERRAL_CODE" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}
