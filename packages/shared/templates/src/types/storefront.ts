export interface PublicStore<TThemeConfig = unknown> {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    templateId: string;
    // Specific template configuration
    config?: TThemeConfig;
    oneProductConfig?: StorefrontOneProductConfig;
  };
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  policies: {
    shipping: string;
    returns: string;
    privacy: string;
  };
  industry?: string;
  plan?: "FREE" | "STARTER" | "PRO";
}

export interface PublicProduct<TMetadata = unknown> {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  variants: ProductVariant[];
  inStock: boolean;
  inventory?: number;
  category?: string;
  specs?: { label: string; value: string }[];
  warrantyInfo?: string;
  ingredients?: string;
  rituals?: { step: string; description: string }[];
  subscriptionOptions?: { available: boolean; frequencies: string[] };
  type?:
    | "physical"
    | "service"
    | "food"
    | "digital"
    | "ticket"
    | "course"
    | "wholesale"
    | "marketplace"
    | "donation"
    | "property";
  serviceDetails?: {
    duration: number; // minutes
    hasDeposit: boolean;
    depositAmount?: number;
  };
  modifiers?: {
    id: string;
    name: string;
    type: "choice" | "addon";
    options: { label: string; price: number }[];
  }[];
  fileDetails?: {
    fileType: string;
    fileSize: string;
    version?: string;
    downloadLimit?: number;
  };
  eventDetails?: {
    date: string;
    venue: string;
    organizer: string;
    capacity: number;
    ticketsSold: number;
    ticketTypes: {
      id: string;
      name: string;
      price: number;
      capacity?: number;
    }[];
  };
  courseDetails?: {
    level: string;
    lessons: {
      id: string;
      title: string;
      duration: string;
      isLocked: boolean;
    }[];
    instructor: { name: string; title: string; avatar: string };
    certificate: boolean;
  };
  wholesaleDetails?: {
    moq: number;
    pricingTiers: { minQty: number; price: number }[];
    leadTime: string;
  };
  vendorDetails?: {
    id: string;
    name: string;
    rating: number;
    isVerified: boolean;
    logo: string;
  };
  donationDetails?: {
    goalAmount: number;
    raisedAmount: number;
    donorCount: number;
    orgName: string;
    isRecurringAvailable: boolean;
  };
  propertyDetails?: {
    type: "apartment" | "house" | "land" | "commercial";
    purpose: "rent" | "sale" | "shortlet";
    beds?: number;
    baths?: number;
    sqm?: number;
    location: string;
    amenities: string[];
  };
  licenseType?: "standard" | "extended";
  isAvailable?: boolean;
  metadata?: TMetadata;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size"
  options: string[]; // e.g. ["S", "M", "L"]
}

export interface CartItem {
  productId: string;
  variantId?: string; // composite key of selected options if complex
  quantity: number;
  price: number;
  productName: string;
  image?: string;
}

export interface PublicOrder {
  id: string;
  refCode: string;
  orderNumber?: string;
  status: string;
  paymentStatus: string;
  deliveryMethod?: string | null;
  subtotal: number;
  shippingTotal: number;
  total: number;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  customer?: {
    phone?: string | null;
    note?: string | null;
  };
  timeline?: Array<{
    type: string;
    text: string;
    createdAt: string;
  }>;
}

export interface PublicWeek {
  id: string;
  label: { tr: string; en: string };
  deliveryDate: string;
  cutoffDate: string;
  isLocked: boolean;
}

export interface PublicMenu {
  weeks: PublicWeek[];
  meals: PublicProduct[];
}

export interface PublicBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  publishedAt: string;
  tags?: string[];
}
export interface StorefrontOneProductConfig {
  upsellProductId?: string;
  heroHeadline?: string;
  subHeadline?: string;
  guaranteeText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  benefits?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testimonials?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  faqs?: any[];
}
