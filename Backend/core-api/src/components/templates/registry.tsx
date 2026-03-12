import React from "react";

import { SimpleRetailTemplate } from "./retail/SimpleRetail";
import { PerfumeLuxuryTemplate } from "./retail/PerfumeLuxury";
import { AutoPartsTemplate } from "./retail/AutoParts";
import { PhoneGadgetTemplate } from "./retail/PhoneGadget";
import { CosmeticsBeautyTemplate } from "./retail/CosmeticsBeauty";
import { FurnitureHomeTemplate } from "./retail/FurnitureHome";
import { ElectronicsMarketTemplate } from "./retail/ElectronicsMarket";

export interface TemplateProps {
  businessName: string;
  demoMode?: boolean;
}

export const TEMPLATE_REGISTRY: Record<
  string,
  React.ComponentType<TemplateProps>
> = {
  "simple-retail": SimpleRetailTemplate,
  "perfume-luxury": PerfumeLuxuryTemplate,
  "auto-parts": AutoPartsTemplate,
  "phone-gadgets": PhoneGadgetTemplate,
  "cosmetics-beauty": CosmeticsBeautyTemplate,
  "furniture-home": FurnitureHomeTemplate,
  "electronics-market": ElectronicsMarketTemplate,
};

export const getTemplateComponent = (templateId: string) => {
  return TEMPLATE_REGISTRY[templateId] || null;
};
