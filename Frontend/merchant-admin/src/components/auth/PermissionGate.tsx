"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { can as checkPermission } from "@/lib/team/permissions";
type PermissionKey = string;

interface PermissionGateProps {
  permission?: PermissionKey;
  all?: PermissionKey[];
  any?: PermissionKey[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGate
 * Declarative way to hide UI elements based on permissions.
 *
 * Usage:
 * <PermissionGate permission="orders:manage">
 *    <Button>Refund Order</Button>
 * </PermissionGate>
 */
interface ActiveUser extends Record<string, unknown> {
  role: string;
}

export const PermissionGate = ({
  permission,
  all,
  any,
  fallback = null,
  children,
}: PermissionGateProps): React.ReactElement | null => {
  const { merchant, user } = useAuth(); // Context might provide 'user' which is the session

  // Normalize user context for the engine
  const activeUser = (user || merchant) as ActiveUser | null;
  if (!activeUser) return <>{fallback}</>;

  const userCtx = {
    role: activeUser.role || "viewer",
    isOwner: activeUser.role === "owner",
  };

  let allowed = false;

  if (permission) {
    allowed = checkPermission(userCtx.role, permission);
  } else if (all) {
    allowed = all.every((p) => checkPermission(userCtx.role, p));
  } else if (any) {
    allowed = any.some((p) => checkPermission(userCtx.role, p));
  }

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
};
