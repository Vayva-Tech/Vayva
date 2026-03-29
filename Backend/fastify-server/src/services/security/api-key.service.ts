import { prisma } from '@vayva/db';
import { randomBytes, createHash } from 'crypto';
import { logger } from '@vayva/shared';
import type { Prisma } from '@vayva/db';

const KEY_PREFIX = 'vayva_live_';
const KEY_LENGTH_BYTES = 16;

/**
 * API Key Service - Manages API keys for stores
 * 
 * API keys allow programmatic access to store resources.
 * Keys are hashed before storage and never returned in plain text after creation.
 */
export class ApiKeyService {
  /**
   * Generate a new API key with hash and metadata
   */
  private generateKey(): { key: string; hash: string; last4: string } {
    const keyBody = randomBytes(KEY_LENGTH_BYTES).toString('hex');
    const key = `${KEY_PREFIX}${keyBody}`;
    const hash = createHash('sha256').update(key).digest('hex');
    const last4 = key.slice(-4);
    
    return { key, hash, last4 };
  }

  /**
   * Hash a raw API key for comparison
   */
  hashKey(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex');
  }

  /**
   * Create a new API key for a store
   * 
   * @param storeId - The store ID
   * @param name - Human-readable name for the key
   * @param scopes - Array of permission scopes (e.g., ['orders:read', 'products:write'])
   * @param createdByUserId - User creating the key
   * @returns The created key details including plain text key (only shown once)
   */
  async createKey(
    storeId: string,
    name: string,
    scopes: string[],
    createdByUserId: string
  ): Promise<{ id: string; key: string; last4: string }> {
    try {
      const { key, hash, last4 } = this.generateKey();

      const created = await prisma.apiKey.create({
        data: {
          storeId,
          name,
          scopes,
          status: 'ACTIVE',
          keyHash: hash,
          createdByUserId,
          metadata: { last4 },
        } as Prisma.ApiKeyCreateInput,
        select: {
          id: true,
        },
      });

      logger.info('[ApiKeyService] API key created', { 
        storeId, 
        keyId: created.id, 
        name,
        scopesCount: scopes.length 
      });

      return {
        id: created.id,
        key, // Return plain text key ONCE at creation
        last4,
      };
    } catch (error) {
      logger.error('[ApiKeyService] Error creating API key', { 
        storeId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Validate an API key and return the associated record
   * 
   * @param rawKey - The plain text API key
   * @returns The API key record with store info, or null if invalid/inactive
   */
  async validateKey(rawKey: string) {
    try {
      const hash = this.hashKey(rawKey);

      const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash: hash },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },
      });

      if (!apiKey) {
        logger.debug('[ApiKeyService] Invalid API key - not found');
        return null;
      }

      if (apiKey.status !== 'ACTIVE') {
        logger.warn('[ApiKeyService] API key not active', { 
          keyId: apiKey.id, 
          status: apiKey.status 
        });
        return null;
      }

      if (!apiKey.store.isActive) {
        logger.warn('[ApiKeyService] Store is inactive', { 
          keyId: apiKey.id, 
          storeId: apiKey.storeId 
        });
        return null;
      }

      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });

      logger.debug('[ApiKeyService] API key validated', { 
        keyId: apiKey.id, 
        storeId: apiKey.storeId 
      });

      return apiKey;
    } catch (error) {
      logger.error('[ApiKeyService] Error validating API key', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * List all API keys for a store (without exposing hashes)
   * 
   * @param storeId - The store ID
   * @returns Array of key metadata (id, name, scopes, last4, dates)
   */
  async listKeys(storeId: string) {
    try {
      const keys = await prisma.apiKey.findMany({
        where: { storeId },
        select: {
          id: true,
          name: true,
          scopes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastUsedAt: true,
          metadata: true, // contains last4
        },
        orderBy: { createdAt: 'desc' },
      });

      // Extract last4 from metadata for easier consumption
      const keysWithLast4 = keys.map(key => ({
        ...key,
        last4: (key.metadata as Record<string, unknown>)?.last4 as string || '****',
        metadata: undefined, // Don't expose full metadata
      }));

      logger.debug('[ApiKeyService] Listed keys', { 
        storeId, 
        count: keysWithLast4.length 
      });

      return keysWithLast4;
    } catch (error) {
      logger.error('[ApiKeyService] Error listing keys', { 
        storeId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Get a specific API key by ID
   * 
   * @param keyId - The key ID
   * @param storeId - The store ID (for verification)
   * @returns Key details or null if not found
   */
  async getKeyById(keyId: string, storeId: string) {
    try {
      const key = await prisma.apiKey.findUnique({
        where: { id: keyId, storeId },
        select: {
          id: true,
          name: true,
          scopes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastUsedAt: true,
          metadata: true,
        },
      });

      if (!key) {
        logger.debug('[ApiKeyService] Key not found', { keyId, storeId });
        return null;
      }

      const keyWithLast4 = {
        ...key,
        last4: (key.metadata as Record<string, unknown>)?.last4 as string || '****',
        metadata: undefined,
      };

      return keyWithLast4;
    } catch (error) {
      logger.error('[ApiKeyService] Error getting key by ID', { 
        keyId, 
        storeId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Revoke an API key
   * 
   * @param keyId - The key ID
   * @param storeId - The store ID (for verification)
   * @returns true if successfully revoked
   */
  async revokeKey(keyId: string, storeId: string): Promise<boolean> {
    try {
      const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
        select: { storeId: true, status: true },
      });

      if (!key) {
        logger.warn('[ApiKeyService] Cannot revoke: key not found', { keyId });
        return false;
      }

      if (key.storeId !== storeId) {
        logger.warn('[ApiKeyService] Cannot revoke: store mismatch', { 
          keyId, 
          keyStoreId: key.storeId,
          requestedStoreId: storeId 
        });
        return false;
      }

      if (key.status === 'REVOKED') {
        logger.info('[ApiKeyService] Key already revoked', { keyId });
        return true;
      }

      await prisma.apiKey.update({
        where: { id: keyId },
        data: { status: 'REVOKED' },
      });

      logger.info('[ApiKeyService] API key revoked', { keyId, storeId });
      return true;
    } catch (error) {
      logger.error('[ApiKeyService] Error revoking key', { 
        keyId, 
        storeId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Update API key scopes
   * 
   * @param keyId - The key ID
   * @param storeId - The store ID (for verification)
   * @param scopes - New array of scopes
   * @returns true if successfully updated
   */
  async updateScopes(
    keyId: string, 
    storeId: string, 
    scopes: string[]
  ): Promise<boolean> {
    try {
      const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
        select: { storeId: true },
      });

      if (key?.storeId !== storeId) {
        logger.warn('[ApiKeyService] Cannot update scopes: store mismatch', { 
          keyId, 
          keyStoreId: key.storeId,
          requestedStoreId: storeId 
        });
        return false;
      }

      await prisma.apiKey.update({
        where: { id: keyId },
        data: { scopes },
      });

      logger.info('[ApiKeyService] API key scopes updated', { 
        keyId, 
        storeId,
        scopesCount: scopes.length 
      });

      return true;
    } catch (error) {
      logger.error('[ApiKeyService] Error updating scopes', { 
        keyId, 
        storeId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Check if an API key has a specific scope
   * 
   * @param keyId - The key ID
   * @param scope - The scope to check (e.g., 'orders:write')
   * @returns true if the key has the scope
   */
  async hasScope(keyId: string, scope: string): Promise<boolean> {
    try {
      const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
        select: { scopes: true },
      });

      if (!key) {
        return false;
      }

      // Check for wildcard scope
      if (key.scopes.includes('*')) {
        return true;
      }

      return key.scopes.includes(scope);
    } catch (error) {
      logger.error('[ApiKeyService] Error checking scope', { 
        keyId, 
        scope,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
}
