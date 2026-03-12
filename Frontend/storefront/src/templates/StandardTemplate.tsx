'use client';

import React from 'react';
import { Button } from '@vayva/ui';
import { StoreShell } from '@/components/StoreShell';
import { ProductCard } from '@/components/ProductCard';
import NextLink from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

interface StandardTemplateProps {
  store: any;
  products: any[];
  loading?: boolean;
}

/**
 * Standard Template - Default fallback for all stores
 */
export default function StandardTemplate({ store, products, loading }: StandardTemplateProps) {
  if (!store) {
    return (
      <StoreShell>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StoreShell>
    );
  }

  const primaryObjectLabel =
    store.industry === 'real_estate'
      ? 'Properties'
      : store.industry === 'blog_media'
        ? 'Articles'
        : 'Products';

  return (
    <StoreShell>
      {/* Hero Section */}
      <section className="relative px-4 py-20 bg-background/40 backdrop-blur-sm mb-16 rounded-[40px] border border-border/20 mx-4 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            {store.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
            {store.tagline || `Explore our varied collection of premium ${primaryObjectLabel.toLowerCase()}.`}
          </p>
          <NextLink href={`/collections/all?store=${store.slug}`}>
            <Button className="bg-black text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-gray-900 transition-colors">
              Shop All {primaryObjectLabel}
            </Button>
          </NextLink>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured {primaryObjectLabel}</h2>
          <NextLink
            href={`/collections/all?store=${store.slug}`}
            className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
          >
            View all <ArrowRight size={16} />
          </NextLink>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-background/30 rounded-2xl p-4"
              >
                <div className="bg-background/20 aspect-[4/5] rounded-xl mb-4"></div>
                <div className="h-4 bg-background/20 w-2/3 rounded mb-2"></div>
                <div className="h-4 bg-background/20 w-1/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeSlug={store.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500">No products available yet.</p>
          </div>
        )}
      </section>
    </StoreShell>
  );
}
