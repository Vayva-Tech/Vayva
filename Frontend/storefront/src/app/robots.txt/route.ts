import { NextRequest } from "next/server";
import { prisma } from "@vayva/db";
import { urls } from "@vayva/shared";
import { getTenantFromHost } from "@/lib/tenant";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const t = await getTenantFromHost(req.headers.get("host") || undefined);
  if (!t.ok) {
    return new Response("", { status: 404 });
  }

  const store = await prisma.store.findFirst({
    where: { slug: t.slug },
    select: { id: true, slug: true },
  });
  if (!store) {
    return new Response("", { status: 404 });
  }

  const origin = urls.storefrontOrigin(store.slug);
  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /checkout\n` +
    `Disallow: /cart\n` +
    `Disallow: /account\n` +
    `Disallow: /api/\n` +
    `Sitemap: ${origin}/sitemap.xml\n`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
