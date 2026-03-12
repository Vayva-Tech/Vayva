// Storefront public types

export interface PublicStore {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  theme?: {
    templateId: string;
    primaryColor: string;
    accentColor: string;
    oneProductConfig?: {
      upsellProductId?: string;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  policies?: {
    shipping?: string;
    returns?: string;
    privacy?: string;
  };
  industry?: string;
  plan?: "FREE" | "STARTER" | "PRO";
}

export interface PublicMenu {
  id?: string;
  name?: string;
  description?: string | null;
  weeks?: PublicWeek[];
  meals?: PublicProduct[];
}

export interface PublicWeek {
  id: string;
  label: { tr?: string; en?: string };
  deliveryDate: string;
  cutoffDate: string;
  isLocked: boolean;
  name?: string;
  description?: string | null;
  days?: PublicDay[];
}

export interface PublicDay {
  id: string;
  day: string;
  meal: PublicProduct | null;
}

export interface PublicProduct {
  id: string;
  name?: string;
  title?: { tr?: string; en?: string };
  description?: string;
  price?: number;
  compareAtPrice?: number | null;
  image?: string | null;
  images?: any[];
  category?: string;
  isAvailable?: boolean;
  inStock?: boolean;
  inventory?: number;
  trackInventory?: boolean;
  ingredients?: string;
  calories?: number;
  prepTime?: number;
  storeId?: string;
  handle?: string;
  metadata?: Record<string, string> | unknown;
  variants?: ProductVariant[];
  vendorDetails?: {
    id?: string;
    name?: string;
    logo?: string;
    isVerified?: boolean;
    rating?: number;
  };
  subscriptionOptions?: {
    available?: boolean;
  };
  wholesaleDetails?: {
    moq?: number;
  };
  modifiers?: Array<{
    id: string;
    name: string;
    type: string;
    options: Array<{
      label: string;
      price: number;
    }>;
  }>;
  courseDetails?: {
    instructor?: {
      name?: string;
      avatar?: string;
      title?: string;
    };
    level?: string;
    certificate?: boolean;
    lessons?: Array<{
      id: string;
      title: string;
      duration: string;
      isLocked: boolean;
    }>;
  };
  fileDetails?: {
    fileSize?: string;
    fileType?: string;
    version?: string;
  };
  licenseType?: string;
  donationDetails?: {
    raisedAmount: number;
    goalAmount: number;
    orgName: string;
    donorCount: number;
    isRecurringAvailable?: boolean;
  };
  specs?: Array<{
    value: string;
  }>;
  propertyDetails?: {
    purpose: "rent" | "sale" | "shortlet";
    type: string;
    location: string;
    beds?: number;
    baths?: number;
    sqm?: number;
  };
  eventDetails?: {
    date?: string;
    venue?: string;
    city?: string;
    capacity?: number;
    ticketsSold?: number;
    ticketTypes?: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  options?: string[];
}

export interface PublicOrder {
  id: string;
  refCode?: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  deliveryMethod?: string | null;
  subtotal?: number;
  shippingTotal?: number;
  total?: number;
  items?: Array<{
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
  createdAt?: string;
  shipping?: {
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
  };
  payment?: {
    method?: string;
    status?: string;
  };
}
