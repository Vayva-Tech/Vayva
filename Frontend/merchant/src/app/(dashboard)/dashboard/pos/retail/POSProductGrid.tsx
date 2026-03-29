'use client';

import { useState, useEffect } from 'react';
import { Card } from '@vayva/ui/components/ui/card';
import { Button } from '@vayva/ui/components/ui/button';
import { Plus } from 'lucide-react';

import { POSTable } from '@/lib/pos-api-client';

interface Product {
  id: string;
  name: string;
  price: number;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  stock?: number;
}

interface POSProductGridProps {
  products: POSTable[];
  loading: boolean;
  searchQuery: string;
  onAddToCart: (product: POSTable) => void;
}

export function POSProductGrid({ products, loading, searchQuery, onAddToCart }: POSProductGridProps) {
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    !searchQuery || 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.metadata?.sku as string)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="bg-gray-200 h-32 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No products found</p>
        <p className="text-sm mt-2">Try a different search or add new products</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
      {filteredProducts.map((product) => (
        <Card 
          key={product.id}
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onAddToCart(product)}
        >
          <div className="aspect-square bg-gray-100 rounded mb-4 flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-4xl">📦</div>
            )}
          </div>
          
          <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
          {product.sku && (
            <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">₦{product.price.toLocaleString()}</span>
            <Button 
              size="sm" 
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {product.stock !== undefined && product.stock < 10 && (
            <p className="text-xs text-orange-500 mt-2">
              Low stock: {product.stock} left
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
