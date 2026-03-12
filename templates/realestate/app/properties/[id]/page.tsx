"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PropertyMap from "@/components/PropertyMap";
import { Calendar, MapPin, Bed, Bath, Square, Phone, Mail, Clock, CalendarDays } from "lucide-react";
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  type: string;
  featured: boolean;
  lat?: number;
  lng?: number;
  amenities: string[];
  yearBuilt?: number;
  currency: string;
}

interface RelatedProperty {
  id: string;
  name: string;
  price: number;
  images: string[];
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  type: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [related, setRelated] = useState<RelatedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      
      if (data.property) {
        setProperty(data.property);
        setRelated(data.related || []);
      } else {
        router.push('/properties');
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
      router.push('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/viewings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property?.id,
          ...scheduleData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Viewing scheduled successfully!');
        setShowScheduleForm(false);
        setScheduleData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          scheduledDate: '',
          scheduledTime: '',
          notes: '',
        });
      } else {
        toast.error(data.error || 'Failed to schedule viewing');
      }
    } catch (error) {
      toast.error('Failed to schedule viewing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
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

  if (!property) return null;

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

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-emerald-600 hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/properties" className="text-emerald-600 hover:underline">Properties</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-500">{property.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              {property.images?.[0] ? (
                <img 
                  src={property.images[0]} 
                  alt={property.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <span className="text-8xl font-bold text-emerald-200">{property.name[0]}</span>
                </div>
              )}
            </div>

            {/* Property Map */}
            {property.lat && property.lng && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Property Location</h3>
                <PropertyMap
                  latitude={property.lat}
                  longitude={property.lng}
                  address={property.address}
                  propertyTitle={property.name}
                  className="h-96"
                />
                <div className="mt-4 flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.address}, {property.city}, {property.state}</span>
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {property.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-600">
                    ₦{property.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{property.type}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {property.bedrooms && (
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                    <Bed className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                    <Bath className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                {property.sqft && (
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                    <Square className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>{property.sqft.toLocaleString()} sqft</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
                    <span>Built {property.yearBuilt}</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span 
                        key={index} 
                        className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Schedule Viewing Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Schedule a Viewing</h3>
              
              {!showScheduleForm ? (
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowScheduleForm(true)}
                >
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Schedule Viewing
                </Button>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input
                      required
                      value={scheduleData.clientName}
                      onChange={(e) => setScheduleData({...scheduleData, clientName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      required
                      value={scheduleData.clientEmail}
                      onChange={(e) => setScheduleData({...scheduleData, clientEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      required
                      value={scheduleData.clientPhone}
                      onChange={(e) => setScheduleData({...scheduleData, clientPhone: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <Input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={scheduleData.scheduledDate}
                        onChange={(e) => setScheduleData({...scheduleData, scheduledDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <Input
                        type="time"
                        required
                        value={scheduleData.scheduledTime}
                        onChange={(e) => setScheduleData({...scheduleData, scheduledTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <Textarea
                      rows={3}
                      value={scheduleData.notes}
                      onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      Schedule
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowScheduleForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Agent Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Contact Agent</h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">JD</span>
                </div>
                <h4 className="font-semibold mb-2">John Doe</h4>
                <p className="text-gray-600 text-sm mb-4">Licensed Real Estate Agent</p>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Agent
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Agent
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(property => (
                <Link key={property.id} href={`/properties/${property.id}`}>
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
                          <span className="text-4xl font-bold text-emerald-200">{property.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 truncate">{property.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">{property.location}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
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
                      </div>
                      <p className="text-lg font-bold text-emerald-600">
                        ₦{property.price.toLocaleString()}
                      </p>
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