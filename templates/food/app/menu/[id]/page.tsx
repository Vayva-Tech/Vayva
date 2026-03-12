"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, Star, Leaf, Wheat, Milk, AlertTriangle, Plus, Minus } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
  prepTime: number | null;
  allergens: string[];
  dietaryInfo: string[];
  isActive: boolean;
  createdAt: string;
  currentPrice: number;
  suggestedPrice?: number;
  grossMargin?: number;
  ingredients?: Array<{ name: string; quantity: number; unit: string }>;
  recipeInstructions?: string;
}

interface RelatedItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  prepTime: number | null;
}

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, cartCount } = useStore();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (params.id) {
      fetchMenuItem();
    }
  }, [params.id]);

  const fetchMenuItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      
      if (data.product) {
        setMenuItem(data.product);
        setRelatedItems(data.related || []);
      } else {
        router.push('/menu');
      }
    } catch (error) {
      console.error('Failed to fetch menu item:', error);
      router.push('/menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!menuItem) return;
    
    addToCart({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantity,
      image: menuItem.images[0] || '',
      addons: Object.keys(selectedAddons).filter(key => selectedAddons[key])
    });
    
    // Reset quantity and addons
    setQuantity(1);
    setSelectedAddons({});
  };

  const updateQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
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

  if (!menuItem) return null;

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

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-orange-600 hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/menu" className="text-orange-600 hover:underline">Menu</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-500">{menuItem.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              {menuItem.images?.[0] ? (
                <img 
                  src={menuItem.images[0]} 
                  alt={menuItem.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <span className="text-8xl font-bold text-orange-200">{menuItem.name[0]}</span>
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{menuItem.name}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{menuItem.category}</Badge>
                    {menuItem.dietaryInfo?.map((dietary) => (
                      <Badge key={dietary} variant="outline" className="capitalize">
                        {dietary === 'vegetarian' && <Leaf className="h-3 w-3 mr-1" />}
                        {dietary === 'vegan' && <Leaf className="h-3 w-3 mr-1" />}
                        {dietary === 'gluten-free' && <Wheat className="h-3 w-3 mr-1" />}
                        {dietary}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-600">
                    ₦{menuItem.price.toLocaleString()}
                  </p>
                  {menuItem.prepTime && (
                    <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {menuItem.prepTime} min prep time
                    </p>
                  )}
                </div>
              </div>

              {menuItem.description && (
                <p className="text-gray-700 leading-relaxed mb-6">{menuItem.description}</p>
              )}

              {/* Allergen Warnings */}
              {menuItem.allergens && menuItem.allergens.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-800">Contains Allergens</h3>
                      <p className="text-orange-700 text-sm mt-1">
                        This item contains: {menuItem.allergens.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {menuItem.ingredients && menuItem.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {menuItem.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {ingredient.quantity}{ingredient.unit} {ingredient.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recipe Instructions */}
              {menuItem.recipeInstructions && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Preparation</h3>
                  <p className="text-gray-700 whitespace-pre-line">{menuItem.recipeInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Order Panel */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Customize Order</h3>
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Popular Add-ons (Mock data for now) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add-ons</label>
                <div className="space-y-2">
                  {[
                    { id: 'extra-cheese', name: 'Extra Cheese', price: 500 },
                    { id: 'extra-spice', name: 'Extra Spice', price: 200 },
                    { id: 'side-sauce', name: 'Side Sauce', price: 300 },
                  ].map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 text-orange-600"
                          checked={!!selectedAddons[addon.id]}
                          onChange={(e) => setSelectedAddons(prev => ({
                            ...prev,
                            [addon.id]: e.target.checked
                          }))}
                        />
                        <span className="text-sm">{addon.name}</span>
                      </label>
                      <span className="text-sm font-medium">₦{addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{(menuItem.price * quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">₦{(menuItem.price * quantity).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/checkout">Checkout Now</Link>
                </Button>
              </div>

              {/* Ratings */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span className="text-gray-500 text-sm">(127 reviews)</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-orange-600">
                    View Reviews
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map(item => (
                <Link key={item.id} href={`/menu/${item.id}`}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 relative">
                      {item.images?.[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-orange-300">
                          <span className="text-4xl">{item.name[0]}</span>
                        </div>
                      )}
                      {item.prepTime && (
                        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.prepTime} min
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                      <p className="font-bold text-orange-600">₦{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}