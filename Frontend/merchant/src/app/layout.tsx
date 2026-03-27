import { Space_Grotesk, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryClientProviderWrapper } from "@/providers/QueryClientProvider";
import { ConsentBanner } from "@/components/legal/ConsentBanner";
import { IncidentBanner } from "@/components/layout/IncidentBanner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const dynamic = "force-dynamic";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#22C55E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Vayva - Seller Dashboard",
  description: "Manage your Vayva store",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vayva",
  },
  icons: {
    icon: [
      { url: "/vayva-logo-official.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/vayva-logo-official.svg" }],
  },
};

import { ResponsiveToaster } from "@/components/layout/ResponsiveToaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`font-sans antialiased min-h-screen bg-white density-comfortable crm-canvas`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="system" enableSystem>
          <QueryClientProviderWrapper>
            <AuthProvider>
              <IncidentBanner />
              {children}
              <ResponsiveToaster richColors />
              <ConsentBanner />
            </AuthProvider>
          </QueryClientProviderWrapper>
        </ThemeProvider>
        {/* Performance Monitoring */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
