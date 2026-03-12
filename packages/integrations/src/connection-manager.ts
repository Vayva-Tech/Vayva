/**
 * Integration Connection Manager
 * Manages installation state, credentials, and sync for all integrations
 */

import type {
  IntegrationInstallation,
  InstallationStatus,
  InstallationResult,
} from './marketplace/types';

export interface ConnectionCredentials {
  type: 'oauth' | 'api_key' | 'webhook';
  // OAuth
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  // API Key
  apiKey?: string;
  apiSecret?: string;
  // Additional config
  accountId?: string;
  organizationId?: string;
  extraConfig?: Record<string, unknown>;
}

export interface ConnectionStatus {
  integrationId: string;
  storeId: string;
  status: InstallationStatus;
  lastSyncAt?: Date;
  lastSyncResult?: {
    success: boolean;
    itemsSynced: number;
    errors: string[];
  };
  errorMessage?: string;
}

export interface OAuthInitResult {
  authorizationUrl: string;
  state: string;
  codeVerifier?: string;
}

export interface OAuthCallbackResult {
  success: boolean;
  installationId?: string;
  errorMessage?: string;
}

/**
 * Integration Connection Manager
 * In-memory implementation (replace with DB-backed in production)
 */
export class IntegrationConnectionManager {
  private installations: Map<string, IntegrationInstallation> = new Map();
  private oauthStates: Map<string, { integrationId: string; storeId: string; createdAt: Date }> = new Map();

  /**
   * Install a new integration
   */
  async install(
    storeId: string,
    integrationId: string,
    credentials: ConnectionCredentials,
    settings?: Record<string, unknown>
  ): Promise<InstallationResult> {
    const installationId = this.generateId();

    const installation: IntegrationInstallation = {
      id: installationId,
      storeId,
      integrationId,
      status: 'active',
      credentials: {
        encrypted: false, // In production: encrypt with KMS
        data: credentials as unknown as Record<string, unknown>,
      },
      settings: settings ?? {},
      installedAt: new Date(),
      updatedAt: new Date(),
    };

    this.installations.set(this.installationKey(storeId, integrationId), installation);

    return {
      success: true,
      installationId,
      message: `${integrationId} connected successfully`,
    };
  }

  /**
   * Uninstall an integration
   */
  async uninstall(storeId: string, integrationId: string): Promise<boolean> {
    const key = this.installationKey(storeId, integrationId);
    return this.installations.delete(key);
  }

  /**
   * Get installation for a store
   */
  getInstallation(storeId: string, integrationId: string): IntegrationInstallation | undefined {
    return this.installations.get(this.installationKey(storeId, integrationId));
  }

  /**
   * Get all installations for a store
   */
  getStoreInstallations(storeId: string): IntegrationInstallation[] {
    const result: IntegrationInstallation[] = [];
    for (const [key, installation] of this.installations) {
      if (key.startsWith(`${storeId}:`)) {
        result.push(installation);
      }
    }
    return result;
  }

  /**
   * Update installation status
   */
  updateStatus(
    storeId: string,
    integrationId: string,
    status: InstallationStatus,
    error?: string
  ): boolean {
    const key = this.installationKey(storeId, integrationId);
    const installation = this.installations.get(key);
    if (!installation) return false;

    installation.status = status;
    installation.errorMessage = error;
    installation.updatedAt = new Date();
    this.installations.set(key, installation);
    return true;
  }

  /**
   * Update last sync result
   */
  updateSyncResult(
    storeId: string,
    integrationId: string,
    result: { success: boolean; itemsSynced: number; errors: string[] }
  ): boolean {
    const key = this.installationKey(storeId, integrationId);
    const installation = this.installations.get(key);
    if (!installation) return false;

    installation.lastSyncAt = new Date();
    installation.status = result.success ? 'active' : 'error';
    installation.errorMessage = result.errors[0];
    installation.updatedAt = new Date();
    this.installations.set(key, installation);
    return true;
  }

  /**
   * Get credentials for an installation
   */
  getCredentials(storeId: string, integrationId: string): ConnectionCredentials | undefined {
    const installation = this.getInstallation(storeId, integrationId);
    if (!installation?.credentials) return undefined;
    return installation.credentials.data as unknown as ConnectionCredentials;
  }

  /**
   * Update credentials (e.g., after OAuth token refresh)
   */
  updateCredentials(
    storeId: string,
    integrationId: string,
    credentials: Partial<ConnectionCredentials>
  ): boolean {
    const key = this.installationKey(storeId, integrationId);
    const installation = this.installations.get(key);
    if (!installation?.credentials) return false;

    installation.credentials.data = {
      ...installation.credentials.data,
      ...credentials as unknown as Record<string, unknown>,
    };
    installation.updatedAt = new Date();
    this.installations.set(key, installation);
    return true;
  }

  /**
   * Initiate OAuth flow
   */
  initiateOAuth(
    storeId: string,
    integrationId: string,
    baseAuthUrl: string,
    params: Record<string, string>
  ): OAuthInitResult {
    const state = this.generateId();

    this.oauthStates.set(state, {
      integrationId,
      storeId,
      createdAt: new Date(),
    });

    const url = new URL(baseAuthUrl);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    url.searchParams.set('state', state);

    return { authorizationUrl: url.toString(), state };
  }

  /**
   * Complete OAuth callback
   */
  async completeOAuth(
    state: string,
    code: string,
    tokenExchangeFn: (code: string) => Promise<ConnectionCredentials>
  ): Promise<OAuthCallbackResult> {
    const oauthState = this.oauthStates.get(state);
    if (!oauthState) {
      return { success: false, errorMessage: 'Invalid or expired OAuth state' };
    }

    // Clean up state
    this.oauthStates.delete(state);

    // Check state not expired (10 minutes)
    if (Date.now() - oauthState.createdAt.getTime() > 10 * 60 * 1000) {
      return { success: false, errorMessage: 'OAuth state expired' };
    }

    try {
      const credentials = await tokenExchangeFn(code);
      const result = await this.install(
        oauthState.storeId,
        oauthState.integrationId,
        credentials
      );

      return { success: true, installationId: result.installationId };
    } catch (error) {
      return { success: false, errorMessage: `OAuth failed: ${error}` };
    }
  }

  /**
   * Get connection status for a store
   */
  getConnectionStatus(storeId: string, integrationId: string): ConnectionStatus | null {
    const installation = this.getInstallation(storeId, integrationId);
    if (!installation) return null;

    return {
      integrationId: installation.integrationId,
      storeId: installation.storeId,
      status: installation.status,
      lastSyncAt: installation.lastSyncAt,
      errorMessage: installation.errorMessage,
    };
  }

  /**
   * Test an integration connection
   */
  async testConnection(
    storeId: string,
    integrationId: string,
    testFn: (credentials: ConnectionCredentials) => Promise<boolean>
  ): Promise<boolean> {
    const credentials = this.getCredentials(storeId, integrationId);
    if (!credentials) return false;

    try {
      const isConnected = await testFn(credentials);
      this.updateStatus(storeId, integrationId, isConnected ? 'active' : 'error');
      return isConnected;
    } catch {
      this.updateStatus(storeId, integrationId, 'error', 'Connection test failed');
      return false;
    }
  }

  private installationKey(storeId: string, integrationId: string): string {
    return `${storeId}:${integrationId}`;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export const connectionManager = new IntegrationConnectionManager();
export default connectionManager;
