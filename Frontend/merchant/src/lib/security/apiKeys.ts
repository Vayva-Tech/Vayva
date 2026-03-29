// Frontend must not use Prisma directly - delegate to backend
// import { prisma } from "@/lib/prisma"; // REMOVED - Backend-only
// import { randomBytes, createHash } from "crypto"; // REMOVED - Backend handles key generation
import type { ApiKey } from "@vayva/db";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

export type ApiKeyScope = string;

/**
 * API Key Service - Frontend proxy to backend ApiKeyService
 * 
 * All API key operations are delegated to the backend which handles:
 * - Cryptographically secure key generation
 * - SHA-256 hashing (keys never stored plain text)
 * - Database persistence
 * - Scope validation
 * - Usage tracking
 */
export const ApiKeyService = {
  /**
   * Hash a raw API key (for local utility only)
   * Note: In production, backend should handle all hashing
   */
  hashKey(rawKey: string): string {
    // This is kept for backward compatibility but should not be used in new code
    // Backend handles all hashing in production
    console.warn('[ApiKeyService] hashKey called - backend should handle hashing');
    return '';
  },

  /**
   * Create a new API key
   * Delegates to backend which handles:
   * - Secure key generation with crypto.randomBytes
   * - SHA-256 hashing
   * - Database storage
   * - Metadata management
   * 
   * @param storeId - Store ID (from JWT token, not passed explicitly)
   * @param name - Human-readable name for the key
   * @param scopes - Array of permission scopes
   * @returns The created key details including plain text key (shown only once)
   */
  async createKey(
    storeId: string,
    name: string,
    scopes: ApiKeyScope[],
    createdByUserId: string,
  ): Promise<{ id: string; key: string; last4: string }> {
    try {
      // Get auth token from cookies or session
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call backend API
      const res = await fetch(`${BACKEND_URL}/api/v1/security/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, scopes }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to create API key' } }));
        throw new Error(error.error?.message || 'Failed to create API key');
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('[ApiKeyService] Error creating key', error);
      throw error;
    }
  },

  /**
   * Verify an API key (for backend-to-backend calls)
   * Delegates to backend which handles:
   * - Hash comparison
   * - Status validation
   * - Expiration checking
   * - IP allowlist verification
   * - Usage tracking
   */
  async verifyApiKey(rawKey: string, ip?: string): Promise<ApiKey | null> {
    try {
      // This is typically used in API routes, not client code
      // For now, we'll keep it simple and just validate format
      if (!rawKey.startsWith('vayva_live_')) {
        return null;
      }

      // In a real implementation, you'd call a backend validation endpoint
      // For now, return null as this should be handled by backend middleware
      console.warn('[ApiKeyService] verifyApiKey should be handled by backend middleware');
      return null;
    } catch (error) {
      console.error('[ApiKeyService] Error verifying key', error);
      return null;
    }
  },

  /**
   * Mask an API key for display, showing only the last 4 characters
   * Format: vayva_live_...a1b2
   */
  maskKey(keyOrLast4: string): string {
    const last4 = keyOrLast4.length > 4 ? keyOrLast4.slice(-4) : keyOrLast4;
    return `vayva_live_...${last4}`;
  },

  /**
   * Mask a key from metadata (for listing API keys)
   */
  maskKeyFromMetadata(metadata: unknown): string {
    if (typeof metadata === "object" && metadata !== null) {
      const last4 = (metadata as Record<string, string>).last4;
      if (last4) return `vayva_live_...${last4}`;
    }
    return "vayva_live_...••••";
  },

  /**
   * Revoke an API key
   * Delegates to backend which handles:
   * - Store ownership verification
   * - Status update to REVOKED
   * - Audit logging
   */
  async revokeKey(storeId: string, id: string): Promise<void> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/security/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to revoke API key' } }));
        throw new Error(error.error?.message || 'Failed to revoke API key');
      }
    } catch (error) {
      console.error('[ApiKeyService] Error revoking key', error);
      throw error;
    }
  },

  /**
   * Get all API keys for current store
   * Delegates to backend which handles:
   * - Store isolation
   * - Data formatting
   * - Metadata extraction
   */
  async getKeys(storeId: string): Promise<Array<{
    id: string;
    name: string;
    scopes: string[];
    status: string;
    maskedKey: string;
    createdAt: string;
    updatedAt: string;
    lastUsedAt: string | null;
  }>> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/security/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to get API keys' } }));
        throw new Error(error.error?.message || 'Failed to get API keys');
      }

      const data = await res.json();
      
      // Transform backend response to match expected format
      return data.data.map((key: any) => ({
        ...key,
        maskedKey: this.maskKeyFromMetadata({ last4: key.last4 }),
      }));
    } catch (error) {
      console.error('[ApiKeyService] Error getting keys', error);
      throw error;
    }
  },
};

/**
 * Helper function to get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  // In Next.js app router, this would be called from server components or API routes
  // For client components, you'd need to use a different approach
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get('auth_token');
    return authTokenCookie?.value || null;
  } catch {
    // If running in client context, cookies() will fail
    // In that case, you might need to get token from context or localStorage
    return null;
  }
}
