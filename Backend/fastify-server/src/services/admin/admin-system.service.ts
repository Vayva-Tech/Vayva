import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Admin System Service - Backend
 * System administration and monitoring operations
 */
export class AdminSystemService {
  constructor(private readonly db = prisma) {}

  /**
   * Get system audit logs
   */
  async getAuditLogs(limit = 100) {
    const logs = await this.db.opsAuditEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        opsUser: {
          select: { name: true, email: true },
        },
      },
    });

    return { data: logs };
  }

  /**
   * Get database health status
   */
  async getDatabaseHealth() {
    try {
      // Test connection
      await this.db.$queryRaw`SELECT 1`;

      // Get table sizes
      const tableStats = await this.db.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20
      `;

      // Get connection pool stats
      const poolStats = await this.db.$queryRaw`
        SELECT count(*) as active_connections
        FROM pg_stat_activity
        WHERE state = 'active'
      `;

      return {
        status: 'healthy',
        connection: 'ok',
        tableSizes: tableStats,
        activeConnections: poolStats[0]?.active_connections || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('[AdminSystem] Database health check failed:', error);
      return {
        status: 'unhealthy',
        connection: 'failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    const safeEnv: Record<string, string | undefined> = {};
    
    Object.keys(process.env).forEach((key) => {
      if (
        key.startsWith('NEXT_PUBLIC_') ||
        key.startsWith('OPS_') ||
        key === 'NODE_ENV'
      ) {
        if (
          key.includes('KEY') ||
          key.includes('SECRET') ||
          key.includes('PASSWORD') ||
          key.includes('TOKEN')
        ) {
          safeEnv[key] = '[REDACTED]';
        } else {
          safeEnv[key] = process.env[key];
        }
      }
    });

    return {
      env: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || 'local',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      bootstrapEnabled: process.env.OPS_BOOTSTRAP_ENABLE === 'true',
      cookiesSecure: process.env.NODE_ENV === 'production',
      safeEnv,
    };
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags() {
    const flags = await this.db.featureFlag.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { flags };
  }

  /**
   * Create/update feature flag
   */
  async upsertFeatureFlag(data: {
    id?: string;
    name: string;
    enabled: boolean;
    description?: string;
    metadata?: any;
  }) {
    const { id, name, enabled, description, metadata } = data;

    const flag = await this.db.featureFlag.upsert({
      where: { id: id || name },
      create: {
        id: id || `flag-${Date.now()}`,
        name,
        enabled,
        description: description || null,
        metadata: metadata || {},
      },
      update: {
        enabled,
        description: description || null,
        metadata: metadata || {},
      },
    });

    logger.info(`[AdminSystem] Feature flag ${name} ${id ? 'updated' : 'created'}`);
    return flag;
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(flagId: string) {
    await this.db.featureFlag.delete({
      where: { id: flagId },
    });

    logger.info(`[AdminSystem] Feature flag ${flagId} deleted`);
    return { success: true };
  }

  /**
   * Get team members
   */
  async getTeamMembers() {
    const users = await this.db.opsUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { members: users };
  }

  /**
   * Add team member
   */
  async addTeamMember(data: {
    email: string;
    name: string;
    role: string;
  }) {
    const { email, name, role } = data;

    const existing = await this.db.opsUser.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('User already exists');
    }

    const user = await this.db.opsUser.create({
      data: {
        id: `ops-${Date.now()}`,
        email,
        name,
        role,
      },
    });

    logger.info(`[AdminSystem] Team member added: ${email}`);
    return user;
  }

  /**
   * Update team member role
   */
  async updateTeamRole(userId: string, newRole: string) {
    const user = await this.db.opsUser.update({
      where: { id: userId },
      data: { role: newRole },
    });

    logger.info(`[AdminSystem] User ${userId} role updated to ${newRole}`);
    return user;
  }

  /**
   * Remove team member
   */
  async removeTeamMember(userId: string) {
    await this.db.opsUser.delete({
      where: { id: userId },
    });

    logger.info(`[AdminSystem] Team member ${userId} removed`);
    return { success: true };
  }
}
