import { NextRequest, NextResponse } from 'next/server';
import { withRateLimiting, RateLimitPresets } from '@/middleware/rate-limiter';

const QUICKBOOKS_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QUICKBOOKS_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

/**
 * GET /api/integrations/quickbooks/oauth
 * Rate limited OAuth endpoint
 */
export const GET = withRateLimiting(
  async function handler(req: NextRequest) {
    const action = req.nextUrl.searchParams.get('action');

  if (action === 'authorize') {
    return handleAuthorization();
  } else if (action === 'callback') {
    return handleCallback(req);
  } else if (action === 'refresh') {
    return handleRefreshToken(req);
  } else if (action === 'disconnect') {
    return handleDisconnect(req);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  },
  RateLimitPresets.oauth
);

/**
 * Step 1: Redirect to QuickBooks for authorization
 */
function handleAuthorization() {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
  const scope = process.env.QUICKBOOKS_SCOPE || 'com.intuit.quickbooks.accounting';

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'QuickBooks credentials not configured' },
      { status: 500 }
    );
  }

  // Generate state parameter for CSRF protection
  const state = generateRandomState();

  const authUrl = new URL(QUICKBOOKS_AUTH_URL);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri!);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', state);

  // Store state in cookie for validation later
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('qb_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}

/**
 * Step 2: Handle OAuth callback from QuickBooks
 */
async function handleCallback(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const storedState = req.cookies.get('qb_oauth_state')?.value;

  if (!code || !state) {
    return NextResponse.json(
      { error: 'Missing code or state' },
      { status: 400 }
    );
  }

  // Validate state to prevent CSRF
  if (state !== storedState) {
    return NextResponse.json(
      { error: 'Invalid state parameter' },
      { status: 403 }
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(QUICKBOOKS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.QUICKBOOKS_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokens = await tokenResponse.json();

    // Store tokens in database (this would be done via Prisma in production)
    // await prisma.quickBooksConnection.upsert({
    //   where: { storeId },
    //   update: {
    //     accessToken: tokens.access_token,
    //     refreshToken: tokens.refresh_token,
    //     expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    //   },
    //   create: { ... }
    // });

    // Clear the state cookie
    const response = NextResponse.redirect(
      `${process.env.FRONTEND_URL}/dashboard/settings/integrations?connected=quickbooks`
    );
    response.cookies.delete('qb_oauth_state');

    return response;
  } catch (error) {
    console.error('QuickBooks OAuth Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to QuickBooks' },
      { status: 500 }
    );
  }
}

/**
 * Refresh access token
 */
async function handleRefreshToken(req: NextRequest) {
  const refreshToken = req.nextUrl.searchParams.get('refresh_token');

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Refresh token required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(QUICKBOOKS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        accessToken: tokens.access_token,
        expiresIn: tokens.expires_in,
      },
    });
  } catch (error) {
    console.error('Token Refresh Error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

/**
 * Disconnect QuickBooks
 */
async function handleDisconnect(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get('storeId');

  if (!storeId) {
    return NextResponse.json(
      { error: 'Store ID required' },
      { status: 400 }
    );
  }

  // In production: revoke tokens and delete connection from database
  // await prisma.quickBooksConnection.delete({
  //   where: { storeId: parseInt(storeId) }
  // });

  return NextResponse.json({
    success: true,
    message: 'QuickBooks disconnected successfully',
  });
}

/**
 * Generate random state string for OAuth security
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
