import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

/**
 * Security Service - Handles sudo mode and security-sensitive operations
 * 
 * Sudo mode allows users to perform sensitive operations after re-authentication.
 * Sessions have a limited lifetime and must be refreshed.
 */
export class SecurityService {
  /**
   * Check if user has active sudo mode session
   * 
   * @param storeId - The store/merchant ID
   * @param token - The session token from cookies
   * @returns true if sudo mode is active and not expired
   */
  async checkSudoMode(storeId: string, token: string): Promise<boolean> {
    try {
      const session = await prisma.merchantSession.findUnique({
        where: { token },
        select: {
          sudoExpiresAt: true,
          userId: true,
        },
      });

      if (!session) {
        logger.debug('[SecurityService] No session found for sudo check', { storeId });
        return false;
      }

      // Verify session belongs to this store
      const merchant = await prisma.merchant.findUnique({
        where: { id: session.userId },
        select: { storeId: true },
      });

      if (merchant?.storeId !== storeId) {
        logger.warn('[SecurityService] Session store mismatch', { 
          sessionUserId: session.userId, 
          requestedStoreId: storeId 
        });
        return false;
      }

      if (!session.sudoExpiresAt) {
        logger.debug('[SecurityService] No sudo expiration set', { storeId });
        return false;
      }

      // Check if sudo mode has expired
      const isExpired = session.sudoExpiresAt < new Date();
      
      if (isExpired) {
        logger.info('[SecurityService] Sudo mode expired', { storeId });
        return false;
      }

      logger.debug('[SecurityService] Sudo mode active', { 
        storeId, 
        expiresAt: session.sudoExpiresAt 
      });
      
      return true;
    } catch (error) {
      logger.error('[SecurityService] Error checking sudo mode', { 
        storeId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Enable sudo mode for a user session
   * 
   * @param storeId - The store/merchant ID
   * @param token - The session token
   * @param durationMinutes - How long sudo mode should last (default: 15 minutes)
   * @returns true if successfully enabled
   */
  async enableSudoMode(
    storeId: string, 
    token: string, 
    durationMinutes: number = 15
  ): Promise<boolean> {
    try {
      const session = await prisma.merchantSession.findUnique({
        where: { token },
        select: { userId: true },
      });

      if (!session) {
        logger.warn('[SecurityService] Cannot enable sudo: no session', { storeId });
        return false;
      }

      // Verify session belongs to this store
      const merchant = await prisma.merchant.findUnique({
        where: { id: session.userId },
        select: { storeId: true },
      });

      if (merchant?.storeId !== storeId) {
        logger.warn('[SecurityService] Sudo enable: store mismatch', { 
          sessionUserId: session.userId, 
          requestedStoreId: storeId 
        });
        return false;
      }

      const sudoExpiresAt = new Date();
      sudoExpiresAt.setMinutes(sudoExpiresAt.getMinutes() + durationMinutes);

      await prisma.merchantSession.update({
        where: { token },
        data: { sudoExpiresAt },
      });

      logger.info('[SecurityService] Sudo mode enabled', { 
        storeId, 
        expiresAt: sudoExpiresAt,
        durationMinutes 
      });

      return true;
    } catch (error) {
      logger.error('[SecurityService] Error enabling sudo mode', { 
        storeId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Disable sudo mode immediately
   * 
   * @param storeId - The store/merchant ID
   * @param token - The session token
   * @returns true if successfully disabled
   */
  async disableSudoMode(storeId: string, token: string): Promise<boolean> {
    try {
      await prisma.merchantSession.update({
        where: { token },
        data: { sudoExpiresAt: null },
      });

      logger.info('[SecurityService] Sudo mode disabled', { storeId });
      return true;
    } catch (error) {
      logger.error('[SecurityService] Error disabling sudo mode', { 
        storeId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Require sudo mode - throws error if not active
   * 
   * @param storeId - The store/merchant ID
   * @param token - The session token
   * @throws Error if sudo mode is not active
   */
  async requireSudoMode(storeId: string, token: string): Promise<void> {
    const isSudo = await this.checkSudoMode(storeId, token);
    
    if (!isSudo) {
      logger.warn('[SecurityService] Sudo mode required but not active', { 
        storeId,
        operation: 'requireSudoMode'
      });
      
      throw new Error('SUDO_MODE_REQUIRED');
    }

    logger.debug('[SecurityService] Sudo mode verified', { storeId });
  }

  /**
   * Log a security-sensitive action
   * 
   * @param storeId - The store/merchant ID
   * @param userId - The user performing the action
   * @param action - The action being performed
   * @param metadata - Additional context
   */
  async logSecurityEvent(
    storeId: string,
    userId: string,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          storeId,
          userId,
          action,
          targetType: 'SECURITY',
          timestamp: new Date(),
          metadata: metadata || {},
        },
      });

      logger.info('[SecurityService] Security event logged', { 
        storeId, 
        userId, 
        action 
      });
    } catch (error) {
      logger.error('[SecurityService] Error logging security event', { 
        storeId, 
        userId,
        action,
        error: error instanceof Error ? error.message : String(error) 
      });
      // Don't throw - logging failure shouldn't block the main operation
    }
  }
}
