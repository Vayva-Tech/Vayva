"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Share2
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  logo?: string;
  coverImage?: string;
  hours: Record<string, any>;
  deliveryRadius: number;
  deliveryFee: number;
  minimumOrder: number;
  preparationTime: number;
  isOpen: boolean;
  menuItemCount: number;
  menuItems: MenuItem[];
  averageRating: number;
  totalReviews: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  prepTime: number;
  allergens: string[];
  dietaryInfo: string[];
  isAvailable: boolean;
  isPopular: boolean;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/restaurants/${restaurantId}`);
        const data = await response.json();
        
        if (data.restaurant) {
          setRestaurant(data.restaurant);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId, router]);

  const addToCart = (itemId: string) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const newCount = (prev[itemId] || 1) - 1;
      if (newCount <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newCount };
    });
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    if (!restaurant) return 0;
    return Object.entries(cartItems).reduce((sum, [itemId, count]) => {
      const item = restaurant.menuItems.find(menuItem => menuItem.id === itemId);
      return sum + (item ? item.price * count : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(restaurant.menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'All' 
    ? restaurant.menuItems 
    : restaurant.menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            FLAVOR
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              ← Back
            </Button>
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Header */}
      <section className="relative">
        {restaurant.coverImage ? (
          <img 
            src={restaurant.coverImage} 
            alt={restaurant.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <span className="text-6xl text-white font-bold">{restaurant.name[0]}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current" />
                <span>{restaurant.averageRating} ({restaurant.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.city}, {restaurant.state}</span>
              </div>
              <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">₦{(item.price / 100).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">• {item.prepTime} min</span>
                        </div>
                        {!item.isAvailable && (
                          <Badge variant="secondary" className="mb-2">Currently Unavailable</Badge>
                        )}
                        {item.isPopular && (
                          <Badge variant="default" className="mb-2">Popular</Badge>
                        )}
                      </div>
                      {item.images[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                          {item.name[0]}
                        </div>
                      )}
                    </div>
                    
                    {/* Dietary Info */}
                    {(item.dietaryInfo.length > 0 || item.allergens.length > 0) && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.dietaryInfo.map(diet => (
                          <Badge key={diet} variant="outline" className="text-xs">
                            {diet}
                          </Badge>
                        ))}
                        {item.allergens.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Contains allergens
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Add to Cart */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cartItems[item.id] ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {cartItems[item.id]}
                            </span>
                            <Button 
                              size="sm" 
                              onClick={() => addToCart(item.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            disabled={!item.isAvailable}
                            onClick={() => addToCart(item.id)}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                {getTotalItems() === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add items to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {Object.entries(cartItems).map(([itemId, count]) => {
                        const item = restaurant.menuItems.find(menuItem => menuItem.id === itemId);
                        if (!item) return null;
                        
                        return (
                          <div key={itemId} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {count}</p>
                            </div>
                            <p className="font-medium">₦{((item.price * count) / 100).toFixed(2)}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₦{(getTotalPrice() / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>₦{(restaurant.deliveryFee / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₦{((getTotalPrice() + restaurant.deliveryFee) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" size="lg">
                      Proceed to Checkout
                    </Button>
                    
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      <p>Minimum order: ₦{(restaurant.minimumOrder / 100).toFixed(2)}</p>
                      <p>Delivery in {restaurant.preparationTime}-{restaurant.preparationTime + 15} mins</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Restaurant Info */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3">Restaurant Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{restaurant.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{restaurant.address}, {restaurant.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Prep time: {restaurant.preparationTime} mins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}