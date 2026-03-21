"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface Seller {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  joinedAt: string;
  location: string;
}

interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  inStock: boolean;
}

export default function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sellerId } = React.use(params);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (sellerId) void fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const [sellerData, productsData] = await Promise.all([
        apiJson<Seller>(`/api/market/sellers/${sellerId}`),
        apiJson<SellerProduct[]>(`/api/market/sellers/${sellerId}/products`),
      ]);
      setSeller(sellerData);
      setProducts(productsData || []);
    } catch (error) {
      toast.error("Failed to load seller");
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

  const categories = [...new Set(products.map((p) => p.category))];
  const filteredProducts = activeCategory ? products.filter((p) => p.category === activeCategory) : products;

  if (loading) {
    return (
      <MarketShell>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-100 mb-8" />
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-8 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded" />)}
            </div>
          </div>
        </div>
      </MarketShell>
    );
  }

  if (!seller) {
    return (
      <MarketShell>
        <div className="text-center py-16">
          <Icon name="Store" size={48} className="text-gray-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Seller not found</h1>
          <Link href="/market">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      </MarketShell>
    );
  }

  return (
    <MarketShell>
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-green-500/20 to-secondary/20 relative">
        {seller.banner && <img src={seller.banner} alt="" className="w-full h-full object-cover" />}
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        {/* Seller Header */}
        <div className="bg-white-1 border rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
              {seller.logo ? (
                <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Icon name="Store" size={40} className="text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{seller.name}</h1>
                {seller.verified && <Icon name="BadgeCheck" size={24} className="text-blue-500" />}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                  {seller.rating} ({seller.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="MapPin" size={14} /> {seller.location}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Package" size={14} /> {seller.productCount} products
                </span>
              </div>
              <p className="text-gray-500">{seller.description}</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${!activeCategory ? "bg-green-500 text-white" : "bg-gray-100"}`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap capitalize ${activeCategory === cat ? "bg-green-500 text-white" : "bg-gray-100"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        <h2 className="text-xl font-semibold mb-4">Products ({filteredProducts.length})</h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="PackageX" size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500">No products in this category</p>
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
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/market/products/${product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-green-500">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Icon name="Star" size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-500">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold">₦{product.price.toLocaleString()}</span>
                    <Button size="sm" variant="ghost" onClick={() => addToCart(product.id)} disabled={!product.inStock}>
                      <Icon name="Plus" size={16} />
                    </Button>
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
