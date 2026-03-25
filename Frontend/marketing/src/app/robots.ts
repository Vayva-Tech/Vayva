import { MetadataRoute } from "next";
import { urls } from "@vayva/shared";

export default function robots(): MetadataRoute.Robots {
  const origin = urls.marketingBase().replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/ops-console/", "/merchant/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
