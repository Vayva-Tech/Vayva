import { headers } from "next/headers";
import { randomUUID } from "crypto";

/**
 * Get or generate a Request ID for the current request.
 * Uses x-request-id header if present, otherwise generates a new UUID.
 */
export async function getRequestId() {
  const h = await headers();
  return h.get("x-request-id") ?? randomUUID();
}
