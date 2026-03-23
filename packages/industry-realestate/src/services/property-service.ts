// @ts-nocheck
/**
 * Property Service
 * Business logic for property operations
 */

import type { 
  Property, 
  PropertyListing, 
  PropertyFilter, 
  PropertySearchResult,
  Address,
} from '../types';

/**
 * Search properties with filters
 */
export function searchProperties(
  listings: PropertyListing[],
  filter: PropertyFilter
): PropertySearchResult {
  let filtered = listings;

  // Apply filters
  if (filter.propertyType && filter.propertyType.length > 0) {
    filtered = filtered.filter(l => filter.propertyType!.includes(l.property.propertyType));
  }

  if (filter.status && filter.status.length > 0) {
    filtered = filtered.filter(l => filter.status!.includes(l.status));
  }

  if (filter.minPrice !== undefined) {
    filtered = filtered.filter(l => l.listPrice >= filter.minPrice!);
  }

  if (filter.maxPrice !== undefined) {
    filtered = filtered.filter(l => l.listPrice <= filter.maxPrice!);
  }

  if (filter.minBedrooms !== undefined) {
    filtered = filtered.filter(l => l.property.features.bedrooms >= filter.minBedrooms!);
  }

  if (filter.maxBedrooms !== undefined) {
    filtered = filtered.filter(l => l.property.features.bedrooms <= filter.maxBedrooms!);
  }

  if (filter.minBathrooms !== undefined) {
    filtered = filtered.filter(l => l.property.features.bathrooms >= filter.minBathrooms!);
  }

  if (filter.maxBathrooms !== undefined) {
    filtered = filtered.filter(l => l.property.features.bathrooms <= filter.maxBathrooms!);
  }

  if (filter.minSquareFeet !== undefined) {
    filtered = filtered.filter(l => l.property.features.squareFeet >= filter.minSquareFeet!);
  }

  if (filter.maxSquareFeet !== undefined) {
    filtered = filtered.filter(l => l.property.features.squareFeet <= filter.maxSquareFeet!);
  }

  if (filter.city && filter.city.length > 0) {
    filtered = filtered.filter(l => filter.city!.includes(l.property.address.city));
  }

  if (filter.state && filter.state.length > 0) {
    filtered = filtered.filter(l => filter.state!.includes(l.property.address.state));
  }

  if (filter.zipCode && filter.zipCode.length > 0) {
    filtered = filtered.filter(l => filter.zipCode!.includes(l.property.address.zipCode));
  }

  if (filter.listingType) {
    filtered = filtered.filter(l => l.listingType === filter.listingType);
  }

  if (filter.agentId) {
    filtered = filtered.filter(l => l.agentId === filter.agentId);
  }

  if (filter.dateRange) {
    filtered = filtered.filter(l => 
      l.createdAt >= filter.dateRange!.from && 
      l.createdAt <= filter.dateRange!.to
    );
  }

  return {
    listings: filtered,
    total: filtered.length,
    page: 1,
    pageSize: filtered.length,
  };
}

/**
 * Format address for display
 */
export function formatAddress(address: Address): string {
  const parts = [
    address.street,
    address.city,
    `${address.state} ${address.zipCode}`,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = '$'): string {
  return `${currency}${price.toLocaleString()}`;
}

/**
 * Calculate days on market
 */
export function calculateDaysOnMarket(listing: PropertyListing): number {
  if (listing.soldDate) {
    return Math.floor(
      (listing.soldDate.getTime() - listing.listDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  
  return Math.floor(
    (Date.now() - listing.listDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Get property features summary
 */
export function getFeaturesSummary(property: Property): string {
  const features = property.features;
  const parts: string[] = [];

  if (features.bedrooms) parts.push(`${features.bedrooms} bed`);
  if (features.bathrooms) parts.push(`${features.bathrooms} bath`);
  if (features.squareFeet) parts.push(`${features.squareFeet.toLocaleString()} sqft`);

  return parts.join(', ');
}

/**
 * Check if property matches criteria
 */
export function propertyMatchesCriteria(
  listing: PropertyListing,
  criteria: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
  }
): boolean {
  if (criteria.minPrice && listing.listPrice < criteria.minPrice) return false;
  if (criteria.maxPrice && listing.listPrice > criteria.maxPrice) return false;
  if (criteria.bedrooms && listing.property.features.bedrooms < criteria.bedrooms) return false;
  if (criteria.bathrooms && listing.property.features.bathrooms < criteria.bathrooms) return false;
  if (criteria.propertyType && listing.property.propertyType !== criteria.propertyType) return false;

  return true;
}

/**
 * Sort listings by relevance
 */
export function sortByRelevance(
  listings: PropertyListing[],
  criteria: {
    targetPrice?: number;
    targetBedrooms?: number;
    targetBathrooms?: number;
  }
): PropertyListing[] {
  return [...listings].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (criteria.targetPrice) {
      const diffA = Math.abs(a.listPrice - criteria.targetPrice) / criteria.targetPrice;
      const diffB = Math.abs(b.listPrice - criteria.targetPrice) / criteria.targetPrice;
      scoreA += (1 - diffA) * 100;
      scoreB += (1 - diffB) * 100;
    }

    if (criteria.targetBedrooms) {
      scoreA += a.property.features.bedrooms === criteria.targetBedrooms ? 50 : 0;
      scoreB += b.property.features.bedrooms === criteria.targetBedrooms ? 50 : 0;
    }

    if (criteria.targetBathrooms) {
      scoreA += a.property.features.bathrooms === criteria.targetBathrooms ? 50 : 0;
      scoreB += b.property.features.bathrooms === criteria.targetBathrooms ? 50 : 0;
    }

    return scoreB - scoreA;
  });
}
