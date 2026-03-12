import React from "react";
import { Button } from "@vayva/ui";
import { Calendar, MapPin, Share2 } from "lucide-react";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface EventHeroProps {
  event: PublicProduct;
  onBuy: () => void;
}

export const EventHero = ({ event, onBuy }: EventHeroProps): React.JSX.Element => {
  const eventDate = event.eventDetails
    ? new Date(event.eventDetails.date)
    : new Date();

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-40">
        <img
          src={event.images?.[0]}
          alt={event.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-16 md:py-24 flex flex-col md:flex-row items-end md:items-center justify-between gap-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            <Calendar size={14} />
            {eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">
            {event.name}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <div className="bg-transparent/10 p-2 rounded-full">
                <MapPin size={18} />
              </div>
              {event.eventDetails?.venue || "TBA"}
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-transparent/10 p-2 rounded-full">
                <Share2 size={18} />
              </div>
              Share Event
            </div>
          </div>
        </div>

        {/* Sticky CTA Card (Desktop) */}
        <div className="hidden md:block bg-transparent text-gray-900 p-6 rounded-2xl shadow-xl max-w-sm w-full">
          <p className="text-sm font-bold text-gray-500 mb-1">Starting from</p>
          <div className="text-3xl font-black mb-6">
            ₦{event.price.toLocaleString()}
          </div>
          <Button
            onClick={onBuy}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-purple-200"
          >
            Get Tickets
          </Button>
          <p className="text-center text-xs text-gray-400 mt-4">
            {event.eventDetails?.capacity
              ? `${event.eventDetails.capacity - event.eventDetails.ticketsSold} tickets remaining`
              : "Limited availability"}
          </p>
        </div>
      </div>
    </section>
  );
};
