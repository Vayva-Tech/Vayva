/**
 * System Template Registry
 *
 * Single source of truth for all built-in storefront templates.
 * Folder names match `apps/storefront/src/templates/<key>/`.
 */

export type SystemTemplate = {
  key: string;
  name: string;
  category: string;
  description?: string;
  thumbnailPath: string;
};

/**
 * Standard for Template Thumbnails (Wix-like premium feel)
 */
export const TEMPLATE_THUMBNAIL_STANDARDS = {
  aspectRatio: "16:10",
  background: "#0B0F0D",
  elements: ["Hero", "Product Grid", "Green Glow CTA"],
} as const;

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    key: "aa-fashion",
    name: "AA Fashion",
    category: "Fashion",
    description: "Bold fashion storefront with lookbook-style layouts and collection grids.",
    thumbnailPath: "/templates/aa-fashion/thumbnail.png",
  },
  {
    key: "automotive",
    name: "Automotive",
    category: "Automotive",
    description: "Vehicle listings with specs, galleries, and inquiry forms.",
    thumbnailPath: "/templates/automotive/thumbnail.png",
  },
  {
    key: "blog",
    name: "Blog",
    category: "Content",
    description: "Clean editorial layout for articles, newsletters, and content marketing.",
    thumbnailPath: "/templates/blog/thumbnail.png",
  },
  {
    key: "bloome-home",
    name: "Bloome Home",
    category: "Home & Living",
    description: "Elegant home décor storefront with curated collections and lifestyle imagery.",
    thumbnailPath: "/templates/bloome-home/thumbnail.png",
  },
  {
    key: "bookly-pro",
    name: "Bookly Pro",
    category: "Bookings",
    description: "Appointment and service booking with calendar integration and staff profiles.",
    thumbnailPath: "/templates/bookly-pro/thumbnail.png",
  },
  {
    key: "bulktrade",
    name: "BulkTrade",
    category: "Wholesale",
    description: "B2B wholesale storefront with bulk pricing, MOQ, and quote requests.",
    thumbnailPath: "/templates/bulktrade/thumbnail.png",
  },
  {
    key: "chopnow",
    name: "ChopNow",
    category: "Food & Drink",
    description: "Restaurant and food delivery storefront with menu builder and order tracking.",
    thumbnailPath: "/templates/chopnow/thumbnail.png",
  },
  {
    key: "eduflow",
    name: "EduFlow",
    category: "Education",
    description: "Online course platform with lesson modules, progress tracking, and certificates.",
    thumbnailPath: "/templates/eduflow/thumbnail.png",
  },
  {
    key: "file-vault",
    name: "File Vault",
    category: "Digital Products",
    description: "Sell digital downloads — ebooks, templates, presets, and software.",
    thumbnailPath: "/templates/file-vault/thumbnail.png",
  },
  {
    key: "giveflow",
    name: "GiveFlow",
    category: "Fundraising",
    description: "Donation and fundraising campaigns with progress bars and donor walls.",
    thumbnailPath: "/templates/giveflow/thumbnail.png",
  },
  {
    key: "gizmo-tech",
    name: "Gizmo Tech",
    category: "Electronics",
    description: "Tech and gadget storefront with spec comparisons and review sections.",
    thumbnailPath: "/templates/gizmo-tech/thumbnail.png",
  },
  {
    key: "homelist",
    name: "HomeList",
    category: "Real Estate",
    description: "Property listings with maps, virtual tours, and agent contact forms.",
    thumbnailPath: "/templates/homelist/thumbnail.png",
  },
  {
    key: "markethub",
    name: "MarketHub",
    category: "General",
    description: "All-purpose marketplace storefront for any product category.",
    thumbnailPath: "/templates/markethub/thumbnail.png",
  },
  {
    key: "one-product",
    name: "One Product",
    category: "Single Product",
    description: "High-conversion single-product landing page with testimonials and CTAs.",
    thumbnailPath: "/templates/one-product/thumbnail.png",
  },
  {
    key: "ticketly",
    name: "Ticketly",
    category: "Events",
    description: "Event ticketing with seat selection, countdown timers, and QR check-in.",
    thumbnailPath: "/templates/ticketly/thumbnail.png",
  },
  {
    key: "travel",
    name: "Travel",
    category: "Travel",
    description: "Travel and tour booking with itineraries, galleries, and availability calendars.",
    thumbnailPath: "/templates/travel/thumbnail.png",
  },
] satisfies SystemTemplate[];

export const SYSTEM_TEMPLATE_COUNT = SYSTEM_TEMPLATES.length;

export function getSystemTemplateByKey(key: string): SystemTemplate | undefined {
  return SYSTEM_TEMPLATES.find((t) => t.key === key);
}

export function getSystemTemplateCategories(): string[] {
  return [...new Set(SYSTEM_TEMPLATES.map((t) => t.category))];
}
