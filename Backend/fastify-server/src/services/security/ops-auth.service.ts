import { prisma } from '@vayva/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from '@vayva/shared';

const SESSION_DURATION_DAYS = 7;

/**
 * OpsAuthService - Handles authentication for operations team
 * 
 * This is separate from merchant authentication and is used internally
 * by the Vayva operations and support team.
 */
export class OpsAuthService {
  /**
   * Bootstrap the first Ops Owner user
   * 
   * Creates an initial owner account from environment variables if no users exist.
   * Should be called during server initialization.
   */
  async bootstrapOwner(): Promise<void> {
    try {
      const count = await prisma.opsUser.count();
      if (count > 0) {
        logger.debug('[OpsAuthService] Users already exist, skipping bootstrap');
        return;
      }

      const email = process.env.OPS_OWNER_EMAIL;
      const password = process.env.OPS_OWNER_PASSWORD;

      if (!email || !password) {
        logger.warn('[OpsAuthService] OPS_BOOTSTRAP_SKIPPED: Missing OPS_OWNER_EMAIL or OPS_OWNER_PASSWORD');
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.opsUser.create({
        data: {
          email,
          password: passwordHash,
          role: 'OPS_OWNER',
          name: 'System Owner',
          isActive: true,
        },
      });

      logger.info('[OpsAuthService] Bootstrap owner created successfully', { email });
    } catch (error) {
      logger.error('[OpsAuthService] Error bootstrapping owner', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Authenticate ops user and create session
   * 
   * @param email - User's email
   * @param password - User's password
   * @returns Session token and user info, or null if authentication fails
   */
  async login(email: string, password: string): Promise<{
    user: { id: string; email: string; name: string; role: string };
    token: string;
  } | null> {
    try {
      // Find user by email
      const user = await prisma.opsUser.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        logger.debug('[OpsAuthService] Login failed: user not found', { email });
        return null;
      }

      // Check if account is active
      if (!user.isActive) {
        logger.warn('[OpsAuthService] Login failed: account disabled', { email });
        throw new Error('Account disabled');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        logger.warn('[OpsAuthService] Login failed: invalid password', { email });
        return null;
      }

      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

      // Create session record
      await prisma.opsSession.create({
        data: {
          opsUserId: user.id,
          token,
          expiresAt,
          ipAddress: '', // Will be filled by controller
          userAgent: '', // Will be filled by controller
        },
      });

      logger.info('[OpsAuthService] Login successful', { 
        userId: user.id, 
        email,
        role: user.role 
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Account disabled') {
        throw error;
      }
      
      logger.error('[OpsAuthService] Error during login', { 
        email,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Validate a session token and get user info
   * 
   * @param token - Session token
   * @returns User info if valid session, null otherwise
   */
  async validateSession(token: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null> {
    try {
      const session = await prisma.opsSession.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!session) {
        logger.debug('[OpsAuthService] Session not found');
        return null;
      }

      // Check if session has expired
      if (session.expiresAt < new Date()) {
        logger.info('[OpsAuthService] Session expired', { sessionId: session.id });
        
        // Clean up expired session
        await prisma.opsSession.delete({
          where: { id: session.id },
        });
        
        return null;
      }

      // Check if user is still active
      if (!session.user.isActive) {
        logger.warn('[OpsAuthService] User account disabled', { userId: session.userId });
        return null;
      }

      // Update session last activity
      await prisma.opsSession.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      });

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      };
    } catch (error) {
      logger.error('[OpsAuthService] Error validating session', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Logout and invalidate session
   * 
   * @param token - Session token to invalidate
   * @returns true if successfully logged out
   */
  async logout(token: string): Promise<boolean> {
    try {
      await prisma.opsSession.deleteMany({
        where: { token },
      });

      logger.info('[OpsAuthService] Logout successful');
      return true;
    } catch (error) {
      logger.error('[OpsAuthService] Error during logout', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Get current session info
   * 
   * @param token - Session token
   * @returns Session details including expiration
   */
  async getCurrentSession(token: string): Promise<{
    id: string;
    userId: string;
    email: string;
    role: string;
    expiresAt: Date;
    lastActiveAt: Date | null;
  } | null> {
    try {
      const session = await prisma.opsSession.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      return {
        id: session.id,
        userId: session.userId,
        email: session.user.email,
        role: session.user.role,
        expiresAt: session.expiresAt,
        lastActiveAt: session.lastActiveAt,
      };
    } catch (error) {
      logger.error('[OpsAuthService] Error getting current session', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Extend session expiration
   * 
   * @param token - Session token
   * @param additionalDays - Days to add to current expiration
   * @returns new expiration date
   */
  async extendSession(token: string, additionalDays: number = 7): Promise<Date> {
    try {
      const session = await prisma.opsSession.findUnique({
        where: { token },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const newExpiresAt = new Date(session.expiresAt);
      newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);

      await prisma.opsSession.update({
        where: { id: session.id },
        data: { expiresAt: newExpiresAt },
      });

      logger.info('[OpsAuthService] Session extended', { 
        sessionId: session.id,
        newExpiresAt,
        additionalDays 
      });

      return newExpiresAt;
    } catch (error) {
      logger.error('[OpsAuthService] Error extending session', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * List all active sessions for a user
   * 
   * @param userId - User ID
   * @returns Array of active sessions
   */
  async listUserSessions(userId: string): Promise<Array<{
    id: string;
    createdAt: Date;
    expiresAt: Date;
    lastActiveAt: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
  }>> {
    try {
      const sessions = await prisma.opsSession.findMany({
        where: {
          opsUserId: userId,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
          lastActiveAt: true,
          ipAddress: true,
          userAgent: true,
        },
        orderBy: { lastActiveAt: 'desc' },
      });

      logger.debug('[OpsAuthService] Listed user sessions', { 
        userId, 
        count: sessions.length 
      });

      return sessions;
    } catch (error) {
      logger.error('[OpsAuthService] Error listing user sessions', { 
        userId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user (force logout everywhere)
   * 
   * @param userId - User ID
   * @returns number of sessions revoked
   */
  async revokeAllSessions(userId: string): Promise<number> {
    try {
      const result = await prisma.opsSession.deleteMany({
        where: { opsUserId: userId },
      });

      logger.info('[OpsAuthService] All sessions revoked', { 
        userId, 
        revokedCount: result.count 
      });

      return result.count;
    } catch (error) {
      logger.error('[OpsAuthService] Error revoking all sessions', { 
        userId,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
}
