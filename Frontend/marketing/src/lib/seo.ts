import { Metadata } from "next";
import { headers } from "next/headers";

/**
 * SEO Utilities for Marketing Site
 * 
 * Provides dynamic meta tags, structured data, and sitemap generation
 */

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

/**
 * Generate metadata for Next.js pages
 */
export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  ogImage = "/og-image.jpg",
  canonical,
  noIndex = false,
}: SEOMetadata): Metadata {
  const baseTitle = "Vayva - E-commerce Platform for Nigerian Merchants";
  const fullTitle = title === baseTitle ? title : `${title} | Vayva`;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, "e-commerce", "Nigeria", "payments", "merchant"],
    authors: [{ name: "Vayva" }],
    creator: "Vayva",
    publisher: "Vayva",
    robots: noIndex ? "noindex, nofollow" : "index, follow",
    alternates: {
      canonical: canonical || undefined,
    },
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      locale: "en_NG",
      url: canonical || "https://vayva.ng",
      siteName: "Vayva",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    other: {
      "application-name": "Vayva",
      "msapplication-TileColor": "#6366f1",
      "theme-color": "#6366f1",
    },
  };
}

/**
 * Generate JSON-LD structured data for products
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock";
  url: string;
  brand?: string;
  sku?: string;
}): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: product.url,
      priceCurrency: product.currency,
      price: product.price,
      availability: `https://schema.org/${product.availability}`,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      seller: {
        "@type": "Organization",
        name: "Vayva Merchant",
      },
    },
  };

  return JSON.stringify(schema);
}

/**
 * Generate JSON-LD for local business (merchant stores)
 */
export function generateLocalBusinessSchema(merchant: {
  name: string;
  description: string;
  url: string;
  image: string;
  telephone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: merchant.name,
    description: merchant.description,
    url: merchant.url,
    image: merchant.image,
    telephone: merchant.telephone,
    email: merchant.email,
    address: merchant.address
      ? {
          "@type": "PostalAddress",
          streetAddress: merchant.address.street,
          addressLocality: merchant.address.city,
          addressRegion: merchant.address.state,
          postalCode: merchant.address.postalCode,
          addressCountry: merchant.address.country,
        }
      : undefined,
    priceRange: "₦₦",
  };

  return JSON.stringify(schema);
}

/**
 * Generate JSON-LD for breadcrumb navigation
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(schema);
}

/**
 * Generate sitemap XML
 * Call this from /app/sitemap.ts or /app/sitemap.xml/route.ts
 */
export async function generateSitemap(): Promise<string> {
  const baseUrl = "https://vayva.ng";
  const currentDate = new Date().toISOString();

  // Static routes
  const staticRoutes = [
    { url: "/", priority: 1.0, changefreq: "weekly" },
    { url: "/pricing", priority: 0.9, changefreq: "monthly" },
    { url: "/about", priority: 0.7, changefreq: "monthly" },
    { url: "/contact", priority: 0.7, changefreq: "monthly" },
    { url: "/help", priority: 0.6, changefreq: "monthly" },
  ];

  // Generate XML
  const urls = staticRoutes
    .map(
      (route) => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: https://vayva.ng/sitemap.xml

# Crawl rate
Crawl-delay: 10

# Disallow admin paths
Disallow: /dashboard/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
`;
}

/**
 * Track page view for analytics
 * Call this from layout or page components
 */
export function trackPageView(
  page: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  // Send to your analytics service
  try {
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        ...metadata,
      }),
    }).catch(() => {
      // Silent fail
    });
  } catch {
    // Silent fail
  }
}

/**
 * Track events for analytics
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  try {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silent fail
    });
  } catch {
    // Silent fail
  }
}
