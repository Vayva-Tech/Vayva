/**
 * Registry Discovery - Add-on search, filtering, and discovery system
 * 
 * Provides:
 * - Full-text search across add-on metadata
 * - Category and tag filtering
 * - Template compatibility filtering
 * - Sorting options (popularity, rating, recent)
 * - Featured and recommended add-ons
 */

import { AddOnDefinition, AddOnCategory } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface DiscoveryFilter {
  /** Search query for name/description/tags */
  query?: string;
  /** Filter by category */
  category?: AddOnCategory;
  /** Filter by tags (any match) */
  tags?: string[];
  /** Filter by compatible template ID */
  templateId?: string;
  /** Filter by developer */
  developer?: string;
  /** Include only official/verified add-ons */
  officialOnly?: boolean;
  /** Include only installed add-ons */
  installedOnly?: boolean;
  /** Minimum rating (0-5) */
  minRating?: number;
  /** Maximum install count filter */
  maxInstalls?: number;
}

export interface DiscoverySort {
  /** Sort field */
  field: 'name' | 'installCount' | 'rating' | 'createdAt' | 'updatedAt' | 'relevance';
  /** Sort direction */
  direction: 'asc' | 'desc';
}

export interface DiscoveryOptions {
  /** Pagination offset */
  offset: number;
  /** Pagination limit */
  limit: number;
  /** Filters to apply */
  filter?: DiscoveryFilter;
  /** Sort configuration */
  sort?: DiscoverySort;
  /** Include full add-on data or just summaries */
  includeDetails: boolean;
}

export interface DiscoveryResult {
  /** Total matching add-ons (before pagination) */
  total: number;
  /** Paginated add-ons */
  addOns: AddOnDefinition[];
  /** Applied filters for client reference */
  appliedFilters: DiscoveryFilter;
  /** Applied sort for client reference */
  appliedSort: DiscoverySort;
  /** Has more results */
  hasMore: boolean;
}

export interface FeaturedAddOns {
  /** Editor's picks */
  featured: AddOnDefinition[];
  /** New this week */
  newArrivals: AddOnDefinition[];
  /** Most popular */
  trending: AddOnDefinition[];
  /** Recommended for user's template */
  recommended: AddOnDefinition[];
}

// ============================================================================
// Discovery Engine
// ============================================================================

export class DiscoveryEngine {
  private registry: Map<string, AddOnDefinition> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // word -> add-on IDs

  /**
   * Index an add-on for search
   */
  indexAddOn(addOn: AddOnDefinition): void {
    this.registry.set(addOn.id, addOn);
    
    // Build search index
    const searchableText = [
      addOn.name,
      addOn.description,
      addOn.tagline,
      ...addOn.tags,
      addOn.author.name,
    ].join(' ').toLowerCase();

    // Tokenize
    const words = searchableText
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    words.forEach((word) => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word)!.add(addOn.id);
    });
  }

  /**
   * Remove add-on from index
   */
  removeFromIndex(addOnId: string): void {
    this.registry.delete(addOnId);
    this.searchIndex.forEach((ids) => ids.delete(addOnId));
  }

  /**
   * Search and filter add-ons
   */
  discover(options: Partial<DiscoveryOptions> = {}): DiscoveryResult {
    const opts: DiscoveryOptions = {
      offset: 0,
      limit: 20,
      includeDetails: true,
      ...options,
      filter: options.filter || {},
      sort: options.sort || { field: 'installCount', direction: 'desc' },
    };

    let results = Array.from(this.registry.values());

    // Apply filters
    if (opts.filter) {
      results = this.applyFilters(results, opts.filter);
    }

    // Apply search query
    if (opts.filter?.query) {
      results = this.applySearch(results, opts.filter.query);
    }

    // Apply sorting
    results = this.applySort(results, opts.sort!);

    // Calculate pagination
    const total = results.length;
    const paginated = results.slice(opts.offset, opts.offset + opts.limit);

    return {
      total,
      addOns: opts.includeDetails ? paginated : paginated.map(this.summarize),
      appliedFilters: opts.filter || {},
      appliedSort: opts.sort || { field: 'installCount', direction: 'desc' },
      hasMore: opts.offset + opts.limit < total,
    };
  }

  /**
   * Get featured add-ons for homepage/gallery
   */
  getFeatured(
    templateId?: string,
    userAddOns?: string[]
  ): FeaturedAddOns {
    const all = Array.from(this.registry.values());

    // Featured: official, highly rated, popular
    const featured = all
      .filter((a) => a.author.isOfficial && a.stats.rating >= 4)
      .sort((a, b) => b.stats.installCount - a.stats.installCount)
      .slice(0, 6);

    // New arrivals: recently added
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newArrivals = all
      .filter((a) => new Date(a.stats.createdAt).getTime() > oneWeekAgo)
      .sort((a, b) => new Date(b.stats.createdAt).getTime() - new Date(a.stats.createdAt).getTime())
      .slice(0, 6);

    // Trending: rapid install growth (simulate with install count for now)
    const trending = all
      .sort((a, b) => b.stats.installCount - a.stats.installCount)
      .slice(0, 8);

    // Recommended: compatible with user's template
    let recommended: AddOnDefinition[] = [];
    if (templateId) {
      recommended = all
        .filter((a) => 
          a.compatibleTemplates.includes(templateId) ||
          a.compatibleTemplates.includes('*')
        )
        .sort((a, b) => b.stats.rating - a.stats.rating)
        .slice(0, 6);
    }

    return { featured, newArrivals, trending, recommended };
  }

  /**
   * Get related add-ons (similar category/tags)
   */
  getRelated(addOnId: string, limit = 4): AddOnDefinition[] {
    const addOn = this.registry.get(addOnId);
    if (!addOn) return [];

    const all = Array.from(this.registry.values()).filter((a) => a.id !== addOnId);

    // Score by similarity
    const scored = all.map((a) => {
      let score = 0;
      
      // Same category: +3
      if (a.category === addOn.category) score += 3;
      
      // Shared tags: +1 each
      const sharedTags = a.tags.filter((t) => addOn.tags.includes(t));
      score += sharedTags.length;
      
      // Same developer: +2
      if (a.author.name === addOn.author.name) score += 2;
      
      return { addOn: a, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.addOn);
  }

  /**
   * Get categories with counts
   */
  getCategories(): Array<{ category: AddOnCategory; count: number; label: string }> {
    const counts = new Map<AddOnCategory, number>();
    
    this.registry.forEach((addOn) => {
      counts.set(addOn.category, (counts.get(addOn.category) || 0) + 1);
    });

    const categoryLabels: Record<AddOnCategory, string> = {
      ecommerce: 'E-Commerce',
      booking: 'Booking & Scheduling',
      content: 'Content & Media',
      marketing: 'Marketing & Conversion',
      operations: 'Business Operations',
      integration: 'Integrations',
      'industry-specific': 'Industry Specific',
    };

    return Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
        label: categoryLabels[category] || category,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get popular tags
   */
  getPopularTags(limit = 20): Array<{ tag: string; count: number }> {
    const counts = new Map<string, number>();
    
    this.registry.forEach((addOn) => {
      addOn.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get autocomplete suggestions
   */
  getSuggestions(partial: string, limit = 5): string[] {
    const partialLower = partial.toLowerCase();
    const matches: string[] = [];

    this.searchIndex.forEach((ids, word) => {
      if (word.startsWith(partialLower) && matches.length < limit) {
        // Get first matching add-on name for context
        const firstId = Array.from(ids)[0];
        const addOn = this.registry.get(firstId);
        if (addOn) {
          matches.push(addOn.name);
        }
      }
    });

    return [...new Set(matches)].slice(0, limit);
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private applyFilters(
    addOns: AddOnDefinition[],
    filter: DiscoveryFilter
  ): AddOnDefinition[] {
    return addOns.filter((addOn) => {
      // Category filter
      if (filter.category && addOn.category !== filter.category) {
        return false;
      }

      // Tags filter (any match)
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some((t) => addOn.tags.includes(t));
        if (!hasTag) return false;
      }

      // Template compatibility
      if (filter.templateId) {
        const isCompatible =
          addOn.compatibleTemplates.includes(filter.templateId) ||
          addOn.compatibleTemplates.includes('*');
        if (!isCompatible) return false;
      }

      // Developer filter
      if (filter.developer && addOn.author.name !== filter.developer) {
        return false;
      }

      // Official/verified only
      if (filter.officialOnly && !addOn.author.isOfficial) {
        return false;
      }

      // Minimum rating
      if (filter.minRating && addOn.stats.rating < filter.minRating) {
        return false;
      }

      return true;
    });
  }

  private applySearch(
    addOns: AddOnDefinition[],
    query: string
  ): AddOnDefinition[] {
    const queryWords = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    if (queryWords.length === 0) return addOns;

    // Find add-ons matching all words
    const matchingIds = new Set<string>();
    
    queryWords.forEach((word, index) => {
      const ids = this.searchIndex.get(word);
      if (ids) {
        if (index === 0) {
          ids.forEach((id) => matchingIds.add(id));
        } else {
          // Intersection
          for (const id of Array.from(matchingIds)) {
            if (!ids.has(id)) {
              matchingIds.delete(id);
            }
          }
        }
      }
    });

    return addOns.filter((a) => matchingIds.has(a.id));
  }

  private applySort(
    addOns: AddOnDefinition[],
    sort: DiscoverySort
  ): AddOnDefinition[] {
    const sorted = [...addOns];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'installCount':
          comparison = a.stats.installCount - b.stats.installCount;
          break;
        case 'rating':
          comparison = a.stats.rating - b.stats.rating;
          break;
        case 'createdAt':
          comparison = new Date(a.stats.createdAt).getTime() - new Date(b.stats.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.stats.lastUpdated).getTime() - new Date(b.stats.lastUpdated).getTime();
          break;
        case 'relevance':
        default:
          // Default sort by install count
          comparison = a.stats.installCount - b.stats.installCount;
      }

      return sort.direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  private summarize(addOn: AddOnDefinition): AddOnDefinition {
    // Return a minimal version with only essential fields
    // Keep required fields but minimize data transfer
    return {
      ...addOn,
      description: addOn.tagline, // Truncate description
      previewImages: { 
        thumbnail: addOn.previewImages.thumbnail, 
        screenshots: [],
        demoVideo: addOn.previewImages.demoVideo,
      },
      // Keep required fields to satisfy type
      provides: addOn.provides,
      configSchema: addOn.configSchema,
      defaultConfig: addOn.defaultConfig,
    };
  }
}

// ============================================================================
// Static Utilities
// ============================================================================

export function createDiscoveryEngine(): DiscoveryEngine {
  return new DiscoveryEngine();
}

export function filterByCompatibility(
  addOns: AddOnDefinition[],
  templateId: string
): AddOnDefinition[] {
  return addOns.filter(
    (a) => a.compatibleTemplates.includes(templateId) || a.compatibleTemplates.includes('*')
  );
}

export function sortByPopularity(addOns: AddOnDefinition[]): AddOnDefinition[] {
  return [...addOns].sort((a, b) => b.stats.installCount - a.stats.installCount);
}

export function sortByRating(addOns: AddOnDefinition[]): AddOnDefinition[] {
  return [...addOns].sort((a, b) => b.stats.rating - a.stats.rating);
}

export default DiscoveryEngine;
