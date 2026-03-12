// ============================================================================
// PHASE 2: INDUSTRY-SPECIFIC TOOLS TYPES
// ============================================================================

// ===== FASHION & APPAREL =====

export interface SizeProfile {
  id: string;
  customerId: string;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    height?: number;
    weight?: number;
    inseam?: number;
    sleeve?: number;
    shoeSize?: string;
  };
  sizePreferences: {
    brand: string;
    size: string;
    fits: 'too_small' | 'tight' | 'well' | 'loose' | 'too_big';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSizeProfileInput {
  customerId: string;
  measurements: SizeProfile['measurements'];
  sizePreferences?: SizeProfile['sizePreferences'];
}

export interface SizeChart {
  id: string;
  storeId: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'dresses' | 'outerwear';
  brand?: string;
  measurements: {
    size: string;
    chest?: { min: number; max: number };
    waist?: { min: number; max: number };
    hips?: { min: number; max: number };
    footLength?: { min: number; max: number };
  }[];
  conversion?: {
    US: string;
    UK: string;
    EU: string;
    International: string;
  };
  createdAt: Date;
}

export interface StyleQuiz {
  id: string;
  storeId: string;
  title: string;
  questions: {
    id: string;
    question: string;
    options: {
      id: string;
      text: string;
      weights: Record<string, number>; // style -> weight
    }[];
  }[];
  results: {
    style: string;
    description: string;
    productIds: string[];
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== BEAUTY & COSMETICS =====

export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
export type Undertone = 'warm' | 'cool' | 'neutral';

export interface SkinProfile {
  id: string;
  customerId: string;
  skinType: SkinType;
  skinTone?: string;
  undertone?: Undertone;
  concerns: string[]; // acne, aging, dark_spots, etc.
  allergies: string[];
  quizResults?: {
    quizId: string;
    answers: Record<string, string>;
    recommendationSummary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSkinProfileInput {
  customerId: string;
  skinType: SkinType;
  skinTone?: string;
  undertone?: Undertone;
  concerns?: string[];
  allergies?: string[];
}

export interface ProductShade {
  id: string;
  productId: string;
  shadeName: string;
  hexColor?: string;
  skinToneMatch: string[]; // ["fair", "light", "medium", "deep"]
  undertoneMatch: Undertone[];
  imageUrl?: string;
}

export interface RoutineBuilder {
  id: string;
  storeId: string;
  name: string;
  targetSkinType: SkinType[];
  targetConcerns: string[];
  steps: {
    step: number;
    productId: string;
    timeOfDay: 'morning' | 'evening' | 'both';
    instructions?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== ELECTRONICS =====

export type WarrantyStatus = 'active' | 'expired' | 'claimed' | 'void';

export interface WarrantyRecord {
  id: string;
  storeId: string;
  orderId: string;
  productId: string;
  customerId: string;
  serialNumber?: string;
  warrantyType: 'manufacturer' | 'extended';
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  status: WarrantyStatus;
  renewalOffered: boolean;
  createdAt: Date;
}

export interface ExtendedProtectionPlan {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  coverage: string[]; // accidental_damage, theft, water_damage
  price: number;
  durationMonths: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== GROCERY & FRESH FOODS =====

export type FreshnessStatus = 'fresh' | 'aging' | 'expired';

export interface ProductFreshness {
  id: string;
  storeId: string;
  productId: string;
  batchId: string;
  receivedDate: Date;
  expiryDate: Date;
  shelfLifeDays: number;
  currentStatus: FreshnessStatus;
  discountApplied?: number;
  autoDiscountEnabled: boolean;
  createdAt: Date;
}

export interface RecipeBundle {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  recipeId: string;
  ingredients: {
    productId: string;
    quantity: number;
    unit: string;
    isOptional: boolean;
  }[];
  totalPrice: number;
  bundlePrice: number;
  savings: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface GrocerySubscription {
  id: string;
  storeId: string;
  customerId: string;
  name: string;
  items: {
    productId: string;
    quantity: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  }[];
  frequency: 'weekly' | 'biweekly' | 'monthly';
  nextDelivery: Date;
  status: 'active' | 'paused' | 'cancelled';
  totalValue: number;
}

// ===== FOOD & RESTAURANT =====

export interface GhostBrand {
  id: string;
  storeId: string;
  name: string;
  cuisine: string;
  logoUrl?: string;
  menuIds: string[];
  deliveryPlatforms: string[]; // jumia, glovo, uber_eats
  isActive: boolean;
  createdAt: Date;
}

export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Reservation {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  date: Date;
  time: string;
  tableId?: string;
  status: ReservationStatus;
  specialRequests?: string;
  dietaryRestrictions: string[];
  arrivedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  noShow: boolean;
  depositAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== REAL ESTATE =====

export interface PropertyVirtualTour {
  id: string;
  propertyId: string;
  isActive: boolean;
  coverImageUrl: string;
  autoRotate: boolean;
  showZoomCtrl: boolean;
  defaultPitch: number;
  defaultYaw: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TourScene {
  id: string;
  tourId: string;
  sceneId: string;
  title: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  positionX: number;
  positionY: number;
  positionZ: number;
}

export type MaintenanceStatus = 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'normal' | 'high' | 'emergency';

export interface MaintenanceRequest {
  id: string;
  storeId: string;
  propertyId: string;
  tenantId: string;
  category: string; // plumbing, electrical, hvac, general
  priority: MaintenancePriority;
  description: string;
  images: string[];
  status: MaintenanceStatus;
  assignedTo?: string;
  completedAt?: Date;
  cost?: number;
  tenantRating?: number;
  tenantFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== AUTOMOTIVE =====

export interface VehicleHistoryReport {
  id: string;
  vehicleId: string;
  vin: string;
  reportProvider: string;
  reportUrl: string;
  accidents: number;
  owners: number;
  serviceRecords: number;
  lastUpdated: Date;
  isClean: boolean;
  redFlags: string[];
  createdAt: Date;
}

export type TradeInStatus = 'pending' | 'reviewed' | 'approved' | 'rejected' | 'accepted';

export interface TradeInValuation {
  id: string;
  storeId: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  vin?: string;
  estimatedValue: number;
  offerPrice?: number;
  status: TradeInStatus;
  vehicleId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadScore {
  id: string;
  storeId: string;
  customerId: string;
  inquiryType: 'test_drive' | 'trade_in' | 'financing';
  score: number;
  factors: {
    visitCount: number;
    timeOnSite: number;
    pagesViewed: number;
    actionsTaken: number;
  };
  lastActivity: Date;
}

// ===== API RESPONSE TYPES =====

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IndustryServiceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
