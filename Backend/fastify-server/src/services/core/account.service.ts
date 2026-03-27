import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class AccountService {
  constructor(private readonly db = prisma) {}

  async getProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        stores: true,
        teamMemberships: {
          include: {
            team: true,
          },
        },
      },
    });

    return user;
  }

  async updateProfile(userId: string, updates: any) {
    const { firstName, lastName, email, phone, avatarUrl } = updates;

    const updated = await this.db.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    logger.info(`[Account] Updated profile for user ${userId}`);
    return updated;
  }

  async getOverview(storeId: string) {
    const [orderCount, revenue, customerCount, productCount] = await Promise.all([
      this.db.order.count({ where: { storeId } }),
      this.db.order.aggregate({
        where: { storeId },
        _sum: { totalAmount: true },
      }),
      this.db.customer.count({ where: { storeId } }),
      this.db.product.count({ where: { storeId } }),
    ]);

    return {
      orders: orderCount,
      revenue: revenue._sum.totalAmount || 0,
      customers: customerCount,
      products: productCount,
    };
  }

  async getSecurityStatus(userId: string) {
    const [user, activeSessions, twoFactorEnabled] = await Promise.all([
      this.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
        },
      }),
      this.db.session.count({
        where: { userId },
      }),
      this.db.user.findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true },
      }),
    ]);

    return {
      user,
      activeSessions,
      twoFactorEnabled: twoFactorEnabled?.twoFactorEnabled || false,
    };
  }

  async changePassword(userId: string, passwordData: any) {
    const { currentPassword, newPassword } = passwordData;

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const validPassword = await Bun.password.verify(currentPassword, user.password);
    if (!validPassword) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await Bun.password.hash(newPassword);
    await this.db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`[Account] Changed password for user ${userId}`);
    return { success: true };
  }

  async sendOtp(userId: string, type: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.db.otp.create({
      data: {
        id: `otp-${Date.now()}`,
        userId,
        type,
        code: otp,
        expiresAt,
        used: false,
      },
    });

    logger.info(`[Account] Sent OTP to user ${userId}`);
    return { success: true, otp };
  }

  async verifyOtp(userId: string, otpData: any) {
    const { code, type } = otpData;

    const otp = await this.db.otp.findFirst({
      where: {
        userId,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new Error('Invalid or expired OTP');
    }

    await this.db.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    if (type === '2fa') {
      await this.db.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });
    }

    logger.info(`[Account] Verified OTP for user ${userId}`);
    return { success: true };
  }

  async requestDeletion(userId: string, reason: string) {
    const deletionRequest = await this.db.accountDeletionRequest.create({
      data: {
        id: `del-${Date.now()}`,
        userId,
        reason,
        status: 'pending',
        requestedAt: new Date(),
      },
    });

    logger.info(`[Account] Deletion request for user ${userId}`);
    return deletionRequest;
  }

  async getGovernance(storeId: string) {
    const [teamMembers, roles, permissions] = await Promise.all([
      this.db.teamMember.findMany({
        where: { storeId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          role: true,
        },
      }),
      this.db.role.findMany({
        where: { storeId },
        include: {
          permissions: true,
        },
      }),
      this.db.permission.findMany({
        where: { storeId },
      }),
    ]);

    return {
      teamMembers,
      roles,
      permissions,
    };
  }

  async getStore(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      include: {
        subscription: true,
        domains: true,
        settings: true,
      },
    });

    return store;
  }

  /**
   * Onboarding Management
   */
  async getOnboardingState(storeId: string) {
    let onboarding = await this.db.merchantOnboarding.findUnique({
      where: { storeId },
    });

    if (!onboarding) {
      onboarding = await this.db.merchantOnboarding.create({
        data: {
          storeId,
          status: 'NOT_STARTED',
          currentStepKey: 'welcome',
          completedSteps: [],
          data: {},
        },
      });
    }

    return onboarding;
  }

  async updateOnboardingState(storeId: string, updates: any) {
    const { step, data, status, isComplete } = updates;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (step) updateData.currentStepKey = step;
    if (status) updateData.status = status;
    if (data) {
      // Scrub sensitive PII from stored JSON
      const scrubbed = JSON.parse(JSON.stringify(data));
      if (scrubbed.identity) {
        delete scrubbed.identity.nin;
        delete scrubbed.identity.bvn;
      }
      if (scrubbed.kyc) {
        delete scrubbed.kyc.nin;
        delete scrubbed.kyc.bvn;
      }
      updateData.data = scrubbed;
    }

    if (isComplete === true) {
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();
    }

    const updated = await this.db.merchantOnboarding.upsert({
      where: { storeId },
      create: {
        storeId,
        status: 'NOT_STARTED',
        currentStepKey: step || 'welcome',
        completedSteps: [],
        data: data || {},
        updatedAt: new Date(),
      },
      update: updateData,
    });

    // Sync status to Store model if provided
    if (status) {
      await this.db.store.update({
        where: { id: storeId },
        data: { onboardingStatus: status },
      });
    }

    logger.info(`[Account] Updated onboarding state for store ${storeId}`);
    return updated;
  }

  async checkSlugAvailability(slug: string) {
    const normalized = slug.trim().toLowerCase();

    const RESERVED_STORE_SLUGS = new Set([
      'admin',
      'merchant',
      'ops',
      'www',
      'api',
      'support',
      'app',
      'dashboard',
      'help',
      'docs',
      'blog',
      'status',
    ]);

    if (RESERVED_STORE_SLUGS.has(normalized)) {
      return {
        available: false,
        slug: normalized,
        reason: 'reserved',
        message: 'This URL is reserved by Vayva. Please choose another.',
      };
    }

    const existing = await this.db.store.findUnique({
      where: { slug: normalized },
      select: { id: true },
    });

    return {
      available: !existing,
      slug: normalized,
    };
  }
}
