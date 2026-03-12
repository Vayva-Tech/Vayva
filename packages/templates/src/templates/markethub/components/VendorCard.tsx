import React from "react";
import { Button } from "@vayva/ui";
import { BadgeCheck, Star } from "lucide-react";
import Link from "next/link";

interface VendorDetails {
  id: string;
  name: string;
  rating: number;
  isVerified: boolean;
  logo: string;
}

interface VendorCardProps {
  vendor: VendorDetails;
}

export const VendorCard = ({ vendor }: VendorCardProps): React.JSX.Element => {
  return (
    <Link href={`/vendors/${vendor.id}`}>
      <div className="bg-transparent border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
        <img
          src={vendor.logo}
          alt={vendor.name}
          className="w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-gray-900 truncate group-hover:text-[#10B981] transition-colors">
              {vendor.name}
            </h3>
            {vendor.isVerified && (
              <div className="relative group/badge">
                <BadgeCheck size={14} className="text-[#10B981]" />
                <div className="absolute inset-0 bg-transparent/50 blur-[2px] animate-shimmer pointer-events-none" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
            <Star size={12} className="text-yellow-400 fill-current" />
            <span>{vendor.rating}</span>
            <span className="text-gray-300">•</span>
            <span>Following</span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-xs font-black text-[#10B981] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors h-auto"
        >
          Visit
        </Button>
      </div>
    </Link>
  );
};
