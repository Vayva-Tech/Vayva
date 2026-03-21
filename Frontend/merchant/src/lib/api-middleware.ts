import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/lib/session.server";
import { standardHeaders, logger } from "@vayva/shared";
import { getRequestId } from "@/lib/request-id";

export interface MiddlewareSession {
  merchantId: string;
  userId: string;
  storeId?: string;
  role?: string;
  email?: string;
}

export type MiddlewareHandlerResult =
  | NextResponse
  | {
      status: number;
      body: unknown;
    };

export interface MiddlewareOptions {
  requireAuth?: boolean;
}

export async function withVayvaAPI(
  req: NextRequest,
  handler: (session: MiddlewareSession) => Promise<MiddlewareHandlerResult>,
  options: MiddlewareOptions = {},
): Promise<NextResponse> {
  const requestId = await getRequestId();

  try {
    const requireAuth = options.requireAuth !== false;

    const user = await requireAuthFromRequest(req);

    if (requireAuth && !user) {
      return NextResponse.json(
        { error: "Unauthorized", requestId },
        { status: 401, headers: standardHeaders(requestId) },
      );
    }

    const sessionUser = user as unknown as Record<string, unknown> | null;

    const session: MiddlewareSession = {
      merchantId:
        (sessionUser?.merchantId as string | undefined) ||
        (sessionUser?.storeId as string | undefined) ||
        "",
      userId:
        (sessionUser?.userId as string | undefined) ||
        (sessionUser?.id as string | undefined) ||
        "",
      storeId: sessionUser?.storeId as string | undefined,
      role: sessionUser?.role as string | undefined,
      email: sessionUser?.email as string | undefined,
    };

    if (requireAuth && (!session.merchantId || !session.userId)) {
      return NextResponse.json(
        { error: "Unauthorized", requestId },
        { status: 401, headers: standardHeaders(requestId) },
      );
    }

    const result = await handler(session);

    if (result instanceof NextResponse) {
      Object.entries(standardHeaders(requestId)).forEach(([k, v]) => {
        result.headers.set(k, v);
      });
      return result;
    }

    return NextResponse.json(result.body, {
      status: result.status,
      headers: standardHeaders(requestId),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("[API_MIDDLEWARE_ERROR]", { error: errorMessage, requestId });

    return NextResponse.json(
      { error: "Internal Server Error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
}
