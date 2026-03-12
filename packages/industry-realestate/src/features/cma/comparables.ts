/**
 * Comparable Property Service
 * Finds and ranks comparable properties for CMA
 */

import type { 
  CMAConfig, 
  CompProperty, 
  Property, 
  PropertyListing,
  CMADataSource 
} from '../../types';

export interface CompSearchCriteria {
  propertyId: string;
  radius: number; // miles
  timeframe: number; // days
  propertyTypes: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface CompSearchResult {
  comparables: CompProperty[];
  totalFound: number;
  filteredCount: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Filter comparables by distance from subject property
 */
export function filterByDistance(
  comps: CompProperty[],
  maxDistance: number
): CompProperty[] {
  return comps.filter(comp => comp.distance <= maxDistance);
}

/**
 * Filter comparables by sale date
 */
export function filterByTimeframe(
  comps: CompProperty[],
  maxDays: number
): CompProperty[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);
  
  return comps.filter(comp => new Date(comp.soldDate) >= cutoffDate);
}

/**
 * Filter comparables by property type
 */
export function filterByPropertyType(
  comps: CompProperty[],
  propertyTypes: string[]
): CompProperty[] {
  return comps.filter(comp => propertyTypes.includes(comp.propertyType));
}

/**
 * Filter comparables by price range
 */
export function filterByPriceRange(
  comps: CompProperty[],
  minPrice?: number,
  maxPrice?: number
): CompProperty[] {
  return comps.filter(comp => {
    if (minPrice && comp.soldPrice < minPrice) return false;
    if (maxPrice && comp.soldPrice > maxPrice) return false;
    return true;
  });
}

/**
 * Detect and remove outlier comparables using IQR method
 */
export function removeOutliers(
  comps: CompProperty[],
  field: 'soldPrice' | 'pricePerSqft' = 'soldPrice'
): CompProperty[] {
  if (comps.length < 4) return comps;

  const values = comps.map(c => 
    field === 'soldPrice' ? c.soldPrice : c.soldPrice / c.squareFeet
  ).sort((a, b) => a - b);

  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);
  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return comps.filter(comp => {
    const value = field === 'soldPrice' ? comp.soldPrice : comp.soldPrice / comp.squareFeet;
    return value >= lowerBound && value <= upperBound;
  });
}

/**
 * Rank comparables by relevance to subject property
 */
export function rankComparables(
  comps: CompProperty[],
  subject: Property
): CompProperty[] {
  return [...comps].sort((a, b) => {
    // Primary: Similarity score (higher is better)
    if (b.similarityScore !== a.similarityScore) {
      return b.similarityScore - a.similarityScore;
    }

    // Secondary: Distance (closer is better)
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    // Tertiary: Recency (more recent is better)
    return new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime();
  });
}

/**
 * Select the best comparables from a pool
 */
export function selectBestComparables(
  comps: CompProperty[],
  minComps: number,
  maxComps: number
): CompProperty[] {
  // Remove outliers first
  const withoutOutliers = removeOutliers(comps);

  // If we don't have enough after removing outliers, use original list
  const candidates = withoutOutliers.length >= minComps ? withoutOutliers : comps;

  // Return top comps up to maxComps
  return candidates.slice(0, maxComps);
}

/**
 * Mock function to fetch comparables from MLS
 * In production, this would integrate with actual MLS APIs
 */
export async function fetchMLSComparables(
  subject: Property,
  config: CMAConfig
): Promise<CompProperty[]> {
  // This is a placeholder for actual MLS integration
  // In production, this would call MLS APIs
  return [];
}

/**
 * Mock function to fetch comparables from public records
 */
export async function fetchPublicRecordComparables(
  subject: Property,
  config: CMAConfig
): Promise<CompProperty[]> {
  // This is a placeholder for actual public records integration
  return [];
}

/**
 * Mock function to fetch comparables from Vayva marketplace
 */
export async function fetchVayvaComparables(
  subject: Property,
  listings: PropertyListing[],
  config: CMAConfig
): Promise<CompProperty[]> {
  const comps: CompProperty[] = [];

  for (const listing of listings) {
    // Skip the subject property itself
    if (listing.propertyId === subject.id) continue;

    // Skip if not sold
    if (!listing.soldPrice || !listing.soldDate) continue;

    // Calculate distance
    const distance = calculateDistance(
      subject.address.latitude || 0,
      subject.address.longitude || 0,
      listing.property.address.latitude || 0,
      listing.property.address.longitude || 0
    );

    // Skip if outside radius
    if (distance > config.compRadius) continue;

    const comp: CompProperty = {
      id: `comp-${listing.id}`,
      listingId: listing.id,
      address: listing.property.address,
      propertyType: listing.property.propertyType,
      listPrice: listing.listPrice,
      soldPrice: listing.soldPrice,
      soldDate: listing.soldDate,
      bedrooms: listing.property.features.bedrooms,
      bathrooms: listing.property.features.bathrooms,
      squareFeet: listing.property.features.squareFeet,
      lotSize: listing.property.features.lotSize,
      yearBuilt: listing.property.features.yearBuilt,
      distance,
      daysOnMarket: listing.daysOnMarket,
      dataSource: 'vayva_marketplace',
      adjustments: [],
      adjustedPrice: listing.soldPrice,
      similarityScore: 0, // Will be calculated later
    };

    comps.push(comp);
  }

  return comps;
}

/**
 * Fetch comparables from all configured data sources
 */
export async function fetchAllComparables(
  subject: Property,
  listings: PropertyListing[],
  config: CMAConfig
): Promise<CompProperty[]> {
  const allComps: CompProperty[] = [];

  for (const source of config.dataSources) {
    let comps: CompProperty[] = [];

    switch (source) {
      case 'mls':
        comps = await fetchMLSComparables(subject, config);
        break;
      case 'public_records':
        comps = await fetchPublicRecordComparables(subject, config);
        break;
      case 'vayva_marketplace':
        comps = await fetchVayvaComparables(subject, listings, config);
        break;
      case 'manual':
        // Manual comps would be passed in separately
        break;
    }

    allComps.push(...comps);
  }

  return allComps;
}

/**
 * Validate comparable pool meets minimum requirements
 */
export function validateComparablePool(
  comps: CompProperty[],
  minComps: number
): { valid: boolean; message?: string } {
  if (comps.length < minComps) {
    return {
      valid: false,
      message: `Insufficient comparables found. Need at least ${minComps}, found ${comps.length}.`,
    };
  }

  return { valid: true };
}
