export function normalizeSidebarHref(rawHref: unknown): string {
  const href = String(rawHref || "").trim();
  if (!href) return "";

  // Preserve relative paths but normalize like a pathname
  const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

  const withoutHash = href.split("#")[0] || "";
  const withoutQuery = (withoutHash.split("?")[0] || "").trim();
  if (!withoutQuery) return "";

  let path = ensureLeadingSlash(withoutQuery);

  // Collapse multiple slashes
  path = path.replace(/\/+/g, "/");

  // Remove trailing slash except root
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}
