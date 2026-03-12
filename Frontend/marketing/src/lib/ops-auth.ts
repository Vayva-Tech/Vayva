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

export function requireOpsRole(role: string) {
  return (handler: (req: NextRequest, ctx: OpsAuthContext) => Promise<NextResponse>) => {
    return async (req: NextRequest, ctx: OpsAuthContext) => {
      if (!ctx.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return handler(req, ctx);
    };
  };
}

export function isOpsUser(user: any): user is OpsUser {
  return user && typeof user.id === 'string' && typeof user.email === 'string';
}

export const opsAuth = {
  withOpsAuth,
  requireOpsRole,
  isOpsUser,
};
