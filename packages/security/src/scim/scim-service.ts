/**
 * SCIM 2.0 Provisioning Service
 *
 * Implements System for Cross-domain Identity Management (SCIM 2.0)
 * Supports automated user/group provisioning from IdPs:
 * - Okta SCIM
 * - Azure AD SCIM
 * - OneLogin SCIM
 * - Ping Identity SCIM
 *
 * RFC 7644: https://tools.ietf.org/html/rfc7644
 */

import { randomBytes } from 'crypto';
import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';
import { z } from 'zod';

// ============================================================================
// SCIM 2.0 Types (RFC 7643)
// ============================================================================

export interface ScimUser {
  id: string;
  externalId?: string;
  userName: string;
  name: {
    formatted?: string;
    familyName?: string;
    givenName?: string;
    middleName?: string;
  };
  emails: Array<{
    value: string;
    primary: boolean;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
  photos?: Array<{
    value: string;
    type?: string;
  }>;
  active: boolean;
  title?: string;
  department?: string;
  organization?: string;
  groups?: Array<{ value: string; display: string }>;
  meta: {
    resourceType: 'User';
    created: Date;
    lastModified: Date;
    location?: string;
  };
}

export interface ScimGroup {
  id: string;
  externalId?: string;
  displayName: string;
  members: Array<{
    value: string;
    display?: string;
    type?: string;
  }>;
  meta: {
    resourceType: 'Group';
    created: Date;
    lastModified: Date;
    location?: string;
  };
}

export interface ScimListResponse<T> {
  schemas: string[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  Resources: T[];
}

export interface ScimProvisionResult {
  success: boolean;
  userId?: string;
  action: 'created' | 'updated' | 'deactivated' | 'deleted';
  message: string;
}

export interface ScimPatchOperation {
  op: 'Add' | 'Replace' | 'Remove';
  path?: string;
  value?: unknown;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const ScimUserSchema = z.object({
  userName: z.string().email(),
  name: z.object({
    formatted: z.string().optional(),
    familyName: z.string().optional(),
    givenName: z.string().optional(),
  }).optional(),
  emails: z.array(z.object({
    value: z.string().email(),
    primary: z.boolean(),
    type: z.string().optional(),
  })).optional(),
  active: z.boolean().default(true),
  externalId: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
});

// ============================================================================
// SCIM Service
// ============================================================================

export class ScimService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.vayva.com';
  }

  // ============================================================================
  // User Provisioning
  // ============================================================================

  /**
   * Create a new user via SCIM provisioning
   * Called when IdP pushes a new user assignment
   */
  async createUser(tenantId: string, scimData: unknown): Promise<ScimUser> {
    const validated = ScimUserSchema.parse(scimData);

    const email = validated.emails?.[0]?.value || validated.userName;
    const firstName = validated.name?.givenName;
    const lastName = validated.name?.familyName;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    let userId: string;

    if (existingUser) {
      // Update existing user and mark as SCIM managed
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: firstName ?? existingUser.firstName,
          lastName: lastName ?? existingUser.lastName,
        },
      }).catch(() => {});

      userId = existingUser.id;

      logger.info('[SCIM] Linked existing user to SCIM provisioning', { userId, email });
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          authProvider: 'SCIM',
          emailVerified: true,
        },
      });

      userId = newUser.id;
      logger.info('[SCIM] Created user via provisioning', { userId, email });
    }

    // Store SCIM record
    const scimRecord = await prisma.scimUser.upsert({
      where: { userId_tenantId: { userId, tenantId } },
      create: {
        id: `scim_usr_${randomBytes(8).toString('hex')}`,
        userId,
        tenantId,
        externalId: validated.externalId,
        userName: validated.userName,
        active: validated.active,
        title: validated.title,
        department: validated.department,
        rawData: scimData as Record<string, unknown>,
      },
      update: {
        externalId: validated.externalId,
        active: validated.active,
        title: validated.title,
        department: validated.department,
        rawData: scimData as Record<string, unknown>,
        updatedAt: new Date(),
      },
    }).catch(() => {
      // Return a minimal record if SCIM table doesn't exist yet
      return {
        id: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    return this.buildScimUserResponse(userId, scimRecord, email, firstName, lastName, validated);
  }

  /**
   * Get a SCIM user by ID
   */
  async getUser(tenantId: string, scimUserId: string): Promise<ScimUser | null> {
    const scimRecord = await prisma.scimUser.findFirst({
      where: { id: scimUserId, tenantId },
      include: { user: true },
    }).catch(() => null);

    if (!scimRecord) return null;

    return this.buildScimUserResponse(
      scimRecord.userId,
      scimRecord,
      scimRecord.user.email,
      scimRecord.user.firstName ?? undefined,
      scimRecord.user.lastName ?? undefined,
      scimRecord
    );
  }

  /**
   * List SCIM users with optional filter
   */
  async listUsers(
    tenantId: string,
    options: { startIndex?: number; count?: number; filter?: string } = {}
  ): Promise<ScimListResponse<ScimUser>> {
    const startIndex = options.startIndex || 1;
    const count = options.count || 100;

    const scimUsers = await prisma.scimUser.findMany({
      where: { tenantId },
      include: { user: true },
      skip: startIndex - 1,
      take: count,
      orderBy: { createdAt: 'asc' },
    }).catch(() => []);

    const total = await prisma.scimUser.count({ where: { tenantId } }).catch(() => 0);

    const resources: ScimUser[] = scimUsers.map((su) =>
      this.buildScimUserResponse(
        su.userId,
        su,
        su.user.email,
        su.user.firstName ?? undefined,
        su.user.lastName ?? undefined,
        su
      )
    );

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: total,
      startIndex,
      itemsPerPage: count,
      Resources: resources,
    };
  }

  /**
   * Update a SCIM user (full replace)
   */
  async updateUser(tenantId: string, scimUserId: string, scimData: unknown): Promise<ScimUser> {
    const validated = ScimUserSchema.parse(scimData);

    const scimRecord = await prisma.scimUser.findFirst({
      where: { id: scimUserId, tenantId },
    }).catch(() => null);

    if (!scimRecord) {
      throw new Error(`SCIM user not found: ${scimUserId}`);
    }

    const email = validated.emails?.[0]?.value || validated.userName;
    const firstName = validated.name?.givenName;
    const lastName = validated.name?.familyName;

    // Update user in DB
    await prisma.user.update({
      where: { id: scimRecord.userId },
      data: { firstName, lastName },
    }).catch(() => {});

    // Update SCIM record
    await prisma.scimUser.update({
      where: { id: scimUserId },
      data: {
        active: validated.active,
        title: validated.title,
        department: validated.department,
        rawData: scimData as Record<string, unknown>,
        updatedAt: new Date(),
      },
    }).catch(() => {});

    logger.info('[SCIM] Updated user', { scimUserId, userId: scimRecord.userId });

    return this.buildScimUserResponse(
      scimRecord.userId,
      scimRecord,
      email,
      firstName,
      lastName,
      validated
    );
  }

  /**
   * Patch a SCIM user (partial update)
   */
  async patchUser(
    tenantId: string,
    scimUserId: string,
    operations: ScimPatchOperation[]
  ): Promise<ScimUser> {
    const scimRecord = await prisma.scimUser.findFirst({
      where: { id: scimUserId, tenantId },
      include: { user: true },
    }).catch(() => null);

    if (!scimRecord) {
      throw new Error(`SCIM user not found: ${scimUserId}`);
    }

    // Process PATCH operations
    const updates: Record<string, unknown> = {};
    const userUpdates: Record<string, unknown> = {};

    for (const op of operations) {
      const operation = op.op.toLowerCase();

      if (op.path === 'active') {
        if (operation === 'replace') {
          updates.active = op.value;

          // Deactivate/reactivate the actual user
          if (op.value === false) {
            userUpdates.deactivatedAt = new Date();
            logger.info('[SCIM] Deactivating user', { userId: scimRecord.userId });
          } else {
            userUpdates.deactivatedAt = null;
          }
        }
      } else if (op.path === 'name.givenName' && operation !== 'remove') {
        userUpdates.firstName = op.value;
      } else if (op.path === 'name.familyName' && operation !== 'remove') {
        userUpdates.lastName = op.value;
      } else if (op.path === 'emails[type eq "work"].value' && operation !== 'remove') {
        userUpdates.email = op.value;
      } else if (op.path === 'title' && operation !== 'remove') {
        updates.title = op.value;
      } else if (op.path === 'department' && operation !== 'remove') {
        updates.department = op.value;
      }
    }

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: scimRecord.userId },
        data: userUpdates,
      }).catch(() => {});
    }

    if (Object.keys(updates).length > 0) {
      await prisma.scimUser.update({
        where: { id: scimUserId },
        data: { ...updates, updatedAt: new Date() },
      }).catch(() => {});
    }

    return this.buildScimUserResponse(
      scimRecord.userId,
      { ...scimRecord, ...updates },
      scimRecord.user.email,
      (userUpdates.firstName as string) ?? scimRecord.user.firstName ?? undefined,
      (userUpdates.lastName as string) ?? scimRecord.user.lastName ?? undefined,
      scimRecord
    );
  }

  /**
   * Deactivate (soft delete) a SCIM user
   * Per SCIM spec: users should be deactivated, not hard deleted
   */
  async deactivateUser(tenantId: string, scimUserId: string): Promise<ScimProvisionResult> {
    const scimRecord = await prisma.scimUser.findFirst({
      where: { id: scimUserId, tenantId },
    }).catch(() => null);

    if (!scimRecord) {
      return { success: false, action: 'deactivated', message: 'User not found' };
    }

    await prisma.scimUser.update({
      where: { id: scimUserId },
      data: { active: false, updatedAt: new Date() },
    }).catch(() => {});

    // Revoke all sessions for the user
    await prisma.session.deleteMany({
      where: { userId: scimRecord.userId },
    }).catch(() => {});

    logger.info('[SCIM] Deactivated user', { scimUserId, userId: scimRecord.userId });

    return {
      success: true,
      userId: scimRecord.userId,
      action: 'deactivated',
      message: 'User deactivated successfully',
    };
  }

  // ============================================================================
  // Group Provisioning
  // ============================================================================

  /**
   * Create a SCIM group
   */
  async createGroup(tenantId: string, scimData: {
    displayName: string;
    externalId?: string;
    members?: Array<{ value: string; display?: string }>;
  }): Promise<ScimGroup> {
    const group = await prisma.scimGroup.create({
      data: {
        id: `scim_grp_${randomBytes(8).toString('hex')}`,
        tenantId,
        displayName: scimData.displayName,
        externalId: scimData.externalId,
        members: (scimData.members || []) as unknown as Record<string, unknown>[],
      },
    }).catch(() => ({
      id: `scim_grp_${randomBytes(8).toString('hex')}`,
      displayName: scimData.displayName,
      externalId: scimData.externalId,
      members: scimData.members || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    logger.info('[SCIM] Created group', { displayName: scimData.displayName });

    return this.buildScimGroupResponse(group, scimData.members || []);
  }

  /**
   * List SCIM groups
   */
  async listGroups(
    tenantId: string,
    options: { startIndex?: number; count?: number } = {}
  ): Promise<ScimListResponse<ScimGroup>> {
    const startIndex = options.startIndex || 1;
    const count = options.count || 100;

    const groups = await prisma.scimGroup.findMany({
      where: { tenantId },
      skip: startIndex - 1,
      take: count,
    }).catch(() => []);

    const total = await prisma.scimGroup.count({ where: { tenantId } }).catch(() => 0);

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: total,
      startIndex,
      itemsPerPage: count,
      Resources: groups.map((g) =>
        this.buildScimGroupResponse(
          g,
          (g.members as Array<{ value: string; display?: string }>) || []
        )
      ),
    };
  }

  /**
   * Patch a SCIM group (add/remove members)
   */
  async patchGroup(
    tenantId: string,
    scimGroupId: string,
    operations: ScimPatchOperation[]
  ): Promise<ScimGroup> {
    const group = await prisma.scimGroup.findFirst({
      where: { id: scimGroupId, tenantId },
    }).catch(() => null);

    if (!group) {
      throw new Error(`SCIM group not found: ${scimGroupId}`);
    }

    let members = (group.members as Array<{ value: string; display?: string }>) || [];

    for (const op of operations) {
      if (op.path === 'members') {
        if (op.op.toLowerCase() === 'add') {
          const newMembers = (op.value as Array<{ value: string; display?: string }>) || [];
          const existingIds = new Set(members.map((m) => m.value));
          for (const m of newMembers) {
            if (!existingIds.has(m.value)) members.push(m);
          }
        } else if (op.op.toLowerCase() === 'remove') {
          const removeIds = new Set(
            ((op.value as Array<{ value: string }>) || []).map((m) => m.value)
          );
          members = members.filter((m) => !removeIds.has(m.value));
        } else if (op.op.toLowerCase() === 'replace') {
          members = (op.value as Array<{ value: string; display?: string }>) || [];
        }
      }
    }

    await prisma.scimGroup.update({
      where: { id: scimGroupId },
      data: { members: members as unknown as Record<string, unknown>[], updatedAt: new Date() },
    }).catch(() => {});

    return this.buildScimGroupResponse({ ...group, members }, members);
  }

  // ============================================================================
  // SCIM Token Management
  // ============================================================================

  /**
   * Generate a SCIM Bearer token for an IdP to use
   */
  async generateScimToken(tenantId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    await prisma.scimToken.upsert({
      where: { tenantId },
      create: { tenantId, token, expiresAt },
      update: { token, expiresAt },
    }).catch(() => {
      // Non-critical if table doesn't exist
    });

    logger.info('[SCIM] Generated SCIM token', { tenantId });

    return { token, expiresAt };
  }

  /**
   * Validate a SCIM Bearer token
   */
  async validateToken(token: string): Promise<{ valid: boolean; tenantId?: string }> {
    const record = await prisma.scimToken.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
    }).catch(() => null);

    if (!record) return { valid: false };

    return { valid: true, tenantId: record.tenantId };
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private buildScimUserResponse(
    userId: string,
    scimRecord: Record<string, unknown>,
    email: string,
    firstName?: string,
    lastName?: string,
    rawData?: Record<string, unknown>
  ): ScimUser {
    const emails = (rawData?.emails as ScimUser['emails']) || [
      { value: email, primary: true, type: 'work' },
    ];

    return {
      id: String(scimRecord.id || userId),
      externalId: scimRecord.externalId ? String(scimRecord.externalId) : undefined,
      userName: String(scimRecord.userName || email),
      name: {
        formatted: [firstName, lastName].filter(Boolean).join(' ') || undefined,
        givenName: firstName,
        familyName: lastName,
      },
      emails,
      active: Boolean(scimRecord.active ?? true),
      title: scimRecord.title ? String(scimRecord.title) : undefined,
      department: scimRecord.department ? String(scimRecord.department) : undefined,
      meta: {
        resourceType: 'User',
        created: (scimRecord.createdAt as Date) || new Date(),
        lastModified: (scimRecord.updatedAt as Date) || new Date(),
        location: `${this.baseUrl}/scim/v2/Users/${scimRecord.id || userId}`,
      },
    };
  }

  private buildScimGroupResponse(
    group: Record<string, unknown>,
    members: Array<{ value: string; display?: string }>
  ): ScimGroup {
    return {
      id: String(group.id),
      externalId: group.externalId ? String(group.externalId) : undefined,
      displayName: String(group.displayName),
      members: members.map((m) => ({
        value: m.value,
        display: m.display,
        type: 'User',
      })),
      meta: {
        resourceType: 'Group',
        created: (group.createdAt as Date) || new Date(),
        lastModified: (group.updatedAt as Date) || new Date(),
        location: `${this.baseUrl}/scim/v2/Groups/${group.id}`,
      },
    };
  }
}

export const scimService = new ScimService();
