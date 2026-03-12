export type PropertyType = 'house' | 'apartment' | 'condo' | 'townhouse' | 'commercial' | 'land';
export type PropertyPurpose = 'sale' | 'rent' | 'lease';
export type PropertyStatus = 'available' | 'under_contract' | 'sold' | 'rented' | 'off_market';
export type ViewingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface Property {
  id: string;
  storeId: string;
  title: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  coordinates: { lat: number; lng: number } | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  yearBuilt: number | null;
  amenities: string[];
  images: string[];
  videoUrl: string | null;
  virtualTourUrl: string | null;
  floorPlanUrl: string | null;
  status: PropertyStatus;
  featured: boolean;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  agentName?: string;
  viewingsCount?: number;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  yearBuilt?: number;
  amenities?: string[];
  images?: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  featured?: boolean;
  agentId: string;
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  type?: PropertyType;
  purpose?: PropertyPurpose;
  price?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number } | null;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  yearBuilt?: number;
  amenities?: string[];
  images?: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  status?: PropertyStatus;
  featured?: boolean;
  agentId?: string;
}

export interface Viewing {
  id: string;
  propertyId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledAt: Date;
  duration: number;
  status: ViewingStatus;
  notes: string | null;
  feedback: string | null;
  rating: number | null;
  createdAt: Date;
  propertyTitle?: string;
  propertyAddress?: string;
}

export interface CreateViewingInput {
  propertyId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledAt: Date;
  duration?: number;
  notes?: string;
}

export interface UpdateViewingInput {
  scheduledAt?: Date;
  duration?: number;
  status?: ViewingStatus;
  notes?: string;
  feedback?: string;
  rating?: number;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  currentAddress: string;
  employer: string | null;
  income: number | null;
  references: Array<{
    name: string;
    phone: string;
    relationship: string;
  }> | null;
  documents: {
    idDocument: string;
    proofOfIncome?: string;
    bankStatement?: string;
    employmentLetter?: string;
  };
  status: ApplicationStatus;
  backgroundCheckId: string | null;
  screeningResult: {
    creditScore?: number;
    criminalRecord?: boolean;
    evictionHistory?: boolean;
    recommendation?: 'approve' | 'reject' | 'review';
    notes?: string;
  } | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  propertyTitle?: string;
}

export interface CreateRentalApplicationInput {
  propertyId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  currentAddress: string;
  employer?: string;
  income?: number;
  references?: Array<{ name: string; phone: string; relationship: string }>;
  documents: {
    idDocument: string;
    proofOfIncome?: string;
    bankStatement?: string;
    employmentLetter?: string;
  };
}

export interface UpdateRentalApplicationInput {
  status?: ApplicationStatus;
  notes?: string;
  screeningResult?: {
    creditScore?: number;
    criminalRecord?: boolean;
    evictionHistory?: boolean;
    recommendation?: 'approve' | 'reject' | 'review';
    notes?: string;
  };
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  title: string;
  type: 'title_deed' | 'survey_plan' | 'certificate' | 'contract' | 'tax_document' | 'other';
  url: string;
  isPrivate: boolean;
  uploadedAt: Date;
}

export interface PropertyAnalytics {
  totalProperties: number;
  byType: Record<PropertyType, number>;
  byPurpose: Record<PropertyPurpose, number>;
  byStatus: Record<PropertyStatus, number>;
  averageDaysOnMarket: number;
  totalViewings: number;
  viewingsThisMonth: number;
  conversionRate: number;
  totalApplications: number;
  pendingApplications: number;
  topPerforming: Property[];
  priceRanges: Array<{
    min: number;
    max: number;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'viewing' | 'application' | 'sale' | 'rental';
    date: Date;
    propertyTitle: string;
    details: string;
  }>;
}

export interface PropertyFilters {
  type?: PropertyType;
  purpose?: PropertyPurpose;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  bedrooms?: number;
  featured?: boolean;
}
