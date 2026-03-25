// @ts-expect-error -- @/types/templates may not be resolved in all TS configs
import { CanonicalCategorySlug, CanonicalTemplateId } from "@/types/templates";

export { type CanonicalCategorySlug, type CanonicalTemplateId };

export enum TemplateCategory {
  RETAIL = "Retail",
  SERVICE = "Service",
  FOOD = "Food",
  DIGITAL = "Digital",
  EVENTS = "Events",
  EDUCATION = "Education",
  B2B = "B2B",
  NONPROFIT = "Nonprofit",
  REAL_ESTATE = "Real Estate",
}

export type BillingPlan = "free" | "growth" | "pro";

export interface OnboardingProfile {
  prefill: {
    industryCategory?: string;
    deliveryEnabled?: boolean;
    paymentsEnabled?: boolean;
    defaultCurrency?: string;
  };
  skipSteps?: Array<
    "business" | "storefront" | "payments" | "delivery" | "kyc"
  >;
  requireSteps?: Array<"payments" | "delivery" | "kyc">;
}

export interface TemplateDefinition {
  templateId: string;
  slug: string;
  displayName: string;
  category: TemplateCategory;
  businessModel: string;
  primaryUseCase: string;
  requiredPlan: BillingPlan;
  defaultTheme: "light" | "dark";
  status: "implemented" | "partial" | "pending";
  preview: {
    thumbnailUrl: string | null;
    mobileUrl: string | null;
    desktopUrl: string | null;
    testUrl?: string | null;
  };
  demoStoreUrl?: string;
  compare: {
    headline: string;
    bullets: string[];
    bestFor: string[];
    keyModules: string[];
  };
  routes: string[];
  layoutComponent: string; // The import path key or component name
  componentProps?: Record<string, unknown>; // Optional props to pass to the component
  onboardingProfile?: OnboardingProfile;
  features?: string[];
  description?: string;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  "vayva-standard": {
    templateId: "vayva-standard",
    slug: "demo",
    displayName: "Standard Retail",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "General Physical Goods",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "The essential store for physical products.",
      bullets: [
        "Classic hero banner with CTA",
        "Clean collection grid layout",
        "Simple product details page",
      ],
      bestFor: ["Clothing boutiques", "General merchandise", "Pop-up shops"],
      keyModules: ["Product Catalog", "Cart & Checkout", "Order Management"],
    },
    routes: ["/", "/collections/*", "/products/:slug"],
    layoutComponent: "StandardRetailHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["payments"],
    },
  },
  "vayva-aa-fashion": {
    templateId: "vayva-aa-fashion",
    slug: "aa-fashion-demo",
    displayName: "A&A Fashion",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Fashion / Apparel",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Bold, visual-first fashion retail.",
      bullets: [
        "Full-width imagery focused",
        "Lookbook style collections",
        "Size guide modal integration",
      ],
      bestFor: ["Fashion brands", "Streetwear", "Luxury apparel"],
      keyModules: ["Visual Merchandising", "Size Variants", "Instagram Feed"],
    },
    routes: ["/", "/collections/*", "/products/:slug"],
    layoutComponent: "AAFashionHome",
    componentProps: {
      heroText: "DARK\nMATTER",
      heroSubtext: "Season 04 / 24",
    },
    onboardingProfile: {
      prefill: {
        industryCategory: "Fashion",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["payments"],
    },
  },
  "vayva-gizmo-tech": {
    templateId: "vayva-gizmo-tech",
    slug: "gizmo-demo",
    displayName: "Gizmo Tech",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Electronics",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "High-spec showcase for electronics.",
      bullets: [
        "Spec comparison tables",
        "Dark mode technical aesthetic",
        "Feature highlight grids",
      ],
      bestFor: ["Gadget stores", "Computer shops", "Audio equipment"],
      keyModules: ["Tech Specs", "Product Comparison", "Warranty Info"],
    },
    routes: ["/", "/collections/*", "/products/:slug"],
    layoutComponent: "GizmoTechHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Electronics",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["payments"],
    },
  },
  "vayva-bloome-home": {
    templateId: "vayva-bloome-home",
    slug: "bloome-demo",
    displayName: "Bloome & Home",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Home & Lifestyle",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Serene design for lifestyle and beauty.",
      bullets: [
        "Editorial style storytelling",
        "Soft typography and palettes",
        "Ritual/Routine builder layouts",
      ],
      bestFor: ["Home decor", "Skincare/Beauty", "Wellness brands"],
      keyModules: [
        "Subscription Support",
        "Bundle Builder",
        "Blog Integration",
      ],
    },
    routes: ["/", "/collections/*", "/products/:slug"],
    layoutComponent: "BloomeHomeLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Beauty",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["payments"],
    },
  },
  "vayva-bookly-pro": {
    templateId: "vayva-bookly-pro",
    slug: "bookly-demo",
    displayName: "Bookly Pro",
    category: TemplateCategory.SERVICE,
    businessModel: "Service",
    primaryUseCase: "Appointments / Bookings",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Professional booking system for experts.",
      bullets: [
        "Real-time calendar availability",
        "Service menu with duration",
        "Deposit requirement handling",
      ],
      bestFor: ["Consultants", "Salons & Spas", "Clinics"],
      keyModules: ["Appointment Scheduling", "Staff Management", "Deposits"],
    },
    routes: ["/", "/book/:serviceId"],
    layoutComponent: "StandardServiceHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["delivery"],
      requireSteps: ["payments"],
    },
  },
  "vayva-chopnow": {
    templateId: "vayva-chopnow",
    slug: "chopnow-demo",
    displayName: "ChopNow",
    category: TemplateCategory.FOOD,
    businessModel: "Food",
    primaryUseCase: "Food Delivery / Restaurants",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Fast menu ordering for restaurants.",
      bullets: [
        "Modifier groups (sides, toppings)",
        "Delivery vs Pickup toggle",
        "Visual menu categories",
      ],
      bestFor: ["Restaurants", "Fast Food", "Cloud Kitchens"],
      keyModules: [
        "Kitchen Display System",
        "Menu Modifiers",
        "Delivery Zones",
      ],
    },
    routes: ["/"],
    layoutComponent: "ChopnowLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["delivery", "payments"],
    },
  },
  "vayva-file-vault": {
    templateId: "vayva-file-vault",
    slug: "filevault-demo",
    displayName: "FileVault",
    category: TemplateCategory.DIGITAL,
    businessModel: "Digital",
    primaryUseCase: "Digital Downloads",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Secure delivery for digital assets.",
      bullets: [
        "Instant secure download links",
        "License key distribution",
        "Preview for audio/video/pdf",
      ],
      bestFor: ["E-book authors", "Software devs", "Digital artists"],
      keyModules: [
        "Digital Rights Management",
        "Secure Links",
        "Automated Email",
      ],
    },
    routes: ["/"],
    layoutComponent: "StandardDigitalHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Digital",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["delivery"],
      requireSteps: ["payments"],
    },
  },
  "vayva-ticketly": {
    templateId: "vayva-ticketly",
    slug: "ticketly-demo",
    displayName: "Ticketly",
    category: TemplateCategory.EVENTS,
    businessModel: "Events",
    primaryUseCase: "Ticketing / RSVPs",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Event ticketing and guest management.",
      bullets: [
        "Tiered ticket types (VIP, Early Bird)",
        "Event schedule display",
        "QR code generation",
      ],
      bestFor: ["Concerts", "Workshops", "Conferences"],
      keyModules: ["Ticketing Engine", "QR Check-in", "Guest Lists"],
    },
    routes: ["/", "/events/:slug"],
    layoutComponent: "StandardEventsHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Events",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["delivery"],
      requireSteps: ["payments"],
    },
  },
  "vayva-eduflow": {
    templateId: "vayva-eduflow",
    slug: "eduflow-demo",
    displayName: "Eduflow",
    category: TemplateCategory.EDUCATION,
    businessModel: "Courses",
    primaryUseCase: "Online Courses / LMS",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Complete Learning Management System.",
      bullets: [
        "Course curriculum outline",
        "Video lesson player",
        "Progress tracking",
      ],
      bestFor: ["Educators", "Coaches", "Training Centers"],
      keyModules: ["LMS Player", "Student Progress", "Quizzes"],
    },
    routes: ["/", "/learn/:courseId"],
    layoutComponent: "EduflowLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Education",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["delivery"],
      requireSteps: ["payments"],
    },
  },
  "vayva-bulktrade": {
    templateId: "vayva-bulktrade",
    slug: "bulktrade-demo",
    displayName: "BulkTrade",
    category: TemplateCategory.B2B,
    businessModel: "Wholesale",
    primaryUseCase: "Wholesale / Bulk Orders",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "B2B portal for high-volume trade.",
      bullets: [
        "Minimum Order Quantity (MOQ) rules",
        "Tiered volume pricing tables",
        "Request for Quote (RFQ) flow",
      ],
      bestFor: ["Wholesalers", "Manufacturers", "Distributors"],
      keyModules: ["RFQ System", "Volume Pricing", "Invoice Generation"],
    },
    routes: ["/"],
    layoutComponent: "BulkTradeLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Wholesale",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["payments", "kyc"],
    },
  },

  "vayva-giveflow": {
    templateId: "vayva-giveflow",
    slug: "giveflow-demo",
    displayName: "GiveFlow",
    category: TemplateCategory.NONPROFIT,
    businessModel: "Donations",
    primaryUseCase: "Fundraising / Charity",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Drive impact with donation campaigns.",
      bullets: [
        "Fundraising goal progress bars",
        "Recurring donation options",
        "Donor wall recognition",
      ],
      bestFor: ["Non-profits", "Charities", "Personal Causes"],
      keyModules: ["Donations", "Recurring Billing", "Goal Tracking"],
    },
    routes: ["/"],
    layoutComponent: "GiveFlowLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Non-profit",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["delivery"],
      requireSteps: ["payments"],
    },
  },
  "vayva-homelist": {
    templateId: "vayva-homelist",
    slug: "homelist-demo",
    displayName: "HomeList",
    category: TemplateCategory.REAL_ESTATE,
    businessModel: "Property",
    primaryUseCase: "Listings / Rentals",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Showcase properties and capture leads.",
      bullets: [
        "Property search with advanced filters",
        "Map integration for locations",
        "Booking viewing appointments",
      ],
      bestFor: ["Real Estate Agents", "Property Managers", "Rental Listings"],
      keyModules: ["Property Listings", "Map View", "Lead Capture Form"],
    },
    routes: ["/", "/properties/*"],
    layoutComponent: "HomeListLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Real Estate",
        deliveryEnabled: false,
        paymentsEnabled: false,
      },
      skipSteps: ["delivery", "payments"],
    },
  },
  "vayva-oneproduct": {
    templateId: "vayva-oneproduct",
    slug: "oneproduct-demo",
    displayName: "OneProduct Pro",
    category: TemplateCategory.RETAIL,
    businessModel: "Single Product",
    primaryUseCase: "Funnel / Landing Page",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "High-conversion single product funnel.",
      bullets: [
        "Long-form persuasion layout",
        "Sticky 'Buy Now' mobile CTA",
        "integrated upsell flows",
      ],
      bestFor: ["Dropshippers", "Inventors", "Flash Sales"],
      keyModules: ["Funnel Builder", "Upsells", "Reviews/Social Proof"],
    },
    routes: ["/"],
    layoutComponent: "OneProductLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["payments"],
    },
  },
  "slice-life-pizza": {
    templateId: "slice-life-pizza",
    slug: "slice-life",
    displayName: "Slice Life Pizza",
    category: TemplateCategory.FOOD,
    businessModel: "Food",
    primaryUseCase: "Pizzerias",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    demoStoreUrl: "/demos/slice-life",
    compare: {
      headline: "Artisanal pizza experience.",
      bullets: [
        "Visual menu with modifiers",
        "Delivery zone checker",
        "Combo builder",
      ],
      bestFor: ["Pizzerias", "Italian Restaurants"],
      keyModules: ["Menu Builder", "Modifiers", "Delivery"],
    },
    routes: ["/"],
    layoutComponent: "SliceLifePizza",
    onboardingProfile: {
      prefill: {
        industryCategory: "Food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["delivery", "payments"],
    },
  },
  // --- EXPANSION PACK (18 New Templates) ---
  "vayva-sneaker-drop": {
    templateId: "vayva-sneaker-drop",
    slug: "sneaker-demo",
    displayName: "Sneaker Drop",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Streetwear / Shoes",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Hype drops and limited editions.",
      bullets: ["Countdown timer", "Raffle system", "High-res gallery"],
      bestFor: ["Sneakerheads", "Streetwear Brands"],
      keyModules: ["Drop Timer", "Waitlist", "Stock Limits"],
    },
    routes: ["/"],
    layoutComponent: "AAFashionHome",
    componentProps: {
      heroText: "SNEAKER\nDROP",
      heroSubtext: "Limited Release",
      showTimer: true,
      timerDate: "2025-12-31T00:00:00Z",
    },
    onboardingProfile: { prefill: { industryCategory: "Fashion" } },
  },
  "vayva-kids-world": {
    templateId: "vayva-kids-world",
    slug: "kids-demo",
    displayName: "Kids World",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Toys / Clothing",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Fun and playful store for kids.",
      bullets: ["Bright colors", "Age filters", "Gift bundles"],
      bestFor: ["Toy Stores", "Baby Clothes"],
      keyModules: ["Gift Registry", "Age Filter"],
    },
    routes: ["/"],
    layoutComponent: "StandardRetailHome",
    onboardingProfile: { prefill: { industryCategory: "Toys" } },
  },
  "vayva-pet-palace": {
    templateId: "vayva-pet-palace",
    slug: "pet-demo",
    displayName: "Pet Palace",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Pet Supplies",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Where pets are royalty.",
      bullets: ["Subscription treats", "Breed guide", "Vet advice blog"],
      bestFor: ["Pet Shops", "Groomers"],
      keyModules: ["Subscriptions", "Blog"],
    },
    routes: ["/"],
    layoutComponent: "StandardRetailHome",
    onboardingProfile: { prefill: { industryCategory: "Pets" } },
  },
  "vayva-beauty-box": {
    templateId: "vayva-beauty-box",
    slug: "beauty-demo",
    displayName: "Beauty Box",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Subscription Box",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Curated beauty delivered monthly.",
      bullets: ["Quiz funnel", "Monthly themes", "Unboxing experience"],
      bestFor: ["Subscription Boxes", "Cosmetics"],
      keyModules: ["Quiz", "Recurring Billing"],
    },
    routes: ["/"],
    layoutComponent: "BloomeHomeLayout",
    onboardingProfile: { prefill: { industryCategory: "Beauty" } },
  },
  "vayva-active-gear": {
    templateId: "vayva-active-gear",
    slug: "active-demo",
    displayName: "Active Gear",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Sports / Outdoors",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Performance gear for athletes.",
      bullets: ["Tech specs", "Activity filter", "Team orders"],
      bestFor: ["Sports Shops", "Outdoor Gear"],
      keyModules: ["Filters", "Bulk Orders"],
    },
    routes: ["/"],
    layoutComponent: "GizmoTechHome",
    onboardingProfile: { prefill: { industryCategory: "Sports" } },
  },
  "vayva-coffee-house": {
    templateId: "vayva-coffee-house",
    slug: "coffee-demo",
    displayName: "Coffee House",
    category: TemplateCategory.FOOD,
    businessModel: "Food",
    primaryUseCase: "Cafe / Coffee Shop",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Order ahead for morning brew.",
      bullets: ["Custom drink builder", "Pickup scheduling", "Loyalty points"],
      bestFor: ["Cafes", "Roasters"],
      keyModules: ["Modifiers", "Loyalty"],
    },
    routes: ["/"],
    layoutComponent: "QuickBitesFood",
    onboardingProfile: { prefill: { industryCategory: "Food" } },
  },
  "vayva-burger-joint": {
    templateId: "vayva-burger-joint",
    slug: "burger-demo",
    displayName: "Burger Joint",
    category: TemplateCategory.FOOD,
    businessModel: "Food",
    primaryUseCase: "Fast Food",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Juicy burgers, fast delivery.",
      bullets: ["Combo deals", "Topping selectors", "Fast checkout"],
      bestFor: ["Burger Shops", "Food Trucks"],
      keyModules: ["Combos", "Delivery"],
    },
    routes: ["/"],
    layoutComponent: "ChopnowLayout",
    onboardingProfile: { prefill: { industryCategory: "Food" } },
  },
  "vayva-sushi-bar": {
    templateId: "vayva-sushi-bar",
    slug: "sushi-demo",
    displayName: "Sushi Bar",
    category: TemplateCategory.FOOD,
    businessModel: "Food",
    primaryUseCase: "Asian Cuisine",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Elegant dining experience.",
      bullets: ["Omakase menu", "Reservation booking", "Visual gallery"],
      bestFor: ["Sushi", "Fine Dining"],
      keyModules: ["Reservations", "Menu Gallery"],
    },
    routes: ["/"],
    layoutComponent: "StandardFoodHome",
    onboardingProfile: { prefill: { industryCategory: "Food" } },
  },
  "vayva-bakery": {
    templateId: "vayva-bakery",
    slug: "bakery-demo",
    displayName: "Sweet Bakery",
    category: TemplateCategory.FOOD,
    businessModel: "Food",
    primaryUseCase: "Bakery / Sweets",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Fresh pastries daily.",
      bullets: ["Cake customization", "Pre-order for events", "Gift boxes"],
      bestFor: ["Bakeries", "Patisseries"],
      keyModules: ["Custom Orders", "Scheduling"],
    },
    routes: ["/"],
    layoutComponent: "StandardFoodHome",
    onboardingProfile: { prefill: { industryCategory: "Food" } },
  },
  "vayva-gym-flow": {
    templateId: "vayva-gym-flow",
    slug: "gym-demo",
    displayName: "Gym Flow",
    category: TemplateCategory.SERVICE,
    businessModel: "Service",
    primaryUseCase: "Fitness / Gym",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Class bookings and memberships.",
      bullets: ["Class calendar", "Membership plans", "Trainer profiles"],
      bestFor: ["Gyms", "Yoga Studios"],
      keyModules: ["Calendar", "Memberships"],
    },
    routes: ["/"],
    layoutComponent: "StandardServiceHome",
    onboardingProfile: { prefill: { industryCategory: "Fitness" } },
  },
  "vayva-law-firm": {
    templateId: "vayva-law-firm",
    slug: "law-demo",
    displayName: "Legal Partners",
    category: TemplateCategory.SERVICE,
    businessModel: "Service",
    primaryUseCase: "Professional Services",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Trust and expertise.",
      bullets: ["Consultation booking", "Practice areas", "Attorney bios"],
      bestFor: ["Lawyers", "Consultants"],
      keyModules: ["Appointments", "Bio"],
    },
    routes: ["/"],
    layoutComponent: "StandardServiceHome",
    onboardingProfile: { prefill: { industryCategory: "Legal" } },
  },
  "vayva-clean-crew": {
    templateId: "vayva-clean-crew",
    slug: "clean-demo",
    displayName: "Clean Crew",
    category: TemplateCategory.SERVICE,
    businessModel: "Service",
    primaryUseCase: "Home Services",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Spotless service on demand.",
      bullets: ["Service area check", "Instant quotes", "Recurring bookings"],
      bestFor: ["Cleaners", "Plumbers"],
      keyModules: ["Quoting", "Recurring"],
    },
    routes: ["/"],
    layoutComponent: "StandardServiceHome",
    onboardingProfile: { prefill: { industryCategory: "Home Services" } },
  },
  "vayva-barber-shop": {
    templateId: "vayva-barber-shop",
    slug: "barber-demo",
    displayName: "The Barber",
    category: TemplateCategory.SERVICE,
    businessModel: "Service",
    primaryUseCase: "Grooming",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Sharp cuts, easy booking.",
      bullets: ["Barber selection", "Style gallery", "Mobile friendly"],
      bestFor: ["Barbers", "Salons"],
      keyModules: ["Staff Selection", "Gallery"],
    },
    routes: ["/"],
    layoutComponent: "StandardServiceHome",
    onboardingProfile: { prefill: { industryCategory: "Beauty" } },
  },
  "vayva-music-class": {
    templateId: "vayva-music-class",
    slug: "music-demo",
    displayName: "Music Master",
    category: TemplateCategory.EDUCATION,
    businessModel: "Courses",
    primaryUseCase: "Private Lessons",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Master an instrument.",
      bullets: ["Video lessons", "Sheet music downloads", "Community forum"],
      bestFor: ["Music Teachers", "Schools"],
      keyModules: ["LMS", "Downloads"],
    },
    routes: ["/"],
    layoutComponent: "SkillAcademyCourses",
    onboardingProfile: { prefill: { industryCategory: "Education" } },
  },
  "vayva-ebook-store": {
    templateId: "vayva-ebook-store",
    slug: "ebook-demo",
    displayName: "Book Haven",
    category: TemplateCategory.DIGITAL,
    businessModel: "Digital",
    primaryUseCase: "E-Books",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Instant library access.",
      bullets: ["Kindle/PDF downloads", "Author profile", "Sample chapters"],
      bestFor: ["Authors", "Publishers"],
      keyModules: ["Secure Downloads", "Samples"],
    },
    routes: ["/"],
    layoutComponent: "StandardDigitalHome",
    onboardingProfile: { prefill: { industryCategory: "Digital" } },
  },
  "vayva-photo-presetz": {
    templateId: "vayva-photo-presetz",
    slug: "preset-demo",
    displayName: "Pro Presets",
    category: TemplateCategory.DIGITAL,
    businessModel: "Digital",
    primaryUseCase: "Creative Assets",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Upgrade your workflow.",
      bullets: ["Before/After sliders", "Bundle deals", "Installation guide"],
      bestFor: ["Photographers", "Designers"],
      keyModules: ["Comparison Slider", "Bundles"],
    },
    routes: ["/"],
    layoutComponent: "StandardDigitalHome",
    onboardingProfile: { prefill: { industryCategory: "Creative" } },
  },
  "vayva-conference": {
    templateId: "vayva-conference",
    slug: "conf-demo",
    displayName: "Tech Conf 2024",
    category: TemplateCategory.EVENTS,
    businessModel: "Events",
    primaryUseCase: "Conference",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "The event of the year.",
      bullets: ["Speaker lineup", "Schedule grid", "Sponsor tiering"],
      bestFor: ["Conferences", "Summits"],
      keyModules: ["Schedule", "Speakers"],
    },
    routes: ["/"],
    layoutComponent: "StandardEventsHome",
    onboardingProfile: { prefill: { industryCategory: "Events" } },
  },
  "vayva-wedding-rsvp": {
    templateId: "vayva-wedding-rsvp",
    slug: "wedding-demo",
    displayName: "Forever Yours",
    category: TemplateCategory.EVENTS,
    businessModel: "Events",
    primaryUseCase: "Wedding",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Celebrate our special day.",
      bullets: ["RSVP form", "Gift registry link", "Venue map"],
      bestFor: ["Weddings", "Parties"],
      keyModules: ["RSVP", "Registry"],
    },
    routes: ["/"],
    layoutComponent: "StandardEventsHome",
    onboardingProfile: { prefill: { industryCategory: "Personal" } },
  },
};

export function getTemplatesByCategory(
  category: TemplateCategory | string,
): NormalizedTemplate[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const target = norm(category as string);
  return getNormalizedTemplates().filter(
    (t) => norm(t.category || "") === target,
  );
}

export function getTemplateBySlug(
  slug: string,
): TemplateDefinition | undefined {
  return Object.values(TEMPLATE_REGISTRY).find((t) => t.slug === slug);
}

export function getTemplatesByPlan(plan: BillingPlan): TemplateDefinition[] {
  return Object.values(TEMPLATE_REGISTRY).filter(
    (t) => t.requiredPlan === plan,
  );
}

// --- CANONICAL NORMALIZER (BATCH 1) ---

export const DEFAULT_DESKTOP_PREVIEW =
  "/images/template-previews/default-desktop.png";
export const DEFAULT_MOBILE_PREVIEW =
  "/images/template-previews/default-mobile.png";

export type NormalizedTemplate = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  description: string;

  previewImageDesktop: string; // never empty
  previewImageMobile: string; // never empty
  previewRoute: string; // /preview/[slug]

  features: string[];
  isFree: boolean;
  requiredPlan?: string;
  status: "active" | "inactive" | "deprecated" | string;

  layoutComponent?: string | null;
  componentProps?: Record<string, unknown>; // Pass through props
  registry: TemplateDefinition;
};

export function getNormalizedTemplates(): NormalizedTemplate[] {
  return Object.values(TEMPLATE_REGISTRY)
    .filter((t) => t.status === "implemented" || t.status === "pending")
    .map((t) => {
      const slug = t.slug || t.templateId;

      // Normalize desktop image (fallback used if null)
      const desktop =
        t.preview?.desktopUrl ||
        t.preview?.thumbnailUrl ||
        DEFAULT_DESKTOP_PREVIEW;

      // Normalize mobile image (fallback used if null)
      const mobile = t.preview?.mobileUrl || DEFAULT_MOBILE_PREVIEW;

      const features: string[] = Array.isArray(t.features)
        ? t.features
        : Array.isArray(t.compare?.bullets)
          ? t.compare?.bullets
          : [];

      const requiredPlan = t.requiredPlan || "free";
      const isFree = requiredPlan === "free";

      return {
        id: t.templateId,
        slug,
        name: t.displayName,
        category: t.category,
        description: t.compare?.headline || t.description || "",

        previewImageDesktop: desktop,
        previewImageMobile: mobile,
        previewRoute: `/preview/${slug}`,

        features,
        isFree,
        requiredPlan,
        status: t.status,

        layoutComponent: t.layoutComponent,
        componentProps: t.componentProps,
        registry: t, // Keep ref to original
      };
    });
}

export const TEMPLATES = getNormalizedTemplates();

export interface CategoryConfig {
  slug: TemplateCategory | string;
  displayName: string;
  recommendedTemplates: string[];
  isActive: boolean;
}

export const TEMPLATE_CATEGORIES: CategoryConfig[] = [
  {
    slug: TemplateCategory.RETAIL,
    displayName: "Retail",
    recommendedTemplates: ["vayva-standard", "vayva-aa-fashion"],
    isActive: true,
  },
  {
    slug: TemplateCategory.SERVICE,
    displayName: "Services & Appointments",
    recommendedTemplates: ["vayva-bookly-pro"],
    isActive: true,
  },
  {
    slug: TemplateCategory.FOOD,
    displayName: "Food & Dining",
    recommendedTemplates: ["vayva-chopnow", "slice-life-pizza"],
    isActive: true,
  },
  {
    slug: TemplateCategory.DIGITAL,
    displayName: "Digital Products",
    recommendedTemplates: ["vayva-file-vault"],
    isActive: true,
  },
  {
    slug: TemplateCategory.EVENTS,
    displayName: "Events & Ticketing",
    recommendedTemplates: ["vayva-ticketly"],
    isActive: true,
  },
  {
    slug: TemplateCategory.EDUCATION,
    displayName: "Education & Courses",
    recommendedTemplates: ["vayva-eduflow"],
    isActive: true,
  },
  {
    slug: TemplateCategory.B2B,
    displayName: "Wholesale B2B",
    recommendedTemplates: ["vayva-bulktrade"],
    isActive: true,
  },

  {
    slug: TemplateCategory.NONPROFIT,
    displayName: "Donations & Fundraising",
    recommendedTemplates: ["vayva-giveflow"],
    isActive: true,
  },
  {
    slug: TemplateCategory.REAL_ESTATE,
    displayName: "Real Estate",
    recommendedTemplates: ["vayva-homelist"],
    isActive: true,
  },
];
