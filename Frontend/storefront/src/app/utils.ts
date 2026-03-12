import { headers } from "next/headers";
import { getTenantFromHost } from "@/lib/tenant";

export async function getSlugFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get("host") || undefined;
  const t = await getTenantFromHost(host);
  return t.ok ? t.slug : null;
}
