/**
 * SAML SSO API Routes
 *
 * GET  /api/auth/saml/metadata     - SP metadata XML
 * GET  /api/auth/saml/idps         - List configured IdPs
 * POST /api/auth/saml/idps         - Register new IdP
 * GET  /api/auth/saml/idps/[id]    - Get IdP details
 * PUT  /api/auth/saml/idps/[id]    - Update IdP
 * DELETE /api/auth/saml/idps/[id]  - Deactivate IdP
 * POST /api/auth/saml/login        - Initiate SAML auth (redirect)
 * POST /api/auth/saml/acs          - Assertion Consumer Service (callback)
 * POST /api/auth/saml/slo          - Single Logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { samlSsoProvider } from '@vayva/security';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/saml/metadata
 * Returns Service Provider metadata XML for IdP configuration
 */
export async function GET(_request: NextRequest) {
  const metadata = samlSsoProvider.getServiceProviderMetadata();

  return new NextResponse(metadata, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

/**
 * POST /api/auth/saml/metadata
 * Register a new Identity Provider from metadata URL or XML
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      name: string;
      metadataUrl?: string;
      entityId?: string;
      ssoUrl?: string;
      sloUrl?: string;
      certificate?: string;
    };

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // If metadataUrl provided, fetch metadata
    let idpConfig: {
      name: string;
      entityId: string;
      ssoUrl: string;
      sloUrl?: string;
      certificate: string;
      metadataUrl?: string;
    };

    if (body.metadataUrl) {
      // Parse metadata from URL
      const metadataResp = await fetch(body.metadataUrl);
      const metadataXml = await metadataResp.text();
      idpConfig = parseIdpMetadata(metadataXml, body.name, body.metadataUrl);
    } else {
      if (!body.entityId || !body.ssoUrl || !body.certificate) {
        return NextResponse.json(
          { error: 'entityId, ssoUrl, and certificate are required when metadataUrl is not provided' },
          { status: 400 }
        );
      }
      idpConfig = {
        name: body.name,
        entityId: body.entityId,
        ssoUrl: body.ssoUrl,
        sloUrl: body.sloUrl,
        certificate: body.certificate,
      };
    }

    const idp = await samlSsoProvider.registerIdentityProvider(idpConfig);

    return NextResponse.json({ idp }, { status: 201 });
  } catch (error) {
    console.error('[SAML] Failed to register IdP:', error);
    return NextResponse.json(
      { error: 'Failed to register Identity Provider' },
      { status: 500 }
    );
  }
}

/**
 * Parse IdP metadata XML to extract SSO configuration
 */
function parseIdpMetadata(xml: string, name: string, metadataUrl: string): {
  name: string;
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  metadataUrl: string;
} {
  // Extract entityID
  const entityIdMatch = xml.match(/entityID="([^"]+)"/);
  const entityId = entityIdMatch?.[1] || '';

  // Extract SSO URL (HTTP-Redirect binding)
  const ssoMatch = xml.match(
    /SingleSignOnService[^/]*Binding="[^"]*HTTP-Redirect"[^/]*Location="([^"]+)"/
  );
  const ssoUrl = ssoMatch?.[1] || '';

  // Extract SLO URL
  const sloMatch = xml.match(
    /SingleLogoutService[^/]*Binding="[^"]*HTTP-Redirect"[^/]*Location="([^"]+)"/
  );
  const sloUrl = sloMatch?.[1];

  // Extract certificate
  const certMatch = xml.match(/<ds:X509Certificate[^>]*>([^<]+)<\/ds:X509Certificate>/);
  const certificate = certMatch?.[1]?.replace(/\s/g, '') || '';

  if (!entityId || !ssoUrl || !certificate) {
    throw new Error('Invalid IdP metadata: missing required fields');
  }

  return { name, entityId, ssoUrl, sloUrl, certificate, metadataUrl };
}
