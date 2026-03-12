"use client";

import React, { useState } from "react";
import { PublicProduct } from "@/types/storefront";
import { Clock, MapPin } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
// Replaced missing UI components with native elements for now

interface ServicePDPProps {
  product: PublicProduct;
}

export function ServicePDP({ product }: ServicePDPProps): React.JSX.Element {
  // const { addToCart } = useStore(); // In reality, this would likely go to a Booking Flow, not Cart
  const [date, setDate] = useState<Date | undefined>(new Date());
  const metadata = product.metadata as Record<string, string>;

  // Mock booking handler
  const handleBookNow = () => {
    alert(`Booking initiated for ${product.name} on ${date?.toDateString()}`);
    // Here we would integrate with the booking API
  };

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-4 text-gray-500 mt-2">
            {metadata?.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {metadata.durationMinutes} mins
              </span>
            )}
            {metadata?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />{" "}
                {metadata.location.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        <div className="prose text-gray-600 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            About this service
          </h3>
          <p>{product.description}</p>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="border rounded-xl p-6 shadow-sm sticky top-24">
          <div className="text-2xl font-bold mb-4">
            ₦{(product.price || 0).toLocaleString()}
          </div>

          <div className="space-y-4">
            <label
              htmlFor="service-booking-date"
              className="text-sm font-medium"
            >
              Select Date
            </label>
            {/* Reuse Calendar if available, or simple Input */}
            <div className="border rounded-md p-2">
              <input
                id="service-booking-date"
                type="date"
                className="w-full text-sm outline-none"
                onChange={(e: any) => setDate(new Date(e.target.value))}
              />
            </div>

            <Button
              onClick={handleBookNow}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors h-auto"
              aria-label="Book appointment"
            >
              Book Appointment
            </Button>
            <p className="text-xs text-center text-gray-500">
              No payment required today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
