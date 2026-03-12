"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Input, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
  seller: { name: string; verified: boolean };
  rating: number;
  reviewCount: number;
}

export default function MarketSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) void performSearch(initialQuery);
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setSearched(true);
      const data = await apiJson<SearchResult[]>(`/api/market/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(data || []);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await apiJson("/api/market/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <MarketShell>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-4 text-center">Search Marketplace</h1>
          <div className="flex gap-2">
            <Input
              placeholder="Search products, sellers, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && performSearch(query)}
              className="flex-1"
            />
            <Button onClick={() => performSearch(query)} disabled={loading}>
              <Icon name="Search" size={18} />
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-64" />
            ))}
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="SearchX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No results found</h2>
            <p className="text-muted-foreground">Try different keywords or browse all products</p>
            <Link href="/market" className="mt-4 inline-block">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((product) => (
              <div key={product.id} className="bg-surface-1 border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                <Link href={`/market/products/${product.slug}`}>
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon name="Image" size={40} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/market/products/${product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Icon name="Star" size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold">₦{product.price.toLocaleString()}</span>
                    <Button size="sm" variant="ghost" onClick={() => addToCart(product.id)}>
                      <Icon name="Plus" size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <span>by {product.seller.name}</span>
                    {product.seller.verified && <Icon name="BadgeCheck" size={12} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MarketShell>
  );
}
