"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, Search, Filter, Star, Leaf, Wheat, Milk } from "lucide-react";

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
}

interface Category {
  name: string;
  slug: string;
  itemCount?: number;
}

export default function MenuPage() {
  const { cartCount, addToCart } = useStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  useEffect(() => {
    fetchMenuData();
    fetchCategories();
  }, [selectedCategory, searchQuery, dietaryFilter]);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (dietaryFilter) queryParams.append('dietary', dietaryFilter);
      
      queryParams.append('minPrice', priceRange[0].toString());
      queryParams.append('maxPrice', priceRange[1].toString());

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();
      
      if (data.products) {
        setMenuItems(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeCounts=true');
      const data = await response.json();
      
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.images[0] || ''
    });
  };

  const MenuItemCard = ({ item }: { item: MenuItem }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 relative">
        {item.images?.[0] ? (
          <img 
            src={item.images[0]} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-orange-300">
            <span className="text-5xl">{item.name[0]}</span>
          </div>
        )}
        
        {/* Dietary badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.dietaryInfo?.map((dietary) => (
            <Badge key={dietary} variant="secondary" className="text-xs capitalize">
              {dietary === 'vegetarian' && <Leaf className="h-3 w-3 mr-1" />}
              {dietary === 'vegan' && <Leaf className="h-3 w-3 mr-1" />}
              {dietary === 'gluten-free' && <Wheat className="h-3 w-3 mr-1" />}
              {dietary}
            </Badge>
          ))}
        </div>

        {/* Prep time */}
        {item.prepTime && (
          <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.prepTime} min
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        )}
        
        {/* Allergen warnings */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-orange-600 font-medium">Contains: {item.allergens.join(', ')}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-xl text-orange-600">₦{item.price.toLocaleString()}</span>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">4.8 (127)</span>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => handleAddToCart(item)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Add to Cart
          </Button>
        </div>
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

      {/* Hero/Search Section */}
      <section className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-6">Our Menu</h1>
          <p className="text-xl text-white/90 text-center mb-8 max-w-2xl mx-auto">
            Discover delicious dishes prepared fresh daily
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search dishes, ingredients..."
                className="pl-12 py-6 text-base bg-white/10 border-white/20 placeholder-white/70 text-white focus:ring-2 focus:ring-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory('')}
                  >
                    All Items
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.name
                          ? 'bg-orange-100 text-orange-700'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        {category.itemCount !== undefined && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {category.itemCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Filters */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Dietary</h4>
                <div className="space-y-2">
                  {['vegetarian', 'vegan', 'gluten-free'].map((diet) => (
                    <button
                      key={diet}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        dietaryFilter === diet
                          ? 'bg-orange-100 text-orange-700'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setDietaryFilter(dietaryFilter === diet ? '' : diet)}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Menu Items */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {loading ? 'Loading menu...' : `${menuItems.length} Items Found`}
              </h2>
              {selectedCategory && (
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  {selectedCategory}
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}