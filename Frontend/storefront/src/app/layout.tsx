import type { Metadata, ResolvingMetadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Suspense } from "react";
import { prisma } from "@vayva/db";
import { notFound } from "next/navigation";
import { PublicStore } from "@/types/storefront";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSlugFromHeaders } from "./utils";
import Script from "next/script";

import { reportError } from "@/lib/error";

function sanitizeCssColor(input: unknown): string | null {
  const value = String(input ?? "").trim();
  if (!value) return null;

  if (/^#[0-9a-fA-F]{3}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{8}$/.test(value)) return value;
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(value))
    return value;
  if (
    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(
      value,
    )
  )
    return value;

  return null;
}

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function getString(
  rec: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = rec[key];
  return typeof v === "string" ? v : undefined;
}

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params: _params, searchParams: _searchParams }: any,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = await getSlugFromHeaders();

  if (slug) {
    try {
      const store = await (prisma as any)?.store?.findUnique({
        where: { slug },
        select: {
          name: true,
          seoTitle: true,
          seoDescription: true,
          socialImage: true,
          logoUrl: true,
        },
      });

      if (store) {
        const title = store.seoTitle || `${store.name} | Powered by Vayva`;
        const description =
          store.seoDescription || `Shop at ${store.name} - Powered by Vayva`;
        const images = store.socialImage
          ? [store.socialImage]
          : store.logoUrl
            ? [store.logoUrl]
            : [];

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images,
            siteName: store.name,
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images,
          },
        };
      }
    } catch (e: unknown) {
      reportError(e, { scope: "generateMetadata", app: "storefront" });
    }
  }

  return {
    title: "Vayva Storefront",
    description: "Powered by Vayva",
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const slug = await getSlugFromHeaders();
  let store: PublicStore | null = null;

  if (slug) {
    try {
      const rawStore = await (prisma as any)?.store?.findUnique({
        where: { slug },
        include: {
          storefrontPublished: true,
          merchantPolicies: true,
          // contacts is a JSON field, no include
        },
      });

      if (rawStore) {
        const themeConfig = getRecord(
          rawStore.storefrontPublished?.themeConfig,
        ) || {
          primaryColor: "#000000",
          accentColor: "#FFFFFF",
          templateId: "minimal",
        };
        const contacts = getRecord(rawStore.contacts) || {};
        const branding = getRecord(rawStore.branding) || {};

        const templateId = getString(themeConfig, "templateId") || "minimal";
        const basePrimary = getString(themeConfig, "primaryColor") || "#000000";
        const baseAccent = getString(themeConfig, "accentColor") || "#FFFFFF";
        const primaryColor = getString(branding, "primaryColor") || basePrimary;
        const accentColor = getString(branding, "accentColor") || baseAccent;
        const logoUrl =
          getString(branding, "logoUrl") || rawStore.logoUrl || undefined;

        const policies = {
          shipping:
            (rawStore as any)?.merchantPolicies?.find(
              (p: { type: string }) => p.type === "SHIPPING_DELIVERY",
            )?.contentMd || "",
          returns:
            (rawStore as any)?.merchantPolicies?.find((p: { type: string }) => p.type === "RETURNS")
              ?.contentMd || "",
          privacy:
            (rawStore as any)?.merchantPolicies?.find((p: { type: string }) => p.type === "PRIVACY")
              ?.contentMd || "",
        };

        store = {
          id: rawStore.id,
          slug: rawStore.slug,
          name: rawStore.name,
          tagline: rawStore.seoDescription || undefined,
          logoUrl,
          theme: {
            templateId,
            primaryColor,
            accentColor,
          },
          contact: {
            phone: getString(contacts, "phone"),
            email: getString(contacts, "email"),
            whatsapp: getString(contacts, "whatsapp"),
          },
          policies,
          industry: rawStore.industrySlug || undefined,
          plan: rawStore.plan as "FREE" | "STARTER" | "PRO",
        };
      }
    } catch (e: unknown) {
      reportError(e, { scope: "RootLayout", app: "storefront", slug });
    }
  }

  // STRICT 404 RULE: If we have a slug but no store, 404.
  if (slug && !store) {
    notFound();
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={(process as any)?.env?.NEXT_PUBLIC_API_URL || ""} />

        <link rel="preconnect" href="https://(images as any)?.unsplash?.com" />
        <link rel="dns-prefetch" href="https://(images as any)?.unsplash?.com" />

        {store?.theme?.primaryColor && (
          <style>
            {(() => {
              const primary = sanitizeCssColor((store as any)?.theme?.primaryColor);
              const accent =
                sanitizeCssColor((store as any)?.theme?.accentColor) || "#FFFFFF";
              if (!primary) return "";
              return `:root{--primary:${primary};--accent:${accent};}`;
            })()}
          </style>
        )}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased text-black min-h-screen flex flex-col crm-canvas`}
        suppressHydrationWarning
      >
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
          <StoreProvider initialStore={store}>{children}</StoreProvider>
        </Suspense>

        {/* Boot Vayva Commerce Blocks */}
        <Script id="vayva-commerce-blocks-boot" strategy="afterInteractive">{`
          (function() {
            var run = function() {
              var blocks = document.querySelectorAll('[data-vayva-block]');
              if (!blocks.length) return;
              import('/commerce-blocks/render.js').then(function(m) {
                if (m && m.renderCommerceBlocks) m.renderCommerceBlocks();
              }).catch(function() {});
            };
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(run);
            } else {
              setTimeout(run, 1);
            }
          })()
        `}</Script>

        {/* Performance Monitoring */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
