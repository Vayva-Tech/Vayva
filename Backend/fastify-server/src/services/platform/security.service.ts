import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SecurityService {
  constructor(private readonly db = prisma) {}

  async checkSudoMode(userId: string, storeId: string): Promise<boolean> {
    const session = await this.db.merchantSession.findFirst({
      where: {
        userId,
        storeId,
        sudoExpiresAt: {
          gte: new Date(),
        },
      },
    });

    return !!session;
  }

  async requireSudoMode(userId: string, storeId: string): Promise<void> {
    const isSudo = await this.checkSudoMode(userId, storeId);
    if (!isSudo) {
      await this.logSecurityEvent(storeId, userId, 'SECURITY_STEP_UP_REQUIRED', {
        targetType: 'SECURITY',
      });
      throw new Error('Sudo mode required');
    }
  }

  async enableSudoMode(userId: string, storeId: string, durationMinutes: number = 30) {
    const sudoExpiresAt = new Date();
    sudoExpiresAt.setMinutes(sudoExpiresAt.getMinutes() + durationMinutes);

    await this.db.merchantSession.updateMany({
      where: {
        userId,
        storeId,
      },
      data: {
        sudoExpiresAt,
      },
    });

    await this.logSecurityEvent(storeId, userId, 'SUDO_MODE_ENABLED', {
      expiresAt: sudoExpiresAt.toISOString(),
    });

    return { success: true, expiresAt: sudoExpiresAt };
  }

  async disableSudoMode(userId: string, storeId: string) {
    await this.db.merchantSession.updateMany({
      where: {
        userId,
        storeId,
      },
      data: {
        sudoExpiresAt: null,
      },
    });

    await this.logSecurityEvent(storeId, userId, 'SUDO_MODE_DISABLED', {});
    return { success: true };
  }

  private async logSecurityEvent(
    storeId: string,
    userId: string,
    action: string,
    metadata: Record<string, unknown>
  ) {
    await this.db.auditLog.create({
      data: {
        action,
        actorUserId: userId,
        targetStoreId: storeId,
        targetType: 'SECURITY',
        metadata,
      },
    });
  }

  async getSecurityAuditLog(storeId: string, limit: number = 50) {
    return await this.db.auditLog.findMany({
      where: {
        targetStoreId: storeId,
        action: {
          contains: 'SECURITY',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
