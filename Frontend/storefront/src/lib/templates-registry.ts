export enum TemplateCategory {
  RETAIL = "Retail",
  SERVICE = "Service",
  FOOD = "Food",
  DIGITAL = "Digital",
  EVENTS = "Events",
  B2B = "B2B",
  MARKETPLACE = "Marketplace",
  NONPROFIT = "Nonprofit",
  REAL_ESTATE = "Real Estate",
  AUTOMOTIVE = "Automotive",
  TRAVEL = "Travel",
  BLOG = "Blog",
  EDUCATION = "Education",
  ONE_PRODUCT = "One Product",
}

export enum TemplatePlanTier {
  FREE = "free",
  GROWTH = "growth",
  PRO = "pro",
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
  compare: {
    headline: string;
    bullets: string[];
    bestFor: string[];
    keyModules: string[];
  };
  routes: string[];
  layoutComponent: string; // The import path key or component name
  onboardingProfile?: OnboardingProfile;
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
    layoutComponent: "StoreShell",
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
    requiredPlan: "growth",
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
    layoutComponent: "BooklyLayout",
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
    requiredPlan: "growth",
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
    requiredPlan: "growth",
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
    layoutComponent: "FileVaultLayout",
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
    requiredPlan: "growth",
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
    layoutComponent: "TicketlyLayout",
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
    requiredPlan: "growth",
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
    requiredPlan: "pro",
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
  "vayva-markethub": {
    templateId: "vayva-markethub",
    slug: "markethub-demo",
    displayName: "MarketHub",
    category: TemplateCategory.MARKETPLACE,
    businessModel: "Marketplace",
    primaryUseCase: "Multi-vendor",
    requiredPlan: "pro",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Launch your own multi-vendor platform.",
      bullets: [
        "Vendor profiles and catalogs",
        "Unified cart from multiple sellers",
        "Vendor rating system",
      ],
      bestFor: ["Niche marketplaces", "Aggregators", "Malls"],
      keyModules: [
        "Multi-vendor Payouts",
        "Vendor Portal",
        "Commission Engine",
      ],
    },
    routes: ["/"],
    layoutComponent: "MarketHubLayout",
    onboardingProfile: {
      prefill: {
        industryCategory: "Marketplace",
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
    requiredPlan: "growth",
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
    requiredPlan: "pro",
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
    requiredPlan: "growth",
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
  "vayva-automotive": {
    templateId: "vayva-automotive",
    slug: "auto-demo",
    displayName: "Auto Dealer",
    category: TemplateCategory.RETAIL,
    businessModel: "Retail",
    primaryUseCase: "Automotive Sales",
    requiredPlan: "pro",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Professional showroom for dealerships.",
      bullets: [
        "Vehicle search widget",
        "Inventory listings",
        "Financing calculator integration",
      ],
      bestFor: ["Car Dealerships", "Motorcycle Shops", "Heavy Equipment"],
      keyModules: ["Vehicle Search", "Inventory Management", "Lead Gen"],
    },
    routes: ["/", "/inventory/:id"],
    layoutComponent: "AutoDealerHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Automotive",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["payments"],
    },
  },
  "vayva-travel": {
    templateId: "vayva-travel",
    slug: "travel-demo",
    displayName: "Staycation",
    category: TemplateCategory.SERVICE,
    businessModel: "Booking",
    primaryUseCase: "Hotels / Rentals",
    requiredPlan: "pro",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Elegant booking for hospitality.",
      bullets: [
        "Room/Property gallery",
        "Availability calendar",
        "Amenity icons",
      ],
      bestFor: ["Hotels", "BnBs", "Vacation Rentals"],
      keyModules: ["Booking Engine", "Property Management", "Seasonal Pricing"],
    },
    routes: ["/", "/rooms/:id"],
    layoutComponent: "StaycationHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Hospitality",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["payments"],
    },
  },
  "vayva-blog": {
    templateId: "vayva-blog",
    slug: "blog-demo",
    displayName: "Editorial",
    category: TemplateCategory.DIGITAL,
    businessModel: "Content",
    primaryUseCase: "Publications / blogs",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "implemented",
    preview: { thumbnailUrl: null, mobileUrl: null, desktopUrl: null },
    compare: {
      headline: "Content-first layout for publishers.",
      bullets: [
        "Minimalist typography",
        "Featured articles grid",
        "Newsletter capture",
      ],
      bestFor: ["Bloggers", "News Sites", "Magazines"],
      keyModules: ["Blog Engine", "Newsletter", "Ad Placements"],
    },
    routes: ["/", "/read/:slug"],
    layoutComponent: "EditorialHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "Media",
        deliveryEnabled: false,
        paymentsEnabled: false,
      },
      skipSteps: ["delivery", "payments"],
    },
  },
};

export function getTemplatesByCategory(
  category: TemplateCategory,
): TemplateDefinition[] {
  return Object.values(TEMPLATE_REGISTRY).filter(
    (t) => t.category === category,
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
