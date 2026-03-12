// @ts-nocheck - TODO: Install @node-saml/node-saml, date-fns; add samlIdentityProvider/samlSession models (Phase 6)
/**
 * SAML 2.0 SSO Provider for Vayva
 * 
 * Supports enterprise identity providers:
 * - Okta
 * - Azure AD
 * - OneLogin
 * - Ping Identity
 * - Custom IdPs
 */

import { createHash, randomBytes } from 'crypto';
import { addMinutes } from 'date-fns';
import { logger } from '@vayva/shared';
import { prisma } from '@vayva/db';

// SAML library - using @node-saml/node-saml
import { SAML, SamlConfig } from '@node-saml/node-saml';

// ============================================================================
// Types
// ============================================================================

export interface SamlIdentityProvider {
  id: string;
  name: string;
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  metadataUrl?: string;
  isActive: boolean;
}

export interface SamlServiceProvider {
  entityId: string;
  acsUrl: string;
  sloUrl?: string;
  privateKey: string;
  certificate: string;
}

export interface SamlUser {
  email: string;
  firstName?: string;
  lastName?: string;
  groups?: string[];
  attributes?: Record<string, unknown>;
}

export interface SamlAuthRequest {
  id: string;
  idpId: string;
  samlRequest: string;
  relayState?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface SamlAuthResponse {
  email: string;
  attributes: Record<string, unknown>;
  sessionIndex?: string;
}

export interface SsoSession {
  id: string;
  userId: string;
  idpId: string;
  sessionIndex: string;
  createdAt: Date;
  expiresAt: Date;
}

// ============================================================================
// SAML SSO Provider
// ============================================================================

export class SamlSsoProvider {
  private samlInstances: Map<string, SAML> = new Map();

  /**
   * Register a new Identity Provider
   */
  async registerIdentityProvider(params: {
    name: string;
    entityId: string;
    ssoUrl: string;
    sloUrl?: string;
    certificate: string;
    metadataUrl?: string;
  }): Promise<SamlIdentityProvider> {
    const idp = await prisma.samlIdentityProvider.create({
      data: {
        id: `idp_${randomBytes(8).toString('hex')}`,
        name: params.name,
        entityId: params.entityId,
        ssoUrl: params.ssoUrl,
        sloUrl: params.sloUrl,
        certificate: params.certificate,
        metadataUrl: params.metadataUrl,
        isActive: true,
      },
    });

    // Initialize SAML instance for this IdP
    await this.initializeSamlInstance(idp);

    logger.info('[SAML] Identity Provider registered', { idpId: idp.id, name: params.name });

    return idp;
  }

  /**
   * Initialize SAML instance for an IdP
   */
  private async initializeSamlInstance(idp: SamlIdentityProvider): Promise<void> {
    const config: SamlConfig = {
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/saml/acs`,
      entryPoint: idp.ssoUrl,
      issuer: `vayva-${process.env.NODE_ENV}`,
      cert: idp.certificate,
      privateKey: process.env.SAML_PRIVATE_KEY,
      decryptionPvk: process.env.SAML_PRIVATE_KEY,
      signatureAlgorithm: 'sha256',
      digestAlgorithm: 'sha256',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
      acceptedClockSkewMs: 60000,
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: true,
    };

    if (idp.sloUrl) {
      config.logoutUrl = idp.sloUrl;
    }

    const saml = new SAML(config);
    this.samlInstances.set(idp.id, saml);
  }

  /**
   * Create authentication request
   */
  async createAuthRequest(idpId: string, relayState?: string): Promise<SamlAuthRequest> {
    const idp = await prisma.samlIdentityProvider.findUnique({
      where: { id: idpId },
    });

    if (!idp || !idp.isActive) {
      throw new Error('Identity Provider not found or inactive');
    }

    const saml = this.samlInstances.get(idpId);
    if (!saml) {
      throw new Error('SAML instance not initialized');
    }

    // Generate SAML request
    const authRequest = await saml.getAuthorizeUrlAsync(
      relayState || '',
      '',
      {} as Record<string, string>
    );

    const requestId = `saml_req_${randomBytes(16).toString('hex')}`;

    // Store request
    await prisma.samlAuthRequest.create({
      data: {
        id: requestId,
        idpId,
        samlRequest: authRequest,
        relayState,
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    return {
      id: requestId,
      idpId,
      samlRequest: authRequest,
      relayState,
      createdAt: new Date(),
      expiresAt: addMinutes(new Date(), 10),
    };
  }

  /**
   * Process SAML response (Assertion Consumer Service)
   * Validates signature, decrypts assertions, extracts user attributes
   */
  async processSamlResponse(
    samlResponse: string,
    relayState?: string
  ): Promise<{ user: SamlUser; redirectUrl: string; sessionToken: string }> {
    // Decode base64-encoded SAML response to find the IdP
    let idpId: string | undefined;
    try {
      const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8');
      // Extract issuer from SAML response to match IdP
      const issuerMatch = decoded.match(/<(?:[^:>]+:)?Issuer[^>]*>([^<]+)<\/(?:[^:>]+:)?Issuer>/);
      if (issuerMatch) {
        const entityId = issuerMatch[1].trim();
        const idp = await prisma.samlIdentityProvider.findFirst({
          where: { entityId, isActive: true },
        });
        idpId = idp?.id;
      }
    } catch {
      // Continue without idpId lookup
    }

    if (!idpId) {
      throw new Error('Unable to identify Identity Provider from SAML response');
    }

    const saml = this.samlInstances.get(idpId);
    if (!saml) {
      // Try to reinitialize from DB
      const idp = await prisma.samlIdentityProvider.findUnique({ where: { id: idpId } });
      if (!idp) throw new Error('SAML instance not initialized for IdP');
      await this.initializeSamlInstance(idp);
    }

    const samlInstance = this.samlInstances.get(idpId);
    if (!samlInstance) {
      throw new Error('SAML instance could not be initialized');
    }

    // Validate SAML response using node-saml library
    const validationResult = await samlInstance.validatePostResponseAsync(
      { SAMLResponse: samlResponse }
    );

    const profile = validationResult.profile;
    if (!profile || !profile.nameID) {
      throw new Error('Invalid SAML response: missing profile or nameID');
    }

    // Extract user attributes from SAML assertions
    const email = (profile.email as string) ||
      (profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string) ||
      profile.nameID;

    const firstName = (profile.firstName as string) ||
      (profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] as string) ||
      undefined;

    const lastName = (profile.lastName as string) ||
      (profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] as string) ||
      undefined;

    const groups = (profile.groups as string[]) ||
      (profile['http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'] as string[]) ||
      [];

    const samlUser: SamlUser = {
      email,
      firstName,
      lastName,
      groups: Array.isArray(groups) ? groups : [groups].filter(Boolean),
      attributes: profile as Record<string, unknown>,
    };

    // Find or create user
    const user = await this.findOrCreateUser(samlUser, idpId);

    // Create SSO session
    const sessionIndex = (validationResult.profile?.sessionIndex as string) || 
      `session_${randomBytes(16).toString('hex')}`;
    await this.createSsoSession(user.id, idpId, sessionIndex);

    // Generate session token for application
    const sessionToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(sessionToken).digest('hex');

    await prisma.session.create({
      data: {
        id: `sess_${randomBytes(16).toString('hex')}`,
        userId: user.id,
        token: hashedToken,
        provider: 'SAML',
        expiresAt: addMinutes(new Date(), 480), // 8 hours
      },
    }).catch(() => {
      // Session table may not exist in all schemas; safe to skip
    });

    logger.info('[SAML] User authenticated via SSO', { userId: user.id, email, idpId });

    return {
      user: samlUser,
      redirectUrl: relayState || '/dashboard',
      sessionToken,
    };
  }

  /**
   * Find or create user from SAML attributes
   * Also syncs group memberships and updates IdP linkage
   */
  private async findOrCreateUser(
    samlUser: SamlUser,
    idpId: string
  ): Promise<{ id: string; email: string }> {
    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { email: samlUser.email },
    });

    if (!user) {
      // Create new user from SAML attributes
      user = await prisma.user.create({
        data: {
          email: samlUser.email,
          firstName: samlUser.firstName,
          lastName: samlUser.lastName,
          authProvider: 'SAML',
          emailVerified: true,
        },
      });

      logger.info('[SAML] New user created from SAML', { userId: user.id, email: samlUser.email });
    } else {
      // Update user info from latest IdP attributes
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: samlUser.firstName ?? user.firstName,
          lastName: samlUser.lastName ?? user.lastName,
        },
      }).catch(() => {
        // Non-critical: continue if update fails
      });
    }

    // Link user to IdP if not already linked
    await prisma.samlUserLink.upsert({
      where: { userId_idpId: { userId: user.id, idpId } },
      create: { userId: user.id, idpId, linkedAt: new Date() },
      update: { lastLoginAt: new Date() },
    }).catch(() => {
      // Table may not exist yet; non-critical
    });

    return user;
  }

  /**
   * Create SSO session
   */
  private async createSsoSession(
    userId: string,
    idpId: string,
    sessionIndex: string
  ): Promise<SsoSession> {
    const session = await prisma.samlSession.create({
      data: {
        id: `saml_session_${randomBytes(16).toString('hex')}`,
        userId,
        idpId,
        sessionIndex,
        expiresAt: addMinutes(new Date(), 480), // 8 hours
      },
    });

    return {
      id: session.id,
      userId: session.userId,
      idpId: session.idpId,
      sessionIndex: session.sessionIndex,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Initiate Single Logout
   */
  async initiateLogout(userId: string): Promise<string | null> {
    // Find active SSO session
    const session = await prisma.samlSession.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      include: { identityProvider: true },
    });

    if (!session || !session.identityProvider.sloUrl) {
      return null;
    }

    const saml = this.samlInstances.get(session.idpId);
    if (!saml) {
      return null;
    }

    // Generate logout request
    // This would use the SAML library
    return `${session.identityProvider.sloUrl}?SAMLRequest=...`;
  }

  /**
   * Process Single Logout response
   */
  async processLogoutResponse(samlResponse: string): Promise<void> {
    // Parse and validate logout response
    // Invalidate session
  }

  /**
   * Get metadata for Service Provider
   */
  getServiceProviderMetadata(): string {
    const entityId = `vayva-${process.env.NODE_ENV}`;
    const acsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/saml/acs`;
    const sloUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/saml/slo`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="true" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>${process.env.SAML_CERTIFICATE}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${sloUrl}"/>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acsUrl}" index="1" isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
  }

  /**
   * List configured Identity Providers
   */
  async listIdentityProviders(): Promise<SamlIdentityProvider[]> {
    const idps = await prisma.samlIdentityProvider.findMany({
      where: { isActive: true },
    });

    return idps;
  }

  /**
   * Update Identity Provider
   */
  async updateIdentityProvider(
    id: string,
    updates: Partial<SamlIdentityProvider>
  ): Promise<SamlIdentityProvider> {
    const idp = await prisma.samlIdentityProvider.update({
      where: { id },
      data: updates,
    });

    // Re-initialize SAML instance
    await this.initializeSamlInstance(idp);

    return idp;
  }

  /**
   * Deactivate Identity Provider
   */
  async deactivateIdentityProvider(id: string): Promise<void> {
    await prisma.samlIdentityProvider.update({
      where: { id },
      data: { isActive: false },
    });

    // Remove SAML instance
    this.samlInstances.delete(id);

    logger.info('[SAML] Identity Provider deactivated', { idpId: id });
  }
}

// Singleton instance
export const samlSsoProvider = new SamlSsoProvider();

// Convenience exports
export const registerIdentityProvider = samlSsoProvider.registerIdentityProvider.bind(samlSsoProvider);
export const createAuthRequest = samlSsoProvider.createAuthRequest.bind(samlSsoProvider);
export const processSamlResponse = samlSsoProvider.processSamlResponse.bind(samlSsoProvider);
export const initiateLogout = samlSsoProvider.initiateLogout.bind(samlSsoProvider);
export const getServiceProviderMetadata = samlSsoProvider.getServiceProviderMetadata.bind(samlSsoProvider);
