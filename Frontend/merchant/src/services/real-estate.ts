import { db } from "@/lib/db";
import { Prisma } from "@vayva/db";

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
    const property = await db.property?.create({
      data: {
        storeId,
        title: data.title,
        description: data.description,
        type: data.type,
        purpose: data.purpose,
        price: new Prisma.Decimal(data.price),
        currency: data.currency ?? "NGN",
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        lat: data.lat !== undefined ? new Prisma.Decimal(data.lat) : null,
        lng: data.lng !== undefined ? new Prisma.Decimal(data.lng) : null,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        yearBuilt: data.yearBuilt,
        amenities: data.amenities ?? [],
        images: data.images ?? [],
        videoUrl: data.videoUrl,
        virtualTourUrl: data.virtualTourUrl,
        floorPlanUrl: data.floorPlanUrl,
        agentId: data.agentId,
      },
      include: {
        viewings: true,
        applications: true,
        documents: true,
      },
    });

    return mapProperty(property);
  },

  async getProperties(
    storeId: string,
    options?: {
      status?: Property["status"];
      purpose?: Property["purpose"];
      type?: Property["type"];
      featured?: boolean;
      minPrice?: number;
      maxPrice?: number;
      city?: string;
      state?: string;
    }
  ): Promise<Property[]> {
    const properties = await db.property?.findMany({
      where: {
        storeId,
        status: options?.status as any,
        purpose: options?.purpose,
        type: options?.type,
        featured: options?.featured,
        city: options?.city ? { contains: options.city, mode: "insensitive" } : undefined,
        state: options?.state ? { contains: options.state, mode: "insensitive" } : undefined,
        price: {
          gte: options?.minPrice !== undefined ? new Prisma.Decimal(options.minPrice) : undefined,
          lte: options?.maxPrice !== undefined ? new Prisma.Decimal(options.maxPrice) : undefined,
        },
      },
      include: {
        viewings: {
          orderBy: { scheduledAt: "desc" },
          take: 5,
        },
        applications: {
          where: { status: "pending" },
          take: 5,
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return properties.map(mapProperty) as any;
  },

  async getPropertyById(propertyId: string): Promise<Property | null> {
    const property = await db.property?.findUnique({
      where: { id: propertyId },
      include: {
        viewings: {
          orderBy: { scheduledAt: "desc" },
        },
        applications: {
          orderBy: { createdAt: "desc" },
        },
        documents: true,
      },
    });

    if (!property) return null;
    return mapProperty(property);
  },

  async updateProperty(propertyId: string, data: UpdatePropertyInput): Promise<Property> {
    const updateData: Prisma.PropertyUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.purpose !== undefined) updateData.purpose = data.purpose;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
    if (data.lat !== undefined) updateData.lat = new Prisma.Decimal(data.lat);
    if (data.lng !== undefined) updateData.lng = new Prisma.Decimal(data.lng);
    if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.yearBuilt !== undefined) updateData.yearBuilt = data.yearBuilt;
    if (data.amenities !== undefined) updateData.amenities = data.amenities;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.virtualTourUrl !== undefined) updateData.virtualTourUrl = data.virtualTourUrl;
    if (data.floorPlanUrl !== undefined) updateData.floorPlanUrl = data.floorPlanUrl;
    if ((data as any).status !== undefined) (updateData as any).status = (data as any).status as any;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.agentId !== undefined) updateData.agentId = data.agentId;

    const property = await db.property?.update({
      where: { id: propertyId },
      data: updateData,
      include: {
        viewings: true,
        applications: true,
        documents: true,
      },
    });

    return mapProperty(property);
  },

  async deleteProperty(propertyId: string): Promise<void> {
    await db.property?.delete({
      where: { id: propertyId },
    });
  },

  async markAsSold(propertyId: string): Promise<Property> {
    const property = await db.property?.update({
      where: { id: propertyId },
      data: { status: "sold" },
      include: {
        viewings: true,
        applications: true,
        documents: true,
      },
    });

    return mapProperty(property);
  },

  async markAsRented(propertyId: string): Promise<Property> {
    const property = await db.property?.update({
      where: { id: propertyId },
      data: { status: "rented" },
      include: {
        viewings: true,
        applications: true,
        documents: true,
      },
    });

    return mapProperty(property);
  },

  async featureProperty(propertyId: string): Promise<Property> {
    const property = await db.property?.update({
      where: { id: propertyId },
      data: { featured: true },
      include: {
        viewings: true,
        applications: true,
        documents: true,
      },
    });

    return mapProperty(property);
  },

  // ============================================================================
  // VIEWINGS
  // ============================================================================

  async scheduleViewing(data: CreateViewingInput): Promise<Viewing> {
    const viewing = await db.viewing?.create({
      data: {
        propertyId: data.propertyId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        scheduledAt: data.scheduledAt,
        duration: data.duration ?? 30,
        status: "scheduled",
      },
      include: {
        property: true,
      },
    });

    return mapViewing(viewing);
  },

  async getViewingsByProperty(propertyId: string): Promise<Viewing[]> {
    const viewings = await db.viewing?.findMany({
      where: { propertyId },
      include: { property: true },
      orderBy: { scheduledAt: "desc" },
    });

    return viewings.map(mapViewing) as any;
  },

  async getViewingsByDateRange(storeId: string, startDate: Date, endDate: Date): Promise<Viewing[]> {
    const viewings = await db.viewing?.findMany({
      where: {
        property: { storeId },
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { property: true },
      orderBy: { scheduledAt: "asc" },
    });

    return viewings.map(mapViewing) as any;
  },

  async confirmViewing(viewingId: string): Promise<Viewing> {
    const viewing = await db.viewing?.update({
      where: { id: viewingId },
      data: { status: "confirmed" as any },
      include: { property: true },
    });

    return mapViewing(viewing);
  },

  async completeViewing(viewingId: string, feedback?: { notes?: string; rating?: number }): Promise<Viewing> {
    const viewing = await db.viewing?.update({
      where: { id: viewingId },
      data: {
        status: "completed",
        feedback: feedback?.notes,
        rating: feedback?.rating,
      },
      include: { property: true },
    });

    return mapViewing(viewing);
  },

  async cancelViewing(viewingId: string): Promise<Viewing> {
    const viewing = await db.viewing?.update({
      where: { id: viewingId },
      data: { status: "cancelled" },
      include: { property: true },
    });

    return mapViewing(viewing);
  },

  async markNoShow(viewingId: string): Promise<Viewing> {
    const viewing = await db.viewing?.update({
      where: { id: viewingId },
      data: { status: "no_show" },
      include: { property: true },
    });

    return mapViewing(viewing);
  },

  async deleteViewing(viewingId: string): Promise<void> {
    await db.viewing?.delete({
      where: { id: viewingId },
    });
  },

  // ============================================================================
  // RENTAL APPLICATIONS
  // ============================================================================

  async submitApplication(data: CreateApplicationInput): Promise<RentalApplication> {
    const application = await db.rentalApplication?.create({
      data: {
        propertyId: data.propertyId,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        applicantPhone: data.applicantPhone,
        currentAddress: data.currentAddress,
        employer: data.employer,
        income: data.income !== undefined ? new Prisma.Decimal(data.income) : null,
        references: data.references as unknown as Prisma.InputJsonValue,
        documents: {},
        status: "pending",
      },
      include: { property: true },
    });

    return mapApplication(application);
  },

  async getApplicationsByProperty(propertyId: string): Promise<RentalApplication[]> {
    const applications = await db.rentalApplication?.findMany({
      where: { propertyId },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    return applications.map(mapApplication) as any;
  },

  async getApplicationsByStore(storeId: string, status?: RentalApplication["status"]): Promise<RentalApplication[]> {
    const applications = await db.rentalApplication?.findMany({
      where: {
        property: { storeId },
        status,
      },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    return applications.map(mapApplication) as any;
  },

  async approveApplication(applicationId: string): Promise<RentalApplication> {
    const application = await db.rentalApplication?.update({
      where: { id: applicationId },
      data: { status: "approved" },
      include: { property: true },
    });

    return mapApplication(application);
  },

  async rejectApplication(applicationId: string, notes?: string): Promise<RentalApplication> {
    const application = await db.rentalApplication?.update({
      where: { id: applicationId },
      data: {
        status: "rejected",
        notes: notes ?? undefined,
      },
      include: { property: true },
    });

    return mapApplication(application);
  },

  async updateApplicationDocuments(applicationId: string, documents: Record<string, string>): Promise<RentalApplication> {
    const application = await db.rentalApplication?.update({
      where: { id: applicationId },
      data: {
        documents: documents as unknown as Prisma.InputJsonValue,
      },
      include: { property: true },
    });

    return mapApplication(application);
  },

  async updateScreeningResult(applicationId: string, result: Record<string, unknown>): Promise<RentalApplication> {
    const application = await db.rentalApplication?.update({
      where: { id: applicationId },
      data: {
        screeningResult: result as unknown as Prisma.InputJsonValue,
      },
      include: { property: true },
    });

    return mapApplication(application);
  },

  // ============================================================================
  // PROPERTY DOCUMENTS
  // ============================================================================

  async addDocument(data: CreateDocumentInput): Promise<PropertyDocument> {
    const document = await db.propertyDocument?.create({
      data: {
        propertyId: data.propertyId,
        title: data.title,
        type: data.type,
        url: data.url,
        isPrivate: data.isPrivate ?? false,
      },
      include: { property: true },
    });

    return mapDocument(document);
  },

  async getDocumentsByProperty(propertyId: string): Promise<PropertyDocument[]> {
    const documents = await db.propertyDocument?.findMany({
      where: { propertyId },
      include: { property: true },
      orderBy: { uploadedAt: "desc" },
    });

    return documents.map(mapDocument) as any;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await db.propertyDocument?.delete({
      where: { id: documentId },
    });
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getPropertyAnalytics(storeId: string): Promise<{
    totalProperties: number;
    availableProperties: number;
    soldProperties: number;
    rentedProperties: number;
    pendingProperties: number;
    totalViewings: number;
    upcomingViewings: number;
    pendingApplications: number;
    averagePriceByType: Record<string, number>;
  }> {
    const [
      totalProperties,
      availableProperties,
      soldProperties,
      rentedProperties,
      pendingProperties,
      totalViewings,
      upcomingViewings,
      pendingApplications,
      propertiesByType,
    ] = await Promise.all([
      db.property?.count({ where: { storeId } }),
      db.property?.count({ where: { storeId, status: "available" } }),
      db.property?.count({ where: { storeId, status: "sold" } }),
      db.property?.count({ where: { storeId, status: "rented" } }),
      db.property?.count({ where: { storeId, status: "pending" as any } }),
      db.viewing?.count({ where: { property: { storeId } } }),
      db.viewing?.count({
        where: {
          property: { storeId },
          scheduledAt: { gte: new Date() },
          status: { in: ["scheduled" as any, "confirmed" as any] },
        },
      }),
      db.rentalApplication?.count({
        where: {
          property: { storeId },
          status: "pending",
        },
      }),
      db.property?.groupBy({
        by: ["type"],
        where: { storeId },
        _avg: { price: true },
      }),
    ]);

    const averagePriceByType: Record<string, number> = {};
    for (const item of propertiesByType) {
      averagePriceByType[item.type] = item._avg?.price?.toNumber() ?? 0;
    }

    return {
      totalProperties,
      availableProperties,
      soldProperties,
      rentedProperties,
      pendingProperties,
      totalViewings,
      upcomingViewings,
      pendingApplications,
      averagePriceByType,
    };
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
