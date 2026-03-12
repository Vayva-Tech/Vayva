import { NextRequest, NextResponse } from 'next/server';
import { withRateLimiting, RateLimitPresets } from '@/middleware/rate-limiter';

const XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';

/**
 * GET /api/integrations/xero/oauth
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
 * Step 1: Redirect to Xero for authorization
 */
async function handleAuthorization() {
  const clientId = process.env.XERO_CLIENT_ID;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  const scope = process.env.XERO_SCOPE || 'openid profile email accounting.transactions offline_access';

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Xero credentials not configured' },
      { status: 500 }
    );
  }

  // Generate state and code verifier for PKCE
  const state = generateRandomState();
  const codeVerifier = generateCodeVerifier();

  const authUrl = new URL(XERO_AUTH_URL);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri!);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', await generateCodeChallenge(codeVerifier));
  authUrl.searchParams.append('code_challenge_method', 'S256');

  // Store state and verifier in cookies
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('xero_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  });
  response.cookies.set('xero_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  });

  return response;
}

/**
 * Step 2: Handle OAuth callback from Xero
 */
async function handleCallback(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const storedState = req.cookies.get('xero_oauth_state')?.value;
  const codeVerifier = req.cookies.get('xero_code_verifier')?.value;

  if (!code || !state || !codeVerifier) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  // Validate state
  if (state !== storedState) {
    return NextResponse.json(
      { error: 'Invalid state parameter' },
      { status: 403 }
    );
  }

  try {
    const response = await fetch(XERO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.XERO_REDIRECT_URI!,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const tokens = await response.json();

    // Store tokens in database
    // await prisma.xeroConnection.upsert({
    //   where: { storeId },
    //   update: {
    //     accessToken: tokens.access_token,
    //     refreshToken: tokens.refresh_token,
    //     expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    //   },
    //   create: { ... }
    // });

    const response_redirect = NextResponse.redirect(
      `${process.env.FRONTEND_URL}/dashboard/settings/integrations?connected=xero`
    );
    response_redirect.cookies.delete('xero_oauth_state');
    response_redirect.cookies.delete('xero_code_verifier');

    return response_redirect;
  } catch (error) {
    console.error('Xero OAuth Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Xero' },
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
    const response = await fetch(XERO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
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
 * Disconnect Xero
 */
async function handleDisconnect(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get('storeId');

  if (!storeId) {
    return NextResponse.json(
      { error: 'Store ID required' },
      { status: 400 }
    );
  }

  // In production: revoke tokens and delete connection
  // await prisma.xeroConnection.delete({
  //   where: { storeId: parseInt(storeId) }
  // });

  return NextResponse.json({
    success: true,
    message: 'Xero disconnected successfully',
  });
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

function generateCodeVerifier(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
