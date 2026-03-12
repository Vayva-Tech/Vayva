import { NextRequest, NextResponse } from "next/server";
import { withOpsAPI } from "@/lib/api-handler";
import { prisma } from "@vayva/db";

import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

const getHandler = withOpsAPI(
  async (req: any, ctx: any) => {
    try {
      const { id } = ctx.params;

      const log = await prisma.auditLog.findUnique({
        where: { id },
      });

      if (!log) {
        return NextResponse.json(
          { error: "Audit log not found", requestId: ctx.requestId },
          { status: 404 },
        );
      }

      return NextResponse.json({ data: log, requestId: ctx.requestId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      logger.error("Audit Log detail error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId: ctx.requestId,
        logId: ctx.params.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error", requestId: ctx.requestId },
        { status: 500 },
      );
    }
  },
  { requiredPermission: "OPS_SUPPORT" },
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}
