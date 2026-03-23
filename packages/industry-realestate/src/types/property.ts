// @ts-nocheck
/**
 * Real Estate Property Types
 * Core domain models for properties and listings
 */

export type PropertyType = 
  | 'single_family' 
  | 'condo' 
  | 'townhouse' 
  | 'multi_family' 
  | 'land' 
  | 'commercial' 
  | 'industrial';

export type PropertyStatus = 
  | 'active' 
  | 'pending' 
  | 'sold' 
  | 'withdrawn' 
  | 'expired' 
  | 'coming_soon';

export type ListingType = 'sale' | 'rent' | 'lease';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  halfBathrooms?: number;
  squareFeet: number;
  lotSize?: number; // in square feet
  yearBuilt?: number;
  stories?: number;
  garageSpaces?: number;
  parkingSpaces?: number;
  hasPool?: boolean;
  hasBasement?: boolean;
  hasFireplace?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  flooring?: string[];
  appliances?: string[];
  amenities?: string[];
}

export interface Property {
  id: string;
  address: Address;
  propertyType: PropertyType;
  features: PropertyFeatures;
  description?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyListing {
  id: string;
  propertyId: string;
  property: Property;
  merchantId: string;
  listingType: ListingType;
  status: PropertyStatus;
  listPrice: number;
  soldPrice?: number;
  listDate: Date;
  soldDate?: Date;
  daysOnMarket: number;
  mlsNumber?: string;
  description?: string;
  agentId?: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  brokerage?: string;
  commission?: number; // percentage
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFilter {
  propertyType?: PropertyType[];
  status?: PropertyStatus[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  city?: string[];
  state?: string[];
  zipCode?: string[];
  listingType?: ListingType;
  agentId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface PropertySearchResult {
  listings: PropertyListing[];
  total: number;
  page: number;
  pageSize: number;
}
