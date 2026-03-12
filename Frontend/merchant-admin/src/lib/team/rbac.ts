/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionUser } from "@/lib/session.server";
import { can } from "./permissions";
import { NextResponse } from "next/server";
export async function checkPermission(action: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const userRole = (user.role as string) || "user";
  if (!can(userRole, action)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  // Test session object structure for compatibility with existing handlers
  return { user };
}
export function withRBAC(
  action: string,
  handler: (...args: any[]) => Promise<Response>,
) {
    return async (...args: any[]) => {
    try {
      const session = await checkPermission(action);
      return await handler(session, ...args);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Unauthorized")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      throw error;
    }
  };
}
