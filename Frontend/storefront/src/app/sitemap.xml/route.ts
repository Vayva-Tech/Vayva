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
    select: { slug: true, updatedAt: true },
  });

  if (!store) return new Response("", { status: 404 });

  const origin = urls.storefrontOrigin(store.slug);
  const now = new Date().toISOString();

  // Keep minimal for now; later add products/collections pages.
  const entries = [{ loc: `${origin}/`, lastmod: now }];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (e) =>
          `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`,
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
