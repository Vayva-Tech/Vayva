/**
 * Unified Template Gallery
 * =======================
 * Single source of truth for storefront templates shown to merchants.
 * Preview assets live under `/template-gallery/` in app public dirs.
 */

export interface TemplateGalleryItem {
  id: string;
  slug: string;
  displayName: string;
  category: string;
  industry: string;
  businessModel: string;
  primaryUseCase: string;
  requiredPlan: 'free' | 'starter' | 'pro';
  defaultTheme: 'light' | 'dark' | 'auto';
  status: 'active' | 'beta' | 'deprecated' | 'coming_soon';
  
  // Preview assets
  preview: {
    thumbnailUrl: string;
    mobileUrl: string;
    desktopUrl: string;
    demoVideoUrl?: string;
  };
  
  // Template metadata
  compare: {
    headline: string;
    bullets: string[];
    bestFor: string[];
    keyModules: string[];
  };
  
  // Technical specs
  routes: string[];
  layoutKey: string;
  componentProps?: Record<string, unknown>;
  
  // Onboarding flow
  onboardingProfile: {
    prefill: {
      industryCategory: string;
      deliveryEnabled?: boolean;
      paymentsEnabled?: boolean;
    };
    skipSteps?: string[];
    requireSteps?: string[];
  };
  
  // Source location
  source: {
    type: 'registry' | 'standalone' | 'custom';
    folderPath?: string;
    demoUrl?: string;
  };
}

// ============================================================================
// RETAIL TEMPLATES (10)
// ============================================================================

export const RETAIL_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "standard",
    slug: "demo",
    displayName: "Standard Retail",
    category: "Retail",
    industry: "retail",
    businessModel: "Retail",
    primaryUseCase: "General Physical Goods",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/standard/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/standard/mobile.jpg",
      desktopUrl: "/template-gallery/retail/standard/desktop.jpg",
    },
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
    layoutKey: "StandardRetailHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "aa-fashion",
    slug: "aa-fashion-demo",
    displayName: "A&A Fashion",
    category: "Retail",
    industry: "fashion",
    businessModel: "Retail",
    primaryUseCase: "Fashion / Apparel",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/fashion/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/fashion/mobile.jpg",
      desktopUrl: "/template-gallery/retail/fashion/desktop.jpg",
    },
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
    layoutKey: "AAFashionHome",
    componentProps: {
      heroText: "DARK\\nMATTER",
      heroSubtext: "Season 04 / 24",
    },
    onboardingProfile: {
      prefill: {
        industryCategory: "fashion",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "gizmo-tech",
    slug: "gizmo-demo",
    displayName: "Gizmo Tech",
    category: "Retail",
    industry: "electronics",
    businessModel: "Retail",
    primaryUseCase: "Electronics",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/gizmo/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/gizmo/mobile.jpg",
      desktopUrl: "/template-gallery/retail/gizmo/desktop.jpg",
    },
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
    layoutKey: "GizmoTechHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "electronics",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "bloome-home",
    slug: "bloome-demo",
    displayName: "Bloome & Home",
    category: "Retail",
    industry: "beauty",
    businessModel: "Retail",
    primaryUseCase: "Home & Lifestyle",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/bloome/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/bloome/mobile.jpg",
      desktopUrl: "/template-gallery/retail/bloome/desktop.jpg",
    },
    compare: {
      headline: "Serene design for lifestyle and beauty.",
      bullets: [
        "Editorial style storytelling",
        "Soft typography and palettes",
        "Ritual/Routine builder layouts",
      ],
      bestFor: ["Home decor", "Skincare/Beauty", "Wellness brands"],
      keyModules: ["Subscription Support", "Bundle Builder", "Blog Integration"],
    },
    routes: ["/", "/collections/*", "/products/:slug"],
    layoutKey: "BloomeHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "beauty",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "sneaker-drop",
    slug: "sneaker-demo",
    displayName: "Sneaker Drop",
    category: "Retail",
    industry: "fashion",
    businessModel: "Retail",
    primaryUseCase: "Streetwear / Shoes",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/sneaker/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/sneaker/mobile.jpg",
      desktopUrl: "/template-gallery/retail/sneaker/desktop.jpg",
    },
    compare: {
      headline: "Hype drops and limited editions.",
      bullets: ["Countdown timer", "Raffle system", "High-res gallery"],
      bestFor: ["Sneakerheads", "Streetwear Brands"],
      keyModules: ["Drop Timer", "Waitlist", "Stock Limits"],
    },
    routes: ["/"],
    layoutKey: "AAFashionHome",
    componentProps: {
      heroText: "SNEAKER\\nDROP",
      heroSubtext: "Limited Release",
      showTimer: true,
      timerDate: "2025-12-31T00:00:00Z",
    },
    onboardingProfile: { 
      prefill: { 
        industryCategory: "fashion",
        deliveryEnabled: true,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "grover",
    slug: "grover-demo",
    displayName: "Grover",
    category: "Retail",
    industry: "retail",
    businessModel: "Retail",
    primaryUseCase: "Grocery / General Store",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/grover/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/grover/mobile.jpg",
      desktopUrl: "/template-gallery/retail/grover/desktop.jpg",
    },
    compare: {
      headline: "Modern grocery and general store experience.",
      bullets: [
        "Category-based product browsing",
        "Shopping cart with quick add",
        "Delivery scheduling integration",
      ],
      bestFor: ["Grocery stores", "General stores", "Convenience shops"],
      keyModules: ["Product Catalog", "Cart", "Checkout", "Delivery"],
    },
    routes: ["/", "/shop", "/category/:slug", "/product/:slug", "/cart", "/checkout"],
    layoutKey: "GroverHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "logistics"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/grover",
      demoUrl: "/demos/grover",
    },
  },
  {
    id: "fashun",
    slug: "fashun-demo",
    displayName: "Fashun",
    category: "Retail",
    industry: "fashion",
    businessModel: "Retail",
    primaryUseCase: "High-End Fashion",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/fashun/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/fashun/mobile.jpg",
      desktopUrl: "/template-gallery/retail/fashun/desktop.jpg",
    },
    compare: {
      headline: "Premium fashion retail with editorial flair.",
      bullets: [
        "Editorial lookbook layouts",
        "Designer brand showcases",
        "Size and fit guides",
      ],
      bestFor: ["Fashion boutiques", "Designer brands", "Luxury retail"],
      keyModules: ["Lookbook", "Brand Pages", "Size Guide", "Wishlist"],
    },
    routes: ["/", "/collections", "/product/:slug", "/about", "/contact"],
    layoutKey: "FashunHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "fashion",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/fashun",
      demoUrl: "/demos/fashun",
    },
  },
  {
    id: "tradehub",
    slug: "tradehub-demo",
    displayName: "TradeHub",
    category: "Retail",
    industry: "retail",
    businessModel: "B2B",
    primaryUseCase: "Wholesale / Trade",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/tradehub/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/tradehub/mobile.jpg",
      desktopUrl: "/template-gallery/retail/tradehub/desktop.jpg",
    },
    compare: {
      headline: "B2B trading platform for wholesalers.",
      bullets: [
        "Bulk ordering system",
        "MOQ and tiered pricing",
        "Quote request workflows",
      ],
      bestFor: ["Wholesalers", "Distributors", "B2B traders"],
      keyModules: ["Bulk Orders", "MOQ Pricing", "RFQ", "B2B Accounts"],
    },
    routes: ["/", "/products", "/quote", "/account"],
    layoutKey: "TradeHubHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "kyc"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/tradehub",
      demoUrl: "/demos/tradehub",
    },
  },
  {
    id: "cryptovault",
    slug: "cryptovault-demo",
    displayName: "CryptoVault",
    category: "Retail",
    industry: "digital",
    businessModel: "Digital",
    primaryUseCase: "Crypto / Digital Assets",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/cryptovault/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/cryptovault/mobile.jpg",
      desktopUrl: "/template-gallery/retail/cryptovault/desktop.jpg",
    },
    compare: {
      headline: "Digital asset showcase and trading.",
      bullets: [
        "Crypto product listings",
        "Secure vault features",
        "Multi-chain support display",
      ],
      bestFor: ["Crypto projects", "NFT collections", "Digital asset stores"],
      keyModules: ["Product Grid", "Vault Features", "Security Showcase"],
    },
    routes: ["/", "/products", "/features", "/about"],
    layoutKey: "CryptoVaultHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "digital",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/cryptovault",
      demoUrl: "/demos/cryptovault",
    },
  },
  {
    id: "oneproduct",
    slug: "oneproduct-demo",
    displayName: "OneProduct Pro",
    category: "Retail",
    industry: "retail",
    businessModel: "Single Product",
    primaryUseCase: "Funnel / Landing Page",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/retail/oneproduct/thumbnail.jpg",
      mobileUrl: "/template-gallery/retail/oneproduct/mobile.jpg",
      desktopUrl: "/template-gallery/retail/oneproduct/desktop.jpg",
    },
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
    layoutKey: "OneProductHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
];

// ============================================================================
// FOOD & RESTAURANT TEMPLATES (9)
// ============================================================================

export const FOOD_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "chopnow",
    slug: "chopnow-demo",
    displayName: "ChopNow",
    category: "Food & Drink",
    industry: "food",
    businessModel: "Food",
    primaryUseCase: "Food Delivery / Restaurants",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/chopnow/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/chopnow/mobile.jpg",
      desktopUrl: "/template-gallery/food/chopnow/desktop.jpg",
    },
    compare: {
      headline: "Fast menu ordering for restaurants.",
      bullets: [
        "Modifier groups (sides, toppings)",
        "Delivery vs Pickup toggle",
        "Visual menu categories",
      ],
      bestFor: ["Restaurants", "Fast Food", "Cloud Kitchens"],
      keyModules: ["Kitchen Display System", "Menu Modifiers", "Delivery Zones"],
    },
    routes: ["/"],
    layoutKey: "QuickBitesFood",
    onboardingProfile: {
      prefill: {
        industryCategory: "food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["logistics", "finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "slice-life-pizza",
    slug: "slice-life",
    displayName: "Slice Life Pizza",
    category: "Food & Drink",
    industry: "food",
    businessModel: "Food",
    primaryUseCase: "Pizzerias",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/slice-life/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/slice-life/mobile.jpg",
      desktopUrl: "/template-gallery/food/slice-life/desktop.jpg",
    },
    compare: {
      headline: "Artisanal pizza experience.",
      bullets: ["Visual menu with modifiers", "Delivery zone checker", "Combo builder"],
      bestFor: ["Pizzerias", "Italian Restaurants"],
      keyModules: ["Menu Builder", "Modifiers", "Delivery"],
    },
    routes: ["/"],
    layoutKey: "SliceLifePizza",
    onboardingProfile: {
      prefill: {
        industryCategory: "food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["logistics", "finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "coffee-house",
    slug: "coffee-demo",
    displayName: "Coffee House",
    category: "Food & Drink",
    industry: "food",
    businessModel: "Food",
    primaryUseCase: "Cafe / Coffee Shop",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/coffee/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/coffee/mobile.jpg",
      desktopUrl: "/template-gallery/food/coffee/desktop.jpg",
    },
    compare: {
      headline: "Order ahead for morning brew.",
      bullets: ["Custom drink builder", "Pickup scheduling", "Loyalty points"],
      bestFor: ["Cafes", "Roasters"],
      keyModules: ["Modifiers", "Loyalty"],
    },
    routes: ["/"],
    layoutKey: "QuickBitesFood",
    onboardingProfile: { 
      prefill: { 
        industryCategory: "food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "burger-joint",
    slug: "burger-demo",
    displayName: "Burger Joint",
    category: "Food & Drink",
    industry: "food",
    businessModel: "Food",
    primaryUseCase: "Fast Food",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/burger/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/burger/mobile.jpg",
      desktopUrl: "/template-gallery/food/burger/desktop.jpg",
    },
    compare: {
      headline: "Juicy burgers, fast delivery.",
      bullets: ["Combo deals", "Topping selectors", "Fast checkout"],
      bestFor: ["Burger Shops", "Food Trucks"],
      keyModules: ["Combos", "Delivery"],
    },
    routes: ["/"],
    layoutKey: "QuickBitesFood",
    onboardingProfile: { 
      prefill: { 
        industryCategory: "food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "sushi-bar",
    slug: "sushi-demo",
    displayName: "Sushi Bar",
    category: "Food & Drink",
    industry: "food",
    businessModel: "Food",
    primaryUseCase: "Asian Cuisine",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/sushi/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/sushi/mobile.jpg",
      desktopUrl: "/template-gallery/food/sushi/desktop.jpg",
    },
    compare: {
      headline: "Elegant dining experience.",
      bullets: ["Omakase menu", "Reservation booking", "Visual gallery"],
      bestFor: ["Sushi", "Fine Dining"],
      keyModules: ["Reservations", "Menu Gallery"],
    },
    routes: ["/"],
    layoutKey: "StandardFoodHome",
    onboardingProfile: { 
      prefill: { 
        industryCategory: "food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "bakery",
    slug: "bakery-demo",
    displayName: "Sweet Bakery",
    category: "Food & Drink",
    industry: "food",
    businessModel: "Food",
    primaryUseCase: "Bakery / Sweets",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/bakery/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/bakery/mobile.jpg",
      desktopUrl: "/template-gallery/food/bakery/desktop.jpg",
    },
    compare: {
      headline: "Fresh pastries daily.",
      bullets: ["Cake customization", "Pre-order for events", "Gift boxes"],
      bestFor: ["Bakeries", "Patisseries"],
      keyModules: ["Custom Orders", "Scheduling"],
    },
    routes: ["/"],
    layoutKey: "StandardFoodHome",
    onboardingProfile: { 
      prefill: { 
        industryCategory: "food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "petcare",
    slug: "petcare-demo",
    displayName: "PetCare",
    category: "Food & Drink",
    industry: "retail",
    businessModel: "Retail",
    primaryUseCase: "Pet Supplies",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/petcare/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/petcare/mobile.jpg",
      desktopUrl: "/template-gallery/food/petcare/desktop.jpg",
    },
    compare: {
      headline: "Pet supplies and care products.",
      bullets: [
        "Pet category browsing",
        "Subscription treat boxes",
        "Pet care guides",
      ],
      bestFor: ["Pet stores", "Pet groomers", "Veterinary clinics"],
      keyModules: ["Product Catalog", "Subscriptions", "Pet Profiles"],
    },
    routes: ["/", "/products", "/guides", "/about"],
    layoutKey: "PetCareHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/petcare",
      demoUrl: "/demos/petcare",
    },
  },
  {
    id: "blissbo",
    slug: "blissbo-demo",
    displayName: "BlissBo",
    category: "Food & Drink",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Spa & Wellness",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/blissbo/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/blissbo/mobile.jpg",
      desktopUrl: "/template-gallery/food/blissbo/desktop.jpg",
    },
    compare: {
      headline: "Luxury spa and wellness bookings.",
      bullets: [
        "Service menu with durations",
        "Online appointment booking",
        "Treatment packages",
      ],
      bestFor: ["Spas", "Wellness centers", "Salons"],
      keyModules: ["Booking System", "Service Menu", "Packages"],
    },
    routes: ["/", "/services", "/booking", "/about"],
    layoutKey: "BlissBoHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/blissbo",
      demoUrl: "/demos/blissbo",
    },
  },
];

// ============================================================================
// SERVICES TEMPLATES (6)
// ============================================================================

export const SERVICE_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "bookly-pro",
    slug: "bookly-demo",
    displayName: "Bookly Pro",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Appointments / Bookings",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/service/bookly/thumbnail.jpg",
      mobileUrl: "/template-gallery/service/bookly/mobile.jpg",
      desktopUrl: "/template-gallery/service/bookly/desktop.jpg",
    },
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
    layoutKey: "StandardServiceHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["logistics"],
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "gym-flow",
    slug: "gym-demo",
    displayName: "Gym Flow",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Fitness / Gym",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/service/gym/thumbnail.jpg",
      mobileUrl: "/template-gallery/service/gym/mobile.jpg",
      desktopUrl: "/template-gallery/service/gym/desktop.jpg",
    },
    compare: {
      headline: "Class bookings and memberships.",
      bullets: ["Class calendar", "Membership plans", "Trainer profiles"],
      bestFor: ["Gyms", "Yoga Studios"],
      keyModules: ["Calendar", "Memberships"],
    },
    routes: ["/"],
    layoutKey: "StandardServiceHome",
    onboardingProfile: { 
      prefill: { 
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "law-firm",
    slug: "law-demo",
    displayName: "Legal Partners",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Professional Services",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/service/legal/thumbnail.jpg",
      mobileUrl: "/template-gallery/service/legal/mobile.jpg",
      desktopUrl: "/template-gallery/service/legal/desktop.jpg",
    },
    compare: {
      headline: "Trustworthy presence for professionals.",
      bullets: ["Practice areas", "Team bios", "Consultation form"],
      bestFor: ["Law Firms", "Accountants"],
      keyModules: ["Consultation Request", "Team Profiles"],
    },
    routes: ["/"],
    layoutKey: "StandardServiceHome",
    onboardingProfile: { 
      prefill: { 
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "clean-crew",
    slug: "clean-demo",
    displayName: "Clean Crew",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Home Services",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/service/clean/thumbnail.jpg",
      mobileUrl: "/template-gallery/service/clean/mobile.jpg",
      desktopUrl: "/template-gallery/service/clean/desktop.jpg",
    },
    compare: {
      headline: "Home services on demand.",
      bullets: ["Service selection", "Zip code check", "Recurring plans"],
      bestFor: ["Cleaners", "Plumbers", "Handymen"],
      keyModules: ["Location Check", "Subscriptions"],
    },
    routes: ["/"],
    layoutKey: "StandardServiceHome",
    onboardingProfile: { 
      prefill: { 
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      } 
    },
    source: { type: "registry" },
  },
  {
    id: "medicare",
    slug: "medicare-demo",
    displayName: "Medicare",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Healthcare / Medical",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/service/medicare/thumbnail.jpg",
      mobileUrl: "/template-gallery/service/medicare/mobile.jpg",
      desktopUrl: "/template-gallery/service/medicare/desktop.jpg",
    },
    compare: {
      headline: "Healthcare appointment booking.",
      bullets: [
        "Doctor profiles and specialties",
        "Online appointment scheduling",
        "Medical service listings",
      ],
      bestFor: ["Medical clinics", "Hospitals", "Private practices"],
      keyModules: ["Appointments", "Doctor Directory", "Services"],
    },
    routes: ["/", "/doctors", "/services", "/book"],
    layoutKey: "MedicareHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/medicare",
      demoUrl: "/demos/medicare",
    },
  },
  {
    id: "legalease",
    slug: "legalease-demo",
    displayName: "Legalease",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Legal Services",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/service/legalease/thumbnail.jpg",
      mobileUrl: "/template-gallery/service/legalease/mobile.jpg",
      desktopUrl: "/template-gallery/service/legalease/desktop.jpg",
    },
    compare: {
      headline: "Professional legal services.",
      bullets: [
        "Practice area showcase",
        "Attorney profiles",
        "Case evaluation forms",
      ],
      bestFor: ["Law firms", "Legal consultants", "Attorneys"],
      keyModules: ["Contact Forms", "Practice Areas", "Attorney Directory"],
    },
    routes: ["/", "/practice-areas", "/attorneys", "/contact"],
    layoutKey: "LegaleaseHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/legalease",
      demoUrl: "/demos/legalease",
    },
  },
];

// ============================================================================
// NIGHTLIFE & ENTERTAINMENT TEMPLATES (6)
// ============================================================================

export const NIGHTLIFE_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "noir-club",
    slug: "noir-club-demo",
    displayName: "Noir Club",
    category: "Nightlife",
    industry: "nightlife",
    businessModel: "Venue",
    primaryUseCase: "Clubs & Lounges",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/nightlife/noir/thumbnail.jpg",
      mobileUrl: "/template-gallery/nightlife/noir/mobile.jpg",
      desktopUrl: "/template-gallery/nightlife/noir/desktop.jpg",
    },
    compare: {
      headline: "Premium nightclub experience.",
      bullets: [
        "Immersive dark theme with gold accents",
        "Table reservation with bottle pre-orders",
        "VIP section showcase",
        "Event calendar integration",
      ],
      bestFor: ["Nightclubs", "Lounges", "VIP venues"],
      keyModules: ["Table Booking", "Bottle Menu", "Event Listings", "Guest List"],
    },
    routes: ["/", "/events", "/tables", "/bottles", "/reserve"],
    layoutKey: "NoirClubHome",
    componentProps: {
      heroText: "EXPERIENCE\\nTHE NIGHT",
      heroSubtext: "Premium Tables • Bottle Service • Unforgettable Nights",
    },
    onboardingProfile: {
      prefill: {
        industryCategory: "nightlife",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["venue_profile", "table_setup", "bottle_menu"],
    },
    source: { type: "registry" },
  },
  {
    id: "pulse-events",
    slug: "pulse-events-demo",
    displayName: "Pulse Events",
    category: "Nightlife",
    industry: "nightlife",
    businessModel: "Promoter",
    primaryUseCase: "Event Promoters",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/nightlife/pulse/thumbnail.jpg",
      mobileUrl: "/template-gallery/nightlife/pulse/mobile.jpg",
      desktopUrl: "/template-gallery/nightlife/pulse/desktop.jpg",
    },
    compare: {
      headline: "Event promotion made powerful.",
      bullets: [
        "Bold event showcase with countdown timers",
        "Multi-tier ticket sales",
        "Past event gallery for credibility",
        "Social proof and testimonials",
      ],
      bestFor: ["Event promoters", "Party organizers", "Concert promoters"],
      keyModules: ["Ticket Sales", "Event Gallery", "Countdown Timer", "Social Sharing"],
    },
    routes: ["/", "/events/:slug", "/tickets", "/gallery"],
    layoutKey: "PulseEventsHome",
    componentProps: {
      heroText: "UNFORGETTABLE\\nNIGHTS",
      heroSubtext: "Tickets • Events • Experiences",
    },
    onboardingProfile: {
      prefill: {
        industryCategory: "nightlife",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["promoter_profile", "first_event"],
    },
    source: { type: "registry" },
  },
  {
    id: "velvet-lounge",
    slug: "velvet-lounge-demo",
    displayName: "Velvet Lounge",
    category: "Nightlife",
    industry: "nightlife",
    businessModel: "Venue",
    primaryUseCase: "Upscale Lounges",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/nightlife/velvet/thumbnail.jpg",
      mobileUrl: "/template-gallery/nightlife/velvet/mobile.jpg",
      desktopUrl: "/template-gallery/nightlife/velvet/desktop.jpg",
    },
    compare: {
      headline: "Luxury lounge sophistication.",
      bullets: [
        "Elegant burgundy and gold design",
        "Interactive table map selection",
        "Premium bottle showcase",
        "Dress code and ambiance highlights",
      ],
      bestFor: ["Upscale lounges", "Rooftop bars", "Speakeasies"],
      keyModules: ["Table Map", "Bottle Catalog", "Reservation System", "Dress Code"],
    },
    routes: ["/", "/reserve", "/menu", "/events", "/gallery"],
    layoutKey: "VelvetLoungeHome",
    componentProps: {
      heroText: "ELEVATE\\nYOUR NIGHT",
      heroSubtext: "Exclusive Tables • Premium Spirits • Refined Atmosphere",
    },
    onboardingProfile: {
      prefill: {
        industryCategory: "nightlife",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["venue_profile", "table_setup", "bottle_menu"],
    },
    source: { type: "registry" },
  },
  {
    id: "nightpulse",
    slug: "nightpulse-demo",
    displayName: "NightPulse",
    category: "Nightlife",
    industry: "nightlife",
    businessModel: "Venue",
    primaryUseCase: "Nightclub / Bar",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/nightlife/nightpulse/thumbnail.jpg",
      mobileUrl: "/template-gallery/nightlife/nightpulse/mobile.jpg",
      desktopUrl: "/template-gallery/nightlife/nightpulse/desktop.jpg",
    },
    compare: {
      headline: "Energetic nightlife experience.",
      bullets: [
        "Dynamic event listings",
        "Bottle service booking",
        "Guest list management",
      ],
      bestFor: ["Nightclubs", "Bars", "Music venues"],
      keyModules: ["Events", "Bookings", "Guest List"],
    },
    routes: ["/", "/events", "/book", "/vip"],
    layoutKey: "NightPulseHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "nightlife",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/nightpulse",
      demoUrl: "/demos/nightpulse",
    },
  },
  {
    id: "musicflow",
    slug: "musicflow-demo",
    displayName: "MusicFlow",
    category: "Nightlife",
    industry: "nightlife",
    businessModel: "Venue",
    primaryUseCase: "Music / DJ / Events",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/nightlife/musicflow/thumbnail.jpg",
      mobileUrl: "/template-gallery/nightlife/musicflow/mobile.jpg",
      desktopUrl: "/template-gallery/nightlife/musicflow/desktop.jpg",
    },
    compare: {
      headline: "Music venue and event showcase.",
      bullets: [
        "Event calendar and ticketing",
        "Artist/DJ profiles",
        "Music streaming integration",
      ],
      bestFor: ["Music venues", "Concert halls", "DJ events"],
      keyModules: ["Events", "Artists", "Ticketing"],
    },
    routes: ["/", "/events", "/artists", "/tickets"],
    layoutKey: "MusicFlowHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "nightlife",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/musicflow",
      demoUrl: "/demos/musicflow",
    },
  },
  {
    id: "eventhorizon",
    slug: "eventhorizon-demo",
    displayName: "EventHorizon",
    category: "Nightlife",
    industry: "events",
    businessModel: "Events",
    primaryUseCase: "Event Management / Ticketing",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/nightlife/eventhorizon/thumbnail.jpg",
      mobileUrl: "/template-gallery/nightlife/eventhorizon/mobile.jpg",
      desktopUrl: "/template-gallery/nightlife/eventhorizon/desktop.jpg",
    },
    compare: {
      headline: "Complete event management platform.",
      bullets: [
        "Event discovery and search",
        "Venue listings",
        "Ticket sales and management",
      ],
      bestFor: ["Event organizers", "Venues", "Ticketing platforms"],
      keyModules: ["Events", "Venues", "Ticketing", "Search"],
    },
    routes: ["/", "/events", "/venues", "/tickets"],
    layoutKey: "EventHorizonHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "events",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/eventhorizon",
      demoUrl: "/demos/eventhorizon",
    },
  },
];

// ============================================================================
// EDUCATION TEMPLATES (6)
// ============================================================================

export const EDUCATION_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "eduflow",
    slug: "eduflow-demo",
    displayName: "Eduflow",
    category: "Education",
    industry: "services",
    businessModel: "Courses",
    primaryUseCase: "Online Courses / LMS",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/education/eduflow/thumbnail.jpg",
      mobileUrl: "/template-gallery/education/eduflow/mobile.jpg",
      desktopUrl: "/template-gallery/education/eduflow/desktop.jpg",
    },
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
    layoutKey: "SkillAcademyCourses",
    onboardingProfile: {
      prefill: {
        industryCategory: "education",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["logistics"],
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "edulearn",
    slug: "edulearn-demo",
    displayName: "EduLearn",
    category: "Education",
    industry: "education",
    businessModel: "Courses",
    primaryUseCase: "Online Learning Platform",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/education/edulearn/thumbnail.jpg",
      mobileUrl: "/template-gallery/education/edulearn/mobile.jpg",
      desktopUrl: "/template-gallery/education/edulearn/desktop.jpg",
    },
    compare: {
      headline: "Comprehensive e-learning platform.",
      bullets: [
        "Course catalog with categories",
        "Student dashboard",
        "Assignment and materials",
        "Calendar integration",
      ],
      bestFor: ["Schools", "Online academies", "Training institutes"],
      keyModules: ["Courses", "Dashboard", "Calendar", "Materials"],
    },
    routes: ["/", "/courses", "/dashboard", "/calendar", "/materials"],
    layoutKey: "EduLearnHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "education",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/edulearn",
      demoUrl: "/demos/edulearn",
    },
  },
  {
    id: "codecamp",
    slug: "codecamp-demo",
    displayName: "CodeCamp",
    category: "Education",
    industry: "education",
    businessModel: "Courses",
    primaryUseCase: "Coding / Tech Education",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/education/codecamp/thumbnail.jpg",
      mobileUrl: "/template-gallery/education/codecamp/mobile.jpg",
      desktopUrl: "/template-gallery/education/codecamp/desktop.jpg",
    },
    compare: {
      headline: "Tech-focused learning platform.",
      bullets: [
        "Interactive coding lessons",
        "Project-based curriculum",
        "Tutorials and resources",
        "Pricing plans",
      ],
      bestFor: ["Coding bootcamps", "Tech training", "Online courses"],
      keyModules: ["Courses", "Tutorials", "Pricing", "Projects"],
    },
    routes: ["/", "/courses", "/tutorials", "/pricing"],
    layoutKey: "CodeCampHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "education",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/codecamp",
      demoUrl: "/demos/codecamp",
    },
  },
  {
    id: "courseacademy",
    slug: "courseacademy-demo",
    displayName: "CourseAcademy",
    category: "Education",
    industry: "education",
    businessModel: "Courses",
    primaryUseCase: "Course Creation / LMS",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/education/courseacademy/thumbnail.jpg",
      mobileUrl: "/template-gallery/education/courseacademy/mobile.jpg",
      desktopUrl: "/template-gallery/education/courseacademy/desktop.jpg",
    },
    compare: {
      headline: "Premium course academy platform.",
      bullets: [
        "Advanced course builder",
        "Student analytics dashboard",
        "Certification system",
        "Instructor profiles",
      ],
      bestFor: ["Course creators", "Online schools", "Professional training"],
      keyModules: ["Course Builder", "Analytics", "Certificates", "Instructors"],
    },
    routes: ["/", "/courses", "/instructors", "/dashboard"],
    layoutKey: "CourseAcademyHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "education",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/courseacademy",
      demoUrl: "/demos/courseacademy",
    },
  },
  {
    id: "jobnexus",
    slug: "jobnexus-demo",
    displayName: "JobNexus",
    category: "Education",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Job Board / Careers",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/education/jobnexus/thumbnail.jpg",
      mobileUrl: "/template-gallery/education/jobnexus/mobile.jpg",
      desktopUrl: "/template-gallery/education/jobnexus/desktop.jpg",
    },
    compare: {
      headline: "Job board and career platform.",
      bullets: [
        "Job listings with search",
        "Employer profiles",
        "Resume upload system",
        "Application tracking",
      ],
      bestFor: ["Job boards", "Recruitment agencies", "Career centers"],
      keyModules: ["Job Listings", "Employers", "Applications", "Search"],
    },
    routes: ["/", "/jobs", "/employers", "/post-job"],
    layoutKey: "JobNexusHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/jobnexus",
      demoUrl: "/demos/jobnexus",
    },
  },
  {
    id: "hoperise",
    slug: "hoperise-demo",
    displayName: "Hoperise",
    category: "Education",
    industry: "travel",
    businessModel: "Service",
    primaryUseCase: "Hotels / Hospitality",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/education/hoperise/thumbnail.jpg",
      mobileUrl: "/template-gallery/education/hoperise/mobile.jpg",
      desktopUrl: "/template-gallery/education/hoperise/desktop.jpg",
    },
    compare: {
      headline: "Hotel and hospitality booking.",
      bullets: [
        "Room listings and booking",
        "Amenity showcases",
        "Availability calendar",
        "Guest reviews",
      ],
      bestFor: ["Hotels", "Resorts", "B&Bs"],
      keyModules: ["Bookings", "Rooms", "Reviews", "Calendar"],
    },
    routes: ["/", "/rooms", "/book", "/about"],
    layoutKey: "HoperiseHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "travel",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/hoperise",
      demoUrl: "/demos/hoperise",
    },
  },
];

// ============================================================================
// REAL ESTATE & TRAVEL TEMPLATES (4)
// ============================================================================

export const REAL_ESTATE_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "homelist",
    slug: "homelist-demo",
    displayName: "HomeList",
    category: "Real Estate",
    industry: "real_estate",
    businessModel: "Property",
    primaryUseCase: "Listings / Rentals",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/real-estate/homelist/thumbnail.jpg",
      mobileUrl: "/template-gallery/real-estate/homelist/mobile.jpg",
      desktopUrl: "/template-gallery/real-estate/homelist/desktop.jpg",
    },
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
    layoutKey: "HomeListHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "real_estate",
        deliveryEnabled: false,
        paymentsEnabled: false,
      },
      skipSteps: ["logistics", "finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "larkhomes",
    slug: "larkhomes-demo",
    displayName: "LarkHomes",
    category: "Real Estate",
    industry: "real_estate",
    businessModel: "Property",
    primaryUseCase: "Real Estate / Properties",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/real-estate/larkhomes/thumbnail.jpg",
      mobileUrl: "/template-gallery/real-estate/larkhomes/mobile.jpg",
      desktopUrl: "/template-gallery/real-estate/larkhomes/desktop.jpg",
    },
    compare: {
      headline: "Premium real estate listings.",
      bullets: [
        "Advanced property search",
        "Agent profiles and contact",
        "Mortgage calculator",
        "Property details pages",
      ],
      bestFor: ["Real estate agencies", "Property developers", "Realtors"],
      keyModules: ["Listings", "Agents", "Calculator", "Contact"],
    },
    routes: ["/", "/listings", "/agents", "/about", "/contact", "/mortgage-calculator"],
    layoutKey: "LarkHomesHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "real_estate",
        deliveryEnabled: false,
        paymentsEnabled: false,
      },
      skipSteps: ["logistics"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/larkhomes",
      demoUrl: "/demos/larkhomes",
    },
  },
  {
    id: "staysavvy",
    slug: "staysavvy-demo",
    displayName: "StaySavvy",
    category: "Real Estate",
    industry: "travel",
    businessModel: "Property",
    primaryUseCase: "Vacation Rentals",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/real-estate/staysavvy/thumbnail.jpg",
      mobileUrl: "/template-gallery/real-estate/staysavvy/mobile.jpg",
      desktopUrl: "/template-gallery/real-estate/staysavvy/desktop.jpg",
    },
    compare: {
      headline: "Vacation rental platform.",
      bullets: [
        "Property search with filters",
        "Booking calendar",
        "Host profiles",
        "Guest reviews",
      ],
      bestFor: ["Vacation rentals", "Airbnb-style", "Short-term stays"],
      keyModules: ["Search", "Calendar", "Reviews", "Messaging"],
    },
    routes: ["/", "/properties", "/book"],
    layoutKey: "StaySavvyHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "travel",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/staysavvy",
      demoUrl: "/demos/staysavvy",
    },
  },
  {
    id: "autodealer",
    slug: "autodealer-demo",
    displayName: "AutoDealer",
    category: "Real Estate",
    industry: "automotive",
    businessModel: "Property",
    primaryUseCase: "Car Dealership",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/real-estate/autodealer/thumbnail.jpg",
      mobileUrl: "/template-gallery/real-estate/autodealer/mobile.jpg",
      desktopUrl: "/template-gallery/real-estate/autodealer/desktop.jpg",
    },
    compare: {
      headline: "Car dealership showroom.",
      bullets: [
        "Vehicle inventory search",
        "Car details with specs",
        "Financing options",
        "Test drive booking",
      ],
      bestFor: ["Car dealerships", "Auto traders", "Vehicle showrooms"],
      keyModules: ["Inventory", "Financing", "Booking", "Specs"],
    },
    routes: ["/", "/inventory", "/financing", "/about"],
    layoutKey: "AutoDealerHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "automotive",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/autodealer",
      demoUrl: "/demos/autodealer",
    },
  },
];

// ============================================================================
// B2B & MARKETPLACE TEMPLATES (3)
// ============================================================================

export const B2B_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "bulktrade",
    slug: "bulktrade-demo",
    displayName: "BulkTrade",
    category: "B2B",
    industry: "b2b",
    businessModel: "Wholesale",
    primaryUseCase: "Wholesale / Bulk Orders",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/b2b/bulktrade/thumbnail.jpg",
      mobileUrl: "/template-gallery/b2b/bulktrade/mobile.jpg",
      desktopUrl: "/template-gallery/b2b/bulktrade/desktop.jpg",
    },
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
    layoutKey: "BulkTradeHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "b2b",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "kyc"],
    },
    source: { type: "registry" },
  },
  {
    id: "markethub",
    slug: "markethub-demo",
    displayName: "MarketHub",
    category: "Marketplace",
    industry: "retail",
    businessModel: "Marketplace",
    primaryUseCase: "Multi-vendor",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/b2b/markethub/thumbnail.jpg",
      mobileUrl: "/template-gallery/b2b/markethub/mobile.jpg",
      desktopUrl: "/template-gallery/b2b/markethub/desktop.jpg",
    },
    compare: {
      headline: "Launch your own multi-vendor platform.",
      bullets: [
        "Vendor profiles and catalogs",
        "Unified cart from multiple sellers",
        "Vendor rating system",
        "Commission engine",
      ],
      bestFor: ["Niche marketplaces", "Aggregators", "Malls"],
      keyModules: ["Multi-vendor Payouts", "Vendor Portal", "Commission Engine"],
    },
    routes: ["/"],
    layoutKey: "CreativeMarketStore",
    onboardingProfile: {
      prefill: {
        industryCategory: "marketplace",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "kyc"],
    },
    source: { type: "registry" },
  },
  {
    id: "saasflow",
    slug: "saasflow-demo",
    displayName: "SaaSFlow",
    category: "B2B",
    industry: "b2b",
    businessModel: "SaaS",
    primaryUseCase: "SaaS Product Website",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/b2b/saasflow/thumbnail.jpg",
      mobileUrl: "/template-gallery/b2b/saasflow/mobile.jpg",
      desktopUrl: "/template-gallery/b2b/saasflow/desktop.jpg",
    },
    compare: {
      headline: "SaaS product website and dashboard.",
      bullets: [
        "Feature showcases",
        "Pricing plans with comparison",
        "User dashboard",
        "Integration listings",
      ],
      bestFor: ["SaaS companies", "Software products", "Tech startups"],
      keyModules: ["Features", "Pricing", "Dashboard", "Integrations"],
    },
    routes: ["/", "/features", "/pricing", "/dashboard", "/integrations", "/about"],
    layoutKey: "SaaSFlowHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "b2b",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/saasflow",
      demoUrl: "/demos/saasflow",
    },
  },
];

// ============================================================================
// DIGITAL & NONPROFIT TEMPLATES (3)
// ============================================================================

export const DIGITAL_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "file-vault",
    slug: "filevault-demo",
    displayName: "FileVault",
    category: "Digital",
    industry: "digital",
    businessModel: "Digital",
    primaryUseCase: "Digital Downloads",
    requiredPlan: "free",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/digital/filevault/thumbnail.jpg",
      mobileUrl: "/template-gallery/digital/filevault/mobile.jpg",
      desktopUrl: "/template-gallery/digital/filevault/desktop.jpg",
    },
    compare: {
      headline: "Secure delivery for digital assets.",
      bullets: [
        "Instant secure download links",
        "License key distribution",
        "Preview for audio/video/pdf",
      ],
      bestFor: ["E-book authors", "Software devs", "Digital artists"],
      keyModules: ["Digital Rights Management", "Secure Links", "Automated Email"],
    },
    routes: ["/"],
    layoutKey: "StandardDigitalHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "digital",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["logistics"],
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "giveflow",
    slug: "giveflow-demo",
    displayName: "GiveFlow",
    category: "Nonprofit",
    industry: "nonprofit",
    businessModel: "Donations",
    primaryUseCase: "Fundraising / Charity",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/nonprofit/giveflow/thumbnail.jpg",
      mobileUrl: "/template-gallery/nonprofit/giveflow/mobile.jpg",
      desktopUrl: "/template-gallery/nonprofit/giveflow/desktop.jpg",
    },
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
    layoutKey: "GiveFlowHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "nonprofit",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["logistics"],
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
  {
    id: "cloudhost",
    slug: "cloudhost-demo",
    displayName: "CloudHost",
    category: "Digital",
    industry: "b2b",
    businessModel: "SaaS",
    primaryUseCase: "Hosting / Infrastructure",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/digital/cloudhost/thumbnail.jpg",
      mobileUrl: "/template-gallery/digital/cloudhost/mobile.jpg",
      desktopUrl: "/template-gallery/digital/cloudhost/desktop.jpg",
    },
    compare: {
      headline: "Hosting and infrastructure services.",
      bullets: [
        "Server plans and pricing",
        "Feature comparisons",
        "Status page integration",
        "Support portal",
      ],
      bestFor: ["Hosting providers", "Cloud services", "Infrastructure"],
      keyModules: ["Pricing", "Features", "Status", "Support"],
    },
    routes: ["/", "/hosting", "/features", "/about"],
    layoutKey: "CloudHostHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "b2b",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/cloudhost",
      demoUrl: "/demos/cloudhost",
    },
  },
];

// ============================================================================
// CREATIVE & PORTFOLIO TEMPLATES (3)
// ============================================================================

export const CREATIVE_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "artistry",
    slug: "artistry-demo",
    displayName: "Artistry",
    category: "Creative",
    industry: "creative",
    businessModel: "Service",
    primaryUseCase: "Creative Agency / Portfolio",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/artistry/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/artistry/mobile.jpg",
      desktopUrl: "/template-gallery/creative/artistry/desktop.jpg",
    },
    compare: {
      headline: "Creative agency and portfolio.",
      bullets: [
        "Portfolio showcase",
        "Service listings",
        "Creative team profiles",
        "Client testimonials",
      ],
      bestFor: ["Agencies", "Designers", "Creative studios"],
      keyModules: ["Portfolio", "Services", "Team", "Contact"],
    },
    routes: ["/", "/portfolio", "/services", "/about", "/contact"],
    layoutKey: "ArtistryHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "creative",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/artistry",
      demoUrl: "/demos/artistry",
    },
  },
  {
    id: "photoframe",
    slug: "photoframe-demo",
    displayName: "PhotoFrame",
    category: "Creative",
    industry: "creative",
    businessModel: "Service",
    primaryUseCase: "Photography Portfolio",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/photoframe/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/photoframe/mobile.jpg",
      desktopUrl: "/template-gallery/creative/photoframe/desktop.jpg",
    },
    compare: {
      headline: "Photography portfolio and booking.",
      bullets: [
        "Photo galleries",
        "Photography services",
        "Online booking system",
        "Client proofing",
      ],
      bestFor: ["Photographers", "Studios", "Photo agencies"],
      keyModules: ["Galleries", "Services", "Booking", "Contact"],
    },
    routes: ["/", "/galleries", "/services", "/booking"],
    layoutKey: "PhotoFrameHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "creative",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/photoframe",
      demoUrl: "/demos/photoframe",
    },
  },
  {
    id: "fitpulse",
    slug: "fitpulse-demo",
    displayName: "FitPulse",
    category: "Creative",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Fitness / Gym",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/fitpulse/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/fitpulse/mobile.jpg",
      desktopUrl: "/template-gallery/creative/fitpulse/desktop.jpg",
    },
    compare: {
      headline: "Fitness gym and classes.",
      bullets: [
        "Fitness classes schedule",
        "Trainer profiles",
        "Membership plans",
        "Progress dashboard",
      ],
      bestFor: ["Gyms", "Fitness studios", "Personal trainers"],
      keyModules: ["Classes", "Trainers", "Membership", "Dashboard"],
    },
    routes: ["/", "/classes", "/trainers", "/membership", "/dashboard"],
    layoutKey: "FitPulseHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/fitpulse",
      demoUrl: "/demos/fitpulse",
    },
  },
  {
    id: "agriculture",
    slug: "agriculture-demo",
    displayName: "AgriFresh",
    category: "Creative",
    industry: "retail",
    businessModel: "Retail",
    primaryUseCase: "Agricultural Products",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/agriculture/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/agriculture/mobile.jpg",
      desktopUrl: "/template-gallery/creative/agriculture/desktop.jpg",
    },
    compare: {
      headline: "Fresh farm produce marketplace.",
      bullets: [
        "Seasonal produce catalog",
        "Farm-to-table delivery",
        "Bulk ordering options",
        "Subscription boxes",
      ],
      bestFor: ["Farmers", "Produce sellers", "Organic markets"],
      keyModules: ["Product Catalog", "Subscriptions", "Delivery"],
    },
    routes: ["/", "/about", "/portfolio"],
    layoutKey: "AgricultureHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "retail",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "logistics"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/agriculture",
      demoUrl: "/demos/agriculture",
    },
  },
  {
    id: "aquavibe",
    slug: "aquavibe-demo",
    displayName: "AquaVibe",
    category: "Creative",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Water Sports / Pool Services",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/aquavibe/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/aquavibe/mobile.jpg",
      desktopUrl: "/template-gallery/creative/aquavibe/desktop.jpg",
    },
    compare: {
      headline: "Pool services and water sports.",
      bullets: [
        "Pool maintenance booking",
        "Water sports lessons",
        "Equipment rentals",
        "Seasonal packages",
      ],
      bestFor: ["Pool services", "Water sports", "Swimming schools"],
      keyModules: ["Booking", "Services", "Packages"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "AquaVibeHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/aquavibe",
      demoUrl: "/demos/aquavibe",
    },
  },
  {
    id: "codecamp",
    slug: "codecamp-demo",
    displayName: "CodeCamp",
    category: "Creative",
    industry: "education",
    businessModel: "Service",
    primaryUseCase: "Coding Bootcamp",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/codecamp/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/codecamp/mobile.jpg",
      desktopUrl: "/template-gallery/creative/codecamp/desktop.jpg",
    },
    compare: {
      headline: "Coding bootcamp and tech education.",
      bullets: [
        "Course catalog",
        "Bootcamp enrollment",
        "Student dashboard",
        "Career services",
      ],
      bestFor: ["Bootcamps", "Coding schools", "Tech training"],
      keyModules: ["Courses", "Enrollment", "Dashboard", "Community"],
    },
    routes: ["/", "/about", "/auth", "/careers", "/community", "/courses", "/dashboard", "/docs"],
    layoutKey: "CodeCampHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "education",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/codecamp",
      demoUrl: "/demos/codecamp",
    },
  },
  {
    id: "musicflow",
    slug: "musicflow-demo",
    displayName: "MusicFlow",
    category: "Creative",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Music School / Studio",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/musicflow/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/musicflow/mobile.jpg",
      desktopUrl: "/template-gallery/creative/musicflow/desktop.jpg",
    },
    compare: {
      headline: "Music school and studio services.",
      bullets: [
        "Lesson bookings",
        "Studio rentals",
        "Course enrollment",
        "Playlist showcase",
      ],
      bestFor: ["Music schools", "Recording studios", "Artists"],
      keyModules: ["Booking", "Library", "Playlists", "Courses"],
    },
    routes: ["/", "/library", "/playlists"],
    layoutKey: "MusicFlowHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/musicflow",
      demoUrl: "/demos/musicflow",
    },
  },
  {
    id: "studiobox",
    slug: "studiobox-demo",
    displayName: "StudioBox",
    category: "Creative",
    industry: "creative",
    businessModel: "Service",
    primaryUseCase: "Recording Studio",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/creative/studiobox/thumbnail.jpg",
      mobileUrl: "/template-gallery/creative/studiobox/mobile.jpg",
      desktopUrl: "/template-gallery/creative/studiobox/desktop.jpg",
    },
    compare: {
      headline: "Recording studio and creative space.",
      bullets: [
        "Studio booking system",
        "Equipment showcase",
        "Portfolio gallery",
        "Service packages",
      ],
      bestFor: ["Recording studios", "Creative spaces", "Podcasters"],
      keyModules: ["Booking", "Gallery", "Services", "Contact"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "StudioBoxHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "creative",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/studiobox",
      demoUrl: "/demos/studiobox",
    },
  },
];

// ============================================================================
// OUTDOOR & LIFESTYLE TEMPLATES
// ============================================================================

export const OUTDOOR_LIFESTYLE_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "campout",
    slug: "campout-demo",
    displayName: "CampOut",
    category: "Outdoor",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Camping / Outdoor Gear",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/outdoor/campout/thumbnail.jpg",
      mobileUrl: "/template-gallery/outdoor/campout/mobile.jpg",
      desktopUrl: "/template-gallery/outdoor/campout/desktop.jpg",
    },
    compare: {
      headline: "Camping gear and outdoor adventures.",
      bullets: [
        "Gear catalog",
        "Adventure packages",
        "Rental bookings",
        "Trip planning",
      ],
      bestFor: ["Camping stores", "Outdoor guides", "Adventure companies"],
      keyModules: ["Catalog", "Bookings", "Packages", "Guides"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "CampOutHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "logistics"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/campout",
      demoUrl: "/demos/campout",
    },
  },
  {
    id: "craftbrew",
    slug: "craftbrew-demo",
    displayName: "CraftBrew",
    category: "Food",
    industry: "food",
    businessModel: "Retail",
    primaryUseCase: "Craft Brewery",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/craftbrew/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/craftbrew/mobile.jpg",
      desktopUrl: "/template-gallery/food/craftbrew/desktop.jpg",
    },
    compare: {
      headline: "Craft brewery and taproom.",
      bullets: [
        "Beer catalog and tasting notes",
        "Brewery tours booking",
        "Merchandise store",
        "Events and releases",
      ],
      bestFor: ["Breweries", "Taprooms", "Craft beer"],
      keyModules: ["Catalog", "Bookings", "Events", "Store"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "CraftBrewHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "food",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/craftbrew",
      demoUrl: "/demos/craftbrew",
    },
  },
  {
    id: "freshmarket",
    slug: "freshmarket-demo",
    displayName: "FreshMarket",
    category: "Food",
    industry: "food",
    businessModel: "Retail",
    primaryUseCase: "Fresh Food Market",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/food/freshmarket/thumbnail.jpg",
      mobileUrl: "/template-gallery/food/freshmarket/mobile.jpg",
      desktopUrl: "/template-gallery/food/freshmarket/desktop.jpg",
    },
    compare: {
      headline: "Fresh produce and grocery market.",
      bullets: [
        "Fresh produce catalog",
        "Local vendor listings",
        "Delivery scheduling",
        "Weekly specials",
      ],
      bestFor: ["Farmers markets", "Grocers", "Fresh food"],
      keyModules: ["Catalog", "Vendors", "Delivery", "Specials"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "FreshMarketHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "food",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "logistics"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/freshmarket",
      demoUrl: "/demos/freshmarket",
    },
  },
  {
    id: "kidspace",
    slug: "kidspace-demo",
    displayName: "KidSpace",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Kids Activity Center",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/services/kidspace/thumbnail.jpg",
      mobileUrl: "/template-gallery/services/kidspace/mobile.jpg",
      desktopUrl: "/template-gallery/services/kidspace/desktop.jpg",
    },
    compare: {
      headline: "Kids activities and play center.",
      bullets: [
        "Activity classes booking",
        "Party packages",
        "Membership plans",
        "Parent portal",
      ],
      bestFor: ["Play centers", "Kids activities", "Family fun"],
      keyModules: ["Booking", "Parties", "Membership", "Portal"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "KidSpaceHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/kidspace",
      demoUrl: "/demos/kidspace",
    },
  },
  {
    id: "partypop",
    slug: "partypop-demo",
    displayName: "PartyPop",
    category: "Events",
    industry: "events",
    businessModel: "Service",
    primaryUseCase: "Party Planning / Supplies",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/events/partypop/thumbnail.jpg",
      mobileUrl: "/template-gallery/events/partypop/mobile.jpg",
      desktopUrl: "/template-gallery/events/partypop/desktop.jpg",
    },
    compare: {
      headline: "Party planning and supplies.",
      bullets: [
        "Party package booking",
        "Supply rentals",
        "Venue listings",
        "Theme catalogs",
      ],
      bestFor: ["Party planners", "Event suppliers", "Venues"],
      keyModules: ["Booking", "Rentals", "Venues", "Themes"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "PartyPopHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "events",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "logistics"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/partypop",
      demoUrl: "/demos/partypop",
    },
  },
  {
    id: "petpal",
    slug: "petpal-demo",
    displayName: "PetPal",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Pet Services",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/services/petpal/thumbnail.jpg",
      mobileUrl: "/template-gallery/services/petpal/mobile.jpg",
      desktopUrl: "/template-gallery/services/petpal/desktop.jpg",
    },
    compare: {
      headline: "Pet care and services.",
      bullets: [
        "Grooming appointments",
        "Walking services",
        "Pet supplies",
        "Vet booking",
      ],
      bestFor: ["Pet groomers", "Dog walkers", "Pet stores"],
      keyModules: ["Booking", "Services", "Store", "Vets"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "PetPalHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      requireSteps: ["finance", "logistics"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/petpal",
      demoUrl: "/demos/petpal",
    },
  },
  {
    id: "playzone",
    slug: "playzone-demo",
    displayName: "PlayZone",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Gaming / Arcade",
    requiredPlan: "starter",
    defaultTheme: "dark",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/services/playzone/thumbnail.jpg",
      mobileUrl: "/template-gallery/services/playzone/mobile.jpg",
      desktopUrl: "/template-gallery/services/playzone/desktop.jpg",
    },
    compare: {
      headline: "Gaming center and arcade.",
      bullets: [
        "Game session booking",
        "Tournament listings",
        "Membership cards",
        "Party packages",
      ],
      bestFor: ["Arcades", "Gaming centers", "Esports"],
      keyModules: ["Booking", "Tournaments", "Membership", "Parties"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "PlayZoneHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/playzone",
      demoUrl: "/demos/playzone",
    },
  },
  {
    id: "wellness",
    slug: "wellness-demo",
    displayName: "Wellness",
    category: "Services",
    industry: "services",
    businessModel: "Service",
    primaryUseCase: "Wellness / Spa",
    requiredPlan: "starter",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/services/wellness/thumbnail.jpg",
      mobileUrl: "/template-gallery/services/wellness/mobile.jpg",
      desktopUrl: "/template-gallery/services/wellness/desktop.jpg",
    },
    compare: {
      headline: "Wellness and spa services.",
      bullets: [
        "Spa treatment booking",
        "Wellness packages",
        "Gift cards",
        "Membership plans",
      ],
      bestFor: ["Spas", "Wellness centers", "Retreats"],
      keyModules: ["Booking", "Packages", "Gift Cards", "Membership"],
    },
    routes: ["/", "/about", "/contact"],
    layoutKey: "WellnessHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "services",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      requireSteps: ["finance"],
    },
    source: { 
      type: "standalone", 
      folderPath: "/templates/wellness",
      demoUrl: "/demos/wellness",
    },
  },
];

export const EVENTS_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "ticketly",
    slug: "ticketly-demo",
    displayName: "Ticketly",
    category: "Events",
    industry: "events",
    businessModel: "Events",
    primaryUseCase: "Ticketing / RSVPs",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/events/ticketly/thumbnail.jpg",
      mobileUrl: "/template-gallery/events/ticketly/mobile.jpg",
      desktopUrl: "/template-gallery/events/ticketly/desktop.jpg",
    },
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
    layoutKey: "StandardEventsHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "events",
        deliveryEnabled: false,
        paymentsEnabled: true,
      },
      skipSteps: ["logistics"],
      requireSteps: ["finance"],
    },
    source: { type: "registry" },
  },
];

// ============================================================================
// MEAL KIT TEMPLATES (1)
// ============================================================================

export const MEAL_KIT_TEMPLATES: TemplateGalleryItem[] = [
  {
    id: "meal-kit",
    slug: "demo",
    displayName: "HelloFresh Meal Kit",
    category: "Food",
    industry: "meal-kit",
    businessModel: "Subscription Commerce",
    primaryUseCase: "Meal Kit Delivery Service",
    requiredPlan: "pro",
    defaultTheme: "light",
    status: "active",
    preview: {
      thumbnailUrl: "/template-gallery/meal-kit/hellofresh/thumbnail.jpg",
      mobileUrl: "/template-gallery/meal-kit/hellofresh/mobile.jpg",
      desktopUrl: "/template-gallery/meal-kit/hellofresh/desktop.jpg",
    },
    compare: {
      headline: "Fresh ingredients, delivered ready-to-cook.",
      bullets: [
        "Weekly recipe selection interface",
        "Subscription plan builder",
        "Delivery scheduling system",
      ],
      bestFor: ["Meal kit startups", "Farm-to-table delivery", "Prepared meal services"],
      keyModules: ["Subscription Management", "Meal Selector", "Delivery Scheduler", "Recipe Database"],
    },
    routes: ["/", "/menu", "/delivery", "/subscribe"],
    layoutKey: "MealKitHome",
    onboardingProfile: {
      prefill: {
        industryCategory: "meal-kit",
        deliveryEnabled: true,
        paymentsEnabled: true,
      },
      skipSteps: ["logistics"],
      requireSteps: ["finance", "products"],
    },
    source: { 
      type: "standalone",
      folderPath: "/templates/meal-kit/food",
      demoUrl: "/templates/meal-kit/food",
    },
  },
];

// ============================================================================
// ALL TEMPLATES COMBINED
// ============================================================================

export const ALL_TEMPLATES: TemplateGalleryItem[] = [
  ...RETAIL_TEMPLATES,
  ...FOOD_TEMPLATES,
  ...SERVICE_TEMPLATES,
  ...NIGHTLIFE_TEMPLATES,
  ...EDUCATION_TEMPLATES,
  ...REAL_ESTATE_TEMPLATES,
  ...B2B_TEMPLATES,
  ...DIGITAL_TEMPLATES,
  ...CREATIVE_TEMPLATES,
  ...OUTDOOR_LIFESTYLE_TEMPLATES,
  ...EVENTS_TEMPLATES,
  ...MEAL_KIT_TEMPLATES,
];

// ============================================================================
// CATEGORY GROUPINGS FOR CONTROL CENTER
// ============================================================================

export const TEMPLATE_CATEGORIES = [
  {
    slug: "retail",
    displayName: "Retail & E-Commerce",
    description: "Sell physical products online",
    isActive: true,
    templates: RETAIL_TEMPLATES.map(t => t.id),
  },
  {
    slug: "food",
    displayName: "Food & Restaurants",
    description: "Restaurants, delivery, and food services",
    isActive: true,
    templates: FOOD_TEMPLATES.map(t => t.id),
  },
  {
    slug: "services",
    displayName: "Services & Appointments",
    description: "Booking-based service businesses",
    isActive: true,
    templates: SERVICE_TEMPLATES.map(t => t.id),
  },
  {
    slug: "nightlife",
    displayName: "Nightlife & Entertainment",
    description: "Clubs, bars, and event venues",
    isActive: true,
    templates: NIGHTLIFE_TEMPLATES.map(t => t.id),
  },
  {
    slug: "education",
    displayName: "Education & Learning",
    description: "Courses, schools, and training",
    isActive: true,
    templates: EDUCATION_TEMPLATES.map(t => t.id),
  },
  {
    slug: "real-estate",
    displayName: "Real Estate & Travel",
    description: "Properties, hotels, and rentals",
    isActive: true,
    templates: REAL_ESTATE_TEMPLATES.map(t => t.id),
  },
  {
    slug: "b2b",
    displayName: "B2B & SaaS",
    description: "Wholesale, marketplaces, and software",
    isActive: true,
    templates: B2B_TEMPLATES.map(t => t.id),
  },
  {
    slug: "digital",
    displayName: "Digital & Nonprofit",
    description: "Digital products and charity",
    isActive: true,
    templates: DIGITAL_TEMPLATES.map(t => t.id),
  },
  {
    slug: "creative",
    displayName: "Creative & Portfolio",
    description: "Agencies, portfolios, and creative work",
    isActive: true,
    templates: CREATIVE_TEMPLATES.map(t => t.id),
  },
  {
    slug: "outdoor-lifestyle",
    displayName: "Outdoor & Lifestyle",
    description: "Camping, wellness, and lifestyle services",
    isActive: true,
    templates: OUTDOOR_LIFESTYLE_TEMPLATES.map(t => t.id),
  },
  {
    slug: "events",
    displayName: "Events & Ticketing",
    description: "Event management and ticket sales",
    isActive: true,
    templates: EVENTS_TEMPLATES.map(t => t.id),
  },
  {
    slug: "meal-kit",
    displayName: "Meal Kit & Food Delivery",
    description: "Subscription-based meal kit delivery",
    isActive: true,
    templates: MEAL_KIT_TEMPLATES.map(t => t.id),
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTemplateById(id: string): TemplateGalleryItem | undefined {
  return ALL_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(categorySlug: string): TemplateGalleryItem[] {
  return ALL_TEMPLATES.filter(t => t.industry === categorySlug || t.category.toLowerCase() === categorySlug.toLowerCase());
}

export function getTemplatesByPlan(plan: 'free' | 'starter' | 'pro'): TemplateGalleryItem[] {
  return ALL_TEMPLATES.filter(t => t.requiredPlan === plan);
}

export function getActiveTemplates(): TemplateGalleryItem[] {
  return ALL_TEMPLATES.filter(t => t.status === 'active');
}

export function getRegistryTemplates(): TemplateGalleryItem[] {
  return ALL_TEMPLATES.filter(t => t.source.type === 'registry');
}

export function getStandaloneTemplates(): TemplateGalleryItem[] {
  return ALL_TEMPLATES.filter(t => t.source.type === 'standalone');
}

export const GALLERY_STATS = {
  total: ALL_TEMPLATES.length,
  byCategory: TEMPLATE_CATEGORIES.map(cat => ({
    category: cat.displayName,
    count: cat.templates.length,
  })),
  byPlan: {
    free: ALL_TEMPLATES.filter(t => t.requiredPlan === 'free').length,
    starter: ALL_TEMPLATES.filter(t => t.requiredPlan === 'starter').length,
    pro: ALL_TEMPLATES.filter(t => t.requiredPlan === 'pro').length,
  },
  bySource: {
    registry: ALL_TEMPLATES.filter(t => t.source.type === 'registry').length,
    standalone: ALL_TEMPLATES.filter(t => t.source.type === 'standalone').length,
    custom: ALL_TEMPLATES.filter(t => t.source.type === 'custom').length,
  },
};
