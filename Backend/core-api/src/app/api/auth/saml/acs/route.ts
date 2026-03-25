/**
 * SAML Assertion Consumer Service (ACS)
 * POST /api/auth/saml/acs
 *
 * Receives and validates SAML responses from IdP
 * Creates user session and redirects to application
 */

import { NextRequest, NextResponse } from 'next/server';
import { processSamlResponse, roleMappingService } from '@vayva/security';

/**
 * POST /api/auth/saml/acs
 * ACS endpoint - receives SAML assertion from IdP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const samlResponse = body.get('SAMLResponse');
    const relayState = body.get('RelayState');

    if (!samlResponse || typeof samlResponse !== 'string') {
      return NextResponse.json({ error: 'Missing SAMLResponse' }, { status: 400 });
    }

    // Process and validate SAML response
    const { user, redirectUrl, sessionToken } = await processSamlResponse(
      samlResponse,
      relayState && typeof relayState === 'string' ? relayState : undefined
    );

    // Map IdP groups to Vayva roles
    if (user.groups && user.groups.length > 0) {
      // Get idpId from the SAML instance (it's resolved during processSamlResponse)
      // For now we'll do async role mapping after redirect
      await roleMappingService.mapGroupsToRoles(
        user.email, // using email as userId placeholder until session is established
        'default',
        user.groups
      ).catch(() => {
        // Non-critical: role mapping can happen in background
      });
    }

    // Set session cookie and redirect
    const response = NextResponse.redirect(
      new URL(redirectUrl || '/dashboard', request.url)
    );

    response.cookies.set('vayva_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[SAML ACS] Error processing SAML response:', error);

    // Redirect to login with error
    return NextResponse.redirect(
      new URL('/login?error=saml_auth_failed', request.url)
    );
  }
}
