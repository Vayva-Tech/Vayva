import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * GET /api/settings/roles
 * List custom roles for the current store.
 */
export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (req, { storeId }) => {
    try {
      const roles = await prisma.role.findMany({
        where: { storeId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { memberships: true },
          },
        },
      });
      return NextResponse.json(roles, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[SETTINGS_ROLES_GET] Failed to fetch roles", { error, storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * POST /api/settings/roles
 * Create or update a custom role.
 */
export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};
      const id = typeof b.id === "string" ? b.id : undefined;
      const name = typeof b.name === "string" ? b.name : undefined;
      const description =
        typeof b.description === "string" ? b.description : undefined;
      const permissionIds = Array.isArray(b.permissionIds)
        ? b.permissionIds
        : undefined;

      if (!name) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 },
        );
      }

      const role = await prisma.$transaction(async (tx) => {
        // Generate unique key from name
        const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        
        // 1. Create/Update the role
        const r = await tx.role.upsert({
          where: { id: id || "new-role" },
          update: { name, description },
          create: {
            name,
            description,
            key,
            storeId,
          },
        });

        // 2. Sync permissions
        if (permissionIds && Array.isArray(permissionIds)) {
          // Delete old
          await tx.rolePermission.deleteMany({ where: { roleId: r.id } });

          // Map permission strings to Permission table IDs (or create them)
          for (const permName of permissionIds) {
            let p = await tx.permission.findFirst({ where: { key: permName } });
            if (!p) {
              p = await tx.permission.create({
                data: { key: permName, group: "custom" },
              });
            }
            await tx.rolePermission.create({
              data: {
                roleId: r.id,
                permissionId: p.id,
              },
            });
          }
        }
        return r;
      });

      return NextResponse.json(role);
    } catch (error: unknown) {
      logger.error("[SETTINGS_ROLES_POST] Failed to create role", { error, storeId, userId: user.id });
      return NextResponse.json(
        { error: "Failed to create role" },
        { status: 500 },
      );
    }
  },
);
