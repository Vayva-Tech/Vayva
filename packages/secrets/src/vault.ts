/**
 * HashiCorp Vault Secrets Management
 * 
 * Enterprise-grade secrets management for Vayva platform.
 * Supports both HashiCorp Vault and AWS Secrets Manager as backends.
 */

import { logger } from '@vayva/shared';

export interface VaultConfig {
  address: string;
  token?: string;
  roleId?: string;
  secretId?: string;
  namespace?: string;
  backend: 'vault' | 'aws-secrets-manager' | 'azure-key-vault';
}

export interface SecretVersion {
  version: number;
  createdAt: Date;
  createdBy: string;
}

export interface SecretMetadata {
  path: string;
  versions: SecretVersion[];
  currentVersion: number;
  rotationEnabled: boolean;
  lastRotatedAt?: Date;
  nextRotationAt?: Date;
}

export interface SecretValue {
  value: string;
  version: number;
  metadata?: Record<string, unknown>;
}

export class VaultClient {
  private config: VaultConfig;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: VaultConfig) {
    this.config = config;
  }

  /**
   * Initialize Vault client and authenticate
   */
  async initialize(): Promise<void> {
    switch (this.config.backend) {
      case 'vault':
        await this.authenticateWithVault();
        break;
      case 'aws-secrets-manager':
        // AWS uses IAM roles, no explicit auth needed
        break;
      case 'azure-key-vault':
        // Azure uses managed identity
        break;
      default:
        throw new Error(`Unsupported backend: ${this.config.backend}`);
    }

    logger.info('[VaultClient] Initialized', { backend: this.config.backend });
  }

  /**
   * Authenticate with HashiCorp Vault
   */
  private async authenticateWithVault(): Promise<void> {
    if (this.config.token) {
      this.token = this.config.token;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      return;
    }

    if (this.config.roleId && this.config.secretId) {
      // AppRole authentication
      const response = await fetch(`${this.config.address}/v1/auth/approle/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: this.config.roleId,
          secret_id: this.config.secretId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vault authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.auth.client_token;
      this.tokenExpiry = new Date(Date.now() + data.auth.lease_duration * 1000);
    }
  }

  /**
   * Ensure valid token
   */
  private async ensureValidToken(): Promise<string> {
    if (!this.token || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
      await this.initialize();
    }
    return this.token!;
  }

  /**
   * Get a secret from Vault
   */
  async getSecret(path: string): Promise<SecretValue> {
    try {
      switch (this.config.backend) {
        case 'vault':
          return await this.getSecretFromVault(path);
        case 'aws-secrets-manager':
          return await this.getSecretFromAWS(path);
        case 'azure-key-vault':
          return await this.getSecretFromAzure(path);
        default:
          throw new Error(`Unsupported backend: ${this.config.backend}`);
      }
    } catch (error) {
      logger.error('[VaultClient] Failed to get secret', { path, error });
      throw new Error(`Failed to retrieve secret: ${path}`);
    }
  }

  /**
   * Get secret from HashiCorp Vault
   */
  private async getSecretFromVault(path: string): Promise<SecretValue> {
    const token = await this.ensureValidToken();

    const headers: Record<string, string> = {
      'X-Vault-Token': token,
    };

    if (this.config.namespace) {
      headers['X-Vault-Namespace'] = this.config.namespace;
    }

    const response = await fetch(`${this.config.address}/v1/secret/data/${path}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Secret not found: ${path}`);
      }
      throw new Error(`Vault API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      value: data.data.data.value,
      version: data.data.metadata.version,
      metadata: data.data.data.metadata,
    };
  }

  /**
   * Get secret from AWS Secrets Manager
   */
  private async getSecretFromAWS(path: string): Promise<SecretValue> {
    // Dynamic import to avoid bundling AWS SDK when not needed
    const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
    
    const client = new SecretsManagerClient({});
    const command = new GetSecretValueCommand({ SecretId: path });
    const response = await client.send(command);

    return {
      value: response.SecretString || '',
      version: parseInt(response.VersionId || '1', 10),
    };
  }

  /**
   * Get secret from Azure Key Vault
   */
  private async getSecretFromAzure(path: string): Promise<SecretValue> {
    const { SecretClient } = await import('@azure/keyvault-secrets');
    const { DefaultAzureCredential } = await import('@azure/identity');

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(this.config.address, credential);
    const secret = await client.getSecret(path);

    return {
      value: secret.value || '',
      version: parseInt(secret.properties.version || '1', 10),
    };
  }

  /**
   * Set a secret in Vault
   */
  async setSecret(path: string, value: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      switch (this.config.backend) {
        case 'vault':
          await this.setSecretInVault(path, value, metadata);
          break;
        case 'aws-secrets-manager':
          await this.setSecretInAWS(path, value);
          break;
        case 'azure-key-vault':
          await this.setSecretInAzure(path, value);
          break;
      }

      logger.info('[VaultClient] Secret set', { path });
    } catch (error) {
      logger.error('[VaultClient] Failed to set secret', { path, error });
      throw new Error(`Failed to set secret: ${path}`);
    }
  }

  /**
   * Set secret in HashiCorp Vault
   */
  private async setSecretInVault(path: string, value: string, metadata?: Record<string, unknown>): Promise<void> {
    const token = await this.ensureValidToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Vault-Token': token,
    };

    if (this.config.namespace) {
      headers['X-Vault-Namespace'] = this.config.namespace;
    }

    const response = await fetch(`${this.config.address}/v1/secret/data/${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          value,
          metadata,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Vault API error: ${response.statusText}`);
    }
  }

  /**
   * Set secret in AWS Secrets Manager
   */
  private async setSecretInAWS(path: string, value: string): Promise<void> {
    const { SecretsManagerClient, CreateSecretCommand, PutSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
    
    const client = new SecretsManagerClient({});

    try {
      // Try to update existing secret
      const command = new PutSecretValueCommand({
        SecretId: path,
        SecretString: value,
      });
      await client.send(command);
    } catch {
      // Create new secret if it doesn't exist
      const command = new CreateSecretCommand({
        Name: path,
        SecretString: value,
      });
      await client.send(command);
    }
  }

  /**
   * Set secret in Azure Key Vault
   */
  private async setSecretInAzure(path: string, value: string): Promise<void> {
    const { SecretClient } = await import('@azure/keyvault-secrets');
    const { DefaultAzureCredential } = await import('@azure/identity');

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(this.config.address, credential);
    await client.setSecret(path, value);
  }

  /**
   * Delete a secret (soft delete)
   */
  async deleteSecret(path: string): Promise<void> {
    try {
      switch (this.config.backend) {
        case 'vault':
          await this.deleteSecretFromVault(path);
          break;
        case 'aws-secrets-manager':
          await this.deleteSecretFromAWS(path);
          break;
        case 'azure-key-vault':
          await this.deleteSecretFromAzure(path);
          break;
      }

      logger.info('[VaultClient] Secret deleted', { path });
    } catch (error) {
      logger.error('[VaultClient] Failed to delete secret', { path, error });
      throw new Error(`Failed to delete secret: ${path}`);
    }
  }

  private async deleteSecretFromVault(path: string): Promise<void> {
    const token = await this.ensureValidToken();

    const headers: Record<string, string> = {
      'X-Vault-Token': token,
    };

    if (this.config.namespace) {
      headers['X-Vault-Namespace'] = this.config.namespace;
    }

    const response = await fetch(`${this.config.address}/v1/secret/data/${path}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Vault API error: ${response.statusText}`);
    }
  }

  private async deleteSecretFromAWS(path: string): Promise<void> {
    const { SecretsManagerClient, DeleteSecretCommand } = await import('@aws-sdk/client-secrets-manager');
    
    const client = new SecretsManagerClient({});
    const command = new DeleteSecretCommand({
      SecretId: path,
      ForceDeleteWithoutRecovery: false,
      RecoveryWindowInDays: 30,
    });
    await client.send(command);
  }

  private async deleteSecretFromAzure(path: string): Promise<void> {
    const { SecretClient } = await import('@azure/keyvault-secrets');
    const { DefaultAzureCredential } = await import('@azure/identity');

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(this.config.address, credential);
    const poller = await client.beginDeleteSecret(path);
    await poller.pollUntilDone();
  }

  /**
   * Get secret metadata
   */
  async getSecretMetadata(path: string): Promise<SecretMetadata> {
    switch (this.config.backend) {
      case 'vault':
        return await this.getVaultMetadata(path);
      default:
        throw new Error(`Metadata not supported for backend: ${this.config.backend}`);
    }
  }

  private async getVaultMetadata(path: string): Promise<SecretMetadata> {
    const token = await this.ensureValidToken();

    const headers: Record<string, string> = {
      'X-Vault-Token': token,
    };

    if (this.config.namespace) {
      headers['X-Vault-Namespace'] = this.config.namespace;
    }

    const response = await fetch(`${this.config.address}/v1/secret/metadata/${path}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Vault API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      path,
      versions: Object.entries(data.data.versions).map(([version, info]: [string, unknown]) => ({
        version: parseInt(version, 10),
        createdAt: new Date((info as { created_time: string }).created_time),
        createdBy: (info as { created_by: string }).created_by || 'unknown',
      })),
      currentVersion: data.data.current_version,
      rotationEnabled: data.data.rotation_enabled || false,
      lastRotatedAt: data.data.last_rotation_date ? new Date(data.data.last_rotation_date) : undefined,
      nextRotationAt: data.data.next_rotation_date ? new Date(data.data.next_rotation_date) : undefined,
    };
  }

  /**
   * Rotate a secret
   */
  async rotateSecret(path: string, newValue: string): Promise<void> {
    // Get current secret
    const current = await this.getSecret(path);

    // Set new version
    await this.setSecret(path, newValue);

    logger.info('[VaultClient] Secret rotated', { 
      path, 
      previousVersion: current.version,
    });
  }
}

// Singleton instance
let vaultClient: VaultClient | null = null;

export function initializeVault(config: VaultConfig): VaultClient {
  vaultClient = new VaultClient(config);
  return vaultClient;
}

export function getVaultClient(): VaultClient {
  if (!vaultClient) {
    throw new Error('Vault client not initialized. Call initializeVault first.');
  }
  return vaultClient;
}

export async function getSecret(path: string): Promise<string> {
  const client = getVaultClient();
  const secret = await client.getSecret(path);
  return secret.value;
}

export async function setSecret(path: string, value: string, metadata?: Record<string, unknown>): Promise<void> {
  const client = getVaultClient();
  await client.setSecret(path, value, metadata);
}
