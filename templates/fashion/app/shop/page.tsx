"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  ArrowLeft, 
  Search, 
  Filter,
  ChevronDown,
  Star,
  Heart,
  Grid,
  List,
  SlidersHorizontal
} from "lucide-react";
import { useStore } from "@/lib/store-context";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  inventory: number;
  tags: string[];
  status: string;
  createdAt: string;
  brand?: string;
  rating?: number;
  reviews?: number;
}

export default function ShopPage() {
  const { addToCart } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-serif font-bold text-stone-900">
                VOGUE
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                {['New Arrivals', 'Women', 'Men', 'Accessories'].map((item) => (
                  <Link 
                    key={item}
                    href="/shop" 
                    className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative">
                <ShoppingBag className="h-6 w-6 text-stone-700 hover:text-stone-900 transition-colors" />
                <span className="absolute -top-2 -right-2 bg-stone-900 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Shop Collection</h1>
            <p className="text-stone-600">
              {filteredProducts.length} products found
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="rounded-none border-stone-300"
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              {viewMode === "grid" ? "List View" : "Grid View"}
            </Button>
            <Button variant="ghost" asChild className="text-stone-700 hover:text-stone-900">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-stone-50 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-stone-900">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* Search */}
                <div>
                  <h3 className="font-medium text-stone-900 mb-3">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-none border-stone-300 focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium text-stone-900 mb-3">Categories</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-stone-300 rounded-none px-3 py-2 bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-stone-900 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-600">₦</span>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="flex-1 rounded-none border-stone-300"
                      />
                      <span className="text-stone-400">-</span>
                      <span className="text-sm text-stone-600">₦</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                        className="flex-1 rounded-none border-stone-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-medium text-stone-900 mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-stone-300 rounded-none px-3 py-2 bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 100000) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setPriceRange([0, 100000]);
                    }}
                    className="w-full rounded-none border-stone-300 text-stone-700"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-stone-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-stone-900 mb-2">No products found</h3>
                <p className="text-stone-600 mb-6">Try adjusting your filters or search terms</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setPriceRange([0, 100000]);
                  }}
                  className="rounded-none border-stone-300"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-6"
              }>
                {sortedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ 
  product, 
  viewMode,
  onAddToCart 
}: { 
  product: Product; 
  viewMode: "grid" | "list";
  onAddToCart: (item: any) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const handleAddToCart = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || ''
    });
  };

  if (viewMode === "list") {
    return (
      <div className="flex gap-6 p-6 bg-white border border-stone-200 rounded-2xl hover:shadow-lg transition-all duration-300">
        <div className="w-32 h-40 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
          {!imageError && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <span className="text-2xl font-light">{product.name.charAt(0)}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg text-stone-900 mb-1">{product.name}</h3>
              {product.brand && (
                <p className="text-stone-600 text-sm mb-2">{product.brand}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="text-stone-400 hover:text-rose-500"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
            </Button>
          </div>
          
          <p className="text-stone-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
          
          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating!) ? 'text-amber-400 fill-current' : 'text-stone-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-stone-600">({product.reviews || 0} reviews)</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-stone-900">
                ₦{(product.price / 100).toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-stone-500 text-lg line-through ml-2">
                  ₦{(product.comparePrice / 100).toFixed(2)}
                </span>
              )}
            </div>
            <Button 
              onClick={handleAddToCart}
              className="bg-stone-900 hover:bg-stone-800 text-white rounded-none px-6 py-2 font-medium"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
        {!imageError && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <span className="text-4xl font-light">{product.name.charAt(0)}</span>
          </div>
        )}
        
        {product.comparePrice && (
          <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            SALE
          </div>
        )}
        
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/80 hover:bg-white shadow-lg"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-rose-500' : 'text-stone-700'}`} />
        </Button>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-none py-3 font-medium shadow-lg"
          >
            Add to Cart
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-stone-900 group-hover:text-stone-700 transition-colors">
            {product.name}
          </h3>
          {product.brand && (
            <span className="text-sm text-stone-500">{product.brand}</span>
          )}
        </div>
        
        <p className="text-stone-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {product.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(product.rating!) ? 'text-amber-400 fill-current' : 'text-stone-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-stone-500">({product.reviews || 0})</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-stone-900">
              ₦{(product.price / 100).toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-stone-500 text-base line-through ml-2">
                ₦{(product.comparePrice / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}