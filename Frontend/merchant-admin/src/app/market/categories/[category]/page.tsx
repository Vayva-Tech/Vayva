"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface CategoryProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  seller: { name: string; verified: boolean };
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  subcategories: string[];
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = React.use(params);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"relevance" | "price-low" | "price-high" | "rating">("relevance");

  useEffect(() => {
    if (category) void fetchCategoryData();
  }, [category]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const [catData, productsData] = await Promise.all([
        apiJson<CategoryInfo>(`/api/market/categories/${category}`),
        apiJson<CategoryProduct[]>(`/api/market/categories/${category}/products`),
      ]);
      setCategoryInfo(catData);
      setProducts(productsData || []);
    } catch (error) {
      toast.error("Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "rating": return b.rating - a.rating;
      default: return 0;
    }
  });

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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/market" className="hover:text-primary">Marketplace</Link>
          <Icon name="ChevronRight" size={16} />
          <span className="capitalize">{categoryInfo?.name || category}</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold capitalize mb-2">{categoryInfo?.name || category}</h1>
          <p className="text-muted-foreground">{categoryInfo?.description || `Browse ${products.length} products in this category`}</p>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={18} />
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <span className="text-sm text-muted-foreground">{products.length} products</span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-64" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="PackageX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No products found</h2>
            <p className="text-muted-foreground mb-4">Check back later for new arrivals</p>
            <Link href="/market">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
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
                    {product.compareAtPrice && <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>}
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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">₦{product.price.toLocaleString()}</span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-muted-foreground line-through">₦{product.compareAtPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => addToCart(product.id)} disabled={!product.inStock}>
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
