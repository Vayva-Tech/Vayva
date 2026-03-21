'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  services: string[];
  imageUrl: string;
  clientName?: string;
  projectDate: string;
  isFeatured: boolean;
}

interface SearchState {
  query: string;
  results: PortfolioItem[];
  loading: boolean;
  selectedCategory: string | null;
}

/**
 * Portfolio Search Component with Algolia
 */
export function PortfolioSearch() {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    loading: false,
    selectedCategory: null,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchState.query.trim()) {
        performSearch(searchState.query);
      } else {
        setSearchState(prev => ({ ...prev, results: [] }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchState.query]);

  const performSearch = async (query: string) => {
    setSearchState(prev => ({ ...prev, loading: true }));

    try {
      // In production: Use Algolia instantsearch or API
      // const algoliaClient = algoliasearch(APP_ID, API_KEY);
      // const index = algoliaClient.initIndex('portfolio');
      // const { hits } = await index.search(query, {
      //   filters: searchState.selectedCategory ? `category:"${searchState.selectedCategory}"` : '',
      // });

      // Mock search results
      const mockResults: PortfolioItem[] = [
        {
          id: '1',
          title: 'Acme Corp Website Redesign',
          description: 'Complete brand refresh and e-commerce platform',
          category: 'Web Design',
          services: ['Web Design', 'Development', 'Branding'],
          imageUrl: '/placeholder-1.jpg',
          clientName: 'Acme Corp',
          projectDate: '2024-02',
          isFeatured: true,
        },
        {
          id: '2',
          title: 'TechStart Brand Identity',
          description: 'Modern brand system for fintech startup',
          category: 'Branding',
          services: ['Logo Design', 'Brand Guidelines'],
          imageUrl: '/placeholder-2.jpg',
          clientName: 'TechStart',
          projectDate: '2024-01',
          isFeatured: true,
        },
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.services.some(s => s.toLowerCase().includes(query.toLowerCase()))
      );

      setSearchState(prev => ({
        ...prev,
        results: mockResults,
        loading: false,
      }));
    } catch (error) {
      console.error('Search failed:', error);
      setSearchState(prev => ({ ...prev, loading: false }));
    }
  };

  const categories = ['All', 'Web Design', 'Branding', 'Marketing', 'Mobile App'];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
        <Input
          placeholder="Search portfolio projects..."
          value={searchState.query}
          onChange={(e) => setSearchState(prev => ({ ...prev, query: e.target.value }))}
          className="pl-10 pr-10"
        />
        {searchState.query && (
          <button
            onClick={() => setSearchState(prev => ({ ...prev, query: '' }))}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!searchState.selectedCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchState(prev => ({ ...prev, selectedCategory: null }))}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={searchState.selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchState(prev => ({ ...prev, selectedCategory: category }))}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Search Results */}
      {searchState.loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-100 rounded-lg mb-4" />
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searchState.loading && searchState.results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {searchState.results.map((result) => (
            <Card key={result.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-t-lg">
                  <img
                    src={result.imageUrl}
                    alt={result.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {result.isFeatured && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{result.category}</Badge>
                  </div>
                  <h3 className="font-bold text-lg">{result.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {result.services.slice(0, 3).map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searchState.loading && searchState.query && searchState.results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Algolia Search Hook
 */
export function useAlgoliaSearch(indexName: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = async (query: string, filters?: string) => {
    setLoading(true);
    setError(null);

    try {
      // In production: Initialize Algolia client
      // const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!);
      // const index = client.initIndex(indexName);
      
      // const { hits } = await index.search(query, {
      //   filters,
      //   hitsPerPage: 20,
      // });

      // Mock implementation
      setResults([]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}
