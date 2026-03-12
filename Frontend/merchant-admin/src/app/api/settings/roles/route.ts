import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

/**
 * GET /api/settings/roles
 * List custom roles for the current store.
 */
export const GET = withVayvaAPI(PERMISSIONS.TEAM_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const roles = await prisma.role?.findMany({
            where: { storeId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                },
                _count: {
                    select: { memberships: true }
                }
            }
        });
        return NextResponse.json(roles, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[SETTINGS_ROLES_GET] Failed to fetch roles", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

/**
 * POST /api/settings/roles
 * Create or update a custom role.
 */
export const POST = withVayvaAPI(PERMISSIONS.TEAM_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { id, name, description, permissionIds } = body;
        
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const role = await prisma.$transaction(async (tx: any) => {
            // 1. Create/Update the role
            const r = await tx.role?.upsert({
                where: { id: id || "new-role" },
                update: { name, description },
                create: {
                    storeId,
                    name,
                    description
                }
            });

            // 2. Sync permissions
            if (permissionIds && Array.isArray(permissionIds)) {
                // Delete old
                await tx.rolePermission?.deleteMany({ where: { roleId: r.id } });
                
                // Map permission strings to Permission table IDs (or create them)
                for (const permName of permissionIds) {
                    let p = await tx.permission?.findFirst({ where: { key: permName } });
                    if (!p) {
                        p = await tx.permission?.create({ data: { key: permName, group: "custom" } });
                    }
                    await tx.rolePermission?.create({
                        data: {
                            roleId: r.id,
                            permissionId: p.id
                        }
                    });
                }
            }
            return r;
        });

        return NextResponse.json(role);
    }
    catch (error: unknown) {
        logger.error("[SETTINGS_ROLES_POST] Failed to create role", { storeId, error });
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
});
