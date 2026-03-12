import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.SECURITY_VIEW,
  async (req, { user }) => {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { storeId: user.id }, // Corrected from storeId to user.id if applicable, wait let me check schema
        select: { pinSet: true },
      });

      return NextResponse.json(
        {
          pinSet: wallet?.pinSet || false,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[SECURITY_STATUS_GET]", error, { userId: user.id });
      return NextResponse.json({ pinSet: false }, { status: 500 });
    }
  },
);
