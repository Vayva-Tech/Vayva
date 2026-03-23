import React from "react";
import "./globals.css";
import { urls } from "@vayva/shared";
import { Space_Grotesk, Inter } from "next/font/google";

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

export const metadata = {
  metadataBase: new URL(urls.marketingBase()),
  title:
    "Vayva – WhatsApp Business & E-commerce Dashboard for Nigeria | Start Free",
  description:
    "Turn WhatsApp chats into sales with Paystack payments, Naira payouts, and easy dashboard. Built for Nigerian merchants in Lagos, Abuja, Port Harcourt. Start free — no card needed.",
  keywords: [
    "WhatsApp business Nigeria",
    "e-commerce dashboard Nigeria",
    "Paystack store builder",
    "online store Lagos",
    "accept payments Nigeria",
    "WhatsApp commerce",
    "Nigerian merchant dashboard",
    "sell on WhatsApp Nigeria",
    "Naira payments",
    "small business Nigeria",
    "entrepreneur tools Nigeria",
    "mobile commerce Nigeria",
  ],
  authors: [{ name: "Vayva" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Vayva – WhatsApp Business Dashboard for Nigerian Merchants",
    description: "Turn WhatsApp chats into sales. Paystack payments, Naira payouts, built for Nigeria. Start free.",
    url: urls.marketingBase(),
    siteName: "Vayva",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vayva – WhatsApp Business Dashboard for Nigerian Merchants",
    description: "Turn WhatsApp chats into sales. Paystack payments, Naira payouts, built for Nigeria. Start free.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

import Script from "next/script";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Vayva",
        url: urls.marketingBase(),
        logo: `${urls.marketingBase()}/favicon.svg`,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+2349160000000",
          contactType: "customer service",
          email: "support@vayva.ng",
          areaServed: "NG",
          availableLanguage: "English",
        },
        description:
          "Vayva is a WhatsApp Business Platform in Nigeria, helping SMEs automate sales, payments, and logistics.",
        sameAs: [
          "https://twitter.com/vayvang",
          "https://www.linkedin.com/company/vayva",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${urls.marketingBase()}/#localbusiness`,
        name: "Vayva",
        image: `${urls.marketingBase()}/og-image.png`,
        url: urls.marketingBase(),
        telephone: "+2349160000000",
        email: "support@vayva.ng",
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Herbert Macaulay Way",
          addressLocality: "Yaba",
          addressRegion: "Lagos",
          postalCode: "101212",
          addressCountry: "NG",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "6.5244",
          longitude: "3.3792",
        },
        areaServed: {
          "@type": "Country",
          name: "Nigeria",
        },
        priceRange: "₦",
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "5000",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`light ${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased font-sans text-foreground crm-canvas"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
