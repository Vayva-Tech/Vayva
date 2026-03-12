"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { VehicleSearchWidget } from "@/components/automotive/VehicleSearchWidget";
import { Button } from "@vayva/ui";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  image: string;
  slug: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AutoDealerHome(): React.JSX.Element {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/storefront/vehicles/featured");
        if (res.ok) {
          const data = await res.json();
          setVehicles(data.vehicles || []);
        }
      } catch {
        // Silent fail - will show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="bg-background/40 backdrop-blur-sm min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-32 px-6 text-center">
        <div className="absolute inset-0 bg-[url('/images/auto-hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Drive Your Dream.
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Browse thousands of certified vehicles with transparent pricing.
          </p>
        </div>
      </div>

      {/* Component: Ultra-Search Widget */}
      <div className="px-6">
        <VehicleSearchWidget />
      </div>

      {/* Featured Inventory */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Featured Vehicles
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-500">No featured vehicles available at this time.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => toast.info("Browse all vehicles coming soon")}
            >
              Browse All Vehicles
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.slug}`}
                className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <Image
                    src={vehicle.image || "/placeholder.png"}
                    alt={vehicle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900">{vehicle.title}</h3>
                  <p className="text-gray-500 text-sm">
                    {vehicle.mileage.toLocaleString()} miles • {vehicle.fuelType}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-700">
                      ₦{vehicle.price.toLocaleString()}
                    </span>
                    <span className="text-blue-600 font-medium text-sm hover:underline">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
