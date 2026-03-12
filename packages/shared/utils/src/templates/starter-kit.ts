/**
 * Vayva Starter Kit Metadata
 *
 * Defines design tokens, reusable sections, and template packs
 * for Webstudio integration.
 */

export const VAYVA_DESIGN_TOKENS = {
  colors: {
    background: "#0B0F0D",
    surface: "#101814",
    surface2: "#0E1411",
    text: "#E9F5EE",
    textMuted: "#A7BDB0",
    border: "rgba(255,255,255,0.08)",
    primary: "#22C55E", // Vayva Green
    glow: "0 0 20px rgba(34, 197, 94, 0.3)",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    sizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "24px",
      "2xl": "32px",
      "3xl": "40px",
    },
    lineHeights: {
      tight: 1.4,
      normal: 1.6,
    },
  },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64],
  radius: {
    sm: "12px",
    md: "16px",
    lg: "24px",
  },
  shadows: {
    card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    glow: "0 0 30px rgba(34, 197, 94, 0.4)",
  },
} as const;

export type VayvaSectionType =
  | "HERO_A"
  | "HERO_B"
  | "PRODUCT_GRID"
  | "FEATURED_COLLECTION"
  | "TESTIMONIALS"
  | "PRICING"
  | "FAQ"
  | "CONTACT"
  | "FOOTER"
  | "HEADER";

export const CORE_SECTIONS = [
  {
    type: "HERO_A",
    name: "Classic Hero",
    description: "Headline, subcopy, CTA, and side image.",
  },
  {
    type: "HERO_B",
    name: "Centered Hero",
    description: "Impactful centered headline with glow CTA.",
  },
  {
    type: "PRODUCT_GRID",
    name: "Product Grid",
    description: "Responsive grid linking to Vayva products.",
  },
  {
    type: "FEATURED_COLLECTION",
    name: "Featured Collection",
    description: "Highlight a specific product collection.",
  },
  {
    type: "TESTIMONIALS",
    name: "Testimonials",
    description: "3-card social proof section.",
  },
  {
    type: "PRICING",
    name: "Pricing Plans",
    description: "Compare service tiers and features.",
  },
  {
    type: "FAQ",
    name: "FAQ Accordion",
    description: "Clean question and answer layout.",
  },
  {
    type: "CONTACT",
    name: "Contact Form",
    description: "Direct inquiry form with map placeholder.",
  },
  {
    type: "FOOTER",
    name: "Vayva Footer",
    description: "Sticky footer with links and payment badges.",
  },
  {
    type: "HEADER",
    name: "Vayva Nav",
    description: "Sticky responsive navigation with CTA.",
  },
] as const;

export const COMMERCE_ROUTES = {
  shop: "/products",
  product: "/products/[slug]",
  cart: "/cart",
  checkout: "/checkout",
  trackOrder: "/order/track",
} as const;

export type TemplatePack = {
  id: string;
  name: string;
  systemTemplateKey: string;
  pages: string[];
  sections: VayvaSectionType[];
};

export const TEMPLATE_PACKS: TemplatePack[] = [
  {
    id: "commerce-starter",
    name: "Commerce Starter",
    systemTemplateKey: "one-product",
    pages: ["Home", "About", "Contact", "Policies"],
    sections: ["HEADER", "HERO_B", "PRODUCT_GRID", "FOOTER"],
  },
  {
    id: "fashion-pack",
    name: "Fashion Pack",
    systemTemplateKey: "aa-fashion",
    pages: ["Home", "Lookbook", "Contact"],
    sections: ["HEADER", "HERO_A", "FEATURED_COLLECTION", "FOOTER"],
  },
  {
    id: "food-pack",
    name: "Food Pack",
    systemTemplateKey: "chopnow",
    pages: ["Home", "Menu", "Contact"],
    sections: ["HEADER", "HERO_B", "FEATURED_COLLECTION", "FOOTER"],
  },
  {
    id: "events-pack",
    name: "Events Pack",
    systemTemplateKey: "ticketly",
    pages: ["Home", "Events", "Contact"],
    sections: ["HEADER", "HERO_A", "TESTIMONIALS", "FOOTER"],
  },
  {
    id: "travel-pack",
    name: "Travel Pack",
    systemTemplateKey: "travel",
    pages: ["Home", "Tours", "Contact"],
    sections: ["HEADER", "HERO_B", "TESTIMONIALS", "FOOTER"],
  },
  {
    id: "real-estate-pack",
    name: "Real Estate Pack",
    systemTemplateKey: "homelist",
    pages: ["Home", "Listings", "Contact"],
    sections: ["HEADER", "HERO_A", "FEATURED_COLLECTION", "FOOTER"],
  },
  {
    id: "education-pack",
    name: "Education Pack",
    systemTemplateKey: "eduflow",
    pages: ["Home", "Courses", "Contact"],
    sections: ["HEADER", "HERO_B", "FAQ", "FOOTER"],
  },
  {
    id: "tech-pack",
    name: "Tech Pack",
    systemTemplateKey: "gizmo-tech",
    pages: ["Home", "Products", "Contact"],
    sections: ["HEADER", "HERO_A", "PRODUCT_GRID", "FOOTER"],
  },
];
