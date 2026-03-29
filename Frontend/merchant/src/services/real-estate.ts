import { api } from '@/lib/api-client';

// Types for Real Estate models
export interface Property {
  id: string;
  storeId: string;
  title: string;
  description: string;
  type: "house" | "apartment" | "condo" | "townhouse" | "land" | "commercial";
  purpose: "sale" | "rent" | "lease";
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  yearBuilt?: number;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  status: "available" | "sold" | "rented" | "pending" | "off_market";
  featured: boolean;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  viewings?: Viewing[];
  applications?: RentalApplication[];
  documents?: PropertyDocument[];
}

export interface Viewing {
  id: string;
  propertyId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledAt: Date;
  duration: number;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes?: string;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  property?: Property;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  currentAddress: string;
  employer?: string;
  income?: number;
  references?: { name: string; phone: string; relationship: string }[];
  documents: Record<string, string>;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  backgroundCheckId?: string;
  screeningResult?: Record<string, unknown>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  property?: Property;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  title: string;
  type: "title_deed" | "survey_plan" | "certificate" | "contract" | "other";
  url: string;
  isPrivate: boolean;
  uploadedAt: Date;
  property?: Property;
}

// Input types
export interface CreatePropertyInput {
  title: string;
  description: string;
  type: Property["type"];
  purpose: Property["purpose"];
  price: number;
  currency?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  yearBuilt?: number;
  amenities?: string[];
  images?: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  agentId: string;
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  status?: Property["status"];
  featured?: boolean;
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

export interface CreateApplicationInput {
  propertyId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  currentAddress: string;
  employer?: string;
  income?: number;
  references?: { name: string; phone: string; relationship: string }[];
}

export interface CreateDocumentInput {
  propertyId: string;
  title: string;
  type: PropertyDocument["type"];
  url: string;
  isPrivate?: boolean;
}

export const RealEstateService = {
  // ============================================================================
  // PROPERTIES
  // ============================================================================

  async createProperty(storeId: string, data: CreatePropertyInput): Promise<Property> {
    const response = await api.post('/real-estate/properties', {
      storeId,
      ...data,
    });
    return response.data || {};
  },

  async getProperty(propertyId: string): Promise<Property | null> {
    const response = await api.get(`/real-estate/properties/${propertyId}`);
    return response.data || null;
  },

  async getProperties(
    storeId: string,
    options?: GetPropertiesOptions
  ): Promise<{ properties: Property[]; total: number }> {
    const response = await api.get('/real-estate/properties', {
      storeId,
      ...options,
    });
    return response.data || { properties: [], total: 0 };
  },

  async getPropertyById(propertyId: string): Promise<Property | null> {
    const response = await api.get(`/real-estate/properties/${propertyId}`);
    return response.data || null;
  },

  async updateProperty(propertyId: string, data: UpdatePropertyInput): Promise<Property> {
    const response = await api.put(`/real-estate/properties/${propertyId}`, data);
    return response.data || {};
  },

  async deleteProperty(propertyId: string): Promise<void> {
    await api.delete(`/real-estate/properties/${propertyId}`);
  },

  async markAsSold(propertyId: string): Promise<Property> {
    const response = await api.patch(`/real-estate/properties/${propertyId}/status`, { status: 'sold' });
    return response.data || {};
  },

  async markAsRented(propertyId: string): Promise<Property> {
    const response = await api.patch(`/real-estate/properties/${propertyId}/status`, { status: 'rented' });
    return response.data || {};
  },

  async featureProperty(propertyId: string): Promise<Property> {
    const response = await api.patch(`/real-estate/properties/${propertyId}/feature`, { featured: true });
    return response.data || {};
  },

  // ============================================================================
  // VIEWINGS
  // ============================================================================

  async scheduleViewing(data: CreateViewingInput): Promise<Viewing> {
    const response = await api.post('/real-estate/viewings', data);
    return response.data || {};
  },

  async getViewing(viewingId: string): Promise<Viewing | null> {
    const response = await api.get(`/real-estate/viewings/${viewingId}`);
    return response.data || null;
  },

  async getPropertyViewings(propertyId: string): Promise<Viewing[]> {
    const response = await api.get(`/real-estate/properties/${propertyId}/viewings`);
    return response.data || [];
  },

  async confirmViewing(viewingId: string): Promise<Viewing> {
    const response = await api.patch(`/real-estate/viewings/${viewingId}/confirm`);
    return response.data || {};
  },

  async cancelViewing(viewingId: string, reason?: string): Promise<Viewing> {
    const response = await api.patch(`/real-estate/viewings/${viewingId}/cancel`, { reason });
    return response.data || {};
  },

  async completeViewing(viewingId: string, feedback?: string, rating?: number): Promise<Viewing> {
    const response = await api.patch(`/real-estate/viewings/${viewingId}/complete`, {
      feedback,
      rating,
    });
    return response.data || {};
  },

  async noShowViewing(viewingId: string): Promise<Viewing> {
    const response = await api.patch(`/real-estate/viewings/${viewingId}/no-show`);
    return response.data || {};
  },

  // ============================================================================
  // RENTAL APPLICATIONS
  // ============================================================================

  async createRentalApplication(data: CreateRentalApplicationInput): Promise<RentalApplication> {
    const response = await api.post('/real-estate/applications', data);
    return response.data || {};
  },

  async getRentalApplication(applicationId: string): Promise<RentalApplication | null> {
    const response = await api.get(`/real-estate/applications/${applicationId}`);
    return response.data || null;
  },

  async getPropertyApplications(propertyId: string): Promise<RentalApplication[]> {
    const response = await api.get(`/real-estate/properties/${propertyId}/applications`);
    return response.data || [];
  },

  async approveApplication(applicationId: string, notes?: string): Promise<RentalApplication> {
    const response = await api.patch(`/real-estate/applications/${applicationId}/approve`, { notes });
    return response.data || {};
  },

  async rejectApplication(applicationId: string, reason: string): Promise<RentalApplication> {
    const response = await api.patch(`/real-estate/applications/${applicationId}/reject`, { reason });
    return response.data || {};
  },

  async withdrawApplication(applicationId: string): Promise<RentalApplication> {
    const response = await api.patch(`/real-estate/applications/${applicationId}/withdraw`);
    return response.data || {};
  },

  // ============================================================================
  // PROPERTY DOCUMENTS
  // ============================================================================

  async uploadPropertyDocument(propertyId: string, data: UploadDocumentInput): Promise<PropertyDocument> {
    const response = await api.post(`/real-estate/properties/${propertyId}/documents`, data);
    return response.data || {};
  },

  async getPropertyDocuments(propertyId: string): Promise<PropertyDocument[]> {
    const response = await api.get(`/real-estate/properties/${propertyId}/documents`);
    return response.data || [];
  },

  async deletePropertyDocument(documentId: string): Promise<void> {
    await api.delete(`/real-estate/documents/${documentId}`);
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getPropertyAnalytics(storeId: string): Promise<PropertyAnalytics> {
    const response = await api.get(`/real-estate/${storeId}/analytics`);
    return response.data || {};
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapProperty(property: any): Property {
  return {
    id: property.id,
    storeId: property.storeId,
    title: property.title,
    description: property.description,
    type: property.type,
    purpose: property.purpose,
    price: property.price?.toNumber(),
    currency: property.currency,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode ?? undefined,
    lat: property.lat?.toNumber() ?? undefined,
    lng: property.lng?.toNumber() ?? undefined,
    bedrooms: property.bedrooms ?? undefined,
    bathrooms: property.bathrooms ?? undefined,
    area: property.area ?? undefined,
    yearBuilt: property.yearBuilt ?? undefined,
    amenities: property.amenities,
    images: property.images,
    videoUrl: property.videoUrl ?? undefined,
    virtualTourUrl: property.virtualTourUrl ?? undefined,
    floorPlanUrl: property.floorPlanUrl ?? undefined,
    status: (property as any).status,
    featured: property.featured,
    agentId: property.agentId,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    viewings: property.viewings?.map(mapViewing),
    applications: property.applications?.map(mapApplication),
    documents: property.documents?.map(mapDocument),
  };
}

function mapViewing(viewing: any): Viewing {
  return {
    id: viewing.id,
    propertyId: viewing.propertyId,
    clientName: viewing.clientName,
    clientEmail: viewing.clientEmail,
    clientPhone: viewing.clientPhone,
    scheduledAt: viewing.scheduledAt,
    duration: viewing.duration,
    status: (viewing as any).status,
    notes: viewing.notes ?? undefined,
    feedback: viewing.feedback ?? undefined,
    rating: viewing.rating ?? undefined,
    createdAt: viewing.createdAt,
    property: viewing.property ? mapProperty(viewing.property) : undefined,
  };
}

function mapApplication(application: any): RentalApplication {
  return {
    id: application.id,
    propertyId: application.propertyId,
    applicantName: application.applicantName,
    applicantEmail: application.applicantEmail,
    applicantPhone: application.applicantPhone,
    currentAddress: application.currentAddress,
    employer: application.employer ?? undefined,
    income: application.income?.toNumber() ?? undefined,
    references: application.references as unknown as RentalApplication["references"],
    documents: application.documents as unknown as Record<string, string>,
    status: (application as any).status,
    backgroundCheckId: application.backgroundCheckId ?? undefined,
    screeningResult: application.screeningResult as unknown as Record<string, unknown>,
    notes: application.notes ?? undefined,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    property: application.property ? mapProperty(application.property) : undefined,
  };
}

function mapDocument(document: any): PropertyDocument {
  return {
    id: document.id,
    propertyId: document.propertyId,
    title: document.title,
    type: document.type,
    url: document.url,
    isPrivate: document.isPrivate,
    uploadedAt: document.uploadedAt,
    property: document.property ? mapProperty(document.property) : undefined,
  };
}
