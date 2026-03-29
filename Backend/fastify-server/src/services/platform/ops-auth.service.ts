import { prisma } from '@vayva/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from '../../lib/logger';

const SESSION_DURATION_DAYS = 7;

export class OpsAuthService {
  constructor(private readonly db = prisma) {}

  async bootstrapOwner() {
    const count = await this.db.opsUser.count();
    if (count > 0) return;

    const email = process.env.OPS_OWNER_EMAIL;
    const password = process.env.OPS_OWNER_PASSWORD;

    if (!email || !password) {
      logger.warn('OPS_BOOTSTRAP_SKIPPED: Missing OPS_OWNER_EMAIL or OPS_OWNER_PASSWORD');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.db.opsUser.create({
      data: {
        email,
        password: passwordHash,
        role: 'OPS_OWNER',
        name: 'System Owner',
        isActive: true,
      },
    });

    logger.info('[OpsAuth] Owner user bootstrapped');
  }

  async login(email: string, passwordString: string, ip: string) {
    const user = await this.db.opsUser.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(passwordString, user.password);
    if (!isValid) return null;

    if (!user.isActive) {
      throw new Error('Account disabled');
    }

    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    await this.db.opsUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.db.opsSession.create({
      data: {
        opsUserId: user.id,
        token,
        expiresAt,
      },
    });

    await this.logEvent(user.id, 'OPS_LOGIN_SUCCESS', { ip });
    logger.info(`[OpsAuth] User ${user.email} logged in`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      expiresAt,
    };
  }

  async isRateLimited(ip: string): Promise<boolean> {
    const WINDOW_MINUTES = 15;
    const MAX_ATTEMPTS = 5;
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    const failures = await this.db.opsAuditEvent.findMany({
      where: {
        eventType: 'OPS_LOGIN_FAILED',
        createdAt: { gte: windowStart },
      },
      select: { metadata: true },
    });

    const count = failures.filter((f) => (f.metadata as any)?.ip === ip).length;
    return count >= MAX_ATTEMPTS;
  }

  async getSession(token: string) {
    const session = await this.db.opsSession.findUnique({
      where: { token },
      include: { opsUser: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    if (!session.opsUser.isActive) return null;

    return {
      user: session.opsUser,
      session,
    };
  }

  async logout(token: string) {
    await this.db.opsSession.deleteMany({ where: { token } });
    logger.info('[OpsAuth] User logged out');
  }

  async logEvent(userId: string | null, eventType: string, metadata = {}) {
    await this.db.opsAuditEvent.create({
      data: {
        opsUserId: userId,
        eventType,
        metadata,
      },
    });
  }

  async createUser(creatorRole: string, data: { email: string; role: string; name: string }) {
    if (creatorRole !== 'OPS_OWNER') {
      throw new Error('Unauthorized');
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);

    const newUser = await this.db.opsUser.create({
      data: {
        email: data.email,
        role: data.role,
        name: data.name,
        password: hash,
        isActive: true,
      },
    });

    logger.info(`[OpsAuth] Created user ${newUser.email}`);
    return { user: newUser, tempPassword };
  }

  async updateUser(userId: string, updates: { name?: string; role?: string; isActive?: boolean }) {
    return await this.db.opsUser.update({
      where: { id: userId },
      data: updates,
    });
  }

  async deleteUser(userId: string) {
    await this.db.opsUser.delete({
      where: { id: userId },
    });
    logger.info(`[OpsAuth] Deleted user ${userId}`);
  }

  async listUsers() {
    return await this.db.opsUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
