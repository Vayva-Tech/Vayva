import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

async function _handler(
  _req: NextRequest,
  context: { storeId?: string; correlationId?: string; user?: { id: string } },
) {
  // This endpoint is a simple alias to /api/auth/merchant/me
  // Redirect to the canonical endpoint
  const merchantId = context?.user?.id;
  const storeId = context?.storeId;

  // Return basic merchant info
  return NextResponse.json(
    {
      merchantId,
      storeId,
      message: "Use /api/auth/merchant/me for full merchant data",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (req, { storeId, user }) => {
    // This endpoint is a simple alias to /api/auth/merchant/me
    // Redirect to the canonical endpoint
    const merchantId = user?.id;

    // Return basic merchant info
    return NextResponse.json(
      {
        merchantId,
        storeId,
        message: "Use /api/auth/merchant/me for full merchant data",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  },
);
