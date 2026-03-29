// Frontend must not use Prisma directly - delegate to backend
// import { prisma } from "@vayva/db"; // REMOVED - Backend-only
// import bcrypt from "bcryptjs"; // REMOVED - Backend handles password hashing
// import crypto from "crypto"; // REMOVED - Backend handles token generation
import { logger } from "@vayva/shared";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "ops_session_v1";
const BACKEND_URL = process.env.BACKEND_API_URL || '';

/**
 * OpsAuthService - Frontend proxy to backend OpsAuthService
 * 
 * All operations team authentication is delegated to the backend which handles:
 * - User bootstrap from environment variables
 * - bcrypt password hashing (12 salt rounds)
 * - Session creation and management
 * - 7-day session duration
 * - Activity tracking
 * - Audit logging
 */
export class OpsAuthService {
  /**
   * Bootstrap the first Ops Owner
   * This should be called on backend startup, not from frontend
   * @deprecated Backend handles this automatically on initialization
   */
  static async bootstrapOwner() {
    console.warn('[OpsAuthService] bootstrapOwner should be handled by backend on startup');
    // In production, this is handled by the backend during server initialization
    // No frontend action needed
  }

  /**
   * Authenticate ops user and create session
   * Delegates to backend which handles:
   * - User lookup
   * - Password verification with bcrypt
   * - Account status validation
   * - Token generation (crypto.randomBytes)
   * - Session creation with 7-day expiration
   * - Last login tracking
   * - Audit logging
   * 
   * @param email - User's email
   * @param password - User's password
   * @returns The authenticated user, or null if authentication failed
   */
  static async login(email: string, passwordString: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/ops/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: passwordString,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ 
          error: { message: 'Login failed' } 
        }));
        
        if (errorData.error?.code === 'ACCOUNT_DISABLED') {
          throw new Error('Account disabled');
        }
        
        return null;
      }

      const data = await res.json();
      
      if (!data.success || !data.data) {
        return null;
      }

      // Set session cookie
      const { token, user } = data.data;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      (await cookies()).set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      logger.info('[OpsAuthService] Login successful', { email });
      return user;
    } catch (error) {
      logger.error('[OpsAuthService] Login failed', error);
      throw error;
    }
  }

  /**
   * Check if IP is rate limited
   * @deprecated Backend handles rate limiting via @fastify/rate-limit
   */
  static async isRateLimited(ip: unknown) {
    console.warn('[OpsAuthService] Rate limiting is handled by backend');
    return false; // Backend handles this
  }

  /**
   * Get current session from cookies and validate with backend
   * Delegates to backend which handles:
   * - Session token validation
   * - Expiration checking
   * - User active status verification
   * - Last activity update
   */
  static async getSession() {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      
      if (!token) {
        return null;
      }

      // Validate with backend
      const res = await fetch(`${BACKEND_URL}/api/v1/ops/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      
      if (!data.success || !data.data) {
        return null;
      }

      const sessionData = data.data;
      
      return {
        user: {
          id: sessionData.id,
          email: sessionData.email,
          name: sessionData.name,
          role: sessionData.role,
        },
        session: {
          token,
          expiresAt: new Date(sessionData.expiresAt),
          lastActiveAt: sessionData.lastActiveAt ? new Date(sessionData.lastActiveAt) : null,
        },
      };
    } catch (error) {
      logger.error('[OpsAuthService] Failed to get session', error);
      return null;
    }
  }

  /**
   * Require session or throw
   */
  static async requireSession() {
    const session = await this.getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }
    return session;
  }

  /**
   * Logout and invalidate session
   * Delegates to backend which handles:
   * - Session deletion
   * - Audit logging
   */
  static async logout() {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      
      if (token) {
        // Notify backend to invalidate session
        await fetch(`${BACKEND_URL}/api/v1/ops/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(err => {
          logger.warn('[OpsAuthService] Backend logout failed', err);
        });
        
        // Clear cookie
        cookieStore.delete(SESSION_COOKIE_NAME);
      }
      
      logger.info('[OpsAuthService] Logout successful');
    } catch (error) {
      logger.error('[OpsAuthService] Logout failed', error);
      // Don't throw - ensure user is logged out even if backend call fails
    }
  }

  /**
   * Log audit event
   * @deprecated Use backend security service for audit logging
   */
  static async logEvent(userId: string | null, eventType: string, metadata = {}) {
    console.warn('[OpsAuthService] Audit logging should be handled by backend');
    // In production, audit events are logged by the backend services
  }

  /**
   * Create new ops user
   * Delegates to backend which handles:
   * - Permission checks (only OPS_OWNER can create users)
   * - Temporary password generation
   * - Password hashing with bcrypt
   * - User creation
   * 
   * @param currentUserRole - Role of user making the request
   * @param data - User data (email, role, name)
   * @returns Created user and temporary password
   */
  static async createUser(
    currentUserRole: string, 
    data: { email: string; role: string; name: string }
  ) {
    try {
      // Verify current user has permission
      if (currentUserRole !== 'OPS_OWNER') {
        throw new Error('Unauthorized');
      }

      const token = await this.getSessionToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call backend to create user
      const res = await fetch(`${BACKEND_URL}/api/v1/ops/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ 
          error: { message: 'Failed to create user' } 
        }));
        throw new Error(errorData.error?.message || 'Failed to create user');
      }

      const result = await res.json();
      return result.data;
    } catch (error) {
      logger.error('[OpsAuthService] Failed to create user', error);
      throw error;
    }
  }

  /**
   * Helper to get session token
   */
  private static async getSessionToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
  }
}
