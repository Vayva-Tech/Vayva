'use client';

/**
 * Add-On Gallery Page
 * 
 * Browse, search, and install add-ons from the Vayva marketplace.
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Plus, Check, Star, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ADDON_CATEGORIES, type AddOnDefinition, type AddOnCategory, type InstalledAddOn } from '@vayva/addons/types';
import { AddOnDetailModal } from './components/add-on-detail-modal';
import { InstallAddOnDialog } from './components/install-add-on-dialog';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { logger } from '@vayva/shared';

// Get store info from session/context
function useStoreInfo() {
  const { merchant } = useAuth();
  const { store } = useStore();
  
  // Use real data from contexts, fallback to demo data only in development
  const storeId = merchant?.storeId || store?.id || (process.env.NODE_ENV === 'development' ? 'demo-store' : undefined);
  const currentTemplateId = store?.templateId || 'default';
  
  if (!storeId) {
    logger.warn('[ADDONS_PAGE] Store ID not available');
  }
  
  return {
    storeId: storeId || 'demo-store',
    currentTemplateId
  };
}

interface GalleryFilters {
  search: string;
  category: AddOnCategory | 'all';
  price: 'all' | 'free' | 'paid';
  installed: 'all' | 'installed' | 'not-installed';
  sortBy: 'popular' | 'rating' | 'newest' | 'name';
}

export default function AddOnGallery() {
  const { storeId, currentTemplateId } = useStoreInfo();
  const [filters, setFilters] = useState<GalleryFilters>({
    search: '',
    category: 'all',
    price: 'all',
    installed: 'all',
    sortBy: 'popular',
  });
  
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnDefinition | null>(null);
  const [installingAddOn, setInstallingAddOn] = useState<AddOnDefinition | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all add-ons
  const { data: addOns, isLoading: isLoadingAddOns } = useQuery({
    queryKey: ['addons', 'gallery'],
    queryFn: async () => {
      const res = await fetch('/api/addons');
      if (!res.ok) throw new Error('Failed to fetch add-ons');
      return res.json() as Promise<AddOnDefinition[]>;
    },
  });

  // Fetch installed add-ons
  const { data: installedAddOns, isLoading: isLoadingInstalled } = useQuery({
    queryKey: ['addons', 'installed', storeId],
    queryFn: async () => {
      const res = await fetch(`/api/addons/installed?storeId=${storeId}`);
      if (!res.ok) throw new Error('Failed to fetch installed add-ons');
      return res.json() as Promise<InstalledAddOn[]>;
    },
  });

  // Filter and sort add-ons
  const filteredAddOns = useMemo(() => {
    if (!addOns) return [];

    let result = [...addOns];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(addon =>
        addon.name.toLowerCase().includes(search) ||
        addon.description.toLowerCase().includes(search) ||
        addon.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(addon => addon.category === filters.category);
    }

    // Price filter
    if (filters.price === 'free') {
      result = result.filter(addon => addon.pricing?.type === 'free');
    } else if (filters.price === 'paid') {
      result = result.filter(addon => addon.pricing?.type !== 'free');
    }

    // Installed filter
    const installedIds = new Set(installedAddOns?.map(a => a.id) || []);
    if (filters.installed === 'installed') {
      result = result.filter(addon => installedIds.has(addon.id));
    } else if (filters.installed === 'not-installed') {
      result = result.filter(addon => !installedIds.has(addon.id));
    }

    // Compatibility filter (only show add-ons that work with current template)
    result = result.filter(addon => 
      addon.compatibleTemplates.includes(currentTemplateId) ||
      addon.compatibleTemplates.includes('*')
    );

    // Sort
    switch (filters.sortBy) {
      case 'popular':
        result.sort((a, b) => (b.stats?.installCount ?? 0) - (a.stats?.installCount ?? 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.stats?.rating ?? 0) - (a.stats?.rating ?? 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.stats?.createdAt ?? 0).getTime() - new Date(a.stats?.createdAt ?? 0).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [addOns, installedAddOns, filters, currentTemplateId]);

  // Group by category for tabs
  const addOnsByCategory = useMemo(() => {
    const grouped: Record<string, AddOnDefinition[]> = {
      all: filteredAddOns,
    };
    
    ADDON_CATEGORIES.forEach(cat => {
      grouped[cat.slug] = filteredAddOns.filter(a => a.category === cat.slug);
    });
    
    return grouped;
  }, [filteredAddOns]);

  const isInstalled = (addonId: string) => {
    return installedAddOns?.some(a => a.id === addonId && a.status === 'active') || false;
  };

  const handleInstall = (addon: AddOnDefinition) => {
    setInstallingAddOn(addon);
  };

  const handleInstallComplete = () => {
    setInstallingAddOn(null);
    toast.success('Add-on installed successfully!');
  };

  if (isLoadingAddOns || isLoadingInstalled) {
    return <GallerySkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add-On Gallery</h1>
        <p className="text-gray-500">
          Supercharge your store with powerful features. Browse {addOns?.length || 0}+ add-ons.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search add-ons..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-md border bg-white"
            value={filters.price}
            onChange={(e) => setFilters(f => ({ ...f, price: e.target.value as any }))}
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          
          <select
            className="px-3 py-2 rounded-md border bg-white"
            value={filters.installed}
            onChange={(e) => setFilters(f => ({ ...f, installed: e.target.value as any }))}
          >
            <option value="all">All Status</option>
            <option value="installed">Installed</option>
            <option value="not-installed">Not Installed</option>
          </select>
          
          <select
            className="px-3 py-2 rounded-md border bg-white"
            value={filters.sortBy}
            onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">
            All ({addOnsByCategory.all?.length || 0})
          </TabsTrigger>
          {ADDON_CATEGORIES.map(cat => (
            <TabsTrigger key={cat.slug} value={cat.slug}>
              {cat.label} ({addOnsByCategory[cat.slug]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {['all', ...ADDON_CATEGORIES.map(c => c.slug)].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {addOnsByCategory[tab]?.map((addon) => (
                  <AddOnCard
                    key={addon.id}
                    addon={addon}
                    isInstalled={isInstalled(addon.id)}
                    onView={() => setSelectedAddOn(addon)}
                    onInstall={() => handleInstall(addon)}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {addOnsByCategory[tab]?.length === 0 && (
              <EmptyState
                search={filters.search}
                category={tab === 'all' ? null : tab}
                onClear={() => setFilters({ ...filters, search: '', category: 'all', price: 'all' })}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Modal */}
      {selectedAddOn && (
        <AddOnDetailModal
          addon={selectedAddOn}
          isOpen={!!selectedAddOn}
          onClose={() => setSelectedAddOn(null)}
          isInstalled={isInstalled(selectedAddOn.id)}
          onInstall={() => {
            setSelectedAddOn(null);
            handleInstall(selectedAddOn);
          }}
          storeId={storeId}
        />
      )}

      {/* Install Dialog */}
      {installingAddOn && (
        <InstallAddOnDialog
          addon={installingAddOn}
          isOpen={!!installingAddOn}
          onClose={() => setInstallingAddOn(null)}
          onComplete={handleInstallComplete}
          storeId={storeId}
        />
      )}
    </div>
  );
}

// ============================================================================
// ADD-ON CARD
// ============================================================================

interface AddOnCardProps {
  addon: AddOnDefinition;
  isInstalled: boolean;
  onView: () => void;
  onInstall: () => void;
}

function AddOnCard({ addon, isInstalled, onView, onInstall }: AddOnCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={cn(
        "overflow-hidden transition-shadow hover:shadow-lg cursor-pointer group",
        isInstalled && "ring-2 ring-green-500/20"
      )}>
        {/* Preview Image */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden" onClick={onView}>
          {addon.previewImages?.thumbnail ? (
            <img
              src={addon.previewImages?.thumbnail}
              alt={addon.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {addon.icon}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {addon.author?.isOfficial && (
              <Badge variant="secondary" className="bg-green-500 text-green-600-foreground">
                Official
              </Badge>
            )}
            {addon.pricing?.type === 'free' && (
              <Badge variant="secondary">Free</Badge>
            )}
            {isInstalled && (
              <Badge variant="default" className="bg-green-600">
                <Check className="w-3 h-3 mr-1" />
                Installed
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{addon.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{addon.tagline}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium">{addon.stats?.rating ?? 0}</span>
              <span className="text-gray-500 ml-1">({addon.stats?.reviewCount ?? 0})</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Download className="w-4 h-4 mr-1" />
              {addon.stats?.installCount?.toLocaleString() ?? 0}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {addon.tags?.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onView}>
            Preview
          </Button>
          {isInstalled ? (
            <Button variant="secondary" className="flex-1" disabled>
              <Check className="w-4 h-4 mr-2" />
              Installed
            </Button>
          ) : (
            <Button className="flex-1" onClick={(e) => { e.stopPropagation(); onInstall(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Install
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  search: string;
  category: string | null;
  onClear: () => void;
}

function EmptyState({ search, category, onClear }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No add-ons found</h3>
      <p className="text-gray-500 mb-4">
        {search ? (
          <>No results for &quot;{search}&quot;</>
        ) : category ? (
          <>No add-ons in this category</>
        ) : (
          <>Try adjusting your filters</>
        )}
      </p>
      <Button onClick={onClear} variant="outline">
        Clear Filters
      </Button>
    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

function GallerySkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />
      
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="aspect-video" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
