"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, Permission, Role } from "@/lib/permissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { user } = useAuth();
  const role = (user?.role as unknown as Role) || "staff";

  if (!hasPermission(role, permission)) {
    return fallback;
  }

  return <>{children}</>;
}

interface FeatureGuardProps {
  children: ReactNode;
  feature: "b2b" | "events" | "nonprofit";
  fallback?: ReactNode;
}

export function FeatureGuard({ children, feature, fallback = null }: FeatureGuardProps) {
  const { user } = useAuth();
  const role = (user?.role as unknown as Role) || "staff";

  const featurePermissions: Record<string, Permission> = {
    b2b: "b2b:view",
    events: "events:view",
    nonprofit: "nonprofit:view",
  };

  if (!hasPermission(role, featurePermissions[feature])) {
    return fallback;
  }

  return <>{children}</>;
}
