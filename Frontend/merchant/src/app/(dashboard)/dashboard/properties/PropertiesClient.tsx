"use client";

import React from "react";
import { Button } from "@vayva/ui";
import { Bank as Building2, Users, Bed, Door } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import Image from "next/image";
import { CreatePropertyModal } from "@/components/properties/CreatePropertyModal";
import { PropertyListActions } from "@/components/properties/PropertyListActions";

interface Property {
  id: string;
  type: string;
  maxGuests: number;
  bedCount: number;
  totalUnits: number;
  product: {
    title: string;
    description: string | null;
    status: string;
    price: number;
    productImages: { url: string }[];
  };
}

interface PropertiesClientProps {
  initialProperties: Property[];
}

export function PropertiesClient({
  initialProperties: properties,
}: PropertiesClientProps) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Properties & Listings
          </h1>
          <p className="text-gray-500">
            Manage your units, rooms, and listings
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/viewings">
            <Button variant="outline">View Requests</Button>
          </Link>
          <CreatePropertyModal />
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white  rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            No properties listed
          </h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Start by adding your first room, apartment, or villa to accept
            bookings.
          </p>
          <div className="mt-8">
            <CreatePropertyModal isFirst />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white  rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-video bg-white relative">
                {prop?.product?.productImages &&
                prop.product?.productImages.length > 0 ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={prop?.product?.productImages[0].url}
                      alt={prop?.product?.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Building2 size={32} />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-bold bg-white shadow-sm ${String((prop.product as any)?.status).toUpperCase() === "ACTIVE" ? "text-green-600" : "text-gray-500"}`}
                  >
                    {(prop.product as any)?.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wider">
                    {prop.type}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">
                    {prop?.product?.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {prop?.product?.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-1" title="Max Guests">
                    <Users size={14} />
                    <span>{prop.maxGuests}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Beds">
                    <Bed size={14} />
                    <span>{prop.bedCount}</span>
                  </div>
                  <div
                    className="flex items-center gap-1"
                    title="Units Available"
                  >
                    <Door size={14} />
                    <span>{prop.totalUnits}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      NGN {Number(prop.product?.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      / night
                    </span>
                  </div>
                  <PropertyListActions property={prop} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
