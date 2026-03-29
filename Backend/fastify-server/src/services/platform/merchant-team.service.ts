import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { NotificationsService } from './notifications.service';
import { RBACService } from './rbac.service';

export class MerchantTeamService {
  constructor(
    private readonly db = prisma,
    private readonly notificationService = new NotificationsService(),
    private readonly rbacService = new RBACService()
  ) {}

  async getTeam(storeId: string) {
    const [members, invites] = await Promise.all([
      this.db.membership?.findMany({
        where: { storeId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.staffInvite?.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      members: (members ?? []).map((m) => ({
        id: (m as any).id,
        userId: (m as any).userId,
        name: `${(m as any)?.user?.firstName || ''} ${(m as any)?.user?.lastName || ''}`.trim() ||
          'Unknown',
        email: (m as any).user?.email,
        role: (m as any).role_enum,
        status: (m as any).status,
        joinedAt: (m as any).createdAt,
      })),
      invites: (invites ?? []).map((i) => ({
        id: (i as any).id,
        email: (i as any).email,
        role: (i as any).role,
        status: (i as any).acceptedAt
          ? 'accepted'
          : new Date((i as any).expiresAt) < new Date()
            ? 'expired'
            : 'pending',
        createdAt: (i as any).createdAt,
        expiresAt: (i as any).expiresAt,
      })),
    };
  }

  async getAudit(storeId: string) {
    const audits = await this.db.auditLog.findMany({
      where: { targetStoreId: storeId },
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        actorUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return audits.map((a) => ({
      id: a.id,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      actorName: a.actorUser
        ? `${a.actorUser.firstName} ${a.actorUser.lastName}`
        : 'System',
      actorEmail: a.actorUser?.email || 'system@vayva.com',
      timestamp: a.timestamp,
      ipAddress: a.ip,
      requestId: a.requestId,
      metadata: a.metadata,
    }));
  }

  /**
   * Send team invitation via email
   */
  async inviteMember(
    storeId: string,
    inviterId: string,
    email: string,
    role: string,
    permissions?: any
  ): Promise<{ success: boolean; inviteId?: string; message: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.db.user.findFirst({
        where: { email },
      });

      // Check for existing active invite
      const existingInvite = await this.db.staffInvite.findFirst({
        where: {
          storeId,
          email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvite) {
        return {
          success: false,
          message: 'Invitation already sent to this email',
        };
      }

      // Create invitation (expires in 7 days)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const inviteToken = `invite_${Math.random().toString(36).substr(2, 32)}`;

      const invite = await this.db.staffInvite.create({
        data: {
          id: `inv-${Date.now()}`,
          storeId,
          email,
          role,
          invitedBy: inviterId,
          inviteToken,
          expiresAt,
          status: 'PENDING',
        },
      });

      // Send invitation email
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        include: { user: true },
      });

      const acceptUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${inviteToken}`;

      await this.notificationService.createNotification({
        userId: existingUser?.id || inviterId,
        type: 'team_invitation',
        title: `You're invited to join ${store?.name || 'our team'}`,
        message: `
You have been invited to join ${store?.name || 'our team'} as ${role}.

Click the link below to accept the invitation:
${acceptUrl}

This invitation will expire in 7 days.

If you have any questions, please contact the person who sent you this invitation.
        `.trim(),
        metadata: {
          inviteId: invite.id,
          storeId,
          storeName: store?.name,
          role,
          inviteToken,
          acceptUrl,
        },
      });

      logger.info(`[Team] Sent invitation to ${email} for store ${storeId}`);

      return {
        success: true,
        inviteId: invite.id,
        message: 'Invitation sent successfully',
      };
    } catch (error) {
      logger.error(`[Team] Error sending invitation`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send invitation',
      };
    }
  }

  /**
   * Bulk import team members via CSV
   */
  async bulkImportMembers(
    storeId: string,
    inviterId: string,
    csvData: Array<{ email: string; role: string }>,
    domainRoleMap?: Record<string, string>
  ): Promise<{ success: boolean; imported: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let imported = 0;
    let failed = 0;

    for (const row of csvData) {
      try {
        // Validate email format
        if (!row.email || !row.email.includes('@')) {
          failed++;
          results.push({ email: row.email, success: false, error: 'Invalid email format' });
          continue;
        }

        // Auto-assign role based on domain if mapping provided
        let role = row.role;
        if (domainRoleMap) {
          const emailDomain = row.email.split('@')[1];
          if (emailDomain && domainRoleMap[emailDomain]) {
            role = domainRoleMap[emailDomain];
          }
        }

        const result = await this.inviteMember(storeId, inviterId, row.email, role);

        if (result.success) {
          imported++;
          results.push({ email: row.email, success: true, inviteId: result.inviteId });
        } else {
          failed++;
          results.push({ email: row.email, success: false, error: result.message });
        }
      } catch (error) {
        failed++;
        results.push({
          email: row.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(`[Team] Bulk import: ${imported} successful, ${failed} failed`);

    return {
      success: failed === 0,
      imported,
      failed,
      results,
    };
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(inviteToken: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const invite = await this.db.staffInvite.findFirst({
        where: {
          inviteToken,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!invite) {
        return {
          success: false,
          message: 'Invalid or expired invitation',
        };
      }

      // Verify email matches
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.email !== invite.email) {
        return {
          success: false,
          message: 'Email does not match invitation',
        };
      }

      // Create membership
      await this.db.membership.create({
        data: {
          id: `mem-${Date.now()}`,
          storeId: invite.storeId,
          userId,
          roleEnum: invite.role as any,
          status: 'ACTIVE',
        },
      });

      // Update invitation
      await this.db.staffInvite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: new Date(),
          status: 'ACCEPTED',
        },
      });

      logger.info(`[Team] Accepted invitation for user ${userId}`);

      return {
        success: true,
        message: 'Invitation accepted successfully',
      };
    } catch (error) {
      logger.error(`[Team] Error accepting invitation`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to accept invitation',
      };
    }
  }

  /**
   * Resend expired invitation
   */
  async resendInvitation(inviteId: string, storeId: string): Promise<{ success: boolean; message: string }> {
    try {
      const invite = await this.db.staffInvite.findFirst({
        where: { id: inviteId, storeId },
      });

      if (!invite) {
        return {
          success: false,
          message: 'Invitation not found',
        };
      }

      if (invite.acceptedAt) {
        return {
          success: false,
          message: 'Invitation already accepted',
        };
      }

      // Generate new token and extend expiry
      const newToken = `invite_${Math.random().toString(36).substr(2, 32)}`;
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.db.staffInvite.update({
        where: { id: inviteId },
        data: {
          inviteToken: newToken,
          expiresAt: newExpiresAt,
        },
      });

      // Resend email
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        include: { user: true },
      });

      const acceptUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${newToken}`;

      const existingUser = await this.db.user.findFirst({
        where: { email: invite.email },
      });

      await this.notificationService.createNotification({
        userId: existingUser?.id || invite.invitedBy,
        type: 'team_invitation',
        title: `Updated invitation to join ${store?.name}`,
        message: `Your invitation has been resent. Click here to accept: ${acceptUrl}`,
        metadata: {
          inviteId,
          storeId,
          acceptUrl,
        },
      });

      logger.info(`[Team] Resent invitation ${inviteId}`);

      return {
        success: true,
        message: 'Invitation resent successfully',
      };
    } catch (error) {
      logger.error(`[Team] Error resending invitation`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend invitation',
      };
    }
  }
}
