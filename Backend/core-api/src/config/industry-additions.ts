import type { IndustryConfig } from "@/lib/templates/types";

const CW = [
  { id: "setup_checklist", title: "Setup Progress", dataSource: "real", type: "list", w: 4 },
] as const;

export const industryAdditions: Record<string, IndustryConfig> = {
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
        ...CW,
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
  analytics: {
    displayName: "Analytics & BI",
    description: "Metrics, reporting, and experimentation.",
    primaryObject: "digital_asset",
    modules: ["dashboard", "catalog", "sales", "marketing", "settings"],
    moduleLabels: { catalog: "Data Sources", sales: "Reports" },
    moduleIcons: { catalog: "BarChart3", sales: "FileText" },
    moduleRoutes: {
      catalog: { index: "/dashboard/analytics" },
      sales: { index: "/dashboard/reports" },
    },
    dashboardWidgets: [
      { id: "active_reports", title: "Active Reports", dataSource: "real", type: "stat", w: 1 },
      ...CW,
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
};
