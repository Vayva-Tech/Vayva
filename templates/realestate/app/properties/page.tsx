"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertiesMap from "@/components/PropertiesMap";
import { Search, MapPin, Bed, Bath, Square, Filter, Grid, Map } from "lucide-react";

interface Property {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  location: string;
  city: string;
  state: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  type: string;
  featured: boolean;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    purpose: 'sale',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();
      
      if (data.properties) {
        setProperties(data.properties);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Link href={`/properties/${property.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
        <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-teal-100 relative">
          {property.images?.[0] ? (
            <img 
              src={property.images[0]} 
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-emerald-200">{property.name[0]}</span>
            </div>
          )}
          {property.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white">
                Featured
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              property.type === "For Sale" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
            }`}>
              {property.type}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-1 truncate">{property.name}</h3>
          <p className="text-gray-500 text-sm mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {property.bathrooms}
              </span>
            )}
            {property.sqft && (
              <span className="flex items-center gap-1">
                <Square className="h-4 w-4" /> {property.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            ₦{property.price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-700">
            ESTATELY
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/properties?purpose=sale" className="text-sm font-medium hover:text-emerald-700">
              Buy
            </Link>
            <Link href="/properties?purpose=rent" className="text-sm font-medium hover:text-emerald-700">
              Rent
            </Link>
            <Link href="/sell" className="text-sm font-medium hover:text-emerald-700">
              Sell
            </Link>
            <Link href="/agents" className="text-sm font-medium hover:text-emerald-700">
              Agents
            </Link>
          </nav>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            Contact Us
          </Button>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-emerald-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
              Find Your Perfect Property
            </h1>
            
            {/* Main Search */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center px-4 border rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <Input
                      placeholder="Enter location (city, state)"
                      className="border-0 focus-visible:ring-0"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    className="w-full p-3 border rounded-lg bg-white"
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                    <Input
                      type="number"
                      placeholder="₦0"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                    <Input
                      type="number"
                      placeholder="₦1,000,000"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <select
                      className="w-full p-3 border rounded-lg"
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                    <select
                      className="w-full p-3 border rounded-lg"
                      value={filters.purpose}
                      onChange={(e) => handleFilterChange('purpose', e.target.value)}
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                      <option value="lease">For Lease</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {loading ? 'Loading properties...' : `${properties.length} Properties Found`}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="h-screen">
              <PropertiesMap
                properties={properties}
                className="h-full"
                onPropertyClick={(propertyId) => router.push(`/properties/${propertyId}`)}
              />
            </div>
          ) : (
            <>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200" />
                      <div className="p-5">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}