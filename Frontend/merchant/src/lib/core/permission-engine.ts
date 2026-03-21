import { ROLE_PERMISSIONS, ROLES } from "@/lib/team/permissions";
/**
 * Unified Permission Engine
 * Supports:
 * 1. Role-based permissions (is the role allowed?)
 * 2. Wildcards (e.g. *)
 * 3. Future: Plan-based gating and KYC gating
 */
export class PermissionEngine {
    /**
     * Core check logic
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static can(user: any, permission: string) {
        const normalizedRole = String(user?.role || "").toLowerCase();
        // 1. Owners have all permissions
        if (user.isOwner || normalizedRole === ROLES.OWNER)
            return true;
        const allowedPermissions = ROLE_PERMISSIONS[normalizedRole] || [];
        // 2. Check for global wildcard
        if (allowedPermissions.includes("*"))
            return true;
        // 3. Exact match
        if (allowedPermissions.includes(permission))
            return true;
        // 4. Group wildcard (e.g. commerce:* or orders:*)
        const group = permission.split(':')[0];
        if (allowedPermissions.includes(`${group}:*`))
            return true;
        return false;
    }
    /**
     * Check multiple permissions (must have all)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static canAll(user: any, permissions: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return permissions.every((p: string) => this.can(user, p));
    }
    /**
     * Check multiple permissions (must have any)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static canAny(user: any, permissions: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return permissions.some((p: string) => this.can(user, p));
    }
}
