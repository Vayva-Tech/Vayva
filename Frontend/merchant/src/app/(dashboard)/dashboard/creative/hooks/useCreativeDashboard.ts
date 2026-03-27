/**
 * Creative Dashboard Data Hook
 */

import { useQuery } from '@tanstack/react-query';
import { logger } from '@vayva/shared';

export interface CreativeDashboardData {
  stats: {
    activeProjects: number;
    pendingReviews: number;
    totalAssets: number;
    monthlyRevenue: number;
  };
  portfolioProjects: Array<{
    id: string;
    title: string;
    client: string;
    thumbnail: string;
    category: string;
    status: string;
    featured: boolean;
    createdAt: string;
    metrics?: { views: number; likes: number; shares: number };
  }>;
  proofs: Array<{
    id: string;
    projectId: string;
    projectName: string;
    version: number;
    fileUrl: string;
    fileName: string;
    fileType: string;
    submittedAt: string;
    status: string;
    comments: Array<{
      id: string;
      author: string;
      content: string;
      timestamp: string;
      resolved: boolean;
    }>;
  }>;
  assets: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
    tags: string[];
  }>;
  folders: Array<{
    id: string;
    name: string;
    assetCount: number;
  }>;
  colorPalettes: Array<{
    id: string;
    name: string;
    colors: string[];
  }>;
  templates: Array<{
    id: string;
    name: string;
    thumbnail: string;
    category: string;
    dimensions: { width: number; height: number; unit: string };
  }>;
  fontPairs: Array<{
    id: string;
    headingFont: string;
    bodyFont: string;
    preview: string;
  }>;
}

const DEFAULT_DATA: CreativeDashboardData = {
  stats: { activeProjects: 0, pendingReviews: 0, totalAssets: 0, monthlyRevenue: 0 },
  portfolioProjects: [],
  proofs: [],
  assets: [],
  folders: [],
  colorPalettes: [],
  templates: [],
  fontPairs: [],
};

export function useCreativeDashboard() {
  return useQuery({
    queryKey: ['creative-dashboard'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/creative/dashboard', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        return result.data as CreativeDashboardData;
      } catch (error) {
        logger.error('[CREATIVE_DASHBOARD] Fetch failed:', { error });
        return DEFAULT_DATA;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
    staleTime: 5 * 60 * 1000,
  });
}
