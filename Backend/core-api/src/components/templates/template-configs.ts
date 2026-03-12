import type { TemplateConfig } from "@/components/templates/StorefrontTemplate";

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "vayva-standard": {
    id: "vayva-standard",
    name: "Standard Retail",
    tagline: "Everyday essentials",
    description:
      "A clean storefront layout built for general merchandise with strong conversion-focused sections.",
    ctaPrimary: "Shop essentials",
    ctaSecondary: "Browse collections",
    accent: "emerald",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Fast delivery", "Secure checkout", "New arrivals"],
  },
  "vayva-aa-fashion": {
    id: "vayva-aa-fashion",
    name: "A&A Fashion",
    tagline: "Bold seasonal drops",
    description:
      "High-contrast editorial fashion layout with statement visuals and premium merchandising sections.",
    ctaPrimary: "Shop the drop",
    ctaSecondary: "Lookbook",
    accent: "rose",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Limited release", "Lookbook ready", "Premium fits"],
  },
  "vayva-gizmo-tech": {
    id: "vayva-gizmo-tech",
    name: "Gizmo Tech",
    tagline: "Performance tech gear",
    description:
      "A sleek dark layout for electronics with technical highlights and fast access to categories.",
    ctaPrimary: "Explore tech",
    ctaSecondary: "Compare specs",
    accent: "blue",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    productStyle: "minimal",
    badges: ["Latest gadgets", "Warranty included", "Fast shipping"],
  },
  "vayva-bloome-home": {
    id: "vayva-bloome-home",
    name: "Bloome & Home",
    tagline: "Serene lifestyle edit",
    description:
      "Soft editorial layout for beauty and home brands with calming imagery and storytelling sections.",
    ctaPrimary: "Shop rituals",
    ctaSecondary: "Our story",
    accent: "amber",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Curated bundles", "Self-care", "Editorial picks"],
  },
  "vayva-bookly-pro": {
    id: "vayva-bookly-pro",
    name: "Bookly Pro",
    tagline: "Appointments made easy",
    description:
      "Service-focused layout with booking highlights, availability callouts, and trust signals.",
    ctaPrimary: "Book a session",
    ctaSecondary: "View services",
    accent: "teal",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
    productStyle: "minimal",
    badges: ["Real-time slots", "Trusted experts", "Secure payment"],
  },
  "vayva-chopnow": {
    id: "vayva-chopnow",
    name: "ChopNow",
    tagline: "Fresh food fast",
    description:
      "Food delivery layout with bold hero and menu-forward merchandising for quick ordering.",
    ctaPrimary: "Order now",
    ctaSecondary: "View menu",
    accent: "orange",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Hot meals", "Pickup + delivery", "Top-rated"],
  },
  "vayva-file-vault": {
    id: "vayva-file-vault",
    name: "FileVault",
    tagline: "Secure digital delivery",
    description:
      "Minimal dark layout for digital products with download-first conversion messaging.",
    ctaPrimary: "Download packs",
    ctaSecondary: "Preview library",
    accent: "violet",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
    productStyle: "minimal",
    badges: ["Instant access", "Lifetime updates", "Secure files"],
  },
  "vayva-ticketly": {
    id: "vayva-ticketly",
    name: "Ticketly",
    tagline: "Events that sell out",
    description:
      "Event ticketing layout with high-energy visuals and clear CTA hierarchy for RSVPs.",
    ctaPrimary: "Get tickets",
    ctaSecondary: "View schedule",
    accent: "amber",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1507878866276-a947ef722fee?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["VIP access", "Live updates", "QR entry"],
  },
  "vayva-eduflow": {
    id: "vayva-eduflow",
    name: "Eduflow",
    tagline: "Learning made simple",
    description:
      "Education-first layout with course highlights, progress cues, and instructor credibility.",
    ctaPrimary: "Start learning",
    ctaSecondary: "Browse courses",
    accent: "blue",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Expert-led", "Self-paced", "Certificates"],
  },
  "vayva-bulktrade": {
    id: "vayva-bulktrade",
    name: "BulkTrade",
    tagline: "Wholesale at scale",
    description:
      "B2B layout with volume pricing callouts, RFQ flow, and trust badges for enterprise buyers.",
    ctaPrimary: "Request quote",
    ctaSecondary: "View catalog",
    accent: "slate",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop",
    productStyle: "minimal",
    badges: ["MOQ support", "Volume pricing", "Net terms"],
  },
  "vayva-markethub": {
    id: "vayva-markethub",
    name: "MarketHub",
    tagline: "Multi-vendor marketplace",
    description:
      "Marketplace layout emphasizing categories, vendors, and trust signals for multi-seller platforms.",
    ctaPrimary: "Explore vendors",
    ctaSecondary: "Become a seller",
    accent: "emerald",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Verified sellers", "Secure payments", "Trending picks"],
  },
  "vayva-giveflow": {
    id: "vayva-giveflow",
    name: "GiveFlow",
    tagline: "Impact-driven fundraising",
    description:
      "Nonprofit layout with campaign goals, donor trust cues, and fast donation CTAs.",
    ctaPrimary: "Donate now",
    ctaSecondary: "View campaigns",
    accent: "rose",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1459183885421-5cc683b8dbba?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Verified charity", "Recurring gifts", "100% secure"],
  },
  "vayva-homelist": {
    id: "vayva-homelist",
    name: "HomeList",
    tagline: "Find your next space",
    description:
      "Real estate layout with listing highlights, map-ready sections, and lead capture focus.",
    ctaPrimary: "View listings",
    ctaSecondary: "Book a tour",
    accent: "blue",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
    productStyle: "minimal",
    badges: ["Verified homes", "Virtual tours", "Agent support"],
  },
  "vayva-oneproduct": {
    id: "vayva-oneproduct",
    name: "OneProduct Pro",
    tagline: "Single product focus",
    description:
      "Long-form conversion layout highlighting one hero product with social proof and urgency.",
    ctaPrimary: "Buy now",
    ctaSecondary: "See reviews",
    accent: "orange",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Best seller", "Fast checkout", "Limited stock"],
  },
  "slice-life-pizza": {
    id: "slice-life-pizza",
    name: "Slice Life Pizza",
    tagline: "Artisanal slices daily",
    description:
      "Menu-forward layout for pizza shops with combo highlights and delivery cues.",
    ctaPrimary: "Order slices",
    ctaSecondary: "See specials",
    accent: "orange",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Hot & fresh", "Combo deals", "Delivery"],
  },
  "vayva-sneaker-drop": {
    id: "vayva-sneaker-drop",
    name: "Sneaker Drop",
    tagline: "Limited release drops",
    description:
      "Hype-driven layout with countdown energy and bold product features for sneaker culture.",
    ctaPrimary: "Join the drop",
    ctaSecondary: "View release",
    accent: "violet",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Countdown", "Limited pairs", "Exclusive"],
  },
  "vayva-kids-world": {
    id: "vayva-kids-world",
    name: "Kids World",
    tagline: "Playful essentials",
    description:
      "Bright, friendly layout for kids retail with gift bundles and playful highlights.",
    ctaPrimary: "Shop toys",
    ctaSecondary: "Gift bundles",
    accent: "amber",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Age filters", "Gift ready", "Safe materials"],
  },
  "vayva-pet-palace": {
    id: "vayva-pet-palace",
    name: "Pet Palace",
    tagline: "For pets you love",
    description:
      "Warm, welcoming layout for pet brands with subscription cues and care tips.",
    ctaPrimary: "Shop treats",
    ctaSecondary: "Subscribe",
    accent: "emerald",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Vet approved", "Subscriptions", "Healthy ingredients"],
  },
  "vayva-beauty-box": {
    id: "vayva-beauty-box",
    name: "Beauty Box",
    tagline: "Monthly glow",
    description:
      "Subscription-first beauty layout with quiz CTA and bundle previews.",
    ctaPrimary: "Start subscription",
    ctaSecondary: "Take the quiz",
    accent: "rose",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Monthly drops", "Personalized", "Clean beauty"],
  },
  "vayva-active-gear": {
    id: "vayva-active-gear",
    name: "Active Gear",
    tagline: "Performance ready",
    description:
      "Athletic gear layout with performance highlights and durable product callouts.",
    ctaPrimary: "Shop gear",
    ctaSecondary: "Explore collections",
    accent: "teal",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Outdoor ready", "Team orders", "Pro quality"],
  },
  "vayva-coffee-house": {
    id: "vayva-coffee-house",
    name: "Coffee House",
    tagline: "Morning ritual",
    description:
      "Warm cafe layout with pickup highlights and loyalty incentives.",
    ctaPrimary: "Order coffee",
    ctaSecondary: "Find us",
    accent: "amber",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Pickup ready", "Loyalty perks", "Fresh roast"],
  },
  "vayva-burger-joint": {
    id: "vayva-burger-joint",
    name: "Burger Joint",
    tagline: "Big flavors fast",
    description: "Fast casual layout with bold food imagery and combo offers.",
    ctaPrimary: "Order burgers",
    ctaSecondary: "See menu",
    accent: "orange",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Combo deals", "Quick pickup", "Family meals"],
  },
  "vayva-sushi-bar": {
    id: "vayva-sushi-bar",
    name: "Sushi Bar",
    tagline: "Elegant dining",
    description:
      "Minimal dark layout with refined menu highlights and reservation focus.",
    ctaPrimary: "Reserve table",
    ctaSecondary: "View menu",
    accent: "teal",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop",
    productStyle: "minimal",
    badges: ["Omakase", "Fresh daily", "Reservation"],
  },
  "vayva-bakery": {
    id: "vayva-bakery",
    name: "Sweet Bakery",
    tagline: "Fresh baked daily",
    description:
      "Soft bakery layout with pre-order highlights and gift box offers.",
    ctaPrimary: "Order pastries",
    ctaSecondary: "Custom cakes",
    accent: "rose",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Pre-order", "Gift boxes", "Seasonal"],
  },
  "vayva-gym-flow": {
    id: "vayva-gym-flow",
    name: "Gym Flow",
    tagline: "Train with structure",
    description:
      "Gym and studio layout featuring class schedules and membership plans.",
    ctaPrimary: "Join membership",
    ctaSecondary: "View classes",
    accent: "slate",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Trainer led", "Flexible plans", "Progress tracking"],
  },
  "vayva-law-firm": {
    id: "vayva-law-firm",
    name: "Legal Partners",
    tagline: "Trusted advisors",
    description:
      "Professional services layout with credibility, practice areas, and consultation CTAs.",
    ctaPrimary: "Request consult",
    ctaSecondary: "Practice areas",
    accent: "blue",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop",
    productStyle: "minimal",
    badges: ["Confidential", "Expert team", "Fast response"],
  },
  "vayva-clean-crew": {
    id: "vayva-clean-crew",
    name: "Clean Crew",
    tagline: "Home services on demand",
    description:
      "Service layout with booking highlights, location filters, and subscription options.",
    ctaPrimary: "Book cleaning",
    ctaSecondary: "View plans",
    accent: "emerald",
    theme: "light",
    heroImage:
      "https://images.unsplash.com/photo-1508896694512-1eade558679c?q=80&w=1200&auto=format&fit=crop",
    productStyle: "card",
    badges: ["Background checked", "Recurring", "Satisfaction guaranteed"],
  },
  "vayva-noir-club": {
    id: "vayva-noir-club",
    name: "Noir Club",
    tagline: "Experience the night",
    description:
      "Premium nightlife layout with dark ambiance, reservations, and VIP callouts.",
    ctaPrimary: "Reserve table",
    ctaSecondary: "View events",
    accent: "amber",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["VIP tables", "Bottle service", "Guest list"],
  },
  "vayva-pulse-events": {
    id: "vayva-pulse-events",
    name: "Pulse Events",
    tagline: "Unforgettable nights",
    description:
      "High-energy event promoter layout with ticket tiers and countdown urgency.",
    ctaPrimary: "Buy tickets",
    ctaSecondary: "See lineup",
    accent: "violet",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1507878866276-a947ef722fee?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Ticket tiers", "Countdown", "Social proof"],
  },
  "vayva-velvet-lounge": {
    id: "vayva-velvet-lounge",
    name: "Velvet Lounge",
    tagline: "Luxury evenings",
    description:
      "Upscale lounge layout with premium bottle showcases and table map focus.",
    ctaPrimary: "Reserve VIP",
    ctaSecondary: "Bottle menu",
    accent: "rose",
    theme: "dark",
    heroImage:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop",
    productStyle: "bold",
    badges: ["Exclusive tables", "Dress code", "Premium spirits"],
  },
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  id: "default",
  name: "Vayva Storefront",
  tagline: "Modern commerce",
  description:
    "A clean, conversion-optimized storefront layout for any business.",
  ctaPrimary: "Shop now",
  ctaSecondary: "Browse",
  accent: "emerald",
  theme: "light",
  heroImage:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
  productStyle: "card",
  badges: ["Secure checkout", "Fast delivery", "New arrivals"],
};
