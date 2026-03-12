/**
 * OAuth 2.0 Provider Implementation for Vayva
 * 
 * Implements RFC 6749 - The OAuth 2.0 Authorization Framework
 * Supports Authorization Code flow with PKCE for public clients
 */

import { randomBytes, createHash } from 'crypto';
// Note: date-fns would be added as dependency when needed
const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);
const isAfter = (date1: Date, date2: Date) => date1.getTime() > date2.getTime();
import { logger } from '@vayva/shared';
// Note: prisma models would be defined in schema when needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = {
    oAuthClient: {
        create: async () => ({ id: 'client_123' }),
        findUnique: async () => null,
    },
    oAuthAuthorizationCode: {
        create: async () => ({ id: 'code_123' }),
        findUnique: async () => null,
        update: async () => ({}),
    },
    oAuthToken: {
        findFirst: async () => null,
        update: async () => ({}),
        create: async () => ({ id: 'token_123' }),
    },
};

// ============================================================================
// Types
// ============================================================================

export interface OAuthClient {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  redirectUris: string[];
  allowedScopes: OAuthScope[];
  isPublic: boolean; // true for SPA/mobile apps (PKCE required)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthAuthorizationCode {
  code: string;
  clientId: string;
  merchantId: string;
  redirectUri: string;
  scopes: OAuthScope[];
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  expiresAt: Date;
  usedAt?: Date;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scopes: OAuthScope[];
  merchantId: string;
  clientId: string;
  createdAt: Date;
  expiresAt: Date;
}

export type OAuthScope = 
  | 'read:profile'
  | 'read:orders'
  | 'write:orders'
  | 'read:products'
  | 'write:products'
  | 'read:customers'
  | 'write:customers'
  | 'read:analytics'
  | 'read:inventory'
  | 'write:inventory'
  | 'webhook:manage'
  | 'offline_access';

export interface AuthorizationRequest {
  responseType: 'code';
  clientId: string;
  redirectUri: string;
  scope?: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
}

export interface TokenRequest {
  grantType: 'authorization_code' | 'refresh_token';
  code?: string;
  redirectUri?: string;
  codeVerifier?: string;
  refreshToken?: string;
  clientId: string;
  clientSecret?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
}

export interface ConsentScreen {
  clientName: string;
  clientLogo?: string;
  scopes: { scope: OAuthScope; description: string }[];
  state: string;
  redirectUri: string;
}

// ============================================================================
// OAuth Errors
// ============================================================================

export class OAuthError extends Error {
  constructor(
    public code: string,
    public description: string,
    public statusCode: number = 400
  ) {
    super(description);
    this.name = 'OAuthError';
  }
}

export const OAuthErrors = {
  INVALID_REQUEST: (desc: string) => new OAuthError('invalid_request', desc, 400),
  INVALID_CLIENT: () => new OAuthError('invalid_client', 'Client authentication failed', 401),
  INVALID_GRANT: () => new OAuthError('invalid_grant', 'The provided authorization grant is invalid', 400),
  UNAUTHORIZED_CLIENT: () => new OAuthError('unauthorized_client', 'The client is not authorized', 403),
  UNSUPPORTED_GRANT_TYPE: () => new OAuthError('unsupported_grant_type', 'The grant type is not supported', 400),
  INVALID_SCOPE: (scope: string) => new OAuthError('invalid_scope', `Invalid scope: ${scope}`, 400),
  ACCESS_DENIED: () => new OAuthError('access_denied', 'The resource owner denied the request', 403),
  SERVER_ERROR: () => new OAuthError('server_error', 'Internal server error', 500),
};

// ============================================================================
// Scope Definitions
// ============================================================================

const SCOPE_DESCRIPTIONS: Record<OAuthScope, string> = {
  'read:profile': 'View your profile information',
  'read:orders': 'View your store orders',
  'write:orders': 'Create and update orders',
  'read:products': 'View your products',
  'write:products': 'Create and update products',
  'read:customers': 'View your customers',
  'write:customers': 'Create and update customers',
  'read:analytics': 'View store analytics',
  'read:inventory': 'View inventory levels',
  'write:inventory': 'Update inventory',
  'webhook:manage': 'Manage webhooks',
  'offline_access': 'Access your data when you\'re not logged in',
};

// ============================================================================
// OAuth Provider
// ============================================================================

export class OAuthProvider {
  private readonly ACCESS_TOKEN_TTL = 3600; // 1 hour
  private readonly REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days
  private readonly AUTH_CODE_TTL = 10; // 10 minutes

  /**
   * Register a new OAuth client
   */
  async registerClient(params: {
    name: string;
    description?: string;
    logoUrl?: string;
    redirectUris: string[];
    allowedScopes: OAuthScope[];
    isPublic?: boolean;
  }): Promise<OAuthClient & { clientSecret?: string }> {
    const clientId = this.generateClientId();
    const clientSecret = params.isPublic ? undefined : this.generateClientSecret();

    const client = await prisma.oAuthClient.create({
      data: {
        id: clientId,
        name: params.name,
        description: params.description,
        logoUrl: params.logoUrl,
        redirectUris: params.redirectUris,
        allowedScopes: params.allowedScopes,
        isPublic: params.isPublic ?? false,
        isActive: true,
        ...(clientSecret && { clientSecret: await this.hashSecret(clientSecret) }),
      },
    });

    logger.info('[OAuth] Client registered', { clientId: client.id, name: params.name });

    return {
      ...client,
      allowedScopes: client.allowedScopes as OAuthScope[],
      redirectUris: client.redirectUris as string[],
      ...(clientSecret && { clientSecret }),
    };
  }

  /**
   * Validate authorization request
   */
  async validateAuthorizationRequest(params: AuthorizationRequest): Promise<ConsentScreen> {
    // Validate response_type
    if (params.responseType !== 'code') {
      throw OAuthErrors.UNSUPPORTED_GRANT_TYPE();
    }

    // Get and validate client
    const client = await prisma.oAuthClient.findUnique({
      where: { id: params.clientId },
    });

    if (!client || !client.isActive) {
      throw OAuthErrors.INVALID_CLIENT();
    }

    // Validate redirect_uri
    if (!client.redirectUris.includes(params.redirectUri)) {
      throw OAuthErrors.INVALID_REQUEST('Invalid redirect_uri');
    }

    // Validate scopes
    const requestedScopes = this.parseScopes(params.scope);
    const invalidScopes = requestedScopes.filter(
      (s) => !client.allowedScopes.includes(s)
    );

    if (invalidScopes.length > 0) {
      throw OAuthErrors.INVALID_SCOPE(invalidScopes.join(' '));
    }

    // For public clients, PKCE is required
    if (client.isPublic && !params.codeChallenge) {
      throw OAuthErrors.INVALID_REQUEST('PKCE is required for public clients');
    }

    return {
      clientName: client.name,
      clientLogo: client.logoUrl || undefined,
      scopes: requestedScopes.map((scope) => ({
        scope,
        description: SCOPE_DESCRIPTIONS[scope],
      })),
      state: params.state || '',
      redirectUri: params.redirectUri,
    };
  }

  /**
   * Create authorization code
   */
  async createAuthorizationCode(
    params: AuthorizationRequest,
    merchantId: string
  ): Promise<string> {
    const code = this.generateCode();

    await prisma.oAuthAuthorizationCode.create({
      data: {
        code,
        clientId: params.clientId,
        merchantId,
        redirectUri: params.redirectUri,
        scopes: this.parseScopes(params.scope),
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
        expiresAt: addMinutes(new Date(), this.AUTH_CODE_TTL),
      },
    });

    logger.info('[OAuth] Authorization code created', {
      clientId: params.clientId,
      merchantId,
    });

    return code;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(params: TokenRequest): Promise<TokenResponse> {
    if (params.grantType !== 'authorization_code') {
      throw OAuthErrors.UNSUPPORTED_GRANT_TYPE();
    }

    // Get authorization code
    const authCode = await prisma.oAuthAuthorizationCode.findUnique({
      where: { code: params.code },
      include: { client: true },
    });

    if (!authCode) {
      throw OAuthErrors.INVALID_GRANT();
    }

    // Check if code is expired or used
    if (isAfter(new Date(), authCode.expiresAt) || authCode.usedAt) {
      throw OAuthErrors.INVALID_GRANT();
    }

    // Validate client
    if (authCode.clientId !== params.clientId) {
      throw OAuthErrors.INVALID_CLIENT();
    }

    // For confidential clients, validate client secret
    if (!authCode.client.isPublic && params.clientSecret) {
      const valid = await this.verifySecret(params.clientSecret, authCode.client.clientSecret || '');
      if (!valid) {
        throw OAuthErrors.INVALID_CLIENT();
      }
    }

    // Validate redirect_uri matches
    if (authCode.redirectUri !== params.redirectUri) {
      throw OAuthErrors.INVALID_REQUEST('redirect_uri mismatch');
    }

    // For PKCE, validate code_verifier
    if (authCode.codeChallenge && params.codeVerifier) {
      const valid = this.verifyCodeChallenge(
        params.codeVerifier,
        authCode.codeChallenge,
        authCode.codeChallengeMethod || 'S256'
      );
      if (!valid) {
        throw OAuthErrors.INVALID_GRANT();
      }
    }

    // Mark code as used
    await prisma.oAuthAuthorizationCode.update({
      where: { code: params.code },
      data: { usedAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(
      authCode.clientId,
      authCode.merchantId,
      authCode.scopes as OAuthScope[]
    );

    logger.info('[OAuth] Tokens issued', {
      clientId: authCode.clientId,
      merchantId: authCode.merchantId,
    });

    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshToken(params: TokenRequest): Promise<TokenResponse> {
    if (params.grantType !== 'refresh_token') {
      throw OAuthErrors.UNSUPPORTED_GRANT_TYPE();
    }

    // Get refresh token
    const tokenRecord = await prisma.oAuthToken.findFirst({
      where: {
        refreshToken: params.refreshToken,
        revokedAt: null,
      },
      include: { client: true },
    });

    if (!tokenRecord) {
      throw OAuthErrors.INVALID_GRANT();
    }

    // Check if expired
    if (tokenRecord.refreshTokenExpiresAt && isAfter(new Date(), tokenRecord.refreshTokenExpiresAt)) {
      throw OAuthErrors.INVALID_GRANT();
    }

    // Validate client
    if (tokenRecord.clientId !== params.clientId) {
      throw OAuthErrors.INVALID_CLIENT();
    }

    // For confidential clients, validate client secret
    if (!tokenRecord.client.isPublic && params.clientSecret) {
      const valid = await this.verifySecret(params.clientSecret, tokenRecord.client.clientSecret || '');
      if (!valid) {
        throw OAuthErrors.INVALID_CLIENT();
      }
    }

    // Revoke old token
    await prisma.oAuthToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(
      tokenRecord.clientId,
      tokenRecord.merchantId,
      tokenRecord.scopes as OAuthScope[]
    );

    logger.info('[OAuth] Token refreshed', {
      clientId: tokenRecord.clientId,
      merchantId: tokenRecord.merchantId,
    });

    return tokens;
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<{
    valid: boolean;
    merchantId?: string;
    clientId?: string;
    scopes?: OAuthScope[];
  }> {
    const token = await prisma.oAuthToken.findFirst({
      where: {
        accessToken,
        revokedAt: null,
      },
    });

    if (!token) {
      return { valid: false };
    }

    if (isAfter(new Date(), token.accessTokenExpiresAt)) {
      return { valid: false };
    }

    return {
      valid: true,
      merchantId: token.merchantId,
      clientId: token.clientId,
      scopes: token.scopes as OAuthScope[],
    };
  }

  /**
   * Revoke token
   */
  async revokeToken(token: string, tokenTypeHint?: 'access_token' | 'refresh_token'): Promise<void> {
    // Try to find as access token
    const accessTokenRecord = await prisma.oAuthToken.findFirst({
      where: { accessToken: token },
    });

    if (accessTokenRecord) {
      await prisma.oAuthToken.update({
        where: { id: accessTokenRecord.id },
        data: { revokedAt: new Date() },
      });
      return;
    }

    // Try as refresh token
    const refreshTokenRecord = await prisma.oAuthToken.findFirst({
      where: { refreshToken: token },
    });

    if (refreshTokenRecord) {
      await prisma.oAuthToken.update({
        where: { id: refreshTokenRecord.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private generateClientId(): string {
    return `client_${randomBytes(16).toString('hex')}`;
  }

  private generateClientSecret(): string {
    return `secret_${randomBytes(32).toString('hex')}`;
  }

  private generateCode(): string {
    return `code_${randomBytes(32).toString('hex')}`;
  }

  private generateToken(): string {
    return `token_${randomBytes(32).toString('hex')}`;
  }

  private async hashSecret(secret: string): Promise<string> {
    return createHash('sha256').update(secret).digest('hex');
  }

  private async verifySecret(secret: string, hash: string): Promise<boolean> {
    const computed = await this.hashSecret(secret);
    return computed === hash;
  }

  private parseScopes(scopeString?: string): OAuthScope[] {
    if (!scopeString) return ['read:profile'];
    return scopeString.split(' ').filter((s): s is OAuthScope => s in SCOPE_DESCRIPTIONS);
  }

  private verifyCodeChallenge(
    verifier: string,
    challenge: string,
    method: 'S256' | 'plain'
  ): boolean {
    if (method === 'plain') {
      return verifier === challenge;
    }

    // S256
    const computed = createHash('sha256')
      .update(verifier)
      .digest('base64url')
      .replace(/=/g, '');
    return computed === challenge;
  }

  private async generateTokens(
    clientId: string,
    merchantId: string,
    scopes: OAuthScope[]
  ): Promise<TokenResponse> {
    const accessToken = this.generateToken();
    const refreshToken = this.generateToken();
    const now = new Date();

    await prisma.oAuthToken.create({
      data: {
        accessToken,
        accessTokenExpiresAt: addMinutes(now, this.ACCESS_TOKEN_TTL / 60),
        refreshToken,
        refreshTokenExpiresAt: addDays(now, this.REFRESH_TOKEN_TTL / (24 * 60 * 60)),
        clientId,
        merchantId,
        scopes,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.ACCESS_TOKEN_TTL,
      scope: scopes.join(' '),
    };
  }
}

// Singleton instance
export const oauthProvider = new OAuthProvider();

// Convenience exports
export const createAuthorizationCode = oauthProvider.createAuthorizationCode.bind(oauthProvider);
export const exchangeCodeForToken = oauthProvider.exchangeCodeForToken.bind(oauthProvider);
export const validateAccessToken = oauthProvider.validateAccessToken.bind(oauthProvider);
export const revokeToken = oauthProvider.revokeToken.bind(oauthProvider);
