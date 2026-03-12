import React from "react";
import { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { CookieBanner } from "@/components/marketing/CookieBanner";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { ParticleBackground } from "@/components/marketing/ParticleBackground";
import { DownloadModalProvider } from "@/context/DownloadModalContext";

export const metadata: Metadata = {
  title: "Vayva — The Commerce Platform for African Businesses",
  description:
    "Launch your online store, accept payments, manage orders, and grow your business with AI-powered tools. Built for Nigeria and Africa.",
  openGraph: {
    title: "Vayva — The Commerce Platform for African Businesses",
    description:
      "Launch your online store, accept payments, manage orders, and grow your business with AI-powered tools.",
    url: "https://vayva.ng",
    siteName: "Vayva",
    type: "website",
  },
};

// ... existing imports

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <MarketingShell>
      <DownloadModalProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Skip to content
        </a>
        <ParticleBackground />
        <SchemaOrg type="Organization" />
        <SchemaOrg type="WebSite" />
        <MarketingHeader />
        <main id="main-content">{children}</main>
        <MarketingFooter />
        <CookieBanner />
      </DownloadModalProvider>
    </MarketingShell>
  );
}
