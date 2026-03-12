/**
 * SAML Login Initiation
 * POST /api/auth/saml/login
 *
 * Initiates SAML authentication flow
 * Redirects user to Identity Provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthRequest, samlSsoProvider } from '@vayva/security';

/**
 * GET /api/auth/saml/login
 * List available IdPs for SSO login
 */
export async function GET(_request: NextRequest) {
  const idps = await samlSsoProvider.listIdentityProviders();
  return NextResponse.json({
    idps: idps.map((idp) => ({
      id: idp.id,
      name: idp.name,
      entityId: idp.entityId,
    })),
  });
}

/**
 * POST /api/auth/saml/login
 * Initiate SAML auth - redirects to IdP SSO URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      idpId: string;
      redirectUrl?: string;
    };

    if (!body.idpId) {
      return NextResponse.json({ error: 'idpId is required' }, { status: 400 });
    }

    // Create auth request
    const authRequest = await createAuthRequest(
      body.idpId,
      body.redirectUrl || '/dashboard'
    );

    // Return the SSO redirect URL
    return NextResponse.json({
      redirectUrl: authRequest.samlRequest,
      requestId: authRequest.id,
    });
  } catch (error) {
    console.error('[SAML] Login initiation failed:', error);
    return NextResponse.json(
      { error: 'Failed to initiate SSO login' },
      { status: 500 }
    );
  }
}
