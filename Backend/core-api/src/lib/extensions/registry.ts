/**
 * These are core modules that are treated as extensions.
 * In the future, these could be moved to separate packages.
 */

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  parentGroup: string;
}

export interface DashboardWidget {
  id: string;
  label: string;
  type: string;
  gridCols: number;
  icon?: string;
  apiEndpoint: string;
}

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  sidebarItems: SidebarItem[];
  primaryObject: string;
  dashboardWidgets?: DashboardWidget[];
}

export const INTERNAL_EXTENSIONS: ExtensionManifest[] = [
  {
    id: "vayva.retail",
    name: "General Retail",
    version: "1.0.0",
    description: "Core commerce features: Products, Orders, and Fulfillment.",
    category: "commerce",
    sidebarItems: [
      {
        id: "products",
        label: "Products",
        href: "/dashboard/products",
        icon: "Package",
        parentGroup: "sales",
      },
      {
        id: "orders",
        label: "Orders",
        href: "/dashboard/orders",
        icon: "ShoppingBag",
        parentGroup: "sales",
      },
      {
        id: "fulfillment",
        label: "Fulfillment",
        href: "/dashboard/fulfillment/shipments",
        icon: "Truck",
        parentGroup: "sales",
      },
    ],
    primaryObject: "product",
    dashboardWidgets: [
      {
        id: "retail.sales_velocity",
        label: "Sales Velocity",
        type: "large_stat",
        gridCols: 1,
        icon: "Zap",
        apiEndpoint: "/api/analytics/sales-velocity",
      },
      {
        id: "retail.top_products",
        label: "Top Products",
        type: "list_activity",
        gridCols: 2,
        icon: "Package",
        apiEndpoint: "/api/analytics/top-products",
      },
    ],
  },
  {
    id: "vayva.kitchen",
    name: "Kitchen Management",
    version: "1.0.0",
    description: "Live kitchen view for restaurants and food delivery.",
    category: "industry",
    sidebarItems: [
      {
        id: "kitchen",
        label: "Kitchen View",
        href: "/dashboard/kitchen",
        icon: "ChefHat",
        parentGroup: "ops",
      },
    ],
    primaryObject: "menu_item",
  },
  {
    id: "vayva.real-estate",
    name: "Real Estate Listings",
    version: "1.0.0",
    description: "Manage properties, viewings, and real estate leads.",
    category: "industry",
    sidebarItems: [
      {
        id: "properties",
        label: "Properties",
        href: "/dashboard/properties",
        icon: "Home",
        parentGroup: "sales",
      },
      {
        id: "viewings",
        label: "Viewings",
        href: "/dashboard/viewings",
        icon: "Calendar",
        parentGroup: "sales",
      },
    ],
    primaryObject: "listing",
  },
  {
    id: "vayva.automations",
    name: "Visual Automations",
    version: "1.0.0",
    description:
      "Build visual, no-code workflows to automate your business operations.",
    category: "productivity",
    sidebarItems: [
      {
        id: "automations",
        label: "Automations",
        href: "/dashboard/automations",
        icon: "Zap",
        parentGroup: "ops",
      },
    ],
    primaryObject: "workflow",
  },
  {
    id: "vayva.bookings",
    name: "Appointment Bookings",
    version: "1.0.0",
    description:
      "Calendar-based appointment scheduling for service businesses.",
    category: "industry",
    sidebarItems: [
      {
        id: "bookings",
        label: "Bookings",
        href: "/dashboard/bookings",
        icon: "Calendar",
        parentGroup: "sales",
      },
      {
        id: "services",
        label: "Services",
        href: "/dashboard/services",
        icon: "Briefcase",
        parentGroup: "sales",
      },
    ],
    primaryObject: "service",
    dashboardWidgets: [
      {
        id: "bookings.upcoming",
        label: "Upcoming Bookings",
        type: "list_activity",
        gridCols: 2,
        icon: "Calendar",
        apiEndpoint: "/api/bookings/upcoming",
      },
    ],
  },
  {
    id: "vayva.education",
    name: "Course Management",
    version: "1.0.0",
    description: "LMS features for online courses and student management.",
    category: "industry",
    sidebarItems: [
      {
        id: "courses",
        label: "Courses",
        href: "/dashboard/courses",
        icon: "GraduationCap",
        parentGroup: "sales",
      },
      {
        id: "enrollments",
        label: "Enrollments",
        href: "/dashboard/enrollments",
        icon: "Users",
        parentGroup: "sales",
      },
    ],
    primaryObject: "course",
    dashboardWidgets: [
      {
        id: "education.enrollments",
        label: "Active Enrollments",
        type: "large_stat",
        gridCols: 1,
        icon: "Users",
        apiEndpoint: "/api/education/stats",
      },
    ],
  },
  {
    id: "vayva.events",
    name: "Event Ticketing",
    version: "1.0.0",
    description: "Ticket sales and event management for nightlife and events.",
    category: "industry",
    sidebarItems: [
      {
        id: "events",
        label: "Events",
        href: "/dashboard/events",
        icon: "PartyPopper",
        parentGroup: "sales",
      },
      {
        id: "tickets",
        label: "Tickets",
        href: "/dashboard/check-in",
        icon: "Ticket",
        parentGroup: "sales",
      },
    ],
    primaryObject: "event",
    dashboardWidgets: [
      {
        id: "events.tickets_sold",
        label: "Tickets Sold",
        type: "large_stat",
        gridCols: 1,
        icon: "Ticket",
        apiEndpoint: "/api/events/stats",
      },
    ],
  },
  {
    id: "vayva.b2b",
    name: "B2B Wholesale",
    version: "1.0.0",
    description:
      "Wholesale catalog, quotes, and volume pricing for B2B businesses.",
    category: "industry",
    sidebarItems: [
      {
        id: "wholesale",
        label: "Wholesale Catalog",
        href: "/dashboard/wholesale-catalog",
        icon: "Warehouse",
        parentGroup: "sales",
      },
      {
        id: "quotes",
        label: "Quotes",
        href: "/dashboard/quotes",
        icon: "FileText",
        parentGroup: "sales",
      },
      {
        id: "leads",
        label: "Leads",
        href: "/dashboard/leads",
        icon: "Users",
        parentGroup: "sales",
      },
    ],
    primaryObject: "product",
    dashboardWidgets: [
      {
        id: "b2b.pending_quotes",
        label: "Pending Quotes",
        type: "large_stat",
        gridCols: 1,
        icon: "FileText",
        apiEndpoint: "/api/quotes/stats",
      },
    ],
  },
  {
    id: "vayva.nonprofit",
    name: "Donation Campaigns",
    version: "1.0.0",
    description: "Fundraising campaigns and donor management for nonprofits.",
    category: "industry",
    sidebarItems: [
      {
        id: "campaigns",
        label: "Campaigns",
        href: "/dashboard/campaigns",
        icon: "Heart",
        parentGroup: "sales",
      },
      {
        id: "donors",
        label: "Donors",
        href: "/dashboard/donors",
        icon: "Users",
        parentGroup: "sales",
      },
    ],
    primaryObject: "campaign",
    dashboardWidgets: [
      {
        id: "nonprofit.total_raised",
        label: "Total Raised",
        type: "large_stat",
        gridCols: 1,
        icon: "Heart",
        apiEndpoint: "/api/campaigns/stats",
      },
    ],
  },
  {
    id: "vayva.automotive",
    name: "Vehicle Inventory",
    version: "1.0.0",
    description: "Vehicle listings and inventory management for dealerships.",
    category: "industry",
    sidebarItems: [
      {
        id: "vehicles",
        label: "Vehicles",
        href: "/dashboard/vehicles",
        icon: "Car",
        parentGroup: "sales",
      },
      {
        id: "inquiries",
        label: "Inquiries",
        href: "/dashboard/leads",
        icon: "MessageSquare",
        parentGroup: "sales",
      },
    ],
    primaryObject: "vehicle",
    dashboardWidgets: [
      {
        id: "automotive.active_listings",
        label: "Active Listings",
        type: "large_stat",
        gridCols: 1,
        icon: "Car",
        apiEndpoint: "/api/vehicles/stats",
      },
    ],
  },
  {
    id: "vayva.travel",
    name: "Stays & Reservations",
    version: "1.0.0",
    description:
      "Property listings and reservation management for hospitality.",
    category: "industry",
    sidebarItems: [
      {
        id: "stays",
        label: "Stays",
        href: "/dashboard/stays",
        icon: "Bed",
        parentGroup: "sales",
      },
      {
        id: "reservations",
        label: "Reservations",
        href: "/dashboard/stays",
        icon: "CalendarCheck",
        parentGroup: "sales",
      },
    ],
    primaryObject: "stay",
    dashboardWidgets: [
      {
        id: "travel.upcoming_reservations",
        label: "Upcoming Reservations",
        type: "large_stat",
        gridCols: 1,
        icon: "CalendarCheck",
        apiEndpoint: "/api/stays/stats",
      },
    ],
  },
  {
    id: "vayva.creative",
    name: "Creative Portfolio",
    version: "1.0.0",
    description:
      "Project showcase and client management for creative professionals.",
    category: "industry",
    sidebarItems: [
      {
        id: "projects",
        label: "Projects",
        href: "/dashboard/projects",
        icon: "Palette",
        parentGroup: "sales",
      },
      {
        id: "clients",
        label: "Clients",
        href: "/dashboard/customers",
        icon: "Users",
        parentGroup: "sales",
      },
    ],
    primaryObject: "project",
    dashboardWidgets: [
      {
        id: "creative.active_projects",
        label: "Active Projects",
        type: "large_stat",
        gridCols: 1,
        icon: "Palette",
        apiEndpoint: "/api/projects/stats",
      },
    ],
  },
  {
    id: "vayva.autopilot",
    name: "AI Autopilot",
    version: "1.0.0",
    description:
      "AI-powered business recommendations tailored to your industry. Get daily insights on inventory, pricing, marketing, and operations.",
    category: "ai",
    sidebarItems: [],
    primaryObject: "recommendation",
  },
  {
    id: "vayva.affiliate",
    name: "Affiliate Program",
    version: "1.0.0",
    description:
      "Enable an affiliate program on your storefront: affiliate signup, dashboard, referral tracking, and payouts.",
    category: "marketing",
    sidebarItems: [
      {
        id: "marketing_affiliates",
        label: "Affiliates",
        href: "/dashboard/marketing/affiliates",
        icon: "Users",
        parentGroup: "marketing",
      },
    ],
    primaryObject: "affiliate",
  },
];
class ExtensionRegistry {
  private extensions: Map<string, ExtensionManifest>;
  constructor(initial: ExtensionManifest[]) {
    this.extensions = new Map();
    initial.forEach((ext) => this.extensions.set(ext.id, ext));
  }
  register(manifest: ExtensionManifest) {
    this.extensions.set(manifest.id, manifest);
  }
  get(id: string) {
    return this.extensions.get(id);
  }
  getAll() {
    return Array.from(this.extensions.values());
  }
  /**
   * Get active extensions for a store.
   * @param industrySlug - Legacy industry identifier
   * @param enabledIds - Explicitly enabled extension IDs (from DB)
   */
  getActiveForStore(
    industrySlug: string,
    enabledIds: string[],
  ): ExtensionManifest[] {
    const commerceIndustries = new Set([
      "retail",
      "fashion",
      "electronics",
      "beauty",
      "grocery",
      "marketplace",
      "one_product",
    ]);

    const active: ExtensionManifest[] = [];

    const shouldIncludeRetail = commerceIndustries.has(industrySlug);
    const retailExt = this.extensions.get("vayva.retail");
    if (retailExt && shouldIncludeRetail) {
      active.push(retailExt);
    }

    // If we have explicit enabled IDs from DB, use them
    if (enabledIds && enabledIds.length > 0) {
      enabledIds.forEach((id) => {
        if (id === "vayva.retail" && !shouldIncludeRetail) {
          return;
        }
        const ext = this.extensions.get(id);
        if (ext && !active.find((a) => a.id === id)) {
          active.push(ext);
        }
      });
      return active;
    }
    // Fallback for new stores or pre-migration: derive from industrySlug
    const industryExtensionMap: Record<string, string[]> = {
      food: ["vayva.kitchen"],
      real_estate: ["vayva.real-estate"],
      services: ["vayva.bookings"],
      education: ["vayva.education"],
      nightlife: ["vayva.events"],
      b2b: ["vayva.b2b"],
      nonprofit: ["vayva.nonprofit"],
      automotive: ["vayva.automotive"],
      travel_hospitality: ["vayva.travel"],
      creative_portfolio: ["vayva.creative"],
    };

    const extIds = industryExtensionMap[industrySlug] || [];
    extIds.forEach((extId) => {
      const ext = this.extensions.get(extId);
      if (ext && !active.find((a) => a.id === extId)) {
        active.push(ext);
      }
    });

    return active;
  }
}
export const extensionRegistry = new ExtensionRegistry(INTERNAL_EXTENSIONS);
