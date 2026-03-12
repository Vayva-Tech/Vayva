/* eslint-disable no-undef */
/// <reference lib="dom" />

/**
 * A wrapper around fetch with timeout support.
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    const err = error as Error;
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}
