// ============================================================================
// CONSOLIDATED INDUSTRY CONFIGURATION
// ============================================================================
// 4 base archetypes + per-industry overrides for tailored sidebars:
// 1. commerce - Product-based businesses (retail, fashion, electronics, beauty, grocery, B2B)
// 2. food - Restaurants, food delivery, kitchens
// 3. bookings - Service-based with appointments (salons, real estate, automotive, hospitality)
// 4. content - Digital products, events, education, portfolio, media
//
// Each industry slug can override modules, labels, icons, and routes via INDUSTRY_OVERRIDES.
// ============================================================================

import { IndustryConfig } from "@/types/industry";

// ============================================================================
// COMMON MODULES & WIDGETS (reused across archetypes)
// ============================================================================

const COMMERCE_MODULES = [
  "dashboard",
  "catalog",
  "sales",
  "fulfillment",
  "finance",
  "marketing",
  "customers",
  "content",
  "b2b",
  "settings",
] as const;

const BASE_PRODUCT_FORM = {
  requiredFields: ["price", "images"],
  optionalFields: ["description", "tags"],
  variantLabel: "Variants",
  validation: { minImages: 1 },
} as const;

const COMMON_WIDGETS = [
  {
    id: "today_visits",
    title: "Today's Visits",
    dataSource: "real",
    type: "stat",
    w: 1,
  },
  {
    id: "add_product_cta",
    title: "Add Your First Product",
    dataSource: "real",
    type: "cta",
    w: 2,
  },
  {
    id: "quick_actions",
    title: "Quick Actions",
    dataSource: "static",
    type: "quick_actions",
    w: 1,
  },
] as const;

// ============================================================================
// 4 INDUSTRY ARCHETYPES
// ============================================================================

export const INDUSTRY_ARCHETYPES: Record<
  "commerce" | "food" | "bookings" | "content",
  IndustryConfig
> = {
  // ============================================================================
  // 1. COMMERCE - Product-based businesses
  // ============================================================================
  commerce: {
    id: "commerce",
    name: "E-Commerce",
    displayName: "E-Commerce Store",
    description: "Sell physical products online with inventory management",
    primaryObject: "product",
    modules: COMMERCE_MODULES,
    moduleLabels: {
      catalog: "Products",
      sales: "Orders",
      fulfillment: "Shipments",
    },
    moduleIcons: {
      catalog: "Package",
      sales: "ShoppingCart",
      fulfillment: "Truck",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/catalog", create: "/dashboard/catalog/new" },
      sales: { index: "/dashboard/orders" },
      fulfillment: { index: "/dashboard/shipments" },
    },
    dashboardWidgets: [
      {
        id: "total_sales",
        title: "Total Sales",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_products",
        title: "Total Products",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      product: BASE_PRODUCT_FORM,
    },
    onboardingSteps: ["store_profile", "first_product"],
    features: { inventory: true, delivery: true, payments: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions"],
    defaultSettings: {},
  },

  // ============================================================================
  // 2. FOOD - Restaurants & Food delivery
  // ============================================================================
  food: {
    id: "food",
    name: "Restaurant & Food",
    displayName: "Restaurant & Food",
    description: "Manage menus, take orders, and coordinate kitchen operations",
    primaryObject: "menu_item",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "fulfillment",
      "finance",
      "marketing",
      "customers",
      "settings",
    ],
    moduleLabels: {
      catalog: "Menu Items",
      sales: "Orders",
      fulfillment: "Kitchen View",
    },
    moduleIcons: {
      catalog: "UtensilsCrossed",
      sales: "ShoppingBag",
      fulfillment: "ChefHat",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/menu-items", create: "/dashboard/menu-items/new" },
      sales: { index: "/dashboard/orders" },
      fulfillment: { index: "/dashboard/kitchen" },
    },
    dashboardWidgets: [
      {
        id: "active_orders",
        title: "Active Orders",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "revenue_today",
        title: "Revenue Today",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      menu_item: {
        requiredFields: ["price", "prep_time"],
        optionalFields: ["calories", "allergens", "ingredients"],
        variantLabel: "Modifiers",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "menu_setup", "delivery_settings"],
    features: { delivery: true, payments: true, kitchen: true },
    aiTools: ["get_menu", "place_order", "check_order_status", "get_promotions"],
    defaultSettings: {},
  },

  // ============================================================================
  // 3. BOOKINGS - Service-based businesses with appointments
  // ============================================================================
  bookings: {
    id: "bookings",
    name: "Services & Bookings",
    displayName: "Services & Bookings",
    description: "Manage services and schedule appointments with clients",
    primaryObject: "service",
    modules: [
      "dashboard",
      "catalog",
      "bookings",
      "customers",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Services",
      bookings: "Appointments",
      marketing: "Offers",
    },
    moduleIcons: {
      catalog: "Scissors",
      bookings: "Calendar",
      marketing: "Tag",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    dashboardWidgets: [
      {
        id: "upcoming_bookings",
        title: "Upcoming Bookings",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "active_services",
        title: "Active Services",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      service: {
        requiredFields: ["price", "duration_min"],
        optionalFields: ["buffer", "description"],
        variantLabel: "Service Types",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "service_menu", "availability"],
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_services", "get_available_slots", "book_appointment"],
    defaultSettings: {},
  },

  // ============================================================================
  // 4. CONTENT - Digital products, events, education, portfolio
  // ============================================================================
  content: {
    id: "content",
    name: "Digital & Content",
    displayName: "Digital & Content",
    description: "Sell digital products, host events, or share creative work",
    primaryObject: "content",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "customers",
      "finance",
      "content",
      "marketing",
      "events",
      "nonprofit",
      "settings",
    ],
    moduleLabels: {
      catalog: "Digital Assets",
      sales: "Orders",
      content: "Content",
    },
    moduleIcons: {
      catalog: "FileText",
      sales: "ShoppingBag",
      content: "Newspaper",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/catalog", create: "/dashboard/catalog/new" },
      sales: { index: "/dashboard/orders" },
      content: { index: "/dashboard/content", create: "/dashboard/content/new" },
    },
    dashboardWidgets: [
      {
        id: "total_downloads",
        title: "Total Downloads",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "active_assets",
        title: "Active Assets",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      content: {
        requiredFields: ["title"],
        optionalFields: ["description", "tags"],
        validation: { minImages: 1 },
      },
      product: {
        requiredFields: ["price"],
        optionalFields: ["file", "access_settings"],
        variantLabel: "Licenses",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "content_setup"],
    features: { content: true, digital: true, payments: true },
    aiTools: ["get_inventory", "get_promotions"],
    defaultSettings: {},
  },
};

// ============================================================================
// LEGACY TO ARCHETYPE MAPPING (Backward Compatibility)
// ============================================================================
// Maps 25+ legacy industry slugs to the 4 core archetypes

export const INDUSTRY_SLUG_MAP: Record<string, keyof typeof INDUSTRY_ARCHETYPES> = {
  // Commerce archetype mappings
  retail: "commerce",
  fashion: "commerce",
  electronics: "commerce",
  beauty: "commerce",
  grocery: "commerce",
  b2b: "commerce",
  wholesale: "commerce",
  one_product: "commerce",

  // Food archetype mappings
  food: "food",
  restaurant: "food",
  catering: "food",

  // Bookings archetype mappings
  services: "bookings",
  salon: "bookings",
  spa: "bookings",
  real_estate: "bookings",
  automotive: "bookings",
  travel_hospitality: "bookings",
  hotel: "bookings",

  // Content archetype mappings
  digital: "content",
  events: "content",
  blog_media: "content",
  creative_portfolio: "content",
  education: "content",
  nonprofit: "content",
  nightlife: "content",

  // Additional industry mappings
  saas: "commerce",
  marketplace: "commerce",
  fitness: "bookings",
  healthcare: "bookings",
  legal: "bookings",
  jobs: "content",
};

// ============================================================================
// PER-INDUSTRY OVERRIDES
// ============================================================================
// Each industry slug can override its archetype's modules, labels, icons,
// and routes. This gives every merchant a sidebar tailored to their business.
// Only properties that differ from the base archetype need to be specified.
// ============================================================================

const INDUSTRY_OVERRIDES: Record<string, Partial<IndustryConfig>> = {
  // ── Commerce variants ─────────────────────────────────────────────────────
  retail: {
    displayName: "Retail Store",
    description: "Sell physical products online with full inventory management",
  },
  fashion: {
    displayName: "Fashion & Apparel",
    description: "Sell fashion items with size variants, lookbooks, and style guides",
    moduleLabels: {
      catalog: "Collections",
      sales: "Orders",
      fulfillment: "Shipments",
    },
  },
  electronics: {
    displayName: "Electronics Store",
    description: "Sell electronics with specs, warranties, and comparisons",
  },
  beauty: {
    displayName: "Beauty & Cosmetics",
    description: "Sell beauty products and manage appointment bookings",
    modules: [...COMMERCE_MODULES, "bookings", "calendar"],
    moduleLabels: {
      catalog: "Products",
      sales: "Orders",
      fulfillment: "Shipments",
      bookings: "Appointments",
    },
    moduleIcons: {
      catalog: "Package",
      sales: "ShoppingCart",
      fulfillment: "Truck",
      bookings: "Calendar",
    },
    features: { inventory: true, delivery: true, payments: true, bookings: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions", "get_available_slots"],
  },
  grocery: {
    displayName: "Grocery Store",
    description: "Sell groceries with perishable tracking and delivery management",
    moduleLabels: {
      catalog: "Products",
      sales: "Orders",
      fulfillment: "Deliveries",
    },
    moduleIcons: {
      fulfillment: "Truck",
    },
  },
  one_product: {
    displayName: "Single Product Store",
    description: "Focus on selling one hero product with maximum impact",
  },
  b2b: {
    displayName: "B2B Commerce",
    description: "Wholesale and B2B sales with credit accounts and volume pricing",
    modules: [...COMMERCE_MODULES, "leads", "quotes"],
    moduleLabels: {
      catalog: "Products",
      sales: "Orders",
      fulfillment: "Shipments",
      b2b: "Wholesale",
      leads: "Leads",
      quotes: "Quotes",
    },
    features: { inventory: true, delivery: true, payments: true, b2b: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions", "get_b2b_pricing"],
  },
  wholesale: {
    displayName: "Wholesale",
    description: "Bulk and wholesale operations with volume pricing and credit",
    modules: [...COMMERCE_MODULES, "leads", "quotes"],
    moduleLabels: {
      catalog: "Products",
      sales: "Orders",
      fulfillment: "Shipments",
      b2b: "Wholesale",
      leads: "Leads",
      quotes: "Quotes",
    },
    features: { inventory: true, delivery: true, payments: true, b2b: true },
  },

  // ── Food variants ─────────────────────────────────────────────────────────
  food: {
    displayName: "Food Delivery",
    description: "Online food ordering with kitchen management and delivery",
  },
  restaurant: {
    displayName: "Restaurant",
    description: "Full restaurant management with menus, orders, and kitchen ops",
    modules: [
      "dashboard", "catalog", "sales", "fulfillment",
      "bookings", "customers", "finance", "marketing", "settings",
    ],
    moduleLabels: {
      catalog: "Menu",
      sales: "Orders",
      fulfillment: "Kitchen",
      bookings: "Reservations",
    },
    moduleIcons: {
      catalog: "UtensilsCrossed",
      sales: "ShoppingBag",
      fulfillment: "ChefHat",
      bookings: "Calendar",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/menu-items", create: "/dashboard/menu-items/new" },
      sales: { index: "/dashboard/orders" },
      fulfillment: { index: "/dashboard/kitchen" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { delivery: true, payments: true, kitchen: true, bookings: true },
    aiTools: ["get_menu", "place_order", "check_order_status", "get_promotions", "get_available_slots"],
  },
  catering: {
    displayName: "Catering Service",
    description: "Catering management with event bookings and menu planning",
    modules: [
      "dashboard", "catalog", "sales", "fulfillment",
      "bookings", "customers", "leads", "finance", "marketing", "settings",
    ],
    moduleLabels: {
      catalog: "Menu Items",
      sales: "Orders",
      fulfillment: "Kitchen",
      bookings: "Event Bookings",
      leads: "Inquiries",
    },
    moduleIcons: {
      catalog: "UtensilsCrossed",
      sales: "ShoppingBag",
      fulfillment: "ChefHat",
      bookings: "Calendar",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/menu-items", create: "/dashboard/menu-items/new" },
      sales: { index: "/dashboard/orders" },
      fulfillment: { index: "/dashboard/kitchen" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { delivery: true, payments: true, kitchen: true, bookings: true },
    aiTools: ["get_menu", "place_order", "check_order_status", "get_promotions", "get_available_slots"],
  },

  // ── Bookings variants ─────────────────────────────────────────────────────
  services: {
    displayName: "Professional Services",
    description: "Manage client services with scheduling, quotes, and portfolio",
    modules: [
      "dashboard", "catalog", "bookings", "customers",
      "leads", "quotes", "finance", "marketing",
      "portfolio", "calendar", "settings",
    ],
    moduleLabels: {
      catalog: "Services",
      bookings: "Appointments",
      leads: "Leads",
      quotes: "Proposals",
      portfolio: "Portfolio",
    },
    moduleIcons: {
      catalog: "Briefcase",
      bookings: "Calendar",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_services", "get_available_slots", "book_appointment", "create_quote"],
  },
  salon: {
    displayName: "Salon",
    description: "Hair and beauty salon with appointment booking and portfolio",
    modules: [
      "dashboard", "catalog", "bookings", "customers",
      "finance", "marketing", "portfolio", "calendar", "settings",
    ],
    moduleLabels: {
      catalog: "Services",
      bookings: "Appointments",
      portfolio: "Gallery",
    },
    moduleIcons: {
      catalog: "Scissors",
      bookings: "Calendar",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_services", "get_available_slots", "book_appointment"],
  },
  spa: {
    displayName: "Spa & Wellness",
    description: "Spa and wellness center with treatments and appointment booking",
    modules: [
      "dashboard", "catalog", "bookings", "customers",
      "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      catalog: "Treatments",
      bookings: "Appointments",
    },
    moduleIcons: {
      catalog: "Sparkle",
      bookings: "Calendar",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_services", "get_available_slots", "book_appointment"],
  },
  real_estate: {
    displayName: "Real Estate",
    description: "Property listings with viewings, leads, and client management",
    primaryObject: "property",
    modules: [
      "dashboard", "properties", "bookings", "customers",
      "leads", "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      properties: "Listings",
      bookings: "Viewings",
      customers: "Clients",
      leads: "Inquiries",
    },
    moduleIcons: {
      properties: "House",
      bookings: "Calendar",
      leads: "User",
    },
    moduleRoutes: {
      properties: { index: "/dashboard/properties", create: "/dashboard/properties/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    forms: {
      property: {
        requiredFields: ["price", "location", "bedrooms"],
        optionalFields: ["description", "amenities", "sqft"],
        variantLabel: "Units",
        validation: { minImages: 3 },
      },
    },
    features: { bookings: true, calendar: true, payments: true, properties: true },
    aiTools: ["get_properties", "get_available_slots", "book_viewing", "get_property_valuation"],
  },
  automotive: {
    displayName: "Automotive",
    description: "Vehicle inventory with test drives, leads, and sales management",
    primaryObject: "vehicle",
    modules: [
      "dashboard", "vehicles", "sales", "bookings", "customers",
      "leads", "finance", "marketing", "settings",
    ],
    moduleLabels: {
      vehicles: "Inventory",
      sales: "Sales",
      bookings: "Test Drives",
      customers: "Buyers",
      leads: "Inquiries",
    },
    moduleIcons: {
      vehicles: "Car",
      sales: "ShoppingBag",
      bookings: "Calendar",
    },
    moduleRoutes: {
      vehicles: { index: "/dashboard/vehicles", create: "/dashboard/vehicles/new" },
      sales: { index: "/dashboard/orders" },
      bookings: { index: "/dashboard/bookings" },
    },
    forms: {
      vehicle: {
        requiredFields: ["price", "make", "model", "year"],
        optionalFields: ["mileage", "condition", "vin"],
        variantLabel: "Trims",
        validation: { minImages: 5 },
      },
    },
    features: { bookings: true, payments: true, vehicles: true },
    aiTools: ["get_vehicles", "get_available_slots", "book_test_drive", "get_financing_options"],
  },
  travel_hospitality: {
    displayName: "Travel & Hospitality",
    description: "Manage accommodations, reservations, and guest experiences",
    modules: [
      "dashboard", "catalog", "bookings", "customers",
      "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      catalog: "Accommodations",
      bookings: "Reservations",
      customers: "Guests",
    },
    moduleIcons: {
      catalog: "House",
      bookings: "Calendar",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/stays", create: "/dashboard/stays/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_accommodations", "get_available_slots", "book_stay", "get_promotions"],
  },
  hotel: {
    displayName: "Hotel",
    description: "Hotel management with rooms, reservations, and guest services",
    modules: [
      "dashboard", "catalog", "bookings", "customers",
      "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      catalog: "Rooms & Suites",
      bookings: "Reservations",
      customers: "Guests",
    },
    moduleIcons: {
      catalog: "House",
      bookings: "Calendar",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/stays", create: "/dashboard/stays/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_rooms", "get_available_slots", "book_room", "get_promotions"],
  },

  // ── Content variants ──────────────────────────────────────────────────────
  digital: {
    displayName: "Digital Products",
    description: "Sell digital downloads, licenses, and subscriptions",
    modules: [
      "dashboard", "catalog", "sales", "customers",
      "finance", "marketing", "content", "settings",
    ],
    moduleLabels: {
      catalog: "Digital Assets",
      sales: "Orders",
      content: "Blog",
    },
    moduleIcons: {
      catalog: "FileText",
      sales: "ShoppingBag",
      content: "Newspaper",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/digital-assets", create: "/dashboard/digital-assets/new" },
      sales: { index: "/dashboard/orders" },
    },
    features: { content: true, digital: true, payments: true },
    aiTools: ["get_inventory", "get_promotions"],
  },
  events: {
    displayName: "Events & Ticketing",
    description: "Create and sell tickets for events with attendee management",
    primaryObject: "event",
    modules: [
      "dashboard", "events", "sales", "customers",
      "finance", "marketing", "content", "calendar", "settings",
    ],
    moduleLabels: {
      events: "Events",
      sales: "Ticket Sales",
      content: "Blog",
    },
    moduleIcons: {
      events: "Ticket",
      sales: "ShoppingBag",
    },
    moduleRoutes: {
      events: { index: "/dashboard/events", create: "/dashboard/events/new" },
      sales: { index: "/dashboard/orders" },
    },
    features: { events: true, payments: true, calendar: true },
    aiTools: ["get_events", "get_tickets", "check_availability"],
  },
  blog_media: {
    displayName: "Blog & Media",
    description: "Content publishing with monetization and audience growth",
    modules: [
      "dashboard", "content", "customers", "finance",
      "marketing", "settings",
    ],
    moduleLabels: {
      content: "Articles",
      customers: "Subscribers",
    },
    moduleIcons: {
      content: "Newspaper",
      customers: "Users",
    },
    features: { content: true, payments: true },
    aiTools: ["get_content", "get_promotions"],
  },
  creative_portfolio: {
    displayName: "Creative Portfolio",
    description: "Showcase creative work with project portfolio and service bookings",
    modules: [
      "dashboard", "portfolio", "catalog", "customers",
      "finance", "marketing", "content", "calendar", "settings",
    ],
    moduleLabels: {
      portfolio: "Portfolio",
      catalog: "Services",
      content: "Blog",
    },
    moduleIcons: {
      portfolio: "Folder",
      catalog: "Briefcase",
    },
    moduleRoutes: {
      portfolio: { index: "/dashboard/portfolio", create: "/dashboard/portfolio/new" },
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
    },
    features: { content: true, bookings: true, payments: true },
    aiTools: ["get_portfolio", "get_services", "get_promotions"],
  },
  education: {
    displayName: "Education Platform",
    description: "Online courses with enrollment, grading, and student management",
    primaryObject: "course",
    modules: [
      "dashboard", "education", "enrollments", "customers",
      "finance", "marketing", "content", "calendar", "settings",
    ],
    moduleLabels: {
      education: "Courses",
      enrollments: "Enrollments",
      customers: "Students",
      content: "Resources",
    },
    moduleIcons: {
      education: "BookOpen",
      enrollments: "Users",
      customers: "GraduationCap",
    },
    moduleRoutes: {
      education: { index: "/dashboard/courses", create: "/dashboard/courses/new" },
      enrollments: { index: "/dashboard/enrollments" },
    },
    forms: {
      course: {
        requiredFields: ["title", "price"],
        optionalFields: ["description", "duration", "level", "prerequisites"],
        variantLabel: "Tiers",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "first_course", "payment_setup"],
    features: { education: true, content: true, payments: true, calendar: true },
    aiTools: ["get_courses", "get_enrollments", "get_student_progress", "get_promotions"],
  },
  nonprofit: {
    displayName: "Nonprofit Organization",
    description: "Fundraising campaigns with donation tracking and volunteer management",
    modules: [
      "dashboard", "nonprofit", "events", "customers",
      "finance", "marketing", "content", "settings",
    ],
    moduleLabels: {
      nonprofit: "Fundraising",
      events: "Events",
      customers: "Supporters",
      content: "Updates",
    },
    moduleIcons: {
      nonprofit: "Heart",
      events: "Ticket",
      customers: "Users",
    },
    moduleRoutes: {
      nonprofit: { index: "/dashboard/nonprofit" },
      events: { index: "/dashboard/events", create: "/dashboard/events/new" },
    },
    onboardingSteps: ["org_profile", "first_campaign", "payment_setup"],
    features: { nonprofit: true, events: true, payments: true },
    aiTools: ["get_campaigns", "get_donations", "get_volunteers", "get_promotions"],
  },
  nightlife: {
    displayName: "Nightlife & Venues",
    description: "Venue management with events, reservations, and ticketing",
    modules: [
      "dashboard", "events", "bookings", "customers",
      "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      events: "Events & Shows",
      bookings: "Reservations",
      customers: "Guests",
    },
    moduleIcons: {
      events: "Ticket",
      bookings: "Calendar",
    },
    moduleRoutes: {
      events: { index: "/dashboard/nightlife/events", create: "/dashboard/nightlife/events/new" },
      bookings: { index: "/dashboard/nightlife/reservations" },
    },
    features: { events: true, bookings: true, payments: true, calendar: true },
    aiTools: ["get_events", "get_reservations", "get_tickets", "get_promotions"],
  },

  // ── Additional industry variants ──────────────────────────────────────────
  saas: {
    displayName: "SaaS Platform",
    description: "Software subscriptions with plans, billing, and customer management",
    modules: [
      "dashboard", "catalog", "sales", "customers",
      "finance", "marketing", "content", "settings",
    ],
    moduleLabels: {
      catalog: "Plans",
      sales: "Subscriptions",
      customers: "Users",
      content: "Docs & Blog",
    },
    moduleIcons: {
      catalog: "Stack",
      sales: "Receipt",
      customers: "Users",
    },
    moduleRoutes: {
      catalog: { index: "/dashboard/catalog", create: "/dashboard/catalog/new" },
      sales: { index: "/dashboard/orders" },
    },
    features: { subscriptions: true, payments: true, content: true },
    aiTools: ["get_plans", "get_subscriptions", "get_promotions"],
  },
  marketplace: {
    displayName: "Marketplace",
    description: "Multi-vendor marketplace with vendor management and payouts",
    modules: [
      "dashboard", "catalog", "sales", "fulfillment", "customers",
      "finance", "marketing", "content", "b2b", "settings",
    ],
    moduleLabels: {
      catalog: "Products",
      sales: "Orders",
      fulfillment: "Shipments",
      b2b: "Vendors",
    },
    moduleIcons: {
      catalog: "Package",
      sales: "ShoppingCart",
      fulfillment: "Truck",
      b2b: "Storefront",
    },
    moduleRoutes: {
      b2b: { index: "/dashboard/vendors" },
    },
    features: { inventory: true, delivery: true, payments: true, marketplace: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions", "get_vendors"],
  },
  fitness: {
    displayName: "Fitness & Gym",
    description: "Gym and fitness studio with memberships, classes, and scheduling",
    modules: [
      "dashboard", "fitness", "bookings", "customers",
      "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      fitness: "Memberships",
      bookings: "Classes",
      customers: "Members",
    },
    moduleIcons: {
      fitness: "Dumbbell",
      bookings: "Calendar",
      customers: "Users",
    },
    moduleRoutes: {
      fitness: { index: "/dashboard/memberships" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true, memberships: true },
    aiTools: ["get_memberships", "get_classes", "get_available_slots", "book_class"],
  },
  healthcare: {
    displayName: "Healthcare & Medical",
    description: "Medical practice with patient management, appointments, and billing",
    modules: [
      "dashboard", "healthcare", "bookings", "customers",
      "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      healthcare: "Services",
      bookings: "Appointments",
      customers: "Patients",
    },
    moduleIcons: {
      healthcare: "Stethoscope",
      bookings: "Calendar",
      customers: "Users",
    },
    moduleRoutes: {
      healthcare: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_services", "get_available_slots", "book_appointment"],
  },
  legal: {
    displayName: "Legal Services",
    description: "Law practice with case management, client tracking, and billing",
    modules: [
      "dashboard", "legal", "bookings", "customers",
      "leads", "quotes", "finance", "marketing", "calendar", "settings",
    ],
    moduleLabels: {
      legal: "Cases",
      bookings: "Consultations",
      customers: "Clients",
      leads: "Inquiries",
      quotes: "Proposals",
    },
    moduleIcons: {
      legal: "Briefcase",
      bookings: "Calendar",
    },
    moduleRoutes: {
      legal: { index: "/dashboard/cases" },
      bookings: { index: "/dashboard/bookings" },
    },
    features: { bookings: true, calendar: true, payments: true },
    aiTools: ["get_cases", "get_available_slots", "book_consultation"],
  },
  jobs: {
    displayName: "Job Board",
    description: "Job listings with applicant tracking and employer management",
    modules: [
      "dashboard", "jobs", "customers", "finance",
      "marketing", "content", "settings",
    ],
    moduleLabels: {
      jobs: "Listings",
      customers: "Applicants",
      content: "Blog",
    },
    moduleIcons: {
      jobs: "Briefcase",
      customers: "Users",
    },
    moduleRoutes: {
      jobs: { index: "/dashboard/listings", create: "/dashboard/listings/new" },
    },
    features: { content: true, payments: true },
    aiTools: ["get_listings", "get_applicants", "get_promotions"],
  },
};

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Get the archetype key for a legacy industry slug
 * Falls back to "commerce" if no mapping exists
 */
export function getIndustryArchetype(slug: string): keyof typeof INDUSTRY_ARCHETYPES {
  return INDUSTRY_SLUG_MAP[slug] || "commerce";
}

/**
 * Get the full industry config for a legacy industry slug.
 * Merges per-industry overrides on top of the base archetype so each
 * industry gets a tailored sidebar, labels, icons, routes, and features.
 */
export function getIndustryConfig(slug: string): IndustryConfig {
  const archetype = getIndustryArchetype(slug);
  const base = INDUSTRY_ARCHETYPES[archetype];
  const override = INDUSTRY_OVERRIDES[slug];

  if (!override) return base;

  return {
    ...base,
    ...override,
    moduleLabels: { ...base.moduleLabels, ...override.moduleLabels },
    moduleIcons: { ...base.moduleIcons, ...override.moduleIcons },
    moduleRoutes: { ...base.moduleRoutes, ...override.moduleRoutes },
    defaultSettings: { ...base.defaultSettings, ...override.defaultSettings },
  };
}

/**
 * Check if a legacy industry slug is valid
 */
export function isValidIndustrySlug(slug: string): boolean {
  return slug in INDUSTRY_SLUG_MAP;
}

/**
 * Get all valid industry slugs (for dropdowns, etc.)
 */
export function getAllIndustrySlugs(): string[] {
  return Object.keys(INDUSTRY_SLUG_MAP);
}

/**
 * Get display names for all industries (uses per-industry overrides)
 */
export function getIndustryDisplayNames(): Record<string, string> {
  return Object.entries(INDUSTRY_SLUG_MAP).reduce(
    (acc, [slug]) => {
      const config = getIndustryConfig(slug);
      acc[slug] = config.displayName || config.name;
      return acc;
    },
    {} as Record<string, string>,
  );
}
