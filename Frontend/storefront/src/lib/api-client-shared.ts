export async function apiJson<T>(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      json && typeof json === "object" && json !== null && "error" in json
        ? String((json as { error?: unknown }).error)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json as T;
}
