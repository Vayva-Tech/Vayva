import { 
  TravelProperty, 
  TravelRoom
} from '../types';

export interface SEOOptimizationOptions {
  propertyId: string;
  targetKeywords: string[];
  locationKeywords: string[];
  competitorAnalysis?: boolean;
  localSeo?: boolean;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  robots?: string;
}

export interface SEOData {
  propertyId: string;
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  structuredData: any;
  altTextSuggestions: Array<{ image: string; altText: string }>;
  contentSuggestions: string[];
  seoScore: number; // 0-100
}

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  addWatermark?: boolean;
}

export interface OptimizedImage {
  originalPath: string;
  optimizedPath: string;
  fileSize: number;
  originalSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number; // 0.0 - 1.0
}

export class SEOService {
  private baseUrl: string;
  private cdnUrl: string;

  constructor(baseUrl: string = process.env.BASE_URL || 'https://example.com', cdnUrl: string = process.env.CDN_URL || '') {
    this.baseUrl = baseUrl;
    this.cdnUrl = cdnUrl;
  }

  /**
   * Generate comprehensive SEO data for a property
   */
  async generatePropertySEO(property: TravelProperty, options: SEOOptimizationOptions): Promise<SEOData> {
    // Generate title
    const pageTitle = this.generateTitle(property, options);
    
    // Generate meta description
    const metaDescription = this.generateMetaDescription(property, options);
    
    // Generate keywords
    const keywords = this.generateKeywords(property, options);
    
    // Generate structured data
    const structuredData = this.generateStructuredData(property);
    
    // Generate alt text suggestions
    const altTextSuggestions = this.generateAltTextSuggestions(property);
    
    // Generate content suggestions
    const contentSuggestions = this.generateContentSuggestions(property, options);
    
    // Calculate SEO score
    const seoScore = this.calculateSEOScore(property, pageTitle, metaDescription, keywords);

    return {
      propertyId: property.id,
      pageTitle,
      metaDescription,
      keywords,
      structuredData,
      altTextSuggestions,
      contentSuggestions,
      seoScore
    };
  }

  /**
   * Create dynamic meta tags for different pages
   */
  async createDynamicMetaTags(page: string, context: any): Promise<MetaTags> {
    switch (page) {
      case 'property-detail':
        return this.createPropertyDetailMeta(context.property);
      case 'search-results':
        return this.createSearchResultsMeta(context.filters);
      case 'booking-page':
        return this.createBookingPageMeta(context.property);
      case 'destination-guide':
        return this.createDestinationGuideMeta(context.destination);
      default:
        return this.createDefaultMeta();
    }
  }

  /**
   * Generate XML sitemap
   */
  async generateSitemap(properties: TravelProperty[]): Promise<string> {
    const entries: SitemapEntry[] = [];

    // Homepage
    entries.push({
      url: this.baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    });

    // Property pages
    for (const property of properties) {
      entries.push({
        url: `${this.baseUrl}/properties/${property.id}`,
        lastModified: property.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8
      });

      // Room pages - skipping since rooms aren't in TravelProperty
      // for (const room of property.rooms) {
      //   entries.push({
      //     url: `${this.baseUrl}/properties/${property.id}/rooms/${room.id}`,
      //     lastModified: room.updatedAt,
      //     changeFrequency: 'monthly',
      //     priority: 0.6
      //   });
      // }
    }

    // Static pages
    const staticPages = [
      { path: '/about', priority: 0.7 },
      { path: '/contact', priority: 0.7 },
      { path: '/faq', priority: 0.5 },
      { path: '/terms', priority: 0.3 },
      { path: '/privacy', priority: 0.3 }
    ];

    staticPages.forEach(page => {
      entries.push({
        url: `${this.baseUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page.priority
      });
    });

    // Generate XML
    return this.buildSitemapXML(entries);
  }

  /**
   * Optimize images for web performance
   */
  async optimizeImages(imagePaths: string[], options: ImageOptimizationOptions = {}): Promise<OptimizedImage[]> {
    const optimizations = imagePaths.map(path => this.optimizeSingleImage(path, options));
    return Promise.all(optimizations);
  }

  /**
   * Generate schema.org structured data
   */
  generateStructuredData(property: TravelProperty): any {
    return {
      "@context": "https://schema.org",
      "@type": "Hotel",
      "name": property.name,
      "description": property.description,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.address,
        "addressLocality": property.city,
        "addressCountry": property.country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      },
      "telephone": property.phoneNumber,
      "amenityFeature": property.amenities.map(amenity => ({
        "@type": "LocationFeatureSpecification",
        "name": amenity,
        "value": true
      })),
      "starRating": {
        "@type": "Rating",
        "ratingValue": 4 // Default value since starRating doesn't exist
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": property.rating,
        "reviewCount": property.reviewCount
      }
    };
  }

  /**
   * Analyze competitor SEO performance
   */
  async analyzeCompetitorSEO(property: TravelProperty, competitors: string[]): Promise<any> {
    // Mock implementation - in real scenario, this would use SEO APIs
    const analysis = {
      propertyUrl: `${this.baseUrl}/properties/${property.id}`,
      competitors: competitors.map(url => ({
        url,
        domainAuthority: Math.floor(Math.random() * 50) + 30,
        pageAuthority: Math.floor(Math.random() * 40) + 20,
        backlinks: Math.floor(Math.random() * 1000) + 100,
        keywords: Math.floor(Math.random() * 50) + 10
      })),
      recommendations: [
        "Improve page load speed",
        "Add more high-quality images",
        "Optimize for local keywords",
        "Build more backlinks",
        "Improve mobile responsiveness"
      ]
    };

    return analysis;
  }

  /**
   * Generate content ideas for blog posts
   */
  generateContentIdeas(property: TravelProperty): string[] {
    const location = property.city;
    const ideas = [
      `Top 10 Things to Do in ${location}`,
      `Best Restaurants Near ${property.name}`,
      `A Perfect Weekend Getaway in ${location}`,
      `Hidden Gems in ${location} You Won't Find in Guidebooks`,
      `Seasonal Activities in ${location}`,
      `Local Events and Festivals in ${location}`,
      `Travel Tips for Visiting ${location}`,
      `Family-Friendly Activities in ${location}`,
      `Romantic Getaways in ${location}`,
      `Business Travel Guide to ${location}`
    ];

    return ideas;
  }

  /**
   * Track SEO performance metrics
   */
  async getSEOMetrics(propertyId: string): Promise<any> {
    // Mock implementation
    return {
      organicTraffic: Math.floor(Math.random() * 10000) + 1000,
      keywordRankings: Math.floor(Math.random() * 50) + 10,
      backlinkCount: Math.floor(Math.random() * 200) + 50,
      pageLoadSpeed: (Math.random() * 2 + 1).toFixed(2) + 's',
      mobileFriendliness: Math.floor(Math.random() * 30) + 70 + '%',
      lastUpdated: new Date()
    };
  }

  // Private helper methods
  private generateTitle(property: TravelProperty, options: SEOOptimizationOptions): string {
    const location = `${property.city}, ${property.country}`;
    const starRating = ''; // property.starRating ? `${property.starRating}-star ` : '';
    
    // Primary keywords first
    const primaryKeywords = options.targetKeywords.slice(0, 2).join(' ');
    
    return `${starRating}${property.name} - ${primaryKeywords} in ${location} | Book Now`;
  }

  private generateMetaDescription(property: TravelProperty, options: SEOOptimizationOptions): string {
    const location = `${property.city}, ${property.country}`;
    const amenities = property.amenities.slice(0, 3).join(', ');
    const rating = property.rating ? `Rated ${property.rating}/5 ` : '';
    
    return `${rating}${property.name} in ${location} offers ${amenities} and more. Book your stay with free cancellation and great prices. Perfect for ${options.targetKeywords[0] || 'travelers'}.`;
  }

  private generateKeywords(property: TravelProperty, options: SEOOptimizationOptions): string[] {
    const baseKeywords = [
      property.name,
      property.city,
      property.country,
      ...property.amenities,
      ...options.targetKeywords,
      ...options.locationKeywords
    ];

    // Add property type specific keywords
    const propertyTypeKeywords: Record<string, string[]> = {
      'hotel': ['hotel', 'accommodation', 'lodging'],
      'resort': ['resort', 'vacation', 'holiday'],
      'motel': ['motel', 'budget accommodation'],
      'bnb': ['bed and breakfast', 'bnb', 'homestay'],
      'vacation_rental': ['vacation rental', 'apartment', 'short term rental'],
      'apartment': ['apartment', 'serviced apartment'],
      'villa': ['villa', 'luxury villa'],
      'cabin': ['cabin', 'log cabin', 'mountain cabin'],
      'campground': ['campground', 'camping', 'rv park'],
      'hostel': ['hostel', 'budget accommodation', 'dormitory'],
      'luxury_lodge': ['luxury lodge', 'boutique accommodation'],
      'boutique_hotel': ['boutique hotel', 'design hotel']
    };

    const typeKeywords = propertyTypeKeywords[property.type] || [];
    
    return [...new Set([...baseKeywords, ...typeKeywords])].slice(0, 15);
  }

  private generateAltTextSuggestions(property: TravelProperty): Array<{ image: string; altText: string }> {
    const suggestions = [];
    
    // Exterior images
    suggestions.push({
      image: 'exterior.jpg',
      altText: `Exterior view of ${property.name} hotel in ${property.city}`
    });
    
    // Room images - using placeholder since rooms aren't in TravelProperty
    // property.rooms.slice(0, 3).forEach((room, index) => {
    //   suggestions.push({
    //     image: `room-${index + 1}.jpg`,
    //     altText: `${room.type} room at ${property.name} with ${room.amenities.slice(0, 2).join(' and ')}`
    //   });
    // });
    
    // Amenity images
    const keyAmenities = property.amenities.slice(0, 3);
    keyAmenities.forEach(amenity => {
      suggestions.push({
        image: `${amenity.replace(' ', '-')}.jpg`,
        altText: `${amenity} at ${property.name} in ${property.city}`
      });
    });

    return suggestions;
  }

  private generateContentSuggestions(property: TravelProperty, options: SEOOptimizationOptions): string[] {
    return [
      `Highlight unique features of ${property.name}`,
      `Mention proximity to popular attractions`,
      `Include guest testimonials and ratings`,
      `Describe the local area and neighborhood`,
      `Explain booking policies and flexibility`,
      `Showcase room amenities and facilities`,
      `Mention any awards or certifications`,
      `Describe the check-in/check-out process`
    ];
  }

  private calculateSEOScore(property: TravelProperty, title: string, description: string, keywords: string[]): number {
    let score = 0;
    
    // Title optimization (25 points)
    if (title.length >= 50 && title.length <= 60) score += 15;
    if (keywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()))) score += 10;
    
    // Description optimization (20 points)
    if (description.length >= 150 && description.length <= 160) score += 10;
    if (keywords.some(kw => description.toLowerCase().includes(kw.toLowerCase()))) score += 10;
    
    // Keyword usage (20 points)
    score += Math.min(keywords.length * 2, 20);
    
    // Content quality (15 points)
    if (property.description && property.description.length > 200) score += 10;
    if (property.amenities.length >= 5) score += 5;
    
    // Technical factors (20 points)
    if (property.images && property.images.length >= 5) score += 10;
    if (property.rating >= 4.0) score += 5;
    if (property.reviewCount >= 10) score += 5;
    
    return Math.min(score, 100);
  }

  private createPropertyDetailMeta(property: TravelProperty): MetaTags {
    return {
      title: `${property.name} in ${property.city} - Book Now`,
      description: `Book ${property.name} in ${property.city}. ${property.description?.substring(0, 150)}...`,
      keywords: `${property.name}, ${property.city}, hotel, accommodation`,
      ogTitle: property.name,
      ogDescription: property.description?.substring(0, 200) || '',
      ogImage: property.images?.[0] || '',
      twitterCard: 'summary_large_image',
      canonicalUrl: `${this.baseUrl}/properties/${property.id}`,
      robots: 'index, follow'
    };
  }

  private createSearchResultsMeta(filters: any): MetaTags {
    const location = filters.location || 'Popular Destinations';
    return {
      title: `Hotels in ${location} - Search Results`,
      description: `Find the best hotels in ${location}. Compare prices, read reviews, and book instantly.`,
      keywords: `hotels in ${location}, ${location} accommodation, book hotels`,
      robots: 'noindex, follow'
    };
  }

  private createBookingPageMeta(property: TravelProperty): MetaTags {
    return {
      title: `Book ${property.name} - Instant Confirmation`,
      description: `Book your stay at ${property.name}. Instant confirmation, free cancellation, best price guarantee.`,
      keywords: `book ${property.name}, hotel reservation, instant booking`,
      robots: 'noindex, nofollow'
    };
  }

  private createDestinationGuideMeta(destination: string): MetaTags {
    return {
      title: `Travel Guide to ${destination} - Things to Do & Places to Stay`,
      description: `Complete travel guide to ${destination}. Discover top attractions, best restaurants, and recommended accommodations.`,
      keywords: `${destination} travel guide, things to do in ${destination}, ${destination} hotels`,
      canonicalUrl: `${this.baseUrl}/destinations/${destination.toLowerCase().replace(/\s+/g, '-')}`
    };
  }

  private createDefaultMeta(): MetaTags {
    return {
      title: 'Book Hotels & Accommodations - Best Prices Guaranteed',
      description: 'Find and book hotels, resorts, and vacation rentals worldwide. Best prices, instant confirmation, and free cancellation.',
      keywords: 'hotels, book accommodation, travel, vacation rentals',
      canonicalUrl: this.baseUrl,
      robots: 'index, follow'
    };
  }

  private buildSitemapXML(entries: SitemapEntry[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    const urlEntries = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString().split('T')[0]}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('');
    
    const xmlFooter = '\n</urlset>';
    
    return xmlHeader + urlEntries + xmlFooter;
  }

  private async optimizeSingleImage(path: string, options: ImageOptimizationOptions): Promise<OptimizedImage> {
    // Mock implementation - in real scenario, this would use image processing libraries
    return {
      originalPath: path,
      optimizedPath: path.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
      fileSize: Math.floor(Math.random() * 500000) + 100000,
      originalSize: Math.floor(Math.random() * 1000000) + 200000,
      compressionRatio: parseFloat((Math.random() * 0.4 + 0.3).toFixed(2)),
      dimensions: {
        width: Math.floor(Math.random() * 2000) + 800,
        height: Math.floor(Math.random() * 1500) + 600
      }
    };
  }
}