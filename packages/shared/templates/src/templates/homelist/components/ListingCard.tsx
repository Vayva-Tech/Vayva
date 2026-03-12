import React from "react";
import { Button } from "@vayva/ui";
import { PublicProduct } from "@vayva/templates/types/storefront";
import { Bed, Bath, Square, MapPin, Heart } from "lucide-react";

interface ListingCardProps {
  product: PublicProduct;
  onViewClick?: () => void;
}

export const ListingCard = ({
  product,
  onViewClick,
}: ListingCardProps): React.JSX.Element => {
  const details = product.propertyDetails;
  if (!details) return <></>;

  return (
    <div className="bg-transparent border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative">
      {/* Image */}
      <div className="h-64 relative bg-gray-200 overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${details.purpose === "rent" ? "bg-[#2563EB]" : details.purpose === "sale" ? "bg-[#0F172A]" : "bg-[#F59E0B]"}`}
          >
            For {details.purpose}
          </span>
          {details.type === "land" && (
            <span className="bg-[#16A34A] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm">
              Land
            </span>
          )}
        </div>

        <Button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-transparent/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all">
          <Heart size={16} fill="none" />
        </Button>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
          <p className="text-2xl font-black">
            ₦{product.price.toLocaleString()}
            {details.purpose === "rent"
              ? "/yr"
              : details.purpose === "shortlet"
                ? "/night"
                : ""}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-[#2563EB] transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-6">
          <MapPin size={16} className="text-[#2563EB]" />
          <span className="truncate">{details.location}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-gray-600 text-sm">
          {details.type !== "land" ? (
            <>
              <div className="flex items-center gap-1.5">
                <Bed size={18} className="text-gray-400" />
                <span className="font-bold text-gray-900">
                  {details.beds}
                </span>{" "}
                Beds
              </div>
              <div className="flex items-center gap-1.5">
                <Bath size={18} className="text-gray-400" />
                <span className="font-bold text-gray-900">
                  {details.baths}
                </span>{" "}
                Baths
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400 font-bold uppercase">
              Ready to build
            </div>
          )}

          {details.sqm && (
            <div className="flex items-center gap-1.5">
              <Square size={18} className="text-gray-400" />
              <span className="font-bold text-gray-900">{details.sqm}</span> sqm
            </div>
          )}
        </div>

        {onViewClick && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewClick();
            }}
            className="w-full mt-5 bg-transparent border-2 border-gray-100 hover:border-[#2563EB] text-gray-700 hover:text-[#2563EB] font-bold py-2.5 rounded-lg transition-colors"
          >
            Schedule Viewing
          </Button>
        )}
      </div>
    </div>
  );
};
