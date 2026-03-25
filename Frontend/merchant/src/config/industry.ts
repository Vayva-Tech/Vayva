import { IndustryConfig, IndustrySlug } from "@/lib/templates/types";

// --- WIDGETS ---
const COMMON_WIDGETS = [
  {
    id: "setup_checklist",
    title: "Setup Progress",
    dataSource: "real",
    type: "list",
    w: 4,
  },
];
const COMMERCE_WIDGETS = [
  {
    id: "sales_today",
    title: "Sales Today",
    dataSource: "real",
    type: "stat",
    w: 1,
  },
  {
    id: "orders_pending",
    title: "Pending Orders",
    dataSource: "real",
    type: "stat",
    w: 1,
  },
  {
    id: "setup_checklist",
    title: "Next Steps",
    dataSource: "real",
    type: "list",
    w: 4,
  },
];
// --- MODULE SETS ---
const COMMERCE_MODULES = [
  "dashboard",
  "catalog",
  "sales",
  "fulfillment",
  "finance",
  "marketing",
  "settings",
];
const SERVICE_MODULES = [
  "dashboard",
  "bookings",
  "finance",
  "marketing",
  "content",
  "settings",
];
// --- FORM PRESETS ---
const BASE_PRODUCT_FORM = {
  requiredFields: ["price", "sku", "stock", "images"],
  optionalFields: ["barcode", "weight", "description"],
  variantLabel: "Options",
  validation: { minImages: 1, minDescriptionLength: 20 },
};
export const INDUSTRY_CONFIG: Record<IndustrySlug, IndustryConfig> = {
  // --- ANALYTICS & BI ---
  analytics: {
    displayName: "Analytics & BI",
    description: "Metrics, reporting, and experimentation.",
    primaryObject: "digital_asset",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "marketing",
      "settings",
    ],
    moduleLabels: { catalog: "Data Sources", sales: "Reports" },
    moduleIcons: { catalog: "BarChart3", sales: "FileText" },
    moduleRoutes: {
      catalog: { index: "/dashboard/analytics" },
      sales: { index: "/dashboard/reports" },
    },
    dashboardWidgets: [
      {
        id: "active_reports",
        title: "Active Reports",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      digital_asset: {
        requiredFields: ["name", "description"],
        optionalFields: [],
        variantLabel: "Sources",
        validation: { minImages: 0 },
      },
    },
    onboardingSteps: ["store_profile", "connect_sources"],
    features: { content: true },
    aiTools: ["get_promotions"],
  },
  // --- RETAIL & COMMERCE ---
  retail: {
    displayName: "General Retail",
    description:
      "Sell physical products online with inventory, orders, and shipping.",
    primaryObject: "product",
    modules: COMMERCE_MODULES,
    dashboardWidgets: COMMERCE_WIDGETS,
    forms: { product: { ...BASE_PRODUCT_FORM } },
    onboardingSteps: ["store_profile", "payments", "shipping", "first_product"],
    features: { inventory: true, delivery: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions"],
  },
  fashion: {
    displayName: "Fashion & Apparel",
    description:
      "Clothing, accessories, and fashion items with size guides and variants.",
    primaryObject: "product",
    modules: COMMERCE_MODULES,
    dashboardWidgets: COMMERCE_WIDGETS,
    forms: {
      product: {
        requiredFields: ["price", "sku", "stock", "images", "size_guide"],
        optionalFields: ["material", "care_instructions"],
        variantLabel: "Sizes & Colors",
        validation: { minImages: 3, minDescriptionLength: 50 },
      },
    },
    onboardingSteps: ["store_profile", "size_charts", "first_product"],
    features: { inventory: true, delivery: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions"],
  },
  electronics: {
    displayName: "Electronics",
    description:
      "Gadgets, devices, and tech products with specs and warranty info.",
    primaryObject: "product",
    modules: COMMERCE_MODULES,
    dashboardWidgets: COMMERCE_WIDGETS,
    forms: {
      product: {
        requiredFields: ["price", "sku", "stock", "specs_map", "warranty"],
        optionalFields: ["brand", "model_number"],
        variantLabel: "Models",
        validation: { minImages: 2, requiredGroups: ["specs"] },
      },
    },
    onboardingSteps: ["store_profile", "first_product"],
    features: { inventory: true, delivery: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions"],
  },
  beauty: {
    displayName: "Beauty & Cosmetics",
    description:
      "Skincare, makeup, and beauty products with ingredients and shades.",
    primaryObject: "product",
    modules: COMMERCE_MODULES,
    dashboardWidgets: COMMERCE_WIDGETS,
    forms: {
      product: {
        requiredFields: ["price", "stock", "ingredients", "usage"],
        optionalFields: ["batch_code", "expiry"],
        variantLabel: "Shades",
        validation: { minImages: 2 },
      },
    },
    onboardingSteps: ["store_profile", "first_product"],
    features: { inventory: true, delivery: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions"],
  },
  grocery: {
    displayName: "Grocery",
    description: "Food items, groceries, and perishables with expiry tracking.",
    primaryObject: "product",
    modules: COMMERCE_MODULES,
    dashboardWidgets: COMMERCE_WIDGETS,
    forms: {
      product: {
        requiredFields: ["price", "stock", "unit_weight", "expiry_date"],
        optionalFields: ["origin", "nutritional_info"],
        variantLabel: "Pack Sizes",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "delivery_zones", "inventory"],
    features: { inventory: true, delivery: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions"],
  },
  // --- FOOD & RESTAURANT ---
  food: {
    displayName: "Restaurants & Food",
    primaryObject: "menu_item",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "fulfillment",
      "meal_kit",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Menu Items",
      sales: "Orders",
      fulfillment: "Kitchen View",
      meal_kit: "Meal kit",
    },
    moduleIcons: { catalog: "UtensilsCrossed", fulfillment: "ChefHat" },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/menu-items",
        create: "/dashboard/menu-items/new",
      },
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
        requiredFields: ["price", "prep_time", "veg_non_veg"],
        optionalFields: ["calories", "allergens", "spice_level", "ingredients"],
        variantLabel: "Modifiers",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "menu_setup", "delivery_settings"],
    features: { delivery: true },
    aiTools: [
      "get_menu",
      "place_order",
      "check_order_status",
      "get_promotions",
    ],
  },
  "meal-kit": {
    displayName: "Meal Kits & Subscriptions",
    description:
      "Subscription meal boxes, weekly menus, and recurring fulfillment.",
    primaryObject: "menu_item",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "fulfillment",
      "meal_kit",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Menu Items",
      sales: "Orders",
      fulfillment: "Kitchen View",
      meal_kit: "Meal kit",
    },
    moduleIcons: { catalog: "UtensilsCrossed", fulfillment: "ChefHat" },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/menu-items",
        create: "/dashboard/menu-items/new",
      },
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
        requiredFields: ["price", "prep_time", "veg_non_veg"],
        optionalFields: ["calories", "allergens", "spice_level", "ingredients"],
        variantLabel: "Modifiers",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "menu_setup", "delivery_settings"],
    features: { delivery: true },
    aiTools: [
      "get_menu",
      "place_order",
      "check_order_status",
      "get_promotions",
    ],
  },
  // --- SERVICES & BOOKINGS ---
  services: {
    displayName: "Professional Services",
    description:
      "Salons, spas, consultants, and service-based businesses with appointments.",
    primaryObject: "service",
    modules: [
      "dashboard",
      "catalog",
      "bookings",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Services",
      bookings: "Bookings",
      marketing: "Offers",
    },
    moduleIcons: { catalog: "Scissors", bookings: "Calendar" },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/services",
        create: "/dashboard/services/new",
      },
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
        requiredFields: ["price", "duration_min", "provider_id"],
        optionalFields: ["buffer", "remote_link"],
        variantLabel: "Service Types",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["store_profile", "service_menu", "availability"],
    features: { bookings: true },
    aiTools: ["get_services", "get_available_slots", "book_appointment"],
  },
  // --- DIGITAL & COURSES ---
  digital: {
    displayName: "Digital Products",
    primaryObject: "digital_asset",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: { catalog: "Digital Assets", sales: "Orders" },
    moduleIcons: { catalog: "FileText", sales: "ShoppingBag" },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/digital-assets",
        create: "/dashboard/digital-assets/new",
      },
      sales: { index: "/dashboard/orders" },
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
      digital_asset: {
        requiredFields: ["price", "file_upload", "access_settings"],
        optionalFields: ["preview_file"],
        variantLabel: "Licenses",
        validation: { minImages: 1, requiredGroups: ["files"] },
      },
    },
    onboardingSteps: ["store_profile", "file_setup"],
    features: { content: true },
    aiTools: ["get_inventory", "get_promotions"],
  },
  // --- EVENTS & TICKETING ---
  events: {
    displayName: "Events & Ticketing",
    description:
      "Concerts, conferences, and events with ticket sales and check-in.",
    primaryObject: "event",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "marketing",
      "finance",
      "settings",
    ],
    moduleLabels: { catalog: "Events", sales: "Guest List" },
    moduleIcons: { catalog: "PartyPopper", sales: "Ticket" },
    moduleRoutes: {
      catalog: { index: "/dashboard/events", create: "/dashboard/events/new" },
      sales: { index: "/dashboard/check-in" },
    },
    dashboardWidgets: [
      {
        id: "tickets_sold",
        title: "Tickets Sold",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "active_events",
        title: "Active Events",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      event: {
        requiredFields: ["price", "event_date", "venue", "ticket_quota"],
        optionalFields: ["seat_map"],
        variantLabel: "Ticket Classes",
        validation: { minImages: 1, requiredGroups: ["location", "schedule"] },
      },
    },
    onboardingSteps: ["organizer_profile", "event_setup"],
    features: { tickets: true },
    aiTools: ["get_upcoming_events", "get_promotions"],
  },
  // --- B2B & WHOLESALE ---
  b2b: {
    displayName: "B2B Wholesale",
    primaryObject: "product",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: { catalog: "Catalog", sales: "Quotes & Orders" },
    moduleIcons: { catalog: "Warehouse", sales: "FileText" },
    moduleRoutes: {
      catalog: { index: "/dashboard/wholesale-catalog" },
      sales: { index: "/dashboard/quotes" },
    },
    dashboardWidgets: [
      {
        id: "pending_quotes",
        title: "Pending Quotes",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_orders",
        title: "Total Orders",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      product: {
        requiredFields: ["price", "sku", "moq", "tier_pricing"],
        optionalFields: ["lead_time", "packaging"],
        variantLabel: "Volume Tiers",
        validation: { minImages: 1, requiredGroups: ["specs"] },
      },
    },
    onboardingSteps: ["company_verification", "first_product"],
    features: { quotes: true, inventory: true },
    aiTools: ["get_wholesale_pricing", "request_quote", "get_inventory"],
  },
  // --- REAL ESTATE & AUTO ---
  real_estate: {
    displayName: "Real Estate",
    description:
      "Property listings, rentals, and sales with viewing appointments.",
    primaryObject: "listing",
    modules: ["dashboard", "catalog", "bookings", "marketing", "settings"],
    moduleLabels: { catalog: "Properties", bookings: "Viewings" },
    moduleIcons: { catalog: "Home", bookings: "Calendar" },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/properties",
        create: "/dashboard/properties/new",
      },
      bookings: { index: "/dashboard/viewings" },
    },
    dashboardWidgets: [
      {
        id: "active_listings",
        title: "Active Listings",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_viewings",
        title: "Total Viewings",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      listing: {
        requiredFields: ["price", "location", "sqft", "rooms"],
        optionalFields: ["virtual_tour"],
        variantLabel: "Units",
        validation: { minImages: 5, requiredGroups: ["location", "specs"] },
      },
    },
    onboardingSteps: ["agency_profile", "listings_upload"],
    features: { viewings: true },
    aiTools: ["search_properties", "schedule_viewing"],
  },
  automotive: {
    displayName: "Automotive",
    primaryObject: "vehicle",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: { catalog: "Vehicles", sales: "Leads" },
    moduleIcons: { catalog: "Car", sales: "Users" },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/vehicles",
        create: "/dashboard/vehicles/new",
      },
      sales: { index: "/dashboard/leads" },
    },
    dashboardWidgets: [
      {
        id: "active_listings",
        title: "Active Listings",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_leads",
        title: "Total Leads",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      vehicle: {
        requiredFields: ["price", "make", "model", "year", "vin"],
        optionalFields: ["mileage", "history_report"],
        variantLabel: "Trims",
        validation: { minImages: 5, requiredGroups: ["specs"] },
      },
      // Basic Lead Form if we treat leads as resources
      lead: {
        requiredFields: ["title", "client"], // Title = "Inquiry for X", Client = Name
        optionalFields: ["tags", "description"], // Description = Message
        validation: { minImages: 0 },
      },
    },
    onboardingSteps: ["dealer_profile", "inventory_upload"],
    features: { testDrives: true },
    aiTools: ["search_vehicles", "schedule_test_drive"],
  },
  travel_hospitality: {
    displayName: "Travel & Hospitality",
    description: "Hotels, vacation rentals, and accommodation bookings.",
    primaryObject: "stay",
    modules: ["dashboard", "catalog", "bookings", "finance", "settings"],
    moduleLabels: { catalog: "Stays", bookings: "Reservations" },
    moduleIcons: { catalog: "Bed", bookings: "CalendarCheck" },
    moduleRoutes: {
      catalog: { index: "/dashboard/stays", create: "/dashboard/stays/new" },
      bookings: { index: "/dashboard/bookings" },
    },
    dashboardWidgets: [
      {
        id: "active_stays",
        title: "Active Stays",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "upcoming_reservations",
        title: "Upcoming Reservations",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      stay: {
        requiredFields: ["price", "location", "dates", "amenities"],
        optionalFields: ["house_rules"],
        variantLabel: "Rooms",
        validation: { minImages: 5, requiredGroups: ["location"] },
      },
    },
    onboardingSteps: ["property_profile", "room_setup"],
    features: { bookings: true, reservations: true },
    aiTools: ["check_availability", "book_stay"],
  },
  // --- CONTENT & MEDIA ---
  blog_media: {
    displayName: "Blog",
    primaryObject: "post",
    modules: ["dashboard", "content", "settings"],
    moduleLabels: { content: "Posts" },
    moduleIcons: { content: "Newspaper" },
    moduleRoutes: {
      content: { index: "/dashboard/blog", create: "/dashboard/blog/new" },
    },
    dashboardWidgets: [
      {
        id: "total_posts",
        title: "Total Posts",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_reads",
        title: "Total Reads",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "avg_read_time",
        title: "Avg. Read Time",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      post: {
        requiredFields: ["title", "content"],
        optionalFields: ["tags", "author"],
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["profile", "content_strategy"],
    features: { content: true },
    aiTools: ["get_promotions"],
  },
  creative_portfolio: {
    displayName: "Portfolio",
    description:
      "Showcase creative work, photography, design, and art projects.",
    primaryObject: "project",
    modules: ["dashboard", "content", "settings"],
    moduleLabels: { content: "Projects" },
    moduleIcons: { content: "Palette" },
    moduleRoutes: {
      content: {
        index: "/dashboard/projects",
        create: "/dashboard/projects/new",
      },
    },
    dashboardWidgets: [
      {
        id: "total_projects",
        title: "Total Projects",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_views",
        title: "Total Views",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      project: {
        requiredFields: ["title", "media"],
        optionalFields: ["client", "year", "description", "tags"],
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["profile", "upload_work"],
    features: { content: true },
    aiTools: ["get_promotions"],
  },
  nonprofit: {
    displayName: "Nonprofit",
    primaryObject: "campaign",
    modules: ["dashboard", "marketing", "finance", "content", "settings"],
    moduleLabels: { marketing: "Campaigns" },
    moduleIcons: { marketing: "Heart" },
    moduleRoutes: {
      marketing: {
        index: "/dashboard/campaigns",
        create: "/dashboard/campaigns/new",
      },
    },
    dashboardWidgets: [
      {
        id: "total_donations",
        title: "Total Donations",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "active_campaigns",
        title: "Active Campaigns",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      campaign: {
        requiredFields: ["cause", "goal"],
        optionalFields: ["tags"],
        variantLabel: "Tiers",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["org_profile", "campaign_setup"],
    features: { donations: true },
    aiTools: ["get_campaigns", "make_donation"],
  },
  education: {
    displayName: "Education & Courses",
    description: "Online courses, training programs, and educational content.",
    primaryObject: "course",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "finance",
      "content",
      "settings",
    ],
    moduleLabels: { catalog: "Courses", sales: "Enrollments" },
    moduleIcons: { catalog: "GraduationCap", sales: "Users" },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/courses",
        create: "/dashboard/courses/new",
      },
      sales: { index: "/dashboard/enrollments" },
      content: {
        index: "/dashboard/students",
        create: "/dashboard/students/new",
      },
    },
    dashboardWidgets: [
      {
        id: "active_students",
        title: "Active Students",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "active_courses",
        title: "Active Courses",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      course: {
        requiredFields: ["price", "curriculum", "description"],
        optionalFields: ["tags", "instructor"],
        variantLabel: "Modules",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["instructor_profile", "course_setup"],
    features: { enrollments: true, content: true },
    aiTools: ["get_courses", "enroll_course"],
  },
  // --- SAAS & SUBSCRIPTIONS ---
  saas: {
    displayName: "SaaS Platform",
    description: "Multi-tenant SaaS with subscription management, feature flags, and API keys.",
    primaryObject: "tenant",
    modules: [
      "dashboard",
      "tenants",
      "subscriptions",
      "plans",
      "feature_flags",
      "api_keys",
      "finance",
      "settings",
    ],
    moduleLabels: {
      tenants: "Tenants",
      subscriptions: "Subscriptions",
      plans: "Plans",
      feature_flags: "Feature Flags",
      api_keys: "API Keys",
    },
    moduleIcons: {
      tenants: "Building",
      subscriptions: "CreditCard",
      plans: "Layers",
      feature_flags: "ToggleRight",
      api_keys: "Key",
    },
    moduleRoutes: {
      tenants: {
        index: "/dashboard/tenants",
        create: "/dashboard/tenants/new",
      },
      subscriptions: {
        index: "/dashboard/subscriptions",
        create: "/dashboard/subscriptions/new",
      },
      plans: {
        index: "/dashboard/plans",
        create: "/dashboard/plans/new",
      },
      feature_flags: {
        index: "/dashboard/feature-flags",
        create: "/dashboard/feature-flags/new",
      },
      api_keys: {
        index: "/dashboard/api-keys",
        create: "/dashboard/api-keys/new",
      },
    },
    dashboardWidgets: [
      {
        id: "active_tenants",
        title: "Active Tenants",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "mrr",
        title: "Monthly Recurring Revenue",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "api_calls_today",
        title: "API Calls Today",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "trial_conversion_rate",
        title: "Trial Conversion Rate",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      tenant: {
        requiredFields: ["name", "tenantCode", "billingEmail"],
        optionalFields: ["customDomain", "settings"],
        validation: { minImages: 0 },
      },
      subscription: {
        requiredFields: ["tenantId", "planId", "billingCycle"],
        optionalFields: ["isTrial", "trialDays"],
        validation: { minImages: 0 },
      },
      plan: {
        requiredFields: ["name", "planCode", "priceMonthly", "priceYearly"],
        optionalFields: [
          "trialDays",
          "maxUsers",
          "maxStorageGB",
          "maxProjects",
          "maxApiCalls",
          "features",
        ],
        validation: { minImages: 0 },
      },
      featureFlag: {
        requiredFields: ["name", "key", "type"],
        optionalFields: ["description", "startAt", "endAt"],
        validation: { minImages: 0 },
      },
    },
    onboardingSteps: ["plan_setup", "tenant_onboarding", "api_key_setup"],
    features: {
      subscriptions: true,
      api_keys: true,
      feature_flags: true,
    },
    aiTools: [
      "get_tenants",
      "get_subscriptions",
      "get_plans",
      "create_subscription",
      "check_feature_flag",
    ],
  },
  marketplace: {
    displayName: "Marketplace",
    primaryObject: "vendor",
    modules: ["dashboard", "ops_console", "finance", "settings"],
    moduleLabels: { ops_console: "Ops Console", finance: "Finance" },
    moduleIcons: { ops_console: "Terminal", finance: "Wallet" },
    moduleRoutes: {
      ops_console: {
        index: "/dashboard/ops-console",
        create: "/dashboard/ops-console/vendors",
      },
      finance: { index: "/dashboard/finance/payouts" },
    },
    // Ops Console Scope: Defines what the Ops Console module covers for marketplace operators
    // Pages: vendors (management), disputes (resolution), payouts (oversight), flags (moderation)
    // Permissions: OPS_CONSOLE_VIEW, VENDOR_MANAGE, DISPUTE_RESOLVE
    dashboardWidgets: [
      {
        id: "total_vendors",
        title: "Total Vendors",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "commission_earned",
        title: "Commission Earned",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      vendor: {
        requiredFields: ["name", "email", "category"],
        optionalFields: ["tags"],
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["marketplace_setup", "vendor_onboarding"],
    features: { inventory: true },
    aiTools: ["get_inventory", "get_promotions"],
  },
  one_product: {
    displayName: "One Product Store",
    description:
      "Focused store selling a single hero product with high conversion.",
    primaryObject: "product",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "marketing",
      "finance",
      "settings",
    ],
    moduleLabels: { catalog: "The Product" },
    moduleRoutes: {
      catalog: { index: "/dashboard/products" },
    },
    dashboardWidgets: [
      {
        id: "conversion_rate",
        title: "Conversion Rate",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_revenue",
        title: "Total Revenue",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      product: {
        ...BASE_PRODUCT_FORM,
        requiredFields: ["price", "description", "images", "usp"],
      },
    },
    onboardingSteps: ["product_setup", "funnel_design"],
    features: { inventory: true, delivery: true },
    aiTools: ["get_inventory", "get_delivery_quote", "get_promotions"],
  },
  // --- NIGHTLIFE & ENTERTAINMENT ---
  nightlife: {
    displayName: "Nightlife & Entertainment",
    primaryObject: "event",
    modules: [
      "dashboard",
      "catalog",
      "bookings",
      "sales",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Events",
      bookings: "Reservations",
      sales: "Tickets & Orders",
    },
    moduleIcons: {
      catalog: "PartyPopper",
      bookings: "CalendarCheck",
      sales: "Ticket",
    },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/nightlife/events",
        create: "/dashboard/nightlife/events/new",
      },
      bookings: { index: "/dashboard/nightlife/reservations" },
      sales: { index: "/dashboard/nightlife/tickets" },
    },
    dashboardWidgets: [
      {
        id: "tickets_sold_today",
        title: "Tickets Sold Today",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "reservations_tonight",
        title: "Reservations Tonight",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "revenue_this_week",
        title: "Revenue This Week",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "upcoming_events",
        title: "Upcoming Events",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      event: {
        requiredFields: [
          "title",
          "event_date",
          "event_time",
          "venue",
          "description",
          "images",
        ],
        optionalFields: ["dress_code", "age_limit", "music_genre"],
        variantLabel: "Ticket Types",
        validation: { minImages: 1, requiredGroups: ["schedule", "venue"] },
      },
      table: {
        requiredFields: [
          "table_name",
          "table_type",
          "capacity",
          "minimum_spend",
        ],
        optionalFields: ["location_description", "is_vip"],
        variantLabel: "Table Options",
        validation: { minImages: 0 },
      },
      bottle: {
        requiredFields: ["name", "price", "category"],
        optionalFields: ["description", "volume", "is_available"],
        validation: { minImages: 1 },
      },
      reservation: {
        requiredFields: [
          "guest_name",
          "guest_phone",
          "table_id",
          "date",
          "party_size",
        ],
        optionalFields: ["special_requests", "bottles"],
        validation: {},
      },
    },
    onboardingSteps: [
      "venue_profile",
      "table_setup",
      "bottle_menu",
      "first_event",
    ],
    features: { reservations: true, tickets: true, bookings: true },
    aiTools: [
      "get_available_tables",
      "get_bottle_menu",
      "create_reservation",
      "get_upcoming_events",
    ],
  },
  // --- FITNESS & WELLNESS ---
  fitness: {
    displayName: "Fitness & Gym",
    description: "Gym memberships, fitness classes, personal training, and wellness services.",
    primaryObject: "membership",
    modules: [
      "dashboard",
      "catalog",
      "bookings",
      "sales",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Memberships & Classes",
      bookings: "Class Schedule",
      sales: "Membership Sales",
    },
    moduleIcons: {
      catalog: "Dumbbell",
      bookings: "Calendar",
      sales: "CreditCard",
    },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/memberships",
        create: "/dashboard/memberships/new",
      },
      bookings: { index: "/dashboard/classes" },
      sales: { index: "/dashboard/membership-sales" },
    },
    dashboardWidgets: [
      {
        id: "active_members",
        title: "Active Members",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "classes_today",
        title: "Classes Today",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      membership: {
        requiredFields: ["name", "price", "duration_months"],
        optionalFields: ["guest_passes", "freeze_option", "personal_training_sessions"],
        variantLabel: "Tier Levels",
        validation: { minImages: 1 },
      },
      class: {
        requiredFields: ["name", "instructor", "duration", "max_capacity"],
        optionalFields: ["equipment_needed", "difficulty_level"],
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["gym_profile", "membership_plans", "class_schedule"],
    features: { memberships: true, classes: true, bookings: true },
    aiTools: ["get_memberships", "book_class", "check_class_availability"],
  },
  // --- HEALTHCARE ---
  healthcare: {
    displayName: "Healthcare & Medical",
    description: "Medical practices, clinics, and healthcare providers with appointment scheduling.",
    primaryObject: "service",
    modules: [
      "dashboard",
      "catalog",
      "bookings",
      "sales",
      "finance",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Services & Treatments",
      bookings: "Appointments",
      sales: "Patient Billing",
    },
    moduleIcons: {
      catalog: "Stethoscope",
      bookings: "Calendar",
      sales: "FileText",
    },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/healthcare-services",
        create: "/dashboard/healthcare-services/new",
      },
      bookings: { index: "/dashboard/appointments" },
      sales: { index: "/dashboard/billing" },
    },
    dashboardWidgets: [
      {
        id: "appointments_today",
        title: "Appointments Today",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "pending_billing",
        title: "Pending Billing",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      service: {
        requiredFields: ["name", "price", "duration_minutes", "category"],
        optionalFields: ["requires_referral", "insurance_accepted", "preparation_instructions"],
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["practice_profile", "service_setup", "provider_schedule"],
    features: { appointments: true, medical_records: true },
    aiTools: ["get_services", "book_appointment", "get_available_slots"],
  },
  // --- LEGAL SERVICES ---
  legal: {
    displayName: "Legal Services",
    description: "Law firms and legal practitioners with case management and client intake.",
    primaryObject: "case",
    modules: [
      "dashboard",
      "catalog",
      "bookings",
      "sales",
      "finance",
      "settings",
    ],
    moduleLabels: {
      catalog: "Legal Services",
      bookings: "Consultations",
      sales: "Billing & Invoices",
    },
    moduleIcons: {
      catalog: "Scale",
      bookings: "Calendar",
      sales: "Receipt",
    },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/legal-services",
        create: "/dashboard/legal-services/new",
      },
      bookings: { index: "/dashboard/consultations" },
      sales: { index: "/dashboard/invoices" },
    },
    dashboardWidgets: [
      {
        id: "active_cases",
        title: "Active Cases",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "consultations_week",
        title: "Consultations This Week",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      case: {
        requiredFields: ["title", "client", "case_type", "status"],
        optionalFields: ["assigned_attorney", "retainer_amount", "court_date"],
        validation: { minImages: 0 },
      },
      service: {
        requiredFields: ["name", "pricing_structure"],
        optionalFields: ["estimated_hours", "practice_area"],
        validation: { minImages: 0 },
      },
    },
    onboardingSteps: ["firm_profile", "service_catalog", "intake_setup"],
    features: { case_management: true, consultations: true },
    aiTools: ["get_services", "book_consultation", "get_case_status"],
  },
  // --- JOBS & RECRUITMENT ---
  jobs: {
    displayName: "Jobs & Recruitment",
    description: "Job boards, recruitment agencies, and hiring platforms.",
    primaryObject: "job",
    modules: [
      "dashboard",
      "catalog",
      "sales",
      "marketing",
      "settings",
    ],
    moduleLabels: {
      catalog: "Job Postings",
      sales: "Applications",
    },
    moduleIcons: {
      catalog: "Briefcase",
      sales: "Users",
    },
    moduleRoutes: {
      catalog: {
        index: "/dashboard/jobs",
        create: "/dashboard/jobs/new",
      },
      sales: { index: "/dashboard/applications" },
    },
    dashboardWidgets: [
      {
        id: "active_jobs",
        title: "Active Jobs",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      {
        id: "total_applicants",
        title: "Total Applicants",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      job: {
        requiredFields: ["title", "company", "location", "job_type", "salary_range"],
        optionalFields: ["requirements", "benefits", "deadline"],
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["company_profile", "first_job_post"],
    features: { job_board: true, applications: true },
    aiTools: ["get_jobs", "submit_application", "get_job_status"],
  },
  // --- HOTEL (specific type for travel_hospitality) ---
  hotel: {
    displayName: "Hotel",
    primaryObject: "stay",
    modules: ["dashboard", "catalog", "bookings", "finance", "settings"],
    moduleLabels: { catalog: "Rooms", bookings: "Reservations" },
    moduleIcons: { catalog: "Building2", bookings: "CalendarCheck" },
    moduleRoutes: {
      catalog: { index: "/dashboard/rooms", create: "/dashboard/rooms/new" },
      bookings: { index: "/dashboard/reservations" },
    },
    dashboardWidgets: [
      { id: "active_rooms", title: "Active Rooms", dataSource: "real", type: "stat", w: 1 },
      { id: "upcoming_checkins", title: "Check-ins Today", dataSource: "real", type: "stat", w: 1 },
      ...COMMON_WIDGETS,
    ],
    forms: {
      stay: {
        requiredFields: ["price", "room_type", "amenities"],
        optionalFields: ["floor", "view"],
        variantLabel: "Room Types",
        validation: { minImages: 3 },
      },
    },
    onboardingSteps: ["hotel_profile", "room_setup"],
    features: { reservations: true, bookings: true },
    aiTools: ["check_availability", "book_room"],
  },
  // --- SALON (specific type for services) ---
  salon: {
    displayName: "Salon",
    primaryObject: "service",
    modules: ["dashboard", "catalog", "bookings", "finance", "settings"],
    moduleLabels: { catalog: "Services", bookings: "Appointments" },
    moduleIcons: { catalog: "Scissors", bookings: "Calendar" },
    moduleRoutes: {
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/appointments" },
    },
    dashboardWidgets: [
      { id: "today_appointments", title: "Today's Appointments", dataSource: "real", type: "stat", w: 1 },
      { id: "active_services", title: "Active Services", dataSource: "real", type: "stat", w: 1 },
      ...COMMON_WIDGETS,
    ],
    forms: {
      service: {
        requiredFields: ["price", "duration_min", "stylist"],
        optionalFields: ["products_used"],
        variantLabel: "Service Types",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["salon_profile", "service_menu"],
    features: { bookings: true },
    aiTools: ["get_services", "book_appointment"],
  },
  // --- SPA (specific type for services) ---
  spa: {
    displayName: "Spa",
    primaryObject: "service",
    modules: ["dashboard", "catalog", "bookings", "finance", "settings"],
    moduleLabels: { catalog: "Treatments", bookings: "Appointments" },
    moduleIcons: { catalog: "Sparkles", bookings: "Calendar" },
    moduleRoutes: {
      catalog: { index: "/dashboard/treatments", create: "/dashboard/treatments/new" },
      bookings: { index: "/dashboard/appointments" },
    },
    dashboardWidgets: [
      { id: "today_bookings", title: "Today's Bookings", dataSource: "real", type: "stat", w: 1 },
      { id: "active_treatments", title: "Active Treatments", dataSource: "real", type: "stat", w: 1 },
      ...COMMON_WIDGETS,
    ],
    forms: {
      service: {
        requiredFields: ["price", "duration_min", "therapist"],
        optionalFields: ["products_used", "benefits"],
        variantLabel: "Treatment Types",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["spa_profile", "treatment_menu"],
    features: { bookings: true },
    aiTools: ["get_services", "book_appointment"],
  },
  // --- RESTAURANT (specific type for food) ---
  restaurant: {
    displayName: "Restaurant",
    primaryObject: "menu_item",
    modules: ["dashboard", "catalog", "sales", "fulfillment", "finance", "marketing", "settings"],
    moduleLabels: { catalog: "Menu", sales: "Orders", fulfillment: "Kitchen" },
    moduleIcons: { catalog: "UtensilsCrossed", sales: "ShoppingBag", fulfillment: "ChefHat" },
    moduleRoutes: {
      catalog: { index: "/dashboard/menu", create: "/dashboard/menu/new" },
      sales: { index: "/dashboard/orders" },
      fulfillment: { index: "/dashboard/kitchen" },
    },
    dashboardWidgets: [
      { id: "active_orders", title: "Active Orders", dataSource: "real", type: "stat", w: 1 },
      { id: "tables_occupied", title: "Tables Occupied", dataSource: "real", type: "stat", w: 1 },
      ...COMMON_WIDGETS,
    ],
    forms: {
      menu_item: {
        requiredFields: ["price", "prep_time", "category"],
        optionalFields: ["calories", "allergens", "ingredients"],
        variantLabel: "Modifiers",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["restaurant_profile", "menu_setup", "table_setup"],
    features: { delivery: true, reservations: true },
    aiTools: ["get_menu", "place_order", "check_order_status"],
  },
  // --- CATERING (specific type for food) ---
  catering: {
    displayName: "Catering",
    primaryObject: "menu_item",
    modules: ["dashboard", "catalog", "sales", "fulfillment", "finance", "marketing", "settings"],
    moduleLabels: { catalog: "Menu", sales: "Orders", fulfillment: "Delivery" },
    moduleIcons: { catalog: "UtensilsCrossed", sales: "ShoppingBag", fulfillment: "Truck" },
    moduleRoutes: {
      catalog: { index: "/dashboard/menu", create: "/dashboard/menu/new" },
      sales: { index: "/dashboard/orders" },
      fulfillment: { index: "/dashboard/deliveries" },
    },
    dashboardWidgets: [
      { id: "pending_orders", title: "Pending Orders", dataSource: "real", type: "stat", w: 1 },
      { id: "events_today", title: "Events Today", dataSource: "real", type: "stat", w: 1 },
      ...COMMON_WIDGETS,
    ],
    forms: {
      menu_item: {
        requiredFields: ["price", "serves_count", "prep_time"],
        optionalFields: ["dietary_options", "setup_requirements"],
        variantLabel: "Package Options",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["catering_profile", "menu_setup", "delivery_setup"],
    features: { delivery: true },
    aiTools: ["get_menu", "place_order", "check_order_status"],
  },
  // --- WHOLESALE (specific type for B2B) ---
  wholesale: {
    displayName: "Wholesale",
    primaryObject: "product",
    modules: ["dashboard", "catalog", "sales", "finance", "marketing", "settings"],
    moduleLabels: { catalog: "Catalog", sales: "Orders" },
    moduleIcons: { catalog: "Boxes", sales: "FileText" },
    moduleRoutes: {
      catalog: { index: "/dashboard/catalog", create: "/dashboard/catalog/new" },
      sales: { index: "/dashboard/orders" },
    },
    dashboardWidgets: [
      { id: "pending_orders", title: "Pending Orders", dataSource: "real", type: "stat", w: 1 },
      { id: "inventory_value", title: "Inventory Value", dataSource: "real", type: "stat", w: 1 },
      ...COMMON_WIDGETS,
    ],
    forms: {
      product: {
        requiredFields: ["price", "sku", "moq"],
        optionalFields: ["lead_time", "bulk_discount"],
        variantLabel: "Volume Tiers",
        validation: { minImages: 1 },
      },
    },
    onboardingSteps: ["company_verification", "first_product"],
    features: { inventory: true, quotes: true },
    aiTools: ["get_wholesale_pricing", "get_inventory"],
  },
  petcare: {
    displayName: "Pet care",
    description: "Veterinary clinics and pet services with appointments.",
    primaryObject: "service",
    modules: SERVICE_MODULES,
    moduleLabels: { catalog: "Services", bookings: "Appointments" },
    moduleIcons: { catalog: "HeartPulse", bookings: "Calendar" },
    moduleRoutes: {
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/appointments" },
    },
    dashboardWidgets: [
      {
        id: "today_appointments",
        title: "Today's appointments",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      service: {
        requiredFields: ["name", "price"],
        optionalFields: ["duration_min"],
        variantLabel: "Service types",
        validation: { minImages: 0 },
      },
    },
    onboardingSteps: ["store_profile", "services"],
    features: { bookings: true },
    aiTools: ["get_services", "book_appointment"],
  },
  specialized: {
    displayName: "Specialized",
    description: "Niche and custom business models.",
    primaryObject: "product",
    modules: COMMERCE_MODULES,
    dashboardWidgets: COMMERCE_WIDGETS,
    forms: { product: { ...BASE_PRODUCT_FORM } },
    onboardingSteps: ["store_profile", "first_product"],
    features: { inventory: true },
    aiTools: ["get_inventory", "get_promotions"],
  },
  wellness: {
    displayName: "Wellness",
    description: "Wellness centers, therapy, and holistic health.",
    primaryObject: "service",
    modules: SERVICE_MODULES,
    moduleLabels: { catalog: "Programs", bookings: "Appointments" },
    moduleIcons: { catalog: "Sparkles", bookings: "Calendar" },
    moduleRoutes: {
      catalog: { index: "/dashboard/services", create: "/dashboard/services/new" },
      bookings: { index: "/dashboard/appointments" },
    },
    dashboardWidgets: [
      {
        id: "today_sessions",
        title: "Today's sessions",
        dataSource: "real",
        type: "stat",
        w: 1,
      },
      ...COMMON_WIDGETS,
    ],
    forms: {
      service: {
        requiredFields: ["name", "price"],
        optionalFields: ["duration_min"],
        variantLabel: "Programs",
        validation: { minImages: 0 },
      },
    },
    onboardingSteps: ["store_profile", "services"],
    features: { bookings: true },
    aiTools: ["get_services", "book_appointment"],
  },
};
