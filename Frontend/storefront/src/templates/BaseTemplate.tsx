'use client';

import React from 'react';
import { StoreShell } from '@/components/StoreShell';

interface BaseTemplateProps {
  store: any;
  products: any[];
  loading?: boolean;
}

/**
 * Base Template - Minimal starting point
 */
export default function BaseTemplate({ store, products }: BaseTemplateProps) {
  return (
    <StoreShell>
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-4">{store?.name || 'Welcome'}</h1>
        <p className="text-gray-600 mb-8">
          {store?.tagline || 'Your store is ready. Start adding products!'}
        </p>
        
        {products && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600">₦{product.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreShell>
  );
}
