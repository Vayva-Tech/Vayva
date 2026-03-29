import { logger, standardHeaders } from "@vayva/shared";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function validateSessionVersion(
  userId: string,
  tokenVersion: number,
  requestId: string,
) {
  try {
    const cookieHeader = await getCookieHeader();
    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/api/auth/merchant/me`,
      {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );

    if (!backendResponse.ok) {
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

    const data = await backendResponse.json();
    const sessionVersion = data?.user?.sessionVersion ?? 0;

    if (sessionVersion !== tokenVersion) {
      logger.warn("Session revoked (version mismatch)", {
        userId,
        tokenVersion,
        dbVersion: sessionVersion,
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
  } catch (error: unknown) {
    logger.error("[VALIDATE_SESSION_ERROR]", { error: error instanceof Error ? error.message : String(error), userId });
    return { valid: true };
  }
}

export async function checkStoreStatus(
  storeId: string,
  requestId: string,
  endpoint: string,
  userId: string,
) {
  try {
    const cookieHeader = await getCookieHeader();
    const backendResponse = await fetch(
      `${process.env.BACKEND_API_URL}/api/account/store`,
      {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );

    if (!backendResponse.ok) {
      return {
        valid: false,
        response: NextResponse.json(
          {
            error: { code: "STORE_NOT_FOUND", message: "Store not found" },
            requestId,
          },
          { status: 404, headers: standardHeaders(requestId) },
        ),
      };
    }

    const store = await backendResponse.json();

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
  } catch (error: unknown) {
    logger.error("[CHECK_STORE_STATUS_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId });
    return { valid: true, settings: {} };
  }
}

export function checkStoreRestrictions(
  method: string,
  endpoint: string,
  settings: any,
  requestId: string,
  userId: string,
  storeId: string,
) {
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  const s = isRecord(settings) ? settings : {};
  const restrictions = isRecord(s.restrictions)
    ? (s.restrictions as Record<string, any>)
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
      endpoint.startsWith("/orders") ||
      endpoint.startsWith("/kitchen/orders");
    const isProducts =
      endpoint.startsWith("/products") ||
      endpoint.startsWith("/collections");
    const isMarketing = endpoint.startsWith("/marketing");
    const isSettings =
      endpoint.startsWith("/settings") ||
      endpoint.startsWith("/merchant/policies") ||
      endpoint.startsWith("/storefront") ||
      endpoint.startsWith("/domains") ||
      endpoint.startsWith("/merchant/store/publish");

    if (restrictions?.ordersDisabled === true && isOrders) {
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

    if (restrictions?.productsDisabled === true && isProducts) {
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

    if (restrictions?.marketingDisabled === true && isMarketing) {
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

    if (restrictions?.settingsEditsDisabled === true && isSettings) {
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
