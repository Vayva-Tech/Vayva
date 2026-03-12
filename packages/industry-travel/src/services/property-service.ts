import type { 
  TravelProperty, 
  TravelRoom, 
  SearchFilters, 
  DateRange 
} from '../types';
import { PropertyType, RoomType } from '../types';

export interface CreatePropertyParams {
  tenantId: string;
  name: string;
  type: string; // PropertyType
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  email?: string;
  website?: string;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  images?: string[];
}

export interface UpdatePropertyParams extends Partial<CreatePropertyParams> {
  id: string;
}

export interface PropertyFilters {
  tenantId?: string;
  type?: string; // PropertyType
  city?: string;
  country?: string;
  minRating?: number;
  maxRating?: number;
  amenities?: string[];
  isActive?: boolean;
  isPublished?: boolean;
  hasAvailability?: { 
    checkInDate: Date; 
    checkOutDate: Date; 
    guests: number;
  };
}

/**
 * TravelPropertyService - Manages travel properties, rooms, and related operations
 */
export class TravelPropertyService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Create a new travel property
   */
  async createProperty(data: CreatePropertyParams): Promise<TravelProperty> {
    const now = new Date();
    const property: TravelProperty = {
      id: `prop_${Date.now()}`,
      tenantId: data.tenantId,
      name: data.name,
      type: data.type as PropertyType,
      description: data.description,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      phoneNumber: data.phoneNumber,
      email: data.email,
      website: data.website,
      amenities: data.amenities || [],
      rating: 0,
      reviewCount: 0,
      checkInTime: data.checkInTime || '14:00',
      checkOutTime: data.checkOutTime || '11:00',
      cancellationPolicy: data.cancellationPolicy,
      isPublished: false,
      isActive: true,
      images: data.images || [],
      createdAt: now,
      updatedAt: now,
    };

    await this.db.travelProperty.create({ data: property });
    return property;
  }

  /**
   * Get properties with various filters
   */
  async getProperties(filters: PropertyFilters = {}): Promise<TravelProperty[]> {
    const where: Record<string, unknown> = {};

    if (filters.tenantId) where['tenantId'] = filters.tenantId;
    if (filters.type) where['type'] = filters.type;
    if (filters.city) where['city'] = { contains: filters.city, mode: 'insensitive' };
    if (filters.country) where['country'] = filters.country;
    if (filters.isActive !== undefined) where['isActive'] = filters.isActive;
    if (filters.isPublished !== undefined) where['isPublished'] = filters.isPublished;
    if (filters.minRating !== undefined) where['rating'] = { gte: filters.minRating };
    if (filters.maxRating !== undefined) where['rating'] = { lte: filters.maxRating };
    if (filters.amenities && filters.amenities.length > 0) {
      where['amenities'] = { hasEvery: filters.amenities };
    }

    // Handle availability-based filtering
    if (filters.hasAvailability) {
      const { checkInDate, checkOutDate, guests } = filters.hasAvailability;
      
      // This would typically involve a more complex query joining with availability table
      // For now, we'll return properties and let the caller filter by availability
      const properties = await this.db.travelProperty.findMany({ 
        where,
        include: {
          rooms: {
            where: { 
              isAvailable: true,
              capacity: { gte: guests }
            }
          }
        },
        orderBy: { rating: 'desc' }
      });

      // Further filter by actual availability
      const availableProperties = [];
      for (const prop of properties) {
        const isAvailable = await this.checkPropertyAvailability(
          prop.id, 
          { startDate: checkInDate, endDate: checkOutDate }
        );
        if (isAvailable) {
          availableProperties.push(prop);
        }
      }
      
      return availableProperties;
    }

    return this.db.travelProperty.findMany({ 
      where, 
      orderBy: { rating: 'desc' }
    }) as Promise<TravelProperty[]>;
  }

  /**
   * Get a single property by ID
   */
  async getPropertyById(id: string): Promise<TravelProperty | null> {
    return this.db.travelProperty.findUnique({
      where: { id },
      include: {
        rooms: {
          where: { isAvailable: true },
          orderBy: { basePrice: 'asc' }
        },
        reviews: {
          where: { status: 'approved' },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    }) as Promise<TravelProperty | null>;
  }

  /**
   * Update a property
   */
  async updateProperty(id: string, data: UpdatePropertyParams): Promise<TravelProperty> {
    const updateData: Record<string, any> = { ...data, updatedAt: new Date() };
    delete (updateData as any).id; // Remove id from update data
    
    return this.db.travelProperty.update({
      where: { id },
      data: updateData
    }) as Promise<TravelProperty>;
  }

  /**
   * Delete a property (soft delete by setting inactive)
   */
  async deleteProperty(id: string): Promise<void> {
    await this.db.travelProperty.update({
      where: { id },
      data: { 
        isActive: false, 
        isPublished: false,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Publish/unpublish a property
   */
  async setPropertyPublished(id: string, published: boolean): Promise<TravelProperty> {
    return this.db.travelProperty.update({
      where: { id },
      data: { 
        isPublished: published,
        updatedAt: new Date()
      }
    }) as Promise<TravelProperty>;
  }

  /**
   * Check if a property has availability for given dates
   */
  async checkPropertyAvailability(
    propertyId: string, 
    dateRange: DateRange
  ): Promise<boolean> {
    const { startDate, endDate } = dateRange;
    
    // Get all rooms for this property
    const rooms = await this.db.travelRoom.findMany({
      where: { 
        propertyId,
        isAvailable: true
      },
      include: {
        availability: {
          where: {
            date: {
              gte: startDate,
              lt: endDate
            },
            isAvailable: true
          }
        }
      }
    });

    if (rooms.length === 0) return false;

    // Check if any room is available for all dates in range
    const dateCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (const room of rooms) {
      if (room.availability.length === dateCount) {
        return true;
      }
    }

    return false;
  }

  /**
   * Search properties with advanced filtering
   */
  async searchProperties(filters: SearchFilters): Promise<TravelProperty[]> {
    const propertyFilters: PropertyFilters = {
      city: filters.location,
      type: filters.propertyTypes ? filters.propertyTypes[0] : undefined,
      minRating: 0,
      isActive: true,
      isPublished: true
    };

    if (filters.amenities && filters.amenities.length > 0) {
      propertyFilters.amenities = filters.amenities;
    }

    if (filters.checkInDate && filters.checkOutDate) {
      propertyFilters.hasAvailability = {
        checkInDate: filters.checkInDate,
        checkOutDate: filters.checkOutDate,
        guests: filters.guests || 1
      };
    }

    const properties = await this.getProperties(propertyFilters);
    
    // Apply price filtering and sorting
    let filtered = [...properties];

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter(prop => {
        // This would typically join with rooms to get min/max prices
        // For simplicity, we'll assume properties have a price range
        return true; // Placeholder - implement actual price filtering
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => {
          // Sort by minimum room price
          return 0; // Placeholder
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          // Sort by maximum room price
          return 0; // Placeholder
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        // Would require geolocation calculation
        break;
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    
    return filtered.slice(startIndex, startIndex + limit);
  }

  /**
   * Get featured properties for homepage/carousel
   */
  async getFeaturedProperties(tenantId: string, limit: number = 6): Promise<TravelProperty[]> {
    return this.db.travelProperty.findMany({
      where: { 
        tenantId, 
        isPublished: true, 
        isActive: true,
        rating: { gte: 4.0 }
      },
      take: limit,
      orderBy: { rating: 'desc' },
      include: {
        rooms: {
          take: 1,
          orderBy: { basePrice: 'asc' }
        }
      }
    }) as Promise<TravelProperty[]>;
  }

  /**
   * Calculate average rating for a property
   */
  async updatePropertyRating(propertyId: string): Promise<number> {
    const reviews = await this.db.travelReview.findMany({
      where: { 
        propertyId, 
        status: 'approved' 
      },
      select: { rating: true }
    });

    if (reviews.length === 0) return 0;

    const avgRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length;
    const roundedRating = Math.round(avgRating * 10) / 10; // Round to 1 decimal place

    await this.db.travelProperty.update({
      where: { id: propertyId },
      data: { 
        rating: roundedRating,
        reviewCount: reviews.length,
        updatedAt: new Date()
      }
    });

    return roundedRating;
  }
}