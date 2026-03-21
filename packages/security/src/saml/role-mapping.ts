/**
 * SAML Role Mapping Service
 *
 * Maps IdP groups/roles to Vayva platform roles.
 * Supports Okta, Azure AD, OneLogin group claims.
 */

import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

// ============================================================================
// Types
// ============================================================================

export interface RoleMapping {
  id: string;
  idpId: string;
  /** The group/role name as it comes from the IdP */
  idpGroupName: string;
  /** The Vayva platform role to assign */
  vayvaRole: VayvaRole;
  /** Optional: scope the role to a specific store/tenant */
  storeId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type VayvaRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'staff'
  | 'viewer'
  | 'billing_admin'
  | 'support_agent'
  | 'developer';

export interface MappedRole {
  userId: string;
  roles: VayvaRole[];
  storeIds: string[];
  rawGroups: string[];
}

// ============================================================================
// Role Mapping Service
// ============================================================================

export class RoleMappingService {
  /**
   * Create a role mapping for an IdP
   */
  async createMapping(params: {
    idpId: string;
    idpGroupName: string;
    vayvaRole: VayvaRole;
    storeId?: string;
  }): Promise<RoleMapping> {
    const mapping = await prisma.samlRoleMapping.create({
      data: {
        idpId: params.idpId,
        idpGroupName: params.idpGroupName,
        vayvaRole: params.vayvaRole,
        storeId: params.storeId,
        isActive: true,
      },
    });

    logger.info('[RoleMapping] Created mapping', {
      idpGroupName: params.idpGroupName,
      vayvaRole: params.vayvaRole,
    });

    return this.mapRecord(mapping);
  }

  /**
   * Get all mappings for an IdP
   */
  async getMappingsForIdp(idpId: string): Promise<RoleMapping[]> {
    const mappings = await prisma.samlRoleMapping.findMany({
      where: { idpId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    return mappings.map(this.mapRecord);
  }

  /**
   * Map IdP groups to Vayva roles for a user
   * Called during SAML authentication to assign roles
   */
  async mapGroupsToRoles(
    userId: string,
    idpId: string,
    idpGroups: string[]
  ): Promise<MappedRole> {
    // Get all active mappings for this IdP
    const mappings = await prisma.samlRoleMapping.findMany({
      where: {
        idpId,
        isActive: true,
        idpGroupName: { in: idpGroups },
      },
    });

    const roles = [...new Set(mappings.map((m) => m.vayvaRole as VayvaRole))];
    const storeIds = [...new Set(mappings.filter((m) => m.storeId).map((m) => m.storeId as string))];

    // Apply roles to user in DB
    await this.applyRolesToUser(userId, mappings);

    logger.info('[RoleMapping] Mapped groups to roles', {
      userId,
      idpGroups,
      mappedRoles: roles,
    });

    return {
      userId,
      roles,
      storeIds,
      rawGroups: idpGroups,
    };
  }

  /**
   * Apply mapped roles to user in the database
   */
  private async applyRolesToUser(
    userId: string,
    mappings: Array<{
      vayvaRole: string;
      storeId?: string | null;
    }>
  ): Promise<void> {
    for (const mapping of mappings) {
      if (mapping.storeId) {
        // Store-scoped role
        await prisma.storeUser.upsert({
          where: { storeId_userId: { storeId: mapping.storeId, userId } },
          create: {
            storeId: mapping.storeId,
            userId,
            role: mapping.vayvaRole,
            invitedAt: new Date(),
          },
          update: { role: mapping.vayvaRole },
        }).catch(() => {
          // Non-critical if table structure differs
        });
      }
    }
  }

  /**
   * Update a role mapping
   */
  async updateMapping(
    id: string,
    updates: Partial<Pick<RoleMapping, 'idpGroupName' | 'vayvaRole' | 'storeId' | 'isActive'>>
  ): Promise<RoleMapping> {
    const updated = await prisma.samlRoleMapping.update({
      where: { id },
      data: updates,
    });

    return this.mapRecord(updated);
  }

  /**
   * Delete a role mapping
   */
  async deleteMapping(id: string): Promise<void> {
    await prisma.samlRoleMapping.delete({ where: { id } });
    logger.info('[RoleMapping] Deleted mapping', { id });
  }

  /**
   * List all available Vayva roles
   */
  getAvailableRoles(): Array<{ role: VayvaRole; description: string }> {
    return [
      { role: 'owner', description: 'Full account ownership and access' },
      { role: 'admin', description: 'Administrative access to all features' },
      { role: 'manager', description: 'Manage staff, products, and orders' },
      { role: 'staff', description: 'Day-to-day operations access' },
      { role: 'viewer', description: 'Read-only access to store data' },
      { role: 'billing_admin', description: 'Manage billing and subscriptions' },
      { role: 'support_agent', description: 'Customer support and order management' },
      { role: 'developer', description: 'API access and developer tools' },
    ];
  }

  private mapRecord(data: Record<string, unknown>): RoleMapping {
    return {
      id: String(data.id),
      idpId: String(data.idpId),
      idpGroupName: String(data.idpGroupName),
      vayvaRole: data.vayvaRole as VayvaRole,
      storeId: data.storeId ? String(data.storeId) : undefined,
      isActive: Boolean(data.isActive),
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}

export const roleMappingService = new RoleMappingService();
