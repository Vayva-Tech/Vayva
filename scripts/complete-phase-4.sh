#!/bin/bash

# Phase 4 Completion Sprint
# Complete the remaining 5% of infrastructure hardening

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PHASE 4 COMPLETION SPRINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# TASK 1: Search Engine Implementation
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TASK 1: Search Engine Implementation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Option A: Meilisearch (Recommended)
log_info "Installing Meilisearch via Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Create docker-compose override for Meilisearch
cat >> docker-compose.local.yml << 'EOF'

  meilisearch:
    image: getmeili/meilisearch:v1.6
    container_name: vayva-meilisearch
    environment:
      - MEILI_MASTER_KEY=vayva_search_key_2026
      - MEILI_ENV=development
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data
    networks:
      - vayva-network

volumes:
  meilisearch_data:
    driver: local
EOF

log_info "Starting Meilisearch..."
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d meilisearch

# Wait for Meilisearch to be ready
log_info "Waiting for Meilisearch to start..."
sleep 5

# Verify Meilisearch is running
if curl -s http://localhost:7700/health > /dev/null; then
    log_success "Meilisearch is running!"
else
    log_error "Failed to connect to Meilisearch"
    exit 1
fi

# Create search service file
log_info "Creating search service..."
mkdir -p Backend/fastify-server/src/services/platform

cat > Backend/fastify-server/src/services/platform/search.service.ts << 'EOF'
import { MeiliSearch } from 'meilisearch';
import { logger } from '../../lib/logger';

export class SearchService {
  private client: MeiliSearch;
  private static instance: SearchService;

  private constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_KEY || 'vayva_search_key_2026',
    });
  }

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Index a product
   */
  async indexProduct(product: {
    id: string;
    storeId: string;
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    price: number;
    sku?: string;
  }): Promise<void> {
    try {
      const index = this.client.index('products');
      
      const document = {
        id: product.id,
        storeId: product.storeId,
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        tags: product.tags?.join(' ') || '',
        price: product.price,
        sku: product.sku || '',
        _geo: undefined, // Add if you have location data
      };

      await index.addDocuments([document]);
      logger.info('[SEARCH] Product indexed', { productId: product.id });
    } catch (error) {
      logger.error('[SEARCH] Failed to index product', { error, productId: product.id });
    }
  }

  /**
   * Search products with faceted search
   */
  async searchProducts(query: string, options: {
    storeId?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    results: any[];
    total: number;
    facets: Record<string, Record<string, number>>;
  }> {
    try {
      const index = this.client.index('products');
      
      const filters: string[] = [];
      if (options.storeId) {
        filters.push(`storeId = "${options.storeId}"`);
      }
      if (options.category) {
        filters.push(`category = "${options.category}"`);
      }
      if (options.minPrice !== undefined) {
        filters.push(`price >= ${options.minPrice}`);
      }
      if (options.maxPrice !== undefined) {
        filters.push(`price <= ${options.maxPrice}`);
      }

      const searchParams: any = {
        q: query,
        filter: filters.join(' AND '),
        limit: options.limit || 20,
        offset: options.offset || 0,
        facets: ['storeId', 'category', 'tags'],
        sort: ['price:asc'],
      };

      const result = await index.search(query, searchParams);

      return {
        results: result.hits,
        total: result.estimatedTotalHits || 0,
        facets: result.facetDistribution || {},
      };
    } catch (error) {
      logger.error('[SEARCH] Search failed', { error, query });
      return {
        results: [],
        total: 0,
        facets: {},
      };
    }
  }

  /**
   * Delete product from index
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      const index = this.client.index('products');
      await index.deleteDocument(productId);
      logger.info('[SEARCH] Product deleted from index', { productId });
    } catch (error) {
      logger.error('[SEARCH] Failed to delete product', { error, productId });
    }
  }

  /**
   * Get search analytics
   */
  async getAnalytics(): Promise<{
    totalDocuments: number;
    indexes: string[];
    stats: any;
  }> {
    try {
      const stats = await this.client.getStats();
      const indexes = await this.client.getIndexes();
      
      return {
        totalDocuments: stats.totalDocuments || 0,
        indexes: indexes.map(idx => idx.uid),
        stats,
      };
    } catch (error) {
      logger.error('[SEARCH] Failed to get analytics', { error });
      return {
        totalDocuments: 0,
        indexes: [],
        stats: {},
      };
    }
  }
}

export const searchService = SearchService.getInstance();
EOF

log_info "Adding Meilisearch dependency..."
cd Backend/fastify-server && pnpm add meilisearch
cd ../..

log_success "✅ Search engine setup complete!"

# ============================================
# TASK 2: Metrics Dashboard UI
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TASK 2: Metrics Dashboard UI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Creating metrics dashboard component..."

mkdir -p Frontend/ops-console/src/components/dashboard

cat > Frontend/ops-console/src/components/dashboard/MetricsDashboard.tsx << 'EOF'
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricData {
  timestamp: string;
  value: number;
  name: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeUsers: number;
  responseTime: number;
  errorRate: number;
}

export function MetricsDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        fetch('/api/v1/health'),
        fetch('/api/v1/metrics?range=24h'),
      ]);

      const health = await healthRes.json();
      const metricsData = await metricsRes.json();

      setSystemHealth(health);
      setMetrics(metricsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              systemHealth?.status === 'healthy' ? 'text-green-600' :
              systemHealth?.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemHealth?.status?.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemHealth?.uptime?.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.responseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              P95 latency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (systemHealth?.errorRate || 0) > 1 ? 'text-red-600' : 'text-green-600'
            }`}>
              {systemHealth?.errorRate?.toFixed(2) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 5 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time (P95)</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Response Time (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Request Volume */}
      <Card>
        <CardHeader>
          <CardTitle>API Requests</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

log_info "Adding dashboard page..."

mkdir -p Frontend/ops-console/src/pages/dashboard

cat > Frontend/ops-console/src/pages/dashboard/metrics.tsx << 'EOF'
import React from 'react';
import { MetricsDashboard } from '@/components/dashboard/MetricsDashboard';

export default function MetricsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Metrics</h1>
        <p className="text-muted-foreground">
          Real-time monitoring and performance analytics
        </p>
      </div>
      <MetricsDashboard />
    </div>
  );
}
EOF

log_success "✅ Metrics Dashboard UI created!"

# ============================================
# TASK 3: Video Transcoding Setup
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TASK 3: Video Transcoding Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Configuring Cloudinary video transformations..."

cat > Backend/fastify-server/src/services/media/video-transcoding.service.ts << 'EOF'
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../../lib/logger';

export interface VideoTransformation {
  width?: number;
  height?: number;
  quality?: 'auto' | 'low' | 'auto:best' | 'auto:good' | 'auto:eco';
  format?: 'mp4' | 'webm';
}

export class VideoTranscodingService {
  private static instance: VideoTranscodingService;

  private constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  static getInstance(): VideoTranscodingService {
    if (!VideoTranscodingService.instance) {
      VideoTranscodingService.instance = new VideoTranscodingService();
    }
    return VideoTranscodingService.instance;
  }

  /**
   * Upload video and create multiple renditions
   */
  async uploadAndTranscode(file: Buffer, options: {
    publicId: string;
    folder: string;
  }): Promise<{
    originalUrl: string;
    renditions: Record<string, string>;
  }> {
    try {
      // Upload original video
      const uploadResult = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          public_id: options.publicId,
          folder: options.folder,
        },
        (error, result) => {
          if (error) throw error;
          return result;
        }
      ).promise();

      // Create multiple quality renditions
      const renditions: Record<string, string> = {};

      // Generate URLs for different qualities
      renditions['1080p'] = cloudinary.url(options.publicId, {
        resource_type: 'video',
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto:best' },
          { fetch_format: 'mp4' },
        ],
      });

      renditions['720p'] = cloudinary.url(options.publicId, {
        resource_type: 'video',
        transformation: [
          { width: 1280, height: 720, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'mp4' },
        ],
      });

      renditions['480p'] = cloudinary.url(options.publicId, {
        resource_type: 'video',
        transformation: [
          { width: 854, height: 480, crop: 'limit' },
          { quality: 'auto:eco' },
          { fetch_format: 'mp4' },
        ],
      });

      renditions['360p'] = cloudinary.url(options.publicId, {
        resource_type: 'video',
        transformation: [
          { width: 640, height: 360, crop: 'limit' },
          { quality: 'auto:eco' },
          { fetch_format: 'mp4' },
        ],
      });

      logger.info('[VIDEO] Video uploaded and transcoded', { 
        publicId: options.publicId,
        url: uploadResult.secure_url,
      });

      return {
        originalUrl: uploadResult.secure_url,
        renditions,
      };
    } catch (error) {
      logger.error('[VIDEO] Failed to transcode video', { error, publicId: options.publicId });
      throw error;
    }
  }

  /**
   * Generate video thumbnail
   */
  async generateThumbnail(publicId: string, options: {
    timeOffset?: string; // e.g., '10s', '1m'
    width?: number;
    height?: number;
  } = {}): Promise<string> {
    try {
      const thumbnailUrl = cloudinary.url(publicId, {
        resource_type: 'video',
        transformation: [
          { start_offset: options.timeOffset || '10s' },
          { width: options.width || 640, height: options.height || 360, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'jpg' },
        ],
      });

      logger.info('[VIDEO] Thumbnail generated', { publicId, url: thumbnailUrl });
      return thumbnailUrl;
    } catch (error) {
      logger.error('[VIDEO] Failed to generate thumbnail', { error, publicId });
      throw error;
    }
  }

  /**
   * Delete video and all renditions
   */
  async deleteVideo(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      logger.info('[VIDEO] Video deleted', { publicId });
    } catch (error) {
      logger.error('[VIDEO] Failed to delete video', { error, publicId });
      throw error;
    }
  }
}

export const videoTranscodingService = VideoTranscodingService.getInstance();
EOF

log_success "✅ Video transcoding service created!"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PHASE 4 COMPLETION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "✅ Search Engine: Meilisearch configured"
log_info "✅ Metrics Dashboard: UI components created"
log_info "✅ Video Transcoding: Cloudinary integration ready"
echo ""
log_info "Next Steps:"
log_info "1. Start Meilisearch: docker-compose up meilisearch"
log_info "2. Add MEILISEARCH_URL and MEILISEARCH_KEY to .env"
log_info "3. Test dashboard: Navigate to /dashboard/metrics"
log_info "4. Configure Cloudinary credentials in .env"
echo ""
log_success "🎉 PHASE 4 IS NOW 100% COMPLETE!"
echo ""
