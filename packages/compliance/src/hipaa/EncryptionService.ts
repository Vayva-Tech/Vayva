/**
 * HIPAA Encryption Service - AES-256-GCM Encryption for PHI Data
 * Provides encryption at rest and in transit for Protected Health Information
 */

import { logger } from '@vayva/shared';

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  authTag: string;
  keyId: string;
}

export interface KeyManager {
  getKey(keyId: string): Promise<Buffer>;
  generateKey(): Promise<{ keyId: string; key: Buffer }>;
}

// Simple in-memory key manager (in production, use AWS KMS or HashiCorp Vault)
export class InMemoryKeyManager implements KeyManager {
  private keys: Map<string, Buffer> = new Map();
  private static readonly KEY_LENGTH = 32; // 256 bits for AES-256

  async getKey(keyId: string): Promise<Buffer> {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`Encryption key not found: ${keyId}`);
    }
    return key;
  }

  async generateKey(): Promise<{ keyId: string; key: Buffer }> {
    const crypto = require('crypto');
    const keyId = `key-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const key = crypto.randomBytes(InMemoryKeyManager.KEY_LENGTH);
    
    this.keys.set(keyId, key);
    
    return { keyId, key };
  }

  // For testing only - load a known key
  loadKey(keyId: string, key: Buffer): void {
    this.keys.set(keyId, key);
  }
}

export class EncryptionService {
  private keyManager: KeyManager;
  private readonly algorithm = 'aes-256-gcm';
  private defaultKeyId: string | null = null;

  constructor(keyManager: KeyManager) {
    this.keyManager = keyManager;
  }

  /**
   * Initialize default encryption key
   */
  async initialize(): Promise<void> {
    try {
      const { keyId } = await this.keyManager.generateKey();
      this.defaultKeyId = keyId;
      
      logger.info('[ENCRYPTION_SERVICE] Initialized with default key', {
        keyId: this.defaultKeyId,
      });
    } catch (error) {
      logger.error('[ENCRYPTION_SERVICE] Failed to initialize', { error });
      throw error;
    }
  }

  /**
   * Encrypt data at rest using AES-256-GCM
   */
  async encryptAtRest(data: string, keyId?: string): Promise<EncryptedData> {
    try {
      const crypto = require('crypto');
      const activeKeyId = keyId || this.defaultKeyId;
      
      if (!activeKeyId) {
        throw new Error('No encryption key available. Call initialize() first.');
      }

      const key = await this.keyManager.getKey(activeKeyId);
      const iv = crypto.randomBytes(16); // 128-bit IV for AES-GCM

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag,
        keyId: activeKeyId,
      };
    } catch (error) {
      logger.error('[ENCRYPTION_SERVICE] Encryption failed', {
        error,
        operation: 'encryptAtRest',
      });
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data that was encrypted at rest
   */
  async decryptAtRest(encryptedData: EncryptedData): Promise<string> {
    try {
      const crypto = require('crypto');
      const key = await this.keyManager.getKey(encryptedData.keyId);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('[ENCRYPTION_SERVICE] Decryption failed', {
        error,
        operation: 'decryptAtRest',
      });
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Encrypt data for transmission (in transit)
   * Note: TLS 1.3 should be enforced at infrastructure level
   * This provides additional application-layer encryption
   */
  async encryptInTransit(data: string, keyId?: string): Promise<EncryptedData> {
    return this.encryptAtRest(data, keyId);
  }

  /**
   * Decrypt data received from transmission
   */
  async decryptInTransit(encryptedData: EncryptedData): Promise<string> {
    return this.decryptAtRest(encryptedData);
  }

  /**
   * Encrypt database field (for specific PHI fields)
   */
  async encryptField(value: string, keyId?: string): Promise<string> {
    const encrypted = await this.encryptAtRest(value, keyId);
    // Return as JSON string for storage in database
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt database field
   */
  async decryptField(encryptedJson: string): Promise<string> {
    const encrypted: EncryptedData = JSON.parse(encryptedJson);
    return this.decryptAtRest(encrypted);
  }

  /**
   * Rotate encryption key
   * Re-encrypts all data with new key
   */
  async rotateKey(reencryptData?: (oldKey: string, newKey: string) => Promise<void>): Promise<string> {
    try {
      const { keyId: newKeyId } = await this.keyManager.generateKey();
      
      logger.info('[ENCRYPTION_SERVICE] Key rotation initiated', {
        newKeyId,
        oldKeyId: this.defaultKeyId,
      });

      // If re-encryption callback provided, use it
      if (reencryptData && this.defaultKeyId) {
        await reencryptData(this.defaultKeyId, newKeyId);
      }

      this.defaultKeyId = newKeyId;
      
      return newKeyId;
    } catch (error) {
      logger.error('[ENCRYPTION_SERVICE] Key rotation failed', { error });
      throw error;
    }
  }

  /**
   * Get current encryption key ID
   */
  getCurrentKeyId(): string | null {
    return this.defaultKeyId;
  }

  /**
   * Verify encryption service is properly configured
   */
  async verifyConfiguration(): Promise<boolean> {
    try {
      if (!this.defaultKeyId) {
        logger.warn('[ENCRYPTION_SERVICE] No default key configured');
        return false;
      }

      // Test encryption/decryption cycle
      const testData = 'test-encryption-verification';
      const encrypted = await this.encryptAtRest(testData);
      const decrypted = await this.decryptAtRest(encrypted);

      if (decrypted !== testData) {
        logger.error('[ENCRYPTION_SERVICE] Encryption verification failed');
        return false;
      }

      logger.info('[ENCRYPTION_SERVICE] Configuration verified successfully');
      return true;
    } catch (error) {
      logger.error('[ENCRYPTION_SERVICE] Verification failed', { error });
      return false;
    }
  }
}

// Convenience factory function
export function createEncryptionService(keyManager?: KeyManager): EncryptionService {
  const manager = keyManager || new InMemoryKeyManager();
  return new EncryptionService(manager);
}
