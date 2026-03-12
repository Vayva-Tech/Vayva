"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from "@/components/Header";
import { Calendar, MapPin, Clock, Users, Ticket, Star, Share2, Heart, ChevronLeft } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  timezone: string;
  category: string;
  bannerImage: string;
  capacity: number;
  ticketTiers: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    remaining: number;
    salesStart: string;
    salesEnd: string;
    maxPerOrder: number;
    benefits: string[];
  }>;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();
      
      if (data.event) {
        setEvent(data.event);
        if (data.event.ticketTiers.length > 0) {
          setSelectedTier(data.event.ticketTiers[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTier || !event) return;

    setIsPurchasing(true);
    try {
      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          ticketTierId: selectedTier,
          quantity: quantity
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully purchased ${quantity} ticket(s)! Order ID: ${data.purchase.orderId}`);
        // Redirect to tickets page or show confirmation
        router.push('/my-tickets');
      } else {
        alert(`Purchase failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-xl mb-4">Event not found</p>
          <button 
            onClick={() => router.push('/')}
            className="text-purple-700 hover:underline flex items-center justify-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const selectedTierData = event.ticketTiers.find(tier => tier.id === selectedTier);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[
        { label: "Events", href: "/" },
        { label: event.title }
      ]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Banner */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl h-96 mb-8 relative overflow-hidden">
              {event.bannerImage ? (
                <img 
                  src={event.bannerImage} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-2">{event.title.charAt(0)}</h1>
                    <p className="text-xl">{event.category} Event</p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition">
                  <Heart className="h-5 w-5 text-white" />
                </button>
                <button className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition">
                  <Share2 className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {event.category}
                </span>
                <div className="flex items-center text-gray-600">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-medium">4.8</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-sm">128 reviews</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6">{event.title}</h1>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {event.description || "Join us for an exciting event that brings together industry professionals, enthusiasts, and innovators. This gathering promises engaging sessions, networking opportunities, and memorable experiences."}
              </p>

              {/* Event Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-white rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Date & Time</h3>
                    <p className="text-gray-600">{formatDate(event.startDate)}</p>
                    <p className="text-gray-600">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                    <p className="text-sm text-gray-500 mt-1">{event.timezone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-white rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">{event.venue}</p>
                    <p className="text-gray-600">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-white rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Capacity</h3>
                    <p className="text-gray-600">{event.capacity.toLocaleString()} attendees</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-white rounded-lg">
                    <Ticket className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ticket Types</h3>
                    <p className="text-gray-600">{event.ticketTiers.length} available options</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Purchase Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Tickets</h2>

              {/* Ticket Tiers */}
              <div className="space-y-4 mb-6">
                {event.ticketTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedTier === tier.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                      <span className="text-2xl font-bold text-purple-700">
                        {formatPrice(tier.price)}
                      </span>
                    </div>
                    
                    {tier.description && (
                      <p className="text-gray-600 text-sm mb-3">{tier.description}</p>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {tier.remaining} of {tier.quantity} available
                      </span>
                      <span className="text-gray-500">
                        Max {tier.maxPerOrder}/order
                      </span>
                    </div>

                    {tier.benefits.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tier.benefits.slice(0, 2).map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {benefit}
                            </li>
                          ))}
                          {tier.benefits.length > 2 && (
                            <li className="text-gray-400">+{tier.benefits.length - 2} more benefits</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quantity Selector */}
              {selectedTierData && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (Max {selectedTierData.maxPerOrder})
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {Array.from({ length: Math.min(selectedTierData.maxPerOrder, selectedTierData.remaining) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} ticket{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Total */}
              {selectedTierData && (
                <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(selectedTierData.price * quantity)}
                  </span>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={!selectedTier || isPurchasing || !selectedTierData || selectedTierData.remaining < quantity}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                  !selectedTier || isPurchasing || !selectedTierData || selectedTierData.remaining < quantity
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isPurchasing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : !selectedTierData ? (
                  'Select a ticket type'
                ) : selectedTierData.remaining < quantity ? (
                  'Not enough tickets available'
                ) : (
                  `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''}`
                )}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Secure checkout • Instant confirmation • Digital tickets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}