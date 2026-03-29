import { prisma, Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { generateSecureToken } from '../../lib/security/crypto';

export class TeamManagementService {
  constructor(private readonly db = prisma) {}

  async inviteTeamMember(
    storeId: string,
    email: string,
    role: string,
    permissions?: Record<string, boolean>,
    invitedByUserId?: string
  ) {
    // Check if user already exists
    const existingUser = await this.db.user.findFirst({
      where: { email },
    });

    const inviteToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.db.teamInvitation.create({
      data: {
        id: `inv-${Date.now()}`,
        storeId,
        email,
        role,
        permissions: permissions as Prisma.JsonObject,
        invitedById: invitedByUserId,
        token: inviteToken,
        expiresAt,
        status: 'PENDING',
      },
    });

    // TODO: Send invitation email
    logger.info(`[Team] Sent invitation ${invitation.id} to ${email} for store ${storeId}`);
    
    return {
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    };
  }

  async acceptInvitation(
    inviteToken: string,
    userId: string
  ) {
    const invitation = await this.db.teamInvitation.findFirst({
      where: { token: inviteToken },
    });

    if (!invitation) {
      throw new Error('Invalid invitation');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation already used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error('Invitation expired');
    }

    // Add user to store
    const teamMember = await this.db.storeTeam.create({
      data: {
        id: `team-${Date.now()}`,
        storeId: invitation.storeId,
        userId,
        role: invitation.role,
        permissions: invitation.permissions as Prisma.JsonObject,
        joinedAt: new Date(),
      },
    });

    // Mark invitation as accepted
    await this.db.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    logger.info(`[Team] User ${userId} accepted invitation ${invitation.id}`);
    
    return {
      success: true,
      teamMember: {
        id: teamMember.id,
        storeId: teamMember.storeId,
        role: teamMember.role,
      },
    };
  }

  async removeTeamMember(memberId: string, storeId: string) {
    const teamMember = await this.db.storeTeam.findFirst({
      where: { id: memberId },
    });

    if (!teamMember || teamMember.storeId !== storeId) {
      throw new Error('Team member not found');
    }

    // Prevent removing the owner
    if (teamMember.role === 'OWNER') {
      throw new Error('Cannot remove store owner');
    }

    await this.db.storeTeam.delete({
      where: { id: memberId },
    });

    logger.info(`[Team] Removed team member ${memberId} from store ${storeId}`);
    
    return { success: true };
  }

  async updateRole(
    memberId: string,
    storeId: string,
    newRole: string,
    newPermissions?: Record<string, boolean>
  ) {
    const teamMember = await this.db.storeTeam.findFirst({
      where: { id: memberId },
    });

    if (!teamMember || teamMember.storeId !== storeId) {
      throw new Error('Team member not found');
    }

    const updated = await this.db.storeTeam.update({
      where: { id: memberId },
      data: {
        role: newRole,
        permissions: newPermissions as Prisma.JsonObject,
      },
    });

    logger.info(`[Team] Updated role for ${memberId} to ${newRole}`);
    
    return {
      success: true,
      teamMember: {
        id: updated.id,
        role: updated.role,
        permissions: updated.permissions,
      },
    };
  }

  async transferOwnership(
    newOwnerId: string,
    storeId: string,
    currentOwnerId: string
  ) {
    // Verify current owner
    const currentOwner = await this.db.storeTeam.findFirst({
      where: {
        storeId,
        userId: currentOwnerId,
        role: 'OWNER',
      },
    });

    if (!currentOwner) {
      throw new Error('Current user is not the store owner');
    }

    // Update old owner to admin
    await this.db.storeTeam.update({
      where: { id: currentOwner.id },
      data: { role: 'ADMIN' },
    });

    // Update new owner
    const newOwner = await this.db.storeTeam.update({
      where: {
        storeId,
        userId: newOwnerId,
      },
      data: { role: 'OWNER' },
    });

    // Update store owner reference
    await this.db.store.update({
      where: { id: storeId },
      data: { ownerId: newOwnerId },
    });

    logger.info(`[Team] Transferred ownership of store ${storeId} to user ${newOwnerId}`);
    
    return { success: true };
  }

  async getTeamMembers(storeId: string) {
    const members = await this.db.storeTeam.findMany({
      where: { storeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      avatar: m.user.avatar,
      role: m.role,
      permissions: m.permissions as Record<string, boolean>,
      joinedAt: m.joinedAt,
      lastActive: m.lastActiveAt,
    }));
  }

  async getAuditLog(storeId: string, dateRange?: { start: Date; end: Date }) {
    const where: any = { storeId };

    if (dateRange) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const logs = await this.db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      userId: log.userId,
      userEmail: log.user?.email,
      userName: `${log.user?.firstName || ''} ${log.user?.lastName || ''}`,
      timestamp: log.createdAt,
      metadata: log.metadata as Record<string, unknown>,
      ipAddress: log.ipAddress,
    }));
  }

  async revokeAccess(memberId: string, storeId: string, reason: string) {
    const teamMember = await this.db.storeTeam.findFirst({
      where: { id: memberId },
    });

    if (!teamMember || teamMember.storeId !== storeId) {
      throw new Error('Team member not found');
    }

    await this.db.storeTeam.update({
      where: { id: memberId },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspensionReason: reason,
      },
    });

    logger.warn(`[Team] Revoked access for ${memberId}, reason: ${reason}`);
    
    return { success: true };
  }
}
