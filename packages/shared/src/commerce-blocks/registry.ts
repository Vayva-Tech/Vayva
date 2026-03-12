export type CommerceBlockPropType = "string" | "number" | "boolean" | "select" | "list";

export interface CommerceBlockPropDef {
  key: string;
  name: string;
  type: CommerceBlockPropType;
  description?: string;
  options?: { label: string; value: string | number }[]; // For "select"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
}

export interface CommerceBlockDef {
  key: string;
  name: string;
  description: string;
  icon?: string;
  props: CommerceBlockPropDef[];
  /** Extension ID that unlocks this block. If undefined, block is always available (core block). */
  requiredExtension?: string;
}

/** Core blocks always available in WebStudio */
const CORE_COMMERCE_BLOCKS: CommerceBlockDef[] = [
  {
    key: "product-grid",
    name: "Product Grid",
    description: "Display a grid of products from a specific collection",
    icon: "LayoutGrid",
    props: [
      {
        key: "collection",
        name: "Collection",
        type: "string",
        description: "Collection slug (e.g., 'new-arrivals')",
      },
      {
        key: "limit",
        name: "Limit",
        type: "number",
        description: "Number of products to show",
        defaultValue: 8,
      },
      {
        key: "sort",
        name: "Sort By",
        type: "select",
        options: [
          { label: "Newest", value: "newest" },
          { label: "Price: Low to High", value: "price-asc" },
          { label: "Price: High to Low", value: "price-desc" },
        ],
        defaultValue: "newest",
      },
    ],
  },
  {
    key: "featured-products",
    name: "Featured Products",
    description: "Highlight specific products or products with a certain tag",
    icon: "Star",
    props: [
      {
        key: "tag",
        name: "Tag",
        type: "string",
        description: "Show products with this tag",
      },
      {
        key: "productIds",
        name: "Product IDs",
        type: "string",
        description: "Comma-separated list of specific product IDs",
      },
    ],
  },
  {
    key: "product-carousel",
    name: "Product Carousel",
    description: "A horizontally scrolling list of products",
    icon: "ArrowRightCircle",
    props: [
      {
        key: "collection",
        name: "Collection",
        type: "string",
        description: "Collection slug",
      },
      {
        key: "limit",
        name: "Limit",
        type: "number",
        defaultValue: 10,
      },
    ],
  },
  {
    key: "collection-list",
    name: "Collection List",
    description: "Show a list of all your product collections",
    icon: "FolderHeart",
    props: [
      {
        key: "limit",
        name: "Limit",
        type: "number",
        defaultValue: 6,
      },
    ],
  },
  {
    key: "category-tiles",
    name: "Category Tiles",
    description: "Visual tiles representing top categories",
    icon: "Shapes",
    props: [],
  },
  {
    key: "add-to-cart-button",
    name: "Add to Cart Button",
    description: "A standalone button to add a specific product to the cart",
    icon: "ShoppingCart",
    props: [
      {
        key: "productId",
        name: "Product ID",
        type: "string",
        description: "ID of the product to add",
      },
      {
        key: "variantId",
        name: "Variant ID",
        type: "string",
        description: "Specific variant/SKU ID (optional)",
      },
    ],
  },
  {
    key: "mini-cart",
    name: "Mini Cart",
    description: "Floating cart summary with quick access to checkout",
    icon: "ShoppingBag",
    props: [],
  },
];

/** Extension-specific blocks unlocked by enabling extensions */
const EXTENSION_COMMERCE_BLOCKS: CommerceBlockDef[] = [
  // Kitchen Management (vayva.kitchen)
  {
    key: "menu-grid",
    name: "Menu Grid",
    description: "Display a grid of menu items with categories",
    icon: "ChefHat",
    requiredExtension: "vayva.kitchen",
    props: [
      {
        key: "category",
        name: "Category",
        type: "string",
        description: "Menu category slug (e.g., 'appetizers')",
      },
      {
        key: "limit",
        name: "Limit",
        type: "number",
        defaultValue: 12,
      },
    ],
  },
  {
    key: "featured-dishes",
    name: "Featured Dishes",
    description: "Highlight signature or chef's special dishes",
    icon: "Star",
    requiredExtension: "vayva.kitchen",
    props: [
      {
        key: "dishIds",
        name: "Dish IDs",
        type: "string",
        description: "Comma-separated menu item IDs to feature",
      },
    ],
  },
  {
    key: "order-ticket",
    name: "Order Ticket",
    description: "Live kitchen order ticket display for pickup/delivery",
    icon: "Ticket",
    requiredExtension: "vayva.kitchen",
    props: [
      {
        key: "maxOrders",
        name: "Max Orders",
        type: "number",
        defaultValue: 5,
      },
    ],
  },

  // Appointment Bookings (vayva.bookings)
  {
    key: "booking-calendar",
    name: "Booking Calendar",
    description: "Interactive calendar for appointment scheduling",
    icon: "Calendar",
    requiredExtension: "vayva.bookings",
    props: [
      {
        key: "serviceId",
        name: "Service ID",
        type: "string",
        description: "Specific service to book (optional)",
      },
    ],
  },
  {
    key: "service-list",
    name: "Service List",
    description: "Display available services with pricing",
    icon: "Briefcase",
    requiredExtension: "vayva.bookings",
    props: [
      {
        key: "category",
        name: "Category",
        type: "string",
        description: "Service category filter",
      },
    ],
  },

  // Real Estate (vayva.real-estate)
  {
    key: "property-grid",
    name: "Property Grid",
    description: "Display property listings in a grid",
    icon: "Home",
    requiredExtension: "vayva.real-estate",
    props: [
      {
        key: "q",
        name: "Search Query",
        type: "string",
        description: "Search query (city, address, title, etc.)",
      },
    ],
  },
  {
    key: "property-search",
    name: "Property Search",
    description: "Search bar with filters for property listings",
    icon: "Search",
    requiredExtension: "vayva.real-estate",
    props: [],
  },

  // Education (vayva.education)
  {
    key: "course-grid",
    name: "Course Grid",
    description: "Display courses in a grid layout",
    icon: "GraduationCap",
    requiredExtension: "vayva.education",
    props: [
      {
        key: "query",
        name: "Search Query",
        type: "string",
        description: "Optional initial search query",
      },
    ],
  },
  {
    key: "enrollment-form",
    name: "Enrollment Form",
    description: "Course enrollment/signup form",
    icon: "UserPlus",
    requiredExtension: "vayva.education",
    props: [
      {
        key: "courseId",
        name: "Course ID",
        type: "string",
        description: "Pre-select a specific course",
      },
    ],
  },

  // Events (vayva.events)
  {
    key: "event-list",
    name: "Event List",
    description: "Upcoming events with ticket availability",
    icon: "PartyPopper",
    requiredExtension: "vayva.events",
    props: [
      {
        key: "limit",
        name: "Limit",
        type: "number",
        defaultValue: 6,
      },
    ],
  },
  {
    key: "ticket-widget",
    name: "Ticket Widget",
    description: "Quick ticket purchase for a specific event",
    icon: "Ticket",
    requiredExtension: "vayva.events",
    props: [
      {
        key: "eventId",
        name: "Event ID",
        type: "string",
        description: "Event to sell tickets for",
      },
    ],
  },

  // B2B Wholesale (vayva.b2b)
  {
    key: "quote-request",
    name: "Quote Request Form",
    description: "Form for B2B customers to request pricing quotes",
    icon: "FileText",
    requiredExtension: "vayva.b2b",
    props: [
      {
        key: "productId",
        name: "Product ID",
        type: "string",
        description: "Pre-fill for a specific product",
      },
    ],
  },

  // Nonprofit (vayva.nonprofit)
  {
    key: "donation-form",
    name: "Donation Form",
    description: "Accept donations with amount presets",
    icon: "Heart",
    requiredExtension: "vayva.nonprofit",
    props: [
      {
        key: "campaignId",
        name: "Campaign ID",
        type: "string",
        description: "Link to a specific campaign",
      },
    ],
  },
  {
    key: "campaign-progress",
    name: "Campaign Progress",
    description: "Show fundraising goal progress bar",
    icon: "Target",
    requiredExtension: "vayva.nonprofit",
    props: [
      {
        key: "campaignId",
        name: "Campaign ID",
        type: "string",
        description: "Campaign to display progress for",
      },
    ],
  },

  // Automotive (vayva.automotive)
  {
    key: "vehicle-grid",
    name: "Vehicle Grid",
    description: "Display vehicle inventory in a grid",
    icon: "Car",
    requiredExtension: "vayva.automotive",
    props: [
      {
        key: "year",
        name: "Year",
        type: "string",
        description: "Vehicle year filter",
      },
      {
        key: "make",
        name: "Make",
        type: "string",
        description: "Vehicle make filter",
      },
      {
        key: "model",
        name: "Model",
        type: "string",
        description: "Vehicle model filter",
      },
    ],
  },

  // Travel/Hospitality (vayva.travel)
  {
    key: "availability-calendar",
    name: "Availability Calendar",
    description: "Show available dates for booking stays",
    icon: "CalendarCheck",
    requiredExtension: "vayva.travel",
    props: [
      {
        key: "productId",
        name: "Stay Product ID",
        type: "string",
        description: "Specific stay/accommodation productId to check availability",
      },
    ],
  },
];

/** Blog/Content blocks (core for now) */
const BLOG_COMMERCE_BLOCKS: CommerceBlockDef[] = [
  {
    key: "post-list",
    name: "Post List",
    description: "Display your latest blog posts",
    icon: "Newspaper",
    props: [
      {
        key: "limit",
        name: "Limit",
        type: "number",
        description: "Number of posts to show",
        defaultValue: 6,
      },
    ],
  },
  {
    key: "featured-post",
    name: "Featured Post",
    description: "Highlight a specific blog post",
    icon: "FileText",
    props: [
      {
        key: "postId",
        name: "Post ID",
        type: "string",
        description: "Blog post to feature",
      },
    ],
  },
];

/** All commerce blocks (core + extension) */
export const COMMERCE_BLOCKS: CommerceBlockDef[] = [
  ...CORE_COMMERCE_BLOCKS,
  ...EXTENSION_COMMERCE_BLOCKS,
  ...BLOG_COMMERCE_BLOCKS,
];

/**
 * Get available commerce blocks based on enabled extensions.
 * Core blocks are always included. Extension blocks are only included
 * if their required extension is enabled.
 */
export function getBlocksForExtensions(enabledExtensionIds: string[]): CommerceBlockDef[] {
  const enabledSet = new Set(enabledExtensionIds);
  
  return COMMERCE_BLOCKS.filter((block) => {
    // Core blocks (no requiredExtension) are always available
    if (!block.requiredExtension) return true;
    // Extension blocks only if extension is enabled
    return enabledSet.has(block.requiredExtension);
  });
}

/**
 * Check if a specific block is available given enabled extensions.
 */
export function isBlockAvailable(blockKey: string, enabledExtensionIds: string[]): boolean {
  const block = COMMERCE_BLOCKS.find((b) => b.key === blockKey);
  if (!block) return false;
  if (!block.requiredExtension) return true;
  return enabledExtensionIds.includes(block.requiredExtension);
}
