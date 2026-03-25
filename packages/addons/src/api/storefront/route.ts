/**
 * Storefront add-ons listing — stub only.
 *
 * Active extensions for a store come from `StoreAddOn` in `@vayva/db`.
 * Implement a route in your storefront or BFF that calls core-api
 * `/api/merchant/addons` (authenticated) or a dedicated public endpoint.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      error: "Not implemented",
      message:
        "Use Backend/core-api or a storefront BFF to list StoreAddOn rows for a store.",
      addOns: [],
      count: 0,
    },
    { status: 501 },
  );
}
