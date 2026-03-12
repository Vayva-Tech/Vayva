"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, Tag, Flame, Star, Timer } from "lucide-react";

interface DealItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  prepTime: number | null;
  discount: number;
  endTime?: string;
  dietaryInfo: string[];
}

export default function DealsPage() {
  const { cartCount, addToCart } = useStore();
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      // Simulate fetching deals - in reality this would come from a deals API
      // For now, we'll create some sample deals from menu items
      const response = await fetch('/api/products?limit=20');
      const data = await response.json();
      
      if (data.products) {
        // Create sample deals from existing menu items
        const sampleDeals = data.products.slice(0, 8).map((item: any, index: number) => ({
          ...item,
          originalPrice: Math.round(item.price * 1.3),
          discount: Math.round((1 - item.price / (item.price * 1.3)) * 100),
          endTime: new Date(Date.now() + (24 + index * 6) * 60 * 60 * 1000).toISOString(), // Random future times
        }));
        setDeals(sampleDeals);
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (deal: DealItem) => {
    addToCart({
      id: deal.id,
      name: deal.name,
      price: deal.price,
      quantity: 1,
      image: deal.images[0] || ''
    });
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const DealTimer = ({ endTime }: { endTime: string }) => {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTime));
    
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(getTimeRemaining(endTime));
      }, 1000);
      
      return () => clearInterval(timer);
    }, [endTime]);
    
    if (timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0) {
      return <span className="text-red-500 font-medium">Deal Expired</span>;
    }
    
    return (
      <div className="flex items-center gap-1 text-sm">
        <Timer className="h-4 w-4" />
        <span>{timeLeft.hours.toString().padStart(2, '0')}:</span>
        <span>{timeLeft.minutes.toString().padStart(2, '0')}:</span>
        <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  const DealCard = ({ deal }: { deal: DealItem }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 relative">
          {deal.images?.[0] ? (
            <img 
              src={deal.images[0]} 
              alt={deal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-orange-300">
              <span className="text-5xl">{deal.name[0]}</span>
            </div>
          )}
          
          {/* Discount badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white px-3 py-2 text-lg">
              <Tag className="h-4 w-4 mr-1" />
              {deal.discount}% OFF
            </Badge>
          </div>
          
          {/* Time remaining */}
          {deal.endTime && (
            <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
              <DealTimer endTime={deal.endTime} />
            </div>
          )}
        </div>
        
        {/* Hot deal indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
          <Flame className="h-3 w-3" />
          HOT DEAL
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2">{deal.name}</h3>
        {deal.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{deal.description}</p>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          {deal.dietaryInfo?.map((dietary) => (
            <Badge key={dietary} variant="outline" className="text-xs capitalize">
              {dietary}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-2xl text-orange-600">₦{deal.price.toLocaleString()}</span>
              <span className="text-lg text-gray-500 line-through">₦{deal.originalPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">4.7 (89)</span>
            </div>
          </div>
          
          {deal.prepTime && (
            <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              {deal.prepTime} min
            </div>
          )}
        </div>
        
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600"
          onClick={() => handleAddToCart(deal)}
        >
          Add to Cart - Save ₦{(deal.originalPrice - deal.price).toLocaleString()}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            FLAVOR
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-500 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-yellow-300" />
            <Tag className="h-8 w-8 text-yellow-300" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Hot Deals & Specials</h1>
          <p className="text-xl text-white/90 mb-2">Limited time offers you won't want to miss</p>
          <p className="text-orange-200">Up to 40% off selected items</p>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Tag className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals available</h3>
              <p className="text-gray-500">Check back later for amazing offers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-orange-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-orange-800 mb-4">Don't Miss Out!</h2>
          <p className="text-orange-700 mb-6 max-w-2xl mx-auto">
            These deals expire quickly. Order now to enjoy incredible savings on your favorite dishes.
          </p>
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
            <Link href="/menu">View Full Menu</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}