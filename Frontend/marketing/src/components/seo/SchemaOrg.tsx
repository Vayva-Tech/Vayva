import React from "react";
import { BRAND, getMarketingUrl } from "@vayva/shared";

interface SchemaOrgProps {
  type: "Organization" | "WebSite" | "SoftwareApplication";
}

export function SchemaOrg({ type }: SchemaOrgProps): React.ReactNode {
  const getSchema = () => {
    switch (type) {
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          legalName: "Vayva",
          name: "Vayva",
          url: getMarketingUrl("/"),
          logo: getMarketingUrl("/brand/logo.png"),
          description:
            "Nigeria commerce platform. Build, sell, and grow on WhatsApp with automated ordering and payments.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "123 Herbert Macaulay Way",
            addressLocality: "Yaba, Lagos",
            addressRegion: "Lagos",
            addressCountry: "NG",
          },
          areaServed: {
            "@id": "https://www.wikidata.org/wiki/Q1033",
          },
          sameAs: [
            "https://www.instagram.com/Vayva.ng",
            "https://twitter.com/Vayva_ng",
            "https://www.linkedin.com/company/vayva",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "Customer Support",
            email: BRAND.supportEmail,
          },
        };

      case "WebSite":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Vayva",
          url: getMarketingUrl("/"),
          description: "Nigeria commerce platform",
          publisher: {
            "@type": "Organization",
            name: "Vayva",
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${getMarketingUrl("/")}?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        };

      case "SoftwareApplication":
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Vayva",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "NGN",
            url: getMarketingUrl("/pricing"),
          },
          description:
            "Commerce platform for Nigerian merchants. Automate WhatsApp orders, accept payments, and manage logistics.",
          screenshot: getMarketingUrl("/og-image.png"),
          author: {
            "@type": "Organization",
            name: "Vayva",
          },
        };

      default:
        return null;
    }
  };

  const schema = getSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
