/**
 * Centralized client-side API fetch helper with strict typing and error handling.
 * Prevents runtime crashes from empty/unknown JSON responses.
 *
 * All API calls go through Fastify backend.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function apiJson<T>(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
): Promise<T> {
  // If input is a relative path (starts with /), prepend the API base URL
  const url =
    typeof input === "string" && input.startsWith("/")
      ? `${API_BASE}${input}`
      : input;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  // Handle network/parsing errors safely
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Standard error extraction from Vayva API contract
    const jsonRecord = isRecord(json) ? json : {};
    const msg =
      typeof jsonRecord.error === "string"
        ? jsonRecord.error
        : `Request failed (${res.status})`;

    const error = new Error(msg) as Error & {
      status?: number;
      correlationId?: string | null;
    };
    error.status = res.status;
    error.correlationId = res.headers?.get?.("x-correlation-id") ?? null;
    throw error;
  }

  // Ensure we don't return null if the caller expects a partial object
  // but let the caller handle the specific T structure.
  return json as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
