import { NextRequest, NextResponse } from 'next/server';

export function withOpsAuth(handler: (req: NextRequest, ctx: { user: null }) => Promise<NextResponse | Response>) {
  return async (req: NextRequest) => {
    return handler(req, { user: null });
  };
}