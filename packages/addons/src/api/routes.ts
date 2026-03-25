/**
 * Add-on HTTP API — stubs only
 *
 * Store extensions are persisted as `StoreAddOn` in `@vayva/db` (fields
 * `storeId`, `extensionId`, billing period, `AddOnStatus`). The live REST API
 * is implemented in **Backend/core-api** under `/api/merchant/addons`.
 *
 * This module keeps the historical export names so `@vayva/addons/api` and
 * tsup builds do not reference a non-existent Prisma schema (`AddOn` catalog,
 * `storeId_addOnId`, etc.). Mounting these handlers in production will return
 * HTTP 501; proxy to core-api instead.
 */

import { NextRequest, NextResponse } from "next/server";

const STUB_MESSAGE =
  "Not implemented in @vayva/addons. Use Backend/core-api GET/POST /api/merchant/addons (StoreAddOn.extensionId).";

function stubResponse() {
  return NextResponse.json(
    { error: "Not implemented", message: STUB_MESSAGE },
    { status: 501 },
  );
}

export async function POST_install(_request: NextRequest) {
  return stubResponse();
}

export async function POST_uninstall(_request: NextRequest) {
  return stubResponse();
}

export async function POST_update(_request: NextRequest) {
  return stubResponse();
}

export async function POST_config(_request: NextRequest) {
  return stubResponse();
}

export async function POST_status(_request: NextRequest) {
  return stubResponse();
}

export async function GET_updates(_request: NextRequest) {
  return stubResponse();
}

export async function GET_config(_request: NextRequest) {
  return stubResponse();
}
