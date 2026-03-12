import React from "react";
import { Calendar, Menu, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";

interface BooklyHeaderProps {
  storeName?: string;
  phone?: string;
}

export const BooklyHeader = ({
  storeName = "PRESTIGE BARBERS",
  phone = "+234 800 CUTS",
}: BooklyHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-transparent border-b border-gray-100 flex items-center justify-between px-6 h-[72px] shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          {storeName.charAt(0)}
        </div>
        <Link
          href="/"
          className="font-bold text-gray-900 text-lg tracking-tight"
        >
          {storeName}
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <a
          href={`tel:${phone}`}
          className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Phone size={18} />
          <span>{phone}</span>
        </a>
        <Button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 h-auto" aria-label="Book Now">
          Book Now
        </Button>
      </div>
    </header>
  );
};
