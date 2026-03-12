import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(_req: NextRequest, context: any) {
  // This endpoint is a simple alias to /api/auth/merchant/me
  // Redirect to the canonical endpoint
  const merchantId = context?.user?.id;
  const storeId = context?.storeId;

  // Return basic merchant info
  return NextResponse.json({
    merchantId,
    storeId,
    message: "Use /api/auth/merchant/me for full merchant data",
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
  // This endpoint is a simple alias to /api/auth/merchant/me
  // Redirect to the canonical endpoint
  const merchantId = user?.id;

  // Return basic merchant info
  return NextResponse.json({
    merchantId,
    storeId,
    message: "Use /api/auth/merchant/me for full merchant data",
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
});
