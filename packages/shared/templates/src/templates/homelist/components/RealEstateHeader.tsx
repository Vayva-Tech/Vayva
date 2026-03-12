import React from "react";
import { Search, Heart, User, Menu, Phone, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { urls } from "@vayva/shared";

interface RealEstateHeaderProps {
  storeName?: string;
  contactPhone?: string;
}

export const RealEstateHeader = ({
  storeName,
  contactPhone = "+234 800 REALTY",
}: RealEstateHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-transparent border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-[#0F172A]">
          <div className="bg-[#2563EB] text-white p-2 rounded-lg">
            <Home size={22} fill="currentColor" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight leading-none block">
              {storeName || "HOMELIST"}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden sm:block">
              Real Estate
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
          <Link href="#" className="hover:text-[#2563EB] transition-colors">
            Buy
          </Link>
          <Link
            href="#"
            className="text-[#0F172A] hover:text-[#2563EB] transition-colors"
          >
            Rent
          </Link>
          <Link href="#" className="hover:text-[#2563EB] transition-colors">
            Shortlet
          </Link>
          <Link href="#" className="hover:text-[#2563EB] transition-colors">
            Lands
          </Link>
          <Link href="#" className="hover:text-[#2563EB] transition-colors">
            New Projects
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href={`tel:${contactPhone}`}
            className="hidden lg:flex items-center gap-2 text-[#2563EB] bg-blue-50 px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <Phone size={14} fill="currentColor" />
            <span>{contactPhone}</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-[#2563EB] transition-colors relative h-auto"
            aria-label="View favorites"
          >
            <Heart size={20} />
          </Button>

          <Link
            href={`${urls.merchantBase()}/login`}
            className="flex items-center gap-2 text-sm font-bold text-[#0F172A] hover:bg-white/60 px-3 py-2.5 rounded-lg border border-transparent hover:border-gray-200 transition-all"
            aria-label="Sign in"
          >
            <User size={18} />
            <span className="hidden sm:inline">Sign In</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-800 h-auto"
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
    </header>
  );
};
