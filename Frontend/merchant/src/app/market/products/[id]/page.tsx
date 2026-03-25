"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Badge, Input } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
  quantity: number;
  sku?: string;
  tags: string[];
  seller: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
  };
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const slug =
    typeof idParam === "string" ? idParam : Array.isArray(idParam) ? idParam[0] : "";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (slug) void fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Product>(`/api/market/products/${slug}`);
      setProduct(data);
    } catch {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    try {
      await apiJson("/api/market/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <MarketShell>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-lg aspect-square" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-6 bg-gray-100 rounded w-1/4" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </MarketShell>
    );
  }

  if (!product) {
    return (
      <MarketShell>
        <div className="text-center py-16">
          <Icon name="PackageX" size={48} className="text-gray-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Product not found</h1>
          <Link href="/market">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      </MarketShell>
    );
  }

  return (
    <MarketShell>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/market" className="hover:text-green-500">Marketplace</Link>
          <Icon name="ChevronRight" size={16} />
          <Link href={`/market/categories/${product.category}`} className="hover:text-green-500 capitalize">{product.category}</Link>
          <Icon name="ChevronRight" size={16} />
          <span className="truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {product.images[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Icon name="Image" size={64} className="text-gray-500" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <Button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? "border-green-500" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {product.seller.verified && <Icon name="BadgeCheck" size={24} className="text-blue-500" />}
            </div>

            <Link href={`/market/sellers/${product.seller.id}`} className="text-sm text-gray-500 hover:text-green-500 mb-4 inline-block">
              by {product.seller.name} ⭐ {product.seller.rating} ({product.seller.reviewCount} reviews)
            </Link>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="Star"
                    size={18}
                    className={star <= Math.round(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold">₦{product.price.toLocaleString()}</span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-500 line-through">₦{product.compareAtPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-500 mb-6">{product.description}</p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-16 text-center" />
                <Button size="sm" variant="outline" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
              <span className="text-sm text-gray-500">{product.inStock ? `${product.quantity} available` : "Out of stock"}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button className="flex-1" size="lg" onClick={addToCart} disabled={!product.inStock}>
                <Icon name="ShoppingCart" size={20} className="mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Link href="/market/cart" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <Icon name="Eye" size={20} className="mr-2" /> View Cart
                </Button>
              </Link>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Specs */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <dl className="space-y-2 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-gray-500">{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </MarketShell>
  );
}
