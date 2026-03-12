import { urls } from "@vayva/shared";

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || urls.merchantBase();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/auth/",
        "/signin/",
        "/signup/",
        "/onboarding/",
        "/preview/",
        "/designer/",
        "/control-center/",
        "/ops/",
        "/invite/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
