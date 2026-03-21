"use client";

import React from "react";
import { logger } from "@vayva/shared";
import { SimpleRetailTemplate } from "@/components/templates/retail/SimpleRetail";

// This is a rendering harness that selects the correct template component
// based on the ID and passes down the configuration.
// It SHOULD be shared between the Preview page and the actual Storefront.

interface TemplateRendererProps {
  templateId: string;
    config?: any;
  storeName: string;
  isDemo?: boolean;
}

export function TemplateRenderer({
  templateId,
  config,
  storeName,
  isDemo,
}: TemplateRendererProps) {
  // 1. Resolve Template
  // In a real app, this Registry might be larger or dynamically imported.
  // For V1, we map the canonical IDs to the Components we have.

  let Component = SimpleRetailTemplate; // Default

  switch (templateId) {
    case "simple-retail":
    case "vayva_light_glass_store_v1": // Handle legacy ID mapping if needed
      Component = SimpleRetailTemplate;
      break;
    // Add other cases as you build them:
    // case 'perfume-luxury': Component = PerfumeLuxuryTemplate; break;
    default:
      // Fallback or Error component
      logger.warn(`Template ID ${templateId} not found, using SimpleRetail.`, {
        app: "merchant",
      });
      Component = SimpleRetailTemplate;
  }

  // 2. Normalize Config
  // The component expects certain props. We map the raw JSON config into them.
  // Ideally, the components themselves should accept the raw config object prop.
  // For now, we pass basic props.

  return (
    <React.Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          Loading Store...
        </div>
      }
    >
      <Component businessName={storeName} demoMode={isDemo} />
    </React.Suspense>
  );
}
