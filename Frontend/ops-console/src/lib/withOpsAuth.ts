import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "./ops-auth";
import { OpsUser, OpsSession } from "@vayva/db";
import { hasPermission, canAccess, isOpsRole, OpsRole, PermissionCategory, PermissionAction } from "./roles";

/**
 * Ops API Auth Wrapper
 *
 * This wrapper makes auth enforcement STRUCTURAL - impossible to forget.
 * All Ops API routes MUST use this wrapper unless explicitly whitelisted.
 *
 * @example
 * ```typescript
 * export const GET = withOpsAuth(async (req, { user, session }) => {
 *   // user and session are guaranteed to exist
 *   return NextResponse.json({ data: "protected" });
 * });
 * ```
 *
 * @example With role requirement
 * ```typescript
 * export const POST = withOpsAuth(
 *   async (req, { user }) => {
 *     // Only OPS_OWNER can access
 *     return NextResponse.json({ success: true });
 *   },
 *   { requiredRole: "OPS_OWNER" }
 * );
 * ```
 *
 * @example With permission requirement (new)
 * ```typescript
 * export const POST = withOpsAuth(
 *   async (req, { user }) => {
 *     // Any role with 'approve' permission on 'kyc' can access
 *     return NextResponse.json({ success: true });
 *   },
 *   { requiredPermission: { category: "kyc", action: "approve" } }
 * );
 * ```
 */

export interface OpsAuthContext {
  user?: OpsUser;
  session?: OpsSession;
}

export interface PermissionRequirement {
  category: PermissionCategory;
  action: PermissionAction;
}

export interface WithOpsAuthOptions {
  /** Required role level (legacy - use requiredPermission for new code) */
  requiredRole?: OpsRole;
  /** Required permission (recommended for new code) */
  requiredPermission?: PermissionRequirement;
  /** Required category access (allows any action in category) */
  requiredCategory?: PermissionCategory;
  /** Skip auth check (ONLY for health/ping endpoints) */
  skipAuth?: boolean;
}

type OpsRouteHandler = (
  req: NextRequest,
  context: OpsAuthContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an Ops API route handler with authentication and authorization
 */
export function withOpsAuth(
  handler: OpsRouteHandler,
  options: WithOpsAuthOptions = {},
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    try {
      // Skip auth for whitelisted endpoints
      if (options.skipAuth) {
        // Still provide empty context for type safety
        return handler(req, {});
      }

      // Require session
      const authContext = await OpsAuthService.requireSession();
      if (!authContext.user) {
        throw new Error("Unauthorized");
      }
      const userRole = authContext.user.role;
      if (!isOpsRole(userRole)) {
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 403 },
        );
      }

      // Check permission if specified (new style)
      if (options.requiredPermission) {
        const { category, action } = options.requiredPermission;
        if (!hasPermission(userRole, category, action)) {
          return NextResponse.json(
            { 
              error: `Insufficient permissions. Required: ${action} on ${category}, Current role: ${userRole}`,
              requiredPermission: options.requiredPermission,
            },
            { status: 403 }
          );
        }
      }

      // Check category access if specified
      if (options.requiredCategory) {
        if (!canAccess(userRole, options.requiredCategory)) {
          return NextResponse.json(
            { 
              error: `Access denied to category: ${options.requiredCategory}`,
              requiredCategory: options.requiredCategory,
            },
            { status: 403 }
          );
        }
      }

      // Check role if specified (legacy style - mutually exclusive with permissions)
      if (options.requiredRole && !options.requiredPermission && !options.requiredCategory) {
        (OpsAuthService as any).requireRole(authContext.user, options.requiredRole);
      }

      // Call handler with authenticated context
      return handler(req, authContext);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      // Handle auth errors
      const errMsg = error instanceof Error ? error.message : String(error);
      if (
        errMsg === "Unauthorized" ||
        errMsg.includes("Insufficient permissions") ||
        errMsg.includes("Access denied")
      ) {
        return NextResponse.json({ error: errMsg }, { status: 401 });
      }

      // Re-throw other errors to be handled by route
      throw error;
    }
  };
}

/**
 * Validation helper to ensure all Ops routes use withOpsAuth
 * This can be run in CI to catch missing auth
 */
export function validateOpsRouteAuth(routePath: string, handler: () => unknown): boolean {
  // Check if handler is wrapped by withOpsAuth
  // This is a simple check - in production you'd use AST analysis
  const handlerString = handler.toString();
  return (
    handlerString.includes("withOpsAuth") ||
    handlerString.includes("requireSession")
  );
}
