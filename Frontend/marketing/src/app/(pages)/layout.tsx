import React, { Suspense } from "react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { CookieBanner } from "@/components/marketing/CookieBanner";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { ParticleBackground } from "@/components/marketing/ParticleBackground";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { MarketingOfferProvider } from "@/context/MarketingOfferContext";
import { readStarterFirstMonthFreeEnabled } from "@/lib/read-starter-first-month-free";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  let starterFirstMonthFree = true;
  let starterTrialDays = 30;
  try {
    starterFirstMonthFree = await readStarterFirstMonthFreeEnabled();
    starterTrialDays = starterFirstMonthFree ? 30 : 7;
  } catch {
    starterFirstMonthFree = true;
    starterTrialDays = 30;
  }

  return (
    <MarketingShell>
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
      <Suspense fallback={null}>
        <MarketingOfferProvider
          initialStarterFirstMonthFree={starterFirstMonthFree}
          initialStarterTrialDays={starterTrialDays}
        >
          <AnalyticsProvider>
            <main id="main-content" className="w-full min-w-0">
              {children}
            </main>
          </AnalyticsProvider>
        </MarketingOfferProvider>
      </Suspense>
      <MarketingFooter />
      <CookieBanner />
    </MarketingShell>
  );
}
