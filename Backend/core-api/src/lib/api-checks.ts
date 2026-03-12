import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { NextResponse } from "next/server";

export async function validateSessionVersion(
  userId: string,
  tokenVersion: number,
  requestId: string,
) {
  const userInDb = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionVersion: true },
  });

  if (!userInDb || userInDb.sessionVersion !== tokenVersion) {
    logger.warn("Session revoked (version mismatch)", {
      userId,
      tokenVersion,
      dbVersion: userInDb?.sessionVersion,
      requestId,
      app: "merchant",
    });
    return {
      valid: false,
      response: NextResponse.json(
        {
          error: {
            code: "SESSION_REVOKED",
            message: "Unauthorized: Session expired",
          },
          requestId,
        },
        { status: 401, headers: standardHeaders(requestId) },
      ),
    };
  }

  return { valid: true };
}

export async function checkStoreStatus(
  storeId: string,
  requestId: string,
  endpoint: string,
  userId: string,
) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { isActive: true, settings: true },
  });

  if (!store?.isActive) {
    logger.warn("Store suspended", {
      userId,
      storeId,
      endpoint,
      requestId,
      app: "merchant",
    });
    return {
      valid: false,
      response: NextResponse.json(
        {
          error: { code: "STORE_SUSPENDED", message: "Store is suspended" },
          requestId,
        },
        { status: 403, headers: standardHeaders(requestId) },
      ),
    };
  }

  return { valid: true, settings: store.settings };
}

export function checkStoreRestrictions(
  method: string,
  endpoint: string,
  settings: unknown,
  requestId: string,
  userId: string,
  storeId: string,
) {
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  const s = isRecord(settings) ? settings : {};
  const restrictions = isRecord(s.restrictions)
    ? (s.restrictions as Record<string, unknown>)
    : {};
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (isWrite && restrictions.writeDisabled === true) {
    logger.warn("Store restricted (writeDisabled)", {
      userId,
      storeId,
      endpoint,
      requestId,
      app: "merchant",
    });
    return {
      restricted: true,
      response: NextResponse.json(
        {
          error: { code: "STORE_RESTRICTED", message: "Store is restricted" },
          requestId,
        },
        { status: 403, headers: standardHeaders(requestId) },
      ),
    };
  }

  if (isWrite) {
    const isOrders =
      endpoint.startsWith("/api/orders") ||
      endpoint.startsWith("/api/kitchen/orders");
    const isProducts =
      endpoint.startsWith("/api/products") ||
      endpoint.startsWith("/api/collections");
    const isMarketing = endpoint.startsWith("/api/marketing");
    const isSettings =
      endpoint.startsWith("/api/settings") ||
      endpoint.startsWith("/api/merchant/policies") ||
      endpoint.startsWith("/api/storefront") ||
      endpoint.startsWith("/api/domains") ||
      endpoint.startsWith("/api/merchant/store/publish");

    if (restrictions.ordersDisabled === true && isOrders) {
      return {
        restricted: true,
        response: NextResponse.json(
          {
            error: {
              code: "STORE_RESTRICTED_ORDERS",
              message: "Orders are restricted for this store",
            },
            requestId,
          },
          { status: 403, headers: standardHeaders(requestId) },
        ),
      };
    }

    if (restrictions.productsDisabled === true && isProducts) {
      return {
        restricted: true,
        response: NextResponse.json(
          {
            error: {
              code: "STORE_RESTRICTED_PRODUCTS",
              message: "Products are restricted for this store",
            },
            requestId,
          },
          { status: 403, headers: standardHeaders(requestId) },
        ),
      };
    }

    if (restrictions.marketingDisabled === true && isMarketing) {
      return {
        restricted: true,
        response: NextResponse.json(
          {
            error: {
              code: "STORE_RESTRICTED_MARKETING",
              message: "Marketing is restricted for this store",
            },
            requestId,
          },
          { status: 403, headers: standardHeaders(requestId) },
        ),
      };
    }

    if (restrictions.settingsEditsDisabled === true && isSettings) {
      return {
        restricted: true,
        response: NextResponse.json(
          {
            error: {
              code: "STORE_RESTRICTED_SETTINGS",
              message: "Settings changes are restricted for this store",
            },
            requestId,
          },
          { status: 403, headers: standardHeaders(requestId) },
        ),
      };
    }
  }

  return { restricted: false };
}
