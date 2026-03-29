"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Input, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface MarketProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  seller: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

interface MarketCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    void fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        apiJson<MarketProduct[]>("/market/products"),
        apiJson<MarketCategory[]>("/market/categories"),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      toast.error("Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await apiJson("/market/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.slice(0, 8);

  return (
    <MarketShell>
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-500/10 via-background to-secondary/10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Vayva Marketplace
          </h1>
          <p className="text-xl text-gray-500 mb-8">
            Discover products from verified African merchants
          </p>
          <div className="flex max-w-lg mx-auto gap-2">
            <Input
              placeholder="Search products, sellers, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Link href={`/market/search?q=${encodeURIComponent(searchQuery)}`}>
              <Button><Icon name="Search" size={18} /></Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-8 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Browse Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                !selectedCategory ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-100"
              }`}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-100"
                }`}
              >
                {cat.name} ({cat.productCount})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {selectedCategory ? "Filtered Results" : "Featured Products"}
            </h2>
            <Link href="/market/cart" className="text-green-500 hover:underline flex items-center gap-1">
              <Icon name="ShoppingCart" size={18} /> View Cart
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-64" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="PackageX" size={48} className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white-1 border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                  <Link href={`/market/products/${product.slug}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Icon name="Image" size={40} className="text-gray-500" />
                        </div>
                      )}
                      {product.compareAtPrice && (
                        <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/market/products/${product.slug}`}>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-green-500 transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 mt-1">
                      <Icon name="Star" size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">₦{product.price.toLocaleString()}</span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-gray-500 line-through">₦{product.compareAtPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addToCart(product.id)}
                        disabled={!product.inStock}
                      >
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <span>by {product.seller.name}</span>
                      {product.seller.verified && <Icon name="BadgeCheck" size={12} className="text-blue-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MarketShell>
  );
}
