// Ops Auth utilities
import { NextRequest, NextResponse } from 'next/server';

export interface OpsUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface OpsSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface OpsAuthContext {
  user?: OpsUser;
  session?: OpsSession;
}

export function withOpsAuth(
  handler: (req: NextRequest, ctx: OpsAuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // Simplified auth check
    const ctx: OpsAuthContext = { user: undefined, session: undefined };
    return handler(req, ctx);
  };
}

export function requireOpsRole(_role: string) {
  return (handler: (req: NextRequest, ctx: OpsAuthContext) => Promise<NextResponse>) => {
    return async (req: NextRequest, ctx: OpsAuthContext) => {
      if (!ctx.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return handler(req, ctx);
    };
  };
}

export function isOpsUser(user: unknown): user is OpsUser {
  return (
    !!user &&
    typeof user === "object" &&
    "id" in user &&
    "email" in user &&
    typeof (user as OpsUser).id === "string" &&
    typeof (user as OpsUser).email === "string"
  );
}

export const opsAuth = {
  withOpsAuth,
  requireOpsRole,
  isOpsUser,
};
