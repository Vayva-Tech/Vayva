import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Resource types that can have permissions
 */
export type ResourceType =
  | 'products'
  | 'orders'
  | 'customers'
  | 'analytics'
  | 'settings'
  | 'billing'
  | 'team'
  | 'marketing'
  | 'inventory'
  | 'reports'
  | 'integrations';

/**
 * Action types for permissions
 */
export type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'manage';

/**
 * Permission matrix structure
 */
export interface PermissionMatrix {
  [resource: string]: {
    [action: string]: boolean;
  };
}

/**
 * Role definition with permissions
 */
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: PermissionMatrix;
  inheritance?: string[]; // Parent role IDs
}

/**
 * Default system roles with predefined permissions
 */
const DEFAULT_ROLES: Record<string, RoleDefinition> = {
  OWNER: {
    id: 'role_owner',
    name: 'Owner',
    description: 'Full access to all store features and settings',
    isSystemRole: true,
    permissions: {
      '*': { '*': true }, // Wildcard for full access
    },
  },
  ADMIN: {
    id: 'role_admin',
    name: 'Admin',
    description: 'Manage most store operations except billing and ownership transfer',
    isSystemRole: true,
    permissions: {
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true },
      customers: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true, create: false, edit: false, delete: false },
      settings: { view: true, create: false, edit: true, delete: false },
      team: { view: true, create: true, edit: true, delete: false },
      marketing: { view: true, create: true, edit: true, delete: true },
      inventory: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: false, delete: false },
      integrations: { view: true, create: true, edit: true, delete: false },
    },
    inheritance: [],
  },
  MANAGER: {
    id: 'role_manager',
    name: 'Manager',
    description: 'Day-to-day operations management',
    isSystemRole: true,
    permissions: {
      products: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, create: true, edit: true, delete: false },
      customers: { view: true, create: true, edit: true, delete: false },
      analytics: { view: true },
      inventory: { view: true, create: true, edit: true, delete: false },
      reports: { view: true },
    },
    inheritance: [],
  },
  STAFF: {
    id: 'role_staff',
    name: 'Staff',
    description: 'Basic operational access',
    isSystemRole: true,
    permissions: {
      products: { view: true },
      orders: { view: true, create: true },
      customers: { view: true, create: true },
      inventory: { view: true },
    },
    inheritance: [],
  },
};

export class RBACService {
  constructor(private readonly db = prisma) {}

  /**
   * Initialize default roles in database
   */
  async initializeDefaultRoles(): Promise<void> {
    for (const roleKey of Object.keys(DEFAULT_ROLES)) {
      const roleDef = DEFAULT_ROLES[roleKey];

      await this.db.role.upsert({
        where: { id: roleDef.id },
        update: {
          name: roleDef.name,
          description: roleDef.description,
          isSystemRole: roleDef.isSystemRole,
        },
        create: {
          id: roleDef.id,
          name: roleDef.name,
          description: roleDef.description,
          isSystemRole: roleDef.isSystemRole,
        },
      });

      // Create permissions for this role
      for (const [resource, actions] of Object.entries(roleDef.permissions)) {
        for (const [action, allowed] of Object.entries(actions)) {
          if (allowed) {
            await this.db.permission.upsert({
              where: {
                resource_action_roleKey: {
                  resource,
                  action,
                  roleId: roleDef.id,
                },
              },
              update: { allowed: true },
              create: {
                id: `perm_${resource}_${action}_${roleDef.id}`,
                resource,
                action,
                roleId: roleDef.id,
                allowed: true,
              },
            });
          }
        }
      }
    }

    logger.info('[RBAC] Initialized default system roles');
  }

  /**
   * Check if user has permission for a specific action on a resource
   */
  async hasPermission(
    userId: string,
    storeId: string,
    resource: ResourceType,
    action: ActionType
  ): Promise<boolean> {
    try {
      // Get user's membership
      const membership = await this.db.membership.findFirst({
        where: {
          userId,
          storeId,
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!membership) {
        return false;
      }

      // Check if owner (full access)
      if (membership.roleEnum === 'OWNER') {
        return true;
      }

      const role = membership.role;
      if (!role) {
        return false;
      }

      // Check wildcard permission
      const wildcardPerm = role.permissions.find(
        (p) => p.resource === '*' && p.action === '*' && p.allowed
      );
      if (wildcardPerm) {
        return true;
      }

      // Check specific permission
      const permission = role.permissions.find(
        (p) => p.resource === resource && p.action === action && p.allowed
      );

      return !!permission;
    } catch (error) {
      logger.error(`[RBAC] Error checking permission`, error);
      return false;
    }
  }

  /**
   * Check multiple permissions at once
   */
  async checkPermissions(
    userId: string,
    storeId: string,
    checks: Array<{ resource: ResourceType; action: ActionType }>
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    await Promise.all(
      checks.map(async (check) => {
        const key = `${check.resource}:${check.action}`;
        results[key] = await this.hasPermission(userId, storeId, check.resource, check.action);
      })
    );

    return results;
  }

  /**
   * Create custom role
   */
  async createCustomRole(
    storeId: string,
    name: string,
    description: string,
    permissions: PermissionMatrix,
    inheritance?: string[]
  ): Promise<RoleDefinition> {
    const roleId = `role_custom_${Date.now()}`;

    const role = await this.db.role.create({
      data: {
        id: roleId,
        name,
        description,
        isSystemRole: false,
        storeId,
      },
    });

    // Create permissions
    for (const [resource, actions] of Object.entries(permissions)) {
      for (const [action, allowed] of Object.entries(actions)) {
        if (allowed) {
          await this.db.permission.create({
            data: {
              id: `perm_${resource}_${action}_${roleId}`,
              resource,
              action,
              roleId: role.id,
              allowed: true,
            },
          });
        }
      }
    }

    // Handle inheritance
    if (inheritance && inheritance.length > 0) {
      await this.db.roleInheritance.createMany({
        data: inheritance.map((parentId) => ({
          roleId: role.id,
          inheritsFromId: parentId,
        })),
      });
    }

    logger.info(`[RBAC] Created custom role ${name} (${roleId})`);

    return {
      id: role.id,
      name,
      description,
      isSystemRole: false,
      permissions,
      inheritance,
    };
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(
    roleId: string,
    permissions: PermissionMatrix
  ): Promise<void> {
    const role = await this.db.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.isSystemRole) {
      throw new Error('Cannot modify system roles');
    }

    // Remove existing permissions
    await this.db.permission.deleteMany({
      where: { roleId },
    });

    // Add new permissions
    for (const [resource, actions] of Object.entries(permissions)) {
      for (const [action, allowed] of Object.entries(actions)) {
        if (allowed) {
          await this.db.permission.create({
            data: {
              id: `perm_${resource}_${action}_${roleId}`,
              resource,
              action,
              roleId,
              allowed: true,
            },
          });
        }
      }
    }

    logger.info(`[RBAC] Updated permissions for role ${roleId}`);
  }

  /**
   * Assign role to team member
   */
  async assignRole(
    memberId: string,
    roleId: string,
    storeId: string
  ): Promise<void> {
    const membership = await this.db.membership.findFirst({
      where: { id: memberId, storeId },
    });

    if (!membership) {
      throw new Error('Membership not found');
    }

    const role = await this.db.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Verify role belongs to same store or is system role
    if (!role.isSystemRole && role.storeId !== storeId) {
      throw new Error('Invalid role for this store');
    }

    await this.db.membership.update({
      where: { id: memberId },
      data: {
        roleId,
        roleEnum: undefined, // Clear enum role, use custom role instead
      },
    });

    logger.info(`[RBAC] Assigned role ${roleId} to member ${memberId}`);
  }

  /**
   * Get effective permissions for a user (including inherited permissions)
   */
  async getEffectivePermissions(userId: string, storeId: string): Promise<PermissionMatrix> {
    const membership = await this.db.membership.findFirst({
      where: { userId, storeId },
      include: {
        role: {
          include: {
            permissions: true,
            inheritedFrom: {
              include: {
                parent: {
                  include: {
                    permissions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return {};
    }

    // If owner, return wildcard
    if (membership.roleEnum === 'OWNER') {
      return { '*': { '*': true } };
    }

    const role = membership.role;
    if (!role) {
      return {};
    }

    const effectivePerms: PermissionMatrix = {};

    // Add direct permissions
    role.permissions.forEach((perm) => {
      if (perm.allowed) {
        if (!effectivePerms[perm.resource]) {
          effectivePerms[perm.resource] = {};
        }
        effectivePerms[perm.resource][perm.action] = true;
      }
    });

    // Add inherited permissions
    role.inheritedFrom.forEach((inheritance) => {
      inheritance.parent.permissions.forEach((perm) => {
        if (perm.allowed) {
          if (!effectivePerms[perm.resource]) {
            effectivePerms[perm.resource] = {};
          }
          effectivePerms[perm.resource][perm.action] = true;
        }
      });
    });

    return effectivePerms;
  }

  /**
   * Get all available resources and actions for UI building
   */
  getAvailablePermissions(): Array<{
    resource: ResourceType;
    actions: ActionType[];
    label: string;
  }> {
    return [
      { resource: 'products', actions: ['view', 'create', 'edit', 'delete'], label: 'Products' },
      { resource: 'orders', actions: ['view', 'create', 'edit', 'delete'], label: 'Orders' },
      { resource: 'customers', actions: ['view', 'create', 'edit', 'delete'], label: 'Customers' },
      { resource: 'analytics', actions: ['view', 'create', 'edit', 'delete'], label: 'Analytics' },
      { resource: 'settings', actions: ['view', 'create', 'edit', 'delete'], label: 'Settings' },
      { resource: 'billing', actions: ['view', 'create', 'edit', 'delete'], label: 'Billing' },
      { resource: 'team', actions: ['view', 'create', 'edit', 'delete'], label: 'Team' },
      { resource: 'marketing', actions: ['view', 'create', 'edit', 'delete'], label: 'Marketing' },
      { resource: 'inventory', actions: ['view', 'create', 'edit', 'delete'], label: 'Inventory' },
      { resource: 'reports', actions: ['view', 'create', 'edit', 'delete'], label: 'Reports' },
      { resource: 'integrations', actions: ['view', 'create', 'edit', 'delete'], label: 'Integrations' },
    ];
  }

  /**
   * Delete custom role
   */
  async deleteCustomRole(roleId: string, storeId: string): Promise<void> {
    const role = await this.db.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.isSystemRole) {
      throw new Error('Cannot delete system roles');
    }

    if (role.storeId !== storeId) {
      throw new Error('Role does not belong to this store');
    }

    // Check if role is in use
    const membershipsUsingRole = await this.db.membership.count({
      where: { roleId },
    });

    if (membershipsUsingRole > 0) {
      throw new Error('Cannot delete role that is in use');
    }

    await this.db.permission.deleteMany({
      where: { roleId },
    });

    await this.db.role.delete({
      where: { id: roleId },
    });

    logger.info(`[RBAC] Deleted custom role ${roleId}`);
  }

  /**
   * Auto-assign role based on email domain matching
   */
  async autoAssignRoleByEmailDomain(
    email: string,
    storeId: string,
    domainRoleMap: Record<string, string>
  ): Promise<string | null> {
    const emailDomain = email.split('@')[1];
    if (!emailDomain) {
      return null;
    }

    const roleId = domainRoleMap[emailDomain];
    if (!roleId) {
      return null;
    }

    return roleId;
  }
}
